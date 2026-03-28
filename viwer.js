function showStory(){
    clearInterval(timer);

    let story = users[currentUser].stories[currentIndex];
    let content = document.getElementById("content");

    renderProgressBars();

    let fills = document.querySelectorAll(".progress-fill");
    let progressBar = fills[currentIndex];

    content.innerHTML = "";

    // ===== IMAGE =====
    if(story.type === "image"){
        let img = document.createElement("img");
        img.src = story.url;
        content.appendChild(img);

        let duration = 5000;
        let startTime = Date.now();

        timer = setInterval(() => {
            let elapsed = Date.now() - startTime;
            let percent = (elapsed / duration) * 100;
            progressBar.style.width = percent + "%";

            if(percent >= 100){
                nextStory();
            }
        }, 50);
    }

    // ===== VIDEO =====
    if(story.type === "video"){
        let video = document.createElement("video");
        video.src = story.url;
        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;

        content.appendChild(video);

        let segmentDuration = story.end - story.start;

        video.onloadedmetadata = () => {
            video.currentTime = story.start;
            video.play();
        };

        video.ontimeupdate = () => {
            if(video.currentTime >= story.end){
                nextStory();
                return;
            }

            let progress = ((video.currentTime - story.start) / segmentDuration) * 100;
            progressBar.style.width = progress + "%";
        };
    }
}
