
// Varibalen werden  nach dem Laden des Dokuments gespeichert
document.addEventListener("DOMContentLoaded", function () {
    const profileToggle = document.getElementById("profile-toggle");
    const dropdownMenu = document.getElementById("dropdown-menu");

    // Öffnen/Schließen des Dropdowns beim Klicken auf "SM"
    profileToggle.addEventListener("click", function (event) {
        dropdownMenu.style.display = (dropdownMenu.style.display === "block") ? "none" : "block";
        event.stopPropagation(); // Verhindert, dass das Klicken den Event weitergibt
    });

    // Schließen des Dropdowns, wenn irgendwo im Dokument geklickt wird
    document.addEventListener("click", function (event) {
        if (!dropdownMenu.contains(event.target) && event.target !== profileToggle) {
            dropdownMenu.style.display = "none";
        }
    });
});
