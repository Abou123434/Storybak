/* ===== HAMBURGER ===== */
document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("hamburger");
    const menu = document.getElementById("menuOptions");

    btn.addEventListener("click", () => {
        menu.style.display = (menu.style.display === "flex") ? "none" : "flex";
    });
});
