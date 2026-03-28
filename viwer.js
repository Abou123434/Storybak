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

        // ⏱ nombre réel de segments possibles
        let totalSegments = Math.ceil(duration / 30);

        // 🔒 limite à 3 segments maximum par vidéo
        let segmentsToAdd = Math.min(totalSegments, 3);

        for(let i = 0; i < segmentsToAdd; i++){
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

// ===== VIEWER =====
function openViewer(u){
    if(users[u].stories.length === 0) return;

    currentUser = u;
    currentIndex = 0;

    document.getElementById("viewer").style.display = "flex";
    document.getElementById("hamburger").style.display = "none";

    showStory();
}

function closeViewer(){
    clearInterval(timer);

    let video = document.querySelector("#content video");
    if(video){
        video.pause();
        video.currentTime = 0;
    }

    document.getElementById("viewer").style.display = "none";
    document.getElementById("hamburger").style.display = "block";
}

// ===== PROGRESS =====
function renderProgressBars(activeIndex){
    let container = document.getElementById("progressContainer");
    container.innerHTML = "";

    let stories = users[currentUser].stories;

    stories.forEach((s, i) => {
        let bar = document.createElement("div");
        bar.className = "progress";

        let inner = document.createElement("div");
        inner.className = "progress-inner";

        if(i < activeIndex) inner.style.width = "100%";
        else inner.style.width = "0%";

        bar.appendChild(inner);
        container.appendChild(bar);
    });
}

function startProgress(duration){
    let bars = document.querySelectorAll(".progress-inner");

    if(!bars[currentIndex]) return;

    let width = 0;

    clearInterval(timer);

    timer = setInterval(() => {
        width += 100 / (duration / 50);

        bars[currentIndex].style.width = Math.min(width, 100) + "%";

        if(width >= 100){
            clearInterval(timer);

            nextStory();
        }
    }, 50);
}

// ===== STORY =====
function showStory(){
    clearInterval(timer);

    let s = users[currentUser].stories[currentIndex];

    renderProgressBars(currentIndex);

    let c = document.getElementById("content");
    c.innerHTML = "";

    let e;

    // ===== IMAGE =====
    if(s.type === "image"){
        e = document.createElement("img");
        e.src = s.url;
        c.appendChild(e);

        startProgress(5000);
    }

    // ===== VIDEO =====
    else {
        e = document.createElement("video");
        e.src = s.url;
        e.autoplay = true;
        e.muted = false;
        e.controls = false;

        c.appendChild(e);

        e.onloadedmetadata = () => {
            e.currentTime = s.start;
            e.play();
        };

        e.ontimeupdate = () => {
            if(e.currentTime >= s.end){
                e.pause();
                nextStory();
            }
        };

        startProgress((s.end - s.start) * 1000);
    }
        // ===== VUES =====
    if(!s.views[currentProfile.username]){
        s.views[currentProfile.username] = true;
        saveData();
    }
}

// ===== NEXT =====
function nextStory(){
    if(currentIndex < users[currentUser].stories.length - 1){
        currentIndex++;
        showStory();
    } else {
        closeViewer();
    }
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

/* ===== REACTIONS ===== */

function react(emoji){
    let story = users[currentUser].stories[currentIndex];

    // créer reactions si ça existe pas
    if(!story.reactions){
        story.reactions = {};
    }

    // sauvegarder la réaction
    story.reactions[currentProfile.username] = emoji;

    saveData();

    // animation
    showReaction(emoji);
}

// Création du bouton compteur
let controls = document.getElementById("progressControls");
controls.innerHTML = "";

// Récupérer les vues
let views = s.views || {};

// Bouton vues
let viewBtn = document.createElement("button");
viewBtn.innerText = "👁 " + Object.keys(views).length + " vues";
viewBtn.style.background = "#333";
viewBtn.style.border = "none";
viewBtn.style.color = "white";
viewBtn.style.cursor = "pointer";
viewBtn.style.fontSize = "14px";
viewBtn.style.padding = "5px 10px";
viewBtn.style.borderRadius = "10px";

// CLICK
viewBtn.onclick = () => {

    let viewers = Object.values(views);

    if (viewers.length === 0) {
        alert("Aucune vue pour le moment 😢");
        return;
    }
        // OVERLAY (fond sombre)
    let overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = "rgba(0,0,0,0.6)";
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.zIndex = "9999";

    // BOITE
    let box = document.createElement("div");
    box.style.background = "#fff";
    box.style.borderRadius = "20px";
    box.style.padding = "15px";
    box.style.width = "300px";
    box.style.maxHeight = "400px";
    box.style.overflowY = "auto";
    box.style.boxShadow = "0 5px 20px rgba(0,0,0,0.3)";

    // TITRE
    let title = document.createElement("h3");
    title.innerText = "👀 Vus par";
    title.style.textAlign = "center";
    title.style.marginBottom = "10px";
    box.appendChild(title);

    // LISTE DES UTILISATEURS
    viewers.forEach(user => {

        let username = user.name || "Utilisateur";

        let avatar = (user.avatar && user.avatar.startsWith("http"))
            ? user.avatar
            : "https://i.pravatar.cc/150?u=" + username;

        let time = user.time || "à l'instant";

        let row = document.createElement("div");
        row.style.display = "flex";
        row.style.alignItems = "center";
        row.style.padding = "10px";
        row.style.borderBottom = "1px solid #eee";

        let img = document.createElement("img");
        img.src = avatar;
        img.style.width = "45px";
        img.style.height = "45px";
        img.style.borderRadius = "50%";
        img.style.marginRight = "10px";

        // Si image cassée
        img.onerror = () => {
            img.src = "https://i.pravatar.cc/150?u=" + username;
        };

        let textBox = document.createElement("div");

        let name = document.createElement("div");
        name.innerText = username;
        name.style.fontWeight = "bold";

        let seenTime = document.createElement("div");
        seenTime.innerText = "vu " + time;
        seenTime.style.fontSize = "12px";
        seenTime.style.color = "gray";

        textBox.appendChild(name);
        textBox.appendChild(seenTime);

        row.appendChild(img);
        row.appendChild(textBox);

        box.appendChild(row);
    });
    
        // BOUTON FERMER
    let closeBtn = document.createElement("button");
    closeBtn.innerText = "Fermer";
    closeBtn.style.marginTop = "10px";
    closeBtn.style.width = "100%";
    closeBtn.style.padding = "10px";
    closeBtn.style.border = "none";
    closeBtn.style.borderRadius = "10px";
    closeBtn.style.background = "#25D366";
    closeBtn.style.color = "white";
    closeBtn.style.cursor = "pointer";

    closeBtn.onclick = () => document.body.removeChild(overlay);

    box.appendChild(closeBtn);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
};