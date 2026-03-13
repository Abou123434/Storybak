/* CONFIG */
let currentProfile={username:"MonProfil",bio:"Ma bio"};
let currentUser=null,currentIndex=0,timer=null;
let users=JSON.parse(localStorage.getItem("storyUsers"))||{};
let coins=JSON.parse(localStorage.getItem("userCoins"))||{};

let selectedFile=null;

/* Sauvegarde */
function saveData(){localStorage.setItem("storyUsers",JSON.stringify(users));}
function saveCoins(){localStorage.setItem("userCoins",JSON.stringify(coins));}

/* Création profil initial */
if(!users[currentProfile.username]){
users[currentProfile.username]={photo:generateAvatar("Mon","Profil"),stories:[]};
coins[currentProfile.username]=100;
saveData();
saveCoins();
}

/* AVATAR */
function generateAvatar(nom,prenom){

let canvas=document.createElement("canvas");
canvas.width=150;
canvas.height=150;

let ctx=canvas.getContext("2d");

ctx.fillStyle="#25D366";
ctx.fillRect(0,0,150,150);

ctx.fillStyle="white";
ctx.font="bold 60px sans-serif";
ctx.textAlign="center";
ctx.textBaseline="middle";

ctx.fillText(nom[0]+prenom[0],75,75);

return canvas.toDataURL();
}

/* STORIES */

function renderStories(){

let container=document.getElementById("stories");
container.innerHTML="";

Object.keys(users).forEach(u=>{

let div=document.createElement("div");
div.className="story";

let img=document.createElement("img");
img.src=users[u].photo;

let plus=document.createElement("div");
plus.className="plus";
plus.innerText="+";

if(u===currentProfile.username){
plus.onclick=e=>{
e.stopPropagation();
document.getElementById("fileInput").click();
};
}else{
plus.style.display="none";
}

div.appendChild(img);
div.appendChild(plus);

container.appendChild(div);

div.onclick=()=>openViewer(u);

});

}

/* PREVIEW AVANT PUBLICATION */

document.getElementById("fileInput").addEventListener("change",e=>{

let file=e.target.files[0];
if(!file)return;

selectedFile=file;

let preview=document.getElementById("previewMedia");
preview.innerHTML="";

if(file.type.startsWith("video")){

let video=document.createElement("video");
video.src=URL.createObjectURL(file);
video.controls=true;
preview.appendChild(video);

}else{

let img=document.createElement("img");
img.src=URL.createObjectURL(file);
preview.appendChild(img);

}

document.getElementById("previewModal").style.display="flex";

});

/* PUBLIER */

document.getElementById("publishBtn").onclick=()=>{

if(!selectedFile)return;

if(selectedFile.type.startsWith("video")){
addVideo(selectedFile);
}else{
addImage(selectedFile);
}

document.getElementById("previewModal").style.display="none";

selectedFile=null;

};

/* AJOUT STORY */

function addVideo(file){

let url=URL.createObjectURL(file);

users[currentProfile.username].stories.push({
url,
type:"video",
views:{}
});

saveData();
renderStories();

}

function addImage(file){

let reader=new FileReader();

reader.onload=e=>{

users[currentProfile.username].stories.push({
url:e.target.result,
type:"image",
views:{}
});

saveData();
renderStories();

};

reader.readAsDataURL(file);

}

/* VIEWER */

function openViewer(u){

if(users[u].stories.length===0)return;

currentUser=u;
currentIndex=0;

document.getElementById("viewer").style.display="flex";

showStory();

}

function renderProgressBars(){

let c=document.getElementById("progressContainer");
c.innerHTML="";

users[currentUser].stories.forEach((s,i)=>{

let bar=document.createElement("div");
bar.className="progress";

let inner=document.createElement("div");
inner.className="progress-inner";

if(i<currentIndex) inner.style.width="100%";

bar.appendChild(inner);
c.appendChild(bar);

});

}

function startProgress(s){

let bars=document.querySelectorAll(".progress-inner");
let w=0;

let dur=s.type==="image"?5000:10000;

timer=setInterval(()=>{

w+=100/(dur/50);

bars[currentIndex].style.width=Math.min(w,100)+"%";

if(w>=100){

clearInterval(timer);

if(currentIndex<users[currentUser].stories.length-1){
currentIndex++;
showStory();
}else{
closeViewer();
}

}

},50);

}

function showStory(){

clearInterval(timer);

let s=users[currentUser].stories[currentIndex];

let c=document.getElementById("content");
c.innerHTML="";

let e;

if(s.type==="image"){
e=document.createElement("img");
}else{
e=document.createElement("video");
e.autoplay=true;
}

e.src=s.url;

c.appendChild(e);

if(!s.views[currentProfile.username]){
s.views[currentProfile.username]=true;
saveData();
}

document.getElementById("viewCount").innerText="👁 "+Object.keys(s.views).length+" vues";

renderProgressBars();
startProgress(s);

let controls=document.getElementById("progressControls");
controls.innerHTML="";

let giftBtn=document.createElement("button");
giftBtn.innerText="🎁 Envoyer un cadeau";
giftBtn.onclick=openGiftModal;

controls.appendChild(giftBtn);

if(currentProfile.username===currentUser){

let delBtn=document.createElement("button");
delBtn.innerText="Supprimer";

delBtn.onclick=()=>{

if(confirm("Supprimer cette story ?")){

users[currentUser].stories.splice(currentIndex,1);

saveData();

if(users[currentUser].stories.length===0){
closeViewer();
return;
}

showStory();

}

};

controls.appendChild(delBtn);

}

}

function nextStory(){

if(currentIndex<users[currentUser].stories.length-1){
currentIndex++;
showStory();
}

}

function prevStory(){

if(currentIndex>0){
currentIndex--;
showStory();
}

}

function closeViewer(){

clearInterval(timer);

document.getElementById("viewer").style.display="none";

}

/* CADEAUX */

let selectedGiftCost=0,selectedGiftEmoji="";

function openGiftModal(){

document.getElementById("giftModal").style.display="flex";

updateCoinBalance();

}

function updateCoinBalance(){

document.getElementById("coinBalance").innerText="Solde "+(coins[currentProfile.username]||0)+" 💰";

}

document.getElementById("closeGiftModal").onclick=()=>{

document.getElementById("giftModal").style.display="none";

};

document.querySelectorAll("#giftModal .gift-options button").forEach(b=>{

b.onclick=()=>{

selectedGiftCost=parseInt(b.dataset.cost);
selectedGiftEmoji=b.innerText;

openGiftQuantityModal();

};

});

function openGiftQuantityModal(){

let m=document.createElement("div");

m.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,0.9);display:flex;justify-content:center;align-items:center;z-index:9999;";

let box=document.createElement("div");

box.style.cssText="background:#111;padding:25px;border-radius:15px;text-align:center;";

box.innerHTML=`<h3>Quantité pour ${selectedGiftEmoji}</h3>
<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;">
<button onclick="sendGift(1)">×1</button>
<button onclick="sendGift(2)">×2</button>
<button onclick="sendGift(5)">×5</button>
<button onclick="sendGift(7)">×7</button>
<button onclick="sendGift(10)">×10</button>
</div><br>
<button onclick="closeGiftQuantity()">Fermer</button>`;

m.appendChild(box);

document.body.appendChild(m);

}

function closeGiftQuantity(){

let m=document.querySelector("body > div:last-child");

if(m)m.remove
