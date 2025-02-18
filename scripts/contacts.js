const BASE_URL = "https://join-d3707-default-rtdb.europe-west1.firebasedatabase.app/";
let usercount = 0;
let userArray = []; 


/**
 * initializes the contacts page.
 */
function initContacts() {
    checkLink();
    loadingUsers();
}


/**
 * toogle the dropdown menu
 */
function toggleDropdown() {
    let dropdownOptions = document.getElementById("dropdown-options");
    let dropdownArrow = document.getElementById("dropdown-arrow");
    dropdownOptions.classList.toggle("show");
    if (dropdownOptions.classList.contains("show")) {
        dropdownArrow.innerHTML = `<img src="img/assets/icons/arrow-up-dropdown.svg">`;
    } else {
        dropdownArrow.innerHTML = `<img src="img/assets/icons/arrow-dropdown.svg">`;
    }
}


/**
 * clear the contact form
 */
function clearContactForm() {
    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    document.getElementById("phone").value = "";
    clearErrorMessages();
}


/**
 * Fetches users from the database and sorts them alphabetically by name.
 */
async function loadingUsers() {
    try {
        let responseUser = await fetch(BASE_URL + "contactsDatabase" + ".json");
        let user = await responseUser.json();
        let usersArray = Object.entries(user).map(([key, user]) => ({
            ...user,
            firebaseId: key
        }));

        usersArray.sort((a, b) => a.name.localeCompare(b.name));

        let groupedUsers = usersArray.reduce((acc, user) => {
            let firstLetter = user.name.charAt(0).toUpperCase();
            if (!acc[firstLetter]) {
                acc[firstLetter] = [];
            }
            acc[firstLetter].push(user);
            return acc;
        }, {});
        loadRenderContactList(groupedUsers);
    } catch (error) {
        console.error('Fehler:', error);
    }
}


/**
 * load the contact list.
 * @param {*} groupedUsers - the grouped users
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
 * load the add contact form.
 */
function addContact() {
    let popupOverlay = document.getElementById("popup-overlay");
    popupOverlay.innerHTML = "";
    popupOverlay.innerHTML = renderNewContact();
    popupOverlay.classList.add("showAddContact");
    document.body.style.overflow = 'hidden';
}


/**
 * close the add contact form.
 */
function closeContactForm() {
    let popupOverlay = document.getElementById("popup-overlay");
    popupOverlay.classList.remove("showAddContact");
    document.body.style.overflow = 'auto';
}


/**
 * show the contact details.
 * @param {*} userId 
 * @returns 
 */
function showContactDetails(userId) {
    try {
        let contactDetails = document.getElementById("contact-details");
        let btnMobilePopup = document.getElementById("btn-mobile-popup");
        contactDetails.innerHTML = "";
        let selectedUser = userArray.find(user => user.id == userId);
        if (window.innerWidth <= 950) {
            contactDetails.parentElement.classList.add('mobile-popup');
            btnMobilePopup.classList.remove('d-none');
            document.body.style.overflow = 'hidden';
            document.getElementById('contact-pop-up').innerHTML = renderEditDeletePopup(selectedUser);
        }
        contactDetails.innerHTML = renderContactDetails(selectedUser);
        return true;
    } catch (error) {
        return false;
    }
}


/**
 * toggle the edit and delete popup.
 */
function toggleEditDeletePopup() {
    let contactButtons = document.getElementById("edit-delete-container");
    contactButtons.style.right = "calc(0px)";
    contactButtons.style.left = "0";
}


/**
 * remove the edit and delete popup.
 */
function removeEditDel() {
    let contactButtons = document.getElementById("edit-delete-container");
    contactButtons.style.right = "calc(-100vw)";
    contactButtons.style.left = "";
}


/**
 * close the contact details.
 */
function closeContactDetails() {
    let contactDetails = document.getElementById("contact-details");
    let btnMobilePopup = document.getElementById("btn-mobile-popup");
    contactDetails.parentElement.classList.remove('mobile-popup');
    document.body.style.overflow = 'auto';
    btnMobilePopup.classList.add('d-none');
}


/**
 * load the user counter.
 */
async function loadUserCounter() {
    try {
        let response = await fetch(BASE_URL  + "usercount" + ".json");
        let responseToJson = await response.json();
        usercount = responseToJson;
    } catch (error) {
        console.error('Fehler:', error);
    }
}


/**
 * create the new contact
 * @returns 
 */
// async function createUserContact() {
//     try {
//         if (!validateContactForm()) {
//             return;
//         } else {
//             await loadUserCounter();
//             let name = document.getElementById("name").value;
//             let email = document.getElementById("email").value;
//             let phone = document.getElementById("phone").value;
//             const response = await postUser(`contactsDatabase/`, {
//                 "name": name,
//                 "email": email,
//                 "password": "",
//                 "id": usercount + 1,
//                 "phone": phone,
//                 "color": getRandomColor(),
//             });
//             if (response.name) {
//                 usercount++;
//                 await putUsercount(`usercount/`, usercount);
//                 await loadingUsers();
//                 closeContactForm();
//                 await showSuccessMsgTasks();
//                 await setTimeout(() => {hiddenSuccessMsgTasks()}, 800)
//             }
//         }
//     } catch (error) {
//         console.error('Fehler:', error);
//     }
// }

async function createUserContact() {
    try {
        if (!validateContactForm()) {
            return;
        } else {
            await loadUserCounter();
            let name = document.getElementById("name").value;
            let email = document.getElementById("email").value;
            let phone = document.getElementById("phone").value;
            // Berechne die Initialen aus dem Namen:
            let initials = name
              .split(" ")
              .map(word => word.charAt(0).toUpperCase())
              .join("");

            const response = await postUser(`contactsDatabase/`, {
                "name": name,
                "initials": initials,  // Hier wird das neue Feld hinzugefügt
                "email": email,
                "password": "",
                "id": usercount + 1,
                "phone": phone,
                "color": getRandomColor(),
            });
            if (response.name) {
                usercount++;
                await putUsercount(`usercount/`, usercount);
                await loadingUsers();
                closeContactForm();
                await showSuccessMsgTasks();
                setTimeout(() => { hiddenSuccessMsgTasks() }, 800);
            }
        }
    } catch (error) {
        console.error('Fehler:', error);
    }
}

async function updateUser(user) {
    try {
        if (!validateContactForm()) {
            return;
        } else {
            let newName = document.getElementById("name").value;
            let initials = newName
              .split(" ")
              .map(word => word.charAt(0).toUpperCase())
              .join("");
            const updatedData = {
                name: newName,
                initials: initials, // Aktualisierte Initialen
                email: document.getElementById("email").value,
                phone: document.getElementById("phone").value,
                color: userArray[user].color,
                id: userArray[user].id,
                password: userArray[user].password
            };
            let response = await fetch(BASE_URL + "contactsDatabase/" + userArray[user].firebaseId + ".json", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData)
            });
            if (response.ok) {
                const index = userArray.findIndex(u => u.id === updatedData.id);
                updatedData.firebaseId = userArray[user].firebaseId;
                if (index !== -1) userArray[index] = updatedData;
                await reUpdateUser();
            }
        }
    } catch (error) {
        console.error('Fehler:', error);
    }
}


/**
 * update the counter
 * @param {*} path 
 * @param {*} data 
 * @returns 
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
 * post the new contact
 * @param {*} path 
 * @param {*} data 
 * @returns 
 */
async function postUser(path = "", data = "") { // Anlegen von Daten 
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
 * delete the contact
 * @param {*} id 
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
 * edit the contact
 * @param {*} user 
 */
function editContact(user) {
    let popupOverlay = document.getElementById("popup-overlay");
    popupOverlay.innerHTML = "";
    popupOverlay.innerHTML = renderEditContact(user);
    popupOverlay.classList.add("showAddContact");
    document.body.style.overflow = 'hidden';
}


/**
 * update the contact
 * @param {*} user 
 * @returns 
 */
async function updateUser(user) {
    try {
        if (!validateContactForm()) {
            return;
        } else {
            const updatedData = { name: document.getElementById("name").value, email: document.getElementById("email").value, phone: document.getElementById("phone").value, color: userArray[user].color, id: userArray[user].id, password: userArray[user].password};
            let response = await fetch(BASE_URL + "contactsDatabase/" + userArray[user].firebaseId + ".json", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData)
            });
            if (response.ok) {
                const index = userArray.findIndex(u => u.id === updatedData.id);
                updatedData.firebaseId = userArray[user].firebaseId;
                if (index !== -1) userArray[index] = updatedData;
                await reUpdateUser();
            }
        }
    } catch (error) {
        console.error('Fehler:', error);
    }
}


/**
 * update function for updateuser
 */
async function reUpdateUser() {
    await loadingUsers();
    showContactDetails(updatedData.id);
    closeContactForm();
    await showSuccessMsgTasks();
    await setTimeout(() => {hiddenSuccessMsgTasks()}, 800)
}


/**
 * validate the contact form
 * @returns 
 */
function validateContactForm() {
    let name = document.getElementById('name').value;
    let email = document.getElementById('email').value;
    let phone = document.getElementById('phone').value;
    let isValid = true;
    clearErrorMessages();
    if (!validateName(name)) {
        showError('name', 'Name is required and must be at least 2 characters long');
        isValid = false;
    }
    if (!validateEmail(email)) {
        showError('email', 'Email is required and must be a valid email address');
        isValid = false;
    }
    if (!validatePhone(phone)) {
        showError('phone', 'phone is required and must be a valid phone number');
        isValid = false;
    }
    return isValid;
}


/**
 * function for the validation of the name
 * @param {*} name 
 * @returns 
 */
function validateName(name) {
    return name.trim().length >= 2;
}


/**
 * function for the validation of the email
 * @param {*} email 
 * @returns 
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}


/**
 * function for the validation of the phone
 * @param {*} phone 
 * @returns 
 */
function validatePhone(phone) {
    const phoneRegex = /^[\d\s\+\-\(\)]{6,}$/;
    return phoneRegex.test(phone);
}


/**
 * show the error message
 * @param {*} fieldId 
 * @param {*} message 
 */
function showError(fieldId, message) {
    const errorDiv = document.getElementById('error-div-' + fieldId);
    if (errorDiv !== null) {
        errorDiv.classList.remove('d-none');
        errorDiv.textContent = message;
    }
}


/**
 * clear the error messages
 */
function clearErrorMessages() {
    const errorDiv = document.querySelectorAll('.error-message');
    errorDiv.forEach(error => {
        error.classList.add('d-none');
    });
}


/**
 * show the success message
 */
function showSuccessMsgTasks() {
    let overlayDiv = document.getElementById('overlay-successfull');
    overlayDiv.classList.add('overlay-suess-contact');
}


/**
 * hidden the success message
 */
function hiddenSuccessMsgTasks() {
    let overlayDiv = document.getElementById('overlay-successfull');
    overlayDiv.classList.remove('overlay-suess-contact');
}

/**
 * go back to the last page
 */
function goBack() {
  window.history.back();
}


/**
 * load nav and header
 */
function includeHTML() {
  let popUp = document.getElementById("overlay-container");
  popUp.innerHTML = initProfilePopUp();
}


/**
 * Generate initials for the top right corner in the header section.
 */
function generateInitials() {
  let content = document.getElementById("profile");

  let userName = sessionStorage.getItem("username");
  content.innerHTML = "";
  let nameParts = userName.split(" ");
  if (nameParts.length >= 2) {
    let initials = (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    content.innerHTML = initials;
  } else if (nameParts.length === 1) {
    let initials = nameParts[0][0].toUpperCase();
    content.innerHTML = initials;
  } else {
    content.innerHTML = "G";
  }
}


/**
 * random color function for the profile section
 * @returns 
 */
function getRandomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}


/**
 * check link function to highlight the active link in the sidebar
 */
function checkLink() {
  const currentPath = window.location.pathname;
  const sidebarLinks = document.querySelectorAll('#navigation-container .menuPos a');
  sidebarLinks.forEach(link => {
    link.classList.remove('active');
    let href = link.getAttribute('href').replace('../', '');
    if (currentPath.includes("/join/" + href)) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}


/**
 * not logged in function to hide the sidebar and profile section
 */
function notLogin() {
  let sidebar = document.getElementById('navigation-container');
  let profile = document.getElementById('profile');
  let info = document.getElementById('info');
  let menuPos = document.getElementById('menuPos');
  if (sessionStorage.getItem("username") == null) {
    sidebar.classList.add('no-login-sidebar-none');
    profile.classList.add('no-login-none');
    info.classList.add('no-login-none');
    asideNav.classList.add('no-login-none');
  } else {
    sidebar.classList.remove('no-login-sidebar-none');
    profile.classList.remove('no-login-none');
    info.classList.remove('no-login-none');
    asideNav.classList.remove('no-login-none');
    generateInitials();
  }
}