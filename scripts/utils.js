// utils.js
export const $ = (id) => document.getElementById(id);

export function getCategoryColor(category) {
  return category === 'Technical Task' ? '#23D8C2' : '#1500ff';
}

export function getInitials(name) {
  if (!name || typeof name !== 'string') return '??';
  return name.split(' ')
    .map(n => n[0]?.toUpperCase() || '')
    .join('')
    .substring(0, 2);
}

export function getContactColor(contact) {
  if (typeof contact === 'object' && contact.color) return contact.color;
  const safeName = typeof contact === 'string' ? contact : (contact?.name || 'Unknown');
  const colors = ['#004d40', '#1a237e', '#b71c1c', '#FFC452', '#00FE00', '#DE3FD9'];
  const hash = Array.from(safeName).reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  return colors[hash % colors.length];
}

export function createContactBadge(contact) {
  const badge = document.createElement('div');
  badge.className = 'contact-badge';
  badge.style.backgroundColor = getContactColor(contact);
  badge.title = contact.name;
  badge.textContent = getInitials(contact.name);
  return badge;
}

export function getColumnPlaceholderText(columnId) {
  const columnNames = {
    "to-do": "To Do",
    "in-progress": "In Progress",
    "await-feedback": "Await Feedback",
    "done": "Done"
  };
  return `No tasks ${columnNames[columnId]}`;
}

export function updatePlaceholders() {
  const columns = ["to-do", "in-progress", "await-feedback", "done"];
  columns.forEach(columnId => {
    const column = $(columnId);
    if (!column) return;
    const tasks = column.querySelectorAll('.task');
    const visibleTasks = Array.from(tasks).filter(task => task.style.display !== 'none');
    if (visibleTasks.length === 0 && !column.querySelector('.empty-placeholder')) {
      const placeholder = document.createElement('div');
      placeholder.className = 'empty-placeholder';
      placeholder.textContent = getColumnPlaceholderText(columnId);
      column.appendChild(placeholder);
    } else if (visibleTasks.length > 0) {
      const existingPlaceholder = column.querySelector('.empty-placeholder');
      if (existingPlaceholder) existingPlaceholder.remove();
    }
  });
}

export function drag(event) {
  event.dataTransfer.setData("text", event.target.id);
}
