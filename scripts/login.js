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
const db = getDatabase(initializeApp(firebaseConfig));

// Validierungsfunktionen
function validateInput(email, password) {
    const emailValid = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email);
    const passwordValid = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);
    return emailValid && passwordValid;
}

// Gespeicherte Benutzer und Vorschläge
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

// Benutzeranmeldung
async function handleLogin(email, password) {
    const snapshot = await get(child(ref(db), `users`));
    if (!snapshot.exists()) return false;
    return Object.values(snapshot.val()).some(user => user.email === email && user.password === password);
}

// Eventlistener
document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorMessage = document.getElementById("error-message");

    if (!validateInput(email, password)) {
        errorMessage.textContent = "Ungültige Eingaben!";
        return;
    }

    handleLogin(email, password).then(function (success) {
        if (success) {
            manageLocalUsers(email, password);
            alert("Login erfolgreich!");
            window.location.href = "contacts.html";
        } else {
            errorMessage.textContent = "E-Mail oder Passwort ist nicht korrekt!";
        }
    }).catch(error => errorMessage.textContent = "Fehler: " + error.message);
});

document.getElementById("email").addEventListener("focus", function () {
    manageLocalUsers("", "", true);
});

document.getElementById("email").addEventListener("input", function (e) {
    manageLocalUsers(e.target.value, "", true);
});
