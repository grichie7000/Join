let categoryValue = '';
let activePicker = false;

let newTask = {
    "cat": "",
    "user": [],
    "type": "todo",
    "descr": "",
    "date": "",
    "prio": "Medium",
    "subtasks": [],
    "title": ""
};


/**
 * edit task start function
 * @param {*} firebaseId 
 */
function editTask(firebaseId) {
    showEditTask(firebaseId, 'editTask');
    loadTaskInEditCard(editedTask)
}


/**
 * load the edit task in the edit card
 */
async function loadTaskInEditCard() {
    let prio = editedTask[0].prio.split(' ').map(name => name.toLowerCase()).join('');
    document.getElementById("title").value = editedTask[0].title;
    document.getElementById("description").value = editedTask[0].descr;
    document.getElementById("due-date").value = editedTask[0].date;
    document.getElementById("category").value = editedTask[0].cat;
    document.getElementById('dropdown-cat-selected').innerText = editedTask[0].cat
    document.querySelectorAll(".priority button").forEach(button => button.classList.remove("selected"));
    document.getElementById(prio).classList.add('selected');
    await renderTaskAvatar(editedTask[0])
    await assignedUsers(editedTask[0].user)
    await updateSubtask()
}


/**
 * load the new date in the edited task
 * @param {*} dateInput 
 */
function handleEditDate(dateInput) {
    let selectedDate = dateInput.value;
    editedTask[0].date = selectedDate;
}


/**
 * select the category for the edited task
 * @param {*} cat 
 */
async function selectEditCategory(cat) {
    let selectCategoryText = document.getElementById('dropdown-cat-selected')
    if (cat == 'Technical Task') {
        categoryValue = 'Technical Task';
        selectCategoryText.innerText = 'Technical Task';
    } else if (cat == 'User Story') {
        categoryValue = 'User Story';
        selectCategoryText.innerText = 'User Story';
    }
    editedTask[0].cat = categoryValue;
    await toggleCategoryDropdown()
}


/**
 * show the error message
 * @param {*} fieldId 
 * @param {*} message 
 */
function showError(fieldId, message) {
    const errorInput = document.getElementById(fieldId)
    const errorDiv = document.getElementById('error-div-' + fieldId);
    if (errorDiv !== null) {
        errorDiv.classList.remove('d-none');
        errorDiv.textContent = message;
        errorInput.classList.add('error')
    }
}


/**
 * fetch the users from the database
 * @param {*} selectedUser 
 */
async function assignedUsers(selectedUser) {
    try {
        const response = await fetch(BASE_URL + "users/.json");
        let user = await response.json();
        usersArray = Object.entries(user).map(([key, user]) => ({
            ...user,
        }));
        await assignedToTemplate(usersArray, selectedUser)
    } catch (error) {
        console.error('Fehler:', error);
    }
}


/**
 * load the assigned user in the edit card
 * @param {*} usersArray 
 * @param {*} selectedUser 
 */
function assignedToTemplate(usersArray, selectedUser) {
    let dropdownOptions = document.getElementById("dropdown-options");
    dropdownOptions.innerHTML = "";
    for (let i = 0; i < usersArray.length; i++) {
        dropdownOptions.innerHTML += renderEditAssignedUser(usersArray[i], selectedUser);
    }
}


/**
 * update function for the subtasks
 * @returns 
 */
function updateSubtask() {
    let messagesContainer = document.getElementById('messages-container');
    messagesContainer.innerHTML = "";
    if (!editedTask[0].subtasks || editedTask[0].subtasks.length === 0) return '';
    for (let i = 0; i < editedTask[0].subtasks.length; i++) {
        messagesContainer.innerHTML += renderEditSubtasks(i, editedTask[0]);
    }
}


/**
 * edit the subtask
 * @param {*} subtaskId 
 */
function editEditSubtask(subtaskId) {
    const subtask = editedTask[0].subtasks[subtaskId].title;
    let editInput = document.getElementById(`validation-messages-div-${subtaskId}`);
    currentSubtaskId = subtaskId;
    editInput.innerHTML = renderEditTaskSubtask(subtaskId);
    let editInputSubtask = document.getElementById(`edit-input-${subtaskId}`);
    editInputSubtask.value = subtask;
    editInputSubtask.focus();
    editInputSubtask.addEventListener('blur', function() {
        if (editInputSubtask.value.trim() === '') {
            delEditSubtask(subtaskId)
            currentSubtaskId = null;
        }
    });
}


/**
 * delete the subtask
 * @param {*} subtaskId 
 */
function delEditSubtask(subtaskId) {
    editedTask[0].subtasks.splice(subtaskId, 1);
    updateSubtask();
}


/**
 * save the edit subtask
 * @param {*} subtaskId 
 */
async function saveEditTask(subtaskId) {
    let newValue = document.getElementById(`edit-input-${subtaskId}`).value;
    if (validateName(newValue)) {
        editedTask[0].subtasks[subtaskId].title = newValue;
        await loadTaskInEditCard()
    }
}


/**
 * show the edit subtask in edit task
 * @param {*} newSubtaskdiv 
 */
function newSubtask(newSubtaskdiv) {
    const input = document.getElementById('subtask-input');
    input.focus();

    let closeAndCheck = document.getElementById('close-check');
    newSubtaskdiv.classList.add('d-none');
    closeAndCheck.classList.remove('d-none');
}


/**
 * render the edit Task User
 * @returns 
 */
function renderEditAvatar(task) {
    let avatarContainer = document.getElementById("avatar-container"+ task.firebaseId);
    avatarContainer.innerHTML = "";
    if (!task.user || task.user.length == 0) return
    if(task.user.length > 6) {
        for (let i=0; i <  6 ; i++) {
            avatarContainer.innerHTML += rendererEditAvatar(task.user[i])
        }
        let overflowValue = task.user.length - 6;
        avatarContainer.innerHTML +=  `<span class="avatar-overflow" style="background-color: #505050">${overflowValue}<img src="../assets/icons/add-white.svg"><span>`
    }else if (task.user.length > 0){
        let userLength = task.user.length;
        for (let i=0; i < userLength; i++) {
            avatarContainer.innerHTML += rendererEditAvatar(task.user[i])
        }
    }
}


/**
 * close the subtask
 */
function closeSubtask() {
    let closeAndCheck = document.getElementById('close-check');
    let newSubtaskdiv = document.getElementById('new-subtask');
    const input = document.getElementById('subtask-input');
    newSubtaskdiv.classList.remove('d-none');
    closeAndCheck.classList.add('d-none');
    input.value = "";
}


/**
 * add the subtask in the edit task
 */
function addEditSubtask() {
    let subtaskInput = document.getElementById('subtask-input').value;
    let isValidSubtask = true;

    if (!validateName(subtaskInput)) {
        isValidSubtask = false;
    }

    if (isValidSubtask) {
        if (!editedTask[0].subtasks) {
            editedTask[0].subtasks = [];
        }
        editedTask[0].subtasks.push({
            "completed": false,
            "title": subtaskInput
        });
        closeSubtask();
        updateSubtask();
    }
}


/**
 * clickbtn function for the edit task
 */
async function clickUpdateTask() {
    editedTask[0].title = document.getElementById('title').value;
    editedTask[0].descr = document.getElementById('description').value;
    await updateTask(editedTask[0]);
    await showEditTask(editedTask[0].firebaseId, 'bigCard')
}


/**
 * select the priority for the edited task
 * @param {*} priority 
 */
function selectEditPriority(priority) {
    const buttons = document.querySelectorAll(".prio");
    buttons.forEach(button => button.classList.remove("selected"));
    document.querySelector(`.priority .${priority}`).classList.add("selected");
    let capitalizedPriority = priority.split(' ').map(name => name.charAt(0).toUpperCase() + name.slice(1)).join(' ');
    editedTask[0].prio = capitalizedPriority;
}


/**
 * toggler for the users in the edit task
 * @param {*} avatarId 
 * @param {*} checkbox 
 */
function toggleEditAvatar(avatarId, checkbox) {
    let user = usersArray.filter(u => u.id == avatarId);
    if(!editedTask[0].user) editedTask[0].user = []
    if (checkbox.checked) {
        editedTask[0].user.push({
            bgcolor: user[0].color,
            name: user[0].name,
            id: user[0].id
        });
    } else {
        editedTask[0].user = editedTask[0].user.filter(u => u.name !== user[0].name);
    }
    renderTaskAvatar(editedTask[0]);
}

let currentSubtaskId = [];


/**
 * toggled User Dropdown in add-task.html and popups in board.html
 */
function toggleDropdown() {
    let dropdownOptions = document.getElementById("dropdown-options");
    let dropdownArrow = document.getElementById("dropdown-arrow");
    dropdownOptions.classList.toggle("show");
    if (dropdownOptions.classList.contains("show")) {
        dropdownArrow.innerHTML = `<img src="../assets/icons/arrow-up-dropdown.svg">`;
    } else {
        dropdownArrow.innerHTML = `<img src="../assets/icons/arrow-dropdown.svg">`;
    }
}


/**
 * toggled Category Dropdown in add-task.html and popups in board.html
 */
function toggleCategoryDropdown() {
    let dropdownOptions = document.getElementById("dropdown-cat-options");
    let dropdownArrow = document.getElementById("dropdown-cat-arrow");
    dropdownOptions.classList.toggle("show");
    if (dropdownOptions.classList.contains("show")) {
        dropdownArrow.innerHTML = `<img src="../assets/icons/arrow-up-dropdown.svg">`;
    } else {
        dropdownArrow.innerHTML = `<img src="../assets/icons/arrow-dropdown.svg">`;
    }
}


/**
 * close all dropdown
 */
function closeDropdown() {
    let dropdownCatOptions = document.getElementById("dropdown-cat-options");
    let dropdownOptions = document.getElementById("dropdown-options");
    let dropdownArrow = document.querySelectorAll(".dropdown-arrow");
    dropdownOptions.classList.remove("show");
    dropdownCatOptions.classList.remove("show");
    dropdownArrow.forEach(arrow => {
        arrow.innerHTML = `<img src="../assets/icons/arrow-dropdown.svg">`;
    });
} 


/**
 * load the add-task.html template
 */
function addTaskTemplate() {
    const container = document.getElementById('addtask-tem');
    const template = getAddTask(taskType); 
    container.innerHTML = template; 
}


/**
 * active the new Subtask input field and focus on it
 * @param {*} newSubtaskdiv 
 */
function newSubtask(newSubtaskdiv) {
    const input = document.getElementById('subtask-input');
    input.focus();

    let closeAndCheck = document.getElementById('close-check');
    newSubtaskdiv.classList.add('d-none');
    closeAndCheck.classList.remove('d-none');
}


/**
 * close the new Subtask input field and show the add button
 */
function closeSubtask() {
    let closeAndCheck = document.getElementById('close-check');
    let newSubtaskdiv = document.getElementById('new-subtask');
    const input = document.getElementById('subtask-input');
    newSubtaskdiv.classList.remove('d-none');
    closeAndCheck.classList.add('d-none');
    input.value = "";
}


/**
 * focus the new Subtask input field and hide the add button
 */
function focusSubtask() {
    let closeAndCheck = document.getElementById('close-check');
    let newSubtaskdiv = document.getElementById('new-subtask');
    newSubtaskdiv.classList.add('d-none');
    closeAndCheck.classList.remove('d-none');
}


/**
 * hover the btn for the edited subtask
 * @param {*} subtaskId 
 */
function handleHover(subtaskId) {
    let subtaskBtnContainer = document.getElementById('subtask-btn-'+ subtaskId);
    subtaskBtnContainer.classList.remove('d-none');
}


/**
 * end hover the btn for the edited subtask
 * @param {*} subtaskId 
 */
function handleHoverEnd(subtaskId) {
    let subtaskBtnContainer = document.getElementById('subtask-btn-'+ subtaskId);
    subtaskBtnContainer.classList.add('d-none');
}


/**
 * show the date picker in add-task.html and board.html
 */
function showPicker() {
    const dateInput = document.getElementById('due-date');
    const today = new Date().toISOString().split('T')[0];
    if(activePicker == false) {
        dateInput.min = today;
        dateInput.showPicker();
        activePicker = true;
    } else {
        activePicker = false;
    }

}


/**
 * validate the name of the task
 * @param {*} name 
 * @returns 
 */
function validateName(name) {
    return name.trim().length >= 1;
}


/**
 * validate the date of the task
 * @param {*} date 
 * @returns 
 */
function validateDate(date) {
    const today = new Date().toISOString().split('T')[0];
    if (date < today) {
        return false;
    }
    return true;
}


/**
 * validate the category of the task
 * @param {*} cat 
 * @returns 
 */
function validateCat(cat) {
    if(cat == "") {
        return false;
    }
    return true;
}


/**
 * update the subtask display in add-task.html and board.html
 */
function updateSubtaskDisplay() {
    let messagesContainer = document.getElementById('messages-container');
    messagesContainer.innerHTML = "";
    for (let i = 0; i < newTask.subtasks.length; i++) {
        messagesContainer.innerHTML += renderSubtasks(i);
    }
}


/**
 * delete the subtask in add-task.html and board.html
 * @param {*} subtaskId 
 */
function delSubtask(subtaskId) {
    newTask.subtasks.splice(subtaskId, 1);
    updateSubtaskDisplay();
}


/**
 * edit the subtask in add-task.html and board.html
 * @param {*} subtaskId 
 */
function editSubtask(subtaskId) {
    const subtask = newTask.subtasks[subtaskId].title;
    let editInput = document.getElementById(`validation-messages-div-${subtaskId}`);
    editInput.innerHTML = renderEditSubtask(subtaskId);
    let editInputSubtask = document.getElementById(`edit-input-${subtaskId}`);
    editInputSubtask.value = subtask;
    editInputSubtask.focus();
    editInputSubtask.addEventListener('blur', function() {
        if (editInputSubtask.value.trim() === '') {
            delSubtask(subtaskId)
            currentSubtaskId = null;
        }
    });
}


/**
 * save the edited subtask in add-task.html
 * @param {*} subtaskId 
 */
function saveEdit(subtaskId) {
    let newValue = document.getElementById(`edit-input-${subtaskId}`).value;
    if (validateName(newValue)) {
        newTask.subtasks[subtaskId].title = newValue;
        updateSubtaskDisplay();
    }else {
        delSubtask(subtaskId);
    }
}


/**
 * save the new date in add-task.html
 * @param {*} dateInput 
 */
function handleDate(dateInput) {
    let selectedDate = dateInput.value;
    if (validateDate(selectedDate)) { 
        newTask.date = selectedDate;
    }
}


/**
 * validate the subtask in add-task.html
 * @param {*} title 
 * @param {*} date 
 * @param {*} isValid 
 * @returns 
 */
function subValidate(title, date, isValid) {
    if (!validateName(title)) {
        showError('title', 'This field is required');
        isValid = false;
    }else {
        newTask.title = title;
    }

    if (!validateDate(date)) {
        showError('due-date', 'This field is required');
        isValid = false;
    }

    if (!validateCat(categoryValue)) {
        showError('category', 'Please select a category for your task');
        isValid = false;
    }else {
        newTask.cat = categoryValue;
    }

    return isValid;
}


/**
 * toggle the avatar-checkbox in add-task.html and board.html
 * @param {*} avatarId 
 * @param {*} checkbox 
 */
function toggleAvatar(avatarId, checkbox) {
    let user = usersArray.filter(u => u.id == avatarId);
    if (checkbox.checked) {
        newTask.user.push({ bgcolor: user[0].color, name: user[0].name, id: user[0].id });
    } else {
        newTask.user = newTask.user.filter(u => u.name !== user[0].name);
    }
    renderAvatar();
}


/**
 * select the priority in add-task.html and board.html
 * @param {*} priority 
 */
function selectPriority(priority) {
    const buttons = document.querySelectorAll(".prio");
    buttons.forEach(button => button.classList.remove("selected"));
    document.querySelector(`.priority .${priority}`).classList.add("selected");
    let capitalizedPriority = priority.split(' ').map(name => name.charAt(0).toUpperCase() + name.slice(1)).join(' ');
    newTask.prio = capitalizedPriority;
}


/**
 * search the users in add-task.html and board.html
 */
async function getAssignedUsers() {
    try {
        const response = await fetch(BASE_URL + "users/.json");
        let user = await response.json();
        usersArray = Object.entries(user).map(([key, user]) => ({
            ...user,
        }));
        await addAssignedToTemplate(usersArray)
    } catch (error) {
        console.error('Fehler:', error);
    }
}


/**
 * render the user in add-task.html and board.html
 * @param {*} usersArray 
 */
function addAssignedToTemplate(usersArray) {
    let dropdownOptions = document.getElementById("dropdown-options");
    dropdownOptions.innerHTML = "";
    for (let i = 0; i < usersArray.length; i++) {
        dropdownOptions.innerHTML += renderAssignedUser(usersArray[i]);    
    }
}


/**
 * save the new task in add-task.html
 */
function addSubtask() {
    let subtaskInput = document.getElementById('subtask-input').value;
    let isValidSubtask = true;
    if (!validateName(subtaskInput)) {
        isValidSubtask = false;
    }
    if (isValidSubtask) {
        if (!newTask.subtasks) {
            newTask.subtasks = [];
        }
        newTask.subtasks.push({
            "completed": false,
            "title": subtaskInput
        });
        closeSubtask();
        updateSubtaskDisplay();
    }
}


/**
 * clear the error messages in add-task.html and board.html
 */
function clearErrorMessages() {
    const errorDiv = document.querySelectorAll('.error-message');
    const errorInput = document.querySelectorAll('.error');
    errorDiv.forEach(error => {
        error.classList.add('d-none');    
    });
    errorInput.forEach(error => {
        error.classList.remove('error');    
    });
}


/**
 * select the category in add-task.html and board.html
 * @param {*} cat 
 */
function selectCategory(cat) {
    let selectCategoryText = document.getElementById('dropdown-cat-selected')
    if (cat == 'Technical Task') {
        categoryValue = 'Technical Task';
        selectCategoryText.innerText = 'Technical Task';
    } else if (cat == 'User Story') {
        categoryValue = 'User Story';
        selectCategoryText.innerText = 'User Story';
    }
    toggleCategoryDropdown()
}


/**
 * the last check validation in add-task.html and board.html
 * @returns 
 */
function lastValidate() {
    let title = document.getElementById("title").value;
    let date = newTask.date;
    let isValid = true;

    clearErrorMessages();

    return subValidate(title, date, isValid)
}


/**
 * render the Avatar for max 6 users
 * @returns 
 */
function renderAvatar() {
    let userLength;
    let overflowValue;
    let avatarContainer = document.getElementById("avatar-container");
    avatarContainer.innerHTML = "";
    if(newTask.user.length > 6) {
        for (let i=0; i <  6 ; i++) {
            avatarContainer.innerHTML += rendererAvatar(newTask.user[i])
        }
        overflowValue = newTask.user.length - 6;
        avatarContainer.innerHTML +=  `<span class="avatar-overflow" style="background-color: #505050">${overflowValue}<img src="../assets/icons/add-white.svg"><span>`
    }else if (newTask.user.length > 0){
        userLength = newTask.user.length;
        for (let i=0; i < userLength; i++) {
            avatarContainer.innerHTML += rendererAvatar(newTask.user[i])
        }
    }else {
        avatarContainer.innerHTML = '';
        return;
    }
}