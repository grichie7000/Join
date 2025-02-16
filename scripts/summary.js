
const BASE_URL_SUMMARY = "https://join-d3707-default-rtdb.europe-west1.firebasedatabase.app/";
let openTasks;
const now = new Date();
const hour = now.getHours();

function loadTasks() {
    loadTasksFromFirebase("tasks", 1)
    loadTasksFromFirebase("initals", 2)
    displayGreetings()
}

function displayGreetings() {
    // Wähle die Begrüßung basierend auf der Uhrzeit
    let greeting = '';

    if (hour >= 4 && hour < 11) {
        greeting = 'Good Morning!';
    } else if (hour >= 11 && hour < 17) {
        greeting = 'Good Day!';
    } else {
        greeting = 'Good Evening!';
    }

    // Zeige die Begrüßung im HTML an
    document.getElementById('greetings').innerText = greeting;
}

async function loadTasksFromFirebase(path = "", tasksTodisplay) {
    let response = await fetch(BASE_URL_SUMMARY + path + ".json");
    let responseToJson = await response.json();

    openTasks = responseToJson;

    if (tasksTodisplay === 1) {
        if (openTasks === null) {
            document.getElementById('allComplete').innerHTML = "";
            document.getElementById('allComplete').innerHTML = "Currently, there are no tasks to complete. (:";
        } else {
            document.getElementById('allComplete').innerHTML = "";
            displayTasks(openTasks);
        }
    }

    if (tasksTodisplay === 2) {
        if (openTasks === null) {
            document.getElementById('loggedInName').innerHTML = "";
            document.getElementById('loggedInName').innerHTML = "Guest";
        } else {            
            document.getElementById('loggedInName').innerHTML = "";
            document.getElementById('loggedInName').innerHTML = openTasks[1].name;
        }
    }
}



function displayTasks(taskList) {
    tasksInBoard(taskList);
    tasksInProgress(taskList);
    tasksFeedback(taskList)
    tasksToDo(taskList)
    tasksDone(taskList);
    urgentTasks(taskList)
    urgentDate(taskList)
}


function tasksInBoard(tasksInBoard) {

    const totalCount =
        countObjects(tasksInBoard["await-feedback"]) +
        countObjects(tasksInBoard["done"]) +
        countObjects(tasksInBoard["in-progress"]) +
        countObjects(tasksInBoard["to-do"]);

    document.getElementById('openTotalTasks').innerHTML = totalCount;
}

function tasksInProgress(tasksInProgress) {
    const inProgressCount = countObjects(tasksInProgress["in-progress"]);
    document.getElementById('inProgress').innerHTML = inProgressCount;
}

function tasksFeedback(tasksFeedback) {
    const feedbackCount = countObjects(tasksFeedback["await-feedback"]);
    document.getElementById('awaitingFeedback').innerHTML = feedbackCount;
}

function tasksToDo(tasksToDo) {
    const toDoCount = countObjects(tasksToDo["to-do"]);
    document.getElementById('openToDos').innerHTML = toDoCount;
}

function tasksDone(tasksDone) {
    const doneCount = countObjects(tasksDone["done"]);
    document.getElementById('openDones').innerHTML = doneCount;
}

function urgentTasks(urgentTasks) {
    const urgentCount = urgentTasks["to-do"]
        ? Object.values(urgentTasks["to-do"]).filter(task => task.priority === "urgent").length
        : 0;
    document.getElementById('openUrgents').innerHTML = urgentCount;
}

const countObjects = (object) => {
    return object ? Object.keys(object).length : 0;
};


function goToBoardSite() {
    window.location.href = './board.html';
}

function urgentDate(tasksInBoard) {
    // Filtern der "urgent" Aufgaben und Extrahieren der relevanten Daten
    const urgentTasks = tasksInBoard["to-do"]
        ? Object.values(tasksInBoard["to-do"]).filter(task => task.priority === "urgent")
        : [];

    // Finden des nächsten kommenden Datums für "urgent" Aufgaben
    if (urgentTasks.length > 0) {
        // Umwandlung der Datumsstrings in Date-Objekte für den Vergleich
        const upcomingDates = urgentTasks.map(task => new Date(task.dueDate));

        // Sortieren der Datumswerte, das früheste Datum wird zuerst angezeigt
        upcomingDates.sort((a, b) => a - b);

        // Das nächste Datum (frühestes Datum)
        const nextDate = upcomingDates[0];

        // Formatieren des nächsten Datums
        const nextFormattedDate = nextDate.toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric'
        });

        document.getElementById('deadline').innerHTML = nextFormattedDate;
    } else {
        document.getElementById('deadline').innerHTML = "No 'urgent' tasks.";
    }
}