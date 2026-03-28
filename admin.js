// ===== ADMIN PANEL =====

// ouvrir admin
document.getElementById("adminBtn").onclick = () => {
  document.getElementById("adminPanel").style.display = "flex";
};

// fermer admin
function closeAdmin(){
  document.getElementById("adminPanel").style.display = "none";
}

// ===== MODAL PUBLICATION =====
function openGlobalPublish(){
  document.getElementById("publishModal").style.display = "flex";
}

function closePublish(){
  document.getElementById("publishModal").style.display = "none";
}

// ouvrir galerie
function selectFile(){
  document.getElementById("fileInput").click();
}

// attendre que le DOM soit chargé
document.addEventListener("DOMContentLoaded", () => {

  const fileInput = document.getElementById("fileInput");

  if(fileInput){
    fileInput.addEventListener("change", function(){
      const file = this.files[0];
      const preview = document.getElementById("preview");

      preview.innerHTML = "";

      if(file){
        const url = URL.createObjectURL(file);

        if(file.type.startsWith("image")){
          preview.innerHTML = `<img src="${url}" style="width:100%; border-radius:10px;">`;
        }
        else if(file.type.startsWith("video")){
          preview.innerHTML = `
            <video controls style="width:100%; border-radius:10px;">
              <source src="${url}">
            </video>`;
        }
      }
    });
  }

});

// publier
function publishPost(){
  alert("Publication envoyée 🚀");
}

// ===== PAGE KYC =====
function openKYCPage(){
  document.getElementById("kycPage").style.display = "block";
}

function closeKYCPage(){
  document.getElementById("kycPage").style.display = "none";
}

function acceptKYC(){
  document.getElementById("kycStatus").innerText = "✅ KYC accepté";
}

function refuseKYC(){
  document.getElementById("kycStatus").innerText = "❌ KYC refusé";
}

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

function openUsersPage(){
  document.getElementById("usersPage").style.display = "flex";
}

function closeUsersPage(){
  document.getElementById("usersPage").style.display = "none";
}

function openReportsPage() {
  document.getElementById("reportsPage").style.display = "flex";
}

function closeReportsPage() {
  document.getElementById("reportsPage").style.display = "none";
}
function openStatsPage() {
  document.getElementById("statsPage").style.display = "flex";

  // 🔥 Simulation (plus tard Django va remplacer ça)
  document.getElementById("usersCount").innerText = 120;
  document.getElementById("storiesCount").innerText = 45;
  document.getElementById("visitorsCount").innerText = 300;
  document.getElementById("coinsBought").innerText = 80;
  document.getElementById("withdrawCount").innerText = 10;
  document.getElementById("giftsCount").innerText = 60;
}

function closeStatsPage() {
  document.getElementById("statsPage").style.display = "none";
                }

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

document.addEventListener("DOMContentLoaded", () => {

// ===== MODAL RETRAIT =====
const withdrawModal = document.getElementById("withdrawModal");
const withdrawInput = document.getElementById("withdrawAmount");
const confirmWithdrawBtn = document.getElementById("confirmWithdrawBtn");

let balance = 0;

// ouvrir modal
window.openWithdraw = function(){
  withdrawModal.style.display = "flex";
}

// fermer modal
window.closeWithdraw = function(){
  withdrawModal.style.display = "none";
  withdrawInput.value = "";
}

// fermer si clique dehors
window.addEventListener("click", (e)=>{
  if(e.target === withdrawModal){
    closeWithdraw();
  }
});

// confirmer retrait
confirmWithdrawBtn.addEventListener("click", ()=>{

  let amount = parseFloat(withdrawInput.value);

  if(!amount || amount <= 0){
    alert("Entre un montant valide");
    return;
  }

  if(amount > balance){
    alert("Solde insuffisant");
    return;
  }

  balance -= amount;
  alert("Retrait demandé ✅\nMontant: " + amount + "€");

  closeWithdraw();
});

});
