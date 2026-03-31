// ===============================
// 🎯 LISTE DES DEFIS
// ===============================
const challenges = [
 "Montre ton frigo",
 "Photo du ciel",
 "Tes chaussures",
 "Ton bureau",
 "Quelque chose de rouge"
];

// choisir défi du jour automatiquement
const today = new Date().getDate();
const dailyChallenge = challenges[today % challenges.length];

// afficher défi sur les écrans
document.getElementById("dailyText").innerText = dailyChallenge;
document.getElementById("challengeTitle").innerText = dailyChallenge;


// ===============================
// 🧭 NAVIGATION ENTRE ECRANS
// ===============================
function showScreen(id){
  document.querySelectorAll(".screen").forEach(screen=>{
    screen.classList.remove("active");
  });
  document.getElementById(id).classList.add("active");
}

function goParticipate(){
  showScreen("participate");
}

function openFeed(){
  showScreen("feed");
  loadFeed();
}

function goHome(){
  showScreen("home");
}


// ===============================
// 📱 OUVRIR GALERIE TELEPHONE
// ===============================
function openGallery(){
  document.getElementById("photoInput").click();
}


// ===============================
// 🚀 PUBLIER PHOTO AUTOMATIQUEMENT
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
// 🌍 CHARGER LE FEED
// ===============================
function loadFeed(){

  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  let photos = JSON.parse(localStorage.getItem("photos") || "[]");

  // dernières photos en premier
  photos.reverse().forEach(photo=>{
      let img = document.createElement("img");
      img.src = photo;
      grid.appendChild(img);
  });
}
