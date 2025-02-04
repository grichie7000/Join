/**
 * Activates the edit mode for the current task.
 * Displays the edit interface and pre-fills it with the task's current data.
 */
function editTask() {
    if (currentTaskIndex === null) return;
    isEditing = true; // Bearbeitungsmodus aktivieren
    let task = tasks[currentTaskIndex].task;
    task.subtasks = task.subtasks || {};
    let taskView = document.getElementById("taskView");
    let taskEdit = document.getElementById("taskEdit");
    taskView.classList.add("hidden");
    taskEdit.classList.remove("hidden");
    taskEdit.innerHTML = generateTaskEditHTML(task);
    updateSubtasksList(task);
    setupSubtaskInput();
    populateSelectedContacts();
    setDateInputMin();
}


/**
 * Cancels the editing process and exits the edit mode.
 * Restores the original task details in the popup and hides the edit interface.
 */
function cancelTaskEditing() {
    if (!isEditing) return;
    isEditing = false;
    let taskView = document.getElementById("taskView");
    let taskEdit = document.getElementById("taskEdit");
    taskEdit.classList.add("hidden");
    taskView.classList.remove("hidden");
    if (currentTaskIndex !== null) {
        let task = tasks[currentTaskIndex].task;
        populateTaskPopup(task);
    }
}



/**
 * Populates the selected contacts display by showing up to 3 contacts and a count of additional contacts if necessary.
 * @function
 */
function populateSelectedContacts() {
    let selectedContacts = document.getElementById("selectedContacts");
    selectedContacts.innerHTML = "";
    let contactsArray = filterAssignedContacts();
    let displayedContacts = contactsArray.slice(0, 3);
    let remainingCount = contactsArray.length - displayedContacts.length;
    displayedContacts.forEach(({ name, color }) => {
        let profileCircle = createProfileCircle({ name, color });
        selectedContacts.appendChild(profileCircle);
    });
    updateExtraCount(selectedContacts, remainingCount);
}


/**
 * Filters the assigned contacts to return only those with valid names and colors.
 * @function
 * @returns {Array} An array of contact objects that have both a valid name and color.
 */
function filterAssignedContacts() {
    let assignedTo = tasks[currentTaskIndex]?.task?.assignedTo || {};
    return Object.values(assignedTo).filter(({ name, color }) => name && color);
}


/**
 * Updates the display with a count of remaining contacts if there are more than 3 assigned contacts.
 * @function
 * @param {HTMLElement} container The DOM element where the count will be displayed.
 * @param {number} remainingCount The number of additional contacts to display.
 */
function updateExtraCount(container, remainingCount) {
    if (remainingCount > 0) {
        let extraCountCircle = document.createElement("div");
        extraCountCircle.classList.add("profile-circle", "extra-count");
        extraCountCircle.textContent = `+${remainingCount}`;
        container.appendChild(extraCountCircle);
    }
}


/**
 * Capitalizes the first letter of a given string.
 * @param {string} str The string to capitalize.
 * @returns {string} The string with the first letter capitalized.
 */
function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}


/**
 * Sets the priority of a task by toggling the active state of the priority buttons.
 * @param {string} priority The priority level to set.
 */
function setPriority(priority) {
    let activeButton = getActivePriorityButton();
    let clickedButton = document.querySelector(`.priority-btn[data-priority="${priority}"]`);
    if (clickedButton !== activeButton) {
        updatePriorityButtonState(clickedButton);
    }
}


/**
 * Retrieves the currently active priority button.
 * @returns {HTMLElement} The active priority button.
 */
function getActivePriorityButton() {
    let activeButton = null;
    let priorityButtons = document.querySelectorAll(".priority-btn");
    priorityButtons.forEach(btn => btn.classList.remove("active"));
    priorityButtons.forEach(btn => {
        if (btn.classList.contains("active")) {
            activeButton = btn;
        }
    });
    return activeButton;
}


/**
 * Updates the state of the priority button by marking it as active.
 * @param {HTMLElement} clickedButton The priority button to mark as active.
 */
function updatePriorityButtonState(clickedButton) {
    if (clickedButton) {
        clickedButton.classList.add("active");
    }
}


/**
 * Toggles the dropdown visibility and icon rotation. 
 * Handles opening and closing of the dropdown and adds/removes event listeners accordingly.
 */
function toggleDropdown() {
    let dropdown = document.querySelector(".dropdown");
    let dropdownToggle = document.querySelector(".dropdown-toggle");
    let icon = document.querySelector(".dropdown-toggle .dropdown-icon");
    dropdown.classList.toggle("open");
    icon.classList.toggle("rotated");
    if (dropdown.classList.contains("open")) {
        handleDropdownOpen(dropdown, dropdownToggle);
    } else {
        handleDropdownClose(dropdownToggle);
    }
}


/**
 * Handles the actions when the dropdown is opened.
 * Switches to the search input, updates dropdown items, and adds an event listener for clicks outside the dropdown.
 * @param {HTMLElement} dropdown The dropdown element.
 * @param {HTMLElement} dropdownToggle The dropdown toggle button element.
 */
function handleDropdownOpen(dropdown, dropdownToggle) {
    switchToSearchInput(dropdownToggle);
    updateDropdownItems(dropdown);
    document.addEventListener("click", handleOutsideClick);
}


/**
 * Handles the actions when the dropdown is closed.
 * Removes focus from the toggle button and resets its state.
 * @param {HTMLElement} dropdownToggle The dropdown toggle button element.
 */
function handleDropdownClose(dropdownToggle) {
    dropdownToggle.blur();
    resetToDropdownButton(dropdownToggle);
    document.removeEventListener("click", handleOutsideClick);
}


/**
 * Handles clicks outside the dropdown to close it if clicked outside.
 * @param {Event} event The click event.
 */
function handleOutsideClick(event) {
    let dropdown = document.querySelector(".dropdown");
    let dropdownToggle = document.querySelector(".dropdown-toggle");
    if (!dropdown.contains(event.target) && !dropdownToggle.contains(event.target)) {
        dropdown.classList.remove("open");
        let icon = document.querySelector(".dropdown-toggle .dropdown-icon");
        icon.classList.remove("rotated");
        resetToDropdownButton(dropdownToggle);
        document.removeEventListener("click", handleOutsideClick);
    }
}


/**
 * Toggles the checked state of a dropdown item and updates the task assignment and item style accordingly.
 * @param {HTMLElement} item The dropdown item element.
 */
function toggleDropdownItem(item) {
    let checkbox = item.querySelector("input[type='checkbox']");
    if (!checkbox) return;
    checkbox.checked = !checkbox.checked;
    let contactKey = checkbox.value;
    updateTaskAssignment(contactKey, checkbox.checked);
    updateItemStyle(item, checkbox.checked);
    updateSelectedContactsDisplay();
}


/**
 * Updates the task's assignment of a contact based on the checkbox state.
 * @param {string} contactKey The key of the contact.
 * @param {boolean} isChecked The checked state of the checkbox.
 */
function updateTaskAssignment(contactKey, isChecked) {
    let task = tasks[currentTaskIndex].task;
    task.assignedTo = task.assignedTo || {};
    if (isChecked) {
        task.assignedTo[contactKey] = contacts[contactKey];
    } else {
        delete task.assignedTo[contactKey];
        if (Object.keys(task.assignedTo).length === 0) {
            delete task.assignedTo;
        }
    }
}


/**
 * Updates the display of selected contacts by rendering the profile circles and the extra count if applicable.
 * This function limits the number of displayed contacts to 3, and shows the remaining count if there are more than 3.
 */
function updateSelectedContactsDisplay() {
    let selectedContacts = document.getElementById("selectedContacts");
    let task = tasks[currentTaskIndex].task;
    let assignedContacts = Object.values(task.assignedTo || {});
    let displayedContacts = assignedContacts.slice(0, 3); // Zeige maximal 3 Kontakte
    let remainingCount = assignedContacts.length - displayedContacts.length;

    clearAndRenderProfileCircles(selectedContacts, displayedContacts);
    updateExtraCount(selectedContacts, remainingCount);
}


/**
 * Clears the existing profile circles in the container and renders new ones for the given contacts.
 * @param {HTMLElement} container The container element to hold the profile circles.
 * @param {Array} contacts The array of contacts to render profile circles for.
 */
function clearAndRenderProfileCircles(container, contacts) {
    container.innerHTML = "";
    contacts.forEach(contact => {
        let profileCircle = createProfileCircle(contact);
        container.appendChild(profileCircle);
    });
}


/**
 * Updates the display of the extra count if there are more than 3 contacts. 
 * It shows a circle with the remaining count of contacts.
 * @param {HTMLElement} container The container element where the extra count will be displayed.
 * @param {number} remainingCount The number of remaining contacts to display in the extra count circle.
 */
function updateExtraCount(container, remainingCount) {
    let extraCountCircle = container.querySelector(".extra-count");
    if (remainingCount > 0) {
        if (!extraCountCircle) {
            extraCountCircle = document.createElement("div");
            extraCountCircle.classList.add("profile-circle", "extra-count");
            container.appendChild(extraCountCircle);
        }
        extraCountCircle.textContent = `+${remainingCount}`;
    } else if (extraCountCircle) {
        extraCountCircle.remove();
    }
}


/**
 * Filters the dropdown items based on the search input value.
 * Items whose contact name includes the search term will remain visible.
 */
function filterDropdownItems() {
    let searchInput = document.getElementById("dropdownSearchInput")
    let searchTerm = searchInput.value.toLowerCase();
    let dropdownItems = document.querySelectorAll(".dropdown-item");
    dropdownItems.forEach(item => {
        let contactName = item.querySelector("p").textContent.toLowerCase();
        if (contactName.includes(searchTerm)) {
            item.style.display = ""; 
        } else {
            item.style.display = "none";
        }
    });
}


/**
 * Updates the style of dropdown items based on the checked state of their associated checkbox.
 * @param {HTMLElement} dropdown The dropdown element containing the items.
 */
function updateDropdownItems(dropdown) {
    let items = dropdown.querySelectorAll(".dropdown-item");
    items.forEach(item => {
        let checkbox = item.querySelector("input[type='checkbox']");
        if (checkbox) {
            updateItemStyle(item, checkbox.checked);
        }
    });
}


/**
 * Toggles the style of an item based on its checked state.
 * @param {HTMLElement} item The dropdown item element.
 * @param {boolean} isChecked Whether the item is checked or not.
 */
function updateItemStyle(item, isChecked) {
    item.classList.toggle("checked", isChecked);
}


/**
 * Updates the HTML content of a task by replacing its task div with the newly generated task HTML.
 * @param {number} taskIndex The index of the task in the tasks array.
 */
function updateTaskHtml(taskIndex) {
    let task = tasks[taskIndex].task;
    let taskDiv = document.getElementById(`task-${taskIndex}`);
    if (taskDiv) {
        taskDiv.outerHTML = generateTaskHtml(task, taskIndex, contacts);
    }
}


/**
 * Saves the changes made to the current task by updating its fields and saving the data to the database.
 * Refreshes the task popup and updates the task HTML after saving the changes.
 */
async function saveTaskChanges() {
    let taskObj = tasks[currentTaskIndex];
    if (!taskObj || !taskObj.id) return handleError();
    let task = taskObj.task;
    task = updateTaskFields(task);
    await updateTaskData(taskObj.id, task);
    isEditing = false;
    refreshTaskPopup();
    updateTaskHtml(currentTaskIndex);
}



/**
 * Updates the fields of the task object with the current values from the task edit form.
 * @param {Object} task The task object to be updated.
 * @returns {Object} The updated task object.
 */
function updateTaskFields(task) {
    task.title = document.getElementById("editTaskTitle").value;
    task.description = document.getElementById("editTaskDescription").value;
    task.dueDate = document.getElementById("editTaskDueDate").value;
    task.priority = document.querySelector(".priority-btn.active")?.getAttribute("data-priority");
    task.assignedTo = getAssignedContacts();
    task.subtasks = getCurrentSubtasks();
    return task;
}


/**
 * Updates the task data in the database by sending a PUT request with the updated task information.
 * @param {string} taskId The ID of the task to be updated.
 * @param {Object} task The updated task object.
 */
async function updateTaskData(taskId, task) {
    await putData(`tasks/${taskId}`, task);
    tasks[currentTaskIndex].task = task;
}


/**
 * Gets the list of assigned contacts for the current task from the dropdown items.
 * @returns {Object} An object containing the assigned contacts with their names and colors.
 */
function getAssignedContacts() {
    let assignedContacts = {};
    let dropdownItems = document.querySelectorAll(".dropdown-item");
    dropdownItems.forEach(item => processDropdownItem(item, assignedContacts));
    return assignedContacts;
}


/**
 * Processes each dropdown item to check if a contact is selected (checked).
 * If the contact is selected, it adds the contact to the assigned contacts list.
 * @param {Element} item The dropdown item element to process.
 * @param {Object} assignedContacts The object to store the assigned contacts.
 */
function processDropdownItem(item, assignedContacts) {
    let checkbox = item.querySelector("input[type='checkbox']");
    if (checkbox && checkbox.checked) {
        let contactKey = checkbox.value;
        addContactToAssigned(contactKey, assignedContacts);
    }
}


/**
 * Adds a contact to the assigned contacts object by its key.
 * If the contact exists in the `contacts` object, it adds the contact's name and color to the assigned contacts.
 * @param {string} contactKey The key of the contact to add.
 * @param {Object} assignedContacts The object to store the assigned contacts.
 */
function addContactToAssigned(contactKey, assignedContacts) {
    if (contacts[contactKey]) {
        assignedContacts[contactKey] = {
            name: contacts[contactKey].name,
            color: contacts[contactKey].color
        };
    } else {
        console.warn(`Kontakt mit ID "${contactKey}" existiert nicht in contacts.`);
    }
}


/**
 * Refreshes the task popup by showing the task view and updating the task details.
 */
function refreshTaskPopup() {
    showTaskView();
    let task = tasks[currentTaskIndex].task;
    updateTaskDetails(task);
}


/**
 * Shows the task view and hides the task edit view in the task popup.
 */
function showTaskView() {
    let taskView = document.getElementById("taskView");
    let taskEdit = document.getElementById("taskEdit");
    let taskPopup = document.getElementById("taskPopup");
    taskView.classList.remove("hidden");
    taskEdit.classList.add("hidden");
    if (!taskPopup.classList.contains("show")) {
        taskPopup.classList.add("show");
    }
}


/**
 * Updates the task details in the task popup with the current task's data.
 * @param {Object} task The task object containing the task's details.
 */
function updateTaskDetails(task) {
    document.getElementById("taskBadge").innerHTML = generateTaskBadge(task.badge);
    document.getElementById("taskTitle").innerHTML = task.title;
    document.getElementById("taskDescription").innerHTML = task.description;
    document.getElementById("taskDueDate").innerHTML = formatDateToDDMMYYYY(task.dueDate);
    generateTaskPriorityElement(task.priority);
    document.getElementById("taskContacts").innerHTML = generateContactsHtml(task.assignedTo, contacts);
    document.getElementById("subtasksList").innerHTML = generateSubtasksHtml(task.subtasks, currentTaskIndex);
}