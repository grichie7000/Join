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

function saveUser(name, email, password) {
    const userId = Date.now();
    return set(ref(db, "users/" + userId), { name, email, password });
}

function checkAndRegister(name, email, password, errorMessage) {
    get(child(ref(db), "users")).then(snapshot => {
        const emailExists = snapshot.exists() && Object.values(snapshot.val()).some(user => user.email === email);
        if (emailExists) throw new Error("Diese E-Mail ist bereits registriert!");

        return saveUser(name, email, password);
    }).then(() => {
        const overlay = document.getElementById("successOverlay");
        const overlay_content = document.getElementById('overlay-content');
            overlay.style.display = "flex";
            overlay_content.style.display = 'flex';
            setTimeout(() => {
                overlay.style.display = "none";
                overlay_content.style.display = 'none';
                window.location.href = "reLogin.html";
            }, 1000);
    }).catch(error => errorMessage.textContent = error.message);
}



document.getElementById("form").addEventListener("submit", function (event) {
    event.preventDefault();

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

const passwordInput = document.getElementById('password');

function setActiveIcon() {
    passwordInput.classList.remove('input-with-eye-icon');
    passwordInput.classList.add('input-with-eye-icon-active');
}

function resetIcon() {
    passwordInput.classList.remove('input-with-eye-icon-active');
    passwordInput.classList.remove('input-with-eye-icon-clicked');
    passwordInput.classList.add('input-with-eye-icon');
}

passwordInput.addEventListener('input', () => {
    if (passwordInput.value) {
        setActiveIcon();
    } else {
        resetIcon(); 
    }
});

function togglePassword() {
    const isActive = passwordInput.classList.contains('input-with-eye-icon-active');

    if (isActive) {
        passwordInput.type = 'text'; // Passwort sichtbar machen
        passwordInput.classList.remove('input-with-eye-icon-active');
        passwordInput.classList.add('input-with-eye-icon-clicked');
    } else {
        passwordInput.type = 'password'; // Passwort unsichtbar machen
        passwordInput.classList.remove('input-with-eye-icon-clicked');
        passwordInput.classList.add('input-with-eye-icon-active');
    }
}

// Funktion zur Überprüfung, ob der Klick im Icon-Bereich des Passwortfelds war
function clickOnIconArea(event) {
    const inputWidth = passwordInput.offsetWidth;
    const clickX = event.offsetX;

    return clickX >= inputWidth - 40 && passwordInput.value;
}

passwordInput.addEventListener('click', (event) => {
    if (clickOnIconArea(event)) {
        togglePassword();
    }
});

const repeatPasswordInput = document.getElementById('repeat-password');

function repeatPasswordIcon() {
    repeatPasswordInput.classList.remove('input-with-eye-icon');
    repeatPasswordInput.classList.add('input-with-eye-icon-active');
}

function resetRepeatPasswordIcon() {
    repeatPasswordInput.classList.remove('input-with-eye-icon-active');
    repeatPasswordInput.classList.remove('input-with-eye-icon-clicked');
    repeatPasswordInput.classList.add('input-with-eye-icon');
}

repeatPasswordInput.addEventListener('input', () => {
    if (repeatPasswordInput.value) {
        repeatPasswordIcon();
    } else {
        resetRepeatPasswordIcon(); 
    }
});

function toggleRepeatPassword() {
    const isActive = repeatPasswordInput.classList.contains('input-with-eye-icon-active');

    if (isActive) {
        repeatPasswordInput.type = 'text'; // Passwort sichtbar machen
        repeatPasswordInput.classList.remove('input-with-eye-icon-active');
        repeatPasswordInput.classList.add('input-with-eye-icon-clicked');
    } else {
        repeatPasswordInput.type = 'password'; // Passwort unsichtbar machen
        repeatPasswordInput.classList.remove('input-with-eye-icon-clicked');
        repeatPasswordInput.classList.add('input-with-eye-icon-active');
    }
}

// Funktion zur Überprüfung, ob der Klick im Icon-Bereich des Passwortfelds war
function clickOnRepeatPasswordIconArea(event) {
    const inputWidth = repeatPasswordInput.offsetWidth;
    const clickX = event.offsetX;

    return clickX >= inputWidth - 40 && repeatPasswordInput.value;
}

repeatPasswordInput.addEventListener('click', (event) => {
    if (clickOnRepeatPasswordIconArea(event)) {
        toggleRepeatPassword();
    }
});