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

function drag(event) {
    event.dataTransfer.setData("text", event.target.id); // ID des gezogenen Tasks speichern
}

function allowDrop(event) {
    event.preventDefault(); // Standardverhalten verhindern
}

function moveTo(event, columnId) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("text"); // ID des gezogenen Tasks holen
    const task = document.getElementById(taskId); // Task-Element holen
    const column = document.getElementById(columnId); // Zielspalte holen
    column.appendChild(task); // Task in die Zielspalte verschieben

    // Task in der Datenbank aktualisieren
    const taskRef = ref(db, 'tasks/' + columnId + '/' + taskId);
    get(taskRef).then(snapshot => {
        if (snapshot.exists()) {
            const taskData = snapshot.val();
            set(ref(db, 'tasks/' + columnId + '/' + taskId), taskData).then(() => {
                // Task aus der alten Spalte entfernen
                const oldColumnRef = ref(db, 'tasks/' + task.parentElement.id + '/' + taskId);
                remove(oldColumnRef).then(() => {
                    loadTasks(); // Tasks neu laden
                }).catch((error) => {
                    console.error("Fehler beim Entfernen des Tasks: ", error);
                });
            }).catch((error) => {
                console.error("Fehler beim Verschieben des Tasks: ", error);
            });
        }
    }).catch((error) => {
        console.error("Fehler beim Laden des Tasks: ", error);
    });
}

// Overlay anzeigen
function showOverlay() {
    const overlay = document.getElementById("taskOverlay");
    overlay.style.display = "flex"; // Overlay anzeigen
}

// Overlay verstecken
function hideOverlay() {
    const overlay = document.getElementById("taskOverlay");
    overlay.style.display = "none"; // Overlay ausblenden
}

// Event-Listener für den "Add Task"-Button
document.querySelector(".addTaskButton").addEventListener("click", showOverlay);

// Event-Listener für das Schließen des Overlays (z. B. durch Klicken außerhalb)
document.getElementById("taskOverlay").addEventListener("click", (event) => {
    if (event.target === document.getElementById("taskOverlay")) {
        hideOverlay();
    }
});

document.querySelector(".create-btn").addEventListener("click", (event) => {
    event.preventDefault(); // Verhindere das Neuladen der Seite

    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const dueDate = document.getElementById("due-date").value;
    const priority = document.querySelector('input[name="priority"]:checked').value;
    const category = document.getElementById("category").value;

    const taskData = {
        title: title,
        description: description,
        dueDate: dueDate,
        priority: priority,
        category: category,
        status: "to-do" // Standardmäßig in "To Do"
    };

    // Task in Firebase speichern
    const newTaskId = Date.now().toString();
    set(ref(db, 'tasks/to-do/' + newTaskId), taskData).then(() => {
        hideOverlay(); // Overlay schließen
        loadTasks(); // Tasks neu laden
    }).catch((error) => {
        console.error("Fehler beim Speichern des Tasks: ", error);
    });
});