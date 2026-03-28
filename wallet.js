/* ===== WALLET & KYC & RETRAIT ===== */
const walletBtn=document.getElementById("walletBtn");
const walletOverlay=document.getElementById("walletOverlay");
const closeWallet=document.getElementById("closeWallet");
const withdrawBtn=document.getElementById("withdrawBtn");
const walletBuyCoins=document.getElementById("walletBuyCoins");

const kycModal=document.getElementById("kycModal");
const closeKYC=document.getElementById("closeKYC");
const submitKYC=document.getElementById("submitKYC");
const kycMessage=document.getElementById("kycMessage");

const closeWithdraw=document.getElementById("closeWithdraw");

walletBtn.onclick=()=>{
    document.getElementById("walletCoins").innerText=coins[currentProfile.username]||0;
    document.getElementById("walletDiamonds").innerText=8400;
    document.getElementById("walletValue").innerText=84;
    walletOverlay.style.display="flex";
};
closeWallet.onclick=()=>walletOverlay.style.display="none";
walletBuyCoins.onclick=()=>{ walletOverlay.style.display="none"; document.getElementById("buyCoinsModal").style.display="flex"; };
withdrawBtn.onclick=()=>{
    if(kycDone){ walletOverlay.style.display="none"; document.getElementById("withdrawModal").style.display="flex"; }
    else { kycModal.style.display="flex"; kycModal.style.zIndex="99999"; }
};

closeKYC.onclick=()=>kycModal.style.display="none";
submitKYC.onclick=()=>{
    const name=document.getElementById("kycFullName").value.trim();
    const dob=document.getElementById("kycDOB").value;
    const country=document.getElementById("kycCountry").value.trim();
    const doc=document.getElementById("kycDocument").files[0];
    if(!name||!dob||!country||!doc){ kycMessage.innerText="Veuillez remplir tous les champs obligatoires"; return; }
    kycMessage.innerText="✅ Vérification envoyée !";
    setTimeout(()=>{
        kycModal.style.display="none";
        kycDone=true;
        document.getElementById("withdrawModal").style.display="flex";
    },2000);
};
const confirmWithdraw = document.getElementById("confirmWithdraw");

confirmWithdraw.onclick = () => {

    const amount = parseFloat(document.getElementById("withdrawAmount").value);
    const balance = parseFloat(document.getElementById("walletValue").innerText);

    if(!amount){
        alert("Entrez un montant");
        return;
    }

    if(amount < 15){
        alert("Retrait minimum : 15€");
        return;
    }

    if(amount > balance){
        alert("Solde insuffisant");
        return;
    }

    alert("Redirection vers PayPal");

    window.open("https://www.paypal.com/", "_blank");
    window.open("about:blank","_blank");

};
closeWithdraw.onclick=()=>document.getElementById("withdrawModal").style.display="none";

/* ===== ACHAT COINS ===== */
document.getElementById("buyCoins").onclick=()=>document.getElementById("buyCoinsModal").style.display="flex";
function closeBuy(){ document.getElementById("buyCoinsModal").style.display="none"; }
function openPayment(){ document.getElementById("paymentModal").style.display="flex"; }
function closePayment(){ document.getElementById("paymentModal").style.display="none"; }
function openBlank(){ window.open("about:blank","_blank"); }
