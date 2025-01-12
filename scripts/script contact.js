

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



function showOtherButtons() {
    document.getElementById("responsive-contact-buttons").classList.toggle("d-none")
}

/**
 * Edits an existing contact's information.
 * @async
 * @function editContact
 * @param {string} contactEmail - The email of the contact to be edited.
 * @returns {Promise<void>}
 */
 async function editContact(contactEmail) {
    handleEditFormAnimation();
    const contacts = await fetchContacts();
    if (!contacts) return;

    const foundContact = findContactByEmail(contacts, contactEmail);
    if (!foundContact) return;

    populateEditForm(foundContact);
    setupEditFormOverlay(foundContact, contactEmail);
}

function handleEditFormAnimation() {
    const editForm = document.getElementById("new-contact-containerEdit");
    if (window.innerWidth < 1351) {
        editForm.classList.remove("aninmation");
        editForm.classList.add("aninmationTopDow");
    } else {
        editForm.classList.add("aninmation");
        editForm.classList.remove("aninmationTopDow");
    }
}

function findContactByEmail(contacts, contactEmail) {
    const letters = Object.keys(contacts);
    for (let i = 0; i < letters.length; i++) {
        const letter = letters[i];
        const contactGroup = contacts[letter];
        const foundContact = contactGroup.find(c => c.email === contactEmail);
        if (foundContact) return foundContact;
    }
    return null;
}

function populateEditForm(foundContact) {
    const nameInput = document.getElementById("editContactName");
    const emailInput = document.getElementById("editContactEmail");
    const phoneInput = document.getElementById("editContactPhone");
    if (nameInput && emailInput && phoneInput) {
        nameInput.value = foundContact.name;
        emailInput.value = foundContact.email;
        phoneInput.value = foundContact.phone;
    }
}

/**
 * Saves the edited contact details back to the server.
 * @async
 * @function saveEditedContact
 * @returns {Promise<void>}
 */
async function saveEditedContact() {
    const { name, email, phone, currentEmail, bgColor } = getEditedContactInputs();
    if (!name || !email || !phone || !currentEmail) {
        alert("Please fill in all fields.");
        return;
    }
    const contacts = await fetchContacts();
    if (!contacts) return console.log("No contacts found in Firebase.");    
    const updatedContact = { name, email, phone, bgColor };
    const { oldLetter, newLetter } = getLetterGroups(contacts, name, currentEmail);
    modifyContacts(contacts, updatedContact, oldLetter, newLetter, currentEmail);    
    await saveContacts(contacts);
    finalizeContactEditing(updatedContact);
    displayContactInfo(name, email, phone, name.charAt(0).toUpperCase(), bgColor);
}

/**
 * Collects the edited contact data from the form.
 * @function getEditedContactInputs
 * @returns {Object} The edited contact's name, email, phone, bgColor, and currentEmail.
 */
function getEditedContactInputs() {
    const form = document.getElementById("editContactForm");
    return {
        name: document.getElementById("editContactName")?.value.trim(),
        email: document.getElementById("editContactEmail")?.value.trim(),
        phone: document.getElementById("editContactPhone")?.value.trim(),
        bgColor: form?.dataset.bgColor,
        currentEmail: form?.dataset.currentEmail,
    };
}

/**
 * Determines the old and new letter groups based on the edited contact's information.
 * @function getLetterGroups
 * @param {Object} contacts - The contacts object grouped by letters.
 * @param {string} newName - The new name of the contact.
 * @param {string} currentEmail - The current email of the contact.
 * @returns {Object} An object containing the old and new letter groups.
 */
function getLetterGroups(contacts, newName, currentEmail) {
    const oldLetter = findCurrentLetter(contacts, currentEmail);
    const newLetter = newName.charAt(0).toUpperCase();
    return { oldLetter, newLetter };
}

/**
 * Saves the updated contacts object to the server.
 * @async
 * @function saveContacts
 * @param {Object} contacts - The contacts object to be saved.
 * @returns {Promise<void>}
 */
async function saveContacts(contacts) {
    await fetch(BASE_URL + "Contacts.json", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contacts),
    });
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





function openEditContactForm() {
    const name = document.getElementById("contactName").textContent;
    const email = document.getElementById("contactEmail").textContent;
    const phone = document.getElementById("contactPhone").textContent;

    // Füllen des Formulars mit den aktuellen Kontaktinformationen
    document.getElementById("editContactName").value = name;
    document.getElementById("editContactEmail").value = email;
    document.getElementById("editContactPhone").value = phone;

    // Zeige das Editierformular an
    document.getElementById("editContactForm").classList.remove("d-none");

    // Schließe das Kontaktinfo-Popup
    closeContactInfo();
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