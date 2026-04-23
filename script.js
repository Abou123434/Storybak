// Animation scroll simple (effet pro)
const sections = document.querySelectorAll("section");

window.addEventListener("scroll", () => {
  sections.forEach(sec => {
    const top = window.scrollY;
    const offset = sec.offsetTop - 400;
    const height = sec.offsetHeight;

    if(top >= offset && top < offset + height){
      sec.style.opacity = 1;
      sec.style.transform = "translateY(0)";
      sec.style.transition = "0.6s ease";
    }
  });
});

// Formulaire réservation
document.getElementById("form").addEventListener("submit", function(e){
  e.preventDefault();
  alert("Réservation envoyée avec succès 🍽️");
});
