// Globale Variablen initialisieren
window.selectedContacts = [];
window.selectedSubtasks = [];

let validateIsOk = [false, false, false];
let subtaskCount = 1;  // Zähler für die Subtasks
let title;
let errorTitle;
let date;
let errorDate;
let category;
let errorCategory;
let formDataArray = [];
let firebaseData = [];
const BASE_URL_ADDTASK = "https://join-d3707-default-rtdb.europe-west1.firebasedatabase.app/";


function initAddTask() {
    getElementsByIds()
    loadFirebaseData("contactsDatabase");

    // EventListener für das Input-Feld (für die Enter-Taste)
    document.getElementById("subtask").addEventListener("keydown", function (event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Verhindert das Absenden des Formulars
            subtaskAppend();
        }
    });
}


async function loadFirebaseData(path = "") {
    let response = await fetch(BASE_URL_ADDTASK + path + ".json");
    let responseToJson = await response.json();
    firebaseData = responseToJson;
    displayContacts();
}

async function postDatatoBoard(path = "", data = {}) {
    let response = await fetch(BASE_URL_ADDTASK + path + ".json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });


}

function displayContacts() {
    let contactArray = Object.values(firebaseData);
    const contactList = document.getElementById('contactListAssigned'); // Das HTML-Element für die Kontaktliste

    // Leere die Liste, bevor du sie mit neuen Daten füllst
    contactList.innerHTML = '';


    // Iteriere durch das Array und erstelle für jeden Kontakt ein neues Element
    contactArray.forEach(contact => {
        const contactItem = document.createElement('div');
        contactItem.classList.add('contact-item');

        // Setze den OnClick-Handler im HTML direkt
        contactItem.innerHTML = `
            <p class="dropdown-initials" id="contactNumber${contact.id}">${contact.initials}</p>
            <span class="select-position">${contact.name}</span>
            <img src="./assets/img/checkbox_empty.png" alt="empty checkbox" />
        `;

        // Setze den onclick Attribut mit den Kontaktinformationen
        contactItem.setAttribute('onclick', `selectContact(this, ${contact.id})`);

        // Setze den Hintergrundfarbe basierend auf der Farbe des Kontakts
        const initialsElement = contactItem.querySelector('.dropdown-initials');
        initialsElement.style.backgroundColor = contact.color;

        // Füge das Kontaktitem zur Kontaktliste hinzu
        contactList.appendChild(contactItem);
    });
}

function validateFormular(event) {
    event.preventDefault();
    validateTitle(event)
    validateDate(event)
    validateCategory(event)

    if (validateIsOk.every(value => value === true)) {
        submitForm(event)
    }
}


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


function getElementsByIds() {
    title = document.getElementById('title');
    errorTitle = document.getElementById('error-title');

    date = document.getElementById('due-date');
    errorDate = document.getElementById('error-date');

    category = document.getElementById('category');
    errorCategory = document.getElementById('error-category');
}


function changeDateColor() {
    date = document.getElementById('due-date');

    if (date.value) {
        date.style.color = 'black';
    } else {
        date.style.color = '';
    }

    const dateInput = document.getElementById("due-date");
    const maxDate = new Date("2099-12-31"); // Maximaldatum festlegen
    const inputDate = new Date(dateInput.value);

    // Überprüfen, ob das eingegebene Datum nach dem maximalen Datum liegt
    if (inputDate > maxDate) {
        document.getElementById("error-date").innerHTML = "maximum date 2099"
        dateInput.value = ""; // Eingabe zurücksetzen
    }

}

function countContacts() {
    const container = document.getElementById('selectedContactsList');
    const divs = Array.from(container.children).filter(child => child.tagName === 'DIV');

    if (divs.length >= 5) {
        // Prüfen, ob das <p> Tag schon existiert
        if (!document.getElementById('message')) {
            // Neues <p> Tag mit einer Nachricht erstellen
            const p = document.createElement('p');
            p.id = 'message';
            p.textContent = '+' + (divs.length - 4);
            container.appendChild(p);

            // Die Anzahl der letzten Elemente, die ausgeblendet werden sollen
            let numberOfItemsToHide = divs.length - 4; // Hier kannst du die Zahl ändern

            // Alle Elemente mit der Klasse 'selected-contact-item' holen
            let selectedContacts = document.querySelectorAll('.selected-contact-item');

            // Die letzten 'numberOfItemsToHide' Elemente ausblenden
            for (let i = selectedContacts.length - numberOfItemsToHide; i < selectedContacts.length; i++) {
                selectedContacts[i].style.display = 'none';
            }
        }
    }
}

function subtaskStyling(subtaskStyling) {
    const symbolStyling = document.getElementById('symbolStyling')
    subtaskStyling.style.border = "2px solid #29ABE2"
    symbolStyling.style.border = "2px solid #29ABE2"
    symbolStyling.style.borderLeft = "none"

    // Erstelle zwei neue Bilder
    const deleteImg = document.createElement('img');
    deleteImg.src = './assets/img/x_task.png'; // Pfad zum ersten Bild
    deleteImg.alt = 'delet';
    deleteImg.id = 'deleteImg';
    deleteImg.setAttribute("onclick", "subtaskInputDelete()")

    const checkImg = document.createElement('img');
    checkImg.src = './assets/img/check_task.png'; // Pfad zum zweiten Bild
    checkImg.alt = 'checked';
    checkImg.id = 'checkImg';
    checkImg.setAttribute("onclick", "subtaskAppend()")

    // Erstelle das Symbol "|"
    const symbolTask = document.createElement('span');
    symbolTask.textContent = '|';

    // Füge die Bilder und das Symbol zum Container hinzu
    symbolStyling.innerHTML = ''; // Entferne das alte Bild, falls vorhanden
    symbolStyling.appendChild(deleteImg);
    symbolStyling.appendChild(symbolTask);
    symbolStyling.appendChild(checkImg);
}

// Funktion, um das Subtask hinzuzufügen
function subtaskAppend() {
    const inputField = document.getElementById('subtask');
    const subtaskText = inputField.value.trim();

    if (subtaskText !== '') {
        const ul = document.getElementById('addedSubtask');
        const li = document.createElement('li');
        li.classList.add('subtask-item');

        // Listenelement Inhalt
        li.innerHTML = `
            <span class="subtask-text">${subtaskText}</span>
            <div class="action-icons">
                <img src="../assets/img/edit.png" alt="edit" onclick="editSubtask(this)">
                | 
                <img src="../assets/img/addtask_bin.png" alt="delete" onclick="deleteSubtask(this)">
            </div>
        `;

        // Event-Listener hinzufügen, um Listenelement zu bearbeiten
        li.addEventListener('click', function (event) {
            // Nur den Bearbeitungsmodus aktivieren, wenn nicht auf die Icons geklickt wurde
            if (!event.target.closest('.action-icons')) {
                editSubtask(this);
            }
        });

        // Neues Subtask zur Liste hinzufügen
        ul.appendChild(li);

        // Eingabefeld nach dem Hinzufügen leeren
        inputField.value = '';
    }
}

// Funktion, um ein Subtask zu bearbeiten
function editSubtask(editIcon) {
    const li = editIcon.closest('li');
    const subtaskText = li.querySelector('.subtask-text');

    // Sicherstellen, dass das .subtask-text-Element existiert
    if (subtaskText) {
        // Klasse zum Aktivieren des Bearbeitungsmodus hinzufügen
        li.classList.add('editing');

        // Das Subtask in ein Input-Feld umwandeln
        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.value = subtaskText.textContent.trim();

        li.innerHTML = `
            <input type="text" value="${inputField.value}" class="edit-input">
            <div class="action-icons">
                <img src="../assets/img/addtask_bin.png" alt="delete" onclick="deleteSubtask(this)">
                |
                <img src="../assets/img/check_task.png" alt="check" onclick="saveSubtask(this)">
            </div>
        `;
    }
}

// Funktion, um Änderungen zu speichern
function saveSubtask(checkIcon) {
    const li = checkIcon.closest('li');
    const inputField = li.querySelector('.edit-input');
    const newText = inputField.value.trim();

    if (newText !== '') {
        li.innerHTML = `
            <span class="subtask-text">${newText}</span>
            <div class="action-icons">
                <img src="../assets/img/edit.png" alt="edit" onclick="editSubtask(this)">
                | 
                <img src="../assets/img/addtask_bin.png" alt="delete" onclick="deleteSubtask(this)">
            </div>
        `;

        // Entferne die Klasse "editing", wenn die Bearbeitung abgeschlossen ist
        li.classList.remove('editing');
    }
}

// Funktion, um ein Subtask zu löschen
function deleteSubtask(deleteIcon) {
    const li = deleteIcon.closest('li');
    li.remove();
}

// Funktion, um zu überprüfen, ob Enter gedrückt wurde
function checkEnter(event) {
    if (event.key === 'Enter') {
        subtaskAppend();
    }
}





function subtaskInputDelete() {
    document.getElementById('subtask').value = "";
}

function resetAddtaskInput() {

    const symbolStyling = document.getElementById('symbolStyling')
    const plusImg = document.createElement('img');
    const subtaskInput = document.getElementById('subtask')

    symbolStyling.style.border = "2px solid #D1D1D1"
    symbolStyling.innerHTML = '';
    symbolStyling.style.borderLeft = "none"

    subtaskInput.style.border = "2px solid #D1D1D1"
    subtaskInput.value = "";

    plusImg.src = './assets/img/plus_task.png'; // Pfad zum zweiten Bild
    plusImg.alt = 'checked';
    plusImg.id = 'checkImg';
    symbolStyling.appendChild(plusImg);
}

function toggleDropdown() {
    const assignedToElement = document.getElementById('assigned-to');
    const customArrowAssigned = document.getElementById('customArrowAssigned');
    const placeholderAssigned = document.getElementById('placeholderAssigned');

    // Umschalten der "open"-Klasse für das Dropdown-Menü und das Pfeilsymbol
    assignedToElement.classList.toggle('open');

    customArrowAssigned.classList.toggle('open');

    if (assignedToElement.classList.contains('open')) {
        placeholderAssigned.innerHTML = "An |"
    } else {
        placeholderAssigned.innerHTML = "Select contacts to assign"
    }
}



// Funktion, die überprüft, ob außerhalb des Dropdowns geklickt wurde
document.addEventListener('click', function (event) {
    const assignedToElement = document.getElementById('assigned-to');
    const customArrowAssigned = document.getElementById('customArrowAssigned');
    const placeholderAssigned = document.getElementById('placeholderAssigned');
    const formSubtask = document.querySelector('.form-subtask');

    if (!formSubtask.contains(event.target)) {
        resetAddtaskInput()
    }

    // Überprüfen, ob der Klick außerhalb des Dropdowns war
    if (!assignedToElement.contains(event.target)) {
        // Dropdown schließen, wenn außerhalb geklickt wurde
        assignedToElement.classList.remove('open');
        customArrowAssigned.classList.remove('open'); // Pfeil zurückdrehen
        placeholderAssigned.innerHTML = "Select contacts to assign"
    }
});

// Funktion zum Auswählen und Anzeigen von Kontakten
function selectContact(contactElement, id) {
    // Toggle der 'selected' Klasse bei einem Klick
    contactElement.classList.toggle('selected');

    // Ändere das Bild je nach Auswahlstatus
    const checkboxImage = contactElement.querySelector('img');  // Bild innerhalb des Kontakts
    if (contactElement.classList.contains('selected')) {
        // Wenn ausgewählt, ändere das Bild zu einem Haken-Bild
        checkboxImage.src = "./assets/img/checkbox_checked.png";  // Beispiel für ein Haken-Bild
    } else {
        // Wenn nicht ausgewählt, setze das Bild zurück auf das leere Kästchen
        checkboxImage.src = "./assets/img/checkbox_empty.png";
    }

    // Holen des aktuellen Bereichs für die ausgewählten Kontakte
    const selectedContactsList = document.getElementById('selectedContactsList');

    // Leeren des Bereichs, um neu zu laden
    selectedContactsList.innerHTML = '';

    // Holen aller selektierten Kontakt-Elemente
    const selectedContacts = document.querySelectorAll('.contact-item.selected');

    // Hinzufügen der selektierten Kontakte zum angezeigten Bereich
    selectedContacts.forEach(contact => {
        // Holen des Textes innerhalb des <p class="dropdown-initials">
        const initials = contact.querySelector('.dropdown-initials').textContent.trim();

        // Holen der Hintergrundfarbe der Initialen
        const initialsBackgroundColor = contact.querySelector('.dropdown-initials').style.backgroundColor;

        // Erstellen eines neuen Elements für die angezeigten Initialen
        const selectedItem = document.createElement('div');
        selectedItem.classList.add('selected-contact-item');
        selectedItem.textContent = initials;

        // Setze die Hintergrundfarbe des neuen Elements auf die Farbe der Initialen
        selectedItem.style.backgroundColor = initialsBackgroundColor;

        // Füge das Element zur Liste der ausgewählten Kontakte hinzu
        selectedContactsList.appendChild(selectedItem);
    });

    countContacts()
}

// Funktion zum Zurücksetzen der Auswahl
function clearSelection() {
    // Entferne die 'selected' Klasse von allen Kontakt-Elementen
    const allContacts = document.querySelectorAll('.contact-item');
    allContacts.forEach(contact => {
        contact.classList.remove('selected');

        // Bild zurücksetzen auf das leere Kästchen
        const checkboxImage = contact.querySelector('img');
        checkboxImage.src = "./assets/img/checkbox_empty.png";  // Setzt das Bild auf das leere Kästchen zurück
    });

    // Leeren des Bereichs für die ausgewählten Kontakte
    const selectedContactsList = document.getElementById('selectedContactsList');
    selectedContactsList.innerHTML = '';  // Alle ausgewählten Kontakte entfernen
}


function getAddTaskData() {
    let priority = document.querySelector('input[name="priority"]:checked');

    formDataArray.push(document.getElementById('title').value)
    formDataArray.push(document.getElementById('description').value)
    let contacts = [];
    document.querySelectorAll('#contactListAssigned .selected .select-position').forEach(item => {
        let contact = {
            name: item.innerText
        };

        contacts.push(contact);
    });
    formDataArray.push(document.getElementById('due-date').value)
    if (priority === null) {
        formDataArray.push("medium");
    } else {
        formDataArray.push(priority.value);
    }
    formDataArray.push(document.getElementById('category').value)
    // Hole alle span-Elemente mit der Klasse 'subtask-text' innerhalb des ul-Elements
    let subtaskTexts = document.querySelectorAll('#addedSubtask .subtask-text');

    // Iteriere über alle gefundenen span-Elemente und füge deren Text in das Array hinzu
    subtaskTexts.forEach(function (subtask) {
        formDataArray.push(subtask.textContent);
    });


    let arrayToObject = {
        title: formDataArray[0],  
        description: formDataArray[1],  
        contacts: contacts,  
        dueDate: formDataArray[2],  
        priority: formDataArray[3],  
        category: formDataArray[4],  
        subtasks: []  // Initialisiere das Array für Subtasks
    };

// Dynamisch Subtasks hinzufügen, basierend auf der Länge von formDataArray
for (let i = 5; i < formDataArray.length; i++) {
    arrayToObject.subtasks.push({
        title: formDataArray[i],
        completed: false  // Alle Subtasks sind standardmäßig nicht abgeschlossen
    });
}

    return arrayToObject
}

function submitForm(event) {
    event.preventDefault(); // Verhindert das Standard-Verhalten (Seiten-Neuladen)
    const dataToBoard = getAddTaskData();

    // Karte sichtbar machen und animieren
    const card = document.getElementById('submit-card');
    card.classList.add('visible'); // Karte sichtbar machen und animieren

    postDatatoBoard("/tasks/to-do", dataToBoard)

    setTimeout(function () {
        window.location.href = './board.html';
    }, 1500);


}