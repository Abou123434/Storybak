// HORAIRES EN TEMPS RÉEL
const hours = document.getElementById("hours");

function updateHours() {
  const now = new Date();
  const h = now.getHours();

  let status = "";

  if (h >= 11 && h <= 15 || h >= 18 && h <= 23) {
    status = "🟢 Ouvert maintenant";
  } else {
    status = "🔴 Fermé actuellement";
  }

  hours.innerHTML = `
    <p>Lundi - Dimanche</p>
    <p>12h - 15h | 19h - 23h</p>
    <h3>${status}</h3>
  `;
}

updateHours();
setInterval(updateHours, 60000);

// ANIMATION SIMPLE SCROLL
document.querySelectorAll("a").forEach(a=>{
  a.addEventListener("click", e=>{
    e.preventDefault();
    document.querySelector(a.getAttribute("href")).scrollIntoView({
      behavior:"smooth"
    });
  });
});

// FORMULAIRE
document.querySelector("form").addEventListener("submit", e=>{
  e.preventDefault();
  alert("Réservation envoyée avec succès 🍽️");
});
