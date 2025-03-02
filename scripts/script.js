
function goBack() {
  window.history.back();
}

function loadProfile() {
    let profile = document.getElementById('profile');
    let userName = sessionStorage.getItem("username");
    
}

function includeHTML() {
  let popUp = document.getElementById("overlay-container");
  popUp.innerHTML = initProfilePopUp();
}


function checkLogin() {
  const isLoginPage = window.location.pathname.includes("join/login.html");
  const sessionUser = sessionStorage.getItem("username");
  const localUser = localStorage.getItem("username");

  if (localUser && !sessionUser) {
    sessionStorage.setItem("username", localUser);
    sessionStorage.setItem("email", localStorage.getItem("email"));
  }

  checkPager(sessionUser);
}


function generateInitials() {
  let content = document.getElementById("profile");

  let userName = sessionStorage.getItem("username");
  content.innerHTML = "";
  let nameParts = userName.split(" ");
  if (nameParts.length >= 2) {
    let initials = (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    content.innerHTML = initials;
  } else if (nameParts.length === 1) {
    let initials = nameParts[0][0].toUpperCase();
    content.innerHTML = initials;
  } else {
    content.innerHTML = "G";
  }
}


function getRandomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}


function checkLink() {
  const currentPath = window.location.pathname;
  const sidebarLinks = document.querySelectorAll('#navigation-container .menuPos a');
  sidebarLinks.forEach(link => {
    link.classList.remove('active');
    let href = link.getAttribute('href').replace('../', '');
    if (currentPath.includes("/join/" + href)) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}


function notLogin() {
    let sidebar = document.getElementById('navigation-container');
    let profile = document.getElementById('profile');
    let info = document.getElementById('info');
    let asideNav = document.getElementById('menuPos');

    if (sessionStorage.getItem("username") == null) {
        hideUserInterface(sidebar, profile, info, asideNav);
    } else {
        showUserInterface(sidebar, profile, info, asideNav);
        generateInitials();
    }
}

function hideUserInterface(sidebar, profile, info, asideNav) {
    sidebar.classList.add('no-login-sidebar-none');
    profile.classList.add('no-login-none');
    info.classList.add('no-login-none');
    asideNav.classList.add('no-login-none');
}

function showUserInterface(sidebar, profile, info, asideNav) {
    sidebar.classList.remove('no-login-sidebar-none');
    profile.classList.remove('no-login-none');
    info.classList.remove('no-login-none');
    asideNav.classList.remove('no-login-none');
}