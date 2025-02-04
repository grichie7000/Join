/**
 * render function for add task
 * @param {*} type 
 * @returns 
 */
function getAddTask(type) {
    return `
    <main class="main-content" onclick="event.stopPropagation(); closeDropdown();">
        <div class="main-title d-flex-sb-c">
            <h1>Add Task</h1>
            <div class="btn d-flex-c-c d-none" id="popup-btn" onclick="closePopOverlay()">
                <img src="../assets/icons/close.svg" alt="close">
            </div>
        </div>
        <section class="task-form">
            <div class="form-left">
                <p>Title<span class="required">*</span></p>
                <div>
                    <input class="input-text" type="text" id="title" name="title" placeholder="Enter a title">
                    <div class="error-message" id="error-div-title"> </div>
                </div>

                <p>Description</p>
                <textarea id="description" name="description" placeholder="Enter a Description"></textarea>

                <p>Assigned to</p>
                <div class="dropdown" id="assigned-to" onclick="event.stopPropagation(); closeDropdown();">
                    <div class="dropdown-header" onclick="event.stopPropagation(); toggleDropdown();">
                        <span id="dropdown-selected">Select contacts to assign</span>
                        <span class="dropdown-arrow" id="dropdown-arrow">
                            <img src="../assets/icons/arrow-dropdown.svg">
                        </span>
                    </div>
                    <div class="dropdown-options" id="dropdown-options" onclick="event.stopPropagation();">
                    </div>
                </div>
                <div id="avatar-container">
                    
                </div>
            </div>

            <div class="divider_mid"></div>

            <div class="form-right">
                <p>Date<span class="required">*</span></p>
                <div>
                    <div class="input-date-container">
                        <input class="input-text" type="date" id="due-date" name="due_date" onchange="handleDate(this)">
                        <div class="calendar-icon" onclick="showPicker()"></div>
                    </div>
                    <div class="error-message" id="error-div-due-date"> </div>
                </div>
                <p>Prio</p>
                <div class="priority">
                    <button type="button" class="prio urgent" id="urgent" onclick="selectPriority('urgent')">
                        <p>Urgent</p>
                        <img id="urgent-img" src="../assets/icons/urgent.svg">
                    </button>
                    <button type="button" class="prio medium selected" id="medium" onclick="selectPriority('medium')">
                        <p>Medium</p>
                        <img id="medium-img" src="../assets/icons/medium.svg">
                    </button>
                    <button type="button" class="prio low" id="low" onclick="selectPriority('low')">
                        <p>Low</p>
                        <img id="low-img" src="../assets/icons/low.svg">
                    </button>
                </div>

                <p>Category<span class="required">*</span></p>
                <div>
                    <div class="dropdown" id="category" onclick="event.stopPropagation(); toggleCategoryDropdown();">
                        <div class="dropdown-header" onclick="event.stopPropagation(); toggleCategoryDropdown();">
                            <span id="dropdown-cat-selected">Select task category</span>
                            <span class="dropdown-arrow" id="dropdown-cat-arrow">
                                <img src="../assets/icons/arrow-dropdown.svg">
                            </span>
                        </div>
                        <div class="dropdown-options" id="dropdown-cat-options" onclick="event.stopPropagation();">
                            <div class="dropdown-item btn" onclick="selectCategory('Technical Task'); closeDropdown();">
                                <p>Technical Task</p>
                            </div>
                            <div class="dropdown-item btn" onclick="selectCategory('User Story'); closeDropdown();">
                                <p>User Story</p>
                            </div>
                        </div>
                    </div>
                    <div class="error-message" id="error-div-category"></div>
                </div>

                <p>Subtasks</p>
                <div class="subtasks">
                    <div class="subtask-input-container">
                        <input id="subtask-input" maxlength="100" class="input-text" placeholder="Add new subtask" onfocus="focusSubtask()"/>
                        <div id="new-subtask" onclick="newSubtask(this)">
                            <img src="../assets/icons/add.svg" alt="plus_icon"/>
                        </div>                        
                        <div id="close-check" class="btn-div-sub d-none">
                            <img onclick="closeSubtask()" class="sub-btn" src="../assets/icons/close.svg" alt="close"/>
                            <div class="divider-input"></div>
                            <img onclick="addSubtask()" class="sub-btn" src="../assets/icons/check.svg" alt="check"/>
                        </div>
                    </div>
                    <div id="messages-container" class="messages-container">
                    
                    </div>
                </div>
            </div>
        </section>
        <div class="form-actions">
            <div class="required-message">
                <p><span class="required">*</span>This field is required</p>
            </div>
            <div>
                <button class="btn-clear btn-cre-cle" onclick="clearForm()">Clear âœ•</button>
                <button class="btn-create btn-cre-cle" onclick="createTask('${type}')">Create Task âœ”</button>
            </div>
        </div>
    </main>`;
}


/**
 * render users in the dropdown in add task
 * @param {*} assigned 
 * @returns 
 */
function renderAssignedUser(assigned) {
    let initials = assigned.name.split(' ').map(name => name.charAt(0).toUpperCase()).join('');
    let capitalizedUserName = assigned.name.split(' ').map(name => name.charAt(0).toUpperCase() + name.slice(1)).join(' ');
    return `                        
        <div class="dropdown-item">
            <span class="avatar color" style="background-color: ${assigned.color}">${initials}</span>
            <p>${capitalizedUserName}</p>
            <input class="icon" type="checkbox" id="${assigned.id}" name="assigned_to" value="0" onclick="event.stopPropagation(); toggleAvatar(${assigned.id}, this)">
        </div>
    `;
}


/**
 * render the avatar of the user
 */
function rendererAvatar(user) {   
    let initials = user.name.split(' ').map(name => name.charAt(0).toUpperCase()).join('');
    return `<span class="avatar-overflow" style="background-color:${user.bgcolor}">
            ${initials}
        </span>`;

}


/**
 * render subtasks in the add task
 * @param {*} id 
 * @returns 
 */
function renderSubtasks(id) {
    return `<div class="validation" id="validation-messages-div-${id}" >
                        <div class="d-flex-sb-c validation-messages"onmouseover="handleHover(${id}, this)" onmouseout="handleHoverEnd(${id}, this)">
                            <p class="validation-msg">â€¢ ${newTask.subtasks[id].title}</p>
                            <div class="btn-div-sub gap-2 d-none" id="subtask-btn-${id}">
                                <img onclick="editSubtask(${id})" class="sub-btn" src="../assets/icons/edit.svg" alt="edit"/>
                                <div class="divider-sub-input"></div>
                                <img onclick="delSubtask(${id})" class="sub-btn" src="../assets/icons/delete.svg" alt="delete"/>
                            </div>
                        </div>
                    </div>`
}


/**
 * render edit subtask in the add task
 * @param {*} id 
 * @returns 
 */
function renderEditSubtask(id) {
    return `<input id="edit-input-${id}" maxlength="100" class="edit-input" placeholder="Add new subtask"/>                      
            <div id="" class="btn-div-sub gap-2 ">
                <img onclick="delSubtask(${id})" class="sub-btn" src="../assets/icons/delete.svg" alt="delete"/>
                <div class="divider-input"></div>
                <img onclick="saveEdit(${id})" class="sub-btn" src="../assets/icons/check.svg" alt="check"/>
            </div>`
}