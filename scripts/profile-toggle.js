 /**
   * Berechnet Initialen aus einem vollständigen Namen.
   * @param {string} name - Der vollständige Name.
   * @returns {string} - Die berechneten Initialen.
   */
 function getInitials(name) {
    return name
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('');
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    // Zuerst versuchen, den tempUser zu laden (falls vorhanden)
    let user = JSON.parse(localStorage.getItem('tempUser'));
    
    // Falls kein tempUser vorhanden, auf den regulären loggedInUser zurückgreifen.
    if (!user) {
      user = JSON.parse(localStorage.getItem('loggedInUser'));
    }
    
    // Falls das Element vorhanden ist, setze dessen Inhalt.
    const initialsElement = document.getElementById('profile-toggle');
    if (user && initialsElement) {
      // Nutze die gespeicherten Initialen oder berechne sie aus dem Namen
      initialsElement.textContent = user.initials || (user.name ? getInitials(user.name) : '');
    }
  });