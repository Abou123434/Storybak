// ===== ADMIN PANEL =====

// ouvrir admin
document.getElementById("adminBtn").onclick = () => {
  document.getElementById("adminPanel").style.display = "flex";
};

// fermer admin
function closeAdmin(){
  document.getElementById("adminPanel").style.display = "none";
}

