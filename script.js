function reserver(plat) {
  let msg = "Je veux réserver : " + plat;
  let url = "https://wa.me/22500000000?text=" + encodeURIComponent(msg);
  window.open(url, "_blank");
}

// LANGUES
const texts = {
  fr: {
    heroTitle: "Une expérience gastronomique unique",
    heroText: "Cuisine raffinée, ambiance luxueuse, service premium"
  },
  en: {
    heroTitle: "A unique culinary experience",
    heroText: "Fine dining, luxury atmosphere, premium service"
  },
  it: {
    heroTitle: "Un'esperienza gastronomica unica",
    heroText: "Cucina raffinata, atmosfera di lusso"
  }
};

function setLang(lang) {
  document.getElementById("heroTitle").innerText = texts[lang].heroTitle;
  document.getElementById("heroText").innerText = texts[lang].heroText;
}

function sendForm(e) {
  e.preventDefault();
  alert("Réservation envoyée avec succès !");
}
