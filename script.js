// Animation scroll simple
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.style.opacity = 1;
      entry.target.style.transform = "translateY(0)";
    }
  });
});

document.querySelectorAll(".card, .review, .title").forEach(el => {
  el.style.opacity = 0;
  el.style.transform = "translateY(30px)";
  el.style.transition = "0.6s ease";
  observer.observe(el);
});

// Formulaire réservation
document.getElementById("form").addEventListener("submit", function(e){
  e.preventDefault();
  alert("🍽️ Réservation envoyée avec succès ! Nous vous contactons bientôt.");
  this.reset();
});
