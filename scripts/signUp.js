/**
 * @module registration
 * This module initializes Firebase, validates user input, computes initials,
 * saves a new user to the database, manages the registration process, and sets up
 * password visibility toggling.
 */

// Base URL of your Firebase Realtime Database
const baseUrl = "https://join-d3707-default-rtdb.europe-west1.firebasedatabase.app";

/**
 * Performs a GET request to the specified path in Firebase.
 *
 * @param {string} path - The path in the database (e.g., "users").
 * @returns {Promise<Object|null>} The retrieved JSON object or null if nothing is found.
 */

async function firebaseGet(path) {
  const response = await fetch(`${baseUrl}/${path}.json`);
  if (!response.ok) {
    throw new Error("Fehler beim Abrufen der Daten aus Firebase");
  }
  return await response.json();
}

/** 
 * Performs a PUT request to the specified path in Firebase to store data.
 *
 * @param {string} path - The path in the database (e.g., "users/123456").
 * @param {Object} data - The data to be stored.
 * @returns {Promise<Object>} The response from Firebase.
 */

async function firebaseSet(path, data) {
  const response = await fetch(`${baseUrl}/${path}.json`, {
    method: 'PUT',
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    throw new Error("Fehler beim Speichern der Daten in Firebase");
  }
  return await response.json();
}

/**
 * Calculates the initials from a given name.
 *
 * Replaces multiple spaces with a single one, trims the string,
 * splits the name into parts, and returns the uppercase letters of the first two parts.
 *
 * @param {string} name - The full name.
 * @returns {string} The calculated initials.
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
 * Checks if the email is in the correct format, if the password meets the criteria,
 * and if both passwords match.
 *
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @param {string} repeatPassword - The repeated password for confirmation.
 * @returns {string} An empty string if the inputs are valid, otherwise an error message.
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
 * Stores a new user in the Firebase database.
 *
 * Generates a unique userId using the current timestamp, creates the
 * user data object, and stores it via a PUT request.
 * 
 * ⚠️ Note: The password is stored in plaintext here for demonstration purposes!
 *
 * @async
 * @param {string} name - The user's name.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @returns {Promise<Object>} A promise that resolves with the stored user data.
 */

const saveUser = async (name, email, password) => {
  const userId = Date.now();
  const userData = {
    name: name.trim(),
    email: email.trim(),
    password, // ⚠️ For demo purposes only – never store passwords in plaintext!
    initials: getInitials(name)
  };
  await firebaseSet(`users/${userId}`, userData);
  return userData;
};

/**
 * Checks if the email is already registered and registers a new user if not.
 *
 * Retrieves the list of users from Firebase and verifies that the email is unique.
 * Upon successful registration, the user is saved in localStorage and a
 * success overlay is displayed. Then, a redirect occurs.
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
    const users = await firebaseGet("users") || {};

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
    overlayContent.style.display = "flex";

    setTimeout(() => {
      overlay.style.display = "none";
      overlayContent.style.display = "none";
      window.location.href = "relogin.html";
    }, 1000);
    
  } catch (error) {
    errorMessage.textContent = error.message;
    errorMessage.style.visibility = 'visible';
  }
};

/**
 * Adds event listeners to the specified input field so that clicking on the icon area
 * toggles the input type between 'password' and 'text'.
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
  const nameInput = document.getElementById("name");

  // Makes sure the error area is initially invisible but still part of the layout.
errorMessage.style.visibility = 'hidden';

// Prevents numbers from being entered in the name and ensures
// the field doesn't start with a space or contain multiple consecutive spaces.

  nameInput.addEventListener("keypress", (e) => {
    if (/\d/.test(e.key)) {
      e.preventDefault();
      errorMessage.textContent = "Der Benutzername darf nur Buchstaben enthalten!";
      errorMessage.style.visibility = 'visible';
      return;
    }
    if (e.key === " ") {
      if (nameInput.value.length === 0 || nameInput.value.slice(-1) === " ") {
        e.preventDefault();
      }
    }
  });

  nameInput.addEventListener("input", () => {
    nameInput.value = nameInput.value.replace(/\s{2,}/g, ' ');
    if (/\d/.test(nameInput.value)) {
      errorMessage.textContent = "Der Benutzername darf nur Buchstaben enthalten!";
      errorMessage.style.visibility = 'visible';
    } else {
      errorMessage.textContent = "";
      errorMessage.style.visibility = 'hidden';
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const name = nameInput.value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const repeatPassword = document.getElementById("repeat-password").value.trim();

    if (!/^[A-Za-z\s]+$/.test(name)) {
      errorMessage.textContent = "Der Benutzername darf nur Buchstaben enthalten!";
      errorMessage.style.visibility = 'visible';
      return;
    }
    
    const validationError = validateInput(email, password, repeatPassword);
    if (validationError) {
      errorMessage.textContent = validationError;
      errorMessage.style.visibility = 'visible';
      return;
    }
    
    await checkAndRegister(name, email, password, errorMessage);
  });

  setupPasswordToggle('password');
  setupPasswordToggle('repeat-password');
});
