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

function saveData(){localStorage.setItem("storyUsers",JSON.stringify(users));}
function saveLocal(){localStorage.setItem("localReactions",JSON.stringify(localReactions));}
function saveCoins(){localStorage.setItem("userCoins",JSON.stringify(coins));}

if(!users[currentProfile.username]){
users[currentProfile.username]={
photo:generateAvatar("Mon","Profil"),
stories:[]
};
coins[currentProfile.username]=100;
saveData();
saveCoins();
}

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

Object.keys(users).forEach(username=>{

let div=document.createElement("div");
div.className="story";

let img=document.createElement("img");
img.src=users[username].photo;

let name=document.createElement("p");
name.innerText=username;

let plus=document.createElement("div");
plus.className="plus";
plus.innerText="+";

if(username===currentProfile.username){

plus.onclick=(e)=>{
e.stopPropagation();
document.getElementById("fileInput").click();
};

}else{

plus.style.display="none";

}

div.appendChild(img);
div.appendChild(plus);
div.appendChild(name);

div.onclick=()=>openViewer(username);

container.appendChild(div);

});

}

/* AJOUT STORY */

document.getElementById("fileInput").addEventListener("change",async function(e){

let file=e.target.files[0];
if(!file)return;

if(file.type.startsWith("video")){
await addVideo(file);
}else{
await addImage(file);
}

});

async function addVideo(file){

let url=URL.createObjectURL(file);

users[currentProfile.username].stories.push({

url:url,
type:"video",
time:Date.now(),
views:{},
reactions:{}

});

saveData();
renderStories();

}

function addImage(file){

return new Promise((resolve)=>{

let reader=new FileReader();

reader.onload=function(e){

users[currentProfile.username].stories.push({

url:e.target.result,
type:"image",
time:Date.now(),
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

if(users[user].stories.length===0)return;

currentUser=user;
currentIndex=0;

document.getElementById("viewer").style.display="flex";

document.getElementById("hamburgerContainer").style.display="none";

showStory();

}

/* PROGRESS BAR */

function renderProgressBars(){

let container=document.getElementById("progressContainer");

container.innerHTML="";

let stories=users[currentUser].stories;

stories.forEach((s,i)=>{

let bar=document.createElement("div");
bar.className="progress";

let inner=document.createElement("div");
inner.className="progress-inner";

if(i<currentIndex)inner.style.width="100%";

bar.appendChild(inner);

container.appendChild(bar);

});

}

function startProgress(story){

let bars=document.querySelectorAll(".progress-inner");

let width=0;

let duration=story.type==="image"?5000:10000;

timer=setInterval(()=>{

width+=100/(duration/50);

bars[currentIndex].style.width=Math.min(width,100)+"%";

if(width>=100){

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

/* SHOW STORY */

function showStory(){

clearInterval(timer);

let story=users[currentUser].stories[currentIndex];

let content=document.getElementById("content");
content.innerHTML="";

let element;

if(story.type==="image"){

element=document.createElement("img");
element.src=story.url;

}else{

element=document.createElement("video");
element.src=story.url;
element.autoplay=true;
element.muted=false;

}

content.appendChild(element);

/* CONTROLS */

let old=document.getElementById("progressControls");
if(old)old.remove();

let controls=document.createElement("div");
controls.id="progressControls";

controls.style.position="absolute";
controls.style.top="35px";
controls.style.left="10px";
controls.style.right="10px";

controls.style.display="flex";
controls.style.justifyContent="space-between";

document.getElementById("viewer").appendChild(controls);

/* bouton cadeau */

let giftBtn=document.createElement("button");
giftBtn.innerText="🎁 Envoyer un cadeau";

giftBtn.style.background="#FFD700";
giftBtn.style.color="#000";
giftBtn.style.border="none";
giftBtn.style.padding="6px 12px";
giftBtn.style.borderRadius="6px";
giftBtn.style.cursor="pointer";

giftBtn.onclick=()=>openGiftModal();

controls.appendChild(giftBtn);

/* bouton supprimer */

if(currentProfile.username===currentUser){

let deleteBtn=document.createElement("button");

deleteBtn.innerText="Supprimer";

deleteBtn.style.background="red";
deleteBtn.style.color="white";
deleteBtn.style.border="none";
deleteBtn.style.padding="6px 12px";
deleteBtn.style.borderRadius="6px";

deleteBtn.onclick=()=>{

if(confirm("Supprimer cette story ?")){

users[currentUser].stories.splice(currentIndex,1);
saveData();

if(users[currentUser].stories.length===0){

closeViewer();
return;

}

if(currentIndex>=users[currentUser].stories.length){

currentIndex=users[currentUser].stories.length-1;

}

showStory();

}

};

controls.appendChild(deleteBtn);

}

/* vues */

if(!story.views[currentProfile.username]){

story.views[currentProfile.username]=true;
saveData();

}

let viewCount=document.getElementById("viewCount");

viewCount.innerText="👁 "+Object.keys(story.views).length+" vues";

/* progress */

renderProgressBars();
startProgress(story);

}

/* navigation */

function nextStory(){

if(currentIndex<users[currentUser].stories.length-1){

currentIndex++;
showStory();

}else{

closeViewer();

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

document.getElementById("hamburgerContainer").style.display="flex";

}

/* REACTION */

function react(emoji){

let storyId=currentUser+"_"+currentIndex;

localReactions[storyId]=emoji;

saveLocal();

let story=users[currentUser].stories[currentIndex];

story.reactions[currentProfile.username]=emoji;

saveData();

}

/* CADEAUX */

function openGiftModal(){

let modal=document.getElementById("giftModal");

modal.style.display="flex";

updateCoinBalance();

}

function updateCoinBalance(){

document.getElementById("coinBalance").innerText="💰 "+(coins[currentProfile.username]||0);

}

document.getElementById("closeGiftModal").onclick=()=>{

document.getElementById("giftModal").style.display="none";

};

document.querySelectorAll("#giftModal .gift-options button").forEach(btn=>{

btn.onclick=function(){

let cost=parseInt(this.dataset.cost);

if((coins[currentProfile.username]||0)>=cost){

coins[currentProfile.username]-=cost;

saveCoins();

document.getElementById("giftMessage").innerText="Cadeau envoyé !";

updateCoinBalance();

}else{

document.getElementById("giftMessage").innerText="Solde insuffisant !";

}

};

});

/* HAMBURGER */

const hamburger=document.getElementById("hamburger");

const menuOptions=document.getElementById("menuOptions");

hamburger.addEventListener("click",()=>{

menuOptions.style.display=menuOptions.style.display==="flex"?"none":"flex";

});

/* INIT */

renderStories();
