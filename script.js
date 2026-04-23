// LANGUE
const lang = document.getElementById("lang");

const texts = {
  fr: {
    title: "Expérience Gastronomique de Luxe",
    subtitle: "Saveurs raffinées - ambiance élégante - service premium"
  },
  en: {
    title: "Luxury Gastronomic Experience",
    subtitle: "Refined flavors - elegant ambiance - premium service"
  },
  it: {
    title: "Esperienza Gastronomica di Lusso",
    subtitle: "Sapori raffinati - ambiente elegante - servizio premium"
  }
};

lang.addEventListener("change", () => {
  document.getElementById("title").innerText = texts[lang.value].title;
  document.getElementById("subtitle").innerText = texts[lang.value].subtitle;
});

// RESERVATION WHATSAPP
document.getElementById("form").addEventListener("submit", function(e){
  e.preventDefault();

  let msg = "Nouvelle réservation restaurant";
  let url = "https://wa.me/225000000000?text=" + encodeURIComponent(msg);

  window.open(url, "_blank");
});
