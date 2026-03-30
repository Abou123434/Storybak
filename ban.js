function openBanPage(){
  document.getElementById("banPage").style.display = "flex";
}
function closeBanPage(){
  document.getElementById("banPage").style.display = "none";
}

function confirmBan(){
  let email = document.getElementById("banEmail").value;
  let reason = document.getElementById("banReason").value;

  alert("Utilisateur " + email + " banni pour : " + reason);

  closeBanPage();
}

