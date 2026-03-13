/* -------------------- CONFIG & INIT -------------------- */
let currentProfile = { username: "MonProfil", bio: "Ma bio" };
let currentUser = null;
let currentIndex = 0;
let timer = null;

let users = JSON.parse(localStorage.getItem("storyUsers")) || {};
let coins = JSON.parse(localStorage.getItem("userCoins")) || {};
let localReactions = {};

/* Sauvegarde */
function saveData() { localStorage.setItem("storyUsers", JSON.stringify(users)); }
function saveCoins() { localStorage.setItem("userCoins", JSON.stringify(coins)); }

/* Création profil initial */
if(!users[currentProfile.username]){
    users[currentProfile.username]={photo:generateAvatar("Mon","Profil"),stories:[]};
    coins[currentProfile.username]=0;
    saveData(); saveCoins();
}

/* -------------------- AVATAR -------------------- */
function generateAvatar(nom,prenom){
    let canvas=document.createElement("canvas");
    canvas.width=150;canvas.height=150;
    let ctx=canvas.getContext("2d");
    ctx.fillStyle="#25D366";ctx.fillRect(0,0,150,150);
    ctx.fillStyle="white";ctx.font="bold 60px sans-serif";
    ctx.textAlign="center";ctx.textBaseline="middle";
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
        let name=document.createElement("p"); name.innerText=username;

        let plus=document.createElement("div"); plus.className="plus"; plus.innerText="+";
        if(username===currentProfile.username){
            plus.onclick=e=>{e.stopPropagation();document.getElementById("fileInput").click();}
        }else plus.style.display="none";

        div.appendChild(img); div.appendChild(plus); div.appendChild(name);
        div.onclick=()=>openViewer(username);
        container.appendChild(div);
    });
}

/* -------------------- UPLOAD STORY -------------------- */
document.getElementById("fileInput").addEventListener("change",function(e){
    let file=e.target.files[0]; if(!file) return;
    if(file.type.startsWith("video")) addVideo(file);
    else addImage(file);
});

function addVideo(file){
    let url=URL.createObjectURL(file);
    users[currentProfile.username].stories.push({url:url,type:"video",views:{},prepub:true});
    saveData(); renderStories();
}
function addImage(file){
    let reader=new FileReader();
    reader.onload=function(e){
        users[currentProfile.username].stories.push({url:e.target.result,type:"image",views:{},prepub:true});
        saveData(); renderStories();
    }
    reader.readAsDataURL(file);
}

/* -------------------- VIEWER -------------------- */
function openViewer(user){
    if(users[user].stories.length===0) return;
    currentUser=user; currentIndex=0;
    document.getElementById("viewer").style.display="flex";
    document.getElementById("hamburgerContainer").style.display="none";
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
    let bars=document.querySelectorAll(".progress-inner");
    let width=0; let duration=story.type==="image"?5000:10000;
    timer=setInterval(()=>{
        width+=100/(duration/50);
        bars[currentIndex].style.width=Math.min(width,100)+"%";
        if(width>=100){
            clearInterval(timer);
            if(currentIndex<users[currentUser].stories.length-1){currentIndex++;showStory();}
            else closeViewer();
        }
    },50);
}

function showStory(){
    clearInterval(timer);
    let story=users[currentUser].stories[currentIndex];
    let content=document.getElementById("content"); content.innerHTML="";
    let element=story.type==="image"?document.createElement("img"):document.createElement("video");
    element.src=story.url;
    if(story.type==="video") element.autoplay=true;
    content.appendChild(element);

    /* Prépub / Vidéo */
    let prepubActions=document.getElementById("prepubActions");
    let videoActions=document.getElementById("videoActions");
    if(story.type==="video" && story.prepub){ prepubActions.style.display="flex"; videoActions.style.display="none"; }
    else if(story.type==="video" && !story.prepub){ prepubActions.style.display="none"; videoActions.style.display="flex"; }
    else{ prepubActions.style.display="none"; videoActions.style.display="none"; }

    /* Publier bouton */
    let publishBtn=document.getElementById("publishBtn");
    publishBtn.onclick=()=>{ story.prepub=false; saveData(); showStory(); };

    /* Cadeau bouton */
    let giftBtn=document.getElementById("giftBtn");
    giftBtn.onclick=openGiftModal;

    /* Vues */
    if(!story.views[currentProfile.username]){ story.views[currentProfile.username]=true; saveData(); }
    document.getElementById("viewCount").innerText="👁 "+Object.keys(story.views).length+" vues";

    renderProgressBars(); startProgress(story);
}

function closeViewer(){ clearInterval(timer); document.getElementById("viewer").style.display="none"; document.getElementById("hamburgerContainer").style.display="flex"; }
function prevStory(){ if(currentIndex>0){currentIndex--;showStory();} }
function nextStory(){ if(currentIndex<users[currentUser].stories.length-1){currentIndex++;showStory();} }

/* -------------------- CADEAUX -------------------- */
let selectedGiftCost=0; let selectedGiftEmoji="";
function openGiftModal(){ document.getElementById("giftModal").style.display="flex"; updateCoinBalance(); }
function updateCoinBalance(){ document.getElementById("coinBalance").innerText="Solde "+(coins[currentProfile.username]||0)+" 💰"; }
document.getElementById("closeGiftModal").onclick=()=>{document.getElementById("giftModal").style.display="none";}
document.querySelectorAll("#giftModal .gift-options button").forEach(btn=>{
    btn.onclick=function(){ selectedGiftCost=parseInt(this.dataset.cost); selectedGiftEmoji=this.innerText; sendGift(1); }
});
function sendGift(q){
    let total=selectedGiftCost*q;
    if((coins[currentProfile.username]||0)>=total){ coins[currentProfile.username]-=total; saveCoins(); updateCoinBalance(); alert(`Cadeau envoyé ${selectedGiftEmoji} x${q}`);}
    else alert("Solde insuffisant");
}

/* -------------------- ACHAT COINS / PAYPAL -------------------- */
document.getElementById("buyCoins").onclick=()=>{document.getElementById("buyCoinsModal").style.display="flex";}
document.getElementById("closeBuyCoinsModal").onclick=()=>{document.getElementById("buyCoinsModal").style.display="none";}
document.querySelectorAll(".payBtn").forEach(btn=>btn.onclick=()=>window.open("about:blank","_blank"));

/* -------------------- BOSTE -------------------- */
const boostBtn=document.getElementById("boostBtn");
boostBtn.onclick=()=>document.getElementById("boostModal").style.display="flex";
document.getElementById("closeBoostModal").onclick=()=>document.getElementById("boostModal").style.display="none";
document.querySelectorAll("#boostModal .boost-options button").forEach(btn=>btn.onclick=()=>window.open("about:blank","_blank"));

/* -------------------- HAMBURGER -------------------- */
const hamburger=document.getElementById("hamburger");
const menuOptions=document.getElementById("menuOptions");
hamburger.addEventListener("click",()=>{ menuOptions.style.display=menuOptions.style.display==="flex"?"none":"flex"; });

/* -------------------- INIT -------------------- */
renderStories();
