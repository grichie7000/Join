/**
 * Updates an existing user contact.
 * @param {Object} user - The user object to be updated.
 * @returns {Promise<void>}
 */
async function updateUser(user) {
    try {
        if (!validateContactForm()) return;

        const newName = getNameValue();
        const initials = generateInitials(newName);
        const updatedData = createUpdatedData(newName, initials, user);

        const response = await updateUserInDatabase(user, updatedData);
        if (response.ok) {
            await handleUserUpdateSuccess(updatedData, user);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

/**
 * Creates updated user data for the given user.
 * @param {string} newName - The new name of the user.
 * @param {string} initials - The initials of the user.
 * @param {Object} user - The original user data.
 * @returns {Object} The updated user data.
 */
function createUpdatedData(newName, initials, user) {
    return {
        name: newName,
        initials: initials,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        color: userArray[user].color,
        id: userArray[user].id,
        password: userArray[user].password
    };
}

/**
 * Updates the user data in the Firebase database.
 * @param {Object} user - The original user data.
 * @param {Object} updatedData - The updated user data.
 * @returns {Promise<Response>} The response from the Firebase API.
 */
async function updateUserInDatabase(user, updatedData) {
    return await fetch(BASE_URL + "contactsDatabase/" + userArray[user].firebaseId + ".json", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
    });
}

/**
 * Handles the success of updating user data.
 * @param {Object} updatedData - The updated user data.
 * @param {Object} user - The original user data.
 * @returns {Promise<void>}
 */
async function handleUserUpdateSuccess(updatedData, user) {
    const index = userArray.findIndex(u => u.id === updatedData.id);
    updatedData.firebaseId = userArray[user].firebaseId;
    if (index !== -1) userArray[index] = updatedData;
    await reUpdateUser(updatedData);
}

/**
 * Makes an asynchronous PUT request to update the user count at a specified path.
 * Sends the data in JSON format to the server and returns the response in JSON format.
 * @async
 * @param {string} [path=""] - The relative path to the resource on the server.
 * @param {Object} [data=""] - The data to be sent in the request body (JSON format).
 * @returns {Promise<Object>} - A promise that resolves to the response data in JSON format.
 */

async function putUsercount(path = "", data = "") {
    let response = await fetch(BASE_URL + "usercount/" + ".json", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    });
    return responseToJson = await response.json();
}

/**
 * Makes an asynchronous POST request to create a new user or update existing user data at a specified path.
 * Sends the data in JSON format to the server and returns the response in JSON format.
 * @async
 * @param {string} [path=""] - The relative path to the resource on the server.
 * @param {Object} [data=""] - The data to be sent in the request body (JSON format).
 * @returns {Promise<Object>} - A promise that resolves to the response data in JSON format.
 */

async function postUser(path = "", data = "") { 
    let response = await fetch(BASE_URL + path + ".json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    });
    responseToJson = await response.json();
    return responseToJson;
}

/**
 * Deletes a user from the database by sending an asynchronous DELETE request to the specified user ID.
 * After successful deletion, it clears the contact details from the UI and reloads the page.
 * @async
 * @param {string} id - The ID of the user to be deleted from the database.
 * @returns {Promise<void>} - A promise that resolves when the user has been deleted and the page is reloaded.
 */

async function deleteUser(id) {
    let url = BASE_URL + "contactsDatabase/" + id + "/" + ".json";
    let response = await fetch(url, {
        method: "DELETE"
    });
    let data = await response.json();
    let contactDetails = document.getElementById("contact-details");
    contactDetails.innerHTML = "";
    contactDetails.parentElement.classList.remove('mobile-popup');
    window.location.reload();
}

/**
 * Opens the popup for editing a contact, pre-filling the form with the provided user's data.
 * Displays the popup and prevents the page from scrolling while the popup is open.
 * @param {Object} user - The user object containing the details of the user to be edited.
 */

function editContact(user) {
    let popupOverlay = document.getElementById("popup-overlay");
    popupOverlay.innerHTML = "";
    popupOverlay.innerHTML = renderEditContact(user);
    popupOverlay.classList.add("showAddContact");
    document.body.style.overflow = 'hidden';
}

/**
 * Updates the user list and shows updated details.
 * @param {Object} updatedData - The updated user data.
 * @returns {Promise<void>}
 */
async function reUpdateUser(updatedData) {
    await loadingUsers();
    showContactDetails(updatedData.id);
    closeContactForm();
    await showSuccessMsgTasks();
    await setTimeout(() => { hiddenSuccessMsgTasks() }, 800);
}