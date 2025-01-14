import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getDatabase, ref, set } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js';

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

// Firebase initialisieren
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

document.getElementById("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const repeatPassword = document.getElementById("repeat-password").value.trim();
    const errorMessage = document.getElementById("error-message");

    // E-Mail Validierung mit RegEx
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
        errorMessage.textContent = "Bitte eine gültige E-Mail-Adresse eingeben!";
        return;
    }

    // Passwortprüfung (mindestens 8 Zeichen, ein Großbuchstabe, eine Zahl)
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
        errorMessage.textContent = "Das Passwort muss mindestens 8 Zeichen, einen Großbuchstaben und eine Zahl enthalten!";
        return;
    }

    // Passwortbestätigung
    if (password !== repeatPassword) {
        errorMessage.textContent = "Passwörter stimmen nicht überein!";
        return;
    }

    try {
        // Benutzer-ID erstellen und Daten speichern
        const userId = Date.now(); 
        await set(ref(db, `users/${userId}`), {
            name,
            email,
            password,
        });

        alert("Registrierung erfolgreich!");
        window.location.href = "index.html"; // Weiterleitung zur Startseite
    } catch (error) {
        errorMessage.textContent = "Fehler beim Speichern: " + error.message;
    }
});
