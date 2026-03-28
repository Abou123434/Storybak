document.addEventListener("DOMContentLoaded", () => {

    /* ================================
       CREATION PROFIL SI INEXISTANT
    =================================*/
    if(!users[currentProfile.username]){
        users[currentProfile.username] = {
            photo: generateAvatar("Mon","Prenom"),
            bio: "Prenom",
            stories: []
        };
        coins[currentProfile.username] = 100;
        saveData();
        saveCoins();
    }

    const changeProfileBtn = document.getElementById("changeProfileBtn");

    /* ================================
       CREATION MODAL PROFIL
    =================================*/
    const modal = document.createElement("div");
    modal.id = "profileModal";
    modal.style.cssText = `
        position:fixed; inset:0;
        background:rgba(0,0,0,0.9);
        display:none;
        justify-content:center;
        align-items:center;
        z-index:9999;
    `;

    modal.innerHTML = `
        <div style="background:#111;padding:25px;border-radius:15px;text-align:center;color:white;max-width:300px;width:90%;">
            <h3>Modifier le profil</h3>

            <div id="avatarPreview"
                 style="width:80px;height:80px;border-radius:50%;
                 margin:0 auto;background:#25D366;
                 display:flex;align-items:center;justify-content:center;
                 font-size:20px;cursor:pointer;">
            </div>

            <input type="file" id="avatarInput" hidden>

            <br><br>

            <input type="text" id="profileNom" placeholder="Nom" style="margin-bottom:10px;width:90%;">
            <input type="text" id="profilePrenom" placeholder="Prénom" style="margin-bottom:10px;width:90%;">

            <button type="button" id="saveProfile" class="green-btn">Sauvegarder</button>
            <button type="button" id="closeProfileModal" class="red-btn">Fermer</button>
        </div>
    `;
    document.body.appendChild(modal);

    /* ================================
       RECUP ELEMENTS
    =================================*/
    const profileModal = document.getElementById("profileModal");
    const avatarPreview = document.getElementById("avatarPreview");
    const avatarInput = document.getElementById("avatarInput");
    const profileNom = document.getElementById("profileNom");
    const profilePrenom = document.getElementById("profilePrenom");
    const saveProfile = document.getElementById("saveProfile");
    const closeProfileModal = document.getElementById("closeProfileModal");

    /* ================================
       OUVRIR MODAL
    =================================*/
    changeProfileBtn.addEventListener("click", () => {
        profileModal.style.display = "flex";

        profileNom.value = currentProfile.username;
        profilePrenom.value = currentProfile.bio;

        avatarPreview.innerText = "";
        avatarPreview.style.backgroundImage = "none";

        if(users[currentProfile.username]?.photo){
            avatarPreview.style.backgroundImage = `url(${users[currentProfile.username].photo})`;
            avatarPreview.style.backgroundSize = "cover";
            avatarPreview.style.backgroundPosition = "center";
        }
    });

    /* ================================
       FERMER MODAL
    =================================*/
    closeProfileModal.onclick = () => profileModal.style.display = "none";

    /* ================================
       UPLOAD AVATAR
    =================================*/
    avatarPreview.onclick = () => avatarInput.click();

    avatarInput.addEventListener("change", e => {
        const file = e.target.files[0];
        if(!file) return;

        const reader = new FileReader();
        reader.onload = ev => {
            const img = ev.target.result;

            avatarPreview.style.backgroundImage = `url(${img})`;
            avatarPreview.style.backgroundSize = "cover";
            avatarPreview.style.backgroundPosition = "center";

            users[currentProfile.username].photo = img;
            saveData();
            renderStories();
        };
        reader.readAsDataURL(file);
    });

    /* ================================
       SAUVEGARDER PROFIL
    =================================*/
    saveProfile.onclick = () => {

        const nom = profileNom.value.trim();
        const prenom = profilePrenom.value.trim();

        if(!nom || !prenom){
            alert("Nom et prénom obligatoires");
            return;
        }

        const oldKey = currentProfile.username;
        const userData = users[oldKey];
        const userCoins = coins[oldKey] || 0;

        // update prénom
        userData.bio = prenom;

        // si changement de nom → déplacer données + coins
        if(oldKey !== nom){
            users[nom] = userData;
            coins[nom] = userCoins;
            delete users[oldKey];
            delete coins[oldKey];
        }

        currentProfile.username = nom;
        currentProfile.bio = prenom;

        saveData();
        saveCoins();
        renderStories();

        profileModal.style.display = "none";
    };

});
