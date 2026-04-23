// STATUS OUVERT / FERMÉ
const statusText = document.getElementById("status");
const now = new Date().getHours();

if(now >= 12 && now <= 23){
statusText.innerText = "🟢 Ouvert maintenant";
statusText.style.color = "#4CAF50";
}else{
statusText.innerText = "🔴 Fermé actuellement";
statusText.style.color = "red";
}

// Animation apparition scroll
const elements = document.querySelectorAll(".section");
window.addEventListener("scroll", () => {
elements.forEach(el => {
const position = el.getBoundingClientRect().top;
if(position < window.innerHeight - 100){
el.style.opacity = 1;
el.style.transform = "translateY(0)";
}
});
});

// Simulation envoi réservation
document.getElementById("bookingForm").addEventListener("submit", e=>{
e.preventDefault();
alert("Votre demande de réservation a été envoyée !");
});
