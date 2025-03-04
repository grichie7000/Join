/**
 * @module loginScript
 * This script interacts with Firebase Realtime Database using fetch,
 * handles user login, and implements password visibility toggling.
 */

// Basis-URL Deiner Firebase Realtime Database
const baseUrl = "https://join-d3707-default-rtdb.europe-west1.firebasedatabase.app";

/**
 * Führt einen GET-Request an den angegebenen Pfad in Firebase aus.
 *
 * @param {string} path - Der Pfad in der Datenbank (z.B. "users").
 * @returns {Promise<Object|null>} Das abgerufene JSON-Objekt oder null.
 */
async function firebaseGet(path) {
  const response = await fetch(`${baseUrl}/${path}.json`);
  if (!response.ok) {
    throw new Error("Fehler beim Abrufen der Daten aus Firebase");
  }
  return await response.json();
}

/**
 * Berechnet die Initialen aus einem vollständigen Namen.
 *
 * Ersetzt mehrere Leerzeichen durch ein einzelnes, trimmt den String,
 * teilt den Namen anhand von Leerzeichen und extrahiert die ersten Buchstaben
 * der ersten zwei Teile.
 *
 * @param {string} name - Der vollständige Name.
 * @returns {string} Die Initialen, zusammengesetzt aus den ersten Buchstaben der
 *                   ersten zwei Namensbestandteile.
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
 * Authentifiziert einen Benutzer basierend auf E-Mail und Passwort.
 *
 * Diese Funktion ruft die Nutzerdaten aus Firebase ab, sucht nach einem
 * Benutzer, dessen E-Mail und Passwort mit den übergebenen Werten übereinstimmen,
 * und gibt ein Benutzerobjekt zurück, falls gefunden.
 *
 * @async
 * @param {string} email - Die E-Mail-Adresse des Benutzers.
 * @param {string} password - Das Passwort des Benutzers.
 * @returns {Promise<Object>} Ein Promise, das ein Benutzerobjekt mit ID und Initialen zurückgibt.
 * @throws {Error} Wird ausgelöst, wenn kein passender Benutzer gefunden wird.
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
 * Event-Handler für das Abschicken des Login-Formulars.
 *
 * Diese Funktion verhindert das Standard-Verhalten des Formulars,
 * liest die eingegebenen Werte für E-Mail und Passwort aus, authentifiziert
 * den Benutzer und speichert die Benutzerdaten im localStorage. Bei erfolgreichem Login
 * erfolgt eine Weiterleitung zur Summary-Seite.
 *
 * @async
 * @param {Event} e - Das Submit-Event des Formulars.
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

    // Weiterleitung zur summary.html
    window.location.href = 'summary.html';
  } catch (error) {
    console.error("Login error:", error);
    errorElement.textContent = error.message;
    errorElement.style.display = 'block';
  }
};

/**
 * Initialisiert das Umschalten der Passwort-Sichtbarkeit für ein Eingabefeld.
 *
 * Fügt dem angegebenen Eingabefeld Event-Listener hinzu. Ein Klick nahe am rechten Rand
 * wechselt den Input-Typ zwischen 'password' und 'text'. Ein input-Event
 * fügt eine CSS-Klasse hinzu, sofern das Feld Inhalt hat.
 *
 * @param {string} inputId - Die ID des Passwort-Eingabefelds.
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
