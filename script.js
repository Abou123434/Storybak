function reserve(plat) {
  alert("Réservation pour : " + plat);
}

function whatsapp() {
  window.open("https://wa.me/225000000000", "_blank");
}

function sendReservation(e) {
  e.preventDefault();

  let name = document.getElementById("name").value;
  let date = document.getElementById("date").value;
  let time = document.getElementById("time").value;

  let msg = `Bonjour, je réserve pour ${name} le ${date} à ${time}`;
  let url = "https://wa.me/225000000000?text=" + encodeURIComponent(msg);

  window.open(url, "_blank");
}

// LANGUE SIMPLE
function changeLang() {
  let lang = document.getElementById("lang").value;

  const texts = {
    en: { title: "Luxury Dining Experience", subtitle: "Premium cuisine - Elegant service" },
    fr: { title: "Expérience Gastronomique de Luxe", subtitle: "Cuisine raffinée - Service premium" },
    it: { title: "Esperienza Gastronomica di Lusso", subtitle: "Cucina raffinata - servizio premium" }
  };

  document.querySelector("[data-i18n='title']").innerText = texts[lang].title;
  document.querySelector("[data-i18n='subtitle']").innerText = texts[lang].subtitle;
}
