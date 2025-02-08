// Globale Arrays, in denen die ausgewählten Kontakte und Subtasks gespeichert werden
let selectedContacts = [];
let selectedSubtasks = [];

/* -------------- Kontakte -------------- */

// Blendet das Dropdown zur Kontaktwahl ein/aus
function toggleContactDropdown() {
  const dropdown = document.getElementById('contactDropdown');
  dropdown.style.display = (dropdown.style.display === 'block') ? 'none' : 'block';
}

// Wird beim Klick auf einen Kontakt im Dropdown aufgerufen
function selectContact(name) {
  // Füge den Kontakt nur hinzu, wenn er noch nicht ausgewählt wurde
  if (!selectedContacts.includes(name)) {
    selectedContacts.push(name);
    updateContactsUI();
  }
  toggleContactDropdown();
}

// Aktualisiert die Anzeige der ausgewählten Kontakte
function updateContactsUI() {
  const contactsUl = document.getElementById('overlayTaskContacts');
  contactsUl.innerHTML = "";
  selectedContacts.forEach(contact => {
    const li = document.createElement("li");
    li.textContent = contact;
    // Optional: Durch Klicken kann ein Kontakt entfernt werden
    li.addEventListener("click", () => removeContact(contact));
    contactsUl.appendChild(li);
  });
}

// Entfernt einen Kontakt aus der Auswahl
function removeContact(name) {
  selectedContacts = selectedContacts.filter(contact => contact !== name);
  updateContactsUI();
}

/* -------------- Subtasks -------------- */

// Fügt einen neuen Subtask hinzu
function addSubtask() {
  const input = document.getElementById('newSubtaskInput');
  const subtaskText = input.value.trim();
  if (subtaskText) {
    selectedSubtasks.push(subtaskText);
    updateSubtasksUI();
    input.value = "";
  }
}

// Aktualisiert die Anzeige der hinzugefügten Subtasks
function updateSubtasksUI() {
  const subtaskUl = document.getElementById('overlayTaskSubtasks');
  subtaskUl.innerHTML = "";
  selectedSubtasks.forEach((subtask, index) => {
    const li = document.createElement("li");
    li.textContent = subtask;
    // Optional: Durch Klicken einen Subtask entfernen
    li.addEventListener("click", () => removeSubtask(index));
    subtaskUl.appendChild(li);
  });
}

// Entfernt einen Subtask anhand seines Index
function removeSubtask(index) {
  selectedSubtasks.splice(index, 1);
  updateSubtasksUI();
}

function toggleDropdown() {
  const assignedToElement = document.getElementById('assigned-to');
  const customArrowAssigned = document.getElementById('customArrowAssigned');
  const placeholderAssigned = document.getElementById('placeholderAssigned');

  // Umschalten der "open"-Klasse für das Dropdown-Menü und das Pfeilsymbol
  assignedToElement.classList.toggle('open');

  customArrowAssigned.classList.toggle('open');

  if (assignedToElement.classList.contains('open')) {
      placeholderAssigned.innerHTML = "An |"
  } else {
      placeholderAssigned.innerHTML = "Select contacts to assign"
  }
}