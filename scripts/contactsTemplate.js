
/**
 * Renders a list of contacts grouped by the first letter of the name.
 * Creates a section for each group (alphabet letter) and includes contact items for each user in that group.
 * @param {Object} usergroup - The object containing user groups, where keys are alphabet letters and values are arrays of users.
 * @param {string} alphabet - The alphabet letter representing the current group.
 * @returns {string} - The HTML structure for the contact group, including all users in that group.
 */

function renderContactList(usergroup, alphabet) {
    let group = `<div class="contact-group">
            <h3 class="group-title">${alphabet}</h3>
            <div class="divider-contact"></div>`;
    usergroup[alphabet].forEach(user => {
        userArray.push(user);
        group += renderContactListItem(user) + `</div>`;    
    });
    return group; 
}

/**
 * Renders a single contact list item with the user's initials, name, and email.
 * This item is clickable and triggers the `showContactDetails` function when clicked.
 * @param {Object} user - The user object containing the user's details (name, email, color, id).
 * @returns {string} - The HTML structure for a contact item.
 */

function renderContactListItem(user) {
    let initials = user.name.split(' ').map(name => name.charAt(0).toUpperCase()).join('');
    let capitalizedUserName = user.name.split(' ').map(name => name.charAt(0).toUpperCase() + name.slice(1)).join(' ');
    return `
        <div class="contact-item" tabindex="0" onclick="showContactDetails('${user.id}')">
                <span class="contact-icon center" style="background-color:${user.color}">${initials}</span>
                <div class="contact-details">
                    <span class="contact-name">${capitalizedUserName}</span>
                    <span class="contact-email">${user.email}</span>
                </div>
            </div>
    `;
}

/**
 * Renders detailed contact information for a single user, including their name, email, phone number,
 * and provides options to edit or delete the user.
 * @param {Object} user - The user object containing the user's details (name, email, phone, color, firebaseId, id).
 * @returns {string} - The HTML structure for displaying a user's contact details.
 */

function renderContactDetails(user) {
    let initials = user.name.split(' ').map(name => name.charAt(0).toUpperCase()).join('');
    let capitalizedUserName = user.name.split(' ').map(name => name.charAt(0).toUpperCase() + name.slice(1)).join(' ');
    return `
    <div class="contact-header">
        <span class="contact-icon-border center" style="background-color: ${user.color}">${initials}</span>
        <div class="contact-info-div">
            <h2 class="contact-name">${capitalizedUserName}</h2>
            <div class="contact-buttons" id="contact-buttons">
                <button class="contact-btn" onclick="editContact('${userArray.indexOf(user)}')">
                    <img src="./assets/img/edit.png">
                    <p>Edit</p>
                </button>
                <button class="contact-btn" onclick="deleteUser('${user.firebaseId}')">
                    <img src="./assets/img/delete.png">
                    <p>Delete</p>
                </button>
            </div>
        </div>
    </div>
    <div class="contact-info">
        <div class="contact-info-mag">
            <p>Contact Information</p>
        </div>
        <div class="contact-info-mp">
            <p class="contact-bold">Email</p>
            <p class="contact-info-mail">${user.email}</p>
            <p class="contact-bold">Phone</p>
            <p>${user.phone}</p>
        </div>
    </div>`;
}

/**
 * Renders the popup form for editing a contact's information, including name, email, phone, and options to save or delete.
 * Displays the contact's initials and pre-fills the form with the user's current details.
 * @param {number} user - The index of the user in the `userArray` to be edited.
 * @returns {string} - The HTML structure for the popup form to edit the contact.
 */
 
function renderEditContact(user) {
    let initials = userArray[user].name.split(' ').map(name => name.charAt(0).toUpperCase()).join('');
    return `<div class="popup" onclick="event.stopPropagation();">
    <div class="popup-left">

        <!-- MOBIEL -->
        <div class="close-btn-mobile">
            <button onclick="closeContactForm()">
                <img src="./assets/img/close-white.png" alt="">
            </button>
        </div>
        <!-- MOBIEL -->

        <div class="logo">
            <img src="./assets/img/Join-logo.png">
        </div>
        <h1>Edit contact</h1>
    </div>

    <div class="icon-wrapper">
        <span class="add-contact-initials center" style="background-color: ${userArray[user].color};">${initials}</span>
    </div>

    <div class="popup-right">
        <div class="close-btn-wrapper">
            <button onclick="closeContactForm()">
                <img src="./assets/img/x_symbol.png" alt="">
            </button>
        </div>
        <form class="popup-form" onsubmit="event.preventDefault(); updateUser(${user});">
            <div class="form-group">
                <div class="input-icon">
                    <input type="text" id="name" placeholder="Name" required value="${userArray[user].name}" onchange="validateContactForm()">
                    <img src="./assets/img/person.png">
                </div>
                <div class="error-message" id="error-div-name"> </div>
            </div>
            <div class="form-group">
                <div class="input-icon">
                    <input type="email" id="email" placeholder="Email" required value="${userArray[user].email}" onchange="validateContactForm()">
                    <img src="./assets/img/mail.svg">
                </div>
                <div class="error-message" id="error-div-email"> </div>
            </div>
            <div class="form-group">
                <div class="input-icon">
                    <input type="text" id="phone" placeholder="Phone" required value="${userArray[user].phone}" onchange="validateContactForm()" oninput="validatePhoneInput(event)">
                    <img src="./assets/img/call.png">
                </div>
                <div class="error-message" id="error-div-phone"> </div>
            </div>
             <div class="btn">
                <button type="button" class="delete-btn btn-center" onclick="deleteUser('${userArray[user].firebaseId}')">Delete</button>
                <button type="submit" class="save-btn gap btn-center">
                    Save
                    <img src="./assets/img/check.png">
                </button>
            </div> 
        </form>
    </div>
</div>`
}

/**
 * Renders the popup form for adding a new contact, including name, email, phone, and options to create or clear the form.
 * @returns {string} - The HTML structure for the popup form to add a new contact.
 */

function renderNewContact() {    
    return `<div class="popup" onclick="event.stopPropagation();">
            <div class="popup-left">

                <!-- MOBIEL -->
                <div class="close-btn-mobile">
                    <button onclick="closeContactForm()">
                        <img src="./assets/img/close-white.png" alt="">
                    </button>
                </div>
                <!-- MOBIEL -->

                <div class="logo">
                    <img src="./assets/img/Join-logo.png">
                </div>
                <h1>Add contact</h1>
                <p class="text-color">Tasks are better with a team!</p>
                <div class="divider-add-contact"></div>
            </div>

            <div class="icon-wrapper">
                <span class="add-contact-icon center" style="background-color: #747474;"><img
                        src="./assets/img/person-white.svg"></span>
            </div>

            <div class="popup-right">
                <div class="close-btn-wrapper">
                    <button onclick="closeContactForm()">
                        <img src="./assets/img/close-white.png" alt="">
                    </button>
                </div>
                <form class="popup-form" onsubmit="event.preventDefault(); createUserContact();">
                    <div class="form-group">
                        <div class="input-icon">
                            <input type="text" id="name" placeholder="Name" required onchange="validateContactForm()">
                            <img src="./assets/img/person.png">
                        </div>
                        <div class="error-message" id="error-div-name"> </div>
                    </div>
                    <div class="form-group">
                        <div class="input-icon">
                            <input type="email" id="email" placeholder="Email" required onchange="validateContactForm()">
                            <img src="./assets/img/mail.svg">
                        </div>
                        <div class="error-message" id="error-div-email"> </div>
                    </div>
                    <div class="form-group">
                        <div class="input-icon">
                            <input type="text" id="phone" placeholder="Phone" required onchange="validateContactForm()" oninput="validatePhoneInput(event)">
                            <img src="./assets/img/call.png">
                        </div>
                        <div class="error-message" id="error-div-phone"> </div>
                    </div>
                    <div class="btn">
                        <button type="button" class="cancel-btn btn-center" onclick="clearContactForm()">
                            Clear
                            <img src="./assets/img/close-white.png">
                        </button>
                        <button type="submit" class="create-btn btn-center gap">
                            Create contact
                            <img src="./assets/img/check-white.svg">
                        </button>
                    </div>
                </form>
            </div>
        </div>`
}

/**
 * Renders the popup options to edit or delete a contact.
 * Provides buttons for the user to edit or delete the contact.
 * @param {Object} user - The user object containing the user's details (firebaseId, name).
 * @returns {string} - The HTML structure for the edit and delete options.
 */

function renderEditDeletePopup(user) {
    return `<li><button class="contact-btn" onclick="editContact('${userArray.indexOf(user)}', removeEditDel())">
                <img src="./assets/img/edit.png">
                <p>Edit</p>
            </button>
            </li>
            <li>
            <button class="contact-btn" onclick="deleteUser('${user.firebaseId}', removeEditDel())">
                <img src="./assets/img/delete.png">
                <p>Delete</p>
            </button>
            </li>`
}

/**
 * Validates and formats the phone number input by removing any non-numeric characters.
 * Ensures that only numbers are allowed in the phone number input field.
 * @param {Event} event - The input event triggered when the user types in the phone field.
 */

function validatePhoneInput(event) {
    const input = event.target;
    const validValue = input.value.replace(/[^0-9]/g, ''); 
    input.value = validValue; 
}