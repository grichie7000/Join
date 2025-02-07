// board.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getDatabase, ref, set, get, remove } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";

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

/* Funktion zum Laden der Tasks aus Firebase
   Es werden die Spalten "to-do", "in-progress", "await-feedback" und "done" durchlaufen. */
function loadTasks() {
    const columns = ["to-do", "in-progress", "await-feedback", "done"];
    columns.forEach(column => {
        const container = document.getElementById(column);
        container.innerHTML = "";

        const tasksRef = ref(db, 'tasks/' + column);
        get(tasksRef).then(snapshot => {
            if (snapshot.exists()) {
                snapshot.forEach(childSnapshot => {
                    const task = childSnapshot.val();
                    const taskId = childSnapshot.key;
                    const taskElement = createTaskElement(task, taskId, column);
                    container.appendChild(taskElement);
                });
            } else {
                container.innerHTML = `
                    <div class="empty-placeholder">
                         No tasks To do
                    </div>
                `;
            }
        }).catch((error) => {
            console.error("Fehler beim Laden der Tasks: ", error);
        });
    });
}

function createTaskElement(task, taskId, columnId) {
    const div = document.createElement("div");
    div.classList.add("task");
    div.draggable = true;
    div.id = taskId;
    
    // Kategorie-Stil
    let categoryText = "Keine Kategorie";
    let categoryBgColor = "#f0f0f0";
    if (task.category === "Technical Task") {
        categoryText = "Technical Task";
        categoryBgColor = "#23D8C2";
    } else if (task.category === "User Story") {
        categoryText = "User Story";
        categoryBgColor = "#1500ff";
    }

    // Subtasks
    let subtasksHtml = "";
    if (task.subtasks?.length > 0) {
        subtasksHtml = `
            <div class="task-subtasks">
                <ul>${task.subtasks.map(s => `<li>${s}</li>`).join("")}</ul>
            </div>
        `;
    }

    // Kontakte
    let contactsHtml = "";
    if (task.contacts?.length > 0) {
        contactsHtml = `
            <div class="task-contacts">
                <ul>${task.contacts.map(c => `<li>${c.name}</li>`).join("")}</ul>
            </div>
        `;
    }

    // Priorität
    let priorityHtml = "";
    if (task.priority) {
        const iconMap = {
            urgent: "assets/img/urgent.png",
            medium: "assets/img/medium.png",
            low: "assets/img/low.png"
        };
        priorityHtml = `
            <img src="${iconMap[task.priority]}" 
                 alt="${task.priority}" 
                 class="task-priority-icon">
        `;
    }

    // Zusammenbau des HTML
    div.innerHTML = `
        <div class="task-category" style="background: ${categoryBgColor}">${categoryText}</div>
        <h3 style="padding-top: 10px" class="task-title">${task.title}</h3>
        <div class="task-description">${task.description}</div>
        ${subtasksHtml}
        ${(contactsHtml || priorityHtml) ? `
            <div class="task-footer">
                ${contactsHtml}
                ${priorityHtml}
            </div>
        ` : ''}
    `;

    // Event-Listener
    div.addEventListener("click", () => showTaskDetailOverlay(task, taskId, columnId));
    div.addEventListener("dragstart", drag);

    return div;
}

// Drag-Funktion für die Aufgaben
function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
}

window.allowDrop = function (event) {
    event.preventDefault();
};

// Verschiebt einen Task von einer Spalte in eine andere
window.moveTo = function (event, columnId) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("text");
    const task = document.getElementById(taskId);
    const oldColumnElement = document.getElementById(task.parentElement.id);
    const oldColumnId = oldColumnElement.id;
    const newColumnElement = document.getElementById(columnId);

    // Entferne ggf. vorhandene Platzhalter in der neuen Spalte
    const newPlaceholder = newColumnElement.querySelector(".empty-placeholder");
    if (newPlaceholder) newPlaceholder.remove();

    // Füge den Task in die neue Spalte ein
    newColumnElement.appendChild(task);

    // Hole den Task aus der alten Spalte, aktualisiere den Status und verschiebe ihn in Firebase
    const oldTaskRef = ref(db, 'tasks/' + oldColumnId + '/' + taskId);
    get(oldTaskRef).then(snapshot => {
        if (snapshot.exists()) {
            const taskData = snapshot.val();
            taskData.status = columnId;
            const newTaskRef = ref(db, 'tasks/' + columnId + '/' + taskId);
            set(newTaskRef, taskData).then(() => {
                remove(oldTaskRef).then(() => {
                    // Falls die alte Spalte nun leer ist, füge einen Platzhalter hinzu
                    const hasTasks = oldColumnElement.querySelector(".task");
                    if (!hasTasks) {
                        oldColumnElement.innerHTML = `
                            <div class="empty-placeholder">
                                No tasks To do
                            </div>
                        `;
                    }
                });
            });
        }
    });
};

// Öffnet das Overlay zum Erstellen eines neuen Tasks
function showOverlay(columnId) {
    const overlay = document.getElementById("taskOverlay");
    overlay.style.display = "flex";
    overlay.dataset.columnId = columnId;
}

// Schließt das neue Task-Overlay
function hideOverlay() {
    const overlay = document.getElementById("taskOverlay");
    overlay.style.display = "none";
}

// Event-Listener für die Schaltflächen im Header bzw. zum Öffnen des Overlays
document.querySelector(".addTaskButton").addEventListener("click", () => showOverlay("to-do"));
document.querySelector(".toDoButton").addEventListener("click", () => showOverlay("to-do"));
document.querySelector(".inProgressButton").addEventListener("click", () => showOverlay("in-progress"));
document.querySelector(".awaitButton").addEventListener("click", () => showOverlay("await-feedback"));

// Schließt das Overlay, wenn außerhalb des Inhalts geklickt wird
document.getElementById("taskOverlay").addEventListener("click", (event) => {
    if (event.target === document.getElementById("taskOverlay")) {
        hideOverlay();
    }
});

document.querySelector(".create-btn").addEventListener("click", (event) => {
    event.preventDefault();

    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const dueDate = document.getElementById("due-date").value;
    const priority = document.querySelector('input[name="priority"]:checked').value;
    const category = document.getElementById("category").value;

    const columnId = document.getElementById("taskOverlay").dataset.columnId;

    // Erstelle das Task-Datenobjekt inkl. ausgewählter Kontakte und Subtasks
    const taskData = {
        title: title,
        description: description,
        dueDate: dueDate,
        priority: priority,
        category: category,
        status: columnId,
        contacts: selectedContacts,  // Globales Array aus addTask.js
        subtasks: selectedSubtasks   // Globales Array aus addTask.js
    };

    const newTaskId = Date.now().toString();
    set(ref(db, 'tasks/' + columnId + '/' + newTaskId), taskData)
        .then(() => {
            hideOverlay();
            loadTasks();
        })
        .catch((error) => {
            console.error("Fehler beim Speichern des Tasks: ", error);
        });
});

// Zeigt Benutzerinitialen im Profil an (falls vorhanden)
function displayUserInitials() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (loggedInUser && loggedInUser.initials) {
        const initialsElement = document.getElementById("profile-toggle");
        initialsElement.textContent = loggedInUser.initials;
    }
}

document.addEventListener("DOMContentLoaded", displayUserInitials);
loadTasks();

let currentTaskId = null;
let currentColumnId = null;

function showTaskDetailOverlay(task, taskId, columnId) {
    currentTaskId = taskId;
    currentColumnId = columnId;
    const overlay = document.getElementById('taskDetailOverlay');
    // Close-Button Event Listener
    const closeBtn = overlay.querySelector('.close-btn');
    closeBtn.onclick = hideTaskDetailOverlay;
    
  // View Mode Daten füllen
  document.querySelector('.category-badge').textContent = task.category;
  document.querySelector('.category-badge').style.backgroundColor = getCategoryColor(task.category);
  document.querySelector('.task-title').textContent = task.title;
  document.querySelector('.task-description').textContent = task.description;
  document.getElementById('overlay-task-title').textContent = task.title;
  document.getElementById('overlay-task-description').textContent = task.description;
  document.querySelector('.task-due-date').textContent = `Due Date: ${task.dueDate}`;
  document.querySelector('.task-priority').textContent = `Priority: ${task.priority}`;

  const categoryBadge = document.querySelector('.category-badge');
  categoryBadge.textContent = task.category;
  categoryBadge.style.backgroundColor = getCategoryColor(task.category);
  
  // Kontakte anzeigen
  const contactsList = document.querySelector('.contacts-list');
  contactsList.innerHTML = task.contacts?.map(c => `<li>${c.name}</li>`).join('') || '';

  // Subtasks anzeigen
  const subtasksList = document.querySelector('.subtasks-list');
  subtasksList.innerHTML = task.subtasks?.map(s => `<li>${s}</li>`).join('') || '';

  // Event-Listener für Buttons
  document.querySelector('.close-btn').onclick = hideTaskDetailOverlay;
  document.querySelector('.delete-btn').onclick = deleteTask;
  document.querySelector('.edit-btn').onclick = enableEditMode;
  document.querySelector('.save-btn').onclick = saveChanges;

  overlay.style.display = 'block';
}

function hideTaskDetailOverlay() {
    const overlay = document.getElementById('taskDetailOverlay');
    overlay.style.display = 'none';
    
    // Zurücksetzen der Formularfelder
    document.querySelector('.view-mode').style.display = 'block';
    document.querySelector('.edit-mode').style.display = 'none';
    document.querySelector('.edit-btn').style.display = 'inline-block';
    document.querySelector('.delete-btn').style.display = 'inline-block';
    document.querySelector('.save-btn').style.display = 'none';
  }

function enableEditMode() {
    const taskRef = ref(db, `tasks/${currentColumnId}/${currentTaskId}`);
    
    get(taskRef).then(snapshot => {
      const task = snapshot.val();
    
    // Formularfelder füllen
    document.querySelector('.edit-title').value = task.title;
    document.querySelector('.edit-description').value = task.description;
    document.querySelector('.edit-due-date').value = task.dueDate;
    document.querySelector(`input[name="edit-priority"][value="${task.priority}"]`).checked = true;
    
    // Kontakte als Checkboxes
    const contactsContainer = document.querySelector('.edit-contacts');
    contactsContainer.innerHTML = '<legend>Assign Contacts:</legend>' +
      task.contacts?.map(c => `
        <label>
          <input type="checkbox" name="edit-contact" value="${c.name}" ${c.selected ? 'checked' : ''}>
          ${c.name}
        </label>
      `).join('') || '';

    // Subtasks bearbeiten
    const subtasksContainer = document.querySelector('.edit-subtasks');
    subtasksContainer.innerHTML = task.subtasks?.map((s, index) => `
      <div>
        <input type="text" value="${s}" class="edit-subtask">
        <button type="button" onclick="removeSubtask(${index})">×</button>
      </div>
    `).join('') || '';

    const categoryRadio = document.querySelector(`input[name="edit-category"][value="${task.category}"]`);
  if (categoryRadio) categoryRadio.checked = true;

    document.querySelector('.edit-btn').style.display = 'none';
    document.querySelector('.delete-btn').style.display = 'none';
    document.querySelector('.save-btn').style.display = 'inline-block';
    
    // Mode wechseln
    document.querySelector('.view-mode').style.display = 'none';
    document.querySelector('.edit-mode').style.display = 'block';
  });
}
document.addEventListener("DOMContentLoaded", function () {
    const editButton = document.querySelector(".edit-btn");
    const saveButton = document.querySelector(".save-btn");
    const deleteButton = document.querySelector(".delete-btn");
    const viewMode = document.querySelector(".view-mode");
    const editMode = document.querySelector(".edit-mode");

    editButton.addEventListener("click", function () {
        viewMode.style.display = "none";
        editMode.style.display = "block";
        saveButton.style.display = "inline-block";
        editButton.style.display = "none";
    });

    saveButton.addEventListener("click", function () {
        viewMode.style.display = "block";
        editMode.style.display = "none";
        saveButton.style.display = "none";
        editButton.style.display = "inline-block";
    });
});


function saveChanges() {
    const taskRef = ref(db, `tasks/${currentColumnId}/${currentTaskId}`);
  
  const updatedTask = {
    title: document.querySelector('.edit-title').value,
    description: document.querySelector('.edit-description').value,
    category: document.querySelector('input[name="edit-category"]:checked').value,
    dueDate: document.querySelector('.edit-due-date').value,
    priority: document.querySelector('input[name="edit-priority"]:checked').value,
    contacts: Array.from(document.querySelectorAll('input[name="edit-contact"]:checked'))
               .map(c => ({ name: c.value })),
    subtasks: Array.from(document.querySelectorAll('.edit-subtask'))
               .map(input => input.value)
  };

  set(taskRef, updatedTask).then(() => {
    // View Mode aktualisieren
    document.querySelector('.task-title').textContent = updatedTask.title;
    document.querySelector('.task-description').textContent = updatedTask.description;
    document.querySelector('.task-due-date').textContent = `Due Date: ${updatedTask.dueDate}`;
    document.querySelector('.task-priority').textContent = `Priority: ${updatedTask.priority}`;
    document.querySelector('.category-badge').textContent = updatedTask.category;
    document.querySelector('.category-badge').style.backgroundColor = getCategoryColor(updatedTask.category);
    
    // Board neu laden
    loadTasks();

    // Zurück zum View Mode
    document.querySelector('.view-mode').style.display = 'block';
    document.querySelector('.edit-mode').style.display = 'none';
    document.querySelector('.edit-btn').style.display = 'inline-block';
    document.querySelector('.delete-btn').style.display = 'inline-block';
    document.querySelector('.save-btn').style.display = 'none';
  });
}

function deleteTask() {
  const taskRef = ref(db, `tasks/${currentColumnId}/${currentTaskId}`);
  remove(taskRef).then(() => {
    hideTaskDetailOverlay();
    loadTasks();
  });
}

// Hilfsfunktion für Kategoriefarbe
function getCategoryColor(category) {
  return category === 'Technical Task' ? '#23D8C2' : '#1500ff';
}
