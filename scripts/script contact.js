const BASE_URL = "https://join-d3707-default-rtdb.europe-west1.firebasedatabase.app/";
let UsersAmountViaId = 0;
let currentTime = new Date()
let currentDraggedId;
let toDoTaskCount = 0;
let awaitFeedbackTaskCount = 0;
let doneTaskCount = 0;
let inProgressTaskCount = 0;
let urgentAmount = 0;
let urgentAmountDeadlines = [];
let nextDeadline = "";
let mailIsUsed = false;
let isGuestAccount = false;
accountExists = false;
let newAssigned = "";
let newAssignedBgColor = "";
let newPrio = "";
let newCategory = "";
let newTaskData = {};

/**
 * Initializes the task creation process by clearing the input fields.
 * @function stopEventBubbling
 * 
 */
function stopEventBubbling(event) {
    event.stopPropagation()
}



/**
 * Generates and appends HTML for each contact group based on the first letter of the contact names.
 * @function loadContactsSecondFunction
 * @param {string} letter - The first letter of the contact group.
 * @param {Array} contactsForLetter - The contacts under the specific letter group.
 * @param {HTMLElement} contactContainer - The container element where contacts will be displayed.
 * @returns {void}
 */
function loadContactsSecondFunction(letter, contactsForLetter, contactContainer) {
    let letterHTML = `<div class="contact-letter-section"><h2 class="letter-border">${letter}</h2>`;  
    for (let j = 0; j < contactsForLetter.length; j++) {
        const contact = contactsForLetter[j];
        const initials = getInitials(contact.name);
        letterHTML += getLoadContactTemplate(contact, initials);
    }
    letterHTML += '</div>';
    contactContainer.innerHTML += letterHTML;
}


/**
 * Hides the "new contact" and "edit contact" forms.
 * @async
 * @function cancelCreateContact
 * @returns {Promise<void>}
 */
async function cancelCreateContact() {
    const newContactForm = document.getElementById("newContactForm");
    const editContactForm = document.getElementById("editContactForm");
    if (newContactForm) newContactForm.classList.add("d-none");
    if (editContactForm) editContactForm.classList.add("d-none");
}

/**
 * Displays the "new contact" form and applies a blur background.
 * @async
 * @function renderAddContactForm
 * @returns {Promise<void>}
 */
async function renderAddContactForm() { 
    if (window.innerWidth < 1351) {
        document.getElementById("new-contact-container").classList.remove("aninmation");
        document.getElementById("new-contact-container").classList.add("aninmationTopDow");
    } else {
        document.getElementById("new-contact-container").classList.add("aninmation");
        document.getElementById("new-contact-container").classList.remove("aninmationTopDow");
    }
    
    // Zeigt das Formular an
    const newContactForm = document.getElementById("newContactForm");
    newContactForm.classList.remove("d-none");
    newContactForm.classList.add("bg-blur");
}

// Funktion zum Schließen des Formulars
function cancelCreateContact() {
    const newContactForm = document.getElementById("newContactForm");
    newContactForm.classList.add("d-none");
    newContactForm.classList.remove("bg-blur");
}

/**
 * Creates a new contact and saves it to the server after validation.
 * @async
 * @function createContact
 * @returns {Promise<void>}
 */
async function createContact() {
    const name = getName();
    const email = getEmail();
    const phone = getPhone();
    const bgColor = getRandomColor();
    if (!isValidForm(name, email, phone)) return;
    const contact = createContactObject(name, email, phone, bgColor);
    const firstLetter = getFirstLetter(name);
    try {
        const contacts = await fetchContacts();
        await saveContact(firstLetter, contacts, contact);
        resetForm();
        await loadContacts();
        cancelCreateContact();
    } catch (error) {
        console.error("Error while adding the contact:", error);
    }
}

function getName() {
    return document.getElementById("newContactName").value;
}

function getEmail() {
    return document.getElementById("newContactEmail").value;
}

function getPhone() {
    return document.getElementById("newContactPhone").value;
}

function getFirstLetter(name) {
    return name.charAt(0).toUpperCase();
}

function isValidForm(name, email, phone) {
    if (!name || !email || !phone) {
        alert("Please fill in all fields.");
        return false;
    }
    return true;
}

function createContactObject(name, email, phone, bgColor) {
    return { name, email, phone, bgColor };
}

async function fetchContacts() {
    const response = await fetch(BASE_URL + "Contacts.json");
    const contacts = await response.json();
    return contacts || {};
}

async function saveContact(firstLetter, contacts, contact) {
    if (!contacts[firstLetter]) {
        contacts[firstLetter] = [];
    }
    contacts[firstLetter].push(contact);

    await fetch(BASE_URL + "Contacts.json", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contacts),
    });
}

function resetForm() {
    document.getElementById("newContactName").value = "";
    document.getElementById("newContactEmail").value = "";
    document.getElementById("newContactPhone").value = "";
}



/**
 * Retrieves the initials of a contact's name.
 * @function getInitials
 * @param {string} name - The full name of the contact.
 * @returns {string} The initials of the contact's name.
 */
function getInitials(name) {
    if (currentUserName == "") {
        currentUserName = name;
    }
    const nameParts = name.split(' ');
    let initials = '';
    for (let i = 0; i < nameParts.length; i++) {
        initials += nameParts[i][0];
    }
    return initials.toUpperCase();
}

/**
 * Generates a random color in hexadecimal format.
 * @function getRandomColor
 * @returns {string} A random hex color code.
 */
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}



/**
 * Displays detailed information of a contact in a modal-like container.
 * @async
 * @function displayContactInfo
 * @param {string} name - The name of the contact.
 * @param {string} email - The email of the contact.
 * @param {string} phone - The phone number of the contact.
 * @param {string} initials - The initials of the contact.
 * @param {string} bgColor - The background color for the contact display.
 * @returns {Promise<void>}
 */
async function displayContactInfo(name, email, phone, initials, bgColor) {
    const contactInfoContainer = document.getElementById("contactInfo");
    const contactContainer = document.getElementById("contactContainer");    
    if (!contactInfoContainer) {
        return;
    }
    if (!name) {
        contactInfoContainer.innerHTML = "<p>Contact has been deleted.</p>";
    } else {
        contactInfoContainer.innerHTML = getContactInfoTemplate(name, email, phone, initials, bgColor);
    }    
    contactContainer.classList.toggle("mobil-hidden");
}

/**
 * Closes the contact information modal.
 * @function closeContactInfo
 * @returns {void}
 */
function closeContactInfo() {
    const contactContainer = document.getElementById("contactContainer");
    contactContainer.classList.toggle("mobil-hidden");
}

/**
 * Fetches all contacts from the server.
 * @async
 * @function fetchContacts
 * @returns {Promise<Object>} The contacts object from the server.
 */
async function fetchContacts() {
    const response = await fetch(BASE_URL + "Contacts.json");
    const contacts = await response.json();
    if (!contacts) {
        return null;
    }
    return contacts;
}

/**
 * Finds the current letter group for the contact with the specified email.
 * @function findCurrentLetter
 * @param {Object} contacts - The contacts object grouped by letters.
 * @param {string} currentEmail - The email of the contact.
 * @returns {string} The letter group where the contact belongs.
 */
function findCurrentLetter(contacts, currentEmail) {
    return Object.keys(contacts).find(letter =>
        contacts[letter]?.some(c => c.email === currentEmail)
    );
}

/**
 * Modifies the contacts object by removing the old contact and adding the updated contact.
 * @function modifyContacts
 * @param {Object} contacts - The contacts object grouped by letters.
 * @param {Object} updatedContact - The updated contact object.
 * @param {string} oldLetter - The old letter group of the contact.
 * @param {string} newLetter - The new letter group of the contact.
 * @param {string} currentEmail - The current email of the contact.
 * @returns {void}
 */
function modifyContacts(contacts, updatedContact, oldLetter, newLetter, currentEmail) {
    removeFromOldGroup(contacts, oldLetter, currentEmail);
    addToNewGroup(contacts, newLetter, updatedContact);
}


/**
 * Removes a contact from its old letter group.
 * @function removeFromOldGroup
 * @param {Object} contacts - The contacts object grouped by letters.
 * @param {string} oldLetter - The old letter group of the contact.
 * @param {string} currentEmail - The email of the contact to be removed.
 * @returns {void}
 */
function removeFromOldGroup(contacts, oldLetter, currentEmail) {
    contacts[oldLetter] = contacts[oldLetter].filter(c => c.email !== currentEmail);
    if (!contacts[oldLetter].length) delete contacts[oldLetter];
}

/**
 * Adds a contact to its new letter group.
 * @function addToNewGroup
 * @param {Object} contacts - The contacts object grouped by letters.
 * @param {string} newLetter - The new letter group of the contact.
 * @param {Object} updatedContact - The updated contact to be added.
 * @returns {void}
 */
function addToNewGroup(contacts, newLetter, updatedContact) {
    if (!contacts[newLetter]) contacts[newLetter] = [];
    contacts[newLetter].push(updatedContact);
}

/**
 * Deletes a contact based on the provided email.
 * @async
 * @function deleteContact
 * @param {string} contactEmail - The email of the contact to be deleted.
 * @returns {Promise<void>}
 */
async function deleteContact(contactEmail) {
    const response = await fetch(BASE_URL + "Contacts.json");
    const contacts = await response.json();
    const letters = Object.keys(contacts);
    for (let i = 0; i < letters.length; i++) {
        const letter = letters[i];
        const contactGroup = contacts[letter];
        const index = contactGroup.findIndex(contact => contact.email === contactEmail);
        if (index !== -1) {
            contactGroup.splice(index, 1);
            break;
        }
    }
   
}

async function addNewContactContainer() {
    document.getElementById("main-content").innerHTML = `<div class="addedContact"><p>Contact succesfully created</p> <img src="./assets/icons/Vector.svg" alt=""></div>`;
    await new Promise(r => setTimeout(r, 2000));
    loadPage('contacts');
}


function displayContactInfo(name, email, phone, additionalInfo = "") {
    // Setze die Daten des Kontakts im Modal
    document.getElementById("contactName").textContent = name;
    document.getElementById("contactEmail").textContent = email;
    document.getElementById("contactPhone").textContent = phone;
    document.getElementById("contactAdditionalInfo").textContent = additionalInfo;

    // Zeige das Modal an
    document.getElementById("contactInfoPopUp").style.display = 'flex';
}

function closeContactInfo() {
    // Schließe das Modal
    document.getElementById("contactInfoPopUp").style.display = 'none';
}

function deleteContact() {
    // In einer echten App würde hier ein Löschbefehl an die Datenbank/Server gesendet werden
    alert("Kontakt gelöscht");

    // Schließe das Kontaktinfo-Popup
    closeContactInfo();

    // Du könntest hier auch die visuelle Darstellung des Kontakts aus der Liste entfernen
    // Zum Beispiel, indem du das betreffende Element aus dem DOM entfernst.
}

function saveContactChanges() {
    const name = document.getElementById("editContactName").value;
    const email = document.getElementById("editContactEmail").value;
    const phone = document.getElementById("editContactPhone").value;

    // Aktualisiere die Kontaktinformationen im Popup
    document.getElementById("contactName").textContent = name;
    document.getElementById("contactEmail").textContent = email;
    document.getElementById("contactPhone").textContent = phone;

    // Schließe das Editierformular
    cancelCreateContact();

    alert("Kontakt wurde aktualisiert!");
}
