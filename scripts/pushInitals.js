const BASE_URL_INITALS = "https://join-d3707-default-rtdb.europe-west1.firebasedatabase.app/";

let firebaseDataInitals = [];
let loggedInEmail;
let firebaseUserData;
let finalyData;
let guestLogInData;

function loadInitialsFirebase(user) {

    if (user === 1) {
        getLoginName();
        getContactsFromFiresBase("users");
    } else {
        guestLogIn()
    }

}

function getLoginName() {
    loggedInEmail = document.getElementById("email")
}

async function getContactsFromFiresBase(path = "") {
    let responseUserData = await fetch(BASE_URL_INITALS + path + ".json");
    let userData = await responseUserData.json();
    firebaseUserData = userData ? Object.values(userData) : [];
    emailToFind(firebaseUserData)
}

function emailToFind(firebaseUserData) {
    const emailToFind = loggedInEmail.value;
    // Erstelle ein neues Array mit den Benutzern, deren E-Mail übereinstimmt
    const usersWithEmail = firebaseUserData.filter(firebaseUserData => firebaseUserData.email === emailToFind);

    finalyData = [
        { "logedIn": usersWithEmail[0].initials },
        { "name": usersWithEmail[0].name }
    ]

    postInitals("/initals", finalyData);
}

async function postInitals(path = "", data = {}) {

    let responsePostData = await fetch(BASE_URL_INITALS + path + ".json", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    
}

async function guestLogIn() {
    guestLogInData = [
        { "logedIn": "" },
        { "name": "" }
    ]
    postInitals("/initals", guestLogInData)
    setTimeout(function () {
        window.location.href = "./summary.html";
      }, 200);
}