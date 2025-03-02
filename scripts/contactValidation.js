
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


function validateName(name) {
    return name.trim().length >= 2;
}


function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}


function validatePhone(phone) {
    const phoneRegex = /^[\d\s\+\-\(\)]{6,}$/;
    return phoneRegex.test(phone);
}


function showError(fieldId, message) {
    const errorDiv = document.getElementById('error-div-' + fieldId);
    if (errorDiv !== null) {
        errorDiv.classList.remove('d-none');
        errorDiv.textContent = message;
    }
}


function clearErrorMessages() {
    const errorDiv = document.querySelectorAll('.error-message');
    errorDiv.forEach(error => {
        error.classList.add('d-none');
    });
}


function showSuccessMsgTasks() {
    let overlayDiv = document.getElementById('overlay-successfull');
    overlayDiv.classList.add('overlay-suess-contact');
}


function hiddenSuccessMsgTasks() {
    let overlayDiv = document.getElementById('overlay-successfull');
    overlayDiv.classList.remove('overlay-suess-contact');
}

function goBack() {
  window.history.back();
}


function includeHTML() {
  let popUp = document.getElementById("overlay-container");
  popUp.innerHTML = initProfilePopUp();
}


function getRandomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}


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