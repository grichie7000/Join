
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

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("error-message");

    try {
        const dbRef = ref(db);
        const snapshot = await get(child(dbRef, `users`));

        if (snapshot.exists()) {
            const users = snapshot.val();
            let validUser = false;

            for (const userId in users) {
                if (users[userId].email === email && users[userId].password === password) {
                    validUser = true;
                    break;
                }
            }

            if (validUser) {
                alert("Login erfolgreich!");
                window.location.href = "dashboard.html";
            } else {
                errorMessage.textContent = "Ungültige E-Mail oder Passwort!";
            }
        } else {
            errorMessage.textContent = "Keine Benutzer gefunden!";
        }
    } catch (error) {
        errorMessage.textContent = "Fehler beim Abrufen der Daten: " + error.message;
    }
});
