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

/* ===== AVATAR ===== */
function generateAvatar(nom, prenom) {
    let canvas = document.createElement("canvas");
    canvas.width = 150; canvas.height = 150;
    let ctx = canvas.getContext("2d");
    ctx.fillStyle = "#25D366"; ctx.fillRect(0, 0, 150, 150);
    ctx.fillStyle = "white"; ctx.font = "bold 60px sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(nom[0]+prenom[0], 75, 75);
    return canvas.toDataURL();
}

/* ===== CREATION PROFIL INITIAL ===== */
if(!users[currentProfile.username]){
    users[currentProfile.username] = { photo: generateAvatar("Mon","Prenom"), stories: [] };
    coins[currentProfile.username] = 100;
    saveData(); saveCoins();
}

/* ===== STORIES ===== */
function renderStories(){
    let container = document.getElementById("stories");
    container.innerHTML="";

    // Mettre l’utilisateur courant en premier
    const usernames = Object.keys(users).sort(u=> u===currentProfile.username ? -1 : 1);

    usernames.forEach(u=>{
        let div = document.createElement("div"); div.className="story";

        // Cercle avatar  
        let avatarDiv = document.createElement("div");   
        avatarDiv.style.width="80px"; avatarDiv.style.height="80px";  
        avatarDiv.style.borderRadius="50%"; avatarDiv.style.margin="0 auto";  
        avatarDiv.style.backgroundImage = `url(${users[u].photo})`;  
        avatarDiv.style.backgroundSize="cover";  
        avatarDiv.style.display="flex"; avatarDiv.style.alignItems="center"; avatarDiv.style.justifyContent="center";  
        avatarDiv.style.cursor="pointer";  

        // Nom + prénom  
        let label = document.createElement("div");  
        label.style.textAlign="center"; label.style.marginTop="5px";  
        label.style.color="white"; label.innerText = `${u} ${users[u].bio}`;  

        div.appendChild(avatarDiv); div.appendChild(label);  
        container.appendChild(div);  

        // Ajouter "+" pour l'utilisateur courant  
        if(u===currentProfile.username){  
            let plus = document.createElement("div"); plus.className="plus"; plus.innerText="+";  
            plus.onclick = e=>{ e.stopPropagation(); document.getElementById("fileInput").click(); };  
            div.appendChild(plus);  
        }  

        div.onclick = ()=> openViewer(u);  
    });
}

/* ===== UPLOAD STORY ===== */
let pendingFile = null;
const publishBtn = document.getElementById("publishStoryBtn");

document.getElementById("fileInput").addEventListener("change", e => {
    let file = e.target.files[0];
    if(!file) return;

    pendingFile = file;
    publishBtn.style.display = "block"; // Affiche le bouton Publier
});

publishBtn.addEventListener("click", () => {
    if(!pendingFile) return alert("Aucun fichier sélectionné");

    if(pendingFile.type.startsWith("video")) addVideo(pendingFile);
    else addImage(pendingFile);

    pendingFile = null;
    publishBtn.style.display = "none"; // Masque le bouton après publication
});

function addVideo(file){
    let url = URL.createObjectURL(file);
    users[currentProfile.username].stories.push({ url,type:"video", views:{} });
    saveData(); renderStories();
}

function addImage(file){
    let reader=new FileReader();
    reader.onload=e=>{
        users[currentProfile.username].stories.push({ url:e.target.result,type:"image",views:{} });
        saveData(); renderStories();
    };
    reader.readAsDataURL(file);
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
    let bars=document.querySelectorAll(".progress-inner"); let w=0;
    let dur=s.type==="image"?5000:10000;
    timer=setInterval(()=>{
        w+=100/(dur/50); bars[currentIndex].style.width=Math.min(w,100)+"%";
        if(w>=100){
            clearInterval(timer);
            if(currentIndex<users[currentUser].stories.length-1){ currentIndex++; showStory(); }
            else closeViewer();
        }
    },50);
}

function showStory(){
    clearInterval(timer);
    let s=users[currentUser].stories[currentIndex];
    let c=document.getElementById("content"); c.innerHTML="";
    let e=s.type==="image"?document.createElement("img"):document.createElement("video");
    e.src=s.url; if(s.type==="video") e.autoplay=true; c.appendChild(e);
    if(!s.views[currentProfile.username]){ s.views[currentProfile.username]=true; saveData(); }
    document.getElementById("viewCount").innerText="👁 "+Object.keys(s.views).length+" vues";
    renderProgressBars(); startProgress(s);

    // Controls  
    let controls=document.getElementById("progressControls"); controls.innerHTML="";  
    let giftBtn=document.createElement("button"); giftBtn.innerText="🎁 Envoyer un cadeau"; giftBtn.onclick=openGiftModal;  
    controls.appendChild(giftBtn);  

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
    box.innerHTML=`
        <h3>Quantité pour ${selectedGiftEmoji}</h3>
        <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;">
            <button onclick="sendGift(1)">×1</button>
            <button onclick="sendGift(2)">×2</button>
            <button onclick="sendGift(5)">×5</button>
            <button onclick="sendGift(7)">×7</button>
            <button onclick="sendGift(10)">×10</button>
        </div><br>
        <button onclick="closeGiftQuantity()">Fermer</button>`;
    m.appendChild(box); document.body.appendChild(m);
}
function closeGiftQuantity(){ let m=document.querySelector("body > div:last-child"); if(m)m.remove(); }
function sendGift(q){
    let t=selectedGiftCost*q;
    if((coins[currentProfile.username]||0)>=t){ coins[currentProfile.username]-=t; saveCoins();
        document.getElementById("giftMessage").innerText=`Cadeau envoyé ${selectedGiftEmoji} x${q}`; updateCoinBalance();
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

const withdrawPaypalBtn=document.getElementById("withdrawPaypalBtn");
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
withdrawPaypalBtn.onclick=()=>{ alert("Montant minimum de retrait : 15 €"); window.open("about:blank","_blank"); }
closeWithdraw.onclick=()=>document.getElementById("withdrawModal").style.display="none";

/* ===== CHANGER PROFIL ===== */
const changeProfileBtn2 = document.getElementById("changeProfileBtn");

// Créer modal si pas présent
if(!document.getElementById("profileModal")){
    let modal = document.createElement("div");
    modal.id="profileModal";
    modal.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,0.9);display:none;justify-content:center;align-items:center;z-index:9999;";
    modal.innerHTML=`
    <div style="background:#111;padding:25px;border-radius:15px;text-align:center;color:white;">
        <h3>Modifier le profil</h3>
        <div id="avatarPreview" style="width:80px;height:80px;border-radius:50%;margin:0 auto;background:#25D366;display:flex;align-items:center;justify-content:center;font-size:30px;cursor:pointer;"></div>
        <input type="file" id="avatarInput" hidden>
        <br><br>
        <input type="text" id="profileNom" placeholder="Nom" style="margin-bottom:10px;"><br>
        <input type="text" id="profilePrenom" placeholder="Prénom" style="margin-bottom:10px;"><br>
        <button id="saveProfile" class="green-btn">Sauvegarder</button>
        <button id="closeProfileModal" class="red-btn">Fermer</button>
    </div>`;
    document.body.appendChild(modal);
}

// Elements modal
const profileModal = document.getElementById("profileModal");
const avatarPreview = document.getElementById("avatarPreview");
const avatarInput = document.getElementById("avatarInput");
const profileNom = document.getElementById("profileNom");
const profilePrenom = document.getElementById("profilePrenom");
const saveProfile = document.getElementById("saveProfile");
const closeProfileModal = document.getElementById("closeProfileModal");

// Ouvrir modal
changeProfileBtn2.addEventListener("click", ()=>{
    profileModal.style.display="flex";
    profileNom.value=currentProfile.username;
    profilePrenom.value=currentProfile.bio;
    avatarPreview.innerText=currentProfile.username[0]+currentProfile.bio[0];
    avatarPreview.style.backgroundImage=users[currentProfile.username]?.photo ? `url(${users[currentProfile.username].photo})` : "";
    avatarPreview.style.backgroundSize="cover";
});

// Modifier avatar
avatarPreview.addEventListener("click", ()=> avatarInput.click());
avatarInput.addEventListener("change", e=>{
    let file=e.target.files[0]; if(!file) return;
    let reader=new FileReader();
    reader.onload=ev=>{
        avatarPreview.style.backgroundImage=`url(${ev.target.result})`;
        avatarPreview.style.backgroundSize="cover";
        avatarPreview.innerText="";
        users[currentProfile.username].photo=ev.target.result;
        saveData();
        renderStories();
    };
    reader.readAsDataURL(file);
});

// Sauvegarder profil
saveProfile.addEventListener("click", ()=>{
    let nom=profileNom.value.trim();
    let prenom=profilePrenom.value.trim();
    if(!nom || !prenom){ return alert("Nom et prénom sont obligatoires"); }

    // Mettre à jour cercle existant
    const oldUsername = currentProfile.username;
    currentProfile.username = nom;  
    currentProfile.bio = prenom;  

    if(oldUsername !== nom){
        users[nom] = users[oldUsername] || { photo: users[oldUsername]?.photo || generateAvatar(nom, prenom), stories: users[oldUsername]?.stories || [] };
        if(oldUsername !== nom) delete users[oldUsername];
        coins[nom] = coins[oldUsername] || 100;
        if(oldUsername !== nom) delete coins[oldUsername];
    }

    saveData(); saveCoins();
    renderStories();  
    profileModal.style.display="none";
});

// Fermer modal
closeProfileModal.addEventListener("click", ()=> profileModal.style.display="none");

/* ===== INIT ===== */
renderStories();
