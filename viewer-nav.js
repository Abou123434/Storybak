// ===== NEXT =====
function nextStory(){
    clearInterval(timer); // ⚠️ très important

    let userStories = users[currentUser].stories;
    currentIndex++;

    // fin des stories
    if(currentIndex >= userStories.length){
        closeViewer();
        return;
    }

    showStory(); // recharge la story suivante
}

/* ===== REACTIONS ===== */

function react(emoji){
    let story = users[currentUser].stories[currentIndex];

    // créer reactions si ça existe pas
    if(!story.reactions){
        story.reactions = {};
    }

    // sauvegarder la réaction
    story.reactions[currentProfile.username] = emoji;

    saveData();

    // animation
    showReaction(emoji);
}

function nextStory(){ if(currentIndex<users[currentUser].stories.length-1){ currentIndex++; showStory(); } }
function prevStory(){ if(currentIndex>0){ currentIndex--; showStory(); } }
function closeViewer(){
    clearInterval(timer);

    document.getElementById("viewer").style.display = "none";

    // 🔥 remettre le menu
    document.getElementById("hamburger").style.display = "block";
}