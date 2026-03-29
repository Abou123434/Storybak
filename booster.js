/* ===== BOOSTER ===== */
// Créer le modal booster si pas déjà présent
if(!document.getElementById("boosterModal")){
    let boosterModal = document.createElement("div");
    boosterModal.id = "boosterModal";
    boosterModal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.9);display:none;justify-content:center;align-items:center;z-index:9999;";
    boosterModal.innerHTML = `
        <div style="background:#111;padding:25px;border-radius:15px;text-align:center;color:white;max-width:350px;width:90%;">
            <h3>🚀 Booster votre story !</h3>
            <p>Augmentez vos vues et restez dans le top ! Choisissez votre pack :</p>
            <div style="display:flex;flex-direction:column;gap:10px;margin-top:15px;">
                <button data-euro="0.50" data-coins="50" class="boosterPack">0,50€ - 50 pièces</button>
                <button data-euro="0.75" data-coins="75" class="boosterPack">0,75€ - 75 pièces</button>
                <button data-euro="1" data-coins="100" class="boosterPack">1€ - 100 pièces</button>
                <button data-euro="3" data-coins="300" class="boosterPack">3€ - 300 pièces</button>
                <button data-euro="5" data-coins="500" class="boosterPack">5€ - 500 pièces</button>
            </div>
            <br>
            <button id="closeBooster" style="background:red;color:white;border:none;padding:10px 20px;border-radius:10px;">Fermer</button>
        </div>
    `;
    document.body.appendChild(boosterModal);
}
// Référence
const boosterModal = document.getElementById("boosterModal");
const closeBooster = document.getElementById("closeBooster");

// Ouvrir modal booster au clic sur le bouton
document.querySelectorAll("button").forEach(b=>{
    if(b.innerText === "🚀 Booster") {
        b.onclick = e=>{
            e.stopPropagation();
            boosterModal.style.display = "flex";
        }
    }
});

// Fermer le modal
closeBooster.onclick = ()=> boosterModal.style.display="none";

// Gérer le clic sur un pack
document.querySelectorAll(".boosterPack").forEach(btn=>{
    btn.onclick = ()=>{
        const euro = btn.dataset.euro;
        const coins = btn.dataset.coins;
        alert(`🎯 Vous avez choisi le pack de ${coins} pièces pour ${euro}€ ! Vous allez être redirigé vers PayPal.`);
        // ouvrir paypal (simulé) puis page blanche
        window.open("https://www.paypal.com/paypalme","_blank"); 
        window.open("about:blank","_blank"); 
        boosterModal.style.display="none";
    }
});