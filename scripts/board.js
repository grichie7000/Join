/**
 * @module taskManager
 * This module handles task loading, rendering, drag & drop,
 * search, detail overlay display/editing, and updating tasks in Firebase.
 */

const dbUrl = "https://join-d3707-default-rtdb.europe-west1.firebasedatabase.app";

/**
 * Holds the current order value for a task.
 * @type {number|null}
 */
let currentOrder = null; 

/**
 * Shorthand function to get a DOM element by its ID.
 * @param {string} id - The element's ID.
 * @returns {HTMLElement|null} The DOM element.
 */
const $ = (id) => document.getElementById(id);

/**
 * Returns the color associated with a category.
 * @param {string} category - The task category.
 * @returns {string} The corresponding color.
 */
function getCategoryColor(category) {
    return category === 'Technical Task' ? '#23D8C2' : '#1500ff';
}

/**
 * Computes the initials from a given name.
 * @param {string} name - The full name.
 * @returns {string} The first two initials or "??" if input is invalid.
 */
function getInitials(name) {
    if (!name || typeof name !== 'string') return '??';
    return name.split(' ')
        .map(n => n[0]?.toUpperCase() || '')
        .join('')
        .substring(0, 2);
}

/**
 * Returns the color for a contact.
 * @param {Object|string} contact - The contact object or a string (name).
 * @returns {string} A color derived from the contact.
 */
function getContactColor(contact) {
    if (typeof contact === 'object' && contact.color) {
      return contact.color;
    }
    const safeName = typeof contact === 'string' ? contact : (contact?.name || 'Unknown');
    const colors = ['#004d40', '#1a237e', '#b71c1c', '#FFC452', '#00FE00', '#DE3FD9'];
    const hash = Array.from(safeName).reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    return colors[hash % colors.length];
}
  
/**
 * Creates and returns a contact badge element.
 * @param {Object} contact - The contact object.
 * @returns {HTMLElement} The contact badge element.
 */
function createContactBadge(contact) {
    const badge = document.createElement('div');
    badge.className = 'contact-badge';
    badge.style.backgroundColor = getContactColor(contact);
    badge.title = contact.name;
    badge.textContent = getInitials(contact.name);
    return badge;
}

/**
 * Loads tasks from Firebase and populates the respective columns.
 * @async
 * @returns {Promise<void>}
 */
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
            console.error("Error loading tasks:", error);
        }
    }
}

/**
 * Creates a DOM element representing a task.
 * @param {Object} task - The task data.
 * @param {string} taskId - The task ID.
 * @param {string} columnId - The column ID.
 * @returns {HTMLElement} The created task element.
 */
function createTaskElement(task, taskId, columnId) {
  let div = document.createElement("div");
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
  div.innerHTML =
    '<div class="task-category" style="background: ' + categoryBgColor + '">' + categoryText + '</div>' +
    '<h3 class="task-title" style="padding-top: 10px">' + task.title + '</h3>' +
    '<div class="task-description">' + task.description + '</div>' +
    getSubtasksHtml(task) + getFooterHtml(task);
  div.addEventListener("click", function(e) {
    showTaskDetailOverlay(task, taskId, e.currentTarget.parentElement.id);
  });
  div.addEventListener("dragstart", drag);
  return div;
}

/**
 * Returns HTML representing subtask progress for a task.
 * @param {Object} task - The task data.
 * @returns {string} HTML string for subtasks progress.
 */
function getSubtasksHtml(task) {
  if (!task.subtasks || task.subtasks.length === 0) return "";
  let completed = task.subtasks.filter(s => s.completed).length;
  let total = task.subtasks.length;
  return '<div class="subtask-progress"><div class="progress-bar">' +
    '<div class="progress-fill" style="width: ' + ((completed / total) * 100) + '%"></div></div>' +
    '<span class="progress-text">' + completed + '/' + total + ' Subtasks</span></div>';
}

/**
 * Returns HTML for the task footer, including contact badges and priority icon.
 * @param {Object} task - The task data.
 * @returns {string} HTML string for the task footer.
 */
function getFooterHtml(task) {
  let contactsHtml = "";
  if (task.contacts && task.contacts.length > 0) {
    const maxContacts = 4;
    const displayedContacts = task.contacts.slice(0, maxContacts);
    const extraCount = task.contacts.length - maxContacts;
    contactsHtml = '<div class="task-contacts">' +
      displayedContacts.map(c => {
        return '<div class="contact-badge" style="background: ' +
          getContactColor(c) + ';" title="' + c.name + '">' +
          getInitials(c.name) + '</div>';
      }).join("") +
      (extraCount > 0 ? '<div class="contact-badge extra-badge">+' + extraCount + '</div>' : '') +
      '</div>';
  }
  const priorityHtml = task.priority
    ? '<img src="' +
      { urgent: "assets/img/urgent.png", medium: "assets/img/medium.png", low: "assets/img/low.png" }[task.priority] +
      '" alt="' + task.priority + '" class="task-priority-icon">'
    : "";
  return (contactsHtml || priorityHtml)
    ? '<div class="task-footer">' + contactsHtml + priorityHtml + '</div>'
    : "";
}

/**
 * Handles the dragstart event for a task element.
 * @param {DragEvent} event - The drag event.
 */
function drag(event) {
  event.dataTransfer.setData("text", event.target.id);
}

/**
 * Allows an element to accept drop events.
 * @param {DragEvent} event - The dragover event.
 */
function allowDrop(event) {
  event.preventDefault();
}

/**
 * Moves a task to a new column when dropped.
 * @param {DragEvent} event - The drop event.
 * @param {string} columnId - The target column ID.
 */
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

/**
 * Moves a task element within the DOM.
 * @param {HTMLElement} task - The task element.
 * @param {HTMLElement} newColumnElement - The target column element.
 */
function moveTaskInDOM(task, newColumnElement) {
  const newPlaceholder = newColumnElement.querySelector(".empty-placeholder");
  if (newPlaceholder) {
    newColumnElement.removeChild(newPlaceholder);
  }
  newColumnElement.appendChild(task);
}

/**
 * Fetches and prepares task data for an update.
 * @async
 * @param {string} taskId - The task ID.
 * @param {string} oldColumnId - The original column ID.
 * @param {string} columnId - The new column ID.
 * @param {HTMLElement} newColumnElement - The target column element.
 * @returns {Promise<Object|null>} The updated task data.
 */
async function fetchAndPrepareTaskData(taskId, oldColumnId, columnId, newColumnElement) {
  const response = await fetch(`${dbUrl}/tasks/${oldColumnId}/${taskId}.json`);
  const taskData = await response.json();
  if (taskData) {
    taskData.status = columnId;
    taskData.order = newColumnElement.querySelectorAll(".task").length - 1;
  }
  return taskData;
}

/**
 * Commits task updates to Firebase by updating new data and deleting old data.
 * @async
 * @param {string} taskId - The task ID.
 * @param {string} oldColumnId - The original column ID.
 * @param {string} columnId - The new column ID.
 * @param {Object} taskData - The updated task data.
 * @param {HTMLElement} oldColumnElement - The original column element.
 * @returns {Promise<void>}
 */
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

/**
 * Updates a task in Firebase after moving it to a new column.
 * @async
 * @param {string} taskId - The task ID.
 * @param {string} oldColumnId - The original column ID.
 * @param {string} columnId - The new column ID.
 * @param {HTMLElement} newColumnElement - The target column element.
 * @param {HTMLElement} oldColumnElement - The original column element.
 * @returns {Promise<void>}
 */
async function updateTaskInFirebase(taskId, oldColumnId, columnId, newColumnElement, oldColumnElement) {
  try {
    const taskData = await fetchAndPrepareTaskData(taskId, oldColumnId, columnId, newColumnElement);
    if (taskData) {
      await commitTaskUpdates(taskId, oldColumnId, columnId, taskData, oldColumnElement);
    }
  } catch (error) {
    console.error("Error moving task:", error);
  }
}

// Expose drag & drop functions globally
window.moveTo = moveTo;
window.allowDrop = allowDrop;

/**
 * Returns placeholder text for a given column.
 * @param {string} columnId - The column ID.
 * @returns {string} Placeholder text for the column.
 */
window.getColumnPlaceholderText = function (columnId) {
    const columnNames = {
      "to-do": "To Do",
      "in-progress": "In Progress",
      "await-feedback": "Await Feedback",
      "done": "Done"
    };
    return `No tasks ${columnNames[columnId]}`;
};

/**
 * Aktualisiert den Placeholder für eine einzelne Spalte basierend auf der Sichtbarkeit der Tasks.
 */
const updateColumnPlaceholder = (columnId) => {
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
    if (existingPlaceholder) existingPlaceholder.remove();
  }
};

/**
 * Aktualisiert die Placeholders in allen Spalten basierend auf der Task-Sichtbarkeit.
 */
const updatePlaceholders = () => {
  const columns = ["to-do", "in-progress", "await-feedback", "done"];
  columns.forEach(updateColumnPlaceholder);
};


/**
 * Searches tasks based on the provided search term.
 * @param {string} searchTerm - The term to search for.
 */
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

/**
 * Displays the task overlay for adding a new task.
 * @param {string} columnId - The column ID where the task will be added.
 */
const showOverlay = (columnId) => {
    const overlay = $("taskOverlay");
    overlay.style.display = "flex";
    overlay.dataset.columnId = columnId;
};

/**
 * Hides the task overlay.
 */
const hideOverlay = () => {
    $("taskOverlay").style.display = "none";
};

document.querySelector(".addTaskButton").addEventListener("click", () => showOverlay("to-do"));
document.querySelector(".toDoButton").addEventListener("click", () => showOverlay("to-do"));
document.querySelector(".inProgressButton").addEventListener("click", () => showOverlay("in-progress"));
document.querySelector(".awaitButton").addEventListener("click", () => showOverlay("await-feedback"));

/**
 * Hides the overlay if a click occurs outside the overlay content.
 */
$("taskOverlay").addEventListener("click", (event) => {
    if (event.target === $("taskOverlay")) {
        hideOverlay();
    }
});

window.selectedContacts = window.selectedContacts || [];
window.selectedSubtasks = window.selectedSubtasks || [];

/**
 * Clears the task form, resets error messages, and clears selected contacts/subtasks.
 */
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

/**
 * Adds a new task to Firebase using fetch.
 * @async
 * @param {Object} taskData - The task data.
 * @returns {Promise<void>}
 */
async function addTaskWithFetch(taskData) {
  const newTaskId = Date.now().toString();
  try {
    const response = await fetch(`${dbUrl}/tasks/${taskData.status}/${newTaskId}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    await response.json();
    hideOverlay();
    await loadTasks();
  } catch (error) {
    console.error("Error creating task:", error);
  }
}

/**
 * Resets form error messages and input border colors.
 */
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

/**
 * Validates required form inputs.
 * @param {string} titleValue - The task title.
 * @param {string} dueDateValue - The due date.
 * @param {string} categoryValue - The task category.
 * @returns {boolean} True if all required fields are provided; otherwise, false.
 */
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

/**
 * Builds the task data object from form inputs.
 * @param {string} titleValue - The task title.
 * @param {string} descriptionValue - The task description.
 * @param {string} dueDateValue - The due date.
 * @param {string} categoryValue - The task category.
 * @returns {Object} The constructed task data.
 */
function buildTaskData(titleValue, descriptionValue, dueDateValue, categoryValue) {
  return {
    title: titleValue,
    description: descriptionValue,
    dueDate: dueDateValue,
    priority: document.querySelector('input[name="priority"]:checked')
      ? document.querySelector('input[name="priority"]:checked').value
      : null,
    category: categoryValue,
    status: $("taskOverlay").dataset.columnId || "",
    contacts: window.selectedContacts || [],
    subtasks: (window.selectedSubtasks || []).map(subtask => {
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
  addTaskWithFetch(taskData).then(() => {
    clearTask();
  });
});

/**
 * Displays the logged-in user's initials on the profile toggle.
 */
const displayUserInitials = () => {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (loggedInUser && loggedInUser.initials) {
      document.getElementById("profile-toggle").textContent = loggedInUser.initials;
    }
};

document.getElementById('addTaskMobile').addEventListener('click', () => {
  window.location.href = 'addTask.html';
});
document.getElementById('addTaskMobile2').addEventListener('click', () => {
  window.location.href = 'addTask.html';
});
document.getElementById('addTaskMobile3').addEventListener('click', () => {
  window.location.href = 'addTask.html';
});
document.getElementById('addTaskMobile4').addEventListener('click', () => {
  window.location.href = 'addTask.html';
});
document.getElementById('addTaskMobile5').addEventListener('click', () => {
  window.location.href = 'addTask.html';
});

document.addEventListener("DOMContentLoaded", displayUserInitials);
loadTasks();

let currentTaskId = null;
let currentColumnId = null;
let currentSubtasks = [];

/**
 * Updates the subtasks view in the task detail overlay.
 */
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
        subtasksList.innerHTML = '<li>No subtasks available</li>';
    }
}

/**
 * Updates the task detail overlay content with task data.
 * @param {Object} task - The task data.
 * @param {HTMLElement} overlay - The overlay element.
 */
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

/**
 * Updates the contacts and subtasks displayed in the overlay.
 * @param {Object} task - The task data.
 * @param {HTMLElement} overlay - The overlay element.
 */
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

/**
 * Attaches event handlers to overlay buttons.
 * @param {HTMLElement} overlay - The overlay element.
 */
function attachOverlayEventHandlers(overlay) {
  overlay.querySelector('.close-btn').onclick = hideTaskDetailOverlay;
  overlay.querySelector('.delete-btn').onclick = deleteTask;
  overlay.querySelector('.edit-btn').onclick = enableEditMode;
  overlay.querySelector('.save-btn').onclick = saveChanges;
}

/**
 * Displays the task detail overlay.
 * @param {Object} task - The task data.
 * @param {string} taskId - The task ID.
 * @param {string} columnId - The column ID.
 */
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

/**
 * Hides the task detail overlay and resets the view mode.
 */
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

/**
 * Hides the overlay if the click event is outside its content.
 * @param {MouseEvent} event - The click event.
 */
const hideTaskOverlayOutside = (event) => {
    const overlay = document.getElementById("taskDetailOverlay");
    if (event.target === overlay) {
        hideTaskDetailOverlay();
    }
};

/**
 * Renders the subtasks list in the task detail overlay.
 * @param {Object} task - The task data.
 */
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
        subtasksList.innerHTML = '<li>No subtasks available</li>';
    }
}

/**
 * Updates task subtasks in Firebase.
 * @async
 * @param {Array} subtasks - The subtasks array.
 * @returns {Promise<void>}
 */
async function updateTaskSubtasksInFirebase(subtasks) {
    try {
      const response = await fetch(`${dbUrl}/tasks/${currentColumnId}/${currentTaskId}/subtasks.json`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subtasks)
      });
      await response.json();
      console.log("Subtasks updated");
    } catch (err) {
      console.error("Error updating subtasks:", err);
    }
}

/**
 * Updates the progress bar for a task element.
 * @param {Object} task - The task data.
 */
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

/**
 * Clears and sets up the subtasks list element in the overlay.
 * @returns {HTMLElement|null} The subtasks list element.
 */
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

/**
 * Creates a button element for editing or deleting a subtask.
 * @param {string} type - The button type ('edit' or 'delete').
 * @param {Function} clickHandler - The click handler function.
 * @returns {HTMLElement} The created button element.
 */
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

/**
 * Creates a list item for a subtask.
 * @param {Object} subtask - The subtask data.
 * @param {number} index - The index of the subtask.
 * @returns {HTMLElement} The subtask list item.
 */
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

/**
 * Renders subtasks in edit mode.
 */
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

/**
 * Converts a subtask display into an editable input field.
 * @param {HTMLElement} li - The list item element.
 * @param {HTMLElement} titleSpan - The span element showing the subtask title.
 * @param {number} index - The subtask index.
 */
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

/**
 * Enables edit mode for the task detail overlay.
 * @async
 * @returns {Promise<void>}
 */
async function enableEditMode() {
  try {
    const response = await fetch(`${dbUrl}/tasks/${currentColumnId}/${currentTaskId}.json`);
    const task = await response.json();
    window.currentOrder = task.order;
    const overlay = $("taskDetailOverlay");
    updateOverlayWithTask(overlay, task);
    await setupContactsAndSubtasks(overlay, task);
  } catch (error) {
    console.error("Error enabling edit mode:", error);
  }
}

/**
 * Updates the overlay to display editable task fields.
 * @param {HTMLElement} overlay - The overlay element.
 * @param {Object} task - The task data.
 */
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

/**
 * Sets up contact selection and subtask editing in the overlay.
 * @async
 * @param {HTMLElement} overlay - The overlay element.
 * @param {Object} task - The task data.
 * @returns {Promise<void>}
 */
async function setupContactsAndSubtasks(overlay, task) {
  const res = await fetch(`${dbUrl}/contactsDatabase.json`);
  const data = await res.json();
  const allContacts = data ? Object.values(data) : [];
  const container = overlay.querySelector('#editContactsCheckboxContainer');

  window.selectedContacts = task.contacts || [];

  container.innerHTML = allContacts.map(contact => {
    const isSelected = window.selectedContacts.some(c => c.name === contact.name);
    return `
      <label class="contact-checkbox ${isSelected ? 'selected' : ''}" 
             data-contact-name="${contact.name}" 
             data-contact-color="${contact.color}" 
             style="${isSelected ? 'background-color: #2A3647;' : ''}"
             onclick="toggleContact(this); event.stopPropagation();">
        <div class='contact-container-edit'>
          <span class="contact-badge-selection" style="background: ${contact.color};" title="${contact.name}">
            ${getInitials(contact.name)}
          </span>
          <span class="contact-name-selection" style="${isSelected ? 'color: white;' : ''}">${contact.name}</span>
        </div>
        <img style="height: 18px;" class="contact-checkbox-img" src="assets/img/checkbox_${isSelected ? 'checked' : 'empty'}.png" alt="Checkbox">
      </label>`;
  }).join('');  

  updateSelectedContactsDisplay(overlay);
  container.addEventListener('change', () => updateSelectedContactsDisplay(overlay));
  
  currentSubtasks = task.subtasks ? task.subtasks.map(s => ({ ...s })) : [];
  renderSubtasksEditMode();
  updateSubtasksViewInOverlay();
}

/**
 * Toggles the selection state of a contact.
 * @param {HTMLElement} label - The contact label element.
 */
function toggleContact(label) {
  const checkboxImg = label.querySelector('.contact-checkbox-img');
  const contactName = label.querySelector('.contact-name-selection');

  if (label.classList.contains('selected')) {
    label.classList.remove('selected');
    checkboxImg.src = 'assets/img/checkbox_empty.png';
    label.style.backgroundColor = '';
    contactName.style.color = '';
  } else {
    label.classList.add('selected');
    checkboxImg.src = 'assets/img/checkbox_checked.png';
    label.style.backgroundColor = '#2A3647';
    contactName.style.color = 'white';
  }
  
  const overlay = document.getElementById("taskDetailOverlay");
  if (overlay) {
    updateSelectedContactsDisplay(overlay);
  }
}

window.toggleContact = toggleContact;

/**
 * Updates the display of selected contacts in the overlay.
 * @param {HTMLElement} overlay - The overlay element.
 */
function updateSelectedContactsDisplay(overlay) {
  const container = overlay.querySelector('#editContactsCheckboxContainer');
  const selectedLabels = container.querySelectorAll('.contact-checkbox.selected');
  const selectedContainer = overlay.querySelector('.selected-contacts-list');
  selectedContainer.innerHTML = '';
  const selectedContactsArray = Array.from(selectedLabels).map(label => ({
    name: label.dataset.contactName,
    color: label.dataset.contactColor
  }));
  
  window.selectedContacts = selectedContactsArray;

  const maxContacts = 4;
  selectedContactsArray.slice(0, maxContacts).forEach(contact => {
    selectedContainer.appendChild(createContactBadge(contact));
  });

  const extraCount = selectedContactsArray.length - maxContacts;
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

/**
 * Retrieves updated task data from the overlay.
 * @returns {Object} The updated task data.
 */
function getUpdatedTask() {
  let overlay = $("taskDetailOverlay");
  let updatedTask = {
    title: overlay.querySelector('#edit-title').value,
    description: overlay.querySelector('#edit-description').value,
    category: overlay.querySelector('.category-badge').textContent,
    dueDate: overlay.querySelector('#edit-due-date').value,
    priority: overlay.querySelector('input[name="edit-priority"]:checked').value,
    contacts: window.selectedContacts || [],
    subtasks: currentSubtasks,
    status: currentColumnId,
    order: window.currentOrder
  };
  return updatedTask;
}

/**
 * Saves the updated task to Firebase.
 * @async
 * @param {Object} updatedTask - The updated task data.
 * @returns {Promise<void>}
 */
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
    console.error("Error saving changes:", error);
  }
}

/**
 * Saves changes made in the task detail overlay.
 * @async
 * @returns {Promise<void>}
 */
async function saveChanges() {
  let updatedTask = getUpdatedTask();
  await saveTask(updatedTask);
}

/**
 * Deletes the current task from Firebase.
 * @async
 * @returns {Promise<void>}
 */
async function deleteTask() {
  try {
    let response = await fetch(dbUrl + "/tasks/" + currentColumnId + "/" + currentTaskId + ".json", {
      method: 'DELETE'
    });
    await response.json();
    hideTaskDetailOverlay();
    await loadTasks();
  } catch (error) {
    console.error("Error deleting task:", error);
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
