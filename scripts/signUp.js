/**
 * @module registration
 * Dieses Modul kommuniziert mit der Firebase Realtime Database über fetch,
 * validiert Benutzereingaben, berechnet Initialen, speichert einen neuen Nutzer
 * in der Datenbank, verwaltet den Registrierungsprozess und ermöglicht das Umschalten
 * der Passwort-Sichtbarkeit.
 */

// Basis-URL Deiner Firebase Realtime Database
const baseUrl = "https://join-d3707-default-rtdb.europe-west1.firebasedatabase.app";

/**
 * Führt einen GET-Request an den angegebenen Pfad in Firebase aus.
 *
 * @param {string} path - Der Pfad in der Datenbank (z.B. "users").
 * @returns {Promise<Object|null>} Das abgerufene JSON-Objekt oder null, falls nichts vorhanden ist.
 */
async function firebaseGet(path) {
  const response = await fetch(`${baseUrl}/${path}.json`);
  if (!response.ok) {
    throw new Error("Fehler beim Abrufen der Daten aus Firebase");
  }
  return await response.json();
}

/**
 * Führt einen PUT-Request an den angegebenen Pfad in Firebase aus, um Daten zu speichern.
 *
 * @param {string} path - Der Pfad in der Datenbank (z.B. "users/123456").
 * @param {Object} data - Die zu speichernden Daten.
 * @returns {Promise<Object>} Die Antwort von Firebase.
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
 * Berechnet die Initialen aus einem gegebenen Namen.
 *
 * Ersetzt mehrere Leerzeichen durch ein einzelnes, trimmt den String,
 * teilt den Namen in Teile auf und gibt die Großbuchstaben der ersten zwei Teile zurück.
 *
 * @param {string} name - Der vollständige Name.
 * @returns {string} Die berechneten Initialen.
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
 * Validiert die E-Mail und Passwort-Eingaben.
 *
 * Überprüft, ob die E-Mail im richtigen Format vorliegt, das Passwort die Kriterien erfüllt
 * und ob beide Passwörter übereinstimmen.
 *
 * @param {string} email - Die E-Mail-Adresse des Nutzers.
 * @param {string} password - Das Passwort des Nutzers.
 * @param {string} repeatPassword - Das wiederholte Passwort zur Bestätigung.
 * @returns {string} Einen leeren String, wenn die Eingaben valide sind, sonst eine Fehlermeldung.
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
 * Speichert einen neuen Nutzer in der Firebase-Datenbank.
 *
 * Generiert eine eindeutige userId mithilfe des aktuellen Zeitstempels, erstellt das
 * Nutzerdatenobjekt und speichert es über einen PUT-Request.
 * 
 * ⚠️ Hinweis: Das Passwort wird hier zu Demonstrationszwecken im Klartext gespeichert!
 *
 * @async
 * @param {string} name - Der Name des Nutzers.
 * @param {string} email - Die E-Mail-Adresse des Nutzers.
 * @param {string} password - Das Passwort des Nutzers.
 * @returns {Promise<Object>} Ein Promise, das mit den gespeicherten Nutzerdaten aufgelöst wird.
 */
const saveUser = async (name, email, password) => {
  const userId = Date.now();
  const userData = {
    name: name.trim(),
    email: email.trim(),
    password, // ⚠️ Nur zu Demo-Zwecken – Passwörter niemals im Klartext speichern!
    initials: getInitials(name)
  };
  await firebaseSet(`users/${userId}`, userData);
  return userData;
};

/**
 * Prüft, ob die E-Mail bereits registriert ist und registriert einen neuen Nutzer, falls nicht.
 *
 * Ruft die Liste der Nutzer aus Firebase ab und verifiziert, dass die E-Mail einzigartig ist.
 * Bei erfolgreicher Registrierung wird der Nutzer in localStorage gespeichert und ein
 * Erfolgsoverlay angezeigt. Anschließend erfolgt eine Weiterleitung.
 *
 * @async
 * @param {string} name - Der Name des Nutzers.
 * @param {string} email - Die E-Mail-Adresse des Nutzers.
 * @param {string} password - Das Passwort des Nutzers.
 * @param {HTMLElement} errorMessage - Das Element zur Anzeige von Fehlermeldungen.
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
 * Ermöglicht das Umschalten der Passwort-Sichtbarkeit.
 *
 * Fügt dem angegebenen Eingabefeld Event Listener hinzu, die bei einem Klick
 * auf den Icon-Bereich das Input-Feld zwischen 'password' und 'text' umschalten.
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
  const form = document.getElementById("form");
  const errorMessage = document.getElementById("error-message");
  const nameInput = document.getElementById("name");

  // Stelle sicher, dass der Fehlerbereich initial unsichtbar ist, aber im Layout bleibt.
  errorMessage.style.visibility = 'hidden';

  // Verhindert, dass im Namen Zahlen eingegeben werden und dass
  // das Feld mit einem Leerzeichen beginnt oder mehrere aufeinanderfolgende Leerzeichen enthält.
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
