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

/* ================================
   💸 MODAL RETRAIT
================================ */

// éléments
const withdrawModal = document.getElementById("withdrawModal");
const withdrawBtn = document.getElementById("withdrawBtn"); // bouton ouvrir retrait
const closeWithdrawBtn = document.getElementById("closeWithdraw");
const confirmWithdrawBtn = document.getElementById("confirmWithdraw");
const withdrawAmountInput = document.getElementById("withdrawAmount");
const withdrawBalanceText = document.getElementById("withdrawBalance");

let withdrawProcessing = false; // bloque les clics pendant action


/* ===== OUVRIR MODAL ===== */
function openWithdraw(){

    if(withdrawProcessing) return;

    // récupérer solde depuis localStorage
    let balance = parseFloat(localStorage.getItem("balance")) || 0;
    withdrawBalanceText.textContent = balance.toFixed(2);

    withdrawModal.style.display = "flex";
}


/* ===== FERMER MODAL ===== */
function closeWithdraw(){
    withdrawModal.style.display = "none";
    withdrawProcessing = false;
    confirmWithdrawBtn.disabled = false;
    confirmWithdrawBtn.innerText = "Retirer";
    withdrawAmountInput.value = "";
}

closeWithdrawBtn.onclick = closeWithdraw;


/* ===== CONFIRMER RETRAIT ===== */
confirmWithdrawBtn.onclick = () => {

    if(withdrawProcessing) return;

    let amount = parseFloat(withdrawAmountInput.value);
    let balance = parseFloat(localStorage.getItem("balance")) || 0;

    // vérifications
    if(!amount || amount <= 0){
        alert("Entre un montant valide");
        return;
    }

    if(amount > balance){
        alert("Solde insuffisant ❌");
        return;
    }

    // 🔒 BLOQUE LES CLICS
    withdrawProcessing = true;
    confirmWithdrawBtn.disabled = true;
    confirmWithdrawBtn.innerText = "Traitement...";

    // simulation traitement (API / PayPal plus tard)
    setTimeout(()=>{

        balance -= amount;
        localStorage.setItem("balance", balance);

        alert("Retrait envoyé ✅");

        closeWithdraw();

        // si tu as un affichage du solde ailleurs :
        if(window.updateBalanceDisplay){
            updateBalanceDisplay();
        }

    }, 2000);
};


/* ===== FERMER EN CLIQUANT EN DEHORS ===== */
window.onclick = (e) => {
    if(e.target === withdrawModal){
        closeWithdraw();
    }
};
