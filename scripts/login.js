
let BASE_URL = 'https://join-d3707-default-rtdb.europe-west1.firebasedatabase.app/'

async function loadDataUser() {
   let response = await fetch(BASE_URL + ".json");
   let responseToJson = await response.json();
   console.log(responseToJson);
}

function addData() {
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;

    localStorage.setItem('userEmail', email);
    localStorage.setItem('userPassword', password);
}
