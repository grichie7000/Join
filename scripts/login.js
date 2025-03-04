/**
 * @module loginScript
 * This script interacts with Firebase Realtime Database using fetch,
 * handles user login, and implements password visibility toggling.
 */

// Base URL of your Firebase Realtime Database
const baseUrl = "https://join-d3707-default-rtdb.europe-west1.firebasedatabase.app";

/**
 * Performs a GET request to the specified path in Firebase.
 *
 * @param {string} path - The path in the database (e.g., "users").
 * @returns {Promise<Object|null>} The retrieved JSON object or null.
 */
async function firebaseGet(path) {
  const response = await fetch(`${baseUrl}/${path}.json`);
  if (!response.ok) {
    throw new Error("Fehler beim Abrufen der Daten aus Firebase");
  }
  return await response.json();
}

/** 
 * Calculates the initials from a full name.
 *
 * Replaces multiple spaces with a single one, trims the string,
 * splits the name by spaces, and extracts the first letters
 * of the first two parts.
 *
 * @param {string} name - The full name.
 * @returns {string} The initials, composed of the first letters of
 *                   the first two name components.
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
 * This function retrieves user data from Firebase, searches for a
 * user whose email and password match the provided values,
 * and returns a user object if found.
 *
 * @async
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @returns {Promise<Object>} A promise that returns a user object with ID and initials.
 * @throws {Error} Thrown if no matching user is found.
 */

const handleLogin = async (email, password) => {
  const users = await firebaseGet("users") || {};
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
 * Event handler for submitting the login form.
 *
 * This function prevents the default form behavior,
 * reads the entered values for email and password, authenticates
 * the user, and stores the user data in localStorage. Upon successful login,
 * the user is redirected to the summary page.
 *
 * @async
 * @param {Event} e - The submit event of the form.
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

    // Redirect to summary.html
    window.location.href = 'summary.html';
  } catch (error) {
    console.error("Login error:", error);
    errorElement.textContent = error.message;
    errorElement.style.display = 'block';
  }
};

/**
 * Initializes the toggling of password visibility for an input field.
 *
 * Adds event listeners to the specified input field. A click near the right edge
 * toggles the input type between 'password' and 'text'. An input event
 * adds a CSS class if the field contains content.
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
