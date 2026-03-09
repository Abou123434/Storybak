// PROFIL
let currentProfile = {
  username: "MonProfil",
  bio: "Ma bio ici"
};

let currentUser = null;
let currentIndex = 0;
let timer = null;

let users = JSON.parse(localStorage.getItem("storyUsers")) || {};
let localReactions = JSON.parse(localStorage.getItem("localReactions")) || {};
let coins = JSON.parse(localStorage.getItem("userCoins")) || {};

// Si le profil n'existe pas, le créer
if(!users[currentProfile.username]){
  users[currentProfile.username] = { photo: generateAvatar("Mon","Profil"), stories:[], reactions:{} };
  coins[currentProfile.username] = 100;
  localStorage.setItem("storyUsers", JSON.stringify(users));
  localStorage.setItem("userCoins", JSON.stringify(coins));
}

// Génération avatar par défaut
function generateAvatar(nom, prenom){
  let canvas = document.createElement("canvas");
  canvas.width = 150; canvas.height = 150;
  let ctx = canvas.getContext("2d");
  ctx.fillStyle="#25D366"; ctx.fillRect(0,0,150,150);
  ctx.fillStyle="white"; ctx.font="bold 60px sans-serif";
  ctx.textAlign="center"; ctx.textBaseline="middle";
  ctx.fillText(nom[0].toUpperCase()+prenom[0].toUpperCase(),75,75);
  return canvas.toDataURL();
}

/* STORIES */
function renderStories(){
  let container = document.getElementById("stories");
  container.innerHTML = "";

  let usernames = Object.keys(users);
  usernames.sort((a,b) => (a===currentProfile.username ? -1 : b===currentProfile.username ? 1 : 0));

  usernames.forEach(username=>{
    let div = document.createElement("div");
    div.className = "story";

    let img = document.createElement("img");
    img.src = users[username].photo;

    let name = document.createElement("p");
    name.innerText = username.replace("_"," ");

    let plus = document.createElement("div");
    plus.className = "plus"; plus.innerText = "+";
    if(username === currentProfile.username){
      plus.onclick = (e)=>{
        e.stopPropagation();
        document.getElementById("fileInput").click();
      };
    } else plus.style.display = "none";

    div.appendChild(img);
    div.appendChild(plus);
    div.appendChild(name);

    div.onclick = ()=>openViewer(username);

    container.appendChild(div);
  });
}

/* AJOUT STORY */
document.getElementById("fileInput").addEventListener("change", async function(e){
  let file = e.target.files[0];
  if(!file) return;

  let userStories = users[currentProfile.username].stories;
  let videoCount = userStories.filter(s=>s.type==="video").length;
  let imageCount = userStories.filter(s=>s.type==="image").length;

  if(file.type.startsWith("video")){
    if(videoCount >= 5){ alert("Max 5 vidéos."); return; }
    await addVideoWithSegments(file);
  } else {
    if(imageCount >= 10){ alert("Max 10 images."); return; }
    await addImageStory(file);
  }
});

/* Découpage vidéo en segments de 10s max */
async function addVideoWithSegments(file){
  let url = URL.createObjectURL(file);
  let video = document.createElement("video");
  video.src = url;
  video.preload = "metadata";

  await new Promise(res => video.onloadedmetadata = res);
  let duration = video.duration;
  let segments = Math.ceil(duration / 10);

  for(let i=0; i<segments; i++){
    if(users[currentProfile.username].stories.filter(s=>s.type==="video").length >= 5) break;

    users[currentProfile.username].stories.push({
      url: url,
      type: "video",
      startTime: i*10,
      endTime: Math.min((i+1)*10,duration),
      time: Date.now(),
      views:{},
      reactions:{}
    });
  }
  saveData();
  renderStories();
}

/* Ajout image */
function addImageStory(file){
  return new Promise((resolve)=>{
    if(users[currentProfile.username].stories.filter(s=>s.type==="image").length >= 10){
      alert("Max 10 images."); resolve(); return;
    }

    let reader = new FileReader();
    reader.onload = function(e){
      users[currentProfile.username].stories.push({
        url: e.target.result,
        type: "image",
        time: Date.now(),
        views:{},
        reactions:{}
      });
      saveData();
      renderStories();
      resolve();
    };
    reader.readAsDataURL(file);
  });
}

/* VIEWER */
function openViewer(user){
  if(users[user].stories.length === 0) return;
  currentUser = user; currentIndex = 0;
  document.getElementById("viewer").style.display = "flex";
  showStory();
}

/* PROGRESS */
function renderProgressBars(activeIndex){
  let container = document.getElementById("progressContainer");
  container.innerHTML = "";
  let stories = users[currentUser].stories;
  stories.forEach((s,i)=>{
    let bar = document.createElement("div");
    bar.className = "progress";
    bar.style.marginTop = "23px"; // 23px marge au-dessus
    let inner = document.createElement("div");
    inner.className = "progress-inner";
    if(i<activeIndex) inner.style.width = "100%";
    if(i>activeIndex) inner.style.width = "0%";
    bar.appendChild(inner);
    container.appendChild(bar);
  });
}

function startProgress(story){
  let bars = document.querySelectorAll(".progress-inner");
  let width = 0;
  let duration = story.type==="image"?5000:(story.endTime - story.startTime)*1000;

  timer = setInterval(()=>{
    if(!users[currentUser] || !users[currentUser].stories[currentIndex]){
      clearInterval(timer);
      closeViewer();
      return;
    }
    width += 100/(duration/50);
    bars[currentIndex].style.width = Math.min(width,100)+"%";

    if(width >= 100){
      clearInterval(timer);
      if(currentIndex < users[currentUser].stories.length - 1){
        currentIndex++;
        showStory();
      } else closeViewer();
    }
  },50);
}

/* SHOW STORY */
function showStory(){
  clearInterval(timer);

  if(!users[currentUser] || !users[currentUser].stories[currentIndex]){
    closeViewer(); return;
  }

  let story = users[currentUser].stories[currentIndex];
  let content = document.getElementById("content");
  content.innerHTML = "";

  let element;
  if(story.type==="image"){
    element = document.createElement("img"); element.src = story.url;
  } else {
    element = document.createElement("video");
    element.src = story.url;
    element.autoplay = true;
    element.muted = false;
    element.currentTime = story.startTime;
    element.ontimeupdate = ()=>{ if(element.currentTime>=story.endTime) nextStory(); };
  }
  content.appendChild(element);

  let oldControls = document.getElementById("progressControls");
  if(oldControls) oldControls.remove();

  let progressControls = document.createElement("div");
  progressControls.id = "progressControls";
  progressControls.style.position = "absolute";
  progressControls.style.top = "10px"; // en haut
  progressControls.style.left = "10px";
  progressControls.style.right = "10px";
  progressControls.style.display = "flex";
  progressControls.style.justifyContent = "space-between";
  document.getElementById("viewer").appendChild(progressControls);

  // Bouton cadeau 🎁
  let giftBtn = document.createElement("button");
  giftBtn.innerText = "🎁";
  giftBtn.style.background="#FFD700";
  giftBtn.style.color="#000";
  giftBtn.style.border="none";
  giftBtn.style.padding="5px 10px";
  giftBtn.style.borderRadius="5px";
  giftBtn.style.cursor="pointer";
  giftBtn.onclick = ()=>openGiftModal();
  progressControls.appendChild(giftBtn);

  // Bouton Supprimer
  if(currentProfile.username === currentUser){
    let deleteBtn = document.createElement("button");
    deleteBtn.innerText = "🗑️";
    deleteBtn.style.background="red";
    deleteBtn.style.color="white";
    deleteBtn.style.border="none";
    deleteBtn.style.padding="5px 10px";
    deleteBtn.style.borderRadius="5px";
    deleteBtn.style.cursor="pointer";

    deleteBtn.onclick = (e)=>{
      e.stopPropagation();
      if(confirm("Supprimer cette story ?")){
        clearInterval(timer);
        let video = document.getElementById("content").querySelector("video");
        if(video){ video.pause(); video.src=""; video.load(); }
        users[currentUser].stories.splice(currentIndex,1);
        saveData();
        if(users[currentUser].stories.length === 0){ closeViewer(); return; }
        if(currentIndex >= users[currentUser].stories.length){ currentIndex = users[currentUser].stories.length -1; }
        showStory();
      }
    };
    progressControls.appendChild(deleteBtn);
  }

  // Ne pas afficher le menu dans le viewer
  document.getElementById("hamburgerContainer").style.display = "none";

  renderProgressBars(currentIndex);

  // Vues
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

  startProgress(story);
}

/* REACTIONS */
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

/* NEXT / PREV */
function nextStory(){ if(currentIndex<users[currentUser].stories.length-1){ currentIndex++; showStory(); } else closeViewer(); }
function prevStory(){ if(currentIndex>0){ currentIndex--; showStory(); } }
function closeViewer(){ clearInterval(timer); document.getElementById("viewer").style.display="none"; document.getElementById("hamburgerContainer").style.display="flex"; }

/* --- MODAL CADEAU --- */
function openGiftModal(){
  let modal=document.getElementById("giftModal");
  modal.style.display="flex";
  updateCoinBalance();
}
function updateCoinBalance(){
  let balance=document.getElementById("coinBalance");
  balance.innerText="💰 "+(coins[currentProfile.username]||0);
}
document.getElementById("closeGiftModal").onclick=()=>{ document.getElementById("giftModal").style.display="none"; };
document.querySelectorAll("#giftModal .gift-options button").forEach(btn=>{
  btn.onclick=function(){
    let cost=parseInt(this.dataset.cost);
    if((coins[currentProfile.username]||0) >= cost){
      coins[currentProfile.username]-=cost;
      saveCoins();
      document.getElementById("giftMessage").innerText="Cadeau envoyé !";
      updateCoinBalance();
    } else {
      document.getElementById("giftMessage").innerText="Solde insuffisant !";
    }
  }
});

/* --- HAMBURGER MENU --- */
const hamburger = document.getElementById("hamburger");
const menuOptions = document.getElementById("menuOptions");
hamburger.addEventListener("click", ()=>{
  menuOptions.style.display = menuOptions.style.display === "flex" ? "none" : "flex";
});

/* INIT */
renderStories();
