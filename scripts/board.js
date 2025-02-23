const dbUrl = "https://join-d3707-default-rtdb.europe-west1.firebasedatabase.app";

// Hilfsfunktionen
const $ = (id) => document.getElementById(id);

function getCategoryColor(category) {
    return category === 'Technical Task' ? '#23D8C2' : '#1500ff';
}

function getInitials(name) {
    if (!name || typeof name !== 'string') return '??';
    return name.split(' ')
        .map(n => n[0]?.toUpperCase() || '')
        .join('')
        .substring(0, 2);
}

function getContactColor(contact) {
    if (typeof contact === 'object' && contact.color) {
      return contact.color;
    }
    const safeName = typeof contact === 'string' ? contact : (contact?.name || 'Unknown');
    const colors = ['#004d40', '#1a237e', '#b71c1c', '#FFC452', '#00FE00', '#DE3FD9'];
    const hash = Array.from(safeName).reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    return colors[hash % colors.length];
}
  
function createContactBadge(contact) {
    const badge = document.createElement('div');
    badge.className = 'contact-badge';
    badge.style.backgroundColor = getContactColor(contact);
    badge.title = contact.name;
    badge.textContent = getInitials(contact.name);
    return badge;
}

async function loadTasks() {
    const columns = ["to-do", "in-progress", "await-feedback", "done"];
    for (const column of columns) {
        const container = $(column);
        try {
            const response = await fetch(`${dbUrl}/tasks/${column}.json`);
            const data = await response.json();
            container.innerHTML = "";
            if (data) {
                Object.entries(data).forEach(([taskId, task]) => {
                    const taskElement = createTaskElement(task, taskId, column);
                    container.appendChild(taskElement);
                });
            } else {
                container.innerHTML = `<div class="empty-placeholder">${getColumnPlaceholderText(column)}</div>`;
            }
            updatePlaceholders();
        } catch (error) {
            console.error("Fehler beim Abrufen der Tasks:", error);
        }
    }
}

const createTaskElement = (task, taskId, columnId) => {
    const div = document.createElement("div");
    div.className = "task";
    div.draggable = true;
    div.id = taskId;
    let categoryText = task.category || "Keine Kategorie";
    let categoryBgColor = "#f0f0f0";
    if (task.category === "Technical Task") {
        categoryText = "Technical Task";
        categoryBgColor = "#23D8C2";
    } else if (task.category === "User Story") {
        categoryText = "User Story";
        categoryBgColor = "#1500ff";
    }
    const subtasksHtml = task.subtasks && task.subtasks.length > 0 ? `
        <div class="subtask-progress">
            <div class="progress-bar">
                <div class="progress-fill" 
                     style="width: ${(task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100}%">
                </div>
            </div>
            <span class="progress-text">
                ${task.subtasks.filter(s => s.completed).length}/${task.subtasks.length} Subtasks
            </span>
        </div>
    ` : "";
    const contactsHtml = task.contacts && task.contacts.length > 0
      ? `<div class="task-contacts">${task.contacts.map(c => {
          return `
            <div class="contact-badge" 
                 style="background: ${getContactColor(c)};" 
                 title="${c.name}">
              ${getInitials(c.name)}
            </div>`;
      }).join("")}</div>`
      : "";
  
    let priorityHtml = "";
    if (task.priority) {
        const iconMap = {
            urgent: "assets/img/urgent.png",
            medium: "assets/img/medium.png",
            low: "assets/img/low.png"
        };
        priorityHtml = `<img src="${iconMap[task.priority]}" alt="${task.priority}" class="task-priority-icon">`;
    }
    div.innerHTML = `
      <div class="task-category" style="background: ${categoryBgColor}">${categoryText}</div>
      <h3 class="task-title" style="padding-top: 10px">${task.title}</h3>
      <div class="task-description">${task.description}</div>
      ${subtasksHtml}
      ${(contactsHtml || priorityHtml) ? `<div class="task-footer">${contactsHtml}${priorityHtml}</div>` : ''}
    `;
    div.addEventListener("click", () => showTaskDetailOverlay(task, taskId, columnId));
    div.addEventListener("dragstart", drag);
    return div;
};

const drag = (event) => {
    event.dataTransfer.setData("text", event.target.id);
};

window.allowDrop = (event) => event.preventDefault();

window.moveTo = async (event, columnId) => {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("text");
    const task = $(taskId);
    const oldColumnElement = $(task.parentElement.id);
    const oldColumnId = oldColumnElement.id;
    const newColumnElement = $(columnId);
    if (oldColumnId === columnId) {
      let dropTarget = event.target.closest('.task');
      if (dropTarget && dropTarget !== task) {
        const rect = dropTarget.getBoundingClientRect();
        const offset = event.clientY - rect.top;
        if (offset < rect.height / 2) {
          newColumnElement.insertBefore(task, dropTarget);
        } else {
          newColumnElement.insertBefore(task, dropTarget.nextSibling);
        }
      } else {
        newColumnElement.appendChild(task);
      }
      const tasks = Array.from(newColumnElement.querySelectorAll('.task'));
      for (const [index, taskElem] of tasks.entries()) {
        try {
          await fetch(`${dbUrl}/tasks/${columnId}/${taskElem.id}.json`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ order: index })
          });
        } catch (err) {
          console.error("Fehler beim Aktualisieren der Reihenfolge:", err);
        }
      }
      updatePlaceholders();
      return;
    }
    const newPlaceholder = newColumnElement.querySelector(".empty-placeholder");
    if (newPlaceholder) newColumnElement.removeChild(newPlaceholder);
    newColumnElement.appendChild(task);
    try {
      const oldTaskResponse = await fetch(`${dbUrl}/tasks/${oldColumnId}/${taskId}.json`);
      const taskData = await oldTaskResponse.json();
      if (taskData) {
          taskData.status = columnId;
          taskData.order = newColumnElement.querySelectorAll('.task').length - 1;
          await fetch(`${dbUrl}/tasks/${columnId}/${taskId}.json`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(taskData)
          });
          await fetch(`${dbUrl}/tasks/${oldColumnId}/${taskId}.json`, {
              method: 'DELETE'
          });
          if (!oldColumnElement.querySelector(".task")) {
              oldColumnElement.innerHTML = `<div class="empty-placeholder">${getColumnPlaceholderText(oldColumnId)}</div>`;
          }
          updatePlaceholders();
      }
    } catch (error) {
      console.error("Fehler beim Verschieben des Tasks:", error);
    }
};

window.getColumnPlaceholderText = function (columnId) {
    const columnNames = {
      "to-do": "To Do",
      "in-progress": "In Progress",
      "await-feedback": "Await Feedback",
      "done": "Done"
    };
    return `No tasks ${columnNames[columnId]}`;
};

const updatePlaceholders = () => {
    const columns = ["to-do", "in-progress", "await-feedback", "done"];
    columns.forEach(columnId => {
      const column = $(columnId);
      if (!column) return;
      const tasks = column.querySelectorAll('.task');
      const visibleTasks = Array.from(tasks).filter(task => task.style.display !== 'none');
      if (visibleTasks.length === 0 && !column.querySelector('.empty-placeholder')) {
        const placeholder = document.createElement('div');
        placeholder.className = 'empty-placeholder';
        placeholder.textContent = getColumnPlaceholderText(columnId);
        column.appendChild(placeholder);
      } else if (visibleTasks.length > 0) {
        const existingPlaceholder = column.querySelector('.empty-placeholder');
        if (existingPlaceholder) {
          existingPlaceholder.remove();
        }
      }
    });
};

window.searchTasks = function(searchTerm) {
    const tasks = document.querySelectorAll('.task');
    const searchText = searchTerm.toLowerCase().trim();
    tasks.forEach(task => {
      const titleElem = task.querySelector('.task-title');
      const descElem = task.querySelector('.task-description');
      if (!titleElem || !descElem) return;
      const title = titleElem.textContent.toLowerCase();
      const description = descElem.textContent.toLowerCase();
      if (searchText === '' || title.includes(searchText) || description.includes(searchText)) {
        task.style.display = 'block';
      } else {
        task.style.display = 'none';
      }
    });
    updatePlaceholders();
};

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('.findTaskInput');
    searchInput.addEventListener('input', (e) => {
      if (e.target.value.trim().length < 3) {
        document.querySelectorAll('.task').forEach(task => task.style.display = 'block');
        updatePlaceholders();
      } else {
        searchTasks(e.target.value);
      }
    });
});

// Overlay-Funktionen
const showOverlay = (columnId) => {
    const overlay = $("taskOverlay");
    overlay.style.display = "flex";
    overlay.dataset.columnId = columnId;
};

const hideOverlay = () => {
    $("taskOverlay").style.display = "none";
};

document.querySelector(".addTaskButton").addEventListener("click", () => showOverlay("to-do"));
document.querySelector(".toDoButton").addEventListener("click", () => showOverlay("to-do"));
document.querySelector(".inProgressButton").addEventListener("click", () => showOverlay("in-progress"));
document.querySelector(".awaitButton").addEventListener("click", () => showOverlay("await-feedback"));

$("taskOverlay").addEventListener("click", (event) => {
    if (event.target === $("taskOverlay")) {
        hideOverlay();
    }
});

window.selectedContacts = window.selectedContacts || [];
window.selectedSubtasks = window.selectedSubtasks || [];

window.clearTask = function() {
  const form = $("addtaskForm");
  form.reset();
  const errorTitleEl = $("error-title");
  const errorDueDateEl = $("error-date");
  const errorCategoryEl = $("error-category");
  const selectedContactsList = $("selectedContactsList");
  const subtasksOne = $("subtaskItem1");
  const subtasksTwo = $("subtaskItem2");
  if (subtasksOne) subtasksOne.innerHTML = "";
  if (subtasksTwo) subtasksTwo.innerHTML = "";
  if (selectedContactsList) selectedContactsList.innerHTML = "";
  if (errorTitleEl) errorTitleEl.textContent = "";
  if (errorDueDateEl) errorDueDateEl.textContent = "";
  if (errorCategoryEl) errorCategoryEl.textContent = "";
  $("title").style.borderColor = "";
  $("due-date").style.borderColor = "";
  $("category").style.borderColor = "";
  window.selectedSubtasks = [];
  window.selectedContacts = [];
};

$("title").addEventListener("input", () => {
  const errorTitleEl = $("error-title");
  errorTitleEl.textContent = "";
  $("title").style.borderColor = "";
});

$("due-date").addEventListener("input", () => {
  const errorDueDateEl = $("error-date");
  errorDueDateEl.textContent = "";
  $("due-date").style.borderColor = "";
});

$("category").addEventListener("input", () => {
  const errorCategoryEl = $("error-category");
  errorCategoryEl.textContent = "";
  $("category").style.borderColor = "";
});

// Hinzufügen eines neuen Tasks via fetch (anstelle von Firebase set) mit async/await
async function addTaskWithFetch(taskData) {
  const newTaskId = Date.now().toString();
  try {
    const response = await fetch(`${dbUrl}/tasks/${taskData.status}/${newTaskId}.json`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(taskData)
    });
    await response.json();
    hideOverlay();
    await loadTasks();
  } catch (error) {
    console.error("Fehler beim Erstellen des Tasks:", error);
  }
}

document.querySelector(".create-btn").addEventListener("click", async (event) => {
  event.preventDefault();
  const titleInput = $("title");
  const dueDateInput = $("due-date");
  const categoryInput = $("category");
  const descriptionInput = $("description");
  const titleValue = titleInput.value.trim();
  const descriptionValue = descriptionInput.value.trim();
  const dueDateValue = dueDateInput.value;
  const categoryValue = categoryInput.value;
  const errorTitleEl = $("error-title");
  const errorDueDateEl = $("error-date");
  const errorCategoryEl = $("error-category");
  errorTitleEl.textContent = "";
  errorDueDateEl.textContent = "";
  errorCategoryEl.textContent = "";
  titleInput.style.borderColor = "";
  dueDateInput.style.borderColor = "";
  categoryInput.style.borderColor = "";
  let isValid = true;
  if (!titleValue) {
    errorTitleEl.textContent = "This field is required";
    titleInput.style.borderColor = "red";
    isValid = false;
  }
  if (!dueDateValue) {
    errorDueDateEl.textContent = "This field is required";
    dueDateInput.style.borderColor = "red";
    isValid = false;
  }
  if (!categoryValue) {
    errorCategoryEl.textContent = "This field is required";
    categoryInput.style.borderColor = "red";
    isValid = false;
  }
  if (!isValid) return;
  const taskData = {
    title: titleValue,
    description: descriptionValue,
    dueDate: dueDateValue,
    priority: document.querySelector('input[name="priority"]:checked')?.value || null,
    category: categoryValue,
    status: $("taskOverlay").dataset.columnId || "",
    contacts: window.selectedContacts || [],
    subtasks: (window.selectedSubtasks || []).map(subtask => ({
      title: typeof subtask === "object" ? subtask.title : subtask,
      completed: false,
    })),
  };
  await addTaskWithFetch(taskData);
  clearTask();
});

const displayUserInitials = () => {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (loggedInUser && loggedInUser.initials) {
      document.getElementById("profile-toggle").textContent = loggedInUser.initials;
    }
};

document.getElementById('addTaskMobile').addEventListener('click', function() {
  window.location.href = 'addtask.html';
});

document.getElementById('addTaskMobile2').addEventListener('click', function() {
  window.location.href = 'addtask.html';
});

document.getElementById('addTaskMobile3').addEventListener('click', function() {
  window.location.href = 'addtask.html';
});

document.getElementById('addTaskMobile4').addEventListener('click', function() {
  window.location.href = 'addtask.html';
});

document.getElementById('addTaskMobile5').addEventListener('click', function() {
  window.location.href = 'addtask.html';
});

document.addEventListener("DOMContentLoaded", displayUserInitials);
loadTasks();

let currentTaskId = null;
let currentColumnId = null;
let currentSubtasks = [];

function updateSubtasksViewInOverlay() {
    const overlay = $("taskDetailOverlay");
    const subtasksList = overlay.querySelector('.subtasks-list');
    if (!subtasksList) return;
    subtasksList.innerHTML = '';
    if (currentSubtasks.length > 0) {
        currentSubtasks.forEach(subtask => {
            const li = document.createElement('li');
            li.className = 'subtask-item';
            li.textContent = subtask.title;
            subtasksList.appendChild(li);
        });
    } else {
        subtasksList.innerHTML = '<li>Keine Subtasks vorhanden</li>';
    }
}

const showTaskDetailOverlay = (task, taskId, columnId) => {
    currentTaskId = taskId;
    currentColumnId = columnId;
    const overlay = document.getElementById("taskDetailOverlay");
    overlay.querySelector('.category-badge').textContent = task.category;
    overlay.querySelector('.category-badge').style.backgroundColor = getCategoryColor(task.category);
    overlay.querySelector('.task-title').textContent = task.title;
    overlay.querySelector('.task-description').textContent = task.description;
    document.getElementById("overlay-task-title").textContent = task.title;
    document.getElementById("overlay-task-description").textContent = task.description;
    overlay.querySelector('.task-due-date').textContent = `Due Date: ${task.dueDate}`;
    const iconMap = {
        urgent: "assets/img/urgent.png",
        medium: "assets/img/medium.png",
        low: "assets/img/low.png"
    };
    overlay.querySelector('.task-priority').innerHTML = `Priority: <img src="${iconMap[task.priority]}" alt="${task.priority}" class="task-priority-icon">`;
    const contactsList = overlay.querySelector('.contacts-list');
    contactsList.innerHTML = task.contacts?.map(c => `
      <div style="background: none" class="contact-item">
        <div class="contact-badge" style="background: ${getContactColor(c)}" title="${c.name}">
          ${getInitials(c.name)}
        </div>
        <span class="contact-name">${c.name}</span>
      </div>
    `).join('') || '';
    renderSubtasksView(task);
    overlay.querySelector('.close-btn').onclick = hideTaskDetailOverlay;
    overlay.querySelector('.delete-btn').onclick = deleteTask;
    overlay.querySelector('.edit-btn').onclick = enableEditMode;
    overlay.querySelector('.save-btn').onclick = saveChanges;
    overlay.style.display = 'block';
    overlay.addEventListener("click", hideTaskOverlayOutside);
};

const hideTaskDetailOverlay = () => {
    const overlay = document.getElementById("taskDetailOverlay");
    overlay.style.display = 'none';
    overlay.querySelector('.view-mode').style.display = 'block';
    overlay.querySelector('.edit-mode').style.display = 'none';
    overlay.querySelector('.edit-btn').style.display = 'inline-block';
    overlay.querySelector('.delete-btn').style.display = 'inline-block';
    overlay.querySelector('.save-btn').style.display = 'none';
    overlay.querySelector('.button-seperator').style.display = 'inline-block';
    overlay.querySelector('.edit-svg').style.display = 'inline-block';
    overlay.querySelector('.delete-svg').style.display = 'inline-block';
    overlay.removeEventListener("click", hideTaskOverlayOutside);
};

const hideTaskOverlayOutside = (event) => {
    const overlay = document.getElementById("taskDetailOverlay");
    if (event.target === overlay) {
        hideTaskDetailOverlay();
    }
};

function renderSubtasksView(task) {
    const overlay = $("taskDetailOverlay");
    const subtasksList = overlay.querySelector('.subtasks-list');
    if (!subtasksList) return;
    subtasksList.innerHTML = '';
    if (task.subtasks && task.subtasks.length > 0) {
        task.subtasks.forEach((subtask, index) => {
            const li = document.createElement('li');
            li.className = 'subtask-item';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `subtask-${index}`;
            checkbox.checked = subtask.completed;
            checkbox.dataset.index = index;
            checkbox.addEventListener('change', () => {
                task.subtasks[index].completed = checkbox.checked;
                updateTaskSubtasksInFirebase(task.subtasks);
                updateProgressBar(task);
            });
            li.appendChild(checkbox);
            const label = document.createElement('label');
            label.htmlFor = `subtask-${index}`;
            label.textContent = subtask.title;
            li.appendChild(label);
            subtasksList.appendChild(li);
        });
    } else {
        subtasksList.innerHTML = '<li>Keine Subtasks vorhanden</li>';
    }
}

async function updateTaskSubtasksInFirebase(subtasks) {
    try {
      const response = await fetch(`${dbUrl}/tasks/${currentColumnId}/${currentTaskId}/subtasks.json`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subtasks)
      });
      await response.json();
      console.log("Subtasks aktualisiert");
    } catch (err) {
      console.error("Fehler beim Aktualisieren der Subtasks:", err);
    }
}

function updateProgressBar(task) {
    const taskElement = document.getElementById(currentTaskId);
    if (!taskElement) return;
    const progressFill = taskElement.querySelector('.progress-fill');
    const progressText = taskElement.querySelector('.progress-text');
    if (progressFill && progressText) {
        const completedSubtasks = task.subtasks.filter(s => s.completed).length;
        const totalSubtasks = task.subtasks.length;
        const progressPercentage = (completedSubtasks / totalSubtasks) * 100;
        progressFill.style.width = `${progressPercentage}%`;
        progressText.textContent = `${completedSubtasks}/${totalSubtasks} Subtasks`;
    }
}

function renderSubtasksEditMode() {
    const subtasksList = $("subtask-list");
    if (!subtasksList) return;
    subtasksList.innerHTML = '';
    currentSubtasks.forEach((subtask, index) => {
        const li = document.createElement("li");
        li.classList.add("subtask-item");
        const titleSpan = document.createElement("span");
        titleSpan.textContent = subtask.title;
        li.appendChild(titleSpan);
        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("subtask-button-container");
        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.innerHTML = '<img class="delete-edit-png" src="assets/img/edit.png" alt="Edit Icon">';
        editButton.classList.add("subtask-edit-btn");
        editButton.addEventListener("click", (e) => {
            e.stopPropagation();
            turnSubtaskIntoEditInput(li, titleSpan, index);
        });
        buttonContainer.appendChild(editButton);
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.innerHTML = '<img class="delete-edit-png" src="assets/img/delete.png" alt="Delete Icon">';
        deleteButton.classList.add("subtask-delete-btn");
        deleteButton.addEventListener("click", (e) => {
            e.stopPropagation();
            currentSubtasks.splice(index, 1);
            renderSubtasksEditMode();
            updateSubtasksViewInOverlay();
        });
        buttonContainer.appendChild(deleteButton);
        li.appendChild(buttonContainer);
        subtasksList.appendChild(li);
    });
}

function turnSubtaskIntoEditInput(li, titleSpan, index) {
    const input = document.createElement("input");
    input.type = "text";
    input.value = currentSubtasks[index].title;
    input.classList.add("subtask-edit-input");
    input.addEventListener("blur", () => {
        if (input.value.trim() !== "") {
            currentSubtasks[index].title = input.value.trim();
        }
        renderSubtasksEditMode();
        updateSubtasksViewInOverlay();
    });
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            input.blur();
        }
    });
    li.replaceChild(input, titleSpan);
    input.focus();
}

const enableEditMode = async () => {
    try {
      const response = await fetch(`${dbUrl}/tasks/${currentColumnId}/${currentTaskId}.json`);
      const task = await response.json();
      const overlay = $("taskDetailOverlay");
      overlay.querySelector('.close-btn').style.display = 'inline-block';
      overlay.querySelector('.view-mode').style.display = 'none';
      overlay.querySelector('.edit-mode').style.display = 'block';
      overlay.querySelector('.edit-svg').style.display = 'none';
      overlay.querySelector('.delete-svg').style.display = 'none';
      overlay.querySelector('.edit-btn').style.display = 'none';
      overlay.querySelector('.delete-btn').style.display = 'none';
      overlay.querySelector('.button-seperator').style.display = 'none';
      overlay.querySelector('.save-btn').style.display = 'inline-block';
      overlay.querySelector('#edit-title').value = task.title;
      overlay.querySelector('#edit-description').value = task.description;
      overlay.querySelector('#edit-due-date').value = task.dueDate;
      overlay.querySelector(`input[name="edit-priority"][value="${task.priority}"]`).checked = true;
      const contactsResponse = await fetch(`${dbUrl}/contactsDatabase.json`);
      const contactsData = await contactsResponse.json();
      const allContacts = contactsData ? Object.values(contactsData) : [];
      const checkboxContainer = overlay.querySelector('#editContactsCheckboxContainer');
      checkboxContainer.innerHTML = allContacts.map(contact => `
       <label class="contact-checkbox">
        <input 
         type="checkbox" 
         name="edit-contact" 
         value="${contact.name}" 
         data-color="${contact.color}"
         onclick="event.stopPropagation()"
         ${task.contacts?.some(c => c.name === contact.name) ? 'checked' : ''}>
         <span class="contact-name-selection">${contact.name}</span>
         <span class="contact-badge-selection" style="background: ${contact.color};" title="${contact.name}">
          ${getInitials(contact.name)}
         </span>
       </label>
       `).join('');
      updateSelectedContactsDisplay(overlay);
      checkboxContainer.addEventListener('change', () => {
        updateSelectedContactsDisplay(overlay);
      });
      currentSubtasks = task.subtasks ? task.subtasks.map(s => ({ ...s })) : [];
      renderSubtasksEditMode();
      updateSubtasksViewInOverlay();
    } catch (error) {
      console.error("Fehler beim Aktivieren des Edit-Modus:", error);
    }
};

function updateSelectedContactsDisplay(overlay) {
    const checkboxes = overlay.querySelectorAll('#editContactsCheckboxContainer input[type="checkbox"]');
    const selectedContainer = overlay.querySelector('.selected-contacts-list');
    selectedContainer.innerHTML = '';
    Array.from(checkboxes)
      .filter(checkbox => checkbox.checked)
      .forEach(checkbox => {
          const contact = { 
              name: checkbox.value, 
              color: checkbox.dataset.color
          };
          selectedContainer.appendChild(createContactBadge(contact));
      });
}

document.getElementById("add-subtask-btn").addEventListener("click", (e) => {
    e.preventDefault();
    const subtaskInput = document.getElementById("edit-subtask");
    const title = subtaskInput.value.trim();
    if (title !== "") {
        currentSubtasks.push({ title: title, completed: false });
        renderSubtasksEditMode();
        updateSubtasksViewInOverlay();
        subtaskInput.value = "";
    }
});

const saveChanges = async () => {
    const overlay = $("taskDetailOverlay");
    const updatedTask = {
        title: overlay.querySelector('#edit-title').value,
        description: overlay.querySelector('#edit-description').value,
        category: overlay.querySelector('.category-badge').textContent,
        dueDate: overlay.querySelector('#edit-due-date').value,
        priority: overlay.querySelector('input[name="edit-priority"]:checked').value,
        contacts: Array.from(overlay.querySelectorAll('input[name="edit-contact"]:checked'))
                    .map(c => ({ name: c.value, color: c.dataset.color })),
        subtasks: currentSubtasks,
        status: currentColumnId
    };
    try {
      const response = await fetch(`${dbUrl}/tasks/${currentColumnId}/${currentTaskId}.json`, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(updatedTask)
      });
      await response.json();
      await loadTasks();
      hideTaskDetailOverlay();
    } catch (error) {
      console.error("Fehler beim Speichern der Änderungen:", error);
    }
};

const deleteTask = async () => {
    try {
      const response = await fetch(`${dbUrl}/tasks/${currentColumnId}/${currentTaskId}.json`, {
         method: 'DELETE'
      });
      await response.json();
      hideTaskDetailOverlay();
      await loadTasks();
    } catch (error) {
      console.error("Fehler beim Löschen des Tasks:", error);
    }
};

window.toggleContactsDropdown = function (event) {
  event.stopPropagation();
  const dropdown = document.getElementById("contactsDropdown");
  const arrow = document.querySelector(".dropdown-arrow");
  if (dropdown.style.display === "block") {
    dropdown.style.display = "none";
    arrow.innerHTML = "&#9652;";
  } else {
    dropdown.style.display = "block";
    arrow.innerHTML = "&#9662;";
  }
};

document.addEventListener('click', (e) => {
  if (!e.target.closest('.contact-selection-wrapper')) {
    const dropdown = document.getElementById("contactsDropdown");
    if (dropdown) {
      dropdown.style.display = "none";
    }
    const arrow = document.querySelector(".dropdown-arrow");
    if (arrow) {
      arrow.innerHTML = "&#9652;";
    }
  }
});
