/**
 * @module login
 * This module handles Firebase initialization, input validation,
 * password visibility toggling, local user management, and user login.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBCuA1XInnSHfEyGUKQQqmqRgvqfhx7dHc",
    authDomain: "join-d3707.firebaseapp.com",
    databaseURL: "https://join-d3707-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "join-d3707",
    storageBucket: "join-d3707.firebasestorage.app",
    messagingSenderId: "961213557325",
    appId: "1:961213557325:web:0253482ac485b4bb0e4a04"
};

const db = getDatabase(initializeApp(firebaseConfig));

/**
 * Validates the provided email and password.
 *
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @returns {boolean} True if both email and password are valid, otherwise false.
 */
function validateInput(email, password) {
    const emailValid = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email);
    const passwordValid = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);
    return emailValid && passwordValid;
}

const passwordInput = document.getElementById('password');

/**
 * Updates the password input's icon based on its value.
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
 * Toggles the password visibility when the icon area is clicked.
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
 * Manages local user data in the browser's localStorage.
 *
 * When populate is true, it fills the email suggestions and auto-fills the password field.
 * Otherwise, it adds a new user to the saved users if not already present.
 *
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @param {boolean} [populate=false] - Whether to populate the email suggestions and password field.
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
 * Authenticates the user using the Firebase database.
 *
 * Retrieves the 'users' node from the Firebase database and checks if
 * a user with the provided email and password exists.
 *
 * @async
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<boolean>} A promise that resolves to true if authentication is successful, otherwise false.
 */
async function handleLogin(email, password) {
    const snapshot = await get(child(ref(db), `users`));
    if (!snapshot.exists()) return false;
    return Object.values(snapshot.val()).some(user => user.email === email && user.password === password);
}

/**
 * Handles the login form submission.
 *
 * Prevents the default form submission, validates the input, attempts login,
 * manages local users, and redirects to the summary page upon success.
 *
 * @param {Event} event - The form submission event.
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
 * Populates email suggestions and auto-fills the password field if available.
 *
 * @param {Event} event - The focus or input event.
 * @returns {void}
 */
function handleEmailFocusOrInput(event) {
    const email = event.type === "input" ? event.target.value : "";
    manageLocalUsers(email, "", true);
}

/**
 * Retrieves the trimmed value of an input field by its ID.
 *
 * @param {string} id - The ID of the input element.
 * @returns {string} The trimmed input value.
 */
function getInputValue(id) {
    return document.getElementById(id).value.trim();
}

/**
 * Displays an error message in the specified element.
 *
 * @param {HTMLElement} element - The DOM element to display the error in.
 * @param {string} message - The error message to display.
 * @returns {void}
 */
function showError(element, message) {
    element.textContent = message;
}

document.getElementById("loginForm").addEventListener("submit", handleLoginFormSubmit);
document.getElementById("email").addEventListener("focus", handleEmailFocusOrInput);
document.getElementById("email").addEventListener("input", handleEmailFocusOrInput);
