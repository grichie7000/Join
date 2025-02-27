const dbUrl = "https://join-d3707-default-rtdb.europe-west1.firebasedatabase.app";

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

function createTaskElement(task, taskId, columnId) {
  let div = document.createElement("div");
  div.className = "task"; div.draggable = true; div.id = taskId;
  let categoryText = task.category || "Keine Kategorie", categoryBgColor = "#f0f0f0";
  if (task.category === "Technical Task") { categoryText = "Technical Task"; categoryBgColor = "#23D8C2"; }
  else if (task.category === "User Story") { categoryText = "User Story"; categoryBgColor = "#1500ff"; }
  div.innerHTML = '<div class="task-category" style="background: ' + categoryBgColor + '">' + categoryText + '</div>' +
    '<h3 class="task-title" style="padding-top: 10px">' + task.title + '</h3>' +
    '<div class="task-description">' + task.description + '</div>' +
    getSubtasksHtml(task) + getFooterHtml(task);
  div.addEventListener("click", function(e) { showTaskDetailOverlay(task, taskId, e.currentTarget.parentElement.id); });
  div.addEventListener("dragstart", drag);
  return div;
}

function getSubtasksHtml(task) {
  if (!task.subtasks || task.subtasks.length === 0) return "";
  let completed = task.subtasks.filter(function(s) { return s.completed; }).length;
  let total = task.subtasks.length;
  return '<div class="subtask-progress"><div class="progress-bar">' +
    '<div class="progress-fill" style="width: ' + ((completed / total) * 100) + '%"></div></div>' +
    '<span class="progress-text">' + completed + '/' + total + ' Subtasks</span></div>';
}

function getFooterHtml(task) {
  let contactsHtml = "";
  if (task.contacts && task.contacts.length > 0) {
    let maxContacts = 4;
    let displayedContacts = task.contacts.slice(0, maxContacts);
    let extraCount = task.contacts.length - maxContacts;
    contactsHtml = '<div class="task-contacts">' +
      displayedContacts.map(function(c) {
        return '<div class="contact-badge" style="background: ' +
          getContactColor(c) + ';" title="' + c.name + '">' +
          getInitials(c.name) + '</div>';
      }).join("") +
      (extraCount > 0 ? '<div class="contact-badge extra-badge">+' + extraCount + '</div>' : '') +
      '</div>';
  }
  let priorityHtml = task.priority ? '<img src="' +
    { urgent: "assets/img/urgent.png", medium: "assets/img/medium.png", low: "assets/img/low.png" }[task.priority] +
    '" alt="' + task.priority + '" class="task-priority-icon">' : "";
  return (contactsHtml || priorityHtml)
    ? '<div class="task-footer">' + contactsHtml + priorityHtml + '</div>' : "";
}

function drag(event) {
  event.dataTransfer.setData("text", event.target.id);
}

function allowDrop(event) {
  event.preventDefault();
}

function moveTo(event, columnId) {
  event.preventDefault();
  const taskId = event.dataTransfer.getData("text");
  const task = $(taskId);
  const oldColumnElement = $(task.parentElement.id);
  const oldColumnId = oldColumnElement.id;
  const newColumnElement = $(columnId);
  
  if (oldColumnId === columnId) {
    updatePlaceholders();
    return;
  }
  moveTaskInDOM(task, newColumnElement);
  if (currentTaskId === taskId) {
    currentColumnId = columnId;
  }
  updateTaskInFirebase(taskId, oldColumnId, columnId, newColumnElement, oldColumnElement);
}

function moveTaskInDOM(task, newColumnElement) {
  const newPlaceholder = newColumnElement.querySelector(".empty-placeholder");
  if (newPlaceholder) {
    newColumnElement.removeChild(newPlaceholder);
  }
  newColumnElement.appendChild(task);
}

async function fetchAndPrepareTaskData(taskId, oldColumnId, columnId, newColumnElement) {
  const response = await fetch(`${dbUrl}/tasks/${oldColumnId}/${taskId}.json`);
  const taskData = await response.json();
  if (taskData) {
    taskData.status = columnId;
    taskData.order = newColumnElement.querySelectorAll(".task").length - 1;
  }
  return taskData;
}

async function commitTaskUpdates(taskId, oldColumnId, columnId, taskData, oldColumnElement) {
  await fetch(`${dbUrl}/tasks/${columnId}/${taskId}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData)
  });
  await fetch(`${dbUrl}/tasks/${oldColumnId}/${taskId}.json`, { method: "DELETE" });
  if (!oldColumnElement.querySelector(".task")) {
    oldColumnElement.innerHTML =
      `<div class="empty-placeholder">${getColumnPlaceholderText(oldColumnId)}</div>`;
  }
  updatePlaceholders();
}

async function updateTaskInFirebase(taskId, oldColumnId, columnId, newColumnElement, oldColumnElement) {
  try {
    const taskData = await fetchAndPrepareTaskData(taskId, oldColumnId, columnId, newColumnElement);
    if (taskData) {
      await commitTaskUpdates(taskId, oldColumnId, columnId, taskData, oldColumnElement);
    }
  } catch (error) {
    console.error("Fehler beim Verschieben des Tasks:", error);
  }
}

window.moveTo = moveTo;
window.allowDrop = allowDrop;



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

function resetFormErrors() {
  const errorTitleEl = $("error-title"),
        errorDueDateEl = $("error-date"),
        errorCategoryEl = $("error-category");
  errorTitleEl.textContent = "";
  errorDueDateEl.textContent = "";
  errorCategoryEl.textContent = "";
  $("title").style.borderColor = "";
  $("due-date").style.borderColor = "";
  $("category").style.borderColor = "";
}

function validateFormInputs(titleValue, dueDateValue, categoryValue) {
  let isValid = true;
  if (!titleValue) {
    $("error-title").textContent = "This field is required";
    $("title").style.borderColor = "red";
    isValid = false;
  }
  if (!dueDateValue) {
    $("error-date").textContent = "This field is required";
    $("due-date").style.borderColor = "red";
    isValid = false;
  }
  if (!categoryValue) {
    $("error-category").textContent = "This field is required";
    $("category").style.borderColor = "red";
    isValid = false;
  }
  return isValid;
}

function buildTaskData(titleValue, descriptionValue, dueDateValue, categoryValue) {
  return {
    title: titleValue,
    description: descriptionValue,
    dueDate: dueDateValue,
    priority: document.querySelector('input[name="priority"]:checked') ?
      document.querySelector('input[name="priority"]:checked').value : null,
    category: categoryValue,
    status: $("taskOverlay").dataset.columnId || "",
    contacts: window.selectedContacts || [],
    subtasks: (window.selectedSubtasks || []).map(function(subtask) {
      return { title: typeof subtask === "object" ? subtask.title : subtask, completed: false };
    })
  };
}

document.querySelector(".create-btn").addEventListener("click", function(event) {
  event.preventDefault();
  const titleInput = $("title"),
        dueDateInput = $("due-date"),
        categoryInput = $("category"),
        descriptionInput = $("description"),
        titleValue = titleInput.value.trim(),
        descriptionValue = descriptionInput.value.trim(),
        dueDateValue = dueDateInput.value,
        categoryValue = categoryInput.value;
  
  resetFormErrors();
  if (!validateFormInputs(titleValue, dueDateValue, categoryValue)) return;
  const taskData = buildTaskData(titleValue, descriptionValue, dueDateValue, categoryValue);
  addTaskWithFetch(taskData).then(function() {
    clearTask();
  });
});

const displayUserInitials = () => {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (loggedInUser && loggedInUser.initials) {
      document.getElementById("profile-toggle").textContent = loggedInUser.initials;
    }
};

document.getElementById('addTaskMobile').addEventListener('click', function() {
  window.location.href = 'addTask.html';
});

document.getElementById('addTaskMobile2').addEventListener('click', function() {
  window.location.href = 'addTask.html';
});

document.getElementById('addTaskMobile3').addEventListener('click', function() {
  window.location.href = 'addTask.html';
});

document.getElementById('addTaskMobile4').addEventListener('click', function() {
  window.location.href = 'addTask.html';
});

document.getElementById('addTaskMobile5').addEventListener('click', function() {
  window.location.href = 'addTask.html';
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

function updateTaskDetailContent(task, overlay) {
  const categoryBadge = overlay.querySelector('.category-badge');
  categoryBadge.textContent = task.category;
  categoryBadge.style.backgroundColor = getCategoryColor(task.category);
  overlay.querySelector('.task-title').textContent = task.title;
  overlay.querySelector('.task-description').textContent = task.description;
  document.getElementById("overlay-task-title").textContent = task.title;
  document.getElementById("overlay-task-description").textContent = task.description;
  overlay.querySelector('.task-due-date').textContent = "Due Date: " + task.dueDate;
  const iconMap = {
    urgent: "assets/img/urgent.png",
    medium: "assets/img/medium.png",
    low: "assets/img/low.png"
  };
  overlay.querySelector('.task-priority').innerHTML =
    "Priority: <img src=\"" + iconMap[task.priority] + "\" alt=\"" + task.priority + "\" class=\"task-priority-icon\">";
}

function updateOverlayContactsAndSubtasks(task, overlay) {
  const contactsList = overlay.querySelector('.contacts-list');
  contactsList.innerHTML = task.contacts && task.contacts.length
    ? task.contacts.map(c => `
      <div style="background: none" class="contact-item">
        <div class="contact-badge" style="background: ${getContactColor(c)}" title="${c.name}">
          ${getInitials(c.name)}
        </div>
        <span class="contact-name">${c.name}</span>
      </div>
    `).join('')
    : '';
  renderSubtasksView(task);
}

function attachOverlayEventHandlers(overlay) {
  overlay.querySelector('.close-btn').onclick = hideTaskDetailOverlay;
  overlay.querySelector('.delete-btn').onclick = deleteTask;
  overlay.querySelector('.edit-btn').onclick = enableEditMode;
  overlay.querySelector('.save-btn').onclick = saveChanges;
}

function showTaskDetailOverlay(task, taskId, columnId) {
  currentTaskId = taskId;
  currentColumnId = columnId;
  const overlay = document.getElementById("taskDetailOverlay");
  updateTaskDetailContent(task, overlay);
  updateOverlayContactsAndSubtasks(task, overlay);
  attachOverlayEventHandlers(overlay);
  overlay.style.display = 'block';
  overlay.addEventListener("click", hideTaskOverlayOutside);
}

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

function clearAndSetupSubtasksList() {
  const subtasksList = $("subtask-list");
  if (!subtasksList) return null;
  subtasksList.innerHTML = '';
  if (currentSubtasks.length > 2) {
    subtasksList.classList.add("scrollable-subtasks");
  } else {
    subtasksList.classList.remove("scrollable-subtasks");
  }
  return subtasksList;
}

function createButton(type, clickHandler) {
  const button = document.createElement("button");
  button.type = "button";
  const imgSrc = type === "edit" ? "assets/img/edit.png" : "assets/img/delete.png";
  const altText = type === "edit" ? "Edit Icon" : "Delete Icon";
  button.innerHTML = `<img class="delete-edit-png" src="${imgSrc}" alt="${altText}">`;
  button.classList.add(`subtask-${type}-btn`);
  button.addEventListener("click", (e) => {
    e.stopPropagation();
    clickHandler();
  });
  return button;
}

function createSubtaskItem(subtask, index) {
  const li = document.createElement("li");
  li.classList.add("subtask-item");
  const titleSpan = document.createElement("span");
  titleSpan.textContent = subtask.title;
  li.appendChild(titleSpan);
  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("subtask-button-container");
  const editButton = createButton("edit", () => {
    turnSubtaskIntoEditInput(li, titleSpan, index);
  });
  buttonContainer.appendChild(editButton);
  const deleteButton = createButton("delete", () => {
    currentSubtasks.splice(index, 1);
    renderSubtasksEditMode();
    updateSubtasksViewInOverlay();
  });
  buttonContainer.appendChild(deleteButton);
  li.appendChild(buttonContainer);
  return li;
}

function renderSubtasksEditMode() {
  const subtasksList = clearAndSetupSubtasksList();
  if (!subtasksList) return;
  const fragment = document.createDocumentFragment();
  currentSubtasks.forEach((subtask, index) => {
    const subtaskItem = createSubtaskItem(subtask, index);
    fragment.appendChild(subtaskItem);
  });
  subtasksList.appendChild(fragment);
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

async function enableEditMode() {
  try {
    const response = await fetch(`${dbUrl}/tasks/${currentColumnId}/${currentTaskId}.json`);
    const task = await response.json();
    const overlay = $("taskDetailOverlay");
    updateOverlayWithTask(overlay, task);
    await setupContactsAndSubtasks(overlay, task);
  } catch (error) {
    console.error("Fehler beim Aktivieren des Edit-Modus:", error);
  }
}

function updateOverlayWithTask(overlay, task) {
  overlay.querySelector('.close-btn').style.display = 'inline-block';
  overlay.querySelector('.view-mode').style.display = 'none';
  overlay.querySelector('.edit-mode').style.display = 'block';
  ['.edit-svg', '.delete-svg', '.edit-btn', '.delete-btn', '.button-seperator']
    .forEach(sel => overlay.querySelector(sel).style.display = 'none');
  overlay.querySelector('.save-btn').style.display = 'inline-block';
  overlay.querySelector('#edit-title').value = task.title;
  overlay.querySelector('#edit-description').value = task.description;
  overlay.querySelector('#edit-due-date').value = task.dueDate;
  overlay.querySelector(`input[name="edit-priority"][value="${task.priority}"]`).checked = true;
}

async function setupContactsAndSubtasks(overlay, task) {
  const res = await fetch(`${dbUrl}/contactsDatabase.json`);
  const data = await res.json();
  const allContacts = data ? Object.values(data) : [];
  const container = overlay.querySelector('#editContactsCheckboxContainer');
  container.innerHTML = allContacts.map(contact => `<label class="contact-checkbox" onclick="event.stopPropagation()">
    <input type="checkbox" name="edit-contact" value="${contact.name}" data-color="${contact.color}" onclick="event.stopPropagation()"
    ${task.contacts?.some(c => c.name === contact.name) ? 'checked' : ''}>
    <span class="contact-name-selection">${contact.name}</span>
    <span class="contact-badge-selection" style="background: ${contact.color};" title="${contact.name}">${getInitials(contact.name)}</span>
  </label>`).join('');
  updateSelectedContactsDisplay(overlay);
  container.addEventListener('change', () => updateSelectedContactsDisplay(overlay));
  currentSubtasks = task.subtasks ? task.subtasks.map(s => ({ ...s })) : [];
  renderSubtasksEditMode();
  updateSubtasksViewInOverlay();
}

function updateSelectedContactsDisplay(overlay) {
  const checkboxes = overlay.querySelectorAll('#editContactsCheckboxContainer input[type="checkbox"]');
  const selectedContainer = overlay.querySelector('.selected-contacts-list');
  selectedContainer.innerHTML = '';

  const selectedCheckboxes = Array.from(checkboxes).filter(checkbox => checkbox.checked);

  const maxContacts = 4;

  selectedCheckboxes.slice(0, maxContacts).forEach(checkbox => {
      const contact = { 
          name: checkbox.value, 
          color: checkbox.dataset.color
      };
      selectedContainer.appendChild(createContactBadge(contact));
  });

  const extraCount = selectedCheckboxes.length - maxContacts;
  if (extraCount > 0) {
      const extraBadge = document.createElement('div');
      extraBadge.classList.add('contact-badge', 'extra-badge');
      extraBadge.textContent = '+' + extraCount;
      selectedContainer.appendChild(extraBadge);
  }
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

function getUpdatedTask() {
  let overlay = $("taskDetailOverlay");
  let updatedTask = {
    title: overlay.querySelector('#edit-title').value,
    description: overlay.querySelector('#edit-description').value,
    category: overlay.querySelector('.category-badge').textContent,
    dueDate: overlay.querySelector('#edit-due-date').value,
    priority: overlay.querySelector('input[name="edit-priority"]:checked').value,
    contacts: Array.from(overlay.querySelectorAll('input[name="edit-contact"]:checked'))
              .map(function(c) { return { name: c.value, color: c.dataset.color }; }),
    subtasks: currentSubtasks,
    status: currentColumnId
  };
  return updatedTask;
}

async function saveTask(updatedTask) {
  try {
    let response = await fetch(dbUrl + "/tasks/" + currentColumnId + "/" + currentTaskId + ".json", {
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
}

async function saveChanges() {
  let updatedTask = getUpdatedTask();
  await saveTask(updatedTask);
}

async function deleteTask() {
  try {
    let response = await fetch(dbUrl + "/tasks/" + currentColumnId + "/" + currentTaskId + ".json", {
      method: 'DELETE'
    });
    await response.json();
    hideTaskDetailOverlay();
    await loadTasks();
  } catch (error) {
    console.error("Fehler beim Löschen des Tasks:", error);
  }
}

document.querySelector('.selected-contacts-display').addEventListener('click', (event) => {
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
});

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