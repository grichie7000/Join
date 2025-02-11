import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getDatabase, ref, get, set } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js';

// Firebase-Konfiguration
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

// Berechnet Initialen aus dem Namen
const getInitials = (name) => {
  return name.replace(/\s+/g, ' ')
             .trim()
             .split(' ')
             .slice(0, 2)
             .map(part => part.charAt(0).toUpperCase())
             .join('');
};

// Validierung der Eingaben
const validateInput = (email, password, repeatPassword) => {
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  const passwordValid = /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
  
  if (!emailValid) return "Ungültige E-Mail-Adresse!";
  if (!passwordValid) return "Passwort benötigt 8 Zeichen, einen Großbuchstaben und eine Zahl!";
  if (password !== repeatPassword) return "Passwörter stimmen nicht überein!";
  return "";
};

// Speichert den neuen Benutzer in der Datenbank
const saveUser = async (name, email, password) => {
  const userId = Date.now();
  const userData = {
    name: name.trim(),
    email: email.trim(),
    password, // ⚠️ Nur zu Demo-Zwecken – niemals im Klartext speichern!
    initials: getInitials(name)
  };
  await set(ref(db, `users/${userId}`), userData);
  return userData;
};

const checkAndRegister = async (name, email, password, errorMessage) => {
  try {
    const snapshot = await get(ref(db, 'users'));
    const users = snapshot.val() || {};

    if (Object.values(users).some(user => user.email === email)) {
      throw new Error("E-Mail bereits registriert!");
    }

    const user = await saveUser(name, email, password);

    // Speichere den aktuell eingeloggten Benutzer in localStorage unter "loggedInUser"
    localStorage.setItem('loggedInUser', JSON.stringify({
      email: user.email,
      initials: user.initials,
      name: user.name
    }));

    // Zeige den Erfolgsoverlay an
    const overlay = document.getElementById("successOverlay");
    const overlayContent = document.getElementById('overlay-content');
    overlay.style.display = "flex";
    overlayContent.style.display = 'flex';

    // Nach 1 Sekunde Overlay ausblenden und dann umleiten
    setTimeout(() => {
      overlay.style.display = "none";
      overlayContent.style.display = 'none';
      window.location.href = "relogin.html"; // Hier ggf. die Zielseite anpassen
    }, 1000);
    
  } catch (error) {
    errorMessage.textContent = error.message;
  }
}

// Passwort-Sichtbarkeit (Beispiel)
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

  // Setup für die Passwort-Icon-Umschaltung
  setupPasswordToggle('password');
  setupPasswordToggle('repeat-password');
});
