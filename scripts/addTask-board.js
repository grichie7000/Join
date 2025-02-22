const BASE_URL_ADDTASK = "https://join-d3707-default-rtdb.europe-west1.firebasedatabase.app/";

function initAddTask() {
  getElementsByIds();
  loadFirebaseData("contactsDatabase");
  window.selectedSubtasks = [];
}

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

function getElementsByIds() {
  title = document.getElementById("title");
  errorTitle = document.getElementById("error-title");
  date = document.getElementById("due-date");
  errorDate = document.getElementById("error-date");
  category = document.getElementById("category");
  errorCategory = document.getElementById("error-category");
}

function changeDateColor() {
  date = document.getElementById('due-date');
  if (date.value) {
    date.style.color = 'black';
  } else {
    date.style.color = '';
  }
}

async function loadFirebaseData(path = "") {
  let response = await fetch(BASE_URL_ADDTASK + path + ".json");
  let data = await response.json();
  firebaseData = data ? Object.values(data) : [];
  displayContacts();
}

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

function updateAssignedContactsDisplay() {
  const selectedContactsList = document.getElementById("selectedContactsList");
  selectedContactsList.innerHTML = "";
  window.selectedContacts.forEach(contact => {
    const badge = document.createElement("div");
    badge.classList.add("selected-contact-item");
    badge.style.backgroundColor = contact.color;
    badge.textContent = contact.initials;
    selectedContactsList.appendChild(badge);
  });
}

function editItemOne(element) {
  const editItem = document.getElementById('editItemOne');
  const editIcons = document.getElementById('editItemIconOne');
  element.style.display = 'none';
  editIcons.style.display = 'flex';
  editItem.style.display = 'block';
  editItem.value = element.innerHTML;
}

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

function submitItemOne() {
  const changesItemOne = document.getElementById('editItemOne');
  const subtaskItemOne = document.getElementById('subtaskItem1');
  const editItem = document.getElementById('editItemOne');
  const editIcons = document.getElementById('editItemIconOne');
  subtaskItemOne.innerHTML = changesItemOne.value;
  subtaskItemOne.style.display = "inline list-item";
  editIcons.style.display = 'none';
  editItem.style.display = 'none';
}

function editItemTwo(element) {
  const editItem = document.getElementById('editItemTwo');
  const editIcons = document.getElementById('editItemIconTwo');
  element.style.display = 'none';
  editIcons.style.display = 'flex';
  editItem.style.display = 'block';
  editItem.value = element.innerHTML;
}

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

function submitItemTwo() {
  const changesItemTwo = document.getElementById('editItemTwo');
  const subtaskItemTwo = document.getElementById('subtaskItem2');
  const editItem = document.getElementById('editItemTwo');
  const editIcons = document.getElementById('editItemIconTwo');
  subtaskItemTwo.innerHTML = changesItemTwo.value;
  subtaskItemTwo.style.display = "inline list-item";
  editIcons.style.display = 'none';
  editItem.style.display = 'none';
}

function subtaskInputDelete() {
  document.getElementById('subtask').value = "";
}

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
  plusImg.alt = 'checked';
  plusImg.id = 'checkImg';
  symbolStyling.appendChild(plusImg);
}

function validateFormular(event) {
  event.preventDefault();
  validateTitle(event);
  validateDate(event);
  validateCategory(event);
  if (validateIsOk.every(val => val === true)) {
    submitForm(event);
  }
}

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

function subtaskInputDelete() {
  document.getElementById("subtask").value = "";
}

function resetAddtaskInput() {
  const symbolStyling = document.getElementById("symbolStyling");
  symbolStyling.style.border = "2px solid #D1D1D1";
  symbolStyling.innerHTML = "";
  symbolStyling.style.borderLeft = "none";
  const subtaskInput = document.getElementById("subtask");
  subtaskInput.style.border = "2px solid #D1D1D1";
  subtaskInput.value = "";
  const plusImg = document.createElement("img");
  plusImg.src = "./assets/img/plus_task.png";
  plusImg.alt = "plus";
  plusImg.id = "checkImg";
  symbolStyling.appendChild(plusImg);
}

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
    subtasks: window.selectedSubtasks.filter(st => st)
  };
}

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
