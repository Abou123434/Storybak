// ===== VARIABLES RESET À CHAQUE LOAD =====
let storyCount = 0;
let storyAdShown = false;
let isAdRunning = false; // 🔥 évite double pub

// ===== ELEMENTS =====
const adOverlay = document.getElementById("adOverlay");
const adTimer = document.getElementById("adTimer");

// ===== FONCTION PUB =====
function showAd() {
  if (isAdRunning) return; // 🔥 bloque double lancement

  isAdRunning = true;

  let timeLeft = 3;
  adOverlay.classList.add("active");
  adTimer.textContent = timeLeft;

  const countdown = setInterval(() => {
    timeLeft--;
    adTimer.textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(countdown);
      adOverlay.classList.remove("active");
      isAdRunning = false;
    }
  }, 1000);
}

// ===== PUB À CHAQUE CHARGEMENT (TOUJOURS) =====
window.addEventListener("load", () => {
  showAd(); // 🔥 TOUJOURS exécuté
});

// ===== STORY VIEW =====
function onStoryViewed() {
  storyCount++;

  console.log("Stories vues:", storyCount);

  // 🔥 pub seulement UNE FOIS après 9 stories
  if (storyCount === 9 && !storyAdShown) {
    showAd();
    storyAdShown = true;
  }
}