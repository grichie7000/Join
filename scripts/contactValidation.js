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
    if (name && !validateName(name)) {
        showError('name', 'Name is required and must be at least 2 characters long');
        isValid = false;
    }
    if (email && !validateEmail(email)) {
        showError('email', 'Email is required and must be a valid email address');
        isValid = false;
    }
    if (phone && !validatePhone(phone)) {
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