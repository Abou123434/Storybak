const langData = {
  fr: {
    title: "Une expérience gastronomique d’exception",
    subtitle: "Cuisine raffinée, ambiance luxueuse, service premium",
    menu: "Nos Plats Signature",
    reserve: "Réservation"
  },
  en: {
    title: "An exceptional dining experience",
    subtitle: "Fine cuisine, luxury atmosphere, premium service",
    menu: "Our Signature Dishes",
    reserve: "Reservation"
  },
  it: {
    title: "Un'esperienza gastronomica eccezionale",
    subtitle: "Cucina raffinata, atmosfera di lusso, servizio premium",
    menu: "I nostri piatti",
    reserve: "Prenotazione"
  }
};

const langSelect = document.getElementById("lang");

langSelect.addEventListener("change", (e) => {
  const lang = e.target.value;

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    el.textContent = langData[lang][key];
  });
});

// WhatsApp reservation
document.getElementById("form").addEventListener("submit", function(e){
  e.preventDefault();

  const inputs = this.querySelectorAll("input, textarea");
  let msg = "Nouvelle réservation:%0A";

  inputs.forEach(i => {
    msg += i.placeholder + ": " + i.value + "%0A";
  });

  const phone = "225000000000"; // change ton numéro
  window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
});
