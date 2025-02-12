const BASE_URL_INITALS = "https://join-d3707-default-rtdb.europe-west1.firebasedatabase.app/";

loadFirebaseData("contatcsFirebase");

async function loadFirebaseData(path = "") {
    let response = await fetch(BASE_URL_ADDTASK + path + ".json");
    let responseToJson = await response.json();
    firebaseData = responseToJson;
}