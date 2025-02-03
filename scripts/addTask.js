let arrowDirectionAssigned = true;
let arrowDirectionCategory = true;
let selectArrowAssigned = '';
let selectArrowCategory = '';

function initAddTask() {
    selectArrowAssigned = document.getElementById('customArrowAssigned');
    selectArrowCategory = document.getElementById('customArrowCategory');
}

function toggleArrow(selctedInput) {
    if (selctedInput == 'assigned-to') {
        changeArrowAssigned();
    }

    if (selctedInput == 'category') {
        changeArrowCategory();
    }

}

function changeArrowAssigned() {
    const customArrowAssigned = document.getElementById('customArrowAssigned');

    if (arrowDirectionAssigned) {
        customArrowAssigned.src = "./assets/img/arrow_up.png";
    } else {
        customArrowAssigned.src = "./assets/img/arrow_down.png";
    }

    arrowDirectionAssigned = !arrowDirectionAssigned;
}

function changeArrowCategory(){
    const customArrowCategory = document.getElementById('customArrowCategory');

    if (arrowDirectionCategory) {
        customArrowCategory.src = "./assets/img/arrow_up.png";
    } else {
        customArrowCategory.src = "./assets/img/arrow_down.png";
    }
    
    arrowDirectionCategory = !arrowDirectionCategory;
}



window.addEventListener("click", function (event) {
    const assignedToDiv = document.getElementById("assigned-to")
    if (!assignedToDiv.contains(event.target)) {
        selectArrowAssigned.src = "./assets/img/arrow_down.png";
        arrowDirectionAssigned = true;
    }
});

window.addEventListener("click", function (event) {
    const categoryDiv = document.getElementById("category")
    if (!categoryDiv.contains(event.target)) {
        selectArrowCategory.src = "./assets/img/arrow_down.png";
        arrowDirectionCategory = true;
    }
});


