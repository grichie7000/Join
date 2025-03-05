/**
 * @module addTaskBoardModule
 * This module manages the initialization and management of the "Add Task" page,
 * including form validation, contact selection, subtask management, and
 * sending data to Firebase.
 */

const BASE_URL_ADDTASK = "https://join-d3707-default-rtdb.europe-west1.firebasedatabase.app/";

/**
 * Initializes the "Add Task" page by retrieving necessary DOM elements,
 * loading Firebase data for contacts, and resetting the global list of selected subtasks.
 */
function initAddTask() {
  getElementsByIds();
  loadFirebaseData("contactsDatabase");
  window.selectedSubtasks = [];
}

/**
 * Removes the selection from all contact elements and resets their checkbox images.
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
 * Resets the "Add Task" form by clearing error messages, input fields, and their styling.
 */
function clearFormFields() {
  errorTitle.innerHTML = '';
  title.style.border = "";
  errorDate.innerHTML = '';
  date.style.border = "";
  date.style.color = "#D1D1D1";
  errorCategory.innerHTML = '';
  category.style.border = "";
}

/**
 * Clears the subtask display by resetting subtask flags, hiding edit fields,
 * and clearing the subtask elements.
 */
function clearSubtasksDisplay() {
  subTaskOne = false;
  subtaskTwo = false;
  document.getElementById('editItemOne').style.display = 'none';
  document.getElementById('editItemIconOne').style.display = 'none';
  document.getElementById('editItemTwo').style.display = 'none';
  document.getElementById('editItemIconTwo').style.display = 'none';

  const addedSubtaskOne = document.getElementById('subtaskItem1');
  addedSubtaskOne.innerHTML = '';
  addedSubtaskOne.style.display = 'none';

  const addedSubtaskTwo = document.getElementById('subtaskItem2');
  addedSubtaskTwo.innerHTML = '';
  addedSubtaskTwo.style.display = 'none';
}

/**
 * Clears contact selections by resetting the selection and clearing the contacts list.
 */
function clearContactsDisplay() {
  clearSelection();
  const selectedContactsList = document.getElementById('selectedContactsList');
  selectedContactsList.innerHTML = '';
}

/**
 * Clears both subtasks and contacts by calling the respective helper functions.
 */
function clearSubtasksAndContacts() {
  clearContactsDisplay();
  clearSubtasksDisplay();
}

/**
 * Performs a complete reset of the "Add Task" page by clearing both form fields
 * and subtasks/contacts.
 */
function clearTask() {
  clearFormFields();
  clearSubtasksAndContacts();
}

/**
 * Retrieves DOM elements by their IDs and assigns them to global variables.
 */
function getElementsByIds() {
  title = document.getElementById("title");
  errorTitle = document.getElementById("error-title");
  date = document.getElementById("due-date");
  errorDate = document.getElementById("error-date");
  category = document.getElementById("category");
  errorCategory = document.getElementById("error-category");
}

/**
 * Changes the color of the date input field based on its value and enforces a maximum date (December 31, 2099).
 * If the entered date exceeds the maximum, an error message is displayed and the date is reset.
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
    document.getElementById("error-date").innerHTML = "maximum date 2099";
    dateInput.value = ""; 
  }
}

/**
 * Loads data from Firebase for the specified path, stores it in the global variable
 * "firebaseData", and then calls the function to display contacts.
 * @async
 * @param {string} [path=""] - The path in the Firebase database from which to load data.
 */
async function loadFirebaseData(path = "") {
  let response = await fetch(BASE_URL_ADDTASK + path + ".json");
  let data = await response.json();
  firebaseData = data ? Object.values(data) : [];
  displayContacts();
}

/**
 * Displays contacts from the global variable "firebaseData" in the contact list of the UI.
 */
function displayContacts() {
  const contactList = document.getElementById("contactListAssigned");
  contactList.innerHTML = "";
  firebaseData.forEach(contact => {
    const contactItem = document.createElement("div");
    contactItem.classList.add("contact-item");
    contactItem.innerHTML = `
      <p class="dropdown-initials" style="background-color: ${contact.color};" id="contactNumber${contact.id}">${contact.initials}</p>
      <span class="select-position">${contact.name}</span>
      <img src="./assets/img/checkbox_empty.png" alt="empty checkbox" />
    `;
    contactItem.setAttribute("onclick", `selectContact(this, ${contact.id})`);
    contactList.appendChild(contactItem);
  });
}

/**
 * Toggles the selection state of a contact element, changes the displayed checkbox image,
 * and updates the global contact selection.
 * @param {HTMLElement} contactElement - The HTML element of the contact.
 * @param {number} id - The unique ID of the contact.
 */
function selectContact(contactElement, id) {
  contactElement.classList.toggle("selected");
  const checkboxImage = contactElement.querySelector("img");
  if (contactElement.classList.contains("selected")) {
    checkboxImage.src = "./assets/img/checkbox_checked.png";
  } else {
    checkboxImage.src = "./assets/img/checkbox_empty.png";
  }
  updateGlobalSelectedContacts();
  updateAssignedContactsDisplay();
}

/**
 * Updates the global variable "selectedContacts" based on the currently selected contact elements.
 */
function updateGlobalSelectedContacts() {
  const selectedElements = document.querySelectorAll(".contact-item.selected");
  window.selectedContacts = [];
  selectedElements.forEach(el => {
    const name = el.querySelector(".select-position").textContent.trim();
    const initialsEl = el.querySelector(".dropdown-initials");
    const initials = initialsEl ? initialsEl.textContent.trim() : "";
    const color = initialsEl ? initialsEl.style.backgroundColor : "#000";
    window.selectedContacts.push({ name, initials, color });
  });
}

/**
 * Updates the primary contact badges (up to 4 contacts) in the contacts list.
 * @param {HTMLElement} selectedContactsList - The element where badges are displayed.
 */
function updatePrimaryContactBadges(selectedContactsList) {
  const maxContacts = 4;
  window.selectedContacts.slice(0, maxContacts).forEach(contact => {
    const badge = document.createElement("div");
    badge.classList.add("selected-contact-item");
    badge.style.backgroundColor = contact.color;
    badge.textContent = contact.initials;
    selectedContactsList.appendChild(badge);
  });
}

/**
 * Updates the extra contact badge if there are more than 4 contacts.
 * @param {HTMLElement} selectedContactsList - The element where badges are displayed.
 */
function updateExtraContactBadge(selectedContactsList) {
  const maxContacts = 4;
  const extraCount = window.selectedContacts.length - maxContacts;
  if (extraCount > 0) {
    const extraBadge = document.createElement("div");
    extraBadge.classList.add("selected-contact-item", "extra-badge");
    extraBadge.textContent = '+' + extraCount;
    selectedContactsList.appendChild(extraBadge);
  }
}

/**
 * Updates the display of selected contacts in the designated contacts list.
 * It calls the helper functions to update primary contact badges and the extra badge.
 */
function updateAssignedContactsDisplay() {
  const selectedContactsList = document.getElementById("selectedContactsList");
  selectedContactsList.innerHTML = "";
  updatePrimaryContactBadges(selectedContactsList);
  updateExtraContactBadge(selectedContactsList);
}

/**
 * Enables editing for the first subtask by displaying the corresponding edit field and icons.
 * @param {HTMLElement} element - The element to be edited.
 */
function editItemOne(element) {
  const editItem = document.getElementById('editItemOne');
  const editIcons = document.getElementById('editItemIconOne');
  element.style.display = 'none';
  editIcons.style.display = 'flex';
  editItem.style.display = 'block';
  editItem.value = element.innerHTML;
}

/**
 * Deletes the first subtask from the display and removes it from the global subtasks list.
 */
function deleteItemOne() {
  const addedSubtaskOne = document.getElementById('subtaskItem1');
  const editItem = document.getElementById('editItemOne');
  const editIcons = document.getElementById('editItemIconOne');
  editIcons.style.display = 'none';
  editItem.style.display = 'none';
  addedSubtaskOne.innerHTML = '';
  addedSubtaskOne.style.display = 'none';
  if (window.selectedSubtasks.length > 0) {
    window.selectedSubtasks.splice(0, 1);
  }
}

/**
 * Submits changes for the first subtask, updates the display, and saves the changes in the global subtasks list.
 */
function submitItemOne() {
  const changesItemOne = document.getElementById('editItemOne').value;
  const subtaskItemOne = document.getElementById('subtaskItem1');
  const editItem = document.getElementById('editItemOne');
  const editIcons = document.getElementById('editItemIconOne');
  
  if (window.selectedSubtasks.length > 0) {
    window.selectedSubtasks[0].title = changesItemOne;
  }
  
  subtaskItemOne.innerHTML = changesItemOne;
  subtaskItemOne.style.display = "inline list-item";
  editIcons.style.display = 'none';
  editItem.style.display = 'none';
}

/**
 * Enables editing for the second subtask by displaying the corresponding edit field and icons.
 * @param {HTMLElement} element - The element to be edited.
 */
function editItemTwo(element) {
  const editItem = document.getElementById('editItemTwo');
  const editIcons = document.getElementById('editItemIconTwo');
  element.style.display = 'none';
  editIcons.style.display = 'flex';
  editItem.style.display = 'block';
  editItem.value = element.innerHTML;
}

/**
 * Deletes the second subtask from the display and removes it from the global subtasks list.
 */
function deleteItemTwo() {
  const addedSubtaskTwo = document.getElementById('subtaskItem2');
  const editItem = document.getElementById('editItemTwo');
  const editIcons = document.getElementById('editItemIconTwo');
  editIcons.style.display = 'none';
  editItem.style.display = 'none';
  addedSubtaskTwo.innerHTML = '';
  addedSubtaskTwo.style.display = 'none';
  if (window.selectedSubtasks.length > 1) {
    window.selectedSubtasks.splice(1, 1);
  }
}

/**
 * Submits changes for the second subtask, updates the display, and saves the changes in the global subtasks list.
 */
function submitItemTwo() {
  const changesItemTwo = document.getElementById('editItemTwo').value;
  const subtaskItemTwo = document.getElementById('subtaskItem2');
  const editItem = document.getElementById('editItemTwo');
  const editIcons = document.getElementById('editItemIconTwo');
  
  if (window.selectedSubtasks.length > 1) {
    window.selectedSubtasks[1].title = changesItemTwo;
  }
  
  subtaskItemTwo.innerHTML = changesItemTwo;
  subtaskItemTwo.style.display = "inline list-item";
  editIcons.style.display = 'none';
  editItem.style.display = 'none';
}

/**
 * Clears the subtask input field.
 */
function subtaskInputDelete() {
  document.getElementById('subtask').value = "";
}

/**
 * Resets the styling and value of the subtask input field,
 * including displaying the plus symbol.
 */
function resetAddtaskInput() {
  const symbolStyling = document.getElementById('symbolStyling');
  const plusImg = document.createElement('img');
  const subtaskInput = document.getElementById('subtask');
  symbolStyling.style.border = "2px solid #D1D1D1";
  symbolStyling.innerHTML = "";
  symbolStyling.style.borderLeft = "none";
  subtaskInput.style.border = "2px solid #D1D1D1";
  subtaskInput.value = "";
  plusImg.src = './assets/img/plus_task.png';
  plusImg.alt = 'plus';
  plusImg.id = 'checkImg';
  symbolStyling.appendChild(plusImg);
}

window.initAddTask = initAddTask;