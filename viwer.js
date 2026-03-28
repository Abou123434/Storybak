
let currentUser=null;
let currentIndex=0;
let timer=null;

/* ===== OUVRIR / FERMER VIEWER ===== */
function openViewer(u){
    if(users[u].stories.length===0) return;
    currentUser=u;
    currentIndex=0;
    document.getElementById("viewer").style.display="flex";
    showStory();
}

function closeViewer(){
    clearInterval(timer);
    document.getElementById("viewer").style.display="none";
}

/* ===== BARRES PROGRESSION ===== */
function renderProgressBars(activeIndex){
    let container=document.getElementById("progressContainer");
    container.innerHTML="";
    users[currentUser].stories.forEach((s,i)=>{
        let bar=document.createElement("div");
        bar.className="progress";
        let inner=document.createElement("div");
        inner.className="progress-inner";
        if(i<activeIndex) inner.style.width="100%";
        bar.appendChild(inner);
        container.appendChild(bar);
    });
}

function startProgress(duration){
    let bars=document.querySelectorAll(".progress-inner");
    let width=0;
    clearInterval(timer);
    timer=setInterval(()=>{
        width+=100/(duration/50);
        bars[currentIndex].style.width=Math.min(width,100)+"%";
        if(width>=100) nextStory();
    },50);
}

/* ===== AFFICHER STORY ===== */
function showStory(){
    let s=users[currentUser].stories[currentIndex];
    renderProgressBars(currentIndex);

    let c=document.getElementById("content");
    c.innerHTML="";

    let e;
    if(s.type==="image"){
        e=document.createElement("img");
        e.src=s.url;
        startProgress(5000);
    }else{
        e=document.createElement("video");
        e.src=s.url;
        e.autoplay=true;
        e.onloadedmetadata=()=>{ e.currentTime=s.start; e.play(); };
        e.ontimeupdate=()=>{ if(e.currentTime>=s.end) nextStory(); };
        startProgress((s.end-s.start)*1000);
    }
    c.appendChild(e);

    // ajouter vue
    if(!s.views[currentProfile.username]){
        s.views[currentProfile.username]=true;
        saveData();
    }

    addViewerButtons();
}

/* ===== NEXT ===== */
function nextStory(){
    if(currentIndex < users[currentUser].stories.length-1){
        currentIndex++;
        showStory();
    }else closeViewer();
}

/* ===== BOUTONS VUES + SUPPRIMER ===== */
function addViewerButtons(){
    let controls=document.getElementById("progressControls");
    controls.innerHTML="";

    let s=users[currentUser].stories[currentIndex];

    let viewBtn=document.createElement("button");
    viewBtn.innerText="👁 "+Object.keys(s.views).length+" vues";
    controls.appendChild(viewBtn);

    if(currentProfile.username===currentUser){
        let delBtn=document.createElement("button");
        delBtn.innerText="Supprimer";
        delBtn.onclick=()=>{
            users[currentUser].stories.splice(currentIndex,1);
            saveData();
            nextStory();
        };
        controls.appendChild(delBtn);
    }
            }
