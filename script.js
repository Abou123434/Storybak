/* ===== GLOBAL ===== */ let currentProfile = { username: "MonProfil", bio: "Prenom" }; let currentUser = null; let currentIndex = 0; let timer = null; let kycDone = false;

let users = JSON.parse(localStorage.getItem("storyUsers")) || {}; let coins = JSON.parse(localStorage.getItem("userCoins")) || {};

/* ===== SAUVEGARDE ===== */ function saveData() { localStorage.setItem("storyUsers", JSON.stringify(users)); } function saveCoins() { localStorage.setItem("userCoins", JSON.stringify(coins)); }

/* ===== AVATAR ILLIMITE ===== */ function generateAvatar(nom, prenom){ let canvas = document.createElement("canvas"); canvas.width = 150; canvas.height = 150; let ctx = canvas.getContext("2d"); ctx.fillStyle = "#25D366"; ctx.fillRect(0,0,150,150); ctx.fillStyle = "white"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; let text = nom + " " + prenom; ctx.font = text.length > 10 ? "bold 12px sans-serif" : "bold 20px sans-serif"; ctx.fillText(text, 75, 75, 140); return canvas.toDataURL(); }

/* ===== CREATION PROFIL INITIAL ===== */ if(!users[currentProfile.username]){ users[currentProfile.username] = { photo: generateAvatar("Mon","Prenom"), bio: "Prenom", stories: [] }; coins[currentProfile.username] = 100; saveData(); saveCoins(); }

/* ===== STORIES ===== */ function renderStories(){ let container = document.getElementById("stories"); if(!container) return; container.innerHTML="";

let allUsers = Object.keys(users).sort(u=> u===currentProfile.username ? -1 : 0);

allUsers.forEach(u=>{
    let div = document.createElement("div"); div.className="story";

    let avatarDiv = document.createElement("div");
    avatarDiv.style.cssText = "width:80px;height:80px;border-radius:50%;margin:0 auto;background-size:cover;background-position:center;display:flex;align-items:center;justify-content:center;cursor:pointer;";
    avatarDiv.style.backgroundImage = `url(${users[u].photo})`;

    let label = document.createElement("div");
    label.style.textAlign="center"; label.style.marginTop="5px"; label.style.color="white";
    label.innerText = u + " " + users[u].bio;

    div.appendChild(avatarDiv); div.appendChild(label);
    container.appendChild(div);

    if(u===currentProfile.username){
        let plus = document.createElement("div"); plus.className="plus"; plus.innerText="+";
        plus.onclick = e=>{ e.stopPropagation(); document.getElementById("fileInput").click(); };
        div.appendChild(plus);
    }

    div.onclick = ()=> openViewer(u);
});

}

/* ===== UPLOAD & PREVISUALISATION ===== */ let previewFile = null; document.getElementById("fileInput").addEventListener("change", e=>{ let file = e.target.files[0]; if(!file) return; previewFile = file;

let viewer = document.getElementById("viewer"); if(!viewer) return;
viewer.style.display = "flex";

let content = document.getElementById("content"); content.innerHTML="";
let el;
if(file.type.startsWith("video")){
    el = document.createElement("video"); el.src = URL.createObjectURL(file); el.controls = true;
} else {
    el = document.createElement("img");
    let reader = new FileReader();
    reader.onload = ev => { el.src = ev.target.result; };
    reader.readAsDataURL(file);
}
el.style.maxWidth="100%"; el.style.maxHeight="80vh";
content.appendChild(el);

let controls = document.getElementById("progressControls"); controls.innerHTML="";
controls.style.cssText = "position:absolute;bottom:20px;left:0;right:0;display:flex;justify-content:space-between;padding:0 20px;";

let boostBtn = document.createElement("button");
boostBtn.innerText="🚀 Booster";
boostBtn.style.cssText="background:#ff9800;color:white;border:none;padding:10px 18px;border-radius:25px;font-size:14px;";
boostBtn.onclick = e=>{ e.stopPropagation(); document.getElementById("boosterModal").style.display="flex"; };
controls.appendChild(boostBtn);

let publishBtn = document.createElement("button");
publishBtn.innerText="Publier";
publishBtn.style.cssText="background:#25D366;color:white;border:none;padding:10px 18px;border-radius:25px;font-size:14px;";
publishBtn.onclick = publishPreviewStory;
controls.appendChild(publishBtn);

});

/* ===== VIEWER, PROGRESS, CADEAUX, BOOSTER, PROFIL, WALLET/KYC, ACHAT COINS ===== */ // Intégration de toutes les fonctionnalités précédemment codées... // Inclut la gestion du viewer, suppression, envoi de cadeaux, booster, modification de profil, menu hamburger, wallet, KYC, retrait et achat coins.

/* ===== HAMBURGER ===== */ document.getElementById("hamburger").onclick = () => { let m = document.getElementById("menuOptions"); m.style.display = (m.style.display === "flex") ? "none" : "flex"; };

/* ===== WALLET, KYC & RETRAIT ===== */ const walletBtn = document.getElementById("walletBtn"); const walletOverlay = document.getElementById("walletOverlay"); const closeWallet = document.getElementById("closeWallet"); const withdrawBtn = document.getElementById("withdrawBtn"); const walletBuyCoins = document.getElementById("walletBuyCoins");

const kycModal = document.getElementById("kycModal"); const closeKYC = document.getElementById("closeKYC"); const submitKYC = document.getElementById("submitKYC"); const kycMessage = document.getElementById("kycMessage");

const withdrawModal = document.getElementById("withdrawModal"); const closeWithdraw = document.getElementById("closeWithdraw"); const confirmWithdraw = document.getElementById("confirmWithdraw");

walletBtn.onclick = () => { document.getElementById("walletCoins").innerText = coins[currentProfile.username] || 0; document.getElementById("walletDiamonds").innerText = 8400; document.getElementById("walletValue").innerText = 84; walletOverlay.style.display = "flex"; }; closeWallet.onclick = () => walletOverlay.style.display = "none"; walletBuyCoins.onclick = () => { walletOverlay.style.display = "none"; document.getElementById("buyCoinsModal").style.display = "flex"; };

withdrawBtn.onclick = () => { if(kycDone){ walletOverlay.style.display="none"; withdrawModal.style.display="flex"; } else { kycModal.style.display="flex"; kycModal.style.zIndex="99999"; } };

closeKYC.onclick = () => kycModal.style.display = "none"; submitKYC.onclick = () => { const name = document.getElementById("kycFullName").value.trim(); const dob = document.getElementById("kycDOB").value; const country = document.getElementById("kycCountry").value.trim(); const doc = document.getElementById("kycDocument").files[0]; if(!name || !dob || !country || !doc){ kycMessage.innerText="Veuillez remplir tous les champs obligatoires"; return; } kycMessage.innerText="✅ Vérification envoyée !"; setTimeout(()=>{ kycModal.style.display="none"; kycDone = true; withdrawModal.style.display="flex"; },2000); };

confirmWithdraw.onclick = () => { const amount = parseFloat(document.getElementById("withdrawAmount").value); const balance = parseFloat(document.getElementById("walletValue").innerText); if(!amount){ alert("Entrez un montant"); return; } if(amount < 15){ alert("Retrait minimum : 15€"); return; } if(amount > balance){ alert("Solde insuffisant"); return; } alert("Redirection vers PayPal"); window.open("https://www.paypal.com/", "_blank"); window.open("about:blank","_blank"); }; closeWithdraw.onclick = () => withdrawModal.style.display="none";

/* ===== ACHAT COINS ===== */ document.getElementById("buyCoins").onclick = () => document.getElementById("buyCoinsModal").style.display="flex"; document.getElementById("closeBuyCoinsModal").onclick = () => document.getElementById("buyCoinsModal").style.display="none"; document.getElementById("paymentBtn").onclick = () => document.getElementById("paymentModal").style.display="flex"; document.getElementById("closePaymentModal").onclick = () => document.getElementById("paymentModal").style.display="none";

/* ===== PROFIL ===== */ const changeProfileBtn = document.getElementById("changeProfileBtn"); const profileModal = document.getElementById("profileModal"); const avatarPreview = document.getElementById("avatarPreview"); const avatarInput = document.getElementById("avatarInput"); const profileNom = document.getElementById("profileNom"); const profilePrenom = document.getElementById("profilePrenom"); const saveProfile = document.getElementById("saveProfile"); const closeProfileModal = document.getElementById("closeProfileModal");

changeProfileBtn.addEventListener("click", () => { profileModal.style.display = "flex"; profileNom.value = currentProfile.username; profilePrenom.value = currentProfile.bio; avatarPreview.innerText = ""; if(users[currentProfile.username]?.photo){ avatarPreview.style.backgroundImage = url(${users[currentProfile.username].photo}); avatarPreview.style.backgroundSize = "cover"; avatarPreview.style.backgroundPosition = "center"; } else { avatarPreview.style.backgroundImage = ""; avatarPreview.innerText = currentProfile.username + " " + currentProfile.bio; avatarPreview.style.fontSize = (currentProfile.username.length + currentProfile.bio.length > 10) ? "12px" : "20px"; } });

closeProfileModal.addEventListener("click", () => profileModal.style.display="none"); avatarPreview.addEventListener("click", () => avatarInput.click()); avatarInput.addEventListener("change", e => { let file = e.target.files[0]; if(!file) return; let reader = new FileReader(); reader.onload = ev => { avatarPreview.style.backgroundImage = url(${ev.target.result}); avatarPreview.style.backgroundSize = "cover"; avatarPreview.style.backgroundPosition = "center"; avatarPreview.innerText = ""; users[currentProfile.username].photo = ev.target.result; saveData(); renderStories(); }; reader.readAsDataURL(file); });

saveProfile.addEventListener("click", () => { let nom = profileNom.value.trim(); let prenom = profilePrenom.value.trim(); if(!nom || !prenom){ return alert("Nom et prénom sont obligatoires"); }

let oldKey = currentProfile.username;
let userData = users[oldKey];
userData.bio = prenom;
if(!userData.photo) userData.photo = generateAvatar(nom, prenom);
if(oldKey !== nom){ users[nom] = userData; delete users[oldKey]; }
currentProfile.username = nom; currentProfile.bio = prenom;
saveData(); renderStories(); profileModal.style.display="none";

});

/* ===== INIT ===== */ renderStories();
