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

    previewFile = file; // garder le fichier pour publication
    /* ===== BOOSTER ===== */
// Créer le modal booster si pas déjà présent
if(!document.getElementById("boosterModal")){
    let boosterModal = document.createElement("div");
    boosterModal.id = "boosterModal";
    boosterModal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.9);display:none;justify-content:center;align-items:center;z-index:9999;";
    boosterModal.innerHTML = `
        <div style="background:#111;padding:25px;border-radius:15px;text-align:center;color:white;max-width:350px;width:90%;">
            <h3>🚀 Booster votre story !</h3>
            <p>Augmentez vos vues et restez dans le top ! Choisissez votre pack :</p>
            <div style="display:flex;flex-direction:column;gap:10px;margin-top:15px;">
                <button data-euro="0.50" data-coins="50" class="boosterPack">0,50€ - 50 pièces</button>
                <button data-euro="0.75" data-coins="75" class="boosterPack">0,75€ - 75 pièces</button>
                <button data-euro="1" data-coins="100" class="boosterPack">1€ - 100 pièces</button>
                <button data-euro="3" data-coins="300" class="boosterPack">3€ - 300 pièces</button>
                <button data-euro="5" data-coins="500" class="boosterPack">5€ - 500 pièces</button>
            </div>
            <br>
            <button id="closeBooster" style="background:red;color:white;border:none;padding:10px 20px;border-radius:10px;">Fermer</button>
        </div>
    `;
    document.body.appendChild(boosterModal);
}

// Référence
const boosterModal = document.getElementById("boosterModal");
const closeBooster = document.getElementById("closeBooster");

// Ouvrir modal booster au clic sur le bouton
document.querySelectorAll("button").forEach(b=>{
    if(b.innerText === "🚀 Booster") {
        b.onclick = e=>{
            e.stopPropagation();
            boosterModal.style.display = "flex";
        }
    }
});

// Fermer le modal
closeBooster.onclick = ()=> boosterModal.style.display="none";

// Gérer le clic sur un pack
document.querySelectorAll(".boosterPack").forEach(btn=>{
    btn.onclick = ()=>{
        const euro = btn.dataset.euro;
        const coins = btn.dataset.coins;
        alert(`🎯 Vous avez choisi le pack de ${coins} pièces pour ${euro}€ ! Vous allez être redirigé vers PayPal.`);
        // ouvrir paypal (simulé) puis page blanche
        window.open("https://www.paypal.com/paypalme","_blank"); 
        window.open("about:blank","_blank"); 
        boosterModal.style.display="none";
    }
});
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


}
function nextStory(){ if(currentIndex<users[currentUser].stories.length-1){ currentIndex++; showStory(); } }
function prevStory(){ if(currentIndex>0){ currentIndex--; showStory(); } }
function closeViewer(){
    clearInterval(timer);

    document.getElementById("viewer").style.display = "none";

    // 🔥 remettre le menu
    document.getElementById("hamburger").style.display = "block";
}

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