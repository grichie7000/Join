/**
 * Validates the entire form and submits it if all validations are successful.
 * @param {Event} event - The triggering event.
 */
function validateFormular(event) {
    event.preventDefault();
    validateTitle(event);
    validateDate(event);
    validateCategory(event);
    if (validateIsOk.every(val => val === true)) {
      submitForm(event);
    }
  }
  
  /**
   * Checks the title field of the form and displays an error message if the field is empty.
   * @param {Event} event - The triggering event.
   */
  function validateTitle(event) {
    errorTitle.innerHTML = "";
    if (!title.value.trim()) {
      errorTitle.innerHTML = "This field is required";
      title.style.border = "2px solid #FF8190";
      validateIsOk[0] = false;
      return false;
    }
    title.style.border = "2px solid #D1D1D1";
    validateIsOk[0] = true;
  }
  
  /**
   * Checks the date field of the form and displays an error message if no date is entered.
   * @param {Event} event - The triggering event.
   */
  function validateDate(event) {
    errorDate.innerHTML = "";
    if (!date.value) {
      errorDate.innerHTML = "This field is required";
      date.style.border = "2px solid #FF8190";
      validateIsOk[1] = false;
      return false;
    }
    date.style.border = "2px solid #D1D1D1";
    validateIsOk[1] = true;
  }
  
  /**
   * Checks the category field of the form and displays an error message if no category is selected.
   * @param {Event} event - The triggering event.
   */
  function validateCategory(event) {
    errorCategory.innerHTML = "";
    if (!category.value) {
      errorCategory.innerHTML = "This field is required";
      category.style.border = "2px solid #FF8190";
      validateIsOk[2] = false;
      return false;
    }
    category.style.border = "2px solid #D1D1D1";
    validateIsOk[2] = true;
  }
  
  /**
   * Applies specific styling to the subtask input field.
   * @param {HTMLElement} inputElement - The input element to be styled.
   * @returns {HTMLElement} The symbol container element after applying styling.
   */
  function applySubtaskInputStyle(inputElement) {
    inputElement.style.border = "2px solid #29ABE2";
    const symbolStyling = document.getElementById("symbolStyling");
    symbolStyling.style.cssText = "border: 2px solid #29ABE2; border-left: none;";
    symbolStyling.innerHTML = "";
    return symbolStyling;
  }
  
  /**
   * Creates and appends the delete and check icons into the provided container.
   * @param {HTMLElement} container - The element where icons should be appended.
   */
  function createSubtaskIcons(container) {
    const deleteImg = Object.assign(document.createElement("img"), {
      src: "./assets/img/x_task.png",
      alt: "delete",
      id: "deleteImg",
      onclick: subtaskInputDelete
    });
    const checkImg = Object.assign(document.createElement("img"), {
      src: "./assets/img/check_task.png",
      alt: "checked",
      id: "checkImg",
      onclick: subtaskAppend
    });
    const symbolTask = document.createElement("span");
    symbolTask.textContent = "|";
    container.append(deleteImg, symbolTask, checkImg);
  }
  
  /**
   * Applies styling to the subtask input field and displays the delete and check icons.
   * @param {HTMLElement} inputElement - The input element to be styled.
   */
  function subtaskStyling(inputElement) {
    const symbolStyling = applySubtaskInputStyle(inputElement);
    createSubtaskIcons(symbolStyling);
  }
  
  /**
   * Adds a new subtask to the global subtasks list and updates the display.
   * @param {string} subtaskValue - The trimmed subtask value.
   */
  function addSubtask(subtaskValue) {
    const addedSubtaskOne = document.getElementById("subtaskItem1");
    const addedSubtaskTwo = document.getElementById("subtaskItem2");
    if (window.selectedSubtasks.length < 2) {
      window.selectedSubtasks.push({
        title: subtaskValue,
        completed: false
      });
      if (window.selectedSubtasks.length === 1) {
        addedSubtaskOne.innerHTML = subtaskValue;
        addedSubtaskOne.style.display = "inline";
      } else {
        addedSubtaskTwo.innerHTML = subtaskValue;
        addedSubtaskTwo.style.display = "inline";
      }
    }
  }
  
  /**
   * Retrieves the subtask input value, adds the subtask if valid, and resets the input field.
   */
  function subtaskAppend() {
    const subtaskInputValue = document.getElementById("subtask").value.trim();
    if (!subtaskInputValue) return;
    addSubtask(subtaskInputValue);
    resetAddtaskInput();
  }
  
  /**
   * Toggles the dropdown menu for contact assignment and adjusts the placeholder text accordingly.
   */
  function toggleDropdown() {
    const assignedToElement = document.getElementById("assigned-to");
    const customArrowAssigned = document.getElementById("customArrowAssigned");
    const placeholderAssigned = document.getElementById("placeholderAssigned");
    assignedToElement.classList.toggle("open");
    customArrowAssigned.classList.toggle("open");
    if (assignedToElement.classList.contains("open")) {
      placeholderAssigned.innerHTML = "An |";
    } else {
      placeholderAssigned.innerHTML = "Select contacts to assign";
    }
  }
  
  /**
   * Adds a global click listener that resets the dropdown menu and subtask input
   * when a click occurs outside the corresponding areas.
   */
  document.addEventListener("click", function (event) {
    const assignedToElement = document.getElementById("assigned-to");
    const customArrowAssigned = document.getElementById("customArrowAssigned");
    const placeholderAssigned = document.getElementById("placeholderAssigned");
    const formSubtask = document.querySelector(".form-subtask");
    if (!formSubtask.contains(event.target)) {
      resetAddtaskInput();
    }
    if (!assignedToElement.contains(event.target)) {
      assignedToElement.classList.remove("open");
      customArrowAssigned.classList.remove("open");
      placeholderAssigned.innerHTML = "Select contacts to assign";
    }
  });
  
  /**
   * Collects all data from the "Add Task" form and returns it as an object.
   * @returns {Object} An object containing the title, description, selected contacts,
   *                   due date, priority, category, and subtasks.
   */
  function getAddTaskData() {
    const priorityElement = document.querySelector('input[name="priority"]:checked');
    const priorityValue = priorityElement ? priorityElement.value : "medium";
    return {
      title: title.value.trim(),
      description: document.getElementById("description").value.trim(),
      contacts: window.selectedContacts,
      dueDate: date.value,
      priority: priorityValue,
      category: category.value,
      subtasks: window.selectedSubtasks
    };
  }
  
  /**
   * Handles form submission by collecting form data, displaying a confirmation,
   * sending data to Firebase, and then navigating to the board page.
   * @param {Event} event - The triggering event.
   */
  function submitForm(event) {
    event.preventDefault();
    const dataToBoard = getAddTaskData();
    const card = document.getElementById("submit-card");
    card.classList.add("visible");
    postDatatoBoard("/tasks/to-do", dataToBoard);
    setTimeout(function () {
      window.location.href = "./board.html";
    }, 1500);
  }
  
  /**
   * Sends the provided data to Firebase at the specified path.
   * @async
   * @param {string} [path=""] - The path in the Firebase database to which data should be sent.
   * @param {Object} [data={}] - The data to be sent.
   */
  async function postDatatoBoard(path = "", data = {}) {
    await fetch(BASE_URL_ADDTASK + path + ".json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
  }
  
  