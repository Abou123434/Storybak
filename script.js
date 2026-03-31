let images = []; // tableau des images publiées

// Récupérer les éléments
const voteContainer = document.getElementById('voteContainer');
const voteInfo = document.getElementById('voteInfo');
const addImageBtn = document.getElementById('addImageBtn');
const uploadModal = document.getElementById('uploadModal');
const closeModal = document.getElementById('closeModal');
const imageInput = document.getElementById('imageInput');
const publishBtn = document.getElementById('publishBtn');

// MOT DE PASSE ADMIN
const ADMIN_PASSWORD = "monSuperMDP123"; // ← change ce mot de passe

// Contrôle admin pour le bouton publier
addImageBtn.onclick = () => {
    const pass = prompt("Mot de passe administrateur :");
    if(pass === ADMIN_PASSWORD){
        uploadModal.style.display = 'block';
    } else {
        alert("Accès refusé !");
    }
};

// Fermer le modal
closeModal.onclick = () => uploadModal.style.display = 'none';

// Publier une image
publishBtn.onclick = () => {
    const file = imageInput.files[0];
    if(!file) return alert('Choisis une image !');

    const reader = new FileReader();
    reader.onload = () => {
        images.push({ src: reader.result, votes: 0, views: 0 });
        uploadModal.style.display = 'none';
        imageInput.value = '';
        renderVotePair();
    };
    reader.readAsDataURL(file);
};

// Choisir deux images aléatoires
function getRandomPair() {
    if(images.length < 2) return [];
    let i = Math.floor(Math.random() * images.length);
    let j;
    do { j = Math.floor(Math.random() * images.length); } while(i === j);
    return [images[i], images[j]];
}

// Afficher deux images pour voter
function renderVotePair() {
    const pair = getRandomPair();
    voteContainer.innerHTML = '';

    if(pair.length < 2) {
        voteInfo.textContent = 'Ajoute au moins 2 images pour voter.';
        return;
    }

    pair.forEach(imgObj => {
        imgObj.views++;
        const card = document.createElement('div');
        card.className = 'vote-card';

        const img = document.createElement('img');
        img.src = imgObj.src;

        const stats = document.createElement('p');
        stats.textContent = `Votes: ${imgObj.votes} | Vues: ${imgObj.views}`;

        card.appendChild(img);
        card.appendChild(stats);

        // Voter sur l'image
        card.onclick = () => {
            imgObj.votes++;
            renderVotePair(); // nouvelle paire
        };

        voteContainer.appendChild(card);
    });
}

// Initial
renderVotePair();
