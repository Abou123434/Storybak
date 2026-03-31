// 📅 Date du jour
let today = new Date();
document.getElementById("date").innerText =
    today.toLocaleDateString("fr-FR",{weekday:'long', day:'numeric', month:'long'});


// ⏱ Timer jusqu'à minuit
function updateTimer(){
    let now = new Date();
    let midnight = new Date();
    midnight.setHours(24,0,0,0);

    let diff = midnight - now;

    let h = Math.floor(diff/1000/60/60);
    let m = Math.floor(diff/1000/60)%60;
    let s = Math.floor(diff/1000)%60;

    document.getElementById("timeLeft").innerText =
        `${h}:${m}:${s}`;
}

setInterval(updateTimer,1000);


// 👥 Faux participants
let users = ["Aminata","Kevin","Sofia","Yao"];

function renderUsers(){
    let box = document.getElementById("usersList");
    box.innerHTML="";

    users.forEach(u=>{
        let div=document.createElement("div");
        div.className="user";
        div.innerText="👤 "+u;
        box.appendChild(div);
    });
}

renderUsers();


// 🎉 Participer
document.getElementById("joinBtn").onclick=()=>{
    users.push("Toi 😎");
    renderUsers();
    alert("Tu participes au défi !");
};