
// Hardcoded database of contacts
const contactsDatabase = contact = [
    {
        id: 2,
        name: "Asterix",
        email: "Asterix@gallier.fr",
        phone: "012345678",
        initials: "AG",
        color: "#773DFD"
    },
    {
        id: 3,
        name: "Miraculix",
        email: "Miraculix@gallier.fr",
        phone: "012345678",
        initials: "MG",
        color: "#C558CB"
    },
    {
        id: 4,
        name: "Max Mustermann",
        email: "muster@aol.de",
        phone: "01234567890",
        initials: "MM",
        color: "#5AC493"
    },
    {
        id: 5,
        name: "Obelix",
        email: "obelix@gallier.fr",
        phone: "012345678",
        initials: "OG",
        color: "#B86581"
    }
];

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

    // Klasse 'visible' hinzufügen, um Popup anzuzeigen
    popup.classList.add('visible');
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


// Function to close contact info popup
function closeContactInfo() {
    const popup = document.getElementById('contactInfoPopUp');
    popup.classList.remove('visible'); // Hide the popup by removing the "visible" class
}


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
    const popup = document.getElementById('contactInfoPopUp');
    popup.classList.add('d-none');
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

// Call renderContacts on page load
window.onload = function() {
    renderContacts();
};