/**
 * @module addTaskModule
 * This module handles the initialization and management of the add task page,
 * including form validation, contact selection, subtask management, and posting data to Firebase.
 */

const BASE_URL_ADDTASK = "https://join-d3707-default-rtdb.europe-west1.firebasedatabase.app/";

/**
 * Initializes the add task page by retrieving necessary DOM elements,
 * loading Firebase data for contacts, and resetting selected subtasks.
 */
function initAddTask() {
  getElementsByIds();
  loadFirebaseData("contactsDatabase");
  window.selectedSubtasks = [];
}

/**
 * Clears the selection state from all contact items and resets their checkbox images.
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
 * Clears the add task form by resetting error messages, input borders,
 * subtask displays, and clearing any selected contacts or subtasks.
 */
function clearTask() {
  errorTitle.innerHTML = '';
  title.style.border = "";
  errorDate.innerHTML = '';
  date.style.border = "";
  date.style.color = "#D1D1D1";
  errorCategory.innerHTML = '';
  category.style.border = "";
  const allContacts = document.querySelectorAll('.contact-item');
  clearSelection();
  subTaskOne = false;
  subtaskTwo = false;
  document.getElementById('editItemOne').style.display = 'none';
  document.getElementById('editItemIconOne').style.display = 'none';
  document.getElementById('editItemTwo').style.display = 'none';
  document.getElementById('editItemIconTwo').style.display = 'none';
  const addedSubtaskOne = document.getElementById('subtaskItem1');
  addedSubtaskOne.innerHTML = '';
  addedSubtaskOne.style.display = 'none';
  console.log("teste");
  const addedSubtaskTwo = document.getElementById('subtaskItem2');
  addedSubtaskTwo.innerHTML = '';
  addedSubtaskTwo.style.display = 'none';
  const selectedContactsList = document.getElementById('selectedContactsList');
  selectedContactsList.innerHTML = '';
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
 * Changes the color of the date input based on its value and enforces a maximum date of December 31, 2099.
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
 * Loads data from Firebase for the specified path and assigns it to the global variable firebaseData.
 * Then calls displayContacts to update the contact list in the UI.
 * @async
 */
async function loadFirebaseData(path = "") {
  let response = await fetch(BASE_URL_ADDTASK + path + ".json");
  let data = await response.json();
  firebaseData = data ? Object.values(data) : [];
  displayContacts();
}

/**
 * Displays contacts from the global firebaseData array in the contact list element.
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
 * Toggles the selection state of a contact item and updates the global selected contacts.
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
 * Updates the global selectedContacts array based on the currently selected contact items.
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
 * Updates the display of assigned contacts in the designated contacts list element.
 */
function updateAssignedContactsDisplay() {
  const selectedContactsList = document.getElementById("selectedContactsList");
  selectedContactsList.innerHTML = "";

  const maxContacts = 4;
  
  window.selectedContacts.slice(0, maxContacts).forEach(contact => {
    const badge = document.createElement("div");
    badge.classList.add("selected-contact-item");
    badge.style.backgroundColor = contact.color;
    badge.textContent = contact.initials;
    selectedContactsList.appendChild(badge);
  });
  
  const extraCount = window.selectedContacts.length - maxContacts;
  if (extraCount > 0) {
    const extraBadge = document.createElement("div");
    extraBadge.classList.add("selected-contact-item", "extra-badge");
    extraBadge.textContent = '+' + extraCount;
    selectedContactsList.appendChild(extraBadge);
  }
}

/**
 * Enables editing for the first subtask item.
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
 * Deletes the first subtask item from the display and removes it from the global subtasks array.
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
 * Submits the changes for the first subtask, updating the display and the global subtasks array.
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
 * Enables editing for the second subtask item.
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
 * Deletes the second subtask item from the display and removes it from the global subtasks array.
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
 * Submits the changes for the second subtask, updating the display and the global subtasks array.
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
 * Resets the subtask input styling and value.
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

/**
 * Validates the entire form and submits it if all validations pass.
 */
function validateFormular(event) {
  event.preventDefault();
  validateTitle(event);
  validateDate(event);
  validateCategory(event);
  if (validateIsOk.every(val => val === true)) {
    submitForm(event);
  }
}

/**
 * Validates the task title field.
 */
function validateTitle(event) {
  errorTitle.innerHTML = "";
  if (!title.value.trim()) {
    errorTitle.innerHTML = "This field is required";
    title.style.border = "2px solid #FF8190";
    validateIsOk[0] = false;
    return false;
  }
  title.style.border = "2px solid #D1D1D1";
  validateIsOk[0] = true;
}

/**
 * Validates the due date field.
 */
function validateDate(event) {
  errorDate.innerHTML = "";
  if (!date.value) {
    errorDate.innerHTML = "This field is required";
    date.style.border = "2px solid #FF8190";
    validateIsOk[1] = false;
    return false;
  }
  date.style.border = "2px solid #D1D1D1";
  validateIsOk[1] = true;
}

/**
 * Validates the task category field.
 */
function validateCategory(event) {
  errorCategory.innerHTML = "";
  if (!category.value) {
    errorCategory.innerHTML = "This field is required";
    category.style.border = "2px solid #FF8190";
    validateIsOk[2] = false;
    return false;
  }
  category.style.border = "2px solid #D1D1D1";
  validateIsOk[2] = true;
}

/**
 * Applies styling to the subtask input element and displays delete and check icons.
 */
function subtaskStyling(inputElement) {
  const symbolStyling = document.getElementById("symbolStyling");
  inputElement.style.border = "2px solid #29ABE2";
  symbolStyling.style.border = "2px solid #29ABE2";
  symbolStyling.style.borderLeft = "none";
  const deleteImg = document.createElement("img");
  deleteImg.src = "./assets/img/x_task.png";
  deleteImg.alt = "delete";
  deleteImg.id = "deleteImg";
  deleteImg.onclick = subtaskInputDelete;
  const checkImg = document.createElement("img");
  checkImg.src = "./assets/img/check_task.png";
  checkImg.alt = "checked";
  checkImg.id = "checkImg";
  checkImg.onclick = subtaskAppend;
  const symbolTask = document.createElement("span");
  symbolTask.textContent = "|";
  symbolStyling.innerHTML = "";
  symbolStyling.appendChild(deleteImg);
  symbolStyling.appendChild(symbolTask);
  symbolStyling.appendChild(checkImg);
}

/**
 * Appends a new subtask from the subtask input field to the global selected subtasks array
 * and updates the subtask display.
 */
function subtaskAppend() {
  const subtaskInputValue = document.getElementById("subtask").value.trim();
  const addedSubtaskOne = document.getElementById("subtaskItem1");
  const addedSubtaskTwo = document.getElementById("subtaskItem2");
  if (!subtaskInputValue) return;
  if (window.selectedSubtasks.length < 2) {
    window.selectedSubtasks.push({
      title: subtaskInputValue,
      completed: false
    });
    if (window.selectedSubtasks.length === 1) {
      addedSubtaskOne.innerHTML = subtaskInputValue;
      addedSubtaskOne.style.display = "inline";
    } else {
      addedSubtaskTwo.innerHTML = subtaskInputValue;
      addedSubtaskTwo.style.display = "inline";
    }
  }
  resetAddtaskInput();
}

/**
 * Toggles the dropdown for contact assignment.
 */
function toggleDropdown() {
  const assignedToElement = document.getElementById("assigned-to");
  const customArrowAssigned = document.getElementById("customArrowAssigned");
  const placeholderAssigned = document.getElementById("placeholderAssigned");
  assignedToElement.classList.toggle("open");
  customArrowAssigned.classList.toggle("open");
  if (assignedToElement.classList.contains("open")) {
    placeholderAssigned.innerHTML = "An |";
  } else {
    placeholderAssigned.innerHTML = "Select contacts to assign";
  }
}

document.addEventListener("click", function (event) {
  const assignedToElement = document.getElementById("assigned-to");
  const customArrowAssigned = document.getElementById("customArrowAssigned");
  const placeholderAssigned = document.getElementById("placeholderAssigned");
  const formSubtask = document.querySelector(".form-subtask");
  if (!formSubtask.contains(event.target)) {
    resetAddtaskInput();
  }
  if (!assignedToElement.contains(event.target)) {
    assignedToElement.classList.remove("open");
    customArrowAssigned.classList.remove("open");
    placeholderAssigned.innerHTML = "Select contacts to assign";
  }
});

/**
 * Gathers add task form data and returns it as an object.
 */
function getAddTaskData() {
  const priorityElement = document.querySelector('input[name="priority"]:checked');
  const priorityValue = priorityElement ? priorityElement.value : "medium";
  return {
    title: title.value.trim(),
    description: document.getElementById("description").value.trim(),
    contacts: window.selectedContacts,
    dueDate: date.value,
    priority: priorityValue,
    category: category.value,
    subtasks: window.selectedSubtasks
  };
}

/**
 * Handles form submission by gathering form data, displaying a confirmation card,
 * posting data to Firebase, and redirecting to the board page.
 */
function submitForm(event) {
  event.preventDefault();
  const dataToBoard = getAddTaskData();
  const card = document.getElementById("submit-card");
  card.classList.add("visible");
  postDatatoBoard("/tasks/to-do", dataToBoard);
  setTimeout(function () {
    window.location.href = "./board.html";
  }, 1500);
}

/**
 * Posts the provided data to Firebase at the specified path.
 * @async
 */
async function postDatatoBoard(path = "", data = {}) {
  await fetch(BASE_URL_ADDTASK + path + ".json", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
}

window.initAddTask = initAddTask;
