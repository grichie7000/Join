/**
 * @module login
 * This module handles Firebase interaction via the REST API, input validation,
 * password visibility toggling, local user management, and user login.
 */

// Base URL of your Firebase Realtime Database
const baseUrl = "https://join-d3707-default-rtdb.europe-west1.firebasedatabase.app";

/**
 * Performs a GET request to the specified path in Firebase.
 *
 * @param {string} path - The path in the database (e.g., "users").
 * @returns {Promise<Object|null>} A promise that returns the retrieved JSON object or null.
 * @throws {Error} Thrown if the request fails.
 */

async function firebaseGet(path) {
  const response = await fetch(`${baseUrl}/${path}.json`);
  if (!response.ok) {
    throw new Error("Fehler beim Abrufen der Daten aus Firebase");
  }
  return await response.json();
}

/**
 * Validates the provided email and password.
 *
 * @param {string} email - The email address.
 * @param {string} password - The password.
 * @returns {boolean} True if both the email and password are valid, otherwise false.
 */
function validateInput(email, password) {
  const emailValid = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email);
  const passwordValid = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);
  return emailValid && passwordValid;
}

/** 
 * Calculates the initials from a full name.
 *
 * Replaces multiple spaces with a single one, trims the string,
 * splits the name by spaces, and extracts the first letters
 * of the first two parts.
 *
 * @param {string} name - The full name.
 * @returns {string} The initials, composed of the first letters of the first two name components.
 */

function getInitials(name) {
  return name.replace(/\s+/g, ' ')
             .trim()
             .split(' ')
             .slice(0, 2)
             .map(part => part.charAt(0).toUpperCase())
             .join('');
}

// Hole das Passwort-Eingabefeld
const passwordInput = document.getElementById('password');

/**
 * Updates the icon of the password input field based on its content.
 *
 * @returns {void}
 */

function updateInputIcon() {
  if (passwordInput.value) {
    passwordInput.classList.remove('input-with-eye-icon');
    passwordInput.classList.add('input-with-eye-icon-active');
  } else {
    passwordInput.classList.remove('input-with-eye-icon-active', 'input-with-eye-icon-clicked');
    passwordInput.classList.add('input-with-eye-icon');
  }
}

/**
 * Toggles the visibility of the password when clicked in the icon area.
 *
 * @param {MouseEvent} event - The click event on the password input.
 * @returns {void}
 */

function togglePassword(event) {
  const clickX = event.offsetX;
  const iconArea = passwordInput.offsetWidth - 40;
  if (clickX >= iconArea && passwordInput.value) {
    const isActive = passwordInput.classList.contains('input-with-eye-icon-active');
    if (isActive) {
      passwordInput.type = 'text';
    } else {
      passwordInput.type = 'password';
    }
    passwordInput.classList.toggle('input-with-eye-icon-active', !isActive);
    passwordInput.classList.toggle('input-with-eye-icon-clicked', isActive);
  }
}

passwordInput.addEventListener('input', updateInputIcon);
passwordInput.addEventListener('click', togglePassword);

/**
 * Manages local user data in localStorage.
 *
 * If populate is true, the email suggestions are updated and
 * the password field is automatically filled if necessary. Otherwise,
 * the user is added to the stored users if they are not already present.
 *
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @param {boolean} [populate=false] - Whether email suggestions and the password field should be populated.
 * @returns {void}
 */

function manageLocalUsers(email, password, populate = false) {
  const users = JSON.parse(localStorage.getItem("savedUsers")) || [];
  if (populate) {
    document.getElementById("emailSuggestions").innerHTML = users.map(u => `<option value="${u.email}"></option>`).join("");
    const user = users.find(u => u.email === email);
    document.getElementById("password").value = user ? user.password : "";
  } else if (!users.some(u => u.email === email)) {
    users.push({ email, password });
    localStorage.setItem("savedUsers", JSON.stringify(users));
  }
}

/**
 * Authenticates the user using the Firebase database (via the REST API).
 *
 * Retrieves the "users" node and checks if a user with the provided email
 * and password exists.
 *
 * @async
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @returns {Promise<boolean>} A promise that returns true if authentication is successful, otherwise false.
 */

async function handleLogin(email, password) {
  const users = await firebaseGet("users");
  if (!users) return false;
  return Object.values(users).some(user => user.email === email && user.password === password);
}

/**
 * Handles the submission of the login form.
 *
 * Prevents the default form action, reads the input values,
 * validates them, and attempts to authenticate the user. On success,
 * local user data is updated and the user is redirected to the summary page.
 *
 * @param {Event} event - The submit event of the form.
 * @returns {void}
 */
function handleLoginFormSubmit(event) {
  event.preventDefault();
  const email = getInputValue("email");
  const password = getInputValue("password");
  const errorMessage = document.getElementById("error-message");

  if (!validateInput(email, password)) {
    return showError(errorMessage, "Invalid input!");
  }

  handleLogin(email, password)
    .then(success => {
      if (success) {
        manageLocalUsers(email, password);
        window.location.href = "summary.html";
      } else {
        showError(errorMessage, "Email or password is incorrect!");
      }
    })
    .catch(error => showError(errorMessage, "Error: " + error.message));
}

/** 
 * Handles focus and input events for the email field.
 *
 * Updates the email suggestions and, if necessary, auto-fills the password field.
 *
 * @param {Event} event - The focus or input event.
 * @returns {void}
 */

function handleEmailFocusOrInput(event) {
  const email = event.type === "input" ? event.target.value : "";
  manageLocalUsers(email, "", true);
}

/** 
 * Reads the trimmed value of an input field based on its ID.
 *
 * @param {string} id - The ID of the input field.
 * @returns {string} The trimmed value of the field.
 */
function getInputValue(id) {
  return document.getElementById(id).value.trim();
}

/**
 * Displays an error message in a specified DOM element.
 *
 * @param {HTMLElement} element - The DOM element where the error message will be shown.
 * @param {string} message - The error message to be displayed.
 * @returns {void}
 */
function showError(element, message) {
  element.textContent = message;
}

document.getElementById("loginForm").addEventListener("submit", handleLoginFormSubmit);
document.getElementById("email").addEventListener("focus", handleEmailFocusOrInput);
document.getElementById("email").addEventListener("input", handleEmailFocusOrInput);
