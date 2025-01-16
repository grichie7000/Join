function loadBody() {
    const logo = document.getElementById('svg');
    logo.classList.add('logo-image');
    
    setTimeout(() => {
        const headerContent = document.getElementById('header-right-content');
        const loginForm = document.getElementById('loginForm');
        headerContent.classList.add('show-content');
        loginForm.classList.add('show-content');
    }, 300); 
}
