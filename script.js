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

/* ===== HAMBURGER ===== */
const hamburger = document.getElementById("hamburger");
const menuOptions = document.getElementById("menuOptions");
if(hamburger && menuOptions){
    hamburger.onclick = () => {
        menuOptions.style.display = (menuOptions.style.display === "flex") ? "none" : "flex";
    };
}

/* ===== UPLOAD & PRÉVISUALISATION (Publier + Booster) ===== */
let previewFile = null;
document.getElementById("fileInput").addEventListener("change", e => {
    let file = e.target.files[0]; 
    if(!file) return;
    previewFile = file;

    let viewer = document.getElementById("viewer");
    viewer.style.display = "flex";

    let content = document.getElementById("content");
    content.innerHTML = "";

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

    let controls = document.getElementById("progressControls");
    controls.innerHTML = "";
    controls.style.position = "absolute";
    controls.style.bottom = "20px";
    controls.style.left = "0";
    controls.style.right = "0";
    controls.style.display = "flex";
    controls.style.justifyContent = "space-between";
    controls.style.padding = "0 20px";

    // Publier (jaune, gauche, actif)
    let publishBtn = document.createElement("button");
    publishBtn.innerText = "Publier";
    publishBtn.style.padding = "10px 20px";
    publishBtn.style.borderRadius = "20px";
    publishBtn.style.background = "#FFD700";
    publishBtn.style.color = "black";
    publishBtn.style.fontWeight = "bold";
    publishBtn.onclick = publishPreviewStory;
    controls.appendChild(publishBtn);

    // Booster (vert, droite, désactivé)
    let boostBtn = document.createElement("button");
    boostBtn.innerText = "🚀 Booster";
    boostBtn.style.padding = "10px 15px";
    boostBtn.style.borderRadius = "20px";
    boostBtn.style.background = "#25D366";
    boostBtn.style.color = "white";
    boostBtn.style.opacity = "0.6";
    boostBtn.style.cursor = "not-allowed";
    controls.appendChild(boostBtn);
});

/* ===== PUBLISH STORY ===== */
function publishPreviewStory(){
    if(!previewFile) return;
    if(previewFile.type.startsWith("video")){
        users[currentProfile.username].stories.push({
            url: URL.createObjectURL(previewFile),
            type: "video",
            views: {}
        });
    } else {
        let reader = new FileReader();
        reader.onload = ev => {
            users[currentProfile.username].stories.push({
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
        return;
    }
    saveData();
    renderStories();
    previewFile = null;
    closeViewer();
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

/* ===== KYC MODAL ===== */
if(!document.getElementById("kycModal")){
    let kycModalDiv = document.createElement("div");
    kycModalDiv.id = "kycModal";
    kycModalDiv.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.9);display:none;justify-content:center;align-items:center;z-index:9999;";
    kycModalDiv.innerHTML = `
        <div style="background:#111;padding:25px;border-radius:15px;text-align:center;color:white;max-width:350px;width:90%;">
            <h3>KYC - Vérification</h3>
            <input type="text" id="kycFullName" placeholder="Nom complet" style="width:90%;margin-bottom:10px;"><br>
            <input type="date" id="kycDOB" style="width:90%;margin-bottom:10px;"><br>
            <input type="text" id="kycCountry" placeholder="Pays" style="width:90%;margin-bottom:10px;"><br>
            <input type="file" id="kycDocument" style="width:90%;margin-bottom:10px;"><br>
            <div id="kycMessage" style="margin-bottom:10px;color:#FFD700;"></div>
            <button id="submitKYC" style="background:#FFD700;color:black;padding:10px 20px;border-radius:15px;margin-right:10px;">Envoyer</button>
            <button id="closeKYC" style="background:#FF3B30;color:white;padding:10px 20px;border-radius:15px;">Fermer</button>
        </div>
    `;
    document.body.appendChild(kycModalDiv);

    const closeKYC = document.getElementById("closeKYC");
    const submitKYC = document.getElementById("submitKYC");
    const kycMessage = document.getElementById("kycMessage");

    closeKYC.onclick = ()=> kycModalDiv.style.display="none";

    submitKYC.onclick = ()=>{
        const name = document.getElementById("kycFullName").value.trim();
        const dob = document.getElementById("kycDOB").value;
        const country = document.getElementById("kycCountry").value.trim();
        const doc = document.getElementById("kycDocument").files[0];
        if(!name || !dob || !country || !doc){
            kycMessage.innerText = "Veuillez remplir tous les champs obligatoires";
            return;
        }
        kycMessage.innerText = "✅ Vérification envoyée !";
        setTimeout(()=>{
            kycModalDiv.style.display="none";
            kycDone = true;
            document.getElementById("withdrawModal").style.display="flex";
        },2000);
    };
}

/* ===== RETRAIT ===== */
withdrawBtn.onclick = ()=>{
    if(kycDone){
        walletOverlay.style.display="none";
        document.getElementById("withdrawModal").style.display="flex";
    } else {
        document.getElementById("kycModal").style.display="flex";
        document.getElementById("kycModal").style.zIndex="99999";
    }
};

/* ===== INIT ===== */
renderStories();
