let arrowDirection = true;


function initAddTask() {
    console.log('hi');

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