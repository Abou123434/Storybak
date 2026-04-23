function changeLang() {
  const lang = document.getElementById("lang").value;

  if (lang === "en") {
    document.getElementById("title").innerText = "Luxury Restaurant";
    document.getElementById("subtitle").innerText = "Fine dining experience in Ivory Coast";
  }

  if (lang === "it") {
    document.getElementById("title").innerText = "Ristorante di lusso";
    document.getElementById("subtitle").innerText = "Esperienza gastronomica in Costa d'Avorio";
  }

  if (lang === "fr") {
    document.getElementById("title").innerText = "Restaurant Gastronomique";
    document.getElementById("subtitle").innerText = "Expérience culinaire de luxe en Côte d'Ivoire";
  }
}
