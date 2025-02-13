// // Globale Variablen initialisieren
// window.selectedContacts = [];
// window.selectedSubtasks = [];

// let validateIsOk = [false, false, false];
// let subTaskOne = false;
// let subtaskTwo = false;
// let title;
// let errorTitle;
// let date;
// let errorDate;
// let category;
// let errorCategory;
// let formDataArray = [];
// let firebaseData = [];
// const BASE_URL_ADDTASK = "https://join-d3707-default-rtdb.europe-west1.firebasedatabase.app/";



// function initAddTask() {
//     getElementsByIds()
//     loadFirebaseData("contatcsFirebase");
// }


// async function loadFirebaseData(path = "") {
//     let response = await fetch(BASE_URL_ADDTASK + path + ".json");
//     let responseToJson = await response.json();
//     firebaseData = responseToJson;

//     displayContacts();
// }

// async function postDatatoBoard(path = "", data = {}) {
//     let response = await fetch(BASE_URL_ADDTASK + path + ".json", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify(data)
//     });


// }

// function displayContacts() {
//     const contactList = document.getElementById('contactListAssigned'); // Das HTML-Element für die Kontaktliste
//     console.log(firebaseData);
//     // Leere die Liste, bevor du sie mit neuen Daten füllst
//     contactList.innerHTML = '';

//     // Iteriere durch das Array und erstelle für jeden Kontakt ein neues Element
//     firebaseData.forEach(contact => {
//         const contactItem = document.createElement('div');
//         contactItem.classList.add('contact-item');
        
//         // Setze den OnClick-Handler im HTML direkt
//         contactItem.innerHTML = `
//             <p class="dropdown-initials" id="contactNumber${contact.id}">${contact.initals}</p>
//             <span class="select-position">${contact.name}</span>
//             <img src="./assets/img/checkbox_empty.png" alt="empty checkbox" />
//         `;

//         // Setze den onclick Attribut mit den Kontaktinformationen
//         contactItem.setAttribute('onclick', `selectContact(this, ${contact.id})`);

//         // Setze den Hintergrundfarbe basierend auf der Farbe des Kontakts
//         const initialsElement = contactItem.querySelector('.dropdown-initials');
//         initialsElement.style.backgroundColor = contact.color;

//         // Füge das Kontaktitem zur Kontaktliste hinzu
//         contactList.appendChild(contactItem);
//     });
// }

// function validateFormular(event) {
//     event.preventDefault();
//     validateTitle(event)
//     validateDate(event)
//     validateCategory(event)

//     if (validateIsOk.every(value => value === true)) {
//         submitForm(event)
//     }
// }


// function validateTitle(event) {
//     errorTitle.innerHTML = '';

//     if (!title.value) {
//         errorTitle.innerHTML = 'This field is required'
//         title.style.border = "2px solid #FF8190"
//         event.preventDefault();
//         validateIsOk[0] = false
//         return false
//     }
//     title.style.border = "2px solid #D1D1D1"
//     validateIsOk[0] = true;
// }

// function validateDate(event) {
//     errorDate.innerHTML = '';

//     if (!date.value) {
//         errorDate.innerHTML = 'This field is required'
//         date.style.border = "2px solid #FF8190"
//         event.preventDefault();
//         validateIsOk[1] = false
//         return false
//     }
//     date.style.border = "2px solid #D1D1D1"
//     validateIsOk[1] = true;
// }


// function validateCategory(event) {
//     errorCategory.innerHTML = '';

//     if (!category.value) {
//         errorCategory.innerHTML = 'This field is required'
//         category.style.border = "2px solid #FF8190"
//         event.preventDefault();
//         validateIsOk[2] = false
//         return false
//     }
//     category.style.border = "2px solid #D1D1D1"
//     validateIsOk[2] = true;

// }

// function clearTask() {
//     errorTitle.innerHTML = '';
//     title.style.border = ""

//     errorDate.innerHTML = '';
//     date.style.border = ""
//     date.style.color = "#D1D1D1"

//     errorCategory.innerHTML = '';
//     category.style.border = ""

//     const allContacts = document.querySelectorAll('.contact-item');

//     clearSelection()

//     subTaskOne = false;
//     subtaskTwo = false;

//     document.getElementById('editItemOne').style.display = 'none';
//     document.getElementById('editItemIconOne').style.display = 'none';
//     document.getElementById('editItemTwo').style.display = 'none';
//     document.getElementById('editItemIconTwo').style.display = 'none';

//     const addedSubtaskOne = document.getElementById('subtaskItem1');
//     addedSubtaskOne.innerHTML = '';
//     addedSubtaskOne.style.display = 'none'
//     console.log("teste");
    
//     const addedSubtaskTwo = document.getElementById('subtaskItem2');
//     addedSubtaskTwo.innerHTML = '';
//     addedSubtaskTwo.style.display = 'none'



//     const selectedContactsList = document.getElementById('selectedContactsList');
//     selectedContactsList.innerHTML = '';

// }


// function getElementsByIds() {
//     title = document.getElementById('title');
//     errorTitle = document.getElementById('error-title');

//     date = document.getElementById('due-date');
//     errorDate = document.getElementById('error-date');

//     category = document.getElementById('category');
//     errorCategory = document.getElementById('error-category');
// }


// function changeDateColor() {
//     date = document.getElementById('due-date');

//     if (date.value) {
//         date.style.color = 'black';
//     } else {
//         date.style.color = '';
//     }
// }

// function subtaskStyling(subtaskStyling) {
//     const symbolStyling = document.getElementById('symbolStyling')
//     subtaskStyling.style.border = "2px solid #29ABE2"
//     symbolStyling.style.border = "2px solid #29ABE2"
//     symbolStyling.style.borderLeft = "none"

//     // Erstelle zwei neue Bilder
//     const deleteImg = document.createElement('img');
//     deleteImg.src = './assets/img/x_task.png'; // Pfad zum ersten Bild
//     deleteImg.alt = 'delet';
//     deleteImg.id = 'deleteImg';
//     deleteImg.setAttribute("onclick", "subtaskInputDelete()")

//     const checkImg = document.createElement('img');
//     checkImg.src = './assets/img/check_task.png'; // Pfad zum zweiten Bild
//     checkImg.alt = 'checked';
//     checkImg.id = 'checkImg';
//     checkImg.setAttribute("onclick", "subtaskAppend()")

//     // Erstelle das Symbol "|"
//     const symbolTask = document.createElement('span');
//     symbolTask.textContent = '|';

//     // Füge die Bilder und das Symbol zum Container hinzu
//     symbolStyling.innerHTML = ''; // Entferne das alte Bild, falls vorhanden
//     symbolStyling.appendChild(deleteImg);
//     symbolStyling.appendChild(symbolTask);
//     symbolStyling.appendChild(checkImg);
// }

// function subtaskAppend() {
//     const subtaskInput = document.getElementById('subtask').value;
//     const addedSubtaskOne = document.getElementById('subtaskItem1');
//     const addedSubtaskTwo = document.getElementById('subtaskItem2');

//     if (!subTaskOne) {
//         addedSubtaskOne.innerHTML = subtaskInput;
//         addedSubtaskOne.style.display = "inline list-item"
//         subTaskOne = true;
//     } else if (!subtaskTwo) {
//         addedSubtaskTwo.innerHTML = subtaskInput;
//         addedSubtaskTwo.style.display = "inline list-item"
//         subtaskTwo = true;
//     }
// }

// function editItemOne(element) {
//     const editItem = document.getElementById('editItemOne');
//     const editIcons = document.getElementById('editItemIconOne');

//     element.style.display = 'none';

//     editIcons.style.display = 'flex';
//     editItem.style.display = 'block';
//     editItem.value = element.innerHTML;
// }

// function deleteItemOne() {
//     const addedSubtaskOne = document.getElementById('subtaskItem1');
//     const editItem = document.getElementById('editItemOne');
//     const editIcons = document.getElementById('editItemIconOne');
//     subTaskOne = false;

//     editIcons.style.display = 'none'
//     editItem.style.display = 'none'
//     addedSubtaskOne.innerHTML = '';
// }

// function submitItemOne() {
//     const changesItemOne = document.getElementById('editItemOne')
//     const subtaskItemOne = document.getElementById('subtaskItem1');
//     const editItem = document.getElementById('editItemOne');
//     const editIcons = document.getElementById('editItemIconOne');

//     subtaskItemOne.innerHTML = changesItemOne.value
//     subtaskItemOne.style.display = "inline list-item";
//     editIcons.style.display = 'none';
//     editItem.style.display = 'none';
// }


// function editItemTwo(element) {
//     const editItem = document.getElementById('editItemTwo');
//     const editIcons = document.getElementById('editItemIconTwo');

//     element.style.display = 'none';

//     editIcons.style.display = 'flex';
//     editItem.style.display = 'block';
//     editItem.value = element.innerHTML;
// }

// function deleteItemTwo() {
//     const addedSubtaskTwo = document.getElementById('subtaskItem2');
//     const editItem = document.getElementById('editItemTwo');
//     const editIcons = document.getElementById('editItemIconTwo');
//     subtaskTwo = false;

//     editIcons.style.display = 'none'
//     editItem.style.display = 'none'
//     addedSubtaskTwo.innerHTML = '';
// }

// function submitItemTwo() {
//     const changesItemTwo = document.getElementById('editItemTwo')
//     const subtaskItemTwo = document.getElementById('subtaskItem2');
//     const editItem = document.getElementById('editItemTwo');
//     const editIcons = document.getElementById('editItemIconTwo');

//     subtaskItemTwo.innerHTML = changesItemTwo.value
//     subtaskItemTwo.style.display = "inline list-item";
//     editIcons.style.display = 'none';
//     editItem.style.display = 'none';
// }



// function subtaskInputDelete() {
//     document.getElementById('subtask').value = "";
// }

// function resetAddtaskInput() {

//     const symbolStyling = document.getElementById('symbolStyling')
//     const plusImg = document.createElement('img');
//     const subtaskInput = document.getElementById('subtask')

//     symbolStyling.style.border = "2px solid #D1D1D1"
//     symbolStyling.innerHTML = '';
//     symbolStyling.style.borderLeft = "none"

//     subtaskInput.style.border = "2px solid #D1D1D1"
//     subtaskInput.value = "";

//     plusImg.src = './assets/img/plus_task.png'; // Pfad zum zweiten Bild
//     plusImg.alt = 'checked';
//     plusImg.id = 'checkImg';
//     symbolStyling.appendChild(plusImg);
// }

// function toggleDropdown() {
//     const assignedToElement = document.getElementById('assigned-to');
//     const customArrowAssigned = document.getElementById('customArrowAssigned');
//     const placeholderAssigned = document.getElementById('placeholderAssigned');

//     // Umschalten der "open"-Klasse für das Dropdown-Menü und das Pfeilsymbol
//     assignedToElement.classList.toggle('open');

//     customArrowAssigned.classList.toggle('open');

//     if (assignedToElement.classList.contains('open')) {
//         placeholderAssigned.innerHTML = "An |"
//     } else {
//         placeholderAssigned.innerHTML = "Select contacts to assign"
//     }
// }



// // Funktion, die überprüft, ob außerhalb des Dropdowns geklickt wurde
// document.addEventListener('click', function (event) {
//     const assignedToElement = document.getElementById('assigned-to');
//     const customArrowAssigned = document.getElementById('customArrowAssigned');
//     const placeholderAssigned = document.getElementById('placeholderAssigned');
//     const formSubtask = document.querySelector('.form-subtask');

//     if (!formSubtask.contains(event.target)) {
//         resetAddtaskInput()
//     }

//     // Überprüfen, ob der Klick außerhalb des Dropdowns war
//     if (!assignedToElement.contains(event.target)) {
//         // Dropdown schließen, wenn außerhalb geklickt wurde
//         assignedToElement.classList.remove('open');
//         customArrowAssigned.classList.remove('open'); // Pfeil zurückdrehen
//         placeholderAssigned.innerHTML = "Select contacts to assign"
//     }
// });

// // Funktion zum Auswählen und Anzeigen von Kontakten
// function selectContact(contactElement, id) {
//     // Toggle der 'selected' Klasse bei einem Klick
//     contactElement.classList.toggle('selected');

//     // Ändere das Bild je nach Auswahlstatus
//     const checkboxImage = contactElement.querySelector('img');  // Bild innerhalb des Kontakts
//     if (contactElement.classList.contains('selected')) {
//         // Wenn ausgewählt, ändere das Bild zu einem Haken-Bild
//         checkboxImage.src = "./assets/img/checkbox_checked.png";  // Beispiel für ein Haken-Bild
//     } else {
//         // Wenn nicht ausgewählt, setze das Bild zurück auf das leere Kästchen
//         checkboxImage.src = "./assets/img/checkbox_empty.png";
//     }

//     // Holen des aktuellen Bereichs für die ausgewählten Kontakte
//     const selectedContactsList = document.getElementById('selectedContactsList');

//     // Leeren des Bereichs, um neu zu laden
//     selectedContactsList.innerHTML = '';

//     // Holen aller selektierten Kontakt-Elemente
//     const selectedContacts = document.querySelectorAll('.contact-item.selected');

//     // Hinzufügen der selektierten Kontakte zum angezeigten Bereich
//     selectedContacts.forEach(contact => {
//         // Holen des Textes innerhalb des <p class="dropdown-initials">
//         const initials = contact.querySelector('.dropdown-initials').textContent.trim();

//         // Holen der Hintergrundfarbe der Initialen
//         const initialsBackgroundColor = contact.querySelector('.dropdown-initials').style.backgroundColor;

//         // Erstellen eines neuen Elements für die angezeigten Initialen
//         const selectedItem = document.createElement('div');
//         selectedItem.classList.add('selected-contact-item');
//         selectedItem.textContent = initials;

//         // Setze die Hintergrundfarbe des neuen Elements auf die Farbe der Initialen
//         selectedItem.style.backgroundColor = initialsBackgroundColor;

//         // Füge das Element zur Liste der ausgewählten Kontakte hinzu
//         selectedContactsList.appendChild(selectedItem);
//     });

// }

// // Funktion zum Zurücksetzen der Auswahl
// function clearSelection() {
//     // Entferne die 'selected' Klasse von allen Kontakt-Elementen
//     const allContacts = document.querySelectorAll('.contact-item');
//     allContacts.forEach(contact => {
//         contact.classList.remove('selected');

//         // Bild zurücksetzen auf das leere Kästchen
//         const checkboxImage = contact.querySelector('img');
//         checkboxImage.src = "./assets/img/checkbox_empty.png";  // Setzt das Bild auf das leere Kästchen zurück
//     });

//     // Leeren des Bereichs für die ausgewählten Kontakte
//     const selectedContactsList = document.getElementById('selectedContactsList');
//     selectedContactsList.innerHTML = '';  // Alle ausgewählten Kontakte entfernen
// }


// function getAddTaskData() {
//     let priority = document.querySelector('input[name="priority"]:checked');

//     formDataArray.push(document.getElementById('title').value)
//     formDataArray.push(document.getElementById('description').value)
//     formDataArray.push(document.getElementById('selectedContactsList').innerText)
//     formDataArray.push(document.getElementById('due-date').value)
//     if (priority === null) {
//         formDataArray.push("medium");
//     } else {
//         formDataArray.push(priority.value);
//     }
//     formDataArray.push(document.getElementById('category').value)
//     formDataArray.push(document.getElementById('subtaskItem1').innerText)
//     formDataArray.push(document.getElementById('subtaskItem2').innerText)

//     let arrayToObject = {
//         title: formDataArray[0],
//         description: formDataArray[1],
//         contacts: formDataArray[2].split("\n"),
//         dueDate: formDataArray[3],
//         priority: formDataArray[4],
//         category: formDataArray[5],
//         subtaskOne: formDataArray[6],
//         subtaskTwo: formDataArray[7]
//     };
//     return arrayToObject
// }

// function submitForm(event) {
//     event.preventDefault(); // Verhindert das Standard-Verhalten (Seiten-Neuladen)
//     const dataToBoard = getAddTaskData();

//     // Karte sichtbar machen und animieren
//     const card = document.getElementById('submit-card');
//     card.classList.add('visible'); // Karte sichtbar machen und animieren

//     postDatatoBoard("/tasks/to-do", dataToBoard)

//     setTimeout(function () {
//         window.location.href = './board.html';
//     }, 1500);


// }


// Globale Variablen für Kontakte und Subtasks (werden beim Öffnen des Formulars zurückgesetzt)
window.selectedContacts = []; // z. B. [{ name: "Max Mustermann" }, …]
window.selectedSubtasks = []; // z. B. [{ title: "Subtask 1", completed: false }, …]

// Weitere globale Variablen für die Validierung und Formularfelder
let validateIsOk = [false, false, false];
let title, errorTitle, date, errorDate, category, errorCategory;
let firebaseData = [];
const BASE_URL_ADDTASK = "https://join-d3707-default-rtdb.europe-west1.firebasedatabase.app/";

// Wird beim Laden der Seite aufgerufen (im Body- onload)
function initAddTask() {
  getElementsByIds();
  loadFirebaseData("contatcsFirebase"); // Kontakte laden (Pfad ggf. anpassen)
}

// Hole Formularelemente per ID
function getElementsByIds() {
  title = document.getElementById("title");
  errorTitle = document.getElementById("error-title");
  date = document.getElementById("due-date");
  errorDate = document.getElementById("error-date");
  category = document.getElementById("category");
  errorCategory = document.getElementById("error-category");
}

// Kontakte aus Firebase laden und im Dropdown anzeigen
async function loadFirebaseData(path = "") {
  let response = await fetch(BASE_URL_ADDTASK + path + ".json");
  let data = await response.json();
  // Falls Firebase-Daten als Objekt kommen, in ein Array umwandeln:
  firebaseData = data ? Object.values(data) : [];
  displayContacts();
}

function displayContacts() {
  const contactList = document.getElementById("contactListAssigned");
  contactList.innerHTML = "";
  firebaseData.forEach(contact => {
    // Erstelle ein Kontaktitem, das sowohl Initialen als auch den Namen enthält
    const contactItem = document.createElement("div");
    contactItem.classList.add("contact-item");
    contactItem.innerHTML = `
      <p class="dropdown-initials" style="background-color: ${contact.color};" id="contactNumber${contact.id}">${contact.initals}</p>
      <span class="select-position">${contact.name}</span>
      <img src="./assets/img/checkbox_empty.png" alt="empty checkbox" />
    `;
    // Beim Klick wird die Auswahl getoggelt und global aktualisiert
    contactItem.setAttribute("onclick", `selectContact(this, ${contact.id})`);
    contactList.appendChild(contactItem);
  });
}

// Beim Klick auf einen Kontakt wird er ausgewählt oder abgewählt
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

// Aktualisiert das globale Array anhand aller .contact-item.selected
function updateGlobalSelectedContacts() {
  const selectedElements = document.querySelectorAll(".contact-item.selected");
  window.selectedContacts = [];
  selectedElements.forEach(el => {
    const name = el.querySelector(".select-position").textContent.trim();
    window.selectedContacts.push({ name: name });
  });
}

// Zeigt die ausgewählten Kontakte (z. B. als Badge) im Bereich "selectedContactsList" an
function updateAssignedContactsDisplay() {
  const selectedContactsList = document.getElementById("selectedContactsList");
  selectedContactsList.innerHTML = "";
  window.selectedContacts.forEach(contact => {
    const badge = document.createElement("div");
    badge.classList.add("selected-contact-item");
    // Hier wird z. B. der erste Buchstabe als Initialen angezeigt
    badge.textContent = contact.name.charAt(0).toUpperCase();
    selectedContactsList.appendChild(badge);
  });
}

// ------------------------
// Validierung des Formulars
// ------------------------
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

// ------------------------
// Subtasks bearbeiten
// ------------------------
// Beim Klicken in den Subtask-Input wird der Rahmen farblich hervorgehoben und ein alternatives Symbol (z. B. Löschen/Check) angezeigt.
function subtaskStyling(inputElement) {
  const symbolStyling = document.getElementById("symbolStyling");
  inputElement.style.border = "2px solid #29ABE2";
  symbolStyling.style.border = "2px solid #29ABE2";
  symbolStyling.style.borderLeft = "none";
  
  // Erstelle die beiden Icons (Löschen & Check)
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
  // Wir verwenden hier zwei Listenelemente für Subtask 1 und 2.
  const addedSubtaskOne = document.getElementById("subtaskItem1");
  const addedSubtaskTwo = document.getElementById("subtaskItem2");
  
  // Wenn noch kein Subtask vorhanden, speichere ihn an Position 0
  if (!window.selectedSubtasks[0]) {
    addedSubtaskOne.innerHTML = subtaskInputValue;
    addedSubtaskOne.style.display = "inline";
    window.selectedSubtasks[0] = { title: subtaskInputValue, completed: false };
  } else if (!window.selectedSubtasks[1]) {
    // Ansonsten an Position 1
    addedSubtaskTwo.innerHTML = subtaskInputValue;
    addedSubtaskTwo.style.display = "inline";
    window.selectedSubtasks[1] = { title: subtaskInputValue, completed: false };
  }
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

// ------------------------
// Dropdown für Kontakte
// ------------------------
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

// Schließt das Dropdown, wenn außerhalb geklickt wird
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

// ------------------------
// Zusammenstellen der Task-Daten und Senden an Firebase
// ------------------------
function getAddTaskData() {
  // Bestimme die ausgewählte Priorität oder setze "medium" als Standard
  const priorityElement = document.querySelector('input[name="priority"]:checked');
  const priorityValue = priorityElement ? priorityElement.value : "medium";
  
  // Verwende das globale Array selectedContacts (z. B. [{ name: "Max Mustermann" }, …])
  // Und selectedSubtasks (als Array von Objekten)
  return {
    title: title.value.trim(),
    description: document.getElementById("description").value.trim(),
    contacts: window.selectedContacts, // z. B. [{ name: "Max Mustermann" }, { name: "Erika Musterfrau" }]
    dueDate: date.value,
    priority: priorityValue,
    category: category.value,
    subtasks: window.selectedSubtasks.filter(st => st) // nur vorhandene Subtasks übernehmen
  };
}

function submitForm(event) {
  event.preventDefault();
  const dataToBoard = getAddTaskData();
  
  // Mache eine kleine Bestätigungskarte sichtbar
  const card = document.getElementById("submit-card");
  card.classList.add("visible");
  
  postDatatoBoard("/tasks/to-do", dataToBoard);
  
  // Nach ca. 1,5 s zur Board-Seite wechseln
  setTimeout(function () {
    window.location.href = "./board.html";
  }, 1500);
}

// POST-Daten an Firebase senden (mit fetch)
async function postDatatoBoard(path = "", data = {}) {
  await fetch(BASE_URL_ADDTASK + path + ".json", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
}

// Exponiere initAddTask, damit es im Body- onload genutzt werden kann
window.initAddTask = initAddTask;
