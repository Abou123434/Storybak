function sendReservation(e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;
  const people = document.getElementById("people").value;
  const message = document.getElementById("message").value;

  const text =
`Bonjour, réservation :

Nom: ${name}
Date: ${date}
Heure: ${time}
Personnes: ${people}
Message: ${message}`;

  const phone = "225XXXXXXXXX";

  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank");
}

function openWA() {
  const phone = "225XXXXXXXXX";
  window.open(`https://wa.me/${phone}`, "_blank");
}

function openMail() {
  window.location.href = "mailto:restaurant@gmail.com?subject=Réservation";
}

function changeLang() {
  const lang = document.getElementById("lang").value;

  if (lang === "en") {
    document.getElementById("title").innerText = "Luxury Restaurant";
  }

  if (lang === "it") {
    document.getElementById("title").innerText = "Ristorante di Lusso";
  }

  if (lang === "fr") {
    document.getElementById("title").innerText = "Restaurant Gastronomique";
  }
}
