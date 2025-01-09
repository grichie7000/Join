/**
 * Resets the contact list in the "Add Task" section to its default state.
 */
 function resetContactList() {
    document.getElementById("openContactsDiv").innerHTML =
        `<div class="singleContact">
                    <input type="checkbox" name="namevehicle1" id="vehicle1" value="basicText">
                    <label for="vehicle1">Select contacts to assign</label><br>
                </div>`
}

/**
 * Renders individual contacts in the "Add Task" section.
 * @param {Object} responseToJson - The JSON response containing the contact data.
 * @param {number} indexContactWithLetter - The index of the contact in the response data.
 */
function renderContact(responseToJson, indexContactWithLetter) {
    let name = responseToJson[indexContactWithLetter].name;
    let color = responseToJson[indexContactWithLetter].bgColor;
    if (selectedContatct.includes(name)) {
        document.getElementById("openContactsDiv").innerHTML +=
            `<div class="singleContact selectedContact" id="${name}">
            <input type="checkbox" name="${name}" id="ID${name}" value="${name}" onclick="contactSelected('${name}', '${color}')" checked>
             <label for="ID${name}">${name}</label><br>
        </div>`
    } else {
        document.getElementById("openContactsDiv").innerHTML +=
            `<div class="singleContact" id="${name}">
            <input type="checkbox" name="${name}" id="ID${name}" value="${name}" onclick="contactSelected('${name}', '${color}')">
             <label for="ID${name}">${name}</label><br>
        </div>`
    }
}

/**
 * Generates the HTML template for displaying a contact in a contact list.
 * The contact's initials, name, email, and background color are dynamically inserted into the template.
 * 
 * @param {Object} contact - The contact object containing the details (name, email, phone, bgColor).
 * @param {string} initials - The initials of the contact to be displayed.
 * @returns {string} The HTML template for a contact item.
 */
function getLoadContactTemplate(contact, initials) {
    return `
        <div class="contact-item" onclick="displayContactInfo('${contact.name}', '${contact.email}', '${contact.phone}', '${initials}', '${contact.bgColor}')">
            <div class="initials" style="background-color: ${contact.bgColor};">${initials}</div>
            <div>
                <p><strong>${contact.name}</strong><br></p><p class="email">${contact.email}</p>
            </div>
        </div>
    `;
}

/**s
 * Generates the HTML template for displaying detailed information of a contact.
 * This template includes options to edit or delete the contact, as well as the contact's email and phone number.
 * 
 * @param {string} name - The name of the contact.
 * @param {string} email - The email of the contact.
 * @param {string} phone - The phone number of the contact.
 * @param {string} initials - The initials of the contact.
 * @param {string} bgColor - The background color of the contact's initials.
 * @returns {string} The HTML template for contact details.
 */
function getContactInfoTemplate(name, email, phone, initials, bgColor) {
    return `
        <div class="contact-info-container">
            <div class="flex gap-8 items-center">
                <div class="initials contact-details-img" style="background-color: ${bgColor};">${initials}</div>
                <div>
                    <h2>${name}</h2>
                    <div class="reesponsive-detail-contact-button">
                        <button class="flex" onclick="editContact('${email}')"><img src="assets/icons/edit.png" alt=""> Edit</button>
                        <button class="flex" onclick="deleteContact('${email}')"><img src="assets/icons/delete.png" alt=""> Delete</button>
                    </div>
                </div>
            </div>                    
        </div>
        <div class="my-8"><h3>Contact Information</h3></div>
        <div class="flex flex-col gap-4">
            <h5><strong>Email</strong></h5>
            <a href="mailto:${email}" class="email">${email}</a>
            <h5><strong>Phone</strong></h5>
            <a href="tel:${phone}" class="phone-number">${phone}</a>
        </div>
        <div>
            <div class="responsive-contact-buttons">
               <button class="flex" onclick="showOtherButtons()"><img src="./assets/icons/Menu Contact options.svg" alt=""></button>
            <div class="responsive-contact-button-Div d-none" id="responsive-contact-buttons">
                <button class="flex" onclick="editContact('${email}')"><img src="assets/icons/edit.png" alt=""> Edit</button>
                <button class="flex" onclick="deleteContact('${email}')"><img src="assets/icons/delete.png" alt=""> Delete</button>
                </div>
            </div>
        </div>`;
}

/**
 * Updates the UI with buttons for deleting or saving the edited contact.
 * 
 * @param {string} contactEmail - The email of the contact being edited.
 */
function getCurrentMailForButtons(contactEmail) {
    document.getElementById("new-contact-button-container").innerHTML = ` 
        <div class="cancel cursor-pointer" data-email="${contactEmail}" onclick="deleteContact('${contactEmail}')">
            <button>Delete</button>
        </div>
        <div class="create btnGray" onclick="validateEditForm()">
            <button>Save</button>
            <img src="assets/icons/check.png" alt="">
        </div>`;
}