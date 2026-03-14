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

    previewFile = file;

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

    // Progress + boutons
    let controls = document.getElementById("progressControls");
    controls.innerHTML = "";
    controls.style.display = "flex";
    controls.style.justifyContent = "flex-end";
    controls.style.gap = "10px";

    // Bouton Publier
    let publishBtn = document.createElement("button");
    publishBtn.innerText = "Publier";
    publishBtn.onclick = publishPreviewStory;
    controls.appendChild(publishBtn);

    // Bouton Booster
    let boosterBtn = document.createElement("button");
    boosterBtn.innerText = "Booster";
    boosterBtn.onclick = ()=>{};
    controls.appendChild(boosterBtn);
});

function publishPreviewStory(){
    if(!previewFile) return;

    if(previewFile.type.startsWith("video")){
        users[currentProfile.username].stories.push({
            url: URL.createObjectURL(previewFile),
            type: "video",
            views: {}
        });
        saveData();
        renderStories();
        previewFile = null;
        closeViewer();
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

/* ===== INIT ===== */
renderStories();
