function reserve(plat) {
  const msg = "Je veux réserver : " + plat;
  window.open("https://wa.me/225000000000?text=" + encodeURIComponent(msg));
}

function sendReservation(e) {
  e.preventDefault();

  alert("Réservation envoyée via WhatsApp !");
}

const translations = {
  fr: {
    title: "Une expérience culinaire d’exception",
    subtitle: "Restaurant haut de gamme – Abidjan"
  },
  en: {
    title: "A luxury culinary experience",
    subtitle: "High-end restaurant – Abidjan"
  },
  it: {
    title: "Un’esperienza culinaria di lusso",
    subtitle: "Ristorante di alta classe – Abidjan"
  }
};

function setLang(lang) {
  document.querySelector("[data-i18n='title']").innerText = translations[lang].title;
  document.querySelector("[data-i18n='subtitle']").innerText = translations[lang].subtitle;
}
