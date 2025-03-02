/**
 * Validates the contact form by checking all required fields.
 * Calls `validateField` for each form field to ensure they meet the validation criteria.
 * @returns {boolean} True if all fields are valid, false otherwise.
 */
function validateContactForm() {  
    let isValid = true;
    clearErrorMessages();

    isValid &= validateField('name', validateName, 'Name is required and must be at least 2 characters long');
    isValid &= validateField('email', validateEmail, 'Email is required and must be a valid email address');
    isValid &= validateField('phone', validatePhone, 'Phone is required and must be a valid phone number');

    return isValid;
}

/**
 * Validates a specific field in the form.
 * It uses the provided validation function to check the field's value and shows an error message if validation fails.
 * @param {string} fieldId - The ID of the field to validate.
 * @param {function} validationFunction - The function used to validate the field's value.
 * @param {string} errorMessage - The error message to display if validation fails.
 * @returns {boolean} True if the field is valid, false otherwise.
 */
function validateField(fieldId, validationFunction, errorMessage) {
    const value = document.getElementById(fieldId).value;
    if (value && !validationFunction(value)) {
        showError(fieldId, errorMessage);
        return false;
    }
    return true;
}

/**
 * Validates that the name is at least 2 characters long.
 * @param {string} name - The name to validate.
 * @returns {boolean} True if the name is valid (at least 2 characters), false otherwise.
 */
function validateName(name) {
    return name.trim().length >= 2;
}

/**
 * Validates an email address using a regular expression.
 * Checks if the email follows the basic structure of a valid email (e.g., name@example.com).
 * @param {string} email - The email address to validate.
 * @returns {boolean} True if the email is valid, false otherwise.
 */
function validateEmail(email) { 
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validates a phone number using a regular expression.
 * Checks if the phone number consists of digits, spaces, plus, minus, parentheses, and is at least 6 characters long.
 * @param {string} phone - The phone number to validate.
 * @returns {boolean} True if the phone number is valid, false otherwise.
 */
function validatePhone(phone) {
    const phoneRegex = /^[\d\s\+\-\(\)]{6,}$/;
    return phoneRegex.test(phone);
}

/**
 * Displays an error message for a specific field.
 * The message is shown in the corresponding error div for that field.
 * @param {string} fieldId - The ID of the field that the error message is related to.
 * @param {string} message - The error message to display.
 */
function showError(fieldId, message) {
    const errorDiv = document.getElementById('error-div-' + fieldId);
    if (errorDiv !== null) {
        errorDiv.classList.remove('d-none');
        errorDiv.textContent = message;
    }
}

/**
 * Clears all error messages displayed on the form.
 * Hides all elements with the class "error-message".
 */
function clearErrorMessages() {
    const errorDiv = document.querySelectorAll('.error-message');
    errorDiv.forEach(error => {
        error.classList.add('d-none');
    });
}

/**
 * Displays a success message by showing the success overlay.
 * Adds the class 'overlay-suess-contact' to the success overlay element.
 */
function showSuccessMsgTasks() {
    let overlayDiv = document.getElementById('overlay-successfull');
    overlayDiv.classList.add('overlay-suess-contact');
}

/**
 * Hides the success message by removing the success overlay.
 * Removes the class 'overlay-suess-contact' from the success overlay element.
 */
function hiddenSuccessMsgTasks() {
    let overlayDiv = document.getElementById('overlay-successfull');
    overlayDiv.classList.remove('overlay-suess-contact');
}

/**
 * Navigates the browser history back to the previous page.
 */
function goBack() {
  window.history.back();
}

/**
 * Includes HTML content into the page by setting the inner HTML of an element with ID "overlay-container".
 * The HTML content is initialized by calling the `initProfilePopUp` function.
 */
function includeHTML() {
  let popUp = document.getElementById("overlay-container");
  popUp.innerHTML = initProfilePopUp();
}

/**
 * Generates a random RGB color.
 * The color is returned in hexadecimal format (e.g., "#RRGGBB").
 * @returns {string} A random RGB color in hexadecimal format.
 */
function getRandomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Checks the current path of the window and highlights the corresponding link in the sidebar.
 * Adds the 'active' class to the sidebar link if the link matches the current URL path.
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
 * Checks if the user is logged in by looking for a "username" in the sessionStorage.
 * If not logged in, it hides the user interface elements. If logged in, it shows the user interface 
 * and generates initials for the user.
 */
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

/**
 * Hides the user interface elements when the user is not logged in.
 * Adds specific CSS classes to the elements to hide them from view.
 * @param {HTMLElement} sidebar - The sidebar element to hide.
 * @param {HTMLElement} profile - The profile element to hide.
 * @param {HTMLElement} info - The info section element to hide.
 * @param {HTMLElement} menuPos - The menu position element to hide.
 */
function hideUserInterface(sidebar, profile, info, menuPos) {
    sidebar.classList.add('no-login-sidebar-none');
    profile.classList.add('no-login-none');
    info.classList.add('no-login-none');
    menuPos.classList.add('no-login-none');
}

/**
 * Shows the user interface elements when the user is logged in.
 * Removes the CSS classes that hide the elements, making them visible.
 * @param {HTMLElement} sidebar - The sidebar element to show.
 * @param {HTMLElement} profile - The profile element to show.
 * @param {HTMLElement} info - The info section element to show.
 * @param {HTMLElement} menuPos - The menu position element to show.
 */
function showUserInterface(sidebar, profile, info, menuPos) {
    sidebar.classList.remove('no-login-sidebar-none');
    profile.classList.remove('no-login-none');
    info.classList.remove('no-login-none');
    menuPos.classList.remove('no-login-none');
}
