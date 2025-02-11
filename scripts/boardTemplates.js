/**
 * Generates the HTML for an empty category message.
 * @param {string} categoryId - The ID of the category (e.g., "To-Do", "In Progress").
 * @returns {string} The HTML string for the empty category message.
 */
function emptyCategoryHTML(categoryId) {
    return `
        <div class="no-tasks">
            No tasks ${categoryId === "To-Do" ? "to do" : 
                        categoryId === "In Progress" ? "in progress" : 
                        categoryId === "Await Feedback" ? "await feedback" : 
                        "done"}.
        </div>
    `
}


/**
 * Generates the HTML for a task element.
 * @param {Object} task - The task object containing task details.
 * @param {number} index - The index of the task.
 * @returns {string} The HTML string for the task element.
 */
function generateTaskHtml(task, index) {
    let subtasks = task.subtasks || {}; 
    let { completed, total } = calculateSubtaskProgress(subtasks);
    return `
        <div class="task" id="task-${index}" draggable="true" onclick="openTaskPopup(${index})" ondragstart="startDragging(${index})">
            <div class="task-header">
                ${generateTaskBadge(task.badge)}
                ${task.category !== "Done" ? `
                    <button class="move-task-btn" onclick="showCategoryPopup(${index}, this, event)">
                        <img src="./assets/icons/moveTask.png" alt="Move Task">
                        <div id="category-popup" class="category-popup hidden">
                            <ul class="category-options"></ul>
                        </div>    
                    </button>
                ` : ""}
            </div>
            <div class="task-title">${task.title}</div>
            <div class="task-desc">${task.description}</div>
            <div class="subtask-bar" id="subtaskBar-${index}">
                ${task.subtasks && total > 0 ? `
                    <div class="pb-bg">
                        <div class="pb-blue" style="width: ${(completed / total) * 100}%;"></div>
                    </div>
                    <span>${completed}/${total} Subtasks</span>
                ` : ""}
            </div>
            <div class="task-footer">
                <div class="contacts">
                    ${task.assignedTo ? (() => {
                        const contactKeys = Object.keys(task.assignedTo)
                            .filter(contactKey => task.assignedTo[contactKey].name && task.assignedTo[contactKey].name.trim() !== "");
                        const displayedContacts = contactKeys.slice(0, 3);
                        const remainingCount = contactKeys.length - displayedContacts.length;
                        return displayedContacts.map(contactKey => {
                            let contactName = task.assignedTo[contactKey].name;
                            let bgColor = task.assignedTo[contactKey].color;
                            let initials = contactName.split(" ").map(name => name[0]).join("");
                            return `
                                <div class="profile-circle" style="background-color: ${bgColor};">
                                    ${initials}
                                </div>
                            `;
                        }).join("") + 
                        (remainingCount > 0 ? `
                            <div class="profile-circle extra-count">
                                +${remainingCount}
                            </div>
                        ` : "");
                    })() : ""}
                </div>      
                ${task.priority ? `
                    <div class="priority">
                        <img src="./assets/icons/priority_${task.priority}.png" alt="Priority">
                    </div>
                ` : ""}
            </div>
        </div>
    `;
}


/**
 * Updates the priority section of a task with the specified priority.
 * @param {string} priority - The priority level ("urgent", "medium", "low").
 */
function generateTaskPriorityElement(priority){
    let taskPriorityElement = document.getElementById("taskPriority");
    if (priority) {
        taskPriorityElement.innerHTML = `
            <p>${priority.charAt(0).toUpperCase() + priority.slice(1)}</p>
            <img src="./assets/icons/priority_${priority}.png" alt="Priority">
        `;
    } else {
        taskPriorityElement.innerHTML = "none";
    }
}


/**
 * Generates an HTML template for displaying a contact in a task.
 * @param {string} initials - The initials of the contact.
 * @param {string} contactName - The full name of the contact.
 * @param {string} bgColor - The background color for the contact's profile circle.
 * @returns {string} The HTML string for the contact template.
 */
function contactsHtmlTemplate(initials, contactName, bgColor) {
    return `
        <div class="task-contact">
            <div class="profile-circle" style="background-color: ${bgColor};">
                ${initials}
            </div>
            <span>${contactName}</span>
        </div>
    `;
}


/**
 * Generates the HTML for a task badge based on the badge type.
 * @param {string} badgeType - The type of the badge ("User Story", "Technical Task").
 * @returns {string} The HTML string for the task badge.
 */
function generateTaskBadge(badgeType) {
    let badgeClass = "bg-orange";
    if (badgeType === "User Story") {
        badgeClass = "bg-blue";
    } else if (badgeType === "Technical Task") {
        badgeClass = "bg-green";
    }
    return `
        <div class="task-badge ${badgeClass}">
            ${badgeType}
        </div>
    `;
}


/**
 * Generates the HTML for a list of subtasks.
 * @param {Object} subtasks - The subtasks object where keys are IDs and values are subtask details.
 * @param {number} taskIndex - The index of the parent task.
 * @returns {string} The HTML string for the subtasks.
 */
function generateSubtasksHtml(subtasks, taskIndex) {
    if (!subtasks) return "";
    
    return Object.entries(subtasks).map(([subtaskId, subtask]) => `
        <label class="label-container">
            ${subtask.name}
            <input type="checkbox" ${subtask.completed ? "checked" : ""} onchange="toggleSubtask(${taskIndex}, '${subtaskId}')" />
            <span class="checkmark"></span>
        </label>
    `).join("");
}


/**
 * Displays filtered tasks or a "no tasks found" message based on the search results.
 * @param {Array} filteredTasks - The list of filtered tasks to display.
 * @param {string} searchTerm - The search term used for filtering.
 */
function displayFilteredTasks(filteredTasks, searchTerm) {
    if (filteredTasks.length > 0) {
        filteredTasks.forEach((task) => insertTaskIntoDOM(task.task, task.originalIndex));
    } else {
        let taskLists = document.querySelectorAll(".task-list");
        taskLists.forEach(taskList => {
            taskList.innerHTML = `
                <div class="no-tasks">
                    No Tasks found for "<strong>${searchTerm}</strong>".
                </div>
            `;
        });
    }
}


/**
 * Generates the HTML for editing a task in a popup.
 * @param {Object} task - The task object containing details of the task to edit.
 * @returns {string} The HTML string for the task editing popup.
 */
function generateTaskEditHTML(task) {
    return `
        <div class="popup-header">
            <div id="taskBadge">${generateTaskBadge(task.badge)}</div>
            <button class="close-btn" type="button" onclick="closeTaskPopup()">&#x2715</button>
        </div>
        <form id="editTaskForm" class="edit-task-form">
            <div class="form-group">
                <label for="editTaskTitle">Title</label>
                <input type="text" id="editTaskTitle" value="${task.title}" />
            </div>
            <div class="form-group">
                <label for="editTaskDescription">Description</label>
                <textarea id="editTaskDescription">${task.description}</textarea>
            </div>
            <div class="form-group">
                <label for="editTaskDueDate">Due Date</label>
                <input type="date" id="editTaskDueDate" value="${task.dueDate}" />
            </div>
            <div class="form-group">
                <label>Priority</label>
                <div class="priority-buttons">
                    ${["urgent", "medium", "low"].map(priority => `
                        <button type="button" class="priority-btn ${task.priority === priority ? "active" : ""}" 
                                onclick="setPriority('${priority}')"
                                data-priority="${priority}">
                                <p>${capitalizeFirstLetter(priority)}</p>
                                <img src="./assets/icons/priority_${priority}.png" alt="${priority}">
                                </button>
                    `).join("")}
                </div>
            </div>
            <div class="form-group">
                <label>Assigned To</label>
                <div class="dropdown">
                    <button type="button" class="dropdown-toggle" onclick="toggleDropdown()">
                    Select contacts to assign
                    <img class="dropdown-icon" src="./assets/icons/addtask_arrowdown.png" alt="Arrow down">
                    </button>
                    <div class="selected-contacts" id="selectedContacts"></div>
                    <div class="dropdown-menu" id="assignedToList">
                         ${Object.entries(contacts)
                            .sort(([, a], [, b]) => a.name.localeCompare(b.name))
                            .map(([contactKey, contact]) => {
                            let fullName = contact.name.split(" ");
                            let firstName = fullName[0] || "";
                            let lastName = fullName[1] || "";
                            let initials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
                            let bgColor = contact.color || "#cccccc";
                                return ` 
                                    <div class="dropdown-item" onclick="toggleDropdownItem(this)">
                                        <div class="dd-name">
                                            <div class="profile-circle" style="background-color: ${bgColor};">${initials}</div>
                                            <p> ${contacts[contactKey].name}</p>
                                        </div>
                                        <input type="checkbox" value="${contactKey}" 
                                            ${task.assignedTo && task.assignedTo[contactKey] ? "checked" : ""} />
                                        <span class="checkmark"></span>
                                    </div>
                                `;
                        }).join("")}
                    </div>
                </div>
            </div>
            <div class="form-group">
                <label>Subtasks</label>
                <div class="subtask-input-container">
                    <input type="text" id="newSubtaskInput" placeholder="Add new subtask" maxlength="30"/>
                    <button id="addSubtaskButton">
                        <img src="./assets/icons/add.svg" alt="add subtask">
                    </button>
                    <div class="subtask-icons hidden" id="subtaskIcons">
                        <img class="confirm-img" id="cancelSubtask" src="./assets/icons/contact_cancel.png" alt="cancel add subtask" onclick="cancelSubtaskInput()" />
                        <div class="subtask-vertical-line"></div>
                        <img class="confirm-img" id="createSubtask" src="./assets/icons/contact_create.png" alt="add subtask" onclick="addSubtask(event)" />
                    </div>
                </div>
                <ul class="subtasks-list" id="subtasksList">
                </ul>
            </div>
        </form>
        <div class="form-actions">
            <button class="addTask" type="button" onclick="saveTaskChanges()">
            Ok
            <img src="./assets/icons/contact_create.png"></img>
            </button>
        </div>
    `;
}


/**
 * Updates the subtasks list for a task.
 * @param {Object} task - The task object containing subtasks.
 */
function updateSubtasksList(task) {
    let subtasksList = document.querySelector('.subtasks-list');
    subtasksList.innerHTML = Object.entries(task.subtasks).map(([subtaskId, subtask]) => `
        <li id="${subtaskId}" class="subtask-item">
            <div class="subtask-item-name">
                <img class="ul-bullet" src="./assets/icons/addtask_arrowdown.png" alt="Arrow right">
                <span>${subtask.name}</span>
            </div>
            <div class="subtask-actions">
                <img src="./assets/icons/contact_edit.png" alt="Edit" title="Edit" onclick="editSubtask('${subtaskId}')" />
                <span class="separator"></span>
                <img src="./assets/icons/contact_basket.png" alt="Delete" title="Delete" onclick="deleteSubtask('${subtaskId}')" />
            </div>
        </li>
    `).join("");
}


/**
 * Switches a dropdown toggle button to display a search input.
 * @param {HTMLElement} dropdownToggle - The dropdown toggle button element.
 */
function switchToSearchInput(dropdownToggle) {
    dropdownToggle.innerHTML = `
        <input type="text" id="dropdownSearchInput" placeholder="" oninput="filterDropdownItems()" maxlength="20" />
        <img class="dropdown-icon rotated" src="./assets/icons/addtask_arrowdown.png" alt="Arrow down">
    `;
    let searchInput = document.getElementById("dropdownSearchInput");
    searchInput.addEventListener("click", (event) => {
        event.stopPropagation();
    });
    searchInput.focus();
}


/**
 * Resets the dropdown toggle button to its default state.
 * @param {HTMLElement} dropdownToggle - The dropdown toggle button element.
 */
function resetToDropdownButton(dropdownToggle) {
    dropdownToggle.innerHTML = `
        Select contacts to assign
        <img class="dropdown-icon" src="./assets/icons/addtask_arrowdown.png" alt="Arrow down">
    `;
}

/**
 * Calculates the progress of subtasks for a given task.
 * Returns the count of completed and total subtasks.
 * 
 * @param {Object} subtasks - An object where the keys are subtask IDs and the values are subtask objects.
 * @returns {Object} An object containing the completed and total subtask counts.
 */
function calculateSubtaskProgress(subtasks) {
    let subtaskArray = Object.values(subtasks);
    if (!subtaskArray || subtaskArray.length === 0) return { completed: 0, total: 0 };
    let total = subtaskArray.length;
    let completed = subtaskArray.filter(subtask => subtask.completed === true).length;
    return { completed, total };
}


/**
 * Toggles the completion status of a subtask for a specific task.
 * Updates the task's subtasks and the corresponding UI elements.
 * 
 * @param {number} taskIndex - The index of the task in the tasks array.
 * @param {string} subtaskId - The ID of the subtask to toggle.
 */
function toggleSubtask(taskIndex, subtaskId) {
    let task = tasks[taskIndex];
    let subtask = task.task.subtasks[subtaskId];
    subtask.completed = !subtask.completed;
    updateSubtaskBar(taskIndex);
    updatePopupSubtasks(taskIndex);
}


/**
 * Updates the subtask progress bar in the task's UI.
 * It recalculates the progress and updates the width of the progress bar.
 * 
 * @param {number} taskIndex - The index of the task in the tasks array.
 */
function updateSubtaskBar(taskIndex) {
    let task = tasks[taskIndex];
    let subtasks = task.task.subtasks;
    let total = Object.keys(subtasks).length;
    let completed = Object.values(subtasks).filter(subtask => subtask.completed).length;
    let subtaskBar = document.querySelector(`#subtaskBar-${taskIndex}`);
    if (subtaskBar) {
        subtaskBar.querySelector(".pb-blue").style.width = `${(completed / total) * 100}%`;
        subtaskBar.querySelector("span").innerText = `${completed}/${total} Subtasks`;
    }
}


/**
 * Updates the list of subtasks displayed in the task popup.
 * It regenerates the HTML for the subtasks and updates the UI.
 * 
 * @param {number} taskIndex - The index of the task in the tasks array.
 */
function updatePopupSubtasks(taskIndex) {
    let task = tasks[taskIndex].task;
    let subtasksList = document.getElementById("subtasksList");
    if (subtasksList) {
        subtasksList.innerHTML = generateSubtasksHtml(task.subtasks, taskIndex);
    }
}


/**
 * Sets up the subtask input field by initializing UI elements and adding event listeners.
 */
function setupSubtaskInput() {
    let subtaskInput = document.getElementById("newSubtaskInput");
    let addIcon = document.getElementById("addSubtaskButton");
    let iconsContainer = document.getElementById("subtaskIcons");

    if (subtaskInput && addIcon && iconsContainer) {
        initializeSubtaskUI(addIcon, iconsContainer);
        addSubtaskInputListeners(subtaskInput, addIcon, iconsContainer);
    }
}


/**
 * Initializes the subtask input UI by showing the add icon and hiding the icons container.
 * @param {Element} addIcon The add subtask button element.
 * @param {Element} iconsContainer The container for subtask icons.
 */
function initializeSubtaskUI(addIcon, iconsContainer) {
    addIcon.classList.remove("hidden");
    iconsContainer.classList.add("hidden");
}


/**
 * Adds event listeners for the subtask input field to handle focus, blur, and keydown events.
 * @param {Element} subtaskInput The input field for entering new subtasks.
 * @param {Element} addIcon The add subtask button element.
 * @param {Element} iconsContainer The container for subtask icons.
 */
function addSubtaskInputListeners(subtaskInput, addIcon, iconsContainer) {
    subtaskInput.addEventListener("focus", () => toggleSubtaskIcons(addIcon, iconsContainer, true));
    subtaskInput.addEventListener("blur", () => {
        if (!subtaskInput.value.trim()) {
            toggleSubtaskIcons(addIcon, iconsContainer, false);
        }
    });
    subtaskInput.addEventListener("keydown", (event) => handleSubtaskInputKeydown(event));
}


/**
 * Toggles the visibility of the add icon and icons container based on the focus state of the input field.
 * @param {Element} addIcon The add subtask button element.
 * @param {Element} iconsContainer The container for subtask icons.
 * @param {boolean} isFocused Whether the input field is focused or not.
 */
function toggleSubtaskIcons(addIcon, iconsContainer, isFocused) {
    addIcon.classList.toggle("hidden", isFocused);
    iconsContainer.classList.toggle("hidden", !isFocused);
}


/**
 * Handles the keydown event for the subtask input field. If the Enter key is pressed, a new subtask is added.
 * @param {Event} event The keydown event.
 */
function handleSubtaskInputKeydown(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        addSubtask(event);
    }
}


/**
 * Cancels the subtask input by clearing the input field and resetting the UI elements.
 */
function cancelSubtaskInput() {
    let newSubtaskInput = document.getElementById("newSubtaskInput");
    newSubtaskInput.value = "";
    document.getElementById("addSubtaskButton").classList.remove("hidden");
    document.getElementById("subtaskIcons").classList.add("hidden");
}


/**
 * Adds a new subtask to the task if it meets the requirements.
 * @param {Event} event The submit event.
 */
function addSubtask(event) {
    event.preventDefault();
    let task = tasks[currentTaskIndex]?.task;
    let subtaskName = getSubtaskName();
    if (subtaskName === "") return;
        addNewSubtask(task, subtaskName);
        updateSubtasksList(task);
        clearSubtaskInput();
        unfocusInput();
}


/**
 * Retrieves the name of the subtask from the input field.
 * @returns {string} The subtask name.
 */
function getSubtaskName() {
    return document.getElementById('newSubtaskInput').value.trim();
}


/**
 * Adds a new subtask to the task with the given name.
 * @param {Object} task The task object.
 * @param {string} subtaskName The name of the subtask.
 */
function addNewSubtask(task, subtaskName) {
    task.subtasks = task.subtasks || {};
    let subtaskId = `subtask-${subtaskCounter++}`;
    task.subtasks[subtaskId] = { name: subtaskName, completed: false };
}


/**
 * Clears the subtask input field.
 */
function clearSubtaskInput() {
    document.getElementById('newSubtaskInput').value = "";
}


/**
 * Unfocuses the subtask input field.
 */
function unfocusInput() {
    document.getElementById('newSubtaskInput').blur();
}


/**
 * Edits an existing subtask by setting up the subtask input for editing.
 * @param {string} subtaskId The ID of the subtask to edit.
 */
function editSubtask(subtaskId) {
    let task = tasks[currentTaskIndex].task;
    let subtask = task.subtasks[subtaskId];
    let subtaskElement = document.getElementById(subtaskId);
    if (!subtask || !subtaskElement) return;
    setupSubtaskEditUI(subtask, subtaskElement, task);
}


/**
 * Sets up the UI for editing a subtask.
 * @param {Object} subtask The subtask object to edit.
 * @param {Element} subtaskElement The DOM element representing the subtask.
 * @param {Object} task The task object containing the subtask.
 */
function setupSubtaskEditUI(subtask, subtaskElement, task) {
    let inputField = createInputField(subtask);
    let checkIcon = createCheckIcon();
    subtaskElement.innerHTML = '';
    subtaskElement.appendChild(inputField);
    subtaskElement.appendChild(checkIcon);
    checkIcon.addEventListener('click', function () {
        handleSubtaskSave(inputField, subtask, task);
    });
}


/**
 * Saves the changes made to a subtask.
 * @param {Element} inputField The input field with the new subtask name.
 * @param {Object} subtask The subtask object to update.
 * @param {Object} task The task object containing the subtask.
 */
function handleSubtaskSave(inputField, subtask, task) {
    let newSubtaskName = inputField.value.trim();
    if (newSubtaskName) {
        subtask.name = newSubtaskName;
        updateSubtasksList(task);
    }
}


/**
 * Creates an input field for editing a subtask.
 * @param {Object} subtask The subtask object.
 * @returns {Element} The input field element.
 */
function createInputField(subtask){
    let inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.value = subtask.name;
    inputField.maxLength = '30';
    return inputField;
}


/**
 * Deletes a subtask from the task.
 * @param {string} subtaskId The ID of the subtask to delete.
 */
function deleteSubtask(subtaskId) {
    let task = tasks[currentTaskIndex].task;
    if (!task.subtasks[subtaskId]) return;
    delete task.subtasks[subtaskId];
    updateSubtasksList(task);
}


/**
 * Retrieves the current subtasks from the DOM and returns them as an object.
 * @returns {Object} An object containing the subtasks with their names and completion status.
 */
function getCurrentSubtasks() {
    let subtasksList = document.querySelectorAll(".subtasks-list .subtask-item");
    let subtasks = {};
    subtasksList.forEach((subtaskElement, index) => {
        let subtaskName = subtaskElement.querySelector(".subtask-item-name span").textContent.trim();
        if (subtaskName) {
            subtasks[index] = { name: subtaskName, completed: false };
        }
    });
    return subtasks;
}


/**
 * Creates a check icon element.
 * @returns {HTMLElement} The check icon element.
 */
function createCheckIcon() {
    let checkIcon = document.createElement('img');
    checkIcon.src = './assets/icons/contact_create.png';
    checkIcon.alt = 'Bestätigen';
    checkIcon.className = 'confirm-img';
    return checkIcon;
}


/**
 * Creates a profile circle element for the given contact. The profile circle will display the initials of the contact 
 * and be styled with the contact's color.
 * 
 * @param {Object} contact The contact object containing the contact's details.
 * @param {string} contact.name The name of the contact. The initials will be derived from this.
 * @param {string} contact.color The background color of the profile circle.
 * @returns {HTMLElement} A div element representing the profile circle with the contact's initials and color.
 * @throws {Error} If the contact object is invalid or missing required properties, an error is logged to the console.
 */
function createProfileCircle(contact) {
    if (!contact || !contact.name || !contact.color) {
        console.error("Invalid contact data:", contact);
        return document.createElement("div");
    }
    let initials = contact.name.split(" ").map(name => name[0]).join("");
    let profileCircle = document.createElement("div");
    profileCircle.classList.add("profile-circle");
    profileCircle.style.backgroundColor = contact.color;
    profileCircle.textContent = initials;
    return profileCircle;
}