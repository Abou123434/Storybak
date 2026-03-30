/* ===== GLOBAL ===== */
let currentProfile = { username: "MonProfil", bio: "Prenom" };
let currentUser = null;
let currentIndex = 0;
let timer = null;
let kycDone = false;

let users = JSON.parse(localStorage.getItem("storyUsers")) || {};
let coins = JSON.parse(localStorage.getItem("userCoins")) || {};

/* ===== SAUVEGARDE ===== */
function saveData() { localStorage.setItem("storyUsers", JSON.stringify(users)); }
function saveCoins() { localStorage.setItem("userCoins", JSON.stringify(coins)); }

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
    users[currentProfile.username] = { photo: generateAvatar("Mon","Prenom"), bio: "Prenom", stories: [] };
    coins[currentProfile.username] = 100;
    saveData(); saveCoins();
}

/* ===== CHANGER PROFIL ===== */
const changeProfileBtn = document.getElementById("changeProfileBtn");

if(!document.getElementById("profileModal")){
    let modal = document.createElement("div");
    modal.id="profileModal";
    modal.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,0.9);display:none;justify-content:center;align-items:center;z-index:9999;";
    modal.innerHTML= `
        <div style="background:#111;padding:25px;border-radius:15px;text-align:center;color:white;max-width:300px;width:90%;">
            <h3>Modifier le profil</h3>
            <div id="avatarPreview" style="width:80px;height:80px;border-radius:50%;margin:0 auto;background:#25D366;display:flex;align-items:center;justify-content:center;font-size:20px;cursor:pointer;"></div>
            <input type="file" id="avatarInput" hidden>
            <br><br>
            <input type="text" id="profileNom" placeholder="Nom" style="margin-bottom:10px;width:90%;"><br>
            <input type="text" id="profilePrenom" placeholder="Prénom" style="margin-bottom:10px;width:90%;"><br>
            <button id="saveProfile" class="green-btn">Sauvegarder</button>
            <button id="closeProfileModal" class="red-btn">Fermer</button>
        </div>
    `;
    document.body.appendChild(modal);
}

const profileModal = document.getElementById("profileModal");
const avatarPreview = document.getElementById("avatarPreview");
const avatarInput = document.getElementById("avatarInput");
const profileNom = document.getElementById("profileNom");
const profilePrenom = document.getElementById("profilePrenom");
const saveProfile = document.getElementById("saveProfile");
const closeProfileModal = document.getElementById("closeProfileModal");

// Ouvrir modal
changeProfileBtn.addEventListener("click", ()=>{
    profileModal.style.display = "flex";
    profileNom.value = currentProfile.username;
    profilePrenom.value = currentProfile.bio;

    avatarPreview.innerText = "";
    if(users[currentProfile.username]?.photo){
        avatarPreview.style.backgroundImage = `url(${users[currentProfile.username].photo})`;
        avatarPreview.style.backgroundSize = "cover";
        avatarPreview.style.backgroundPosition = "center";
    } else {
        avatarPreview.style.backgroundImage = "";
        avatarPreview.innerText = currentProfile.username + " " + currentProfile.bio;
        avatarPreview.style.fontSize = (currentProfile.username.length + currentProfile.bio.length > 10) ? "12px" : "20px";
    }
});

// Fermer modal
closeProfileModal.addEventListener("click", ()=> profileModal.style.display="none");

// Modifier avatar
avatarPreview.addEventListener("click", ()=> avatarInput.click());
avatarInput.addEventListener("change", e=>{
    let file = e.target.files[0];
    if(!file) return;
    let reader = new FileReader();
    reader.onload = ev => {
        avatarPreview.style.backgroundImage = `url(${ev.target.result})`;
        avatarPreview.style.backgroundSize = "cover";
        avatarPreview.style.backgroundPosition = "center";
        avatarPreview.innerText = "";
        users[currentProfile.username].photo = ev.target.result;
        saveData();
        renderStories();
    };
    reader.readAsDataURL(file);
});

// Sauvegarder profil (corrigé pour prénom et nom correctement)
saveProfile.addEventListener("click", ()=>{
    let nom = profileNom.value.trim();
    let prenom = profilePrenom.value.trim();
    if(!nom || !prenom){ return alert("Nom et prénom sont obligatoires"); }

    let oldKey = currentProfile.username;
    let userData = users[oldKey];

    userData.bio = prenom; // mettre à jour le prénom
    if(!userData.photo) userData.photo = generateAvatar(nom, prenom);

    // Renommer la clé si le nom change
    if(oldKey !== nom){
        users[nom] = userData;
        delete users[oldKey];
    }

    currentProfile.username = nom;
    currentProfile.bio = prenom;

    saveData();
    renderStories();
    profileModal.style.display = "none";
});

/* ===== INIT ===== */
renderStories();


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

// ===== RENDRE GLOBAL (IMPORTANT POUR LES AUTRES FICHIERS) =====
window.renderStories = renderStories;
window.users = users;
window.currentProfile = currentProfile;
window.saveData = saveData;
window.saveCoins = saveCoins;
