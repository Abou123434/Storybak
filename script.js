// ===============================
// 🎯 DEFIS DU JOUR
// ===============================
const challenges = [
 "Montre ton frigo",
 "Photo du ciel",
 "Tes chaussures",
 "Ton bureau",
 "Quelque chose de rouge"
];

const today = new Date().getDate();
const dailyChallenge = challenges[today % challenges.length];

document.getElementById("dailyText").innerText = dailyChallenge;
document.getElementById("challengeTitle").innerText = dailyChallenge;

// ===============================
// NAVIGATION ENTRE ECRANS
// ===============================
function showScreen(id){
 document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
 document.getElementById(id).classList.add("active");
}

function goParticipate(){ showScreen("participate"); }
function openFeed(){ showScreen("feed"); loadFeed(); }
function goHome(){ showScreen("home"); }

// ===============================
// PUBLICATION AUTOMATIQUE APRES CHOIX PHOTO
// ===============================
document.getElementById("photoInput").addEventListener("change", function(){
 const file = this.files[0];
 if(!file) return;

 const reader = new FileReader();
 reader.onload = function(e){
    let photos = JSON.parse(localStorage.getItem("photos") || "[]");
    photos.push(e.target.result);
    localStorage.setItem("photos", JSON.stringify(photos));

    alert("Photo publiée 🎉");
    openFeed();
 };
 reader.readAsDataURL(file);
});

// ===============================
// CHARGER LE FEED
// ===============================
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
