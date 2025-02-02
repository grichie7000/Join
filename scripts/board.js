// Funktion zum Starten des Dragvorgangs
function drag(event) {
    event.dataTransfer.setData("text", event.target.id); // Speichert die ID des Tasks
}

// Funktion, um das Ablegen zu erlauben
function allowDrop(event) {
    event.preventDefault();
}

// Funktion, um den Task in eine andere Spalte zu verschieben
function moveTo(event, columnId) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("text");
    const task = document.getElementById(taskId);
    const column = document.getElementById(columnId);
    column.appendChild(task);
}

// Funktion zum Öffnen des Overlays und Laden der Task-Daten
function openEditOverlay(event) {
    const task = event.currentTarget;
    const taskName = task.getElementsByClassName('task-name')[0].textContent;
    const taskDescription = task.getElementsByClassName('task-description')[0].textContent;
    const progressElement = task.getElementsByClassName('progress')[0];
    
    // Setze die Formulardaten
    document.getElementById('taskName').value = taskName;
    document.getElementById('taskDescription').value = taskDescription;
    if (progressElement) {
        const progress = progressElement.style.width.replace('%', '');
        document.getElementById('progress').value = progress;
        document.getElementById('progressContainer').style.display = 'block';
    } else {
        document.getElementById('progressContainer').style.display = 'none';
    }

    // Speichere die Task-ID im Overlay
    document.getElementById('editOverlay').dataset.taskId = task.id;
    document.getElementById('editOverlay').style.display = 'flex';
}

// Funktion zum Speichern der Änderungen
function saveTask(event) {
    event.preventDefault();
    const taskName = document.getElementById('taskName').value;
    const taskDescription = document.getElementById('taskDescription').value;
    const progress = document.getElementById('progress').value;

    const taskId = document.getElementById('editOverlay').dataset.taskId;
    const task = document.getElementById(taskId);

    task.getElementsByClassName('task-name')[0].textContent = taskName;
    task.getElementsByClassName('task-description')[0].textContent = taskDescription;
    const progressElement = task.getElementsByClassName('progress')[0];
    if (progressElement) {
        progressElement.style.width = progress + '%';
    }

    closeEditOverlay();
}

// Funktion zum Schließen des Overlays
function closeEditOverlay() {
    document.getElementById('editOverlay').style.display = 'none';
}
