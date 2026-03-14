/* ===== GLOBAL ===== */
let currentLoggedUser = "UtilisateurTest"; // définir ici l'utilisateur connecté
let currentUser = null;
let currentIndex = 0;
let timer = null;
let kycDone = false;

let users = JSON.parse(localStorage.getItem("storyUsers")) || {};
let coins = JSON.parse(localStorage.getItem("userCoins")) || {};
let localReactions = JSON.parse(localStorage.getItem("localReactions")) || {};

/* ===== SAUVEGARDE ===== */
function saveData() { localStorage.setItem("storyUsers", JSON.stringify(users)); }
function saveCoins() { localStorage.setItem("userCoins", JSON.stringify(coins)); }
function saveLocal() { localStorage.setItem("localReactions", JSON.stringify(localReactions)); }

/* ===== AVATAR ===== */
function generateAvatar(nom, prenom){
    let canvas = document.createElement("canvas");
    canvas.width = 150; canvas.height = 150;
    let ctx = canvas.getContext("2d");
    ctx.fillStyle = "#25D366";
    ctx.fillRect(0,0,150,150);
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    let text = (nom[0] || "?") + (prenom[0] || "?");
    ctx.font = "bold 60px sans-serif";
    ctx.fillText(text.toUpperCase(), 75, 75);
    return canvas.toDataURL();
}

/* ===== STORIES ===== */
function renderStories(){
    let container = document.getElementById("stories");
    container.innerHTML="";
    let usernames = Object.keys(users);
    usernames.sort((a,b)=>(a===currentLoggedUser?-1:b===currentLoggedUser?1:0));
    usernames.forEach(username=>{
        let div = document.createElement("div"); div.className="story";

        let avatarDiv = document.createElement("div");
        avatarDiv.style.width="80px"; avatarDiv.style.height="80px"; avatarDiv.style.borderRadius="50%";
        avatarDiv.style.margin="0 auto"; avatarDiv.style.backgroundImage=`url(${users[username].photo})`;
        avatarDiv.style.backgroundSize="cover"; avatarDiv.style.backgroundPosition="center";
        avatarDiv.style.cursor="pointer"; avatarDiv.style.display="flex"; avatarDiv.style.alignItems="center"; avatarDiv.style.justifyContent="center";

        let label = document.createElement("div");
        label.style.textAlign="center"; label.style.marginTop="5px"; label.style.color="white";
        label.innerText = username.replace("_"," ") + " " + users[username].bio;

        div.appendChild(avatarDiv);
        div.appendChild(label);

        if(username===currentLoggedUser){
            let plus = document.createElement("div"); plus.className="plus"; plus.innerText="+";
            plus.onclick=e=>{ e.stopPropagation(); document.getElementById("fileInput").click(); };
            div.appendChild(plus);
        }

        div.onclick=()=>openViewer(username);
        container.appendChild(div);
    });
}

/* ===== AJOUT STORY ===== */
document.getElementById("fileInput").addEventListener("change", async function(e){
    let file = e.target.files[0]; if(!file) return;
    if(file.type.startsWith("video")) await addVideoStory(file);
    else await addImageStory(file);
});

async function addVideoStory(file){
    let userStories = users[currentLoggedUser].stories;
    if(userStories.filter(s=>s.type==="video").length >= 5){ alert("Max 5 vidéos."); return; }
    const forbidden = ["porn","xxx","sex"];
    if(forbidden.some(w=>file.name.toLowerCase().includes(w))){ alert("Contenu inapproprié."); return; }

    let url = URL.createObjectURL(file);
    let video = document.createElement("video"); video.src=url; video.preload="metadata";
    await new Promise(res=>video.onloadedmetadata=res);
    let dur = video.duration;
    let segments = Math.ceil(dur/10);
    for(let i=0;i<segments;i++){
        if(users[currentLoggedUser].stories.filter(s=>s.type==="video").length>=5) break;
        users[currentLoggedUser].stories.push({ url:url, type:"video", startTime:i*10, endTime:Math.min((i+1)*10,dur), time:Date.now(), views:{}, reactions:{} });
    }
    saveData(); renderStories();
}

function addImageStory(file){
    return new Promise(resolve=>{
        if(users[currentLoggedUser].stories.filter(s=>s.type==="image").length>=10){ alert("Max 10 images."); resolve(); return; }
        let reader = new FileReader();
        reader.onload=e=>{
            users[currentLoggedUser].stories.push({ url:e.target.result,type:"image",time:Date.now(),views:{},reactions:{} });
            saveData(); renderStories(); resolve();
        };
        reader.readAsDataURL(file);
    });
}

/* ===== VIEWER ===== */
function openViewer(user){
    if(users[user].stories.length===0) return;
    currentUser=user; currentIndex=0;
    document.getElementById("viewer").style.display="flex";
    showStory();
}

function showStory(){
    clearInterval(timer);
    if(!users[currentUser] || !users[currentUser].stories[currentIndex]){ closeViewer(); return; }

    let story = users[currentUser].stories[currentIndex];
    let content = document.getElementById("content"); content.innerHTML="";

    let element;
    if(story.type==="image") element=document.createElement("img"), element.src=story.url;
    else{
        element=document.createElement("video");
        element.src=story.url;
        element.autoplay=true; element.muted=false;
        element.currentTime=story.startTime;
        element.ontimeupdate=()=>{ if(element.currentTime>=story.endTime) nextStory(); };
    }
    content.appendChild(element);

    renderProgressBars(currentIndex);
    startProgress(story);

    if(!story.views[currentLoggedUser]){ story.views[currentLoggedUser]=true; saveData(); }
    let vc=document.getElementById("viewCount");
    if(currentUser===currentLoggedUser){
        let txt=""; for(let u in story.reactions) txt+=story.reactions[u]+" ";
        vc.innerText="👁 "+Object.keys(story.views).length+" vues "+txt;
    } else vc.innerText="";
}

function renderProgressBars(active){
    let container=document.getElementById("progressContainer"); container.innerHTML="";
    users[currentUser].stories.forEach((s,i)=>{
        let bar=document.createElement("div"); bar.className="progress";
        let inner=document.createElement("div"); inner.className="progress-inner";
        inner.style.width = i<active ? "100%" : i>active ? "0%" : "0%";
        bar.appendChild(inner); container.appendChild(bar);
    });
}

function startProgress(story){
    let bars=document.querySelectorAll(".progress-inner"); let width=0;
    let dur=story.type==="image"?5000:(story.endTime-story.startTime)*1000;
    timer=setInterval(()=>{
        width+=100/(dur/50); if(bars[currentIndex]) bars[currentIndex].style.width=Math.min(width,100)+"%";
        if(width>=100){ clearInterval(timer); if(currentIndex<users[currentUser].stories.length-1) currentIndex++,showStory(); else closeViewer(); }
    },50);
}

function nextStory(){ if(currentIndex<users[currentUser].stories.length-1){ currentIndex++; showStory(); } else closeViewer(); }
function prevStory(){ if(currentIndex>0){ currentIndex--; showStory(); } }
function closeViewer(){ clearInterval(timer); document.getElementById("viewer").style.display="none"; }

/* ===== REACTIONS ===== */
function react(emoji){
    let storyId=currentUser+"_"+currentIndex;
    localReactions[storyId]=emoji; saveLocal();
    users[currentUser].stories[currentIndex].reactions[currentLoggedUser]=emoji;
    saveData();
}

/* ===== CADEAUX ===== */
function openGiftModal(){
    let modal=document.getElementById("giftModal"); modal.style.display="flex";
    document.getElementById("coinBalance").innerText="💰 "+(coins[currentLoggedUser]||0);
}
document.getElementById("closeGiftModal").onclick=()=>document.getElementById("giftModal").style.display="none";
document.querySelectorAll("#giftModal .gift-options button").forEach(btn=>{
    btn.onclick=function(){
        let cost=parseInt(this.dataset.cost);
        if((coins[currentLoggedUser]||0)>=cost){
            coins[currentLoggedUser]-=cost; saveCoins();
            document.getElementById("giftMessage").innerText="Cadeau envoyé !";
        } else document.getElementById("giftMessage").innerText="Solde insuffisant !";
    }
});

/* ===== INIT ===== */
renderStories();
