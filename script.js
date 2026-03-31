// Récupération des éléments
const participerBtn = document.getElementById('participer');
const fileInput = document.getElementById('fileInput');
const previewContainer = document.getElementById('previewContainer');
const previewImage = document.getElementById('preview');

// Ouvrir la galerie au clic
participerBtn.addEventListener('click', () => {
  fileInput.click();
});

// Afficher l'image sélectionnée
fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if(file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.src = e.target.result;
      previewContainer.style.display = 'block';
    }
    reader.readAsDataURL(file);
  } else {
    alert("Veuillez sélectionner une image valide !");
  }
});
