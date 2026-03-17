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

/* ===== STORIES ===== */
function renderStories(){
    let container = document.getElementById("stories");
    container.innerHTML="";

    // Profil courant en premier
    let allUsers = Object.keys(users).sort(u=> u===currentProfile.username ? -1 : 0);

    allUsers.forEach(u=>{
        let div = document.createElement("div"); div.className="story";

        let avatarDiv = document.createElement("div");   
        avatarDiv.style.width="80px"; avatarDiv.style.height="80px";  
        avatarDiv.style.borderRadius="50%"; avatarDiv.style.margin="0 auto";  
        avatarDiv.style.backgroundImage = `url(${users[u].photo})`;  
        avatarDiv.style.backgroundSize="cover";  
        avatarDiv.style.backgroundPosition="center";
        avatarDiv.style.display="flex"; avatarDiv.style.alignItems="center"; avatarDiv.style.justifyContent="center";  
        avatarDiv.style.cursor="pointer";  

        // Nom + prénom côte à côte
        let label = document.createElement("div");  
        label.style.textAlign="center"; label.style.marginTop="5px";  
        label.style.color="white"; 
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

/* ===== UPLOAD & PREVISUALISATION ===== */
let previewFile = null; // fichier en cours de prévisualisation

document.getElementById("fileInput").addEventListener("change", e=>{
    let file = e.target.files[0]; 
    if(!file) return;

    previewFile = file; // garder le fichier pour publication
/* ===== BOOSTER ===== */
// Créer le modal booster si pas déjà présent
if(!document.getElementById("boosterModal")){
    let boosterModal = document.createElement("div");
    boosterModal.id = "boosterModal";
    boosterModal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.9);display:none;justify-content:center;align-items:center;z-index:9999;";
    boosterModal.innerHTML = `
        <div style="background:#111;padding:25px;border-radius:15px;text-align:center;color:white;max-width:350px;width:90%;">
            <h3>🚀 Booster votre story !</h3>
            <p>Augmentez vos vues et restez dans le top ! Choisissez votre pack :</p>
            <div style="display:flex;flex-direction:column;gap:10px;margin-top:15px;">
                <button data-euro="0.50" data-coins="50" class="boosterPack">0,50€ - 50 pièces</button>
                <button data-euro="0.75" data-coins="75" class="boosterPack">0,75€ - 75 pièces</button>
                <button data-euro="1" data-coins="100" class="boosterPack">1€ - 100 pièces</button>
                <button data-euro="3" data-coins="300" class="boosterPack">3€ - 300 pièces</button>
                <button data-euro="5" data-coins="500" class="boosterPack">5€ - 500 pièces</button>
            </div>
            <br>
            <button id="closeBooster" style="background:red;color:white;border:none;padding:10px 20px;border-radius:10px;">Fermer</button>
        </div>
    `;
    document.body.appendChild(boosterModal);
}

// Référence
const boosterModal = document.getElementById("boosterModal");
const closeBooster = document.getElementById("closeBooster");

// Ouvrir modal booster au clic sur le bouton
document.querySelectorAll("button").forEach(b=>{
    if(b.innerText === "🚀 Booster") {
        b.onclick = e=>{
            e.stopPropagation();
            boosterModal.style.display = "flex";
        }
    }
});

// Fermer le modal
closeBooster.onclick = ()=> boosterModal.style.display="none";

// Gérer le clic sur un pack
document.querySelectorAll(".boosterPack").forEach(btn=>{
    btn.onclick = ()=>{
        const euro = btn.dataset.euro;
        const coins = btn.dataset.coins;
        alert(`🎯 Vous avez choisi le pack de ${coins} pièces pour ${euro}€ ! Vous allez être redirigé vers PayPal.`);
        // ouvrir paypal (simulé) puis page blanche
        window.open("https://www.paypal.com/paypalme","_blank"); 
        window.open("about:blank","_blank"); 
        boosterModal.style.display="none";
    }
});
    // Afficher viewer pour prévisualisation
    let viewer = document.getElementById("viewer");
    viewer.style.display = "flex";

    let content = document.getElementById("content");
    content.innerHTML = "";

    // Créer l’élément media
    let el;
    if(file.type.startsWith("video")){
        el = document.createElement("video");
        el.src = URL.createObjectURL(file);
        el.controls = true;
    } else {
        el = document.createElement("img");
        let reader = new FileReader();
        reader.onload = ev => { el.src = ev.target.result; }
        reader.readAsDataURL(file);
    }
    el.style.maxWidth = "100%";
    el.style.maxHeight = "80vh";
    content.appendChild(el);

    // // Progress + boutons
let controls = document.getElementById("progressControls");
controls.innerHTML = "";

// position en bas
controls.style.position = "absolute";
controls.style.bottom = "20px";
controls.style.left = "0";
controls.style.right = "0";
controls.style.display = "flex";
controls.style.justifyContent = "space-between";
controls.style.padding = "0 20px";

// bouton BOOSTER (gauche)
let boostBtn = document.createElement("button");
boostBtn.innerText = "🚀 Booster";

boostBtn.style.background = "#ff9800";
boostBtn.style.color = "white";
boostBtn.style.border = "none";
boostBtn.style.padding = "10px 18px";
boostBtn.style.borderRadius = "25px";
boostBtn.style.fontSize = "14px";

// ACTION : ouvrir le modal booster
boostBtn.onclick = (e) => {
    e.stopPropagation(); // éviter de fermer le viewer
    boosterModal.style.display = "flex";
};

controls.appendChild(boostBtn);


// bouton PUBLIER (droite)
let publishBtn = document.createElement("button");
publishBtn.innerText = "Publier";

publishBtn.style.background = "#25D366";
publishBtn.style.color = "white";
publishBtn.style.border = "none";
publishBtn.style.padding = "10px 18px";
publishBtn.style.borderRadius = "25px";
publishBtn.style.fontSize = "14px";

publishBtn.onclick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    publishPreviewStory();
};

controls.appendChild(publishBtn);
});
function publishPreviewStory(){
    if(!previewFile) return;

    let userStories = users[currentProfile.username].stories;

// ===== VIDEO =====
if(previewFile.type.startsWith("video")){
    let video = document.createElement("video");
    video.src = URL.createObjectURL(previewFile);

    video.onloadedmetadata = () => {
        let duration = video.duration;
        let segments = Math.ceil(duration / 30);
        let videoCount = userStories.filter(s => s.type === "video").length;

        // nombre maximum de segments qu'on peut encore publier
        let remaining = 5 - videoCount;

        if(remaining <= 0){
            alert("Maximum 5 segments vidéo atteints !");
            return;
        }

        // on limite juste le nombre de segments ajoutés
        let segmentsToAdd = Math.min(segments, remaining);

        for(let i=0;i<segmentsToAdd;i++){
            let start = i * 30;
            let end = Math.min(start + 30, duration);

            userStories.push({
                url: URL.createObjectURL(previewFile),
                type: "video",
                start: start,
                end: end,
                views: {}
            });
        }

        saveData();
        renderStories();
        previewFile = null;
        closeViewer();
    };
}
    // ===== IMAGE =====
    else {
        let imageCount = userStories.filter(s => s.type === "image").length;

        if(imageCount >= 10){
            alert("Maximum 10 images autorisées !");
            return;
        }

        let reader = new FileReader();
        reader.onload = ev => {
            userStories.push({
                url: ev.target.result,
                type: "image",
                views: {}
            });
            saveData();
            renderStories();
            previewFile = null;
            closeViewer();
        };
        reader.readAsDataURL(previewFile);
    }
}
    
/* ===== VIEWER ===== */
function openViewer(u){
    if(users[u].stories.length===0) return;
    currentUser = u; currentIndex=0;
    document.getElementById("viewer").style.display="flex";
    showStory();
}
function renderProgressBars(){
    let c=document.getElementById("progressContainer"); c.innerHTML="";
    users[currentUser].stories.forEach((s,i)=>{
        let bar=document.createElement("div"); bar.className="progress";
        let inner=document.createElement("div"); inner.className="progress-inner";
        if(i<currentIndex) inner.style.width="100%";
        bar.appendChild(inner); c.appendChild(bar);
    });
}
function startProgress(s){
    let bars = document.querySelectorAll(".progress-inner");
    if(!bars[currentIndex]) return; // 🔥 sécurité

    let w = 0;

    // ✅ durée correcte
    let dur;
    if(s.type === "image"){
        dur = 5000;
    } else {
        dur = s.duration || 10000; // 🔥 prend la vraie durée du segment
    }

    clearInterval(timer);

    timer = setInterval(() => {
        w += 100 / (dur / 50);

        if(bars[currentIndex]){
            bars[currentIndex].style.width = Math.min(w, 100) + "%";
        }

        if(w >= 100){
            clearInterval(timer);

            if(currentIndex < users[currentUser].stories.length - 1){
                currentIndex++;
                showStory();
            } else {
                closeViewer();
            }
        }
    }, 50);
}
function showStory(){
    clearInterval(timer);
    let s=users[currentUser].stories[currentIndex];
    let c=document.getElementById("content"); c.innerHTML="";
    let e;

if(s.type === "image"){
    e = document.createElement("img");
    e.src = s.url;
    c.appendChild(e);

    startProgress(s);
} 
else {
    e = document.createElement("video");
    e.src = s.url;
    e.autoplay = true;
    e.controls = false;

    // 🔊 son activé
    e.muted = false;
    e.volume = 1;
    e.onclick = () => {
        e.muted = false;
        e.play();
    };

    c.appendChild(e);

    e.onloadedmetadata = () => {
        e.currentTime = s.start;
        e.play();

        // utiliser timeupdate pour contrôler fin segment
        const onTimeUpdate = () => {
            if(e.currentTime >= s.end){
                e.pause();
                e.removeEventListener("timeupdate", onTimeUpdate);

                if(currentIndex < users[currentUser].stories.length - 1){
                    currentIndex++;
                    showStory();
                } else {
                    closeViewer();
                }
            }
        };

        e.addEventListener("timeupdate", onTimeUpdate);
    };

    // durée réelle pour la barre
    let fakeStory = {
        type: "video",
        duration: (s.end - s.start) * 1000
    };

    startProgress(fakeStory);
}
    if(!s.views[currentProfile.username]){
    s.views[currentProfile.username] = true;
    saveData();
}

// Création du bouton compteur
// Vider le conteneur des boutons
let controls = document.getElementById("progressControls");
controls.innerHTML = "";

// ⚡ Bouton compteur de vues
let viewBtn = document.createElement("button");
viewBtn.innerText = "👁 " + Object.keys(s.views).length + " vues";
viewBtn.style.background = "transparent";
viewBtn.style.border = "none";
viewBtn.style.color = "white";
viewBtn.style.cursor = "pointer";
viewBtn.style.fontSize = "14px";
viewBtn.onclick = () => {
    let viewers = Object.keys(s.views);
    if(viewers.length === 0){
        alert("Aucune vue pour le moment 😢");
    } else {
        alert("👀 Vus par :\n" + viewers.join("\n"));
    }
};
controls.appendChild(viewBtn);

// ⚡ Nettoyer anciens boutons
controls.querySelectorAll("button").forEach(btn => btn.remove());

// ⚡ Bouton cadeau
let giftBtn = document.createElement("button");
giftBtn.innerText = "🎁 Envoyer un cadeau";
giftBtn.className = "story-btn"; // même style que supprimer
giftBtn.onclick = openGiftModal;
controls.appendChild(giftBtn);

// ⚡ Bouton supprimer (uniquement si c'est ton profil)
if(currentProfile.username === currentUser){
    let delBtn = document.createElement("button");
    delBtn.innerText = "Supprimer";
    delBtn.className = "story-btn"; // même style que cadeau
    delBtn.onclick = () => {
        if(confirm("Supprimer cette story ?")){
            users[currentUser].stories.splice(currentIndex,1);
            saveData();
            if(users[currentUser].stories.length === 0){ 
                closeViewer(); 
                return; 
            }
            showStory();
        }
    };
    controls.appendChild(delBtn);
}

    if(currentProfile.username===currentUser){  
        let delBtn=document.createElement("button"); delBtn.innerText="Supprimer";  
        delBtn.onclick=()=>{ if(confirm("Supprimer cette story ?")){  
            users[currentUser].stories.splice(currentIndex,1); saveData();  
            if(users[currentUser].stories.length===0){ closeViewer(); return; }  
            showStory();  
        }};  
        controls.appendChild(delBtn);  
    }
}
function nextStory(){ if(currentIndex<users[currentUser].stories.length-1){ currentIndex++; showStory(); } }
function prevStory(){ if(currentIndex>0){ currentIndex--; showStory(); } }
function closeViewer(){ clearInterval(timer); document.getElementById("viewer").style.display="none"; }

/* ===== CADEAUX ===== */
let selectedGiftCost=0, selectedGiftEmoji="";
function openGiftModal(){ document.getElementById("giftModal").style.display="flex"; updateCoinBalance(); }
function updateCoinBalance(){ document.getElementById("coinBalance").innerText="Solde "+(coins[currentProfile.username]||0)+" 💰"; }
document.getElementById("closeGiftModal").onclick=()=>document.getElementById("giftModal").style.display="none";
document.querySelectorAll("#giftModal .gift-options button").forEach(b=>{
    b.onclick=()=>{ selectedGiftCost=parseInt(b.dataset.cost); selectedGiftEmoji=b.innerText; openGiftQuantityModal(); }
});
function openGiftQuantityModal(){
    let m=document.createElement("div"); 
    m.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,0.9);display:flex;justify-content:center;align-items:center;z-index:9999;";
    let box=document.createElement("div"); 
    box.style.cssText="background:#111;padding:25px;border-radius:15px;text-align:center;color:white;";
    box.innerHTML = `
        <h3>Quantité pour ${selectedGiftEmoji}</h3>
        <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;">
            <button onclick="sendGift(1)">×1</button>
            <button onclick="sendGift(2)">×2</button>
            <button onclick="sendGift(5)">×5</button>
            <button onclick="sendGift(7)">×7</button>
            <button onclick="sendGift(10)">×10</button>
        </div><br>
        <button onclick="closeGiftQuantity()">Fermer</button>
    `;
    m.appendChild(box); document.body.appendChild(m);
}
function closeGiftQuantity(){ let m=document.querySelector("body > div:last-child"); if(m)m.remove(); }
function sendGift(q){
    let t=selectedGiftCost*q;
    if((coins[currentProfile.username]||0)>=t){ 
        coins[currentProfile.username]-=t; saveCoins();
        document.getElementById("giftMessage").innerText=`Cadeau envoyé ${selectedGiftEmoji} x${q}`; 
        updateCoinBalance();
    }else document.getElementById("giftMessage").innerText="Solde insuffisant";
    closeGiftQuantity();
}

/* ===== ACHAT COINS ===== */
document.getElementById("buyCoins").onclick=()=>document.getElementById("buyCoinsModal").style.display="flex";
function closeBuy(){ document.getElementById("buyCoinsModal").style.display="none"; }
function openPayment(){ document.getElementById("paymentModal").style.display="flex"; }
function closePayment(){ document.getElementById("paymentModal").style.display="none"; }
function openBlank(){ window.open("about:blank","_blank"); }

/* ===== HAMBURGER ===== */
document.getElementById("hamburger").onclick=()=>{
    let m=document.getElementById("menuOptions");
    m.style.display=(m.style.display==="flex")?"none":"flex";
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

/* ===== CHANGER PROFIL ===== */
const changeProfileBtn = document.getElementById("changeProfileBtn");

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

// Ouvrir modal
changeProfileBtn.addEventListener("click", ()=>{
    profileModal.style.display = "flex";
    profileNom.value = currentProfile.username;
    profilePrenom.value = currentProfile.bio;

    avatarPreview.innerText = "";
    if(users[currentProfile.username]?.photo){
        avatarPreview.style.backgroundImage = `url(${users[currentProfile.username].photo})`;
        avatarPreview.style.backgroundSize = "cover";
        avatarPreview.style.backgroundPosition = "center";
    } else {
        avatarPreview.style.backgroundImage = "";
        avatarPreview.innerText = currentProfile.username + " " + currentProfile.bio;
        avatarPreview.style.fontSize = (currentProfile.username.length + currentProfile.bio.length > 10) ? "12px" : "20px";
    }
});

// Fermer modal
closeProfileModal.addEventListener("click", ()=> profileModal.style.display="none");

// Modifier avatar
avatarPreview.addEventListener("click", ()=> avatarInput.click());
avatarInput.addEventListener("change", e=>{
    let file = e.target.files[0];
    if(!file) return;
    let reader = new FileReader();
    reader.onload = ev => {
        avatarPreview.style.backgroundImage = `url(${ev.target.result})`;
        avatarPreview.style.backgroundSize = "cover";
        avatarPreview.style.backgroundPosition = "center";
        avatarPreview.innerText = "";
        users[currentProfile.username].photo = ev.target.result;
        saveData();
        renderStories();
    };
    reader.readAsDataURL(file);
});

// Sauvegarder profil (corrigé pour prénom et nom correctement)
saveProfile.addEventListener("click", ()=>{
    let nom = profileNom.value.trim();
    let prenom = profilePrenom.value.trim();
    if(!nom || !prenom){ return alert("Nom et prénom sont obligatoires"); }

    let oldKey = currentProfile.username;
    let userData = users[oldKey];

    userData.bio = prenom; // mettre à jour le prénom
    if(!userData.photo) userData.photo = generateAvatar(nom, prenom);

    // Renommer la clé si le nom change
    if(oldKey !== nom){
        users[nom] = userData;
        delete users[oldKey];
    }

    currentProfile.username = nom;
    currentProfile.bio = prenom;

    saveData();
    renderStories();
    profileModal.style.display = "none";
});

/* ===== INIT ===== */
renderStories();
