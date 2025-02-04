let validateIsOk = false;
let title;
let errorTitle;
let date;
let errorDate;
let category;
let errorCategory;

function initAddTask() {
    getElementsByIds()
}


function validateFormular(event) {
    validateTitle(event)
    validateDate(event)
    validateCategory(event)
}


function validateTitle(event) {
    errorTitle.innerHTML = '';

    if (!title.value) {
        errorTitle.innerHTML = 'This field is required'
        title.style.border = "2px solid #FF8190"
        event.preventDefault();
        return validateIsOk = false
    }

    return validateIsOk = true;
}

function validateDate(event) {
    errorDate.innerHTML = '';

    if (!date.value) {
        errorDate.innerHTML = 'This field is required'
        date.style.border = "2px solid #FF8190"
        console.log(errorDate);
        event.preventDefault();
        return validateIsOk = false
    }

    return validateIsOk = true;
}


function validateCategory(event) {
    errorCategory.innerHTML = '';

    if (!category.value) {
        errorCategory.innerHTML = 'This field is required'
        category.style.border = "2px solid #FF8190"
        event.preventDefault();
        return validateIsOk = false
    }

    return validateIsOk = true;

}

function clearTask() {
    errorTitle.innerHTML = '';
    title.style.border = "2px solid #D1D1D1"

    errorDate.innerHTML = '';
    date.style.border = "2px solid #D1D1D1"
    date.style.color = "#D1D1D1"

    errorCategory.innerHTML = '';
    category.style.border = "2px solid #D1D1D1"
}


function getElementsByIds() {
    title = document.getElementById('title');
    errorTitle = document.getElementById('error-title')

    date = document.getElementById('due-date');
    errorDate = document.getElementById('error-date')

    category = document.getElementById('category');
    errorCategory = document.getElementById('error-category')
}


function changeDateColor() {
    date = document.getElementById('due-date');

    if (date.value) {
        date.style.color = 'black';
    } else {
        date.style.color = '';
    }
}