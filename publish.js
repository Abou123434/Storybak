// ===== MODAL PUBLICATION =====
function openGlobalPublish(){
  document.getElementById("publishModal").style.display = "flex";
}

function closePublish(){
  document.getElementById("publishModal").style.display = "none";
}

// ouvrir galerie
function selectFile(){
  document.getElementById("fileInput").click();
}
// attendre que le DOM soit chargé
document.addEventListener("DOMContentLoaded", () => {

  const fileInput = document.getElementById("fileInput");

  if(fileInput){
    fileInput.addEventListener("change", function(){
      const file = this.files[0];
      const preview = document.getElementById("preview");

      preview.innerHTML = "";
      if(file){
        const url = URL.createObjectURL(file);

        if(file.type.startsWith("image")){
          preview.innerHTML = `<img src="${url}" style="width:100%; border-radius:10px;">`;
        }
        else if(file.type.startsWith("video")){
          preview.innerHTML = `
            <video controls style="width:100%; border-radius:10px;">
              <source src="${url}">
            </video>`;
        }
      }
    });
  }

});

// publier
function publishPost(){
  alert("Publication envoyée 🚀");
}