
// Hardcoded database of contacts
const contactsDatabase = [
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
        contactItem.onclick = () => displayContactInfo(contact.name, contact.email, contact.phone, contact.initials, contact.color);
        
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
function displayContactInfo(name, email, phone, initials, color) {
    const popup = document.getElementById('contactInfoPopUp');
    document.getElementById('contactName').innerText = name;
    document.getElementById('contactEmail').innerText = email;
    document.getElementById('contactPhone').innerText = phone;
    document.getElementById('contactAdditionalInfo').innerText = 'Additional Info (if any)';

    // Display the popup
    popup.classList.remove('d-none');
}

// Function to close contact info popup
function closeContactInfo() {
    const popup = document.getElementById('contactInfoPopUp');
    popup.classList.add('d-none');
}

// Call renderContacts on page load
window.onload = function() {
    renderContacts();
};