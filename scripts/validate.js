/**
 * Validates the task form and submits it if all fields are valid.
 * @param {Event} event - The submit event to prevent if validation fails.
 */
function validateFormular(event) {
    event.preventDefault();
    validateTitle(event)
    validateDate(event)
    validateCategory(event)

    if (validateIsOk.every(value => value === true)) {
        submitForm(event)
    }
}

/**
 * Validates the title field.
 * @param {Event} event - The event triggered during form submission.
 */
function validateTitle(event) {
    errorTitle.innerHTML = '';

    if (!title.value) {
        errorTitle.innerHTML = 'This field is required'
        title.style.border = "2px solid #FF8190"
        event.preventDefault();
        validateIsOk[0] = false
        return false
    }
    title.style.border = "2px solid #D1D1D1"
    validateIsOk[0] = true;
}

/**
 * Validates the date field.
 * @param {Event} event - The event triggered during form submission.
 */
function validateDate(event) {
    errorDate.innerHTML = '';

    if (!date.value) {
        errorDate.innerHTML = 'This field is required'
        date.style.border = "2px solid #FF8190"
        event.preventDefault();
        validateIsOk[1] = false
        return false
    }
    date.style.border = "2px solid #D1D1D1"
    validateIsOk[1] = true;
}

/**
 * Validates the category field.
 * @param {Event} event - The event triggered during form submission.
 */
function validateCategory(event) {
    errorCategory.innerHTML = '';

    if (!category.value) {
        errorCategory.innerHTML = 'This field is required'
        category.style.border = "2px solid #FF8190"
        event.preventDefault();
        validateIsOk[2] = false
        return false
    }
    category.style.border = "2px solid #D1D1D1"
    validateIsOk[2] = true;
}

/**
 * Retrieves form elements by their respective IDs.
 */
function getElementsByIds() {
    title = document.getElementById('title');
    errorTitle = document.getElementById('error-title');

    date = document.getElementById('due-date');
    errorDate = document.getElementById('error-date');

    category = document.getElementById('category');
    errorCategory = document.getElementById('error-category');
}

/**
 * Collects and returns the basic task form data including title, description, due date, priority, and category.
 * @returns {Object} The basic task data including title, description, due date, priority, and category.
 */
function getFormData() {
    let priority = document.querySelector('input[name="priority"]:checked');

    return {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        dueDate: document.getElementById('due-date').value,
        priority: priority === null ? "medium" : priority.value,
        category: document.getElementById('category').value
    };
}

/**
 * Collects and returns the data of the selected contacts from the contact list.
 * @returns {Array} An array of contact objects with name properties.
 */
function getContactsData() {
    let contacts = [];
    document.querySelectorAll('#contactListAssigned .selected .select-position').forEach(item => {
        let contact = {
            name: item.innerText
        };
        contacts.push(contact);
    });
    return contacts;
}

/**
 * Collects and returns the subtasks data, including the subtask title and completion status.
 * @returns {Array} An array of subtask objects with title and completed properties.
 */
function getSubtasksData() {
    let subtaskTexts = document.querySelectorAll('#addedSubtask .subtask-text');
    let subtasks = [];

    subtaskTexts.forEach(function (subtask) {
        subtasks.push({
            title: subtask.textContent,
            completed: false
        });
    });

    return subtasks;
}

/**
 * Collects and returns all task data, including form data, contacts, and subtasks.
 * @returns {Object} The task data including title, description, contacts, due date, priority, category, and subtasks.
 */
function getAddTaskData() {
    let formData = getFormData();
    let contacts = getContactsData();
    let subtasks = getSubtasksData();

    return {
        title: formData.title,
        description: formData.description,
        contacts: contacts,
        dueDate: formData.dueDate,
        priority: formData.priority,
        category: formData.category,
        subtasks: subtasks
    };
}

/**
 * Changes the color of the date input field based on its value.
 */
function changeDateColor() {
    date = document.getElementById('due-date');

    if (date.value) {
        date.style.color = 'black';
    } else {
        date.style.color = '';
    }

    const dateInput = document.getElementById("due-date");
    const maxDate = new Date("2099-12-31");
    const inputDate = new Date(dateInput.value);

    if (inputDate > maxDate) {
        document.getElementById("error-date").innerHTML = "maximum date 2099"
        dateInput.value = "";
    }
}