/* ===== HAMBURGER ===== */
document.addEventListener("DOMContentLoaded", () => {

  const hamburger = document.getElementById("hamburger");
  const menu = document.getElementById("menuOptions");

  if(hamburger && menu){
    hamburger.onclick = () => {
      menu.style.display = (menu.style.display === "flex") ? "none" : "flex";
    };
  }

});
