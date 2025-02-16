const BASE_URL_INITALS = "https://join-d3707-default-rtdb.europe-west1.firebasedatabase.app/";
let logedInUser;

document.addEventListener("DOMContentLoaded", function () {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (loggedInUser && loggedInUser.initials) {
        document.getElementById("profile-toggle").textContent = loggedInUser.initials;
    }
});


// Varibalen werden  nach dem Laden des Dokuments gespeichert
document.addEventListener("DOMContentLoaded", function () {
    const profileToggle = document.getElementById("profile-toggle");
    const dropdownMenu = document.getElementById("dropdown-menu");

    // Öffnen/Schließen des Dropdowns beim Klicken auf "SM"
    profileToggle.addEventListener("click", function (event) {
        dropdownMenu.style.display = (dropdownMenu.style.display === "block") ? "none" : "block";
        event.stopPropagation(); // Verhindert, dass das Klicken den Event weitergibt
    });

    // Schließen des Dropdowns, wenn irgendwo im Dokument geklickt wird
    document.addEventListener("click", function (event) {
        if (!dropdownMenu.contains(event.target) && event.target !== profileToggle) {
            dropdownMenu.style.display = "none";
        }
    });
});


function loadInitals() {
    getFirebaseInitals("initals")
}


async function getFirebaseInitals(path = "") {
    let response = await fetch(BASE_URL_INITALS + path + ".json");
    let responseToJson = await response.json();
    logedInUser = responseToJson;
    displayInitals(logedInUser[0].logedIn);
}


function displayInitals(initals) {
    // Überprüfen, ob keine Initialen vorhanden sind
    if (!initals || initals.trim() === "") {
        const guest = document.getElementById('profile-toggle')
        guest.innerHTML = "Guest";
        guest.style.fontSize = '14px'
        guest.style.padding = "14px 4px"
    } else {
        document.getElementById('profile-toggle').innerHTML = initals; // Andernfalls die geladenen Initialen anzeigen
    }
}