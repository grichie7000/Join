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

const passwordInput = document.getElementById('password');

function updateInputIcon() {
    if (passwordInput.value) {
        passwordInput.classList.remove('input-with-eye-icon');
        passwordInput.classList.add('input-with-eye-icon-active');
    } else {
        passwordInput.classList.remove('input-with-eye-icon-active', 'input-with-eye-icon-clicked');
        passwordInput.classList.add('input-with-eye-icon');
    }
}

function togglePassword(event) {
    const clickX = event.offsetX;
    const iconArea = passwordInput.offsetWidth - 40;

    if (clickX >= iconArea && passwordInput.value) {
        const isActive = passwordInput.classList.contains('input-with-eye-icon-active');
        if (isActive) {passwordInput.type = 'text';} 
        else {passwordInput.type = 'password';}        
        passwordInput.classList.toggle('input-with-eye-icon-active', !isActive);
        passwordInput.classList.toggle('input-with-eye-icon-clicked', isActive);
    }
}

passwordInput.addEventListener('input', updateInputIcon);
passwordInput.addEventListener('click', togglePassword);


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

// Haupt-Login-Handler
function handleLoginFormSubmit(event) {
    event.preventDefault();
    const email = getInputValue("email");
    const password = getInputValue("password");
    const errorMessage = document.getElementById("error-message");

    if (!validateInput(email, password)) {return showError(errorMessage, "Ungültige Eingaben!");}

    handleLogin(email, password)
        .then(success => {
            if (success) {
                manageLocalUsers(email, password);
                alert("Login erfolgreich!");
                window.location.href = "board.html";
            } else {showError(errorMessage, "E-Mail oder Passwort ist nicht korrekt!");}
        })
        .catch(error => showError(errorMessage, "Fehler: " + error.message));
}

function handleEmailFocusOrInput(event) {
    const email = event.type === "input" ? event.target.value : "";
    manageLocalUsers(email, "", true);
}

function getInputValue(id) {
    return document.getElementById(id).value.trim();
}

function showError(element, message) {
    element.textContent = message;
}

document.getElementById("loginForm").addEventListener("submit", handleLoginFormSubmit);
document.getElementById("email").addEventListener("focus", handleEmailFocusOrInput);
document.getElementById("email").addEventListener("input", handleEmailFocusOrInput);

