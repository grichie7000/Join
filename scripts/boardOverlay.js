// --- Firebase-Import ---
import { ref, set, remove } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";
import { db } from "./firebase-config.js";

// --- Hilfsfunktion für Priorität ---
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
        <img src="${iconUrl}" alt="${priorityText}" style="width:15px; height:10px;">
        <span>${priorityText}</span>
    `;
}

// --- Funktion, um die Prioritätsanzeige zu aktualisieren ---
export function updatePriorityDisplay(priority) {
    const priorityDisplay = document.getElementById("priorityDisplay");
    priorityDisplay.innerHTML = getPriorityHtml(priority);
}
window.updatePriorityDisplay = updatePriorityDisplay; // global verfügbar

// --- Hilfsfunktion: Aktualisiert die statischen Overlay-Felder ---
function updateOverlayFields(task) {
    // Kategorie
    const categoryElement = document.getElementById("overlayTaskCategory");
    const categoryMapping = {
        "Technical Task": "Technical Task",
        "User Story": "User Story"
    };
    const categoryText = categoryMapping[task.category] || "Keine Kategorie";
    categoryElement.textContent = categoryText;
    setCategoryStyle(categoryElement, categoryText);

    // Titel, Beschreibung und DueDate
    document.getElementById("overlayTaskTitle").textContent = task.title;
    document.getElementById("overlayTaskDescription").textContent = task.description;
    document.getElementById("overlayTaskDueDate").textContent = task.dueDate;

    // Priorität
    const priorityDisplay = document.getElementById("priorityDisplay");
    priorityDisplay.innerHTML = getPriorityHtml(task.priority);

    // Subtasks anzeigen (falls vorhanden)
    const subtasksList = document.getElementById("overlayTaskSubtasks");
    subtasksList.innerHTML = "";
    if (task.subtasks && task.subtasks.length > 0) {
        task.subtasks.forEach(subtask => {
            const li = document.createElement("li");
            li.textContent = subtask;
            subtasksList.appendChild(li);
        });
    }

    // Kontakte anzeigen (falls vorhanden)
    const contactsList = document.getElementById("overlayTaskContacts");
    contactsList.innerHTML = "";
    if (task.contacts && task.contacts.length > 0) {
        task.contacts.forEach(contact => {
            const li = document.createElement("li");
            li.textContent = contact.name;
            contactsList.appendChild(li);
        });
    }
}

export function showTaskDetailOverlay(task, taskId, columnId) {
    const overlay = document.getElementById("taskDetailOverlay");
    overlay.style.display = "flex";

    updateOverlayFields(task);

    // Daten-Attribute setzen (wichtig für spätere Bearbeitungen)
    overlay.dataset.taskId = taskId;
    overlay.dataset.columnId = columnId;
}

export function setCategoryStyle(categoryElement, categoryText) {
    if (categoryText.trim() === "Technical Task") {
        categoryElement.style.backgroundColor = "#23D8C2";
    } else if (categoryText === "User Story") {
        categoryElement.style.backgroundColor = "#1500ff";
    } else {
        categoryElement.style.backgroundColor = "";
    }
}

export function hideTaskDetailOverlay() {
    document.getElementById("taskDetailOverlay").style.display = "none";
}

export function deleteTask() {
    const overlay = document.getElementById("taskDetailOverlay");
    const taskId = overlay.dataset.taskId;
    const columnId = overlay.dataset.columnId;

    if (!taskId || !columnId) {
        console.error("Fehler: Task-ID oder Spalten-ID fehlt.");
        return;
    }

    const taskRef = ref(db, `tasks/${columnId}/${taskId}`);
    remove(taskRef)
        .then(() => {
            hideTaskDetailOverlay();
            loadTasks(); // Diese Funktion muss global verfügbar sein
        })
        .catch(error => {
            console.error("Fehler beim Löschen des Tasks:", error);
        });
}

let originalTaskData = null;

export function enableEditMode() {
    const titleElement = document.getElementById("overlayTaskTitle");
    const descriptionElement = document.getElementById("overlayTaskDescription");
    const categoryElement = document.getElementById("overlayTaskCategory");
    const dueDateElement = document.getElementById("overlayTaskDueDate");

    // Speichere die Originaldaten, um bei "Cancel" darauf zurückgreifen zu können.
    originalTaskData = {
        title: titleElement.textContent,
        description: descriptionElement.textContent,
        category: categoryElement.textContent,
        dueDate: dueDateElement.textContent,
        priority: document.querySelector('input[name="priority"]:checked')?.value || "medium",
        contacts: [] // Hier können Kontakte später ergänzt werden
    };

    // Mache Felder editierbar
    titleElement.contentEditable = true;
    descriptionElement.contentEditable = true;
    dueDateElement.contentEditable = true;

    // Entferne die Hintergrundfarbe im Edit-Modus (für die Kategorie)
    categoryElement.style.backgroundColor = "transparent";

    // Passe die Radio-Buttons an (für die Kategorie)
    const currentCategory = originalTaskData.category === "Technical Task" ? "Technical Task" : "User Story";
    categoryElement.innerHTML = `
        <label>
            <input type="radio" name="editCategory" value="Technical Task" ${currentCategory === "Technical Task" ? "checked" : ""}>
            Technical Task
        </label>
        <label>
            <input type="radio" name="editCategory" value="User Story" ${currentCategory === "User Story" ? "checked" : ""}>
            User Story
        </label>
    `;
    // Stelle sicher, dass der richtige Radio-Button gesetzt ist
    document.querySelector(`input[name="editCategory"][value="${currentCategory}"]`).checked = true;

    // Füge Event-Listener hinzu, um Änderungen an der Kategorie zu erfassen
    document.querySelectorAll('input[name="editCategory"]').forEach(radio => {
        radio.addEventListener("change", (event) => {
            categoryElement.dataset.selectedCategory = event.target.value;
        });
    });

    // Blende den Edit-Bereich für die Priorität ein
    document.getElementById("prioritySelection").style.display = "block";
    document.getElementById("currentPriority").style.display = "none";

    // Blende die Edit-Schaltflächen ein/aus
    document.getElementById("deleteButton").style.display = "none";
    document.getElementById("editButton").style.display = "none";
    document.getElementById("saveButton").style.display = "inline-block";
    document.getElementById("cancelButton").style.display = "inline-block";
}

export function cancelEditMode() {
    const titleElement = document.getElementById("overlayTaskTitle");
    const descriptionElement = document.getElementById("overlayTaskDescription");
    const categoryElement = document.getElementById("overlayTaskCategory");
    const dueDateElement = document.getElementById("overlayTaskDueDate");

    if (originalTaskData) {
        titleElement.textContent = originalTaskData.title;
        descriptionElement.textContent = originalTaskData.description;
        categoryElement.textContent = originalTaskData.category;
        setCategoryStyle(categoryElement, originalTaskData.category);
        dueDateElement.textContent = originalTaskData.dueDate;

        const priorityDisplay = document.getElementById("priorityDisplay");
        priorityDisplay.innerHTML = getPriorityHtml(originalTaskData.priority);
    }

    // Felder nicht mehr editierbar machen
    titleElement.contentEditable = false;
    descriptionElement.contentEditable = false;
    dueDateElement.contentEditable = false;

    document.getElementById("prioritySelection").style.display = "none";
    document.getElementById("currentPriority").style.display = "block";
    document.getElementById("editButton").style.display = "inline-block";
    document.getElementById("deleteButton").style.display = "inline-block";
    document.getElementById("saveButton").style.display = "none";
    document.getElementById("cancelButton").style.display = "none";
}

export function saveTaskChanges() {
    const taskId = document.getElementById("taskDetailOverlay").dataset.taskId;
    const columnId = document.getElementById("taskDetailOverlay").dataset.columnId;

    const selectedCategoryRadio = document.querySelector('input[name="editCategory"]:checked');
    const categoryValue = selectedCategoryRadio ? selectedCategoryRadio.value : "category1";

    const priorityRadio = document.querySelector('input[name="priority"]:checked');
    const priorityValue = priorityRadio ? priorityRadio.value : "medium";

    // Erstelle das aktualisierte Task-Objekt
    const updatedTask = {
        title: document.getElementById("overlayTaskTitle").textContent,
        description: document.getElementById("overlayTaskDescription").textContent,
        category: categoryValue,
        dueDate: document.getElementById("overlayTaskDueDate").textContent,
        priority: priorityValue,
        status: columnId,
        contacts: originalTaskData.contacts // Hier werden die (gegebenenfalls geänderten) Kontakte übernommen
    };

    const taskRef = ref(db, `tasks/${columnId}/${taskId}`);
    set(taskRef, updatedTask)
        .then(() => {
            // Aktualisiere die Kategorieanzeige im Overlay
            const categoryElement = document.getElementById("overlayTaskCategory");
            categoryElement.textContent = updatedTask.category;
            setCategoryStyle(categoryElement, updatedTask.category);

            // Aktualisiere die Originaldaten, damit Cancel nicht alte Werte wiederherstellt
            originalTaskData.category = updatedTask.category;

            // Aktualisiere das Overlay mit den neuen Daten und lade die Tasks neu
            showTaskDetailOverlay(updatedTask, taskId, columnId);
            loadTasks(); // Diese Funktion muss global verfügbar sein
        })
        .catch(error => {
            console.error("Fehler beim Aktualisieren des Tasks:", error);
        });
}
