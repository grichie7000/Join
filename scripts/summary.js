const BASE_URL_SUMMARY = "https://join-d3707-default-rtdb.europe-west1.firebasedatabase.app/";
let openTasks;
const screenWidth = window.innerWidth;
const now = new Date();
const hour = now.getHours();

/**
 * Loads tasks from Firebase and displays them.
 */
function loadTasks() {
    checkLogIn();
    loadTasksFromFirebase("tasks", 1);
    loadTasksFromFirebase("initals", 2);
    displayGreetings();
}

/**
 * Checks login status and handles greeting visibility.
 */
function checkLogIn() {
    const loginStatus = localStorage.getItem('login');

    if (loginStatus === 'true' && screenWidth < 1511) {
        setTimeout(function () {
            const greeting = document.querySelector('.greeting');
            greeting.style.opacity = '0';
            setTimeout(function () {
                greeting.style.display = 'none';
            }, 1000);
        }, 1000);
    } else {
        const greeting = document.querySelector('.greeting');
        greeting.style.display = 'none';
    }

    localStorage.setItem('login', false);
}

/**
 * Displays greetings based on the time of day.
 */
function displayGreetings() {
    let greeting = '';

    if (hour >= 4 && hour < 11) {
        greeting = 'Good Morning!';
    } else if (hour >= 11 && hour < 17) {
        greeting = 'Good Day!';
    } else {
        greeting = 'Good Evening!';
    }

    document.getElementById('greetings').innerText = greeting;
}

/**
 * Fetches tasks from Firebase.
 * @param {string} path - The Firebase database path.
 * @returns {Object} - The parsed JSON response from Firebase.
 */
async function fetchTasksFromFirebase(path = "") {
    let response = await fetch(BASE_URL_SUMMARY + path + ".json");
    let responseToJson = await response.json();
    return responseToJson;
}

/**
 * Updates the task display when `tasksTodisplay` is 1.
 * @param {Object} tasks - The task data.
 */
function updateTaskDisplay(tasks) {
    const allCompleteElement = document.getElementById('allComplete');

    if (tasks === null) {
        allCompleteElement.innerHTML = "Currently, there are no tasks to complete. (:";
    } else {
        allCompleteElement.innerHTML = "";
        displayTasks(tasks);
    }
}

/**
 * Updates the user display when `tasksTodisplay` is 2.
 * @param {Object} tasks - The task data.
 */
function updateUserDisplay(tasks) {
    const loggedInNameElement = document.getElementById('loggedInName');

    if (tasks === null) {
        loggedInNameElement.innerHTML = "Guest";
    } else {
        loggedInNameElement.innerHTML = tasks[1].name;
    }
}

/**
 * Loads tasks from Firebase and updates the display based on `tasksTodisplay`.
 * @param {string} path - The Firebase database path.
 * @param {number} tasksTodisplay - The display mode (1 for tasks, 2 for user).
 */
async function loadTasksFromFirebase(path = "", tasksTodisplay) {
    let openTasks = await fetchTasksFromFirebase(path);

    if (tasksTodisplay === 1) {
        updateTaskDisplay(openTasks);
    }

    if (tasksTodisplay === 2) {
        updateUserDisplay(openTasks);
    }
}

/**
 * Displays the tasks in various categories.
 * @param {Object} taskList - The list of tasks to display.
 */
function displayTasks(taskList) {
    tasksInBoard(taskList);
    tasksInProgress(taskList);
    tasksFeedback(taskList);
    tasksToDo(taskList);
    tasksDone(taskList);
    urgentTasks(taskList);
    urgentDate(taskList);
}

/**
 * Displays the total number of tasks on the board.
 * @param {Object} tasksInBoard - The task data from the board.
 */
function tasksInBoard(tasksInBoard) {
    const totalCount =
        countObjects(tasksInBoard["await-feedback"]) +
        countObjects(tasksInBoard["done"]) +
        countObjects(tasksInBoard["in-progress"]) +
        countObjects(tasksInBoard["to-do"]);

    document.getElementById('openTotalTasks').innerHTML = totalCount;
}

/**
 * Displays the number of tasks in progress.
 * @param {Object} tasksInProgress - The task data in progress.
 */
function tasksInProgress(tasksInProgress) {
    const inProgressCount = countObjects(tasksInProgress["in-progress"]);
    document.getElementById('inProgress').innerHTML = inProgressCount;
}

/**
 * Displays the number of tasks awaiting feedback.
 * @param {Object} tasksFeedback - The task data awaiting feedback.
 */
function tasksFeedback(tasksFeedback) {
    const feedbackCount = countObjects(tasksFeedback["await-feedback"]);
    document.getElementById('awaitingFeedback').innerHTML = feedbackCount;
}

/**
 * Displays the number of tasks to do.
 * @param {Object} tasksToDo - The task data to do.
 */
function tasksToDo(tasksToDo) {
    const toDoCount = countObjects(tasksToDo["to-do"]);
    document.getElementById('openToDos').innerHTML = toDoCount;
}

/**
 * Displays the number of tasks done.
 * @param {Object} tasksDone - The task data done.
 */
function tasksDone(tasksDone) {
    const doneCount = countObjects(tasksDone["done"]);
    document.getElementById('openDones').innerHTML = doneCount;
}

/**
 * Displays the number of urgent tasks.
 * @param {Object} urgentTasks - The task data for urgent tasks.
 */
function urgentTasks(urgentTasks) {
    const urgentCount = urgentTasks["to-do"]
        ? Object.values(urgentTasks["to-do"]).filter(task => task.priority === "urgent").length
        : 0;
    document.getElementById('openUrgents').innerHTML = urgentCount;
}

/**
 * Counts the number of objects in a given object.
 * @param {Object} object - The object to count.
 * @returns {number} - The number of objects.
 */
const countObjects = (object) => {
    return object ? Object.keys(object).length : 0;
};

/**
 * Navigates to the board site.
 */
function goToBoardSite() {
    window.location.href = './board.html';
}

/**
 * Displays the next urgent task's deadline.
 * @param {Object} tasksInBoard - The task data from the board.
 */
function urgentDate(tasksInBoard) {
    const urgentTasks = tasksInBoard["to-do"]
        ? Object.values(tasksInBoard["to-do"]).filter(task => task.priority === "urgent")
        : [];

    if (urgentTasks.length > 0) {
        const upcomingDates = urgentTasks.map(task => new Date(task.dueDate));
        upcomingDates.sort((a, b) => a - b);
        const nextDate = upcomingDates[0];
        const nextFormattedDate = nextDate.toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric'
        });

        document.getElementById('deadline').innerHTML = nextFormattedDate;
    } else {
        document.getElementById('deadline').innerHTML = "No 'urgent' tasks.";
    }
}
