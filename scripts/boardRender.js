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

