function reserve(plat) {
  window.open("https://wa.me/225000000000?text=Je veux réserver : " + plat);
}

function send() {
  alert("Réservation envoyée ✔");
}

const t = {
  fr: { title: "Expérience culinaire luxe", subtitle: "Abidjan - Côte d’Ivoire" },
  en: { title: "Luxury dining experience", subtitle: "Abidjan - Ivory Coast" },
  it: { title: "Esperienza culinaria di lusso", subtitle: "Abidjan - Costa d’Avorio" }
};

function setLang(l) {
  document.querySelector("[data-i18n='title']").innerText = t[l].title;
  document.querySelector("[data-i18n='subtitle']").innerText = t[l].subtitle;
}
