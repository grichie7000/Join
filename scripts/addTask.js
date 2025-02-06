let validateIsOk = [false, false, false];
let subTaskOne = false;
let subtaskTwo = false;
let title;
let errorTitle;
let date;
let errorDate;
let category;
let errorCategory;

const formDataArray = [];

function initAddTask() {
    getElementsByIds()
}


function validateFormular(event) {
    event.preventDefault();
    validateTitle(event)
    validateDate(event)
    validateCategory(event)

    if (validateIsOk.every(value => value === true)) {
        submitForm()
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

    clearSelection()

    subTaskOne = false;
    subtaskTwo = false;

    document.getElementById('editItemOne').style.display = 'none';
    document.getElementById('editItemIconOne').style.display = 'none';
    document.getElementById('editItemTwo').style.display = 'none';
    document.getElementById('editItemIconTwo').style.display = 'none';

    const addedSubtaskOne = document.getElementById('subtaskItem1');
    addedSubtaskOne.innerHTML = '';
    addedSubtaskOne.style.display = 'none'
    const addedSubtaskTwo = document.getElementById('subtaskItem2');
    addedSubtaskTwo.innerHTML = '';
    addedSubtaskTwo.style.display = 'none'



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

function subtaskAppend() {
    const subtaskInput = document.getElementById('subtask').value;
    const addedSubtaskOne = document.getElementById('subtaskItem1');
    const addedSubtaskTwo = document.getElementById('subtaskItem2');

    if (!subTaskOne) {
        addedSubtaskOne.innerHTML = subtaskInput;
        addedSubtaskOne.style.display = "inline list-item"
        subTaskOne = true;
    } else if (!subtaskTwo) {
        addedSubtaskTwo.innerHTML = subtaskInput;
        addedSubtaskTwo.style.display = "inline list-item"
        subtaskTwo = true;
    }
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
    subTaskOne = false;

    editIcons.style.display = 'none'
    editItem.style.display = 'none'
    addedSubtaskOne.innerHTML = '';
}

function submitItemOne() {
    const changesItemOne = document.getElementById('editItemOne')
    const subtaskItemOne = document.getElementById('subtaskItem1');
    const editItem = document.getElementById('editItemOne');
    const editIcons = document.getElementById('editItemIconOne');

    subtaskItemOne.innerHTML = changesItemOne.value
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
    subtaskTwo = false;

    editIcons.style.display = 'none'
    editItem.style.display = 'none'
    addedSubtaskTwo.innerHTML = '';
}

function submitItemTwo() {
    const changesItemTwo = document.getElementById('editItemTwo')
    const subtaskItemTwo = document.getElementById('subtaskItem2');
    const editItem = document.getElementById('editItemTwo');
    const editIcons = document.getElementById('editItemIconTwo');

    subtaskItemTwo.innerHTML = changesItemTwo.value
    subtaskItemTwo.style.display = "inline list-item";
    editIcons.style.display = 'none';
    editItem.style.display = 'none';
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
function selectContact(contactElement) {
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
        // Erstellen eines neuen Elements für die angezeigten Initialen
        const selectedItem = document.createElement('div');
        selectedItem.classList.add('selected-contact-item');
        selectedItem.textContent = initials;

        selectedContactsList.appendChild(selectedItem);
    });
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


function submitForm() {
    console.log(validateIsOk);

    // window.location.href = './board.html';
}