// Importiere Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

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

// Login-Formular-Eventlistener
document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorMessage = document.getElementById("error-message");

    // Validierung: E-Mail-Format prüfen
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
        errorMessage.textContent = "Bitte eine gültige E-Mail-Adresse eingeben!";
        return;
    }

    // Validierung: Passwort prüfen (mindestens 8 Zeichen, ein Großbuchstabe, eine Zahl)
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
        errorMessage.textContent = "Das Passwort ist nicht korrekt!";
        return;
    }

    try {
        // Abrufen der Benutzerdaten aus Firebase
        const dbRef = ref(db);
        const snapshot = await get(child(dbRef, `users`));

        if (snapshot.exists()) {
            const users = snapshot.val();
            let userFound = false;

            // Überprüfung, ob die E-Mail und das Passwort in der Datenbank existieren
            for (const userId in users) {
                const user = users[userId];
                if (user.email === email && user.password === password) {
                    userFound = true;
                    break;
                }
            }

            if (userFound) {
                alert("Login erfolgreich!");
                window.location.href = "board.html"; // Weiterleitung zur Board-Seite
            } else {
                errorMessage.textContent = "E-Mail oder Passwort ist nicht korrekt!";
            }
        }
    } catch (error) {
        errorMessage.textContent = "Fehler beim Zugriff auf die Datenbank: " + error.message;
    }
});
