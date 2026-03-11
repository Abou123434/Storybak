/* -------------------- CONFIG & INIT -------------------- */
let currentProfile = { username: "MonProfil", bio: "Ma bio" };
let currentUser = null;
let currentIndex = 0;
let timer = null;

let users = JSON.parse(localStorage.getItem("storyUsers")) || {};
let coins = JSON.parse(localStorage.getItem("userCoins")) || {};
let localReactions = {};

/* Sauvegarde */
function saveData(){ localStorage.setItem("storyUsers", JSON.stringify(users)); }
function saveCoins(){ localStorage.setItem("userCoins", JSON.stringify(coins)); }

/* Création profil initial */
if(!users[currentProfile.username]){
    users[currentProfile.username]={photo:generateAvatar("Mon","Profil"),stories:[]};
    coins[currentProfile.username]=100;
    saveData();
    saveCoins();
}

/* -------------------- AVATAR -------------------- */
function generateAvatar(nom,prenom){
    let canvas=document.createElement("canvas");
    canvas.width=150; canvas.height=150;
    let ctx=canvas.getContext("2d");
    ctx.fillStyle="#25D366";
    ctx.fillRect(0,0,150,150);
    ctx.fillStyle="white";
    ctx.font="bold 60px sans-serif";
    ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.fillText(nom[0]+prenom[0],75,75);
    return canvas.toDataURL();
}

/* -------------------- STORIES -------------------- */
function renderStories(){
    let container=document.getElementById("stories");
    container.innerHTML="";
    Object.keys(users).forEach(username=>{
        let div=document.createElement("div"); div.className="story";
        let img=document.createElement("img"); img.src=users[username].photo;
        div.appendChild(img);
        div.onclick=()=>openViewer(username);
        container.appendChild(div);
    });
}

/* -------------------- UPLOAD -------------------- */
document.getElementById("fileInput").addEventListener("change",function(e){
    let file=e.target.files[0];
    if(!file)return;
    if(file.type.startsWith("video")) addVideo(file);
    else addImage(file);
});

function addVideo(file){
    let url=URL.createObjectURL(file);
    users[currentProfile.username].stories.push({url:url,type:"video",views:{}});
    saveData(); renderStories();
}

function addImage(file){
    let reader=new FileReader();
    reader.onload=function(e){
        users[currentProfile.username].stories.push({url:e.target.result,type:"image",views:{}});
        saveData(); renderStories();
    };
    reader.readAsDataURL(file);
}

/* -------------------- VIEWER -------------------- */
function openViewer(user){
    if(users[user].stories.length===0) return;
    currentUser=user; currentIndex=0;
    document.getElementById("viewer").style.display="flex";
    showStory();
}

function renderProgressBars(){
    let container=document.getElementById("progressContainer");
    container.innerHTML="";
    users[currentUser].stories.forEach((s,i)=>{
        let bar=document.createElement("div"); bar.className="progress";
        let inner=document.createElement("div"); inner.className="progress-inner";
        if(i<currentIndex) inner.style.width="100%";
        bar.appendChild(inner); container.appendChild(bar);
    });
}

function startProgress(story){
    let bars=document.querySelectorAll(".progress-inner"); let width=0;
    let duration=story.type==="image"?5000:10000;
    timer=setInterval(()=>{
        width+=100/(duration/50);
        bars[currentIndex].style.width=Math.min(width,100)+"%";
        if(width>=100){
            clearInterval(timer);
            if(currentIndex<users[currentUser].stories.length-1){
                currentIndex++; showStory();
            } else closeViewer();
        }
    },50);
}

function showStory(){
    clearInterval(timer);
    let story=users[currentUser].stories[currentIndex];
    let content=document.getElementById("content"); content.innerHTML="";
    let element=story.type==="image"?document.createElement("img"):document.createElement("video");
    element.src=story.url; if(story.type==="video") element.autoplay=true;
    content.appendChild(element);

    // Vues
    if(!story.views[currentProfile.username]){ story.views[currentProfile.username]=true; saveData(); }
    document.getElementById("viewCount").innerText="👁 "+Object.keys(story.views).length+" vues";

    renderProgressBars(); startProgress(story);

    // Bouton cadeau
    let controls=document.getElementById("progressControls"); controls.innerHTML="";
    let giftBtn=document.createElement("button"); giftBtn.innerText="🎁 Envoyer un cadeau"; giftBtn.onclick=openGiftModal;
    controls.appendChild(giftBtn);

    // Supprimer story
    if(currentProfile.username===currentUser){
        let delBtn=document.createElement("button"); delBtn.innerText="Supprimer";
        delBtn.onclick=function(){
            if(confirm("Supprimer cette story ?")){
                users[currentUser].stories.splice(currentIndex,1);
                saveData();
                if(users[currentUser].stories.length===0){ closeViewer(); return; }
                showStory();
            }
        };
        controls.appendChild(delBtn);
    }
}

function nextStory(){ if(currentIndex<users[currentUser].stories.length-1){ currentIndex++; showStory(); } }
function prevStory(){ if(currentIndex>0){ currentIndex--; showStory(); } }
function closeViewer(){ clearInterval(timer); document.getElementById("viewer").style.display="none"; }

/* -------------------- CADEAUX -------------------- */
let selectedGiftCost=0; let selectedGiftEmoji="";
function openGiftModal(){
    document.getElementById("giftModal").style.display="flex";
    updateCoinBalance();
}
function updateCoinBalance(){ document.getElementById("coinBalance").innerText="Solde "+(coins[currentProfile.username]||0)+" 💰"; }
document.getElementById("closeGiftModal").onclick=function(){ document.getElementById("giftModal").style.display="none"; };

document.querySelectorAll("#giftModal .gift-options button").forEach(btn=>{
    btn.onclick=function(){ selectedGiftCost=parseInt(this.dataset.cost); selectedGiftEmoji=this.innerText; openGiftQuantityModal(); };
});

function openGiftQuantityModal(){
    let modal=document.createElement("div");
    modal.style.position="fixed"; modal.style.inset="0"; modal.style.background="rgba(0,0,0,0.9)";
    modal.style.display="flex"; modal.style.justifyContent="center"; modal.style.alignItems="center"; modal.style.zIndex="9999";
    let box=document.createElement("div"); box.style.background="#111"; box.style.padding="25px"; box.style.borderRadius="15px"; box.style.textAlign="center";
    box.innerHTML=`<h3>Choisir la quantité pour ${selectedGiftEmoji}</h3>
    <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;">
    <button onclick="sendGift(1)">×1</button>
    <button onclick="sendGift(2)">×2</button>
    <button onclick="sendGift(5)">×5</button>
    <button onclick="sendGift(7)">×7</button>
    <button onclick="sendGift(10)">×10</button>
    </div><br><button onclick="closeGiftQuantity()">Fermer</button>`;
    modal.appendChild(box); document.body.appendChild(modal);
}
function closeGiftQuantity(){ let modal=document.querySelector("body > div:last-child"); if(modal) modal.remove(); }
function sendGift(q){
    let total=selectedGiftCost*q;
    if((coins[currentProfile.username]||0)>=total){
        coins[currentProfile.username]-=total; saveCoins(); document.getElementById("giftMessage").innerText=`Cadeau envoyé ${selectedGiftEmoji} x${q}`;
        updateCoinBalance();
    } else document.getElementById("giftMessage").innerText="Solde insuffisant";
    closeGiftQuantity();
}

/* -------------------- ACHAT COINS -------------------- */
document.getElementById("buyCoins").onclick=function(){ document.getElementById("buyCoinsModal").style.display="flex"; };
function closeBuy(){ document.getElementById("buyCoinsModal").style.display="none"; }

/* -------------------- PAIEMENT -------------------- */
function openPayment(){ document.getElementById("paymentModal").style.display="flex"; }
function closePayment(){ document.getElementById("paymentModal").style.display="none"; }
function openMobile(){ document.getElementById("mobileMoneyModal").style.display="flex"; }
function closeMobile(){ document.getElementById("mobileMoneyModal").style.display="none"; }
function openBlank(){ window.open("about:blank","_blank"); }

/* -------------------- HAMBURGER -------------------- */
const hamburger=document.getElementById("hamburger");
hamburger.onclick=function(){
    let menu=document.getElementById("menuOptions");
    menu.style.display=menu.style.display==="flex"?"none":"flex";
};

/* -------------------- INIT -------------------- */
renderStories();
