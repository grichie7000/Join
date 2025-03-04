/**
 * Applies subtask styling to the input field and the symbol container.
 * @param {HTMLElement} subtaskStyling - The subtask input element to style.
 */
function subtaskStyling(subtaskStyling) {
    styleSubtaskInput(subtaskStyling);
    styleSymbolContainer();
    updateSymbolContainer();
}

/**
 * Appends a new subtask to the list of added subtasks.
 */
function subtaskAppend() {
    const inputField = document.getElementById('subtask');
    const subtaskText = inputField.value.trim();

    if (subtaskText !== '') {
        const ul = document.getElementById('addedSubtask');
        const li = document.createElement('li');
        li.classList.add('subtask-item');

        li.innerHTML = `
            <span class="subtask-text">${subtaskText}</span>
            <div class="action-icons">
                <img src="./assets/img/edit.png" alt="edit" onclick="editSubtask(this)">
                | 
                <img src="./assets/img/addtask_bin.png" alt="delete" onclick="deleteSubtask(this)">
            </div>
        `;

        li.addEventListener('click', function (event) {
            if (!event.target.closest('.action-icons')) {
                editSubtask(this);
            }
        });

        ul.appendChild(li);

        inputField.value = '';
    }
}

/**
 * Edits the given subtask when the edit icon is clicked.
 * @param {HTMLElement} editIcon - The edit icon clicked.
 */
function editSubtask(editIcon) {
    const li = editIcon.closest('li');
    const subtaskText = li.querySelector('.subtask-text');

    if (subtaskText) {
        li.classList.add('editing');

        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.value = subtaskText.textContent.trim();

        li.innerHTML = `
            <input type="text" value="${inputField.value}" class="edit-input">
            <div class="action-icons">
                <img src="./assets/img/addtask_bin.png" alt="delete" onclick="deleteSubtask(this)">
                |
                <img src="./assets/img/check_task.png" alt="check" onclick="saveSubtask(this)">
            </div>
        `;
    }
}

/**
 * Saves the edited subtask and updates the display.
 * @param {HTMLElement} checkIcon - The check icon clicked.
 */
function saveSubtask(checkIcon) {
    const li = checkIcon.closest('li');
    const inputField = li.querySelector('.edit-input');
    const newText = inputField.value.trim();

    if (newText !== '') {
        li.innerHTML = `
            <span class="subtask-text">${newText}</span>
            <div class="action-icons">
                <img src="./assets/img/edit.png" alt="edit" onclick="editSubtask(this)">
                | 
                <img src="./assets/img/addtask_bin.png" alt="delete" onclick="deleteSubtask(this)">
            </div>
        `;

        li.classList.remove('editing');
    }
}

/**
 * Deletes the given subtask when the delete icon is clicked.
 * @param {HTMLElement} deleteIcon - The delete icon clicked.
 */
function deleteSubtask(deleteIcon) {
    const li = deleteIcon.closest('li');
    li.remove();
}

/**
 * Appends a subtask when the Enter key is pressed.
 * @param {Event} event - The keydown event to check for Enter key.
 */
function checkEnter(event) {
    if (event.key === 'Enter') {
        subtaskAppend();
    }
}

/**
 * Clears the subtask input when the delete button is pressed.
 */
function subtaskInputDelete() {
    document.getElementById('subtask').value = "";
}
