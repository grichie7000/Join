/**
 * toggle the popup for the logout/legal/privacy policy
 */
function togglePopUp() {
    let popUp = document.getElementById("profile-pop-up");
    popUp.classList.toggle("into-view");

    let overlayContainer = document.getElementById("overlay-container");
    overlayContainer.style.right = "calc(0px)";
}


/**
 * remove the overlay
 */
function removeOverlay() {
    let popUp = document.getElementById("profile-pop-up");
    popUp.classList.remove("into-view");

    let overlayContainer = document.getElementById("overlay-container");
    overlayContainer.style.right = "calc(-100vw)";
}


/**
 * event listener for the not closing of the popup
 * @param {*} event 
 */
function doNotClose(event) {
    event.stopPropagation();
};


/**
 * logout function
 */
function logOut() {
    localStorage.clear();
    sessionStorage.clear();
    location.href='../login/login.html';
}


/**
 * load the profile
 */
function loadProfile() {
    let profile = document.getElementById('profile');
    let userName = sessionStorage.getItem("username");
    
}