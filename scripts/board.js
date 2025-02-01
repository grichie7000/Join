function drag(event) {
    event.dataTransfer.setData("text", event.target.id); // Speichert die ID des Tasks
}

function allowDrop(event) {
    event.preventDefault(); // Erlaubt das Ablegen
}

function moveTo(event, columnId) {
    event.preventDefault(); // Erlaubt das Ablegen
    const taskId = event.dataTransfer.getData("text"); // Holt die ID des gezogenen Tasks
    const task = document.getElementById(taskId); // Findet das Task-Element
    const column = document.getElementById(columnId); // Findet die Zielspalte

    column.appendChild(task); // Fügt das Task in die neue Spalte ein
}

