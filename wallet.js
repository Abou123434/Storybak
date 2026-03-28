/* ===== GLOBAL ===== */
let currentProfile = { username: "MonProfil", bio: "Prenom" };
let currentUser = null;
let currentIndex = 0;
let timer = null;
let kycDone = false;

let users = JSON.parse(localStorage.getItem("storyUsers")) || {};
let coins = JSON.parse(localStorage.getItem("userCoins")) || {};

/* ===== SAUVEGARDE ===== */
function saveData() { localStorage.setItem("storyUsers", JSON.stringify(users)); }
function saveCoins() { localStorage.setItem("userCoins", JSON.stringify(coins)); }

/* ===== AVATAR ILLIMITE ===== */
function generateAvatar(nom, prenom){
    let canvas = document.createElement("canvas");
    canvas.width = 150; canvas.height = 150;
    let ctx = canvas.getContext("2d");
    ctx.fillStyle = "#25D366";
    ctx.fillRect(0,0,150,150);
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    let text = nom + " " + prenom;
    ctx.font = text.length > 10 ? "bold 12px sans-serif" : "bold 20px sans-serif";
    ctx.fillText(text, 75, 75, 140);
    return canvas.toDataURL();
}

/* ===== CREATION PROFIL INITIAL ===== */
if(!users[currentProfile.username]){
    users[currentProfile.username] = { photo: generateAvatar("Mon","Prenom"), bio: "Prenom", stories: [] };
    coins[currentProfile.username] = 100;
    saveData(); saveCoins();
}


/* ===== ACHAT COINS ===== */
document.getElementById("buyCoins").onclick=()=>document.getElementById("buyCoinsModal").style.display="flex";
function closeBuy(){ document.getElementById("buyCoinsModal").style.display="none"; }
function openPayment(){ document.getElementById("paymentModal").style.display="flex"; }
function closePayment(){ document.getElementById("paymentModal").style.display="none"; }
function openBlank(){ window.open("about:blank","_blank"); }
};

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


document.addEventListener("DOMContentLoaded", () => {

/* ===== CHANGER PROFIL ===== */
const changeProfileBtn = document.getElementById("changeProfileBtn");

if(!changeProfileBtn){
    console.error("Bouton changeProfileBtn introuvable");
    return;
}

if(!document.getElementById("profileModal")){
    let modal = document.createElement("div");
    modal.id="profileModal";
    modal.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,0.9);display:none;justify-content:center;align-items:center;z-index:9999;";
    modal.innerHTML= `
        <div style="background:#111;padding:25px;border-radius:15px;text-align:center;color:white;max-width:300px;width:90%;">
            <h3>Modifier le profil</h3>
            <div id="avatarPreview" style="width:80px;height:80px;border-radius:50%;margin:0 auto;background:#25D366;display:flex;align-items:center;justify-content:center;font-size:20px;cursor:pointer;"></div>
            <input type="file" id="avatarInput" hidden>
            <br><br>
            <input type="text" id="profileNom" placeholder="Nom" style="margin-bottom:10px;width:90%;"><br>
            <input type="text" id="profilePrenom" placeholder="Prénom" style="margin-bottom:10px;width:90%;"><br>
            <button id="saveProfile" class="green-btn">Sauvegarder</button>
            <button id="closeProfileModal" class="red-btn">Fermer</button>
        </div>
    `;
    document.body.appendChild(modal);
}

const profileModal = document.getElementById("profileModal");
const avatarPreview = document.getElementById("avatarPreview");
const avatarInput = document.getElementById("avatarInput");
const profileNom = document.getElementById("profileNom");
const profilePrenom = document.getElementById("profilePrenom");
const saveProfile = document.getElementById("saveProfile");
const closeProfileModal = document.getElementById("closeProfileModal");


// 🔥 OUVRIR MODAL
changeProfileBtn.addEventListener("click", ()=>{
    console.log("CLICK OK"); // pour tester

    profileModal.style.display = "flex";
    profileNom.value = currentProfile.username;
    profilePrenom.value = currentProfile.bio;
});

// 🔥 FERMER MODAL
closeProfileModal.addEventListener("click", ()=> profileModal.style.display="none");

});
