const BASE_URL = "https://join-d3707-default-rtdb.europe-west1.firebasedatabase.app/users/";

let rememberMeValue = false;

/**
 * init function for login Page
 */
function initLogin() {
    loadingPasswordIcons();
    checkLogin();
}


/**
 * go to the sign up page
 */
function goToSignUp() {
    window.location.assign("../sign-up/sign-up.html")
}


/**
 * loading the lock image
 */
function loadingPasswordIcons() {
    const passwordInput = document.getElementById("password-input");

    passwordInput.addEventListener("input", () => {
        if (passwordInput.value) {
            hiddenImg();
            document.getElementById("password-icon").style.pointerEvents = "auto";
        } else {
            lockImg();
        }
    });

    hiddenImg();
}


/**
 * check login status
 * @param {*} sessionUser 
 * @returns 
 */
function checkPager(sessionUser) {
    if ((sessionUser)) {
        window.location.href = "../summary/summary.html";
        return;
    }
}


/**
 * guest-login function
 */
function guestLogin() {
    sessionStorage.setItem('username', 'Guest');
    window.location.href = '../contacts.html';
}


/**
 * event listener for login button
 */
let container = document.getElementById("login-form-container");
container.addEventListener("submit", async function (event){
    event.preventDefault();
})


/**
 * check if the user in database
 */
async function checkUser() {
    const resultDiv = document.getElementById('result');
    const emailInput = document.getElementById('email-input').value;
    const passwordInput = document.getElementById('password-input').value;
    try {
        await loadUsers(resultDiv,emailInput,passwordInput);
    } catch (error) {
        console.error(error);
        resultDiv.innerHTML = "Fehler bei der Suche.";
    }
};


/**
 * fetch all users in the datebase
 * @param {*} resultDiv 
 * @param {*} emailInput 
 * @param {*} passwordInput 
 * @returns 
 */
async function loadUsers(resultDiv,emailInput,passwordInput) {
    let users;
    let foundUser = null;
    const response = await fetch(`${BASE_URL}.json`);
    if (!response.ok) throw new Error("Fehler beim Abrufen der Datenbank.");
    users = await response.json();
        if(emailInput === "" || passwordInput === "") {
            resultDiv.innerHTML = "Please fill in all fields.";
            return;
        }

    await validateUser(foundUser, users, resultDiv,emailInput,passwordInput);
}


/**
 * validate currentUser and database User
 * @param {*} foundUser 
 * @param {*} users 
 * @param {*} resultDiv 
 * @param {*} emailInput 
 * @param {*} passwordInput 
 */
async function validateUser(foundUser, users, resultDiv,emailInput,passwordInput) {
    for (const key in users) {
        if (users[key].email == emailInput && users[key].password == passwordInput) {
            foundUser = users[key];
            break;
        }
    }
    await saveCurrentUser(resultDiv, foundUser)
}


/**
 * save the current user in sessionSorage
 * @param {*} resultDiv 
 * @param {*} foundUser 
 */
function saveCurrentUser(resultDiv, foundUser) {
    if (foundUser) {
        sessionStorage.setItem('username', foundUser.name);
        sessionStorage.setItem('email', foundUser.email);
        if (rememberMeValue) {
            localStorage.setItem('username', foundUser.name);
            localStorage.setItem('email', foundUser.email);
            window.location.href = '../contacts/contacts.html';
        } else {
            window.location.href = '../contacts/contacts.html';
        }
        
    } else {
        resultDiv.innerHTML = `No matching Account found. <a href="">Join us</a> now!`;
    }
}


/**
 * toggle the Remember Me button
 */
function toggleRememberMeBtn() {
    const rememberMeBtn = document.getElementById('remember-me-btn');
    rememberMeBtn.classList.toggle('checked');
    if (rememberMeBtn.className.includes('checked')) {
        rememberMeValue = true;
    } else {
        rememberMeValue = false;
    }
}