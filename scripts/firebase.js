// import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
// import { getDatabase, ref, set } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js';

// // Firebase-Konfiguration
// const firebaseConfig = {
//   apiKey: "AIzaSyBCuA1XInnSHfEyGUKQQqmqRgvqfhx7dHc",
//   authDomain: "join-d3707.firebaseapp.com",
//   databaseURL: "https://join-d3707-default-rtdb.europe-west1.firebasedatabase.app",
//   projectId: "join-d3707",
//   storageBucket: "join-d3707.firebasestorage.app",
//   messagingSenderId: "961213557325",
//   appId: "1:961213557325:web:0253482ac485b4bb0e4a04"
// };

// // Firebase-App initialisieren
// const app = initializeApp(firebaseConfig);
// const database = getDatabase(app);

// // Eingabefelder und Button referenzieren
// const emailInput = document.getElementById('email');
// const passwordInput = document.getElementById('password');
// const submitButton = document.getElementById('submit');

// // Funktion, um den Button zu aktivieren/deaktivieren
// function toggleSubmitButton() {
//   if (emailInput.value !== '' && passwordInput.value !== '') {
//     submitButton.disabled = false; // Aktivieren, wenn beide Felder ausgefüllt sind
//   } else {
//     submitButton.disabled = true; // Deaktivieren, wenn eines der Felder leer ist
//   }
// }

// // Event-Listener für beide Eingabefelder hinzufügen
// emailInput.addEventListener('input', toggleSubmitButton);
// passwordInput.addEventListener('input', toggleSubmitButton);

// // Event-Listener für das Formular
// submitButton.addEventListener('click', (event) => {
//   event.preventDefault();
  
//   const email = emailInput.value;
//   const password = passwordInput.value;

//   // Speichern der Daten in der Firebase-Datenbank
//   const sanitizedEmail = email.replace(/\./g, '_'); // Entfernen von "." da Firebase sie nicht zulässt
//   const dbRef = ref(database, 'users/' + sanitizedEmail);

//   set(dbRef, {
//     email: email,
//     password: password
//   }).then(() => {
//     alert('Daten erfolgreich gespeichert!');
//   }).catch((error) => {
//     alert('Fehler: ' + error.message);
//   });
// });

// // Initialer Aufruf, um den Button beim Laden der Seite korrekt zu setzen
// toggleSubmitButton();