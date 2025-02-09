/**
 * go back to the last page
 */
function goBack() {
  window.history.back();
}


/**
 * load nav and header
 */
function includeHTML() {
  let navigation = document.getElementById("navigation-container");
  navigation.innerHTML = initNav();
  let header = document.getElementById("header-container");
  header.innerHTML = initHeader();
  let popUp = document.getElementById("overlay-container");
  popUp.innerHTML = initProfilePopUp();
}


/**
 * check the login status
 */
function checkLogin() {
  const isLoginPage = window.location.pathname.includes("join/login/login.html");
  const sessionUser = sessionStorage.getItem("username");
  const localUser = localStorage.getItem("username");

  // Wenn Remember-Me aktiv (localUser vorhanden)
  if (localUser && !sessionUser) {
    sessionStorage.setItem("username", localUser);
    sessionStorage.setItem("email", localStorage.getItem("email"));
  }

  checkPager(sessionUser);
}


/**
 * Generate initials for the top right corner in the header section.
 */
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


/**
 * random color function for the profile section
 * @returns 
 */
function getRandomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}


/**
 * check link function to highlight the active link in the sidebar
 */
function checkLink() {
  const currentPath = window.location.pathname;
  const sidebarLinks = document.querySelectorAll('#navigation-container .aside-nav a');
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


/**
 * not logged in function to hide the sidebar and profile section
 */
function notLogin() {
  let sidebar = document.getElementById('navigation-container');
  let profile = document.getElementById('profile');
  let info = document.getElementById('info');
  let asideNav = document.getElementById('aside-nav');
  if (sessionStorage.getItem("username") == null) {
    sidebar.classList.add('no-login-sidebar-none');
    profile.classList.add('no-login-none');
    info.classList.add('no-login-none');
    asideNav.classList.add('no-login-none');
  } else {
    sidebar.classList.remove('no-login-sidebar-none');
    profile.classList.remove('no-login-none');
    info.classList.remove('no-login-none');
    asideNav.classList.remove('no-login-none');
    generateInitials();
  }
}