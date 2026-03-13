// ===================== CONFIG =====================
let currentProfile={username:"MonProfil",bio:"Ma bio"},currentUser=null,currentIndex=0,timer=null;
let users=JSON.parse(localStorage.getItem("storyUsers"))||{};
let coins=JSON.parse(localStorage.getItem("userCoins"))||{};
if(!users[currentProfile.username]){users[currentProfile.username]={photo:generateAvatar("Mon","Profil"),stories:[]};coins[currentProfile.username]=100;saveData();saveCoins();}
function saveData(){localStorage.setItem("storyUsers",JSON.stringify(users));}
function saveCoins(){localStorage.setItem("userCoins",JSON.stringify(coins));}
function generateAvatar(nom,prenom){let c=document.createElement("canvas");c.width=150;c.height=150;let ctx=c.getContext("2d");ctx.fillStyle="#25D366";ctx.fillRect(0,0,150,150);ctx.fillStyle="white";ctx.font="bold 60px sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(nom[0]+prenom[0],75,75);return c.toDataURL();}

// ===================== STORIES =====================
function renderStories(){let container=document.getElementById("stories");container.innerHTML="";Object.keys(users).forEach(u=>{let div=document.createElement("div");div.className="story";let img=document.createElement("img");img.src=users[u].photo;let plus=document.createElement("div");plus.className="plus";plus.innerText="+";if(u===currentProfile.username){plus.onclick=e=>{e.stopPropagation();document.getElementById("fileInput").click();}}else plus.style.display="none";div.appendChild(img);div.appendChild(plus);container.appendChild(div);div.onclick=()=>openViewer(u);});}
document.getElementById("fileInput").addEventListener("change",e=>{let f=e.target.files[0];if(!f)return;if(f.type.startsWith("video"))addVideo(f);else addImage(f);});
function addVideo(f){let url=URL.createObjectURL(f);users[currentProfile.username].stories.push({url:url,type:"video",views:{}});saveData();renderStories();}
function addImage(f){let r=new FileReader();r.onload=e=>{users[currentProfile.username].stories.push({url:e.target.result,type:"image",views:{}});saveData();renderStories();};r.readAsDataURL(f);}

// ===================== VIEWER =====================
function openViewer(u){if(users[u].stories.length===0)return;currentUser=u;currentIndex=0;document.getElementById("viewer").style.display="flex";showStory();}
function renderProgressBars(){let c=document.getElementById("progressContainer");c.innerHTML="";users[currentUser].stories.forEach((s,i)=>{let b=document.createElement("div");b.className="progress";let iB=document.createElement("div");iB.className="progress-inner";if(i<currentIndex)iB.style.width="100%";b.appendChild(iB);c.appendChild(b);});}
function startProgress(s){let bars=document.querySelectorAll(".progress-inner"),w=0;let dur=s.type==="image"?5000:10000;timer=setInterval(()=>{w+=100/(dur/50);bars[currentIndex].style.width=Math.min(w,100)+"%";if(w>=100){clearInterval(timer);if(currentIndex<users[currentUser].stories.length-1){currentIndex++;showStory();}else closeViewer();}},50);}
function showStory(){clearInterval(timer);let s=users[currentUser].stories[currentIndex],c=document.getElementById("content");c.innerHTML="";let e=s.type==="image"?document.createElement("img"):document.createElement("video");e.src=s.url;if(s.type==="video")e.autoplay=true;c.appendChild(e);if(!s.views[currentProfile.username]){s.views[currentProfile.username]=true;saveData();}document.getElementById("viewCount").innerText="👁 "+Object.keys(s.views).length+" vues";renderProgressBars();startProgress(s);let controls=document.getElementById("progressControls");controls.innerHTML="";let giftBtn=document.createElement("button");giftBtn.innerText="🎁 Envoyer un cadeau";giftBtn.onclick=openGiftModal;controls.appendChild(giftBtn);}
function nextStory(){if(currentIndex<users[currentUser].stories.length-1){currentIndex++;showStory();}}
function prevStory(){if(currentIndex>0){currentIndex--;showStory();}}
function closeViewer(){clearInterval(timer);document.getElementById("viewer").style.display="none";}

// ===================== CADEAUX =====================
let selectedGiftCost=0,selectedGiftEmoji="";
function openGiftModal(){document.getElementById("giftModal").style.display="flex";updateCoinBalance();}
function updateCoinBalance(){document.getElementById("coinBalance").innerText="Solde "+(coins[currentProfile.username]||0)+" 💰";}
document.getElementById("closeGiftModal").onclick=()=>{document.getElementById("giftModal").style.display="none";}
document.querySelectorAll("#giftModal .gift-options button").forEach(b=>{b.onclick=()=>{selectedGiftCost=parseInt(b.dataset.cost);selectedGiftEmoji=b.innerText;openGiftQuantityModal();}})
function openGiftQuantityModal(){let m=document.createElement("div");m.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,0.9);display:flex;justify-content:center;align-items:center;z-index:9999;";let box=document.createElement("div");box.style.cssText="background:#111;padding:25px;border-radius:15px;text-align:center;";box.innerHTML=`<h3>Quantité pour ${selectedGiftEmoji}</h3><div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;"><button onclick="sendGift(1)">×1</button><button onclick="sendGift(2)">×2</button><button onclick="sendGift(5)">×5</button></div><br><button onclick="closeGiftQuantity()">Fermer</button>`;m.appendChild(box);document.body.appendChild(m);}
function closeGiftQuantity(){let m=document.querySelector("body > div:last-child");if(m)m.remove();}
function sendGift(q){let t=selectedGiftCost*q;if((coins[currentProfile.username]||0)>=t){coins[currentProfile.username]-=t;saveCoins();document.getElementById("giftMessage").innerText=`Cadeau envoyé ${selectedGiftEmoji} x${q}`;updateCoinBalance();}else document.getElementById("giftMessage").innerText="Solde insuffisant";closeGiftQuantity();}

// ===================== ACHAT COINS =====================
document.getElementById("buyCoins").onclick=()=>{document.getElementById("buyCoinsModal").style.display="flex";}
function closeBuy(){document.getElementById("buyCoinsModal").style.display="none";}
function openPayment(){document.getElementById("paymentModal").style.display="flex";}
function closePayment(){document.getElementById("paymentModal").style.display="none";}
function openBlank(){window.open("about:blank","_blank");}

// ===================== HAMBURGER BAS =====================
document.getElementById("hamburger").onclick=()=>{let m=document.getElementById("menuOptions");m.style.display=m.style.display==="flex"?"none":"flex";}

// ===================== WALLET =====================
const walletBtn=document.getElementById("walletBtn"),walletOverlay=document.getElementById("walletOverlay"),closeWallet=document.getElementById("closeWallet"),withdrawBtn=document.getElementById("withdrawBtn"),walletBuyBtn=document.getElementById("walletBuyBtn");
walletBtn.onclick=()=>{document.getElementById("walletCoins").innerText=coins[currentProfile.username]||0;document.getElementById("walletDiamonds").innerText=8400;document.getElementById("walletValue").innerText=84;walletOverlay.style.display="flex";}
closeWallet.onclick=()=>walletOverlay.style.display="none";
walletBuyBtn.onclick=()=>document.getElementById("buyCoinsModal").style.display="flex";

// ===================== KYC =====================
const kycModal=document.getElementById("kycModal"),kycFile=document.getElementById("kycFile"),kycSendBtn=document.getElementById("kycSendBtn"),kycMessage=document.getElementById("kycMessage"),kycPaypalBtn=document.getElementById("kycPaypalBtn"),closeKyc=document.getElementById("closeKyc");
withdrawBtn.onclick=()=>{walletOverlay.style.display="none";kycModal.style.display="flex";kycMessage.innerText="Veuillez envoyer vos documents pour vérifier votre identité.";kycPaypalBtn.style.display="none";kycSendBtn.style.display="inline-block";}
kycSendBtn.onclick=()=>{
  if(!kycFile.files[0]){alert("Veuillez sélectionner un document.");return;}
  kycMessage.innerText="Vérification en cours ⏳";
  kycSendBtn.style.display="none";
  setTimeout(()=>{kycMessage.innerText="KYC validé ✅";kycPaypalBtn.style.display="inline-block";},3000);
};
kycPaypalBtn.onclick=()=>{openBlank();kycModal.style.display="none";}
closeKyc.onclick=()=>{kycModal.style.display="none";}

// ===================== INIT =====================
renderStories();
