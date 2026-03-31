// Données des images (à publier toi-même)
let images = [];

// Récupérer les éléments
const gallery = document.getElementById('gallery');
const addImageBtn = document.getElementById('addImageBtn');
const uploadModal = document.getElementById('uploadModal');
const closeModal = document.getElementById('closeModal');
const imageInput = document.getElementById('imageInput');
const publishBtn = document.getElementById('publishBtn');

// Ouvrir modal
addImageBtn.onclick = () => uploadModal.style.display = 'block';
closeModal.onclick = () => uploadModal.style.display = 'none';

// Publier une image
publishBtn.onclick = () => {
    const file = imageInput.files[0];
    if(!file) return alert('Choisis une image !');

    const reader = new FileReader();
    reader.onload = () => {
        images.push({
            src: reader.result,
            votes: 0,
            views: 0
        });
        renderGallery();
        uploadModal.style.display = 'none';
        imageInput.value = '';
    };
    reader.readAsDataURL(file);
};

// Fonction pour afficher les images
function renderGallery() {
    gallery.innerHTML = '';
    images.forEach((imgObj, index) => {
        imgObj.views++;
        const card = document.createElement('div');
        card.className = 'card';

        const img = document.createElement('img');
        img.src = imgObj.src;

        const votes = document.createElement('p');
        votes.textContent = `Votes: ${imgObj.votes} | Vues: ${imgObj.views}`;

        const voteBtn = document.createElement('button');
        voteBtn.className = 'vote-btn';
        voteBtn.textContent = 'Voter';
        voteBtn.onclick = () => {
            imgObj.votes++;
            renderGallery();
        };

        card.appendChild(img);
        card.appendChild(votes);
        card.appendChild(voteBtn);
        gallery.appendChild(card);
    });
}

// Initial render
renderGallery();
