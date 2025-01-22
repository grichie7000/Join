
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';  
import { getDatabase, ref, get, set, child } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js';

// Firebase-Konfiguration
const app = initializeApp({
    apiKey: "AIzaSyBCuA1XInnSHfEyGUKQQqmqRgvqfhx7dHc",
    authDomain: "join-d3707.firebaseapp.com",
    databaseURL: "https://join-d3707-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "join-d3707",
    storageBucket: "join-d3707.firebasestorage.app",
    messagingSenderId: "961213557325",
    appId: "1:961213557325:web:0253482ac485b4bb0e4a04"
});

// Initialisierung der Firebase-App

const db = getDatabase(initializeApp(firebaseConfig));


// Hardcoded database of contacts
const contactsDatabase = contact = databaseURL;

// Funktion zum Rendern der Kontakte
function renderContacts() {
    const contactsContainer = document.getElementById('showContacts');
    contactsContainer.innerHTML = ''; // Vorhandene Kontakte löschen

    contactsDatabase.forEach(contact => {
        const contactSection = document.createElement('div');
        contactSection.classList.add('contact-letter-section');

        const letterSection = document.createElement('h2');
        letterSection.classList.add('letter-border');
        letterSection.innerText = contact.initials.charAt(0); // Erstes Buchstabe des Namens

        const contactItem = document.createElement('div');
        contactItem.classList.add('contact-item');
        contactItem.onclick = () => displayContactInfo(contact); // Klick-Event für die Anzeige

        const initialsDiv = document.createElement('div');
        initialsDiv.classList.add('initials');
        initialsDiv.style.backgroundColor = contact.color;
        initialsDiv.innerText = contact.initials;

        const contactDetails = document.createElement('div');
        const contactName = document.createElement('p');
        contactName.innerHTML = `<strong>${contact.name}</strong><br><p class="email">${contact.email}</p>`;

        contactDetails.appendChild(contactName);

        contactItem.appendChild(initialsDiv);
        contactItem.appendChild(contactDetails);

        contactSection.appendChild(letterSection);
        contactSection.appendChild(contactItem);

        contactsContainer.appendChild(contactSection);
    });
}



// Funktion zum Anzeigen der Kontaktinformationen im Popup
function displayContactInfo(contact) {
    const popup = document.getElementById('contactInfoPopUp');

    // Popup-Daten füllen
    document.getElementById('contactName').innerText = contact.name;
    document.getElementById('contactEmail').innerText = contact.email;
    document.getElementById('contactPhone').innerText = contact.phone;
    document.getElementById('contactAdditionalInfo').innerText = 'Additional Info (if any)';

    // Formular vorbefüllen
    document.getElementById('editName').value = contact.name;
    document.getElementById('editEmail').value = contact.email;
    document.getElementById('editPhone').value = contact.phone;

    // Setze den aktuellen Kontakt, der bearbeitet wird
    currentContact = contact;

    // Popup anzeigen, indem d-none entfernt und d-flex hinzugefügt wird
    popup.classList.remove('d-none');
    popup.classList.add('d-flex');
}

// Funktion zum Schließen des Popups
function closeContactDetails() {
    const popup = document.getElementById('contactInfoPopUp');
    popup.classList.add('d-none'); // Popup ausblenden
    popup.classList.remove('d-flex'); // d-flex entfernen, um es auszublenden
}

// Funktion zum Speichern der Änderungen
function saveContactChanges(event) {
    event.preventDefault();

    const newName = document.getElementById('editName').value;
    const newEmail = document.getElementById('editEmail').value;
    const newPhone = document.getElementById('editPhone').value;

    // Aktualisiere den Kontakt in der Datenbank
    if (currentContact) {
        currentContact.name = newName;
        currentContact.email = newEmail;
        currentContact.phone = newPhone;
    }
    renderContacts();

    // Schließe das Popup nach dem Speichern der Änderungen
    closeContactInfo();
}

// Funktion zum Schließen des Popups
function closeContactInfo() {
    const popup = document.getElementById('contactInfoPopUp');
    popup.classList.remove('visible'); // Popup ausblenden
}

// Beim Laden der Seite Kontakte rendern
window.onload = function() {
    renderContacts();
};

// Function to display contact information in a popup



// Store the contact being edited
let currentContact = null;

// Function to render contacts on the page
function renderContacts() {
    const contactsContainer = document.getElementById('showContacts');
    contactsContainer.innerHTML = ''; // Clear existing contacts

    contactsDatabase.forEach(contact => {
        const contactSection = document.createElement('div');
        contactSection.classList.add('contact-letter-section');

        const letterSection = document.createElement('h2');
        letterSection.classList.add('letter-border');
        letterSection.innerText = contact.initials.charAt(0); // Display first letter of the name

        const contactItem = document.createElement('div');
        contactItem.classList.add('contact-item');
        contactItem.onclick = () => displayContactInfo(contact);

        const initialsDiv = document.createElement('div');
        initialsDiv.classList.add('initials');
        initialsDiv.style.backgroundColor = contact.color;
        initialsDiv.innerText = contact.initials;

        const contactDetails = document.createElement('div');
        const contactName = document.createElement('p');
        contactName.innerHTML = `<strong>${contact.name}</strong><br><p class="email">${contact.email}</p>`;

        contactDetails.appendChild(contactName);

        contactItem.appendChild(initialsDiv);
        contactItem.appendChild(contactDetails);

        contactSection.appendChild(letterSection);
        contactSection.appendChild(contactItem);

        contactsContainer.appendChild(contactSection);
    });
}

// Diese Funktion wird aufgerufen, um das Editier-Popup zu schließen
function closeEditPopup() {
    document.getElementById("editPopUp").classList.add("d-none");
    document.getElementById("editPopUp").classList.remove("d-flex");
}

// Function to display contact information in a popup
function displayContactInfo(contact) {
    const popup = document.getElementById('contactInfoPopUp');
    document.getElementById('contactName').innerText = contact.name;
    document.getElementById('contactEmail').innerText = contact.email;
    document.getElementById('contactPhone').innerText = contact.phone;
    document.getElementById('contactAdditionalInfo').innerText = 'Additional Info (if any)';

    // Prefill edit form with contact info
    document.getElementById('editName').value = contact.name;
    document.getElementById('editEmail').value = contact.email;
    document.getElementById('editPhone').value = contact.phone;

    // Set the current contact being edited
    currentContact = contact;

    // Display the popup
    popup.classList.remove('d-none')
	popup.classList.add('d-flex');
}

// Function to close contact info popup
function closeContactInfo() {
    const popup = document.getElementById('editPopUp');
    popup.classList.add('d-none');
	 popup.classList.remove('d-flex')
}


// Function to close contact info popup
function closeContactDetails() {
    const popup1 = document.getElementById('contactInfoPopUp');
    popup1.classList.add('d-none');
	 popup1.classList.remove('d-flex');
}


// Diese Funktion wird aufgerufen, wenn auf den Editier-Button geklickt wird
function displayEditPopup(contact) {
	
	    closeContactDetails();
	
    // Setze die Eingabefelder im Editier-Popup mit den Kontaktinformationen
    document.getElementById('contactName').innerText = contact.name;
    document.getElementById('contactEmail').innerText = contact.email;
    document.getElementById('contactPhone').innerText = contact.phone;

    // Setze den Hintergrund des Popups (falls gewünscht)

    // Zeige das Editier-Popup an, indem die d-none-Klasse entfernt und d-flex hinzugefügt wird
   document.getElementById("editPopUp").classList.remove("d-none");
    document.getElementById("editPopUp").classList.add("d-flex");
}


function saveContactToFirebase(contact) {
    const contactRef = ref(db, 'contactsDatabase/' + contact.id); // Jeder Kontakt wird unter 'contactsDatabase/{id}' gespeichert
    set(contactRef, {
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        initials: contact.initials,
        color: contact.color
    });
}


// Function to save the edited contact
function saveContactChanges(event) {
    event.preventDefault();

    const newName = document.getElementById('editName').value;
    const newEmail = document.getElementById('editEmail').value;
    const newPhone = document.getElementById('editPhone').value;

    // Update the contact in the database
    if (currentContact) {
        currentContact.name = newName;
        currentContact.email = newEmail;
        currentContact.phone = newPhone;
    }

    // Re-render the contacts to reflect changes
    renderContacts();

    // Close the popup after saving changes
    closeContactInfo();
}

function loadContactsFromFirebase() {
    const contactsRef = ref(db, 'contacts');
    get(contactsRef).then((snapshot) => {
        if (snapshot.exists()) {
            const contacts = snapshot.val();
            renderContacts(contacts);
        } else {
            console.log("Keine Kontakte gefunden!");
        }
    }).catch((error) => {
        console.error("Fehler beim Abrufen der Kontakte:", error);
    });
}

// Call renderContacts on page load
window.onload = function() {
    renderContacts();
};