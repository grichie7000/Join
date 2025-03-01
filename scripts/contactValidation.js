
function validateContactForm() {
    let isValid = true;
    clearErrorMessages();

    isValid &= validateField('name', validateName, 'Name is required and must be at least 2 characters long');
    isValid &= validateField('email', validateEmail, 'Email is required and must be a valid email address');
    isValid &= validateField('phone', validatePhone, 'Phone is required and must be a valid phone number');

    return isValid;
}

function validateField(fieldId, validationFunction, errorMessage) {
    const value = document.getElementById(fieldId).value;
    if (value && !validationFunction(value)) {
        showError(fieldId, errorMessage);
        return false;
    }
    return true;
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

function notLogin() {
    let sidebar = document.getElementById('navigation-container');
    let profile = document.getElementById('profile');
    let info = document.getElementById('info');
    let menuPos = document.getElementById('menuPos');
    
    if (sessionStorage.getItem("username") == null) {
        hideUserInterface(sidebar, profile, info, menuPos);
    } else {
        showUserInterface(sidebar, profile, info, menuPos);
        generateInitials();
    }
}

function hideUserInterface(sidebar, profile, info, menuPos) {
    sidebar.classList.add('no-login-sidebar-none');
    profile.classList.add('no-login-none');
    info.classList.add('no-login-none');
    menuPos.classList.add('no-login-none');
}

function showUserInterface(sidebar, profile, info, menuPos) {
    sidebar.classList.remove('no-login-sidebar-none');
    profile.classList.remove('no-login-none');
    info.classList.remove('no-login-none');
    menuPos.classList.remove('no-login-none');
}