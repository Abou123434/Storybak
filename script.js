function reserver(plat) {
  let msg = "Bonjour, je veux réserver : " + plat;
  let url = "https://wa.me/22500000000?text=" + encodeURIComponent(msg);
  window.open(url, "_blank");
}

const texts = {
  fr: {
    title: "Cuisine d’exception dans un cadre royal",
    desc: "Saveurs authentiques et service de prestige"
  },
  en: {
    title: "Exceptional dining in a royal setting",
    desc: "Authentic flavors and premium service"
  },
  it: {
    title: "Cucina eccezionale in un ambiente reale",
    desc: "Sapori autentici e servizio premium"
  }
};

function setLang(lang) {
  document.getElementById("title").innerText = texts[lang].title;
  document.getElementById("desc").innerText = texts[lang].desc;
}

function sendForm(e) {
  e.preventDefault();
  alert("Réservation envoyée avec succès !");
}
