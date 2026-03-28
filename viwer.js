// ===== STORY =====
function showStory(){
    clearInterval(timer);

    let s = users[currentUser].stories[currentIndex];

    renderProgressBars(currentIndex);

    let c = document.getElementById("content");
    c.innerHTML = "";

    let e;

    // ===== IMAGE =====
    if(s.type === "image"){
        e = document.createElement("img");
        e.src = s.url;
        c.appendChild(e);

        startProgress(5000);
    }

    // ===== VIDEO =====
    else {
        e = document.createElement("video");
        e.src = s.url;
        e.autoplay = true;
        e.muted = false;
        e.controls = false;

        c.appendChild(e);

        e.onloadedmetadata = () => {
            e.currentTime = s.start;
            e.play();
        };

        e.ontimeupdate = () => {
            if(e.currentTime >= s.end){
                e.pause();
                nextStory();
            }
        };

        startProgress((s.end - s.start) * 1000);
    }