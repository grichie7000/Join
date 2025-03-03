window.selectedContacts = [];
window.selectedSubtasks = [];

let validateIsOk = [false, false, false];
let subtaskCount = 1;
let title;
let errorTitle;
let date;
let errorDate;
let category;
let errorCategory;
let formDataArray = [];
let firebaseData = [];
const BASE_URL_ADDTASK = "https://join-d3707-default-rtdb.europe-west1.firebasedatabase.app/";

/**
 * Initializes the task addition process.
 * Sets up event listeners and loads data from Firebase.
 */
function initAddTask() {
    getElementsByIds();
    loadFirebaseData("contactsDatabase");

    document.getElementById("subtask").addEventListener("keydown", function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            subtaskAppend();
        }
    });
}

/**
 * Loads Firebase data from the given path and updates the contact list.
 * @param {string} path - The path in Firebase to fetch data from.
 */
async function loadFirebaseData(path = "") {
    let response = await fetch(BASE_URL_ADDTASK + path + ".json");
    let responseToJson = await response.json();
    firebaseData = responseToJson;
    displayContacts();
}

/**
 * Sends data to the board.
 * @param {string} path - The path to post the data to.
 * @param {Object} data - The data to be posted.
 */
async function postDatatoBoard(path = "", data = {}) {
    let response = await fetch(BASE_URL_ADDTASK + path + ".json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
}

/**
 * Displays the list of contacts retrieved from Firebase.
 */
function displayContacts() {
    let contactArray = Object.values(firebaseData);
    const contactList = document.getElementById('contactListAssigned');

    contactList.innerHTML = '';

    contactArray.forEach(contact => {
        const contactItem = document.createElement('div');
        contactItem.classList.add('contact-item');

        contactItem.innerHTML = `
            <p class="dropdown-initials" id="contactNumber${contact.id}">${contact.initials}</p>
            <span class="select-position">${contact.name}</span>
            <img src="./assets/img/checkbox_empty.png" alt="empty checkbox" />
        `;

        contactItem.setAttribute('onclick', `selectContact(this, ${contact.id})`);

        const initialsElement = contactItem.querySelector('.dropdown-initials');
        initialsElement.style.backgroundColor = contact.color;

        contactList.appendChild(contactItem);
    });
}

/**
 * Clears all form fields and resets the selected contacts and subtasks.
 */
function clearTask() {
    errorTitle.innerHTML = '';
    title.style.border = ""

    errorDate.innerHTML = '';
    date.style.border = ""
    date.style.color = "#D1D1D1"

    errorCategory.innerHTML = '';
    category.style.border = ""

    const allContacts = document.querySelectorAll('.contact-item');
    let ul = document.getElementById('addedSubtask');
    while (ul.firstChild) {
        ul.removeChild(ul.firstChild);
    }
    clearSelection()

    const selectedContactsList = document.getElementById('selectedContactsList');
    selectedContactsList.innerHTML = '';
}

/**
 * Counts the number of selected contacts and hides excess contacts if there are more than 5.
 */
function countContacts() {
    const container = document.getElementById('selectedContactsList');
    const divs = Array.from(container.children).filter(child => child.tagName === 'DIV');

    if (divs.length >= 5) {
        if (!document.getElementById('message')) {
            const p = document.createElement('p');
            p.id = 'message';
            p.textContent = '+' + (divs.length - 4);
            container.appendChild(p);

            let numberOfItemsToHide = divs.length - 4;

            let selectedContacts = document.querySelectorAll('.selected-contact-item');

            for (let i = selectedContacts.length - numberOfItemsToHide; i < selectedContacts.length; i++) {
                selectedContacts[i].style.display = 'none';
            }
        }
    }
}

/**
 * Applies styling to the subtask input field.
 * @param {HTMLElement} subtaskStyling - The subtask input element to style.
 */
function styleSubtaskInput(subtaskStyling) {
    subtaskStyling.style.border = "2px solid #29ABE2";
}

/**
 * Applies styling to the symbol container (delete and check images).
 */
function styleSymbolContainer() {
    const symbolStyling = document.getElementById('symbolStyling');
    symbolStyling.style.border = "2px solid #29ABE2";
    symbolStyling.style.borderLeft = "none";
}

/**
 * Creates an image element for deleting a subtask.
 * @returns {HTMLElement} The delete image element.
 */
function createDeleteImage() {
    const deleteImg = document.createElement('img');
    deleteImg.src = './assets/img/x_task.png';
    deleteImg.alt = 'delete';
    deleteImg.id = 'deleteImg';
    deleteImg.setAttribute("onclick", "subtaskInputDelete()");
    return deleteImg;
}

/**
 * Creates an image element for checking a subtask.
 * @returns {HTMLElement} The check image element.
 */
function createCheckImage() {
    const checkImg = document.createElement('img');
    checkImg.src = './assets/img/check_task.png';
    checkImg.alt = 'checked';
    checkImg.id = 'checkImg';
    checkImg.setAttribute("onclick", "subtaskAppend()");
    return checkImg;
}

/**
 * Creates a vertical line symbol for separating actions in the subtask.
 * @returns {HTMLElement} The vertical line element.
 */
function createSymbolTask() {
    const symbolTask = document.createElement('span');
    symbolTask.textContent = '|';
    return symbolTask;
}

/**
 * Updates the symbol container with delete, check images, and separator.
 */
function updateSymbolContainer() {
    const symbolStyling = document.getElementById('symbolStyling');
    symbolStyling.innerHTML = '';

    const deleteImg = createDeleteImage();
    const checkImg = createCheckImage();
    const symbolTask = createSymbolTask();

    symbolStyling.appendChild(deleteImg);
    symbolStyling.appendChild(symbolTask);
    symbolStyling.appendChild(checkImg);
}

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

/**
 * Resets the add task input fields to their default state.
 */
function resetAddtaskInput() {
    const symbolStyling = document.getElementById('symbolStyling');
    const plusImg = document.createElement('img');
    const subtaskInput = document.getElementById('subtask');

    symbolStyling.style.border = "2px solid #D1D1D1";
    symbolStyling.innerHTML = '';
    symbolStyling.style.borderLeft = "none";

    subtaskInput.style.border = "2px solid #D1D1D1";
    subtaskInput.value = "";

    plusImg.src = './assets/img/plus_task.png';
    plusImg.alt = 'checked';
    plusImg.id = 'checkImg';
    symbolStyling.appendChild(plusImg);
}

/**
 * Toggles the visibility of the contact dropdown menu.
 */
function toggleDropdown() {
    const assignedToElement = document.getElementById('assigned-to');
    const customArrowAssigned = document.getElementById('customArrowAssigned');
    const placeholderAssigned = document.getElementById('placeholderAssigned');

    assignedToElement.classList.toggle('open');
    customArrowAssigned.classList.toggle('open');

    if (assignedToElement.classList.contains('open')) {
        placeholderAssigned.innerHTML = "An |"
    } else {
        placeholderAssigned.innerHTML = "Select contacts to assign"
    }
}

/**
 * Event listener to close the dropdown and reset task input when clicking outside.
 * @param {Event} event - The event triggered by a click outside the dropdown.
 */
document.addEventListener('click', function (event) {
    const assignedToElement = document.getElementById('assigned-to');
    const customArrowAssigned = document.getElementById('customArrowAssigned');
    const placeholderAssigned = document.getElementById('placeholderAssigned');
    const formSubtask = document.querySelector('.form-subtask');

    if (!formSubtask.contains(event.target)) {
        resetAddtaskInput()
    }

    if (!assignedToElement.contains(event.target)) {
        assignedToElement.classList.remove('open');
        customArrowAssigned.classList.remove('open');
        placeholderAssigned.innerHTML = "Select contacts to assign"
    }
});

/**
 * Toggles the selection state of a contact in the contact list.
 * @param {HTMLElement} contactElement - The contact element to toggle.
 */
function toggleSelection(contactElement) {
    contactElement.classList.toggle('selected');
    const checkboxImage = contactElement.querySelector('img');
    if (contactElement.classList.contains('selected')) {
        checkboxImage.src = "./assets/img/checkbox_checked.png";
    } else {
        checkboxImage.src = "./assets/img/checkbox_empty.png";
    }
}

/**
 * Displays the list of selected contacts in the contact selection container.
 */
function displaySelectedContacts() {
    const selectedContactsList = document.getElementById('selectedContactsList');
    selectedContactsList.innerHTML = '';
    const selectedContacts = document.querySelectorAll('.contact-item.selected');

    selectedContacts.forEach(contact => {
        const initials = contact.querySelector('.dropdown-initials').textContent.trim();
        const initialsBackgroundColor = contact.querySelector('.dropdown-initials').style.backgroundColor;

        const selectedItem = document.createElement('div');
        selectedItem.classList.add('selected-contact-item');
        selectedItem.textContent = initials;
        selectedItem.style.backgroundColor = initialsBackgroundColor;

        selectedContactsList.appendChild(selectedItem);
    });
}

/**
 * Selects or deselects a contact when clicked.
 * @param {HTMLElement} contactElement - The contact element to select.
 */
function selectContact(contactElement) {
    toggleSelection(contactElement);
    displaySelectedContacts();
    countContacts();
}

/**
 * Clears the selection of all contacts and resets the selected contact list.
 */
function clearSelection() {
    const allContacts = document.querySelectorAll('.contact-item');
    allContacts.forEach(contact => {
        contact.classList.remove('selected');
        const checkboxImage = contact.querySelector('img');
        checkboxImage.src = "./assets/img/checkbox_empty.png";
    });

    const selectedContactsList = document.getElementById('selectedContactsList');
    selectedContactsList.innerHTML = '';
}

/**
 * Prevents the default form submission behavior, collects data from the form,
 * displays a card, and sends the data to the server. After a delay, it redirects the user
 * to the board page.
 * 
 * @param {Event} event - The event object triggered when the form is submitted.
 */
function submitForm(event) {
    event.preventDefault();
    const dataToBoard = getAddTaskData();

    const card = document.getElementById('submit-card');
    card.classList.add('visible');

    postDatatoBoard("/tasks/to-do", dataToBoard)

    setTimeout(function () {
        window.location.href = './board.html';
    }, 1500);
}