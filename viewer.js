// ===== VIEWER =====
function openViewer(u){
    if(!users[u] || users[u].stories.length === 0) return;

    currentUser = u;
    currentIndex = 0;

    document.getElementById("viewer").style.display = "flex";
    document.getElementById("hamburger").style.display = "none";

    showStory();
}

function closeViewer(){
    if(timer) clearInterval(timer);

    let video = document.querySelector("#content video");
    if(video){
        video.pause();
        video.currentTime = 0;
    }

    document.getElementById("viewer").style.display = "none";
    document.getElementById("hamburger").style.display = "block";
    document.getElementById("content").innerHTML = "";
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
    clearInterval(timer);

    let bars = document.querySelectorAll(".progress-inner");
    if(!bars[currentIndex]) return;

    let startTime = Date.now();

    timer = setInterval(() => {
        let elapsed = Date.now() - startTime;
        let percent = (elapsed / duration) * 100;

        bars[currentIndex].style.width = Math.min(percent, 100) + "%";

        if(percent >= 100){
            clearInterval(timer);
            nextStory();
        }
    }, 50);
}

// ===== STORY =====
function showStory(){
    clearInterval(timer);

    let s = users[currentUser].stories[currentIndex];

    renderProgressBars(currentIndex); // ✅ très important

    let c = document.getElementById("content");
    c.innerHTML = "";

    let e;

    // ===== IMAGE =====
if(s.type === "image"){
    let e = document.createElement("img");

    e.onload = () => {
        startProgress(5000);
    };

    e.src = s.url;
    c.appendChild(e);
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
    clearInterval(timer); // ⚠️ très important

    let userStories = users[currentUser].stories;
    currentIndex++;

    // fin des stories
    if(currentIndex >= userStories.length){
        closeViewer();
        return;
    }

    showStory(); // recharge la story suivante
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

// Ajouter le bouton
controls.appendChild(viewBtn);

controls.appendChild(viewBtn);
// ⚡ Bouton cadeau
let giftBtn = document.createElement("button");

giftBtn.innerHTML = "🎁 Envoyer un cadeau";

// 📍 position à gauche + descendu
giftBtn.style.position = "absolute";
giftBtn.style.top = "45px";   // 👈 descend (ajuste 40 / 50)
giftBtn.style.left = "10px";  // 👈 à gauche
giftBtn.style.zIndex = "9999";

// 🔥 alignement texte
giftBtn.style.display = "flex";
giftBtn.style.alignItems = "center";
giftBtn.style.whiteSpace = "nowrap";

// 🎨 style
giftBtn.style.background = "#FFD700";
giftBtn.style.color = "#000";
giftBtn.style.border = "none";
giftBtn.style.padding = "6px 12px";
giftBtn.style.borderRadius = "20px";
giftBtn.style.cursor = "pointer";

giftBtn.onclick = () => openGiftModal();

document.getElementById("viewer").appendChild(giftBtn);
// ⚡ Bouton supprimer (uniquement si c'est ton profil)
if(currentProfile.username === currentUser){

    let delBtn = document.createElement("button");
    delBtn.className = "deleteBtn";
    delBtn.innerText = "Supprimer";

    delBtn.style.position = "absolute";
    delBtn.style.top = "45px";
    delBtn.style.right = "10px";
    delBtn.style.zIndex = "9999";

    delBtn.style.background = "#ff4444";
    delBtn.style.color = "#fff";
    delBtn.style.border = "none";
    delBtn.style.padding = "6px 12px";
    delBtn.style.borderRadius = "20px";
    delBtn.style.cursor = "pointer";
    delBtn.style.whiteSpace = "nowrap";

    delBtn.onclick = () => {
        if(confirm("Supprimer cette story ?")){
            users[currentUser].stories.splice(currentIndex,1);
            saveData();

            if(users[currentUser].stories.length === 0){
                closeViewer();
                return;
            }

            if(currentIndex >= users[currentUser].stories.length){
                currentIndex = users[currentUser].stories.length - 1;
            }

            showStory();
        }
    };

    viewer.appendChild(delBtn);
}
function nextStory(){ if(currentIndex<users[currentUser].stories.length-1){ currentIndex++; showStory(); } }
function prevStory(){ if(currentIndex>0){ currentIndex--; showStory(); } }
function closeViewer(){
    clearInterval(timer);

    document.getElementById("viewer").style.display = "none";

    // 🔥 remettre le menu
    document.getElementById("hamburger").style.display = "block";
}
