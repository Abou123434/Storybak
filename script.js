let currentProfile={username:"MonProfil",bio:"Ma bio"};

let currentUser=null;
let currentIndex=0;
let timer=null;

let users=JSON.parse(localStorage.getItem("storyUsers"))||{};
let coins=JSON.parse(localStorage.getItem("userCoins"))||{};

let selectedFile=null;

/* SAVE */

function saveData(){
localStorage.setItem("storyUsers",JSON.stringify(users));
}

function saveCoins(){
localStorage.setItem("userCoins",JSON.stringify(coins));
}

/* PROFILE */

if(!users[currentProfile.username]){
users[currentProfile.username]={
photo:generateAvatar("Mon","Profil"),
stories:[]
};

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

/* FILE SELECT */

document.getElementById("fileInput").addEventListener("change",e=>{

let file=e.target.files[0];

if(!file) return;

selectedFile=file;

document.getElementById("publishBtn").style.display="flex";

});

/* PUBLICATION */

document.getElementById("publishBtn").onclick=()=>{

if(!selectedFile) return;

if(selectedFile.type.startsWith("video")){
addVideo(selectedFile);
}else{
addImage(selectedFile);
}

selectedFile=null;

document.getElementById("publishBtn").style.display="none";

document.getElementById("fileInput").value="";

};

/* ADD STORY */

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

if(users[u].stories.length===0) return;

currentUser=u;
currentIndex=0;

document.getElementById("viewer").style.display="flex";

showStory();

}

function showStory(){

clearInterval(timer);

let s=users[currentUser].stories[currentIndex];

let c=document.getElementById("content");

c.innerHTML="";

let el;

if(s.type==="image"){
el=document.createElement("img");
}else{
el=document.createElement("video");
el.autoplay=true;
}

el.src=s.url;

c.appendChild(el);

}

/* NAVIGATION */

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

/* INIT */

renderStories();
