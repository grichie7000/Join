/**
 * render the contact list
 * @param {*} usergroup - the user-group
 * @param {*} alphabet - the current alphabet
 * @returns 
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
 * render the user item
 * @param {*} user 
 * @returns 
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
 * renderer the contact details
 * @param {*} user 
 * @returns 
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
 * renderer the edit overlay
 * @param {*} user 
 * @returns 
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
            <img src="./assets/img/join-logo.png">
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
                <button type="submit" class="save-btn gap btn-center" onclick="closeContactForm(); showContactDetails(); closeContactDetails();">
                    Save
                    <img src="./assets/img/check.png">
                </button>
            </div> 
        </form>
    </div>
</div>`
}




/**
 * renderer the new contact overlay
 * @returns 
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
                    <img src="./assets/img/join-logo.png">
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
                            Cancel
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
 * renderer the edit and delete popup
 * @param {*} user 
 * @returns 
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
 * Funktion, um sicherzustellen, dass nur Zahlen im "phone"-Feld eingegeben werden können
 * @param {Event} event
 */
function validatePhoneInput(event) {
    const input = event.target;
    const validValue = input.value.replace(/[^0-9]/g, ''); // Entfernt alles, was keine Zahl ist
    input.value = validValue; // Setzt den bereinigten Wert zurück ins Feld
}