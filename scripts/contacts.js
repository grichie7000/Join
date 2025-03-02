/**
 * The base URL of the Firebase database.
 * @constant {string}
 */
const BASE_URL = "https://join-d3707-default-rtdb.europe-west1.firebasedatabase.app/"; 

/**
 * User count variable.
 * @type {number}
 */
let usercount = 0;

/**
 * Array holding all users.
 * @type {Array<Object>}
 */
let userArray = [];

/**
 * Initializes the contacts by checking the link and loading users.
 */
function initContacts() {
    checkLink();
    loadingUsers();
}

/**
 * Clears the contact form by resetting the input fields.
 */
function clearContactForm() {
    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    document.getElementById("phone").value = "";
    clearErrorMessages();
}

/**
 * Loads users asynchronously and renders the contact list.
 * @returns {Promise<void>}
 */
async function loadingUsers() {
    try {
        const users = await fetchUsers();
        const usersArray = formatUsers(users);
        const groupedUsers = groupUsersByFirstLetter(usersArray);
        loadRenderContactList(groupedUsers);
    } catch (error) {
        console.error('Error:', error);
    }
}

/**
 * Fetches users from the Firebase database.
 * @returns {Promise<Object>} The user data from the database.
 */
async function fetchUsers() {
    const response = await fetch(BASE_URL + "contactsDatabase" + ".json");
    const user = await response.json();
    return user;
}

/**
 * Formats the user data by mapping over the fetched users and adding Firebase ID.
 * @param {Object} users - The raw user data.
 * @returns {Array<Object>} An array of formatted user objects.
 */
function formatUsers(users) {
    const usersArray = Object.entries(users).map(([key, user]) => ({
        ...user,
        firebaseId: key
    }));

    usersArray.sort((a, b) => a.name.localeCompare(b.name));
    return usersArray;
}

/**
 * Groups the users by the first letter of their name.
 * @param {Array<Object>} usersArray - The array of formatted user objects.
 * @returns {Object} An object where keys are letters and values are arrays of users whose names start with that letter.
 */
function groupUsersByFirstLetter(usersArray) {
    return usersArray.reduce((acc, user) => {
        const firstLetter = user.name.charAt(0).toUpperCase();
        if (!acc[firstLetter]) {
            acc[firstLetter] = [];
        }
        acc[firstLetter].push(user);
        return acc;
    }, {});
}

/**
 * Renders and displays the contact list by grouping users.
 * @param {Object} groupedUsers - An object of grouped users.
 */
function loadRenderContactList(groupedUsers) {
    let contactList = document.getElementById("contact-list");
    contactList.innerHTML = "";
    let userGroups = Object.keys(groupedUsers);
    userGroups.forEach(group => {
        contactList.innerHTML += renderContactList(groupedUsers, group);
    });
}

/**
 * Opens the contact form to add a new contact.
 */
function addContact() {
    let popupOverlay = document.getElementById("popup-overlay");
    popupOverlay.innerHTML = "";
    popupOverlay.innerHTML = renderNewContact();
    popupOverlay.classList.add("showAddContact");
    document.body.style.overflow = 'hidden';
}

/**
 * Closes the contact form.
 */
function closeContactForm() {
    let popupOverlay = document.getElementById("popup-overlay");
    popupOverlay.classList.remove("showAddContact");
    document.body.style.overflow = 'auto';
}

/**
 * Displays the details of a selected contact.
 * @param {string} userId - The ID of the user whose details are to be displayed.
 * @returns {boolean} Returns true if contact details are displayed successfully, otherwise false.
 */
function showContactDetails(userId) {
    try {
        const contactDetails = document.getElementById("contact-details");
        const btnMobilePopup = document.getElementById("btn-mobile-popup");
        contactDetails.innerHTML = "";

        const selectedUser = getSelectedUser(userId);

        if (isMobileView()) {
            openMobilePopup(contactDetails, btnMobilePopup);
            setMobilePopupContent(selectedUser);
        }

        setContactDetails(contactDetails, selectedUser);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Retrieves the selected user based on the user ID.
 * @param {string} userId - The ID of the selected user.
 * @returns {Object} The selected user object.
 */
function getSelectedUser(userId) {
    return userArray.find(user => user.id == userId);
}

/**
 * Checks if the current view is a mobile view (window width <= 950px).
 * @returns {boolean} True if it's a mobile view, otherwise false.
 */
function isMobileView() {
    return window.innerWidth <= 950;
}

/**
 * Opens the mobile popup for displaying the contact details.
 * @param {HTMLElement} contactDetails - The element containing the contact details.
 * @param {HTMLElement} btnMobilePopup - The button to trigger the mobile popup.
 */
function openMobilePopup(contactDetails, btnMobilePopup) {
    contactDetails.parentElement.classList.add('mobile-popup');
    btnMobilePopup.classList.remove('d-none');
    document.body.style.overflow = 'hidden';
}

/**
 * Sets the content of the mobile popup.
 * @param {Object} selectedUser - The user whose details are to be displayed.
 */
function setMobilePopupContent(selectedUser) {
    document.getElementById('contact-pop-up').innerHTML = renderEditDeletePopup(selectedUser);
}

/**
 * Sets the contact details in the contact details section.
 * @param {HTMLElement} contactDetails - The HTML element for displaying the contact details.
 * @param {Object} selectedUser - The selected user whose details need to be displayed.
 */
function setContactDetails(contactDetails, selectedUser) {
    contactDetails.innerHTML = renderContactDetails(selectedUser);
}

/**
 * Toggles the edit/delete buttons for the contact.
 */
function toggleEditDeletePopup() {
    let contactButtons = document.getElementById("edit-delete-container");
    contactButtons.style.right = "calc(0px)";
    contactButtons.style.left = "0";
}

/**
 * Removes the edit/delete buttons for the contact.
 */
function removeEditDel() {
    let contactButtons = document.getElementById("edit-delete-container");
    contactButtons.style.right = "calc(-100vw)";
    contactButtons.style.left = "";
}

/**
 * Closes the contact details popup.
 */
function closeContactDetails() {
    let contactDetails = document.getElementById("contact-details");
    let btnMobilePopup = document.getElementById("btn-mobile-popup");
    contactDetails.parentElement.classList.remove('mobile-popup');
    document.body.style.overflow = 'auto';
    btnMobilePopup.classList.add('d-none');
}

/**
 * Loads the user count from the Firebase database.
 * @returns {Promise<void>}
 */
async function loadUserCounter() {
    try {
        let response = await fetch(BASE_URL + "usercount" + ".json");
        let responseToJson = await response.json();
        usercount = responseToJson;
    } catch (error) {
        console.error('Error:', error);
    }
}

/**
 * Creates a new user contact in the database.
 * @returns {Promise<void>}
 */
async function createUserContact() {
    try {
        if (!validateContactForm()) return;

        await loadUserCounter();
        const name = getNameValue();
        const email = getEmailValue();
        const phone = getPhoneValue();
        const initials = generateInitials(name);

        const response = await postUserToDatabase(name, initials, email, phone);
        if (response.name) {
            await handleUserCreationSuccess();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

/**
 * Retrieves the name value from the form.
 * @returns {string} The name entered in the form.
 */
function getNameValue() {
    return document.getElementById("name").value;
}

/**
 * Retrieves the email value from the form.
 * @returns {string} The email entered in the form.
 */
function getEmailValue() {
    return document.getElementById("email").value;
}

/**
 * Retrieves the phone number value from the form.
 * @returns {string} The phone number entered in the form.
 */
function getPhoneValue() {
    return document.getElementById("phone").value;
}

/**
 * Generates initials from the given name (first letter of each word).
 * @param {string} name - The name from which to generate initials.
 * @returns {string} The generated initials.
 */
function generateInitials(name) {
    return name.split(" ")
               .map(word => word.charAt(0).toUpperCase())
               .join("");
}

/**
 * Posts the user data to the Firebase database.
 * @param {string} path - The path where the user data should be posted.
 * @param {Object} data - The user data to be posted.
 * @returns {Promise<Object>} The response from the Firebase database.
 */
async function postUserToDatabase(name, initials, email, phone) {
    return await postUser(`contactsDatabase/`, {
        "name": name,
        "initials": initials,
        "email": email,
        "password": "",
        "id": usercount + 1,
        "phone": phone,
        "color": getRandomColor(),
    });
}

/**
 * Handles the success of creating a new user contact.
 * @returns {Promise<void>}
 */
async function handleUserCreationSuccess() {
    usercount++;
    await putUsercount(`usercount/`, usercount);
    await loadingUsers();
    closeContactForm();
    await showSuccessMsgTasks();
    setTimeout(() => { hiddenSuccessMsgTasks() }, 800);
}