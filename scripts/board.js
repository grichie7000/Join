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

//
// --- HELPER-FUNKTIONEN ---
//

// Funktionserklärung (wird hoisted) – so steht sie in allen nachfolgenden Codezeilen zur Verfügung
function getCategoryColor(category) {
    return category === 'Technical Task' ? '#23D8C2' : '#1500ff';
}

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

//
// --- TASK-LOADING & -DARSTELLUNG ---
//

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

    // Subtasks mit Progress-Bar
    const subtasksHtml = task.subtasks && task.subtasks.length > 0 ? `
        <div class="subtask-progress">
            <div class="progress-bar">
                <div class="progress-fill" 
                     style="width: ${(task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100}%">
                </div>
            </div>
            <span class="progress-text">
                ${task.subtasks.filter(s => s.completed).length}/${task.subtasks.length} Subtasks
            </span>
        </div>
    ` : "";

    // Kontakte anzeigen
    const contactsHtml = task.contacts && task.contacts.length > 0
        ? `<div class="task-contacts">${task.contacts.map(c => {
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

    // Falls der Task in dieselbe Spalte gezogen wird, beenden wir die Funktion.
    if (oldColumnId === columnId) {
        return;
    }

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
                    if (!oldColumnElement.querySelector(".task")) {
                        oldColumnElement.innerHTML = `<div class="empty-placeholder">No tasks To do</div>`;
                    }
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

    const taskData = {
        title,
        description,
        dueDate,
        priority,
        category,
        status: columnId,
        contacts: selectedContacts,
        subtasks: selectedSubtasks.map(subtask => ({
            title: subtask,
            completed: false
        }))
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

//
// --- TASK-DETAIL-OVERLAY (Anzeigen, Editieren, Speichern, Löschen) ---
//

let currentTaskId = null;
let currentColumnId = null;
let currentSubtasks = []; // Globale Variable für den aktuellen Subtask-Zustand

const showTaskDetailOverlay = (task, taskId, columnId) => {
    currentTaskId = taskId;
    currentColumnId = columnId;
    const overlay = document.getElementById("taskDetailOverlay");
  
    // Fülle die Felder im Overlay mit den Task-Daten:
    overlay.querySelector('.category-badge').textContent = task.category;
    overlay.querySelector('.category-badge').style.backgroundColor = getCategoryColor(task.category);
    overlay.querySelector('.task-title').textContent = task.title;
    overlay.querySelector('.task-description').textContent = task.description;
    document.getElementById("overlay-task-title").textContent = task.title;
    document.getElementById("overlay-task-description").textContent = task.description;
    overlay.querySelector('.task-due-date').textContent = `Due Date: ${task.dueDate}`;
    overlay.querySelector('.task-priority').textContent = `Priority: ${task.priority}`;
  
    // Kontakte anzeigen (wie gewohnt)
    const contactsList = overlay.querySelector('.contacts-list');
    contactsList.innerHTML = task.contacts?.map(c => `
        <div class="contact-badge no-overlap" style="background: ${getContactColor(c.name)}" title="${c.name}">
          ${getInitials(c.name)}
        </div>
    `).join('') || '';
  
    // Subtasks rendern – hier wird nur der aktuell geklickte Task berücksichtigt
    renderSubtasksView(task);
  
    // Button-Konfigurationen (Close, Edit, Delete, Save) wie gewohnt:
    overlay.querySelector('.close-btn').onclick = hideTaskDetailOverlay;
    overlay.querySelector('.delete-btn').onclick = deleteTask;
    overlay.querySelector('.edit-btn').onclick = enableEditMode;
    overlay.querySelector('.save-btn').onclick = saveChanges;
  
    // Overlay anzeigen
    overlay.style.display = 'block';
};

const hideTaskDetailOverlay = () => {
    const overlay = $("taskDetailOverlay");
    overlay.style.display = 'none';

    // Zurücksetzen in den View-Modus
    overlay.querySelector('.view-mode').style.display = 'block';
    overlay.querySelector('.edit-mode').style.display = 'none';
    overlay.querySelector('.edit-btn').style.display = 'inline-block';
    overlay.querySelector('.delete-btn').style.display = 'inline-block';
    overlay.querySelector('.save-btn').style.display = 'none';
    overlay.querySelector('.button-seperator').style.display = 'inline-block';
    overlay.querySelector('.edit-svg').style.display = 'inline-block';
    overlay.querySelector('.delete-svg').style.display = 'inline-block';
};

//
// --- EDIT-MODUS & SUBTASKS ---
//

/**
 * Rendert die Subtasks im Editiermodus.
 * Es werden keine Checkboxen angezeigt – nur der Subtask-Titel mit einem Edit- und einem Delete-Button.
 */
function renderSubtasksEditMode() {
    const subtasksList = document.getElementById("subtask-list");
    if (!subtasksList) return;
  
    // Liste leeren
    subtasksList.innerHTML = "";
  
    // Für jeden Subtask wird ein Listenelement erzeugt
    currentSubtasks.forEach((subtask, index) => {
      const li = document.createElement("li");
      li.classList.add("subtask-item");
  
      // Anzeige des Subtask-Titels als statischer Text
      const titleSpan = document.createElement("span");
      titleSpan.textContent = subtask.title;
      li.appendChild(titleSpan);
  
      // --- Edit-Button ---
      const editButton = document.createElement("button");
      editButton.type = "button"; // verhindert z. B. ein versehentliches Form-Submit
      editButton.textContent = "Edit";
      editButton.classList.add("subtask-edit-btn");
      editButton.addEventListener("click", (e) => {
        e.stopPropagation();
        // Den Subtask-Titel editierbar machen
        turnSubtaskIntoEditInput(li, titleSpan, index);
      });
      li.appendChild(editButton);
  
      // --- Delete-Button ---
      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.textContent = "Delete";
      deleteButton.classList.add("subtask-delete-btn");
      deleteButton.addEventListener("click", (e) => {
        e.stopPropagation();
        // Den entsprechenden Subtask aus dem Array entfernen
        currentSubtasks.splice(index, 1);
        // Neu rendern, um die Änderung anzuzeigen
        renderSubtasksEditMode();
      });
      li.appendChild(deleteButton);
  
      subtasksList.appendChild(li);
    });
  }
  
  /**
   * Ersetzt das statische Element (titleSpan) eines Subtasks durch ein Input-Feld,
   * um den Titel direkt editieren zu können.
   * Nach dem Verlassen des Input-Feldes (blur) oder beim Drücken der Enter-Taste wird der neue Titel gespeichert.
   */
  function turnSubtaskIntoEditInput(li, titleSpan, index) {
    const input = document.createElement("input");
    input.type = "text";
    input.value = currentSubtasks[index].title;
    input.classList.add("subtask-edit-input");
  
    // Beim Verlassen des Input-Feldes den neuen Wert übernehmen
    input.addEventListener("blur", () => {
      if (input.value.trim() !== "") {
        currentSubtasks[index].title = input.value.trim();
      }
      renderSubtasksEditMode();
    });
  
    // Speichern, wenn die Enter-Taste gedrückt wird
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        input.blur();
      }
    });
  
    // Ersetze das statische Text-Element durch das Input-Feld
    li.replaceChild(input, titleSpan);
    input.focus();
  }

  function renderSubtasksView(task) {
    const subtasksList = document.querySelector('.subtasks-list');
    if (!subtasksList) return;
    
    subtasksList.innerHTML = '';
  
    let progressContainer = document.querySelector('.subtask-progress');
    if (!progressContainer) {
      progressContainer = document.createElement('div');
      progressContainer.className = 'subtask-progress';
      progressContainer.innerHTML = `
        <div class="progress-bar">
           <div class="progress-fill" style="width: 0%;"></div>
        </div>
        <span class="progress-text">0/0 Subtasks</span>
      `;
      subtasksList.parentNode.insertBefore(progressContainer, subtasksList);
    }
    
    if (task.subtasks && task.subtasks.length > 0) {
      task.subtasks.forEach((subtask, index) => {
        const li = document.createElement('li');
        li.className = 'subtask-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `subtask-${index}`;
        checkbox.checked = subtask.completed;
        checkbox.dataset.index = index;
        checkbox.addEventListener('change', () => {
          task.subtasks[index].completed = checkbox.checked;
          updateSubtaskProgress(task);
        });
        li.appendChild(checkbox);
        
        const label = document.createElement('label');
        label.htmlFor = `subtask-${index}`;
        label.textContent = subtask.title;
        li.appendChild(label);
        
        subtasksList.appendChild(li);
      });
      updateSubtaskProgress(task);
    } else {
      subtasksList.innerHTML = '<li>Keine Subtasks vorhanden</li>';
      updateSubtaskProgress(task);
    }
}
  
function updateSubtaskProgress(task) {
    const progressContainer = document.querySelector('.subtask-progress');
    if (!progressContainer) return;
    
    const progressFill = progressContainer.querySelector('.progress-fill');
    const progressText = progressContainer.querySelector('.progress-text');
    
    if (!task.subtasks || task.subtasks.length === 0) {
      progressFill.style.width = '0%';
      progressText.textContent = '0/0 Subtasks';
      return;
    }
    
    const total = task.subtasks.length;
    const completed = task.subtasks.filter(subtask => subtask.completed).length;
    const percentage = (completed / total) * 100;
    
    progressFill.style.width = `${percentage}%`;
    progressText.textContent = `${completed}/${total} Subtasks`;
}
  
  
const enableEditMode = () => {
    const taskRef = ref(db, `tasks/${currentColumnId}/${currentTaskId}`);
    get(taskRef).then(snapshot => {
        const task = snapshot.val();
        const overlay = $("taskDetailOverlay");

        // Umschalten in den Edit-Modus
        overlay.querySelector('.view-mode').style.display = 'none';
        overlay.querySelector('.edit-mode').style.display = 'block';
        overlay.querySelector('.edit-svg').style.display = 'none';
        overlay.querySelector('.delete-svg').style.display = 'none';
        overlay.querySelector('.edit-btn').style.display = 'none';
        overlay.querySelector('.delete-btn').style.display = 'none';
        overlay.querySelector('.button-seperator').style.display = 'none';
        overlay.querySelector('.save-btn').style.display = 'inline-block';

        // Formularfelder füllen
        overlay.querySelector('#edit-title').value = task.title;
        overlay.querySelector('#edit-description').value = task.description;
        overlay.querySelector('#edit-due-date').value = task.dueDate;
        overlay.querySelector(`input[name="edit-priority"][value="${task.priority}"]`).checked = true;

   // Kontakte laden und Checkboxen generieren:
const contactsRef = ref(db, 'contactsDatabase');
get(contactsRef).then(snapshot => {
    const allContacts = [];
    if (snapshot.exists()) {
        snapshot.forEach(childSnapshot => {
            allContacts.push(childSnapshot.val());
        });
    }
    const checkboxContainer = overlay.querySelector('#editContactsCheckboxContainer');
    checkboxContainer.innerHTML = allContacts.map(contact => `
        <label class="contact-checkbox">
            <input type="checkbox" name="edit-contact" value="${contact.name}" 
                   ${task.contacts?.some(c => c.name === contact.name) ? 'checked' : ''}>
            ${contact.name}
        </label>
    `).join('');
    
    // Initial einmalige Anzeige aktualisieren
    updateSelectedContactsDisplay(overlay);
    
    // Füge einen "change"-Listener direkt auf den Checkbox-Container hinzu:
    checkboxContainer.addEventListener('change', () => {
        updateSelectedContactsDisplay(overlay);
    });
});
         // Vorhandene Subtasks in die globale Variable laden
    currentSubtasks = task.subtasks ? task.subtasks.map(s => ({ ...s })) : [];
    
    // Subtasks im Editiermodus rendern (ohne Checkbox)
    renderSubtasksEditMode();
    });
};

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

// Event-Listener zum Hinzufügen eines neuen Subtasks im Edit-Modus
document.getElementById("add-subtask-btn").addEventListener("click", (e) => {
    e.preventDefault();
    const subtaskInput = document.getElementById("edit-subtask");
    const title = subtaskInput.value.trim();
    if (title !== "") {
        currentSubtasks.push({ title: title, completed: false });
        renderSubtasksEditMode();
        subtaskInput.value = "";
    }
});

const saveChanges = () => {
    const taskRef = ref(db, `tasks/${currentColumnId}/${currentTaskId}`);
    const overlay = $("taskDetailOverlay");

    const updatedTask = {
        title: overlay.querySelector('#edit-title').value,
        description: overlay.querySelector('#edit-description').value,
        category: overlay.querySelector('.category-badge').textContent, // Kategorie unverändert
        dueDate: overlay.querySelector('#edit-due-date').value,
        priority: overlay.querySelector('input[name="edit-priority"]:checked').value,
        contacts: Array.from(overlay.querySelectorAll('input[name="edit-contact"]:checked'))
            .map(c => ({ name: c.value })),
        subtasks: currentSubtasks, // Aktueller Subtask-Zustand
        status: currentColumnId
    };

    set(taskRef, updatedTask).then(() => {
        // Update der Anzeige im Overlay
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

const deleteTask = () => {
    const taskRef = ref(db, `tasks/${currentColumnId}/${currentTaskId}`);
    remove(taskRef).then(() => {
        hideTaskDetailOverlay();
        loadTasks();
    });
};

window.toggleContactsDropdown = function () {
    const dropdown = document.getElementById("contactsDropdown");
    if (dropdown.style.display === "block") {
        dropdown.style.display = "none";
    } else {
        dropdown.style.display = "block";
    }
};


document.addEventListener('click', (e) => {
    if (!e.target.closest('.contact-selection-wrapper')) {
        document.querySelectorAll('.contacts-dropdown').forEach(d => d.classList.remove('active'));
    }
});
