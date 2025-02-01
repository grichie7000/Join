let arrowDirection = true;
let selectArrow = '';

function initAddTask() {
    console.log('hi');
    selectArrow = document.getElementById('customArrow');
}


function toggleArrow() {
    const customArrow = document.getElementById('customArrow');

    if (arrowDirection) {
        customArrow.src = "./assets/img/arrow_up.png";
    } else {
        customArrow.src = "./assets/img/arrow_down.png";
    }

    arrowDirection = !arrowDirection;
}