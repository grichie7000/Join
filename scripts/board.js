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
                        Keine Tasks vorhanden
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
    div.style.position = "relative";
    
    let categoryText = "Keine Kategorie";
    let categoryBgColor = "#f0f0f0";
    if (task.category === "category1") {
        categoryText = "Technical Task";
        categoryBgColor = "#23D8C2";
    } else if (task.category === "category2") {
        categoryText = "User Story";
        categoryBgColor = "#1500ff";
    }

    let subtasksHtml = "";
    if (task.subtasks?.length > 0) {
        subtasksHtml = `<ul class="task-subtasks">${task.subtasks.map(s => `<li>${s}</li>`).join("")}</ul>`;
    }

    let priorityHtml = "";
    if (task.priority) {
        let iconUrl;
        if (task.priority === "urgent") {
            iconUrl = "assets/img/urgent.png";
        } else if (task.priority === "medium") {
            iconUrl = "assets/img/medium.png";
        } else if (task.priority === "low") {
            iconUrl = "assets/img/low.png";
        }

        if (iconUrl) {
            priorityHtml = `
                <img src="${iconUrl}" 
                     alt="${task.priority}" 
                     class="task-priority-icon"
                     style="position: absolute;
                            bottom: 15px;
                            right: 15px;
                            width: 15px;
                            height: 10px;">
            `;
        }
    }

    div.innerHTML = `
        <p class="task-category" style="background-color: ${categoryBgColor}; color: white; padding: 5px 10px; border-radius: 5px; display: inline-block;">
            ${categoryText}
        </p>
        <h3 class="task-title">${task.title}</h3>
        <p class="task-description">${task.description}</p>
        ${subtasksHtml}
        ${priorityHtml}
    `;

    div.addEventListener("click", () => {
        showTaskDetailOverlay(task, taskId, columnId);
    });

    div.addEventListener("dragstart", drag);
    return div;
}

window.showTaskDetailOverlay = function (task, taskId, columnId) {
    const overlay = document.getElementById("taskDetailOverlay");
    overlay.style.display = "flex";

    document.getElementById("overlayTaskTitle").textContent = task.title;
    document.getElementById("overlayTaskDescription").textContent = task.description;
    document.getElementById("overlayTaskCategory").textContent = task.category;
    document.getElementById("overlayTaskDueDate").textContent = task.dueDate;

    const priorityDisplay = document.getElementById("priorityDisplay");
    priorityDisplay.innerHTML = getPriorityHtml(task.priority);

    const subtasksList = document.getElementById("overlayTaskSubtasks");
    subtasksList.innerHTML = "";
    if (task.subtasks?.length > 0) {
        task.subtasks.forEach(subtask => {
            const li = document.createElement("li");
            li.textContent = subtask;
            subtasksList.appendChild(li);
        });
    }

    overlay.dataset.taskId = taskId;
    overlay.dataset.columnId = columnId;

    // Aktive Priorität markieren
    document.querySelectorAll('.priority-option').forEach(option => {
        option.classList.remove('active');
        if (option.dataset.priority === task.priority) {
            option.classList.add('active');
        }
    });
}

function getPriorityHtml(priority) {
    let iconUrl, priorityText;
    if (priority === "urgent") {
        iconUrl = "assets/img/urgent.png";
        priorityText = "Urgent";
    } else if (priority === "medium") {
        iconUrl = "assets/img/medium.png";
        priorityText = "Medium";
    } else if (priority === "low") {
        iconUrl = "assets/img/low.png";
        priorityText = "Low";
    }

    return `
        <img src="${iconUrl}" alt="${priorityText}" style="width: 15px; height: 10px;">
        <span>${priorityText}</span>
    `;
}

window.hideTaskDetailOverlay = function() {
    const overlay = document.getElementById("taskDetailOverlay");
    overlay.style.display = "none";
}

let originalTaskData = null;

window.enableEditMode = function() {
    const titleElement = document.getElementById("overlayTaskTitle");
    const descriptionElement = document.getElementById("overlayTaskDescription");
    const categoryElement = document.getElementById("overlayTaskCategory");
    const dueDateElement = document.getElementById("overlayTaskDueDate");

    originalTaskData = {
        title: titleElement.textContent,
        description: descriptionElement.textContent,
        category: categoryElement.textContent,
        dueDate: dueDateElement.textContent,
        priority: document.querySelector('input[name="priority"]:checked')?.value || "medium",
    };

    titleElement.contentEditable = true;
    descriptionElement.contentEditable = true;
    categoryElement.contentEditable = true;
    dueDateElement.contentEditable = true;

    document.getElementById("prioritySelection").style.display = "block";
    document.getElementById("currentPriority").style.display = "none";
    document.getElementById("editButton").style.display = "none";
    document.getElementById("saveButton").style.display = "inline-block";
    document.getElementById("cancelButton").style.display = "inline-block";
}

window.cancelEditMode = function() {
    const titleElement = document.getElementById("overlayTaskTitle");
    const descriptionElement = document.getElementById("overlayTaskDescription");
    const categoryElement = document.getElementById("overlayTaskCategory");
    const dueDateElement = document.getElementById("overlayTaskDueDate");

    if (originalTaskData) {
        titleElement.textContent = originalTaskData.title;
        descriptionElement.textContent = originalTaskData.description;
        categoryElement.textContent = originalTaskData.category;
        dueDateElement.textContent = originalTaskData.dueDate;

        const priorityDisplay = document.getElementById("priorityDisplay");
        priorityDisplay.innerHTML = getPriorityHtml(originalTaskData.priority);
    }

    titleElement.contentEditable = false;
    descriptionElement.contentEditable = false;
    categoryElement.contentEditable = false;
    dueDateElement.contentEditable = false;

    document.getElementById("prioritySelection").style.display = "none";
    document.getElementById("currentPriority").style.display = "block";
    document.getElementById("editButton").style.display = "inline-block";
    document.getElementById("saveButton").style.display = "none";
    document.getElementById("cancelButton").style.display = "none";
}

window.saveTaskChanges = function() {
    const taskId = document.getElementById("taskDetailOverlay").dataset.taskId;
    const columnId = document.getElementById("taskDetailOverlay").dataset.columnId;

    const updatedTask = {
        title: document.getElementById("overlayTaskTitle").textContent,
        description: document.getElementById("overlayTaskDescription").textContent,
        category: document.getElementById("overlayTaskCategory").textContent,
        dueDate: document.getElementById("overlayTaskDueDate").textContent,
        priority: document.querySelector('input[name="priority"]:checked').value,
    };

    const taskRef = ref(db, 'tasks/' + columnId + '/' + taskId);
    set(taskRef, updatedTask).then(() => {
        hideTaskDetailOverlay();
        loadTasks();
    }).catch(error => {
        console.error("Fehler beim Aktualisieren des Tasks:", error);
    });
}

function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
}

window.allowDrop = function (event) {
    event.preventDefault();
};

window.moveTo = function (event, columnId) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("text");
    const task = document.getElementById(taskId);
    const oldColumnElement = document.getElementById(task.parentElement.id);
    const oldColumnId = oldColumnElement.id;
    const newColumnElement = document.getElementById(columnId);

    // Entferne Platzhalter in der ZIEL-Spalte falls vorhanden
    const newPlaceholder = newColumnElement.querySelector(".empty-placeholder");
    if (newPlaceholder) newPlaceholder.remove();

    // Verschiebe den Task
    newColumnElement.appendChild(task);

    const oldTaskRef = ref(db, 'tasks/' + oldColumnId + '/' + taskId);
    get(oldTaskRef).then(snapshot => {
        if (snapshot.exists()) {
            const taskData = snapshot.val();
            taskData.status = columnId;
            
            const newTaskRef = ref(db, 'tasks/' + columnId + '/' + taskId);
            set(newTaskRef, taskData).then(() => {
                remove(oldTaskRef).then(() => {
                    // Überprüfe ob die ALTE Spalte jetzt leer ist
                    const hasTasks = oldColumnElement.querySelector(".task");
                    if (!hasTasks) {
                        oldColumnElement.innerHTML = `
                            <div class="empty-placeholder">
                                Keine Tasks vorhanden
                            </div>
                        `;
                    }
                });
            });
        }
    });
};

function showOverlay(columnId) {
    const overlay = document.getElementById("taskOverlay");
    overlay.style.display = "flex";
    overlay.dataset.columnId = columnId;
}

function hideOverlay() {
    const overlay = document.getElementById("taskOverlay");
    overlay.style.display = "none";
}

document.querySelector(".addTaskButton").addEventListener("click", () => showOverlay("to-do"));
document.querySelector(".toDoButton").addEventListener("click", () => showOverlay("to-do"));
document.querySelector(".inProgressButton").addEventListener("click", () => showOverlay("in-progress"));
document.querySelector(".awaitButton").addEventListener("click", () => showOverlay("await-feedback"));

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

    const taskData = {
        title: title,
        description: description,
        dueDate: dueDate,
        priority: priority,
        category: category,
        status: columnId
    };

    const newTaskId = Date.now().toString();
    set(ref(db, 'tasks/' + columnId + '/' + newTaskId), taskData).then(() => {
        hideOverlay();
        loadTasks();
    }).catch((error) => {
        console.error("Fehler beim Speichern des Tasks: ", error);
    });
});

function displayUserInitials() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (loggedInUser && loggedInUser.initials) {
        const initialsElement = document.getElementById("profile-toggle");
        initialsElement.textContent = loggedInUser.initials;
    }
}

document.addEventListener("DOMContentLoaded", displayUserInitials);
loadTasks();

// CSS für Platzhalter
const style = document.createElement('style');
style.textContent = `
.empty-placeholder {
    text-align: center;
    color: #666;
    padding: 20px;
    font-style: italic;
    border: 2px dashed #ddd;
    border-radius: 8px;
    margin: 10px;
}

.priority-option {
    padding: 10px;
    margin: 5px 0;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.priority-option.active {
    background-color: #e0e0e0;
    border: 2px solid #007BFF;
}

.priority-option:hover {
    background-color: #f0f0f0;
}

.priority-option input[type="radio"] {
    display: none;
}

.priority-option label {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
}

.priority-option img {
    width: 24px;
    height: 24px;
}
`;
document.head.appendChild(style);