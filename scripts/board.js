function drag(event) {
    event.dataTransfer.setData("text", event.target.id); 
}

function allowDrop(event) {
    event.preventDefault();
}

function moveTo(event, columnId) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("text");
    const task = document.getElementById(taskId);
    const column = document.getElementById(columnId);
    column.appendChild(task);
}