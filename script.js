function wa(plat){
  window.open("https://wa.me/22500000000?text=Je%20veux%20réserver%20:%20" + plat);
}

// Langue simple (demo)
document.getElementById("lang").addEventListener("change", function(){
  let lang = this.value;

  if(lang === "en"){
    document.getElementById("title").innerText = "Luxury Restaurant in Ivory Coast";
    document.getElementById("subtitle").innerText = "Premium dining experience";
  }

  if(lang === "it"){
    document.getElementById("title").innerText = "Ristorante di lusso in Costa d'Avorio";
    document.getElementById("subtitle").innerText = "Esperienza gastronomica premium";
  }

  if(lang === "fr"){
    location.reload();
  }
});

// reservation
document.getElementById("resForm").addEventListener("submit", function(e){
  e.preventDefault();
  alert("Réservation envoyée avec succès !");
});
