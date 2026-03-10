let coins = JSON.parse(localStorage.getItem("userCoins")) || {MonProfil:0};

let currentProfile = {username:"MonProfil"};

let selectedGiftCost = 0;

/* SAUVEGARDE */

function saveCoins(){
localStorage.setItem("userCoins",JSON.stringify(coins));
}

/* SOLDE */

function updateCoinBalance(){

document.getElementById("coinBalance").innerText =
"Solde " + (coins[currentProfile.username] || 0) + " 💰";

}

/* OUVRIR MODAL CADEAUX */

function openGiftModal(){

document.getElementById("giftModal").style.display="flex";

updateCoinBalance();

}

/* FERMER MODAL */

document.getElementById("closeGiftModal").onclick=()=>{

document.getElementById("giftModal").style.display="none";

};

/* CADEAUX CLIQUABLES */

document.querySelectorAll(".gift-options button").forEach(btn=>{

btn.onclick=function(){

selectedGiftCost=parseInt(this.dataset.cost);

openGiftQuantityModal();

};

});

/* MODAL QUANTITE */

function openGiftQuantityModal(){

let modal=document.createElement("div");

modal.style.position="fixed";
modal.style.inset="0";
modal.style.background="rgba(0,0,0,0.9)";
modal.style.display="flex";
modal.style.justifyContent="center";
modal.style.alignItems="center";

let box=document.createElement("div");

box.style.background="#111";
box.style.padding="20px";
box.style.borderRadius="10px";
box.style.textAlign="center";

box.innerHTML=`

<h3>Choisir quantité</h3>

<button onclick="sendGift(1)">×1</button>
<button onclick="sendGift(2)">×2</button>
<button onclick="sendGift(5)">×5</button>
<button onclick="sendGift(7)">×7</button>
<button onclick="sendGift(10)">×10</button>

<br><br>

<button onclick="closeQuantity()">Fermer</button>

`;

modal.appendChild(box);

document.body.appendChild(modal);

}

function closeQuantity(){

document.body.lastChild.remove();

}

/* ENVOYER CADEAU */

function sendGift(q){

let total = selectedGiftCost * q;

if((coins[currentProfile.username]||0) >= total){

coins[currentProfile.username] -= total;

saveCoins();

document.getElementById("giftMessage").innerText=
"Cadeau envoyé ×"+q;

updateCoinBalance();

}else{

document.getElementById("giftMessage").innerText=
"Solde insuffisant";

}

closeQuantity();

}

/* ACHETER COINS */

document.getElementById("buyCoins").onclick=()=>{

openBuyCoinsModal();

};

function openBuyCoinsModal(){

let modal=document.createElement("div");

modal.style.position="fixed";
modal.style.inset="0";
modal.style.background="rgba(0,0,0,0.9)";
modal.style.display="flex";
modal.style.justifyContent="center";
modal.style.alignItems="center";

let box=document.createElement("div");

box.style.background="#111";
box.style.padding="20px";
box.style.borderRadius="10px";
box.style.textAlign="center";
box.style.color="white";

box.innerHTML=`

<h2>Acheter des pièces</h2>

<button>1 pièce<br>0,01€</button>
<button>10 pièces<br>0,10€</button>
<button>100 pièces<br>1€</button>
<button>30 000 pièces<br>300€</button>
<button>100 000 pièces<br>1000€</button>

<br><br>

<button onclick="closeBuy()">Fermer</button>

`;

modal.appendChild(box);

document.body.appendChild(modal);

}

function closeBuy(){

document.body.lastChild.remove();

}

/* INIT */

updateCoinBalance();
