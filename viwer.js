// ===== STORY =====
function showStory(){
    clearInterval(timer);

    let story = users[currentUser].stories[currentIndex];
    let content = document.getElementById("content");
    let progressBar = document.getElementById("progress");

    progressBar.style.width = "0%";
    content.innerHTML = "";

    // ===== IMAGE =====
    if(story.type === "image"){
        let img = document.createElement("img");
        img.src = story.url;
        content.appendChild(img);

        let duration = 5000; // 5 sec
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

    // ===== VIDEO (SEGMENTS 30s) =====
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

            // stop fin segment
            if(video.currentTime >= story.end){
                nextStory();
                return;
            }

            // progress bar segment
            let progress = ((video.currentTime - story.start) / segmentDuration) * 100;
            progressBar.style.width = progress + "%";
        };
    }
}
