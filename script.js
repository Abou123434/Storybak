// MENU MOBILE
const toggle = document.getElementById("menu-toggle");
const nav = document.getElementById("nav");

toggle.addEventListener("click", () => {
  nav.style.display = nav.style.display === "flex" ? "none" : "flex";
});

// SCROLL ANIMATION
const cards = document.querySelectorAll(".card");

window.addEventListener("scroll", () => {
  cards.forEach(card => {
    const top = card.getBoundingClientRect().top;
    if(top < window.innerHeight - 50){
      card.style.opacity = 1;
      card.style.transform = "translateY(0)";
    }
  });
});
