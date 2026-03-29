/* ===== UPLOAD & PREVISUALISATION ===== */
let previewFile = null; // fichier en cours de prévisualisation

document.getElementById("fileInput").addEventListener("change", e=>{
    let file = e.target.files[0]; 
    if(!file) return;

    previewFile = file; // garder le fichier pour publication
    
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
    
        // // Progress + boutons
let controls = document.getElementById("progressControls");
controls.innerHTML = "";

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