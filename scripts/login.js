function openSignUp() {
    let login = document.getElementById('login');
    login.style.display = 'none';
    let header = document.getElementById('header-right-content');
    header.style.display = 'none';
    document.getElementById('signUp').innerHTML = getSignUpTemplate();
}

function backToLogin() {
    let login = document.getElementById('login');
    login.style.display = 'block';
    let header = document.getElementById('header-right-content');
    header.style.display = 'flex';
    document.getElementById('signUp').innerHTML = '';
}
