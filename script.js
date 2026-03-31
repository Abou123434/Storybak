// ===============================
// APP DAILY DARE - JS COMPLET
// ===============================


// -------- Screens navigation --------
const screens = ["home","participate","feed"];

function showScreen(screen){
    screens.forEach(id=>{
        document.getElementById(id).style.display="none";
    });
    document.getElementById(screen).style.display="flex";
}

// boutons navigation
function goHome(){ showScreen("home"); }
function goParticipate(){
    showScreen("participate");
    document.getElementById("photoInput").value="";
}
function openFeed(){
    showScreen("feed");
    loadFeed();
}



// -------- Défi du jour --------
const challenges = [
 "Montre ton frigo",
 "Photo du ciel",
 "Ton bureau",
 "Tes chaussures",
 "Selfie sans sourire",
 "Ton repas",
 "Ta rue",
 "Ton lit",
 "Ton sac",
 "Quelque chose de rouge"
];

function setDailyChallenge(){
    const day = new Date().getDate();
    const challenge = challenges[day % challenges.length];
    document.getElementById("challengeTitle").innerText = challenge;
}
setDailyChallenge();



// -------- Upload photo --------
document.getElementById("publishBtn").addEventListener("click", ()=>{

    const input = document.getElementById("photoInput");
    const file = input.files[0];

    if(!file){
        alert("Choisis une photo 📸");
        return;
    }

    const reader = new FileReader();

    reader.onload = function(e){
        let photos = JSON.parse(localStorage.getItem("photos") || "[]");

        photos.unshift(e.target.result); // nouvelle photo en premier

        localStorage.setItem("photos", JSON.stringify(photos));

        alert("Photo publiée 🚀");

        openFeed();
    }

    reader.readAsDataURL(file);
});



// -------- Charger le feed --------
function loadFeed(){

    const grid = document.getElementById("feedGrid");
    grid.innerHTML="";

    let photos = JSON.parse(localStorage.getItem("photos") || "[]");

    if(photos.length === 0){
        grid.innerHTML="<p>Aucune participation pour le moment 😢</p>";
        return;
    }

    photos.forEach(src=>{
        const img = document.createElement("img");
        img.src = src;
        grid.appendChild(img);
    });

}



// -------- Init app --------
showScreen("home");
