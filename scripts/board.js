/**
 * @module board
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

function getCategoryHtml(task) {
  let categoryText = task.category || "Keine Kategorie";
  let categoryBgColor = "#f0f0f0";
  if (task.category === "Technical Task") {
    categoryText = "Technical Task";
    categoryBgColor = "#23D8C2";
  } else if (task.category === "User Story") {
    categoryText = "User Story";
    categoryBgColor = "#1500ff";
  }
  return '<div class="task-category" style="background: ' + categoryBgColor + '">' + categoryText + '</div>';
}

function getTaskContentHtml(task) {
  return getCategoryHtml(task) +
         '<h3 class="task-title" style="padding-top: 10px">' + task.title + '</h3>' +
         '<div class="task-description">' + task.description + '</div>' +
         getSubtasksHtml(task) +
         getFooterHtml(task);
}

function attachTaskEventListeners(div, task, taskId, columnId) {
  div.addEventListener("click", function(e) {
    showTaskDetailOverlay(task, taskId, columnId);
  });
  div.addEventListener("dragstart", drag);
}

function createTaskElement(task, taskId, columnId) {
  const div = document.createElement("div");
  div.className = "task";
  div.draggable = true;
  div.id = taskId;
  div.innerHTML = getTaskContentHtml(task);
  attachTaskEventListeners(div, task, taskId, columnId);
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

function getContactsHtml(task) {
  if (task.contacts && task.contacts.length > 0) {
    const maxContacts = 4;
    const displayedContacts = task.contacts.slice(0, maxContacts);
    const extraCount = task.contacts.length - maxContacts;
    let contactsHtml = '<div class="task-contacts">' +
      displayedContacts.map(c => {
        return '<div class="contact-badge" style="background: ' +
          getContactColor(c) + ';" title="' + c.name + '">' +
          getInitials(c.name) + '</div>';
      }).join("");
    if (extraCount > 0) {
      contactsHtml += '<div class="contact-badge extra-badge">+' + extraCount + '</div>';
    }
    contactsHtml += '</div>';
    return contactsHtml;
  }
  return "";
}

function getPriorityHtml(task) {
  if (task.priority) {
    const priorityIcons = {
      urgent: "assets/img/urgent.png",
      medium: "assets/img/medium.png",
      low: "assets/img/low.png"
    };
    return '<img src="' + priorityIcons[task.priority] + '" alt="' + task.priority + '" class="task-priority-icon">';
  }
  return "";
}

function getFooterHtml(task) {
  const contactsHtml = getContactsHtml(task);
  const priorityHtml = getPriorityHtml(task);
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
 * Updates column placeholders based on task visibility.
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
 * Updates the placeholders in all columns based on the task visibility.
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
