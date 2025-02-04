import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getDatabase, ref, set, get, child, remove } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";

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

// Initialisiere Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Funktion zum Laden der Tasks
function loadTasks() {
    const columns = ["to-do", "in-progress", "await-feedback", "done"];
    columns.forEach(column => {
        const container = document.getElementById(column);
        container.innerHTML = ""; // Vorherige Tasks leeren

        const tasksRef = ref(db, 'tasks/' + column);
        get(tasksRef).then(snapshot => {
            if (snapshot.exists()) {
                snapshot.forEach(childSnapshot => {
                    const task = childSnapshot.val(); // Task-Daten
                    const taskId = childSnapshot.key; // Eindeutige ID des Tasks
                    const taskElement = createTaskElement(task, taskId); // Task-Element erstellen
                    container.appendChild(taskElement); // Task in die Spalte einfügen
                });
            } else {
                console.log("Keine Tasks gefunden für Spalte: ", column);
            }
        }).catch((error) => {
            console.error("Fehler beim Laden der Tasks: ", error);
        });
    });
}

// Funktion zum Erstellen eines Task-Elements
function createTaskElement(task, taskId) {
    const div = document.createElement("div");
    div.classList.add("task");
    div.draggable = true;
    div.id = taskId; // Setze die ID des Tasks
    div.innerHTML = `
        <h3 class="task-title">${task.title}</h3>
        <p class="task-name">${task.name}</p>
        <p class="task-description">${task.description}</p>
    `;
    div.addEventListener("dragstart", drag); // Drag-Event hinzufügen
    return div;
}

// Drag-Event
function drag(event) {
    event.dataTransfer.setData("text", event.target.id); // ID des gezogenen Tasks speichern
}

// Allow Drop-Event
window.allowDrop = function (event) {
    event.preventDefault(); // Standardverhalten verhindern
};

// Move To-Event
window.moveTo = function (event, columnId) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("text"); // ID des gezogenen Tasks holen
    const task = document.getElementById(taskId); // Task-Element holen
    const column = document.getElementById(columnId); // Zielspalte holen
    column.appendChild(task); // Task in die Zielspalte verschieben

    // Task in der Datenbank aktualisieren
    const taskRef = ref(db, 'tasks/' + taskId); // Eindeutiger Task-Pfad
    get(taskRef).then(snapshot => {
        if (snapshot.exists()) {
            const taskData = snapshot.val();
            taskData.status = columnId; // Status der Aufgabe aktualisieren
            set(ref(db, 'tasks/' + columnId + '/' + taskId), taskData).then(() => {
                loadTasks(); // Tasks neu laden
            }).catch((error) => {
                console.error("Fehler beim Verschieben des Tasks: ", error);
            });
        }
    }).catch((error) => {
        console.error("Fehler beim Laden des Tasks: ", error);
    });
};

// Overlay anzeigen
function showOverlay(columnId) {
    const overlay = document.getElementById("taskOverlay");
    overlay.style.display = "flex"; // Overlay anzeigen

    // Speichere die Spalten-ID im Overlay, um sie später zu verwenden
    overlay.dataset.columnId = columnId;
}

// Overlay verstecken
function hideOverlay() {
    const overlay = document.getElementById("taskOverlay");
    overlay.style.display = "none"; // Overlay ausblenden
}

document.querySelector(".addTaskButton").addEventListener("click", () => showOverlay("to-do"));
document.querySelector(".toDoButton").addEventListener("click", () => showOverlay("to-do"));
document.querySelector(".inProgressButton").addEventListener("click", () => showOverlay("in-progress"));
document.querySelector(".awaitButton").addEventListener("click", () => showOverlay("await-feedback"));

// Event-Listener für das Schließen des Overlays (z. B. durch Klicken außerhalb)
document.getElementById("taskOverlay").addEventListener("click", (event) => {
    if (event.target === document.getElementById("taskOverlay")) {
        hideOverlay();
    }
});

// Event-Listener für das Erstellen eines neuen Tasks
document.querySelector(".create-btn").addEventListener("click", (event) => {
    event.preventDefault(); // Verhindere das Neuladen der Seite

    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const dueDate = document.getElementById("due-date").value;
    const priority = document.querySelector('input[name="priority"]:checked').value;
    const category = document.getElementById("category").value;

    // Hole die Spalten-ID aus dem Overlay
    const columnId = document.getElementById("taskOverlay").dataset.columnId;

    const taskData = {
        title: title,
        description: description,
        dueDate: dueDate,
        priority: priority,
        category: category,
        status: columnId // Status basierend auf der Spalte setzen
    };

    // Task in Firebase speichern
    const newTaskId = Date.now().toString();
    set(ref(db, 'tasks/' + columnId + '/' + newTaskId), taskData).then(() => {
        hideOverlay(); // Overlay schließen
        loadTasks(); // Tasks neu laden
    }).catch((error) => {
        console.error("Fehler beim Speichern des Tasks: ", error);
    });
});

// Funktion zum Anzeigen der Initialen
function displayUserInitials() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (loggedInUser && loggedInUser.initials) {
        const initialsElement = document.getElementById("profile-toggle");
        initialsElement.textContent = loggedInUser.initials;
    }
}

// Initialen beim Laden der Seite anzeigen
document.addEventListener("DOMContentLoaded", displayUserInitials);

// Initiales Laden der Tasks
loadTasks();