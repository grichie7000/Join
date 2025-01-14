
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

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const repeatPassword = document.getElementById("repeat-password").value;

    if (password !== repeatPassword) {
        document.getElementById("error-message").textContent = "Passwörter stimmen nicht überein!";
        return;
    }

    try {
        const userId = Date.now(); 
        await set(ref(db, `users/${userId}`), {
            name,
            email,
            password,
        });

        alert("Registrierung erfolgreich!");
        window.location.href = "index.html"; 
    } catch (error) {
        document.getElementById("error-message").textContent = "Fehler beim Speichern: " + error.message;
    }
});
