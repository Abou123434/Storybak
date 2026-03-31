// ===== défis pré-enregistrés =====
const challenges = [
 "Montre ton frigo",
 "Photo du ciel",
 "Tes chaussures",
 "Ton bureau",
 "Quelque chose de rouge"
];

// choisir défi selon la date
const today = new Date().getDate();
const dailyChallenge = challenges[today % challenges.length];

document.getElementById("dailyText").innerText = dailyChallenge;
document.getElementById("challengeTitle").innerText = dailyChallenge;


// ===== navigation =====
function showScreen(id){
 document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
 document.getElementById(id).classList.add("active");
}

function goParticipate(){ showScreen("participate"); }
function openFeed(){ showScreen("feed"); loadFeed(); }
function goHome(){ showScreen("home"); }


// ===== publier photo =====
function publishPhoto(){
 const file = document.getElementById("photoInput").files[0];
 if(!file) return alert("Choisis une photo");

 const reader = new FileReader();
 reader.onload = function(e){
    let photos = JSON.parse(localStorage.getItem("photos") || "[]");
    photos.push(e.target.result);
    localStorage.setItem("photos", JSON.stringify(photos));
    alert("Publié !");
    openFeed();
 }
 reader.readAsDataURL(file);
}


// ===== afficher feed =====
function loadFeed(){
 const grid = document.getElementById("grid");
 grid.innerHTML = "";

 let photos = JSON.parse(localStorage.getItem("photos") || "[]");

 photos.reverse().forEach(p=>{
    let img = document.createElement("img");
    img.src = p;
    grid.appendChild(img);
 });
                         }
