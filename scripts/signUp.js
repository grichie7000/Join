import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getDatabase, ref, get, set, child } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js';

// Firebase-Konfiguration
const app = initializeApp({
    apiKey: "AIzaSyBCuA1XInnSHfEyGUKQQqmqRgvqfhx7dHc",
    authDomain: "join-d3707.firebaseapp.com",
    databaseURL: "https://join-d3707-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "join-d3707",
    storageBucket: "join-d3707.firebasestorage.app",
    messagingSenderId: "961213557325",
    appId: "1:961213557325:web:0253482ac485b4bb0e4a04"
});
const db = getDatabase(app);

// Validierungsfunktionen
function validateInput(email, password, repeatPassword) {
    const emailValid = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email);
    const passwordValid = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);
    if (!emailValid) return "Bitte eine gültige E-Mail-Adresse eingeben!";
    if (!passwordValid) return "Das Passwort muss mindestens 8 Zeichen, einen Großbuchstaben und eine Zahl enthalten!";
    if (password !== repeatPassword) return "Passwörter stimmen nicht überein!";
    return "";
}

// Daten speichern
function saveUser(name, email, password) {
    const userId = Date.now();
    return set(ref(db, "users/" + userId), { name, email, password });
}

// E-Mail prüfen und Benutzer registrieren
function checkAndRegister(name, email, password, errorMessage) {
    get(child(ref(db), "users")).then(snapshot => {
        const emailExists = snapshot.exists() && Object.values(snapshot.val()).some(user => user.email === email);
        if (emailExists) throw new Error("Diese E-Mail ist bereits registriert!");

        return saveUser(name, email, password);
    }).then(() => {
        alert("Registrierung erfolgreich!");
        window.location.href = "index.html";
    }).catch(error => errorMessage.textContent = error.message);
}

// Eventlistener für Formular
document.getElementById("form").addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const repeatPassword = document.getElementById("repeat-password").value.trim();
    const errorMessage = document.getElementById("error-message");

    const validationError = validateInput(email, password, repeatPassword);
    if (validationError) {
        errorMessage.textContent = validationError;
    } else {
        checkAndRegister(name, email, password, errorMessage);
    }
});
