/**
 * @module registration
 * This module initializes Firebase, validates user input, computes initials,
 * saves a new user to the database, manages the registration process, and sets up
 * password visibility toggling.
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getDatabase, ref, get, set } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js';

const firebaseConfig = {
  apiKey: "AIzaSyBCuA1XInnSHfEyGUKQQqmqRgvqfhx7dHc",
  authDomain: "join-d3707.firebaseapp.com",
  databaseURL: "https://join-d3707-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "join-d3707",
  storageBucket: "join-d3707.firebasestorage.app",
  messagingSenderId: "961213557325",
  appId: "1:961213557325:web:0253482ac485b4bb0e4a04"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/**
 * Computes the initials from a given name.
 *
 * This function replaces multiple spaces with a single space,
 * trims leading and trailing whitespace, splits the name into parts,
 * and returns the uppercase initials from the first two parts.
 *
 * @param {string} name - The full name.
 * @returns {string} The computed initials.
 */
const getInitials = (name) => {
  return name.replace(/\s+/g, ' ')
             .trim()
             .split(' ')
             .slice(0, 2)
             .map(part => part.charAt(0).toUpperCase())
             .join('');
};

/**
 * Validates the email and password inputs.
 *
 * Checks if the email is in a valid format, if the password meets the criteria,
 * and if the password matches the repeated password.
 *
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @param {string} repeatPassword - The repeated password for confirmation.
 * @returns {string} An empty string if inputs are valid, otherwise an error message.
 */
const validateInput = (email, password, repeatPassword) => {
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  const passwordValid = /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
  
  if (!emailValid) return "Invalid email address!";
  if (!passwordValid) return "Password must be at least 8 characters long, include an uppercase letter and a number!";
  if (password !== repeatPassword) return "Passwords do not match!";
  return "";
};

/**
 * Saves a new user to the Firebase database.
 *
 * Generates a unique userId using the current timestamp and constructs the user data
 * including name, email, password, and initials. The user is then saved in the database.
 * 
 * ⚠️ Note: The password is stored in plaintext for demonstration purposes only.
 *
 * @async
 * @param {string} name - The user's name.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @returns {Promise<Object>} A promise that resolves with the saved user data.
 */
const saveUser = async (name, email, password) => {
  const userId = Date.now();
  const userData = {
    name: name.trim(),
    email: email.trim(),
    password, // ⚠️ For demo purposes only – never store passwords in plaintext!
    initials: getInitials(name)
  };
  await set(ref(db, `users/${userId}`), userData);
  return userData;
};

/**
 * Checks if the email is already registered and registers a new user if not.
 *
 * Retrieves the list of users from the database and verifies that the email is unique.
 * If registration is successful, the user data is saved in localStorage and a success overlay is shown.
 * Finally, after a short delay, the page is redirected.
 *
 * @async
 * @param {string} name - The user's name.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @param {HTMLElement} errorMessage - The element to display error messages.
 * @returns {Promise<void>}
 */
const checkAndRegister = async (name, email, password, errorMessage) => {
  try {
    const snapshot = await get(ref(db, 'users'));
    const users = snapshot.val() || {};

    if (Object.values(users).some(user => user.email === email)) {
      throw new Error("Email already registered!");
    }

    const user = await saveUser(name, email, password);

    localStorage.setItem('loggedInUser', JSON.stringify({
      email: user.email,
      initials: user.initials,
      name: user.name
    }));

    const overlay = document.getElementById("successOverlay");
    const overlayContent = document.getElementById('overlay-content');
    overlay.style.display = "flex";
    overlayContent.style.display = 'flex';

    setTimeout(() => {
      overlay.style.display = "none";
      overlayContent.style.display = 'none';
      window.location.href = "relogin.html";
    }, 1000);
    
  } catch (error) {
    errorMessage.textContent = error.message;
  }
};

/**
 * Sets up password visibility toggling for an input field.
 *
 * Adds event listeners to the specified input field so that clicking on the icon area
 * toggles the input type between 'password' and 'text', and adjusts the CSS classes accordingly.
 *
 * @param {string} inputId - The ID of the password input element.
 * @returns {void}
 */
const setupPasswordToggle = (inputId) => {
  const input = document.getElementById(inputId);
  const toggle = () => {
    input.type = input.type === 'password' ? 'text' : 'password';
    input.classList.toggle('input-with-eye-icon-clicked');
  };
  
  input.addEventListener('click', (e) => {
    if (e.offsetX > input.offsetWidth - 40) toggle();
  });
  
  input.addEventListener('input', () => {
    input.classList.toggle('input-with-eye-icon-active', input.value.length > 0);
  });
};

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById("form");
  const errorMessage = document.getElementById("error-message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const repeatPassword = document.getElementById("repeat-password").value.trim();

    const validationError = validateInput(email, password, repeatPassword);
    if (validationError) {
      errorMessage.textContent = validationError;
      errorMessage.style.display = 'block';
      return;
    }
    
    await checkAndRegister(name, email, password, errorMessage);
  });

  setupPasswordToggle('password');
  setupPasswordToggle('repeat-password');
});
