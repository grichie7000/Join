const BASE_URL_INITALS = "https://join-d3707-default-rtdb.europe-west1.firebasedatabase.app/";

let firebaseDataInitals = [];
let loggedInEmail;
let firebaseUserData;
let finalyData;
let guestLogInData;

/**
 * Loads the initial Firebase data based on user type.
 * @param {number} user - The user type (1 for logged-in user, otherwise guest).
 */
function loadInitialsFirebase(user) {
    if (user === 1) {
        getLoginName();
        getContactsFromFiresBase("users");
    } else {
        guestLogIn();
    }

    storageLogIn();
}

/**
 * Stores login status in localStorage.
 */
function storageLogIn() {
    const firstLogIn = true;
    localStorage.setItem('login', firstLogIn);
}

/**
 * Retrieves the logged-in user's email from the input field.
 */
function getLoginName() {
    loggedInEmail = document.getElementById("email");
}

/**
 * Fetches user data from Firebase.
 * @param {string} path - The Firebase database path.
 */
async function getContactsFromFiresBase(path = "") {
    let responseUserData = await fetch(BASE_URL_INITALS + path + ".json");
    let userData = await responseUserData.json();
    firebaseUserData = userData ? Object.values(userData) : [];
    emailToFind(firebaseUserData);
}

/**
 * Finds the user data based on the email.
 * @param {Array} firebaseUserData - The array of user data fetched from Firebase.
 */
function emailToFind(firebaseUserData) {
    const emailToFind = loggedInEmail.value;
    const usersWithEmail = firebaseUserData.filter(firebaseUserData => firebaseUserData.email === emailToFind);

    finalyData = [
        { "logedIn": usersWithEmail[0].initials },
        { "name": usersWithEmail[0].name }
    ];

    postInitals("/initals", finalyData);
}

/**
 * Sends initial data to Firebase.
 * @param {string} path - The Firebase database path.
 * @param {Object} data - The data to send to Firebase.
 */
async function postInitals(path = "", data = {}) {
    let responsePostData = await fetch(BASE_URL_INITALS + path + ".json", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
}

/**
 * Handles guest login by sending empty initials data to Firebase.
 */
async function guestLogIn() {
    guestLogInData = [
        { "logedIn": "" },
        { "name": "" }
    ];
    postInitals("/initals", guestLogInData);
    setTimeout(function () {
        window.location.href = "./summary.html";
    }, 200);
}
