/**
 * The base URL for the Firebase database.
 * @constant {string}
 */
const BASE_URL_INITALS = "https://join-d3707-default-rtdb.europe-west1.firebasedatabase.app/";
let logedInUser;

/**
 * Loads the initials of the logged-in user as soon as the DOM is loaded.
 * @event
 */
document.addEventListener("DOMContentLoaded", function () {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (loggedInUser && loggedInUser.initials) {
        document.getElementById("profile-toggle").textContent = loggedInUser.initials;
    }
});

/**
 * Manages the display of the dropdown menu.
 * @event
 */
document.addEventListener("DOMContentLoaded", function () {
    const profileToggle = document.getElementById("profile-toggle");
    const dropdownMenu = document.getElementById("dropdown-menu");

    profileToggle.addEventListener("click", function (event) {
        dropdownMenu.style.display = (dropdownMenu.style.display === "block") ? "none" : "block";
        event.stopPropagation();
    });

    document.addEventListener("click", function (event) {
        if (!dropdownMenu.contains(event.target) && event.target !== profileToggle) {
            dropdownMenu.style.display = "none";
        }
    });
});

/**
 * Loads the initials of the user from the Firebase database.
 */
function loadInitals() {
    getFirebaseInitals("initals");
}

/**
 * Fetches the initials of the user from the Firebase database.
 * @param {string} [path=""] The path to the Firebase database.
 * @returns {Promise<void>}
 */
async function getFirebaseInitals(path = "") {
    let response = await fetch(BASE_URL_INITALS + path + ".json");
    let responseToJson = await response.json();
    logedInUser = responseToJson;
    displayInitals(logedInUser[0].logedIn);
}

/**
 * Displays the initials of the user and adjusts the layout based on the length of the initials.
 * @param {string} initals The initials of the user.
 */
function displayInitals(initals) {
    const profileToggle = document.getElementById('profile-toggle');

    if (!initals || initals.trim() === "") {
        profileToggle.innerHTML = "Guest";
        profileToggle.style.fontSize = '14px';
        profileToggle.style.padding = "14px 4px";
    } else {
        profileToggle.innerHTML = initals;

        const initialsLength = initals.trim().length;

        if (initialsLength === 1) {
            profileToggle.style.padding = "10px 16px";
        } else if (initialsLength === 2) {
            profileToggle.style.padding = "12px 10px";
        }
    }
}
