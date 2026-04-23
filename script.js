function reserve(plat) {
  alert("Vous avez choisi : " + plat + " 🍽️");
}

// Formulaire
document.getElementById("form").addEventListener("submit", function(e) {
  e.preventDefault();
  alert("Réservation envoyée avec succès ✅");
});
