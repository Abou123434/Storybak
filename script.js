/* ===== GLOBAL ===== */
let currentProfile = { username: "MonProfil", bio: "Prenom" };
let currentUser = null;
let currentIndex = 0;
let timer = null;
let kycDone = false;

// Stockage
let users = JSON.parse(localStorage.getItem("storyUsers")) || {};
let coins = JSON.parse(localStorage.getItem("userCoins")) || {};
let localReactions = JSON.parse(localStorage.getItem("localReactions")) || {};

/* ===== SAUVEGARDE ===== */
function saveData() { localStorage.setItem("storyUsers", JSON.stringify(users)); }
function saveCoins() { localStorage.setItem("userCoins", JSON.stringify(coins)); }
function saveLocal() { localStorage.setItem("localReactions", JSON.stringify(localReactions)); }

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
    users[currentProfile.username] = { photo: generateAvatar("Mon","Prenom"), bio: "Prenom", stories: [], reactions:{} };
    coins[currentProfile.username] = 100;
    saveData(); saveCoins();
}

/* ===== STORIES ===== */
function cleanOldStories(){
    let now = Date.now();
    for(let u in users){
        users[u].stories = users[u].stories.filter(s => now - s.time < 86400000);
    }
    saveData();
}

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

/* ===== AJOUT STORY ===== */
document.getElementById("fileInput").addEventListener("change", async function(e){
    let file = e.target.files[0]; if(!file) return;

    let userStories = users[currentProfile.username].stories;
    let videoCount = userStories.filter(s=>s.type==="video").length;
    let imageCount = userStories.filter(s=>s.type==="image").length;

    if(file.type.startsWith("video")){
        if(videoCount >= 5){ alert("Vous ne pouvez avoir que 5 vidéos maximum."); return; }
        const forbiddenKeywords = ["porn","xxx","sex"];
        if(forbiddenKeywords.some(word => file.name.toLowerCase().includes(word))){
            alert("Vidéo rejetée : contenu inapproprié."); return;
        }
        await addVideoWithSegments(file);
    } else {
        if(imageCount >= 10){ alert("Vous ne pouvez avoir que 10 images maximum."); return; }
        await addImageStory(file);
    }
});

async function addVideoWithSegments(file){
    let url = URL.createObjectURL(file);
    let video = document.createElement("video"); video.src=url; video.preload="metadata";
    await new Promise(res=>video.onloadedmetadata=res);
    let duration = video.duration;
    let segments = Math.ceil(duration / 10);

    for(let i=0;i<segments;i++){
        if(users[currentProfile.username].stories.filter(s=>s.type==="video").length >= 5) break;
        users[currentProfile.username].stories.push({
            url:url,
            type:"video",
            startTime:i*10,
            endTime:Math.min((i+1)*10,duration),
            time:Date.now(),
            views:{},
            reactions:{}
        });
    }
    saveData();
    renderStories();
}

function addImageStory(file){
    return new Promise(resolve=>{
        let reader = new FileReader();
        reader.onload = e=>{
            users[currentProfile.username].stories.push({
                url:e.target.result,
                type:"image",
                time:Date.now(),
                views:{},
                reactions:{}
            });
            saveData(); renderStories(); resolve();
        };
        reader.readAsDataURL(file);
    });
}

/* ===== VIEWER ===== */
function openViewer(u){
    if(users[u].stories.length===0) return;
    currentUser = u; currentIndex=0;
    document.getElementById("viewer").style.display="flex";
    showStory();
}

function renderProgressBars(activeIndex){
    let container = document.getElementById("progressContainer"); container.innerHTML="";
    let stories = users[currentUser].stories;
    stories.forEach((s,i)=>{
        let bar = document.createElement("div"); bar.className="progress";
        let inner = document.createElement("div"); inner.className="progress-inner";
        if(i<activeIndex) inner.style.width="100%";
        if(i>activeIndex) inner.style.width="0%";
        bar.appendChild(inner); container.appendChild(bar);
    });
}

function startProgress(story){
    let bars = document.querySelectorAll(".progress-inner"); let width=0;
    let duration = story.type==="image"?5000:(story.endTime - story.startTime)*1000;
    timer=setInterval(()=>{
        width+=100/(duration/50);
        bars[currentIndex].style.width=Math.min(width,100)+"%";
        if(width>=100){
            clearInterval(timer);
            if(currentIndex < users[currentUser].stories.length-1){ currentIndex++; showStory(); }
            else closeViewer();
        }
    },50);
}

function showStory(){
    clearInterval(timer);
    let story = users[currentUser].stories[currentIndex];
    let content = document.getElementById("content"); content.innerHTML="";
    let element = story.type==="image"?document.createElement("img"):document.createElement("video");
    element.src = story.url;
    if(story.type==="video"){ element.autoplay=true; element.muted=false; element.currentTime=story.startTime; element.ontimeupdate=()=>{ if(element.currentTime>=story.endTime) nextStory(); } }
    content.appendChild(element);

    // Controls
    let controls = document.getElementById("progressControls"); controls.innerHTML="";
    let giftBtn = document.createElement("button"); giftBtn.innerText="🎁 Envoyer un cadeau"; giftBtn.style.cursor="pointer"; giftBtn.onclick=openGiftModal; controls.appendChild(giftBtn);

    if(currentProfile.username===currentUser){
        let delBtn=document.createElement("button"); delBtn.innerText="Supprimer"; delBtn.style.cursor="pointer";
        delBtn.onclick=()=>{ if(confirm("Supprimer cette story ?")){ clearInterval(timer); if(element.tagName==="VIDEO"){ element.pause(); element.src=""; element.load(); } users[currentUser].stories.splice(currentIndex,1); saveData(); if(users[currentUser].stories.length===0){ closeViewer(); return; } if(currentIndex>=users[currentUser].stories.length) currentIndex=users[currentUser].stories.length-1; showStory(); } };
        controls.appendChild(delBtn);
    }

    // Vues & reactions
    if(!story.views[currentProfile.username]){ story.views[currentProfile.username]=true; saveData(); }
    let viewCount = document.getElementById("viewCount"); 
    if(currentUser===currentProfile.username){
        let reactionsText=""; for(let u in story.reactions) reactionsText+=story.reactions[u]+" "; 
        viewCount.innerText = "👁 "+Object.keys(story.views).length+" vues "+reactionsText;
    } else {
        viewCount.innerText=""; 
        let storyId=currentUser+"_"+currentIndex; 
        if(localReactions[storyId]) showReaction(localReactions[storyId]);
    }

    renderProgressBars(currentIndex); startProgress(story);
}

/* ===== REACTIONS ===== */
function react(emoji){
    let storyId = currentUser+"_"+currentIndex;
    localReactions[storyId] = emoji; saveLocal();
    showReaction(emoji);
    let story = users[currentUser].stories[currentIndex];
    story.reactions[currentProfile.username]=emoji; saveData();
}

function showReaction(emoji){
    let container=document.querySelector(".reactions-display");
    if(!container){ container=document.createElement("div"); container.className="reactions-display"; document.getElementById("viewer").appendChild(container);}
    container.innerText=emoji;
    setTimeout(()=>{ container.innerText=""; },1200);
}

function nextStory(){ if(currentIndex<users[currentUser].stories.length-1){ currentIndex++; showStory(); } else closeViewer(); }
function prevStory(){ if(currentIndex>0){ currentIndex--; showStory(); } }
function closeViewer(){ clearInterval(timer); document.getElementById("viewer").style.display="none"; }

/* ===== CADEAUX AVANCES ===== */
let selectedGiftCost=0, selectedGiftEmoji="";
function openGiftModal(){
    let modal=document.getElementById("giftModal");
    modal.style.display="flex";
    updateCoinBalance();
}

function updateCoinBalance(){
    document.getElementById("coinBalance").innerText="💰 "+(coins[currentProfile.username]||0);
}

document.getElementById("closeGiftModal").onclick=()=>{ document.getElementById("giftModal").style.display="none"; };

document.querySelectorAll("#giftModal .gift-options button").forEach(btn=>{
    btn.onclick=function(){
        selectedGiftCost=parseInt(this.dataset.cost);
        selectedGiftEmoji=this.innerText;
        openGiftQuantityModal();
    };
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
    let total=selectedGiftCost*q;
    if((coins[currentProfile.username]||0)>=total){ 
        coins[currentProfile.username]-=total; saveCoins();
        document.getElementById("giftMessage").innerText=`Cadeau envoyé ${selectedGiftEmoji} x${q}`; 
        updateCoinBalance();
    } else document.getElementById("giftMessage").innerText="Solde insuffisant !";
    closeGiftQuantity();
}

/* ===== INIT ===== */
cleanOldStories();
renderStories();
