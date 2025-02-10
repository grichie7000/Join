import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js';
    import { getDatabase, ref, get } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js';

    // Firebase-Konfiguration (gleich wie in register.html)
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

    // Berechnet Initialen
    const getInitials = (name) => {
      return name.replace(/\s+/g, ' ')
                 .trim()
                 .split(' ')
                 .slice(0, 2)
                 .map(part => part.charAt(0).toUpperCase())
                 .join('');
    };

    // Sucht den Benutzer in der Datenbank
    const handleLogin = async (email, password) => {
      const snapshot = await get(ref(db, 'users'));
      const users = snapshot.val() || {};
      const foundUser = Object.entries(users).find(
        ([, user]) => user.email === email && user.password === password
      );
      if (!foundUser) throw new Error("Anmeldedaten ungültig");
      
      const [userId, user] = foundUser;
      return {
        ...user,
        id: userId,
        initials: user.initials || getInitials(user.name)
      };
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();
      const errorElement = document.getElementById('error-message');
  
      try {
        const user = await handleLogin(email, password);
        // Speichern des eingeloggten Benutzers in localStorage
        localStorage.setItem('loggedInUser', JSON.stringify({
          ...user,
          initials: user.initials || getInitials(user.name)
        }));
  
        // Weiterleitung zur gewünschten Seite (z.B. board.html)
        window.location.href = 'board.html';
      } catch (error) {
        errorElement.textContent = error.message;
        errorElement.style.display = 'block';
      }
    };

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
      const form = document.getElementById("loginForm");
      form.addEventListener("submit", handleSubmit);

      // Setup für die Passwort-Icon-Umschaltung
      setupPasswordToggle('password');
    });