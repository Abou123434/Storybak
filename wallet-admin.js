// Ouvrir le modal
function openBalance(){
  const modal = document.getElementById("balanceModal");
  modal.style.display = "flex"; // mieux que block pour centrer
}

// Fermer le modal
function closeBalance(){
  const modal = document.getElementById("balanceModal");
  modal.style.display = "none";
}

// Fermer si on clique en dehors du contenu
window.onclick = function(event){
  const modal = document.getElementById("balanceModal");
  if(event.target === modal){
    modal.style.display = "none";
  }
}

// Bouton retirer (temporaire)
function openWithdraw(){
  alert("Fonction retrait bientôt disponible 💰");
}
