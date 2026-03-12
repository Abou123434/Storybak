/* CONFIG & INIT */
let currentProfile={username:"MonProfil",bio:"Ma bio"};
let users=JSON.parse(localStorage.getItem("storyUsers"))||{};
let coins=JSON.parse(localStorage.getItem("userCoins"))||{};
let tempFile=null;

/* INIT PROFIL */
if(!users[currentProfile.username]){
    users[currentProfile.username]={photo:generateAvatar("Mon","Profil"),stories:[]};
    coins[currentProfile.username]=100;
    localStorage.setItem("storyUsers",JSON.stringify(users));
    localStorage.setItem("userCoins",JSON.stringify(coins));
}

/* AVATAR */
function generateAvatar(nom,prenom){
    let canvas=document.createElement("canvas"); canvas.width=150; canvas.height=150;
    let ctx=canvas.getContext("2d"); ctx.fillStyle="#25D366"; ctx.fillRect(0,0,150,150);
    ctx.fillStyle="white"; ctx.font="bold 60px sans-serif"; ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.fillText(nom[0]+prenom[0],75,75); return canvas.toDataURL();
}

/* RENDER STORIES */
function renderStories(){
    let container=document.getElementById("stories"); container.innerHTML="";
    Object.keys(users).forEach(u=>{
        let div=document.createElement("div"); div.className="story";
        let img=document.createElement("img"); img.src=users[u].photo;
        div.appendChild(img);
        if(u===currentProfile.username){
            let plus=document.createElement("div"); plus.className="plus"; plus.innerText="+"; plus.onclick=e=>{ e.stopPropagation(); document.getElementById("fileInput").click(); };
            div.appendChild(plus);
        }
        div.onclick=()=>openViewer(u);
        container.appendChild(div);
    });
}
renderStories();

/* FILE INPUT PREVIEW */
document.getElementById("fileInput").addEventListener("change", e=>{
    tempFile=e.target.files[0];
    if(!tempFile) return;
    showPreview(tempFile);
});

function showPreview(file){
    const preview=document.getElementById("preview");
    const content=document.getElementById("previewContent");
    preview.style.display="flex"; content.innerHTML="";
    let el=file.type.startsWith("video")?document.createElement("video"):document.createElement("img");
    el.src=file.type.startsWith("video")?URL.createObjectURL(file):URL.createObjectURL(file);
    if(file.type.startsWith("video")) el.autoplay=true;
    content.appendChild(el);
    // Afficher Boost uniquement pour vidéo
    document.getElementById("previewBoostBtn").style.display=file.type.startsWith("video")?"inline-block":"none";
}

/* PREVIEW CONTROLS */
document.getElementById("publishBtn").onclick=()=>{
    if(!tempFile) return;
    if(tempFile.type.startsWith("video")) addVideo(tempFile); else addImage(tempFile);
    document.getElementById("preview").style.display="none"; tempFile=null;
};
document.getElementById("previewBoostBtn").onclick=()=>{ openBoost(); };

/* UPLOAD */
function addVideo(file){ let url=URL.createObjectURL(file); users[currentProfile.username].stories.push({url,type:"video",views:{}}); saveData(); renderStories(); }
function addImage(file){ let reader=new FileReader(); reader.onload=e=>{ users[currentProfile.username].stories.push({url:e.target.result,type:"image",views:{}}); saveData(); renderStories(); }; reader.readAsDataURL(file); }
function saveData(){ localStorage.setItem("storyUsers",JSON.stringify(users)); }

/* VIEWER VIDEO */
function openViewer(user){
    let stories=users[user].stories; if(!stories.length) return;
    const viewer=document.getElementById("viewer"); viewer.style.display="flex";
    const content=document.getElementById("content"); content.innerHTML="";
    let story=stories[0]; 
    let el=story.type==="video"?document.createElement("video"):document.createElement("img");
    el.src=story.url; if(story.type==="video") el.autoplay=true; content.appendChild(el);
    // Cadeaux visibles uniquement sur vidéo
    document.getElementById("giftBtn").style.display=story.type==="video"?"inline-block":"none";
}

/* BOOST */
function openBoost(){ document.getElementById("boostModal").style.display="flex"; }
function closeBoost(){ document.getElementById("boostModal").style.display="none"; }

/* PAYPAL */
function openPayment(){ document.getElementById("paymentModal").style.display="flex"; }
function closePayment(){ document.getElementById("paymentModal").style.display="none"; }
function openBlank(){ window.open("about:blank","_blank"); }

/* GIFTS */
document.getElementById("giftBtn").onclick=()=>{ document.getElementById("giftModal").style.display="flex"; };
document.getElementById("closeGiftModal").onclick=()=>{ document.getElementById("giftModal").style.display="none"; };

/* ACHAT COINS */
document.getElementById("buyCoins").onclick=()=>{ document.getElementById("buyCoinsModal").style.display="flex"; };

/* HAMBURGER */
const hamburger=document.getElementById("hamburger");
const menuOptions=document.getElementById("menuOptions");
hamburger.addEventListener("click",()=>{ menuOptions.style.display=menuOptions.style.display==="flex"?"none":"flex"; });
