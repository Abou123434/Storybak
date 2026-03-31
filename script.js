let photos = ["photo1.jpg", "photo2.jpg", "photo3.jpg"];
let photoData = {};
let currentPhotos = [];

async function loadData() {
  const res = await fetch('/api/save');
  photoData = await res.json();
}

function randomTwoPhotos() {
  let first = photos[Math.floor(Math.random() * photos.length)];
  let second;
  do {
    second = photos[Math.floor(Math.random() * photos.length)];
  } while (second === first);

  currentPhotos = [first, second];

  document.getElementById('photo1').src = 'photos/' + first;
  document.getElementById('photo2').src = 'photos/' + second;

  // Incrémenter vues
  photoData[first].vues++;
  photoData[second].vues++;

  updateScores();
  saveData();
}

function updateScores() {
  document.getElementById('score1').textContent = `Vues: ${photoData[currentPhotos[0]].vues} | Votes: ${photoData[currentPhotos[0]].votes}`;
  document.getElementById('score2').textContent = `Vues: ${photoData[currentPhotos[1]].vues} | Votes: ${photoData[currentPhotos[1]].votes}`;
}

async function saveData(votePhoto = null) {
  if (votePhoto) {
    photoData[votePhoto].votes++;
  }

  await fetch('/api/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(photoData)
  });
}

document.getElementById('vote1').onclick = async () => {
  await saveData(currentPhotos[0]);
  randomTwoPhotos();
};

document.getElementById('vote2').onclick = async () => {
  await saveData(currentPhotos[1]);
  randomTwoPhotos();
};

// Initialisation
loadData().then(() => randomTwoPhotos());

import images from './image.js';

const gallery = document.getElementById('gallery');

images.forEach(imgPath => {
  const img = document.createElement('img');
  img.src = imgPath;
  gallery.appendChild(img);
});
