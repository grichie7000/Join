/**
 * @module login
 * This module handles Firebase interaction via the REST API, input validation,
 * password visibility toggling, local user management, and user login.
 */

// Basis-URL Deiner Firebase Realtime Database
const baseUrl = "https://join-d3707-default-rtdb.europe-west1.firebasedatabase.app";

/**
 * Führt einen GET-Request an den angegebenen Pfad in Firebase aus.
 *
 * @param {string} path - Der Pfad in der Datenbank (z.B. "users").
 * @returns {Promise<Object|null>} Ein Promise, das das abgerufene JSON-Objekt oder null zurückgibt.
 * @throws {Error} Wird geworfen, wenn der Request fehlschlägt.
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
 * @param {string} email - Die E-Mail-Adresse.
 * @param {string} password - Das Passwort.
 * @returns {boolean} True, wenn sowohl E-Mail als auch Passwort gültig sind, ansonsten false.
 */
function validateInput(email, password) {
  const emailValid = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email);
  const passwordValid = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);
  return emailValid && passwordValid;
}

/**
 * Berechnet die Initialen aus einem vollständigen Namen.
 *
 * Ersetzt mehrere Leerzeichen durch ein einzelnes, trimmt den String,
 * teilt den Namen anhand von Leerzeichen und extrahiert die ersten Buchstaben
 * der ersten zwei Teile.
 *
 * @param {string} name - Der vollständige Name.
 * @returns {string} Die Initialen, zusammengesetzt aus den ersten Buchstaben der ersten zwei Namensbestandteile.
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
 * Aktualisiert das Icon des Passwort-Input-Feldes basierend auf dessen Inhalt.
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
 * Schaltet die Sichtbarkeit des Passworts um, wenn im Icon-Bereich geklickt wird.
 *
 * @param {MouseEvent} event - Das Klick-Event auf dem Passwort-Input.
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
 * Verwaltet lokale Benutzerdaten im localStorage.
 *
 * Wenn populate true ist, werden die E-Mail-Vorschläge aktualisiert und
 * das Passwortfeld ggf. automatisch befüllt. Andernfalls wird der Benutzer
 * zu den gespeicherten Benutzern hinzugefügt, falls er noch nicht vorhanden ist.
 *
 * @param {string} email - Die E-Mail-Adresse des Benutzers.
 * @param {string} password - Das Passwort des Benutzers.
 * @param {boolean} [populate=false] - Ob E-Mail-Vorschläge und Passwortfeld befüllt werden sollen.
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
 * Authentifiziert den Benutzer mithilfe der Firebase-Datenbank (über die REST API).
 *
 * Ruft den "users"-Knoten ab und prüft, ob ein Benutzer mit der übergebenen E-Mail
 * und dem Passwort existiert.
 *
 * @async
 * @param {string} email - Die E-Mail-Adresse des Benutzers.
 * @param {string} password - Das Passwort des Benutzers.
 * @returns {Promise<boolean>} Ein Promise, das true zurückgibt, wenn die Authentifizierung erfolgreich ist, ansonsten false.
 */
async function handleLogin(email, password) {
  const users = await firebaseGet("users");
  if (!users) return false;
  return Object.values(users).some(user => user.email === email && user.password === password);
}

/**
 * Behandelt das Absenden des Login-Formulars.
 *
 * Verhindert die Standardaktion des Formulars, liest die Eingabewerte,
 * validiert diese und versucht, den Benutzer zu authentifizieren. Bei Erfolg
 * werden lokale Benutzerdaten aktualisiert und der Benutzer zur Summary-Seite weitergeleitet.
 *
 * @param {Event} event - Das Submit-Event des Formulars.
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
 * Behandelt Fokus- und Eingabeereignisse für das E-Mail-Feld.
 *
 * Aktualisiert die E-Mail-Vorschläge und füllt ggf. das Passwortfeld automatisch.
 *
 * @param {Event} event - Das Fokus- oder Eingabe-Event.
 * @returns {void}
 */
function handleEmailFocusOrInput(event) {
  const email = event.type === "input" ? event.target.value : "";
  manageLocalUsers(email, "", true);
}

/**
 * Liest den getrimmten Wert eines Input-Felds anhand seiner ID aus.
 *
 * @param {string} id - Die ID des Input-Felds.
 * @returns {string} Der getrimmte Wert des Felds.
 */
function getInputValue(id) {
  return document.getElementById(id).value.trim();
}

/**
 * Zeigt eine Fehlermeldung in einem angegebenen DOM-Element an.
 *
 * @param {HTMLElement} element - Das DOM-Element, in dem die Fehlermeldung angezeigt wird.
 * @param {string} message - Die anzuzeigende Fehlermeldung.
 * @returns {void}
 */
function showError(element, message) {
  element.textContent = message;
}

document.getElementById("loginForm").addEventListener("submit", handleLoginFormSubmit);
document.getElementById("email").addEventListener("focus", handleEmailFocusOrInput);
document.getElementById("email").addEventListener("input", handleEmailFocusOrInput);
