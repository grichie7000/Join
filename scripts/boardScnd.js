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
