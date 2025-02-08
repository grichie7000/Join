
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getDatabase, ref, set, get, remove } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";
import { onValue } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";

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

// Hilfsfunktion: Schneller Zugriff auf Elemente per ID
const $ = (id) => document.getElementById(id);

const loadTasks = () => {
    const columns = ["to-do", "in-progress", "await-feedback", "done"];
    columns.forEach(column => {
      const container = $(column);
      const tasksRef = ref(db, `tasks/${column}`);
  
      // Echtzeit-Listener: Reagiert auf jede Änderung im jeweiligen Spaltenpfad
      onValue(tasksRef, (snapshot) => {
        container.innerHTML = ""; // Container leeren
  
        if (snapshot.exists()) {
          snapshot.forEach(childSnapshot => {
            const task = childSnapshot.val();
            const taskId = childSnapshot.key;
            const taskElement = createTaskElement(task, taskId, column);
            container.appendChild(taskElement);
          });
        } else {
          // Falls keine Tasks vorhanden sind, den Placeholder setzen
          container.innerHTML = `<div class="empty-placeholder">No tasks To do</div>`;
        }
  
        // Falls durch die Änderungen ein Feld leer geworden ist, Platzhalter einfügen
        updatePlaceholders();
      });
    });
  };

const createTaskElement = (task, taskId, columnId) => {
    const div = document.createElement("div");
    div.className = "task";
    div.draggable = true;
    div.id = taskId;

    // Kategorie-Stil
    let categoryText = task.category || "Keine Kategorie";
    let categoryBgColor = "#f0f0f0";
    if (task.category === "Technical Task") {
        categoryText = "Technical Task";
        categoryBgColor = "#23D8C2";
    } else if (task.category === "User Story") {
        categoryText = "User Story";
        categoryBgColor = "#1500ff";
    }

    // Subtasks erstellen
    const subtasksHtml = task.subtasks && task.subtasks.length > 0
        ? `<div class="task-subtasks"><ul>${task.subtasks.map(s => `<li>${s}</li>`).join("")}</ul></div>`
        : "";

    const contactsHtml = task.contacts && task.contacts.length > 0
        ? `<div class="task-contacts">${task.contacts.map((c, index) => {
            // Sicherstellen, dass der Name existiert
            const contactName = c?.name || 'Unknown';
            return `
            <div class="contact-badge" 
                 style="background: ${getContactColor(contactName)}" 
                 title="${contactName}">
              ${getInitials(contactName)}
            </div>`;
          }).join("")}
          </div>`
        : "";

    // Priorität
    let priorityHtml = "";
    if (task.priority) {
        const iconMap = {
            urgent: "assets/img/urgent.png",
            medium: "assets/img/medium.png",
            low: "assets/img/low.png"
        };
        priorityHtml = `<img src="${iconMap[task.priority]}" alt="${task.priority}" class="task-priority-icon">`;
    }

    // Zusammenbau des Task-HTMLs
    div.innerHTML = `
    <div class="task-category" style="background: ${categoryBgColor}">${categoryText}</div>
    <h3 class="task-title" style="padding-top: 10px">${task.title}</h3>
    <div class="task-description">${task.description}</div>
    ${subtasksHtml}
    ${(contactsHtml || priorityHtml) ? `<div class="task-footer">${contactsHtml}${priorityHtml}</div>` : ''}
  `;

    // Event-Listener: Beim Klick wird das Detail-Overlay geöffnet; Drag & Drop aktivieren
    div.addEventListener("click", () => showTaskDetailOverlay(task, taskId, columnId));
    div.addEventListener("dragstart", drag);

    return div;
};

/* --- Drag & Drop Funktionen --- */
const drag = (event) => {
    event.dataTransfer.setData("text", event.target.id);
};

window.allowDrop = (event) => event.preventDefault();

window.moveTo = (event, columnId) => {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("text");
    const task = $(taskId);
    // Ermitteln des alten Containers anhand der aktuellen Eltern-ID
    const oldColumnElement = $(task.parentElement.id);
    const oldColumnId = oldColumnElement.id;
    const newColumnElement = $(columnId);

    // Entferne ggf. vorhandene Platzhalter in der neuen Spalte
    const newPlaceholder = newColumnElement.querySelector(".empty-placeholder");
    if (newPlaceholder) newColumnElement.removeChild(newPlaceholder);
    newColumnElement.appendChild(task);

    // In Firebase den Task in die neue Spalte verschieben
    const oldTaskRef = ref(db, `tasks/${oldColumnId}/${taskId}`);
    get(oldTaskRef).then(snapshot => {
        if (snapshot.exists()) {
            const taskData = snapshot.val();
            taskData.status = columnId;
            const newTaskRef = ref(db, `tasks/${columnId}/${taskId}`);
            set(newTaskRef, taskData).then(() => {
                remove(oldTaskRef).then(() => {
                    // Falls die alte Spalte nach dem Entfernen leer ist, Platzhalter einfügen
                    if (!oldColumnElement.querySelector(".task")) {
                        oldColumnElement.innerHTML = `<div class="empty-placeholder">No tasks To do</div>`;
                    }
                    // Alle Spalten überprüfen und ggf. Platzhalter hinzufügen
                    updatePlaceholders();
                });
            });
        }
    });
};

/* --- Funktion zum Aktualisieren der Platzhalter in allen Spalten --- */
const updatePlaceholders = () => {
    const columns = ["to-do", "in-progress", "await-feedback", "done"];
    columns.forEach(columnId => {
        const column = $(columnId);
        // Falls weder ein Task noch ein Platzhalter vorhanden ist, füge den Platzhalter hinzu
        if (!column.querySelector(".task") && !column.querySelector(".empty-placeholder")) {
            column.innerHTML = `<div class="empty-placeholder">No tasks To do</div>`;
        }
    });
};

/* --- Overlay zum Erstellen eines neuen Tasks --- */
const showOverlay = (columnId) => {
    const overlay = $("taskOverlay");
    overlay.style.display = "flex";
    overlay.dataset.columnId = columnId;
};

const hideOverlay = () => {
    $("taskOverlay").style.display = "none";
};

// Event-Listener für die Schaltflächen, die das Overlay öffnen
document.querySelector(".addTaskButton").addEventListener("click", () => showOverlay("to-do"));
document.querySelector(".toDoButton").addEventListener("click", () => showOverlay("to-do"));
document.querySelector(".inProgressButton").addEventListener("click", () => showOverlay("in-progress"));
document.querySelector(".awaitButton").addEventListener("click", () => showOverlay("await-feedback"));

// Schließt das Overlay, wenn außerhalb des Inhalts geklickt wird
$("taskOverlay").addEventListener("click", (event) => {
    if (event.target === $("taskOverlay")) {
        hideOverlay();
    }
});

// Falls die globalen Arrays nicht definiert sind, verwende leere Arrays
const selectedContacts = window.selectedContacts || [];
const selectedSubtasks = window.selectedSubtasks || [];

// Neuen Task erstellen
document.querySelector(".create-btn").addEventListener("click", (event) => {
    event.preventDefault();

    const title = $("title").value;
    const description = $("description").value;
    const dueDate = $("due-date").value;
    const priority = document.querySelector('input[name="priority"]:checked').value;
    const category = $("category").value;
    const columnId = $("taskOverlay").dataset.columnId;

    // Erstelle das Task-Datenobjekt
    const taskData = {
        title,
        description,
        dueDate,
        priority,
        category,
        status: columnId,
        contacts: selectedContacts,
        subtasks: selectedSubtasks
    };

    const newTaskId = Date.now().toString();
    set(ref(db, `tasks/${columnId}/${newTaskId}`), taskData)
        .then(() => {
            hideOverlay();
            loadTasks();
        })
        .catch((error) => console.error("Fehler beim Speichern des Tasks:", error));
});

/* --- Benutzerinitialen im Profil anzeigen --- */
const displayUserInitials = () => {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (loggedInUser && loggedInUser.initials) {
        $("profile-toggle").textContent = loggedInUser.initials;
    }
};
document.addEventListener("DOMContentLoaded", displayUserInitials);

/* --- Initiale Aufgaben laden --- */
loadTasks();

/* --- Task-Detail-Overlay (Anzeigen, Editieren, Speichern, Löschen) --- */
let currentTaskId = null;
let currentColumnId = null;

const showTaskDetailOverlay = (task, taskId, columnId) => {
    currentTaskId = taskId;
    currentColumnId = columnId;
    const overlay = $("taskDetailOverlay");

    // Schließe-Button konfigurieren
    overlay.querySelector('.close-btn').onclick = hideTaskDetailOverlay;

    // View-Mode: Daten anzeigen
    overlay.querySelector('.category-badge').textContent = task.category;
    overlay.querySelector('.category-badge').style.backgroundColor = getCategoryColor(task.category);
    overlay.querySelector('.task-title').textContent = task.title;
    overlay.querySelector('.task-description').textContent = task.description;
    $("overlay-task-title").textContent = task.title;
    $("overlay-task-description").textContent = task.description;
    overlay.querySelector('.task-due-date').textContent = `Due Date: ${task.dueDate}`;
    overlay.querySelector('.task-priority').textContent = `Priority: ${task.priority}`;

    // Kontakte und Subtasks anzeigen
    const contactsList = overlay.querySelector('.contacts-list');

    contactsList.innerHTML = task.contacts?.map(c => `
    <div class="contact-badge no-overlap" style="background: ${getContactColor(c.name)}" title="${c.name}">
      ${getInitials(c.name)}
    </div>`).join('') || '';
    const subtasksList = overlay.querySelector('.subtasks-list');
    subtasksList.innerHTML = task.subtasks?.map(s => `<li>${s}</li>`).join('') || '';

    // Buttons konfigurieren
    overlay.querySelector('.close-btn').onclick = hideTaskDetailOverlay;
    overlay.querySelector('.delete-btn').onclick = deleteTask;
    overlay.querySelector('.edit-btn').onclick = enableEditMode;
    overlay.querySelector('.save-btn').onclick = saveChanges;

    overlay.style.display = 'block';
};

const hideTaskDetailOverlay = () => {
    const overlay = $("taskDetailOverlay");
    overlay.style.display = 'none';

    // Zurücksetzen: Wechsel zurück in den View-Modus
    overlay.querySelector('.view-mode').style.display = 'block';
    overlay.querySelector('.edit-mode').style.display = 'none';
    overlay.querySelector('.edit-btn').style.display = 'inline-block';
    overlay.querySelector('.delete-btn').style.display = 'inline-block';
    overlay.querySelector('.save-btn').style.display = 'none';
    overlay.querySelector('.button-seperator').style.display = 'inline-block';
    overlay.querySelector('.edit-svg').style.display = 'inline-block';
    overlay.querySelector('.delete-svg').style.display = 'inline-block';
};

let currentTaskCategory = null; // globale Variable

const enableEditMode = () => {
    const taskRef = ref(db, `tasks/${currentColumnId}/${currentTaskId}`);
    get(taskRef).then(snapshot => {
        const task = snapshot.val();
        const overlay = document.getElementById("taskDetailOverlay");

        // Umschalten auf Edit-Modus:
        overlay.querySelector('.view-mode').style.display = 'none';
        overlay.querySelector('.edit-mode').style.display = 'block';
        // Optional: Edit- und Delete-Button ausblenden, Save-Button einblenden
        overlay.querySelector('.edit-svg').style.display = 'none';
        overlay.querySelector('.delete-svg').style.display = 'none';
        overlay.querySelector('.edit-btn').style.display = 'none';
        overlay.querySelector('.delete-btn').style.display = 'none';
        overlay.querySelector('.button-seperator').style.display = 'none';
        overlay.querySelector('.save-btn').style.display = 'inline-block';

        // Speichere den aktuellen Kategorienwert in der globalen Variable
        currentTaskCategory = task.category;

        // Formularfelder im Edit-Modus füllen
        overlay.querySelector('#edit-title').value = task.title;
        overlay.querySelector('#edit-description').value = task.description;
        overlay.querySelector('#edit-due-date').value = task.dueDate;
        overlay.querySelector(`input[name="edit-priority"][value="${task.priority}"]`).checked = true;

        // Kontakte aus Firebase laden
        const contactsRef = ref(db, 'contactsDatabase');
        get(contactsRef).then(snapshot => {
            const allContacts = [];
            if (snapshot.exists()) {
                snapshot.forEach(childSnapshot => {
                    allContacts.push(childSnapshot.val());
                });
            }

            // Container für Checkboxen
            const checkboxContainer = overlay.querySelector('#editContactsCheckboxContainer');

            // Erstelle Checkboxen für alle Kontakte – **Name-Attribut hinzugefügt**
            checkboxContainer.innerHTML = allContacts.map(contact => `
          <label class="contact-checkbox">
            <input type="checkbox" name="edit-contact"
                   value="${contact.name}" 
                   ${task.contacts?.some(c => c.name === contact.name) ? 'checked' : ''}>
            ${contact.name}
          </label>
        `).join('');

            // Aktualisiere die Anzeige der ausgewählten Kontakte
            updateSelectedContactsDisplay(overlay);
        });

        // Event-Listener für Checkbox-Änderungen
        overlay.querySelector('#editContactsCheckboxContainer').addEventListener('change', () => {
            updateSelectedContactsDisplay(overlay);
        });
    });
};

function getInitials(name) {
    if (!name || typeof name !== 'string') return '??';
    return name.split(' ')
      .map(n => n[0]?.toUpperCase() || '')
      .join('')
      .substring(0, 2);
}

function getContactColor(name) {
  // Fallback für undefinierte oder ungültige Namen
  const safeName = typeof name === 'string' ? name : 'Unknown';
  const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#33FFF8', '#F8FF33'];
  const hash = Array.from(safeName).reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  return colors[hash % colors.length];
}

function createContactBadge(contact) {
    const badge = document.createElement('div');
    badge.className = 'contact-badge';
    badge.style.backgroundColor = getContactColor(contact.name);
    badge.title = contact.name;
    badge.textContent = getInitials(contact.name);
    return badge;
}

// Hilfsfunktion zur Aktualisierung der Anzeige
function updateSelectedContactsDisplay(overlay) {
    const checkboxes = overlay.querySelectorAll('#editContactsCheckboxContainer input[type="checkbox"]');
    const selectedContainer = overlay.querySelector('.selected-contacts-list');
    selectedContainer.innerHTML = '';

    Array.from(checkboxes)
        .filter(checkbox => checkbox.checked)
        .forEach(checkbox => {
            const contact = { name: checkbox.value };
            selectedContainer.appendChild(createContactBadge(contact));
        });
}

// Dropdown ein-/ausblenden
window.toggleContactsDropdown = () => {
    let dropdown = document.getElementById("contactsDropdown");
    if (dropdown.style.display === "block") {
        dropdown.style.display = "none";
    } else {
        dropdown.style.display = "block";
    }
};

// Schließe Dropdown bei Klick außerhalb
document.addEventListener('click', (e) => {
    if (!e.target.closest('.contact-selection-wrapper')) {
        document.querySelectorAll('.contacts-dropdown').forEach(d => d.style.display = 'none');
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const selectBox = document.getElementById("edit-assigned-to");
    // Falls das Element nicht existiert, wird der gesamte Block übersprungen.
    if (!selectBox) return;

    const dropdown = document.getElementById("edit-assigned-to-list");
    const selectedContainer = document.getElementById("editSelectedContacts");

    // Klick auf das Auswahlfeld (zeigt die Dropdown-Liste)
    selectBox.addEventListener("click", function () {
        dropdown.classList.toggle("hidden");
    });

    // Auswahl eines Kontakts aus der Dropdown-Liste
    dropdown.addEventListener("click", function (event) {
        if (event.target.tagName === "LI") {
            const selectedUser = event.target.textContent;
            const selectedValue = event.target.dataset.value;

            // Neuen Eintrag im Container für ausgewählte Kontakte hinzufügen
            let selectedItem = document.createElement("span");
            selectedItem.textContent = selectedUser;
            selectedItem.classList.add("selected-user");
            selectedItem.dataset.value = selectedValue;
            selectedContainer.appendChild(selectedItem);

            // Auswahl im Box-Text aktualisieren
            selectBox.textContent = "Selected: " + selectedUser;

            // Dropdown ausblenden
            dropdown.classList.add("hidden");
        }
    });

    // Klick außerhalb des Dropdowns schließt es
    document.addEventListener("click", function (event) {
        if (!selectBox.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.classList.add("hidden");
        }
    });
});

// --- Änderungen speichern ---
const saveChanges = () => {
    const taskRef = ref(db, `tasks/${currentColumnId}/${currentTaskId}`);
    const overlay = document.getElementById("taskDetailOverlay");

    const updatedTask = {
        title: overlay.querySelector('#edit-title').value,
        description: overlay.querySelector('#edit-description').value,
        category: overlay.querySelector('.category-badge').textContent,  // Kategorie bleibt unverändert
        dueDate: overlay.querySelector('#edit-due-date').value,
        priority: overlay.querySelector('input[name="edit-priority"]:checked').value,
        contacts: Array.from(overlay.querySelectorAll('input[name="edit-contact"]:checked'))
            .map(c => ({ name: c.value })),
        subtasks: Array.from(overlay.querySelectorAll('.edit-subtask'))
            .map(input => input.value),
        status: currentColumnId
    };

    set(taskRef, updatedTask).then(() => {
        // Zurück in den View-Modus wechseln und die Anzeige aktualisieren
        overlay.querySelector('.task-title').textContent = updatedTask.title;
        overlay.querySelector('.task-description').textContent = updatedTask.description;
        overlay.querySelector('.task-due-date').textContent = `Due Date: ${updatedTask.dueDate}`;
        overlay.querySelector('.task-priority').textContent = `Priority: ${updatedTask.priority}`;
        overlay.querySelector('.category-badge').textContent = updatedTask.category;
        overlay.querySelector('.category-badge').style.backgroundColor = getCategoryColor(updatedTask.category);
        loadTasks();

        // Wechsel zurück in den View-Modus
        overlay.querySelector('.view-mode').style.display = 'block';
        overlay.querySelector('.edit-mode').style.display = 'none';
        overlay.querySelector('.edit-btn').style.display = 'inline-block';
        overlay.querySelector('.delete-btn').style.display = 'inline-block';
        overlay.querySelector('.save-btn').style.display = 'none';
        overlay.querySelector('.button-seperator').style.display = 'inline-block';
        overlay.querySelector('.edit-svg').style.display = 'inline-block';
        overlay.querySelector('.delete-svg').style.display = 'inline-block';
    });
};

// --- Task löschen ---
const deleteTask = () => {
    const taskRef = ref(db, `tasks/${currentColumnId}/${currentTaskId}`);
    remove(taskRef).then(() => {
        hideTaskDetailOverlay();
        loadTasks();
    });
};

document.addEventListener('click', (e) => {
    if (!e.target.closest('.contact-selection-wrapper')) {
        document.querySelectorAll('.contacts-dropdown').forEach(d => d.classList.remove('active'));
    }
});

// --- Hilfsfunktionen ---
const getCategoryColor = (category) => {
    return category === 'Technical Task' ? '#23D8C2' : '#1500ff';
};
