/**
 * @module loginScript
 * This script initializes Firebase, handles user login,
 * and implements password visibility toggling.
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js';
import { getDatabase, ref, get } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js';

// Firebase configuration (same as in register.js)
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
 * Computes the initials from a full name.
 *
 * This function replaces multiple spaces with a single space,
 * trims any leading or trailing whitespace, splits the name by spaces,
 * and extracts the first letter of the first two parts.
 *
 * @param {string} name - The full name.
 * @returns {string} The initials, composed of the first letters of up to two name parts.
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
 * Authenticates a user based on email and password.
 *
 * This function retrieves user data from the Firebase database,
 * searches for a user whose email and password match the provided values,
 * and returns a user object if found.
 *
 * @async
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @returns {Promise<Object>} A promise that resolves to a user object including the user ID and initials.
 * @throws {Error} Throws an error if no matching user is found.
 */
const handleLogin = async (email, password) => {
  const snapshot = await get(ref(db, 'users'));
  const users = snapshot.val() || {};
  const foundUser = Object.entries(users).find(
    ([, user]) => user.email === email && user.password === password
  );
  if (!foundUser) throw new Error("Invalid credentials!");
  
  const [userId, user] = foundUser;
  return {
    ...user,
    id: userId,
    initials: user.initials || getInitials(user.name)
  };
};

/**
 * Event handler for the login form submission.
 *
 * This function prevents the default form submission behavior,
 * reads the email and password input values, authenticates the user,
 * and stores the user data in local storage. If the login is successful,
 * the page is redirected to the summary page.
 *
 * @async
 * @param {Event} e - The form submit event.
 * @returns {Promise<void>}
 */
const handleSubmit = async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorElement = document.getElementById('error-message');

  console.log("Attempting login with:", email, password);

  try {
    const user = await handleLogin(email, password);
    console.log("User found:", user);

    localStorage.removeItem('loggedInUser');
    localStorage.setItem('loggedInUser', JSON.stringify({
      ...user,
      initials: user.initials || getInitials(user.name)
    }));

    console.log("loggedInUser has been updated:", localStorage.getItem('loggedInUser'));

    // Redirect to summary page
    window.location.href = 'summary.html';
  } catch (error) {
    console.error("Login error:", error);
    errorElement.textContent = error.message;
    errorElement.style.display = 'block';
  }
};

/**
 * Initializes the password visibility toggle for an input field.
 *
 * This function adds event listeners to the specified input field.
 * A click near the right edge toggles the input type between 'password'
 * and 'text', and an input event toggles an active class based on whether
 * the field has any content.
 *
 * @param {string} inputId - The ID of the password input field.
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
  const form = document.getElementById("loginForm");
  form.addEventListener("submit", handleSubmit);

  setupPasswordToggle('password');
});
