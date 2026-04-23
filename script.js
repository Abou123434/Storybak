document.getElementById("resForm").addEventListener("submit", function(e){
  e.preventDefault();

  let name = document.getElementById("name").value;
  let phone = document.getElementById("phone").value;
  let date = document.getElementById("date").value;
  let time = document.getElementById("time").value;
  let people = document.getElementById("people").value;
  let message = document.getElementById("message").value;

  let text = `Bonjour, je souhaite réserver une table:%0A
Nom: ${name}%0A
Téléphone: ${phone}%0A
Date: ${date}%0A
Heure: ${time}%0A
Personnes: ${people}%0A
Message: ${message}`;

  let whatsappURL = `https://wa.me/225000000000?text=${text}`;

  window.open(whatsappURL, "_blank");
});
