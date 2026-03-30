// ===== STATE =====
let viewerOpen = false;

// ===== OPEN VIEWER =====
function openViewer(u){
    if(viewerOpen) return; // 🛑 empêche double ouverture
    if(!users[u] || users[u].stories.length === 0) return;

    viewerOpen = true;

    clearInterval(timer); // nettoie anciens timers
    document.getElementById("content").innerHTML = "";

    currentUser = u;
    currentIndex = 0;

    document.getElementById("viewer").style.display = "flex";
    document.getElementById("hamburger").style.display = "none";

    setTimeout(() => {
        showStory(); // lance après affichage (plus fluide)
    }, 50);
}

// ===== CLOSE VIEWER =====
function closeViewer(){
    viewerOpen = false;

    if(timer) clearInterval(timer);

    let video = document.querySelector("#content video");
    if(video){
        video.pause();
        video.currentTime = 0;
    }

    document.getElementById("content").innerHTML = "";
    document.getElementById("viewer").style.display = "none";
    document.getElementById("hamburger").style.display = "block";
}

// ===== NAVIGATION =====
function nextStory(){
    if(!viewerOpen) return;

    clearInterval(timer); // stop ancien timer

    if(currentIndex < users[currentUser].stories.length - 1){
        currentIndex++;
        showStory();
    } else {
        closeViewer(); // fin des stories → ferme viewer
    }
}

function prevStory(){
    if(!viewerOpen) return;

    clearInterval(timer);

    if(currentIndex > 0){
        currentIndex--;
        showStory();
    }
}

// ===== GLOBAL =====
window.openViewer = openViewer;
window.closeViewer = closeViewer;
window.nextStory = nextStory;
window.prevStory = prevStory;
