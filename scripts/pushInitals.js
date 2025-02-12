const BASE_URL_INITALS = "https://join-d3707-default-rtdb.europe-west1.firebasedatabase.app/";

let firebaseDataInitals = [];


function loadInitials(){
    postInitals();
}

async function postInitals(path = "", data = {}) {
    let response = await fetch(BASE_URL_INITALS + path + ".json", {
        method: "POST",
        headers: {
            "initals": "application/json"
        },
        body: JSON.stringify(data)
    });

}


function submitLogIn(event) {
    event.preventDefault(); // Verhindert das Standard-Verhalten (Seiten-Neuladen)
    const dataToBoard = formDataArray.push(document.getElementById('title').value)


    postDatatoBoard("/initals", dataToBoard)
}