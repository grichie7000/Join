/**
 * Validates the form fields before creating a new contact.
 * @function validateForm
 * @returns {void}
 */
function validateForm() {
    let isValid = true;
    isValid &= validateName("newContactName");
    isValid &= validateEmail("newContactEmail");
    isValid &= validatePhone("newContactPhone");

    if (isValid) {
        createContact();
    }
}

/**
 * Validates the form fields before saving the edited contact.
 * @function validateEditForm
 * @returns {void}
 */
function validateEditForm() {
    let isValid = true;
    isValid &= validateName("editContactName");
    isValid &= validateEmail("editContactEmail");
    isValid &= validatePhone("editContactPhone");

    if (isValid) {
        saveEditedContact();
    }
}

/**
 * Validates the name input field.
 * @function validateName
 * @param {string} inputId - The ID of the name input field.
 * @returns {boolean} True if the name is valid, false otherwise.
 */
function validateName(inputId) {
    const nameInput = document.getElementById(inputId);
    if (!nameInput.value.trim()) {
        markInvalid(nameInput, "Name is required");
        return false;
    } else {
        markValid(nameInput);
        return true;
    }
}

/**
 * Validates the email input field.
 * @function validateEmail
 * @param {string} inputId - The ID of the email input field.
 * @returns {boolean} True if the email is valid, false otherwise.
 */
function validateEmail(inputId) {
    const emailInput = document.getElementById(inputId);
    const emailValue = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailValue) {
        markInvalid(emailInput, "Email is required");
        return false;
    } else if (!emailRegex.test(emailValue)) {
        markInvalid(emailInput, "Email must be in a valid format");
        return false;
    } else {
        markValid(emailInput);
        return true;
    }
}

/**
 * Validates the phone input field.
 * @function validatePhone
 * @param {string} inputId - The ID of the phone input field.
 * @returns {boolean} True if the phone number is valid, false otherwise.
 */
function validatePhone(inputId) {
    const phoneInput = document.getElementById(inputId);
    const phoneValue = phoneInput.value.trim();
    const phoneRegex = /^[0-9]+$/;
    const startsWithValid = phoneValue.startsWith("0") || phoneValue.startsWith("+");
    if (!phoneValue) {
        markInvalid(phoneInput, "Phone number is required");
        return false;
    } else if (!phoneRegex.test(phoneValue) || !startsWithValid) {
        markInvalid(phoneInput, "Phone number must start with '0' or '+' and contain only numbers");
        return false;
    } else {
        markValid(phoneInput);
        return true;
    }
}

/**
 * Marks the input field as valid or invalid.
 * 
 * @param {HTMLElement} inputField - The input field element.
 * @param {boolean} isValid - True if the field is valid, false otherwise.
 */
function markField(inputField, isValid) {
    if (isValid) {
        inputField.classList.remove("invalid");
        inputField.classList.add("valid");
    } else {
        inputField.classList.remove("valid");
        inputField.classList.add("invalid");
    }
}

function markInvalid(input, message) {
    input.value = "";
    input.placeholder = message;
    input.classList.add("invalid", "error-message");
}

function markValid(input) {
    input.placeholder = "";
    input.classList.remove("invalid", "error-message");
}