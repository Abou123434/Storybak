// ===== VIEWER =====
function openViewer(u){
    if(!users[u] || users[u].stories.length === 0) return;

    currentUser = u;
    currentIndex = 0;

    document.getElementById("viewer").style.display = "flex";
    document.getElementById("hamburger").style.display = "none";

    showStory();
}

function closeViewer(){
    if(timer) clearInterval(timer);

    let video = document.querySelector("#content video");
    if(video){
        video.pause();
        video.currentTime = 0;
    }
    
    document.getElementById("viewer").style.display = "none";
    document.getElementById("hamburger").style.display = "block";
    document.getElementById("content").innerHTML = "";
}

// ===== NAVIGATION =====
function nextStory(){
    if(currentIndex < users[currentUser].stories.length - 1){
        currentIndex++;
        showStory();
    }
}

function prevStory(){
    if(currentIndex > 0){
        currentIndex--;
        showStory();
    }
}

// ===== FERMER VIEWER =====
function closeViewer(){
    clearInterval(timer);

    document.getElementById("viewer").style.display = "none";

    // remettre menu hamburger
    document.getElementById("hamburger").style.display = "block";
}

// ===== RENDRE LES FONCTIONS GLOBALES (IMPORTANT) =====
window.openViewer = openViewer;
window.closeViewer = closeViewer;
window.nextStory = nextStory;
window.prevStory = prevStory;
