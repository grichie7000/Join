const BASE_URL = "https://join-d3707-default-rtdb.europe-west1.firebasedatabase.app/";
let usercount = 0;
let userArray = []; 


function initContacts() {
    checkLink();
    loadingUsers();
}


function clearContactForm() {
    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    document.getElementById("phone").value = "";
    clearErrorMessages();
}


async function loadingUsers() {
    try {
        const users = await fetchUsers();
        const usersArray = formatUsers(users);
        const groupedUsers = groupUsersByFirstLetter(usersArray);
        loadRenderContactList(groupedUsers);
    } catch (error) {
        console.error('Fehler:', error);
    }
}

async function fetchUsers() {
    const response = await fetch(BASE_URL + "contactsDatabase" + ".json");
    const user = await response.json();
    return user;
}

function formatUsers(users) {
    const usersArray = Object.entries(users).map(([key, user]) => ({
        ...user,
        firebaseId: key
    }));

    usersArray.sort((a, b) => a.name.localeCompare(b.name));
    return usersArray;
}

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


function loadRenderContactList(groupedUsers) {
    let contactList = document.getElementById("contact-list");
    contactList.innerHTML = "";
    let userGroups = Object.keys(groupedUsers);
    userGroups.forEach(group => {
        contactList.innerHTML += renderContactList(groupedUsers, group);
    });
}


function addContact() {
    let popupOverlay = document.getElementById("popup-overlay");
    popupOverlay.innerHTML = "";
    popupOverlay.innerHTML = renderNewContact();
    popupOverlay.classList.add("showAddContact");
    document.body.style.overflow = 'hidden';
}


function closeContactForm() {
    let popupOverlay = document.getElementById("popup-overlay");
    popupOverlay.classList.remove("showAddContact");
    document.body.style.overflow = 'auto';
}


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

function getSelectedUser(userId) {
    return userArray.find(user => user.id == userId);
}

function isMobileView() {
    return window.innerWidth <= 950;
}

function openMobilePopup(contactDetails, btnMobilePopup) {
    contactDetails.parentElement.classList.add('mobile-popup');
    btnMobilePopup.classList.remove('d-none');
    document.body.style.overflow = 'hidden';
}

function setMobilePopupContent(selectedUser) {
    document.getElementById('contact-pop-up').innerHTML = renderEditDeletePopup(selectedUser);
}

function setContactDetails(contactDetails, selectedUser) {
    contactDetails.innerHTML = renderContactDetails(selectedUser);
}


function toggleEditDeletePopup() {
    let contactButtons = document.getElementById("edit-delete-container");
    contactButtons.style.right = "calc(0px)";
    contactButtons.style.left = "0";
}


function removeEditDel() {
    let contactButtons = document.getElementById("edit-delete-container");
    contactButtons.style.right = "calc(-100vw)";
    contactButtons.style.left = "";
}


function closeContactDetails() {
    let contactDetails = document.getElementById("contact-details");
    let btnMobilePopup = document.getElementById("btn-mobile-popup");
    contactDetails.parentElement.classList.remove('mobile-popup');
    document.body.style.overflow = 'auto';
    btnMobilePopup.classList.add('d-none');
}


async function loadUserCounter() {
    try {
        let response = await fetch(BASE_URL  + "usercount" + ".json");
        let responseToJson = await response.json();
        usercount = responseToJson;
    } catch (error) {
        console.error('Fehler:', error);
    }
}


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
        console.error('Fehler:', error);
    }
}

function getNameValue() {
    return document.getElementById("name").value;
}

function getEmailValue() {
    return document.getElementById("email").value;
}

function getPhoneValue() {
    return document.getElementById("phone").value;
}

function generateInitials(name) {
    return name.split(" ")
               .map(word => word.charAt(0).toUpperCase())
               .join("");
}

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

async function handleUserCreationSuccess() {
    usercount++;
    await putUsercount(`usercount/`, usercount);
    await loadingUsers();
    closeContactForm();
    await showSuccessMsgTasks();
    setTimeout(() => { hiddenSuccessMsgTasks() }, 800);
}

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
        console.error('Fehler:', error);
    }
}

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

async function updateUserInDatabase(user, updatedData) {
    return await fetch(BASE_URL + "contactsDatabase/" + userArray[user].firebaseId + ".json", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
    });
}

async function handleUserUpdateSuccess(updatedData, user) {
    const index = userArray.findIndex(u => u.id === updatedData.id);
    updatedData.firebaseId = userArray[user].firebaseId;
    if (index !== -1) userArray[index] = updatedData;
    await reUpdateUser(updatedData);
}


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


function editContact(user) {
    let popupOverlay = document.getElementById("popup-overlay");
    popupOverlay.innerHTML = "";
    popupOverlay.innerHTML = renderEditContact(user);
    popupOverlay.classList.add("showAddContact");
    document.body.style.overflow = 'hidden';
}


async function reUpdateUser(updatedData) {
    await loadingUsers();
    showContactDetails(updatedData.id);
    closeContactForm();
    await showSuccessMsgTasks();
    await setTimeout(() => {hiddenSuccessMsgTasks()}, 800);
}