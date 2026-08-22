localStorage.removeItem("lives");
localStorage.removeItem("level");
localStorage.removeItem("score");

localStorage.setItem("lives", "5");
localStorage.setItem("level", "1");
localStorage.setItem("score", "0");

let sequence = [];
let player = [];

let level = 1;
let score = 0;
let lives = 5;

let timer;
let timeLeft = 10;
let canPlay = false;
let adInProgress = false;

const colors = ["red", "green", "blue", "yellow"];

const clickSound = document.getElementById("clickSound");
const winSound = document.getElementById("winSound");
const failSound = document.getElementById("failSound");

function get(id) {
  return document.getElementById(id);
}

/* =========================
   🌍 LANGUES
========================= */

let lang = localStorage.getItem("lang") || "fr";

const translations = {
  fr: {
    title: "🧠 Memory Flash Pro",
    start: "⭐ Commencer",
    watchAd: "🎥 Regarder une pub",
    score: "Score",
    level: "Niveau",
    lives: "Vies",
    observe: "👀 Observe bien !",
    play: "🎮 Reproduis la séquence !",
    win: "🔥 Gagné !",
    error: "❌ Erreur ! Vie restante : ",
    gameover: "🚫 Plus de vies ! Regarde une pub",
    ad: "🎥 Publicité en cours...",
    adwin: "✅ +4 vies ajoutées",
    timer: "⏱ Temps"
  },

  en: {
    title: "🧠 Memory Flash Pro",
    start: "⭐ Start",
    watchAd: "🎥 Watch Ad",
    score: "Score",
    level: "Level",
    lives: "Lives",
    observe: "👀 Watch carefully!",
    play: "🎮 Repeat the sequence!",
    win: "🔥 You win!",
    error: "❌ Wrong! Lives left: ",
    gameover: "🚫 No lives left! Watch an ad",
    ad: "🎥 Ad running...",
    adwin: "✅ +4 lives added",
    timer: "⏱ Time"
  },

  es: {
    title: "🧠 Memoria Flash Pro",
    start: "⭐ Empezar",
    watchAd: "🎥 Ver anuncio",
    score: "Puntuación",
    level: "Nivel",
    lives: "Vidas",
    observe: "👀 ¡Observa bien!",
    play: "🎮 ¡Repite la secuencia!",
    win: "🔥 ¡Ganaste!",
    error: "❌ Error! Vidas restantes: ",
    gameover: "🚫 Sin vidas. Mira un anuncio",
    ad: "🎥 Anuncio en curso...",
    adwin: "✅ +4 vidas añadidas",
    timer: "⏱ Tiempo"
  },

  de: {
    title: "🧠 Memory Flash Pro",
    start: "⭐ Starten",
    watchAd: "🎥 Werbung ansehen",
    score: "Punkte",
    level: "Level",
    lives: "Leben",
    observe: "👀 Gut beobachten!",
    play: "🎮 Wiederhole die Sequenz!",
    win: "🔥 Gewonnen!",
    error: "❌ Fehler! Leben übrig: ",
    gameover: "🚫 Keine Leben mehr!",
    ad: "🎥 Werbung läuft...",
    adwin: "✅ +4 Leben hinzugefügt",
    timer: "⏱ Zeit"
  },

  ar: {
    title: "🧠 لعبة الذاكرة",
    start: "⭐ ابدأ",
    watchAd: "🎥 مشاهدة إعلان",
    score: "النقاط",
    level: "المستوى",
    lives: "الأرواح",
    observe: "👀 راقب جيدًا!",
    play: "🎮 أعد التسلسل!",
    win: "🔥 فزت!",
    error: "❌ خطأ! الأرواح المتبقية: ",
    gameover: "🚫 انتهت الأرواح! شاهد إعلانًا",
    ad: "🎥 الإعلان يعمل...",
    adwin: "✅ تمت إضافة 4 أرواح",
    timer: "⏱ الوقت"
  }
};

/* =========================
   🎨 COULEURS TRADUITES
========================= */

const colorNames = {
  fr: { red: "Rouge", green: "Vert", blue: "Bleu", yellow: "Jaune" },
  en: { red: "Red", green: "Green", blue: "Blue", yellow: "Yellow" },
  es: { red: "Rojo", green: "Verde", blue: "Azul", yellow: "Amarillo" },
  de: { red: "Rot", green: "Grün", blue: "Blau", yellow: "Gelb" },
  ar: { red: "أحمر", green: "أخضر", blue: "أزرق", yellow: "أصفر" }
};

function t(key) {
  return translations[lang][key];
}

function setLanguage(newLang) {
  lang = newLang;
  localStorage.setItem("lang", lang);
  updateUI();
}

/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {
  loadGame();

  const starBtn = get("star");
  const adBtn = get("watchAdBtn");
  const langSelect = get("langSelect");

  if (starBtn) {
    starBtn.addEventListener("click", () => {
      if (lives <= 0) {
        watchAd();
      } else {
        startGame();
      }
    });
  }

  if (adBtn) adBtn.addEventListener("click", watchAd);

  if (langSelect) {
    langSelect.value = lang;
    langSelect.addEventListener("change", (e) => {
      setLanguage(e.target.value);
    });
  }

  updateUI();
  updateButtonsState();
});

/* =========================
   STORAGE
========================= */

function saveGame() {
  localStorage.setItem("lives", lives);
  localStorage.setItem("level", level);
  localStorage.setItem("score", score);
}

function loadGame() {
  const savedLives = parseInt(localStorage.getItem("lives"));
  const savedLevel = parseInt(localStorage.getItem("level"));
  const savedScore = parseInt(localStorage.getItem("score"));

  lives = isNaN(savedLives) ? 5 : savedLives;
  level = isNaN(savedLevel) ? 1 : savedLevel;
  score = isNaN(savedScore) ? 0 : savedScore;
}

/* =========================
   START GAME
========================= */

function startGame() {
  if (lives <= 0) return;

  sequence = [];
  player = [];

  const adBtn = get("watchAdBtn");
  if (adBtn) adBtn.style.display = "none";

  nextRound();
}

/* =========================
   NEXT ROUND
========================= */

function nextRound() {
  clearInterval(timer);

  sequence = [];
  player = [];
  canPlay = false;

let length;

if (level <= 10) {
  length = 3;
}
else if (level <= 30) {
  length = 4;
}
else if (level <= 100) {
  length = 5;
}
else if (level <= 200) {
  length = 6;
}
else if (level <= 400) {
  length = 7;
}
else if (level <= 700) {
  length = 8;
}
else {
  length = 10;
}

const availableColors =
level <= 10
  ? colors.slice(0, 3)
  : colors;

for (let i = 0; i < length; i++) {
  const randomColor =
    availableColors[Math.floor(Math.random() * availableColors.length)];

  sequence.push(randomColor);
}

  if (get("msg")) {
    get("msg").textContent = t("observe");
  }

  if (get("flashGrid")) {
    get("flashGrid").style.display = "grid";
  }

  if (get("answerBox")) {
    get("answerBox").classList.add("hidden");
  }

  showSequence();
}

/* =========================
   SHOW SEQUENCE
========================= */

function showSequence() {

const speed = 900;

let i = 0;

const interval = setInterval(() => {
  if (i >= sequence.length) {
    clearInterval(interval);
    return;
  }

  flash(sequence[i]);
  i++;
}, speed);

  setTimeout(() => {
    if (get("flashGrid")) {
      get("flashGrid").style.display = "none";
    }

    if (get("answerBox")) {
      get("answerBox").classList.remove("hidden");
    }

    canPlay = true;

    if (get("msg")) {
      get("msg").textContent = t("play");
    }

    startTimer();
  }, sequence.length * speed + 700);
}

/* =========================
   FLASH
========================= */

function flash(color) {
  const el = document.querySelector("." + color);

  if (!el) return;

  el.classList.add("active");

  if (clickSound) {
    clickSound.currentTime = 0;
    clickSound.play();
  }

  setTimeout(() => {
    el.classList.remove("active");
  }, 250);
}

/* =========================
   PLAYER PICK
========================= */

function pick(color) {
  if (!canPlay) return;

  player.push(color);

  const index = player.length - 1;

  if (player[index] !== sequence[index]) {
    gameOver();
    return;
  }

  if (player.length === sequence.length) {
    winRound();
  }
}

/* =========================
   TIMER
========================= */

function startTimer() {
  clearInterval(timer);

  if (level <= 10) {
  timeLeft = 5;
}
else if (level <= 30) {
  timeLeft = 7;
}
else if (level <= 100) {
  timeLeft = 9;
}
else if (level <= 200) {
  timeLeft = 10;
}
else if (level <= 400) {
  timeLeft = 15;
}
else if (level <= 700) {
  timeLeft = 20;
}
else {
  timeLeft = 30;
}

  updateTimerUI();

  timer = setInterval(() => {
    timeLeft--;

    updateTimerUI();

    if (timeLeft <= 0) {
      clearInterval(timer);
      gameOver();
    }
  }, 1000);
}

function updateTimerUI() {
  if (get("timer")) {
    get("timer").textContent = `${t("timer")} : ${timeLeft}s`;
  }
}

/* =========================
   🏆 WIN
========================= */

function winRound() {
  clearInterval(timer);
  canPlay = false;

  if (winSound) {
    winSound.currentTime = 0;
    winSound.play();
  }

  score += level * 10;

  if (level < 1000) {
    level++;
  } else {
    if (get("msg")) {
      get("msg").textContent =
        "🏆 Bravo ! Tu as terminé les 1000 niveaux !";
    }
    return;
  }

  saveGame();
  updateUI();

  // 🌦️ Change le décor et la météo selon le nouveau niveau
  updateEnvironment();

  if (get("msg")) {
    get("msg").textContent = t("win");
  }

  setTimeout(() => {
    nextRound();
  }, 1200);
}

/* =========================
   GAME OVER
========================= */

function gameOver() {
  clearInterval(timer);
  canPlay = false;

  if (failSound) {
    failSound.currentTime = 0;
    failSound.play();
  }

  lives--;

  saveGame();
  updateUI();
  updateButtonsState();

  if (lives > 0) {
    if (get("msg")) {
      get("msg").textContent = t("error") + lives;
    }

    setTimeout(() => {
      nextRound();
    }, 1500);
  } else {
    if (get("msg")) {
      get("msg").textContent = t("gameover");
    }

    if (get("flashGrid")) {
      get("flashGrid").style.display = "none";
    }

    if (get("answerBox")) {
      get("answerBox").classList.add("hidden");
    }

    const adBtn = get("watchAdBtn");
    if (adBtn) {
      adBtn.style.display = "inline-block";
    }
  }
}

/* =========================
   PUB
========================= */

function watchAd() {
  if (adInProgress) return;

  adInProgress = true;

  const btn = get("watchAdBtn");

  if (btn) {
    btn.disabled = true;
  }

  if (get("msg")) {
    get("msg").textContent = t("ad");
  }

  setTimeout(() => {
    lives += 4;

    saveGame();
    updateUI();
    updateButtonsState();

    adInProgress = false;

    if (btn) {
      btn.disabled = false;
      btn.style.display = "none";
    }

    if (get("msg")) {
      get("msg").textContent = t("adwin");
    }

    setTimeout(() => {
      startGame();
    }, 1200);
  }, 5000);
}

/* =========================
   UPDATE UI
========================= */

function updateUI() {
  if (get("score")) get("score").textContent = score;
  if (get("level")) get("level").textContent = level;
  if (get("lives")) get("lives").textContent = lives;

  if (get("title")) get("title").textContent = t("title");
  if (get("startText")) get("startText").textContent = t("start");
  if (get("watchAdBtn")) get("watchAdBtn").textContent = t("watchAd");

  if (get("scoreLabel")) get("scoreLabel").textContent = t("score");
  if (get("levelLabel")) get("levelLabel").textContent = t("level");
  if (get("livesLabel")) get("livesLabel").textContent = t("lives");

  document.querySelectorAll(".color-name").forEach(el => {
    const color = el.dataset.color;

    if (colorNames[lang] && colorNames[lang][color]) {
      el.textContent = colorNames[lang][color];
    }
  });
}

/* =========================
   BUTTONS
========================= */

function updateButtonsState() {
  const starBtn = get("star");

  if (!starBtn) return;

  if (lives <= 0) {
    starBtn.style.opacity = "0.6";
  } else {
    starBtn.style.opacity = "1";
  }
}
const shareBtn = document.getElementById("shareBtn");
const shareMenu = document.getElementById("shareMenu");

const siteUrl = "https://storybak.vercel.app/";

document.getElementById("whatsappShare").href =
  `https://wa.me/?text=Joue%20à%20Memory%20Flash%20Pro%20${encodeURIComponent(siteUrl)}`;

document.getElementById("facebookShare").href =
  `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(siteUrl)}`;

shareBtn.addEventListener("click", () => {
  shareMenu.classList.toggle("hidden");
});
const profilePic = document.getElementById("profilePic");
const profileModal = document.getElementById("profileModal");

profilePic.onclick = () => {
  profileModal.style.display = "flex";
};

profileModal.onclick = () => {
  profileModal.style.display = "none";
};

/* =========================
   🌦️ SYSTÈME MÉTÉO + ENVIRONNEMENT
   100% CSS / JS
   AUCUNE IMAGE
========================= */

function updateEnvironment() {

  const oldClasses = [
    "environment-snow",
    "environment-ice",
    "environment-forest",
    "environment-rain",
    "environment-sun",
    "environment-sunset",
    "environment-night",
    "environment-fire"
  ];

  document.body.classList.remove(...oldClasses);

  let environment;

  if (level <= 10) {

    // ❄️ NIVEAU 1 → 10
    environment = "snow";

  } else if (level <= 30) {

    // 🧊 NIVEAU 11 → 30
    environment = "ice";

  } else if (level <= 100) {

    // 🌲 NIVEAU 31 → 100
    environment = "forest";

  } else if (level <= 200) {

    // 🌧️ NIVEAU 101 → 200
    environment = "rain";

  } else if (level <= 400) {

    // ☀️ NIVEAU 201 → 400
    environment = "sun";

  } else if (level <= 700) {

    // 🌅 NIVEAU 401 → 700
    environment = "sunset";

  } else if (level <= 900) {

    // 🌌 NIVEAU 701 → 900
    environment = "night";

  } else {

    // 🔥 NIVEAU 901 → 1000
    environment = "fire";
  }

  document.body.classList.add("environment-" + environment);

  createWeather(environment);
}


/* =========================
   🌨️ PARTICULES
========================= */

function createWeather(environment) {

  let layer = document.getElementById("weatherLayer");

  if (!layer) {

    layer = document.createElement("div");
    layer.id = "weatherLayer";

    document.body.prepend(layer);
  }

  layer.innerHTML = "";

  /* Pas de particules pour certains environnements */

  if (
    environment === "sun" ||
    environment === "sunset" ||
    environment === "night" ||
    environment === "fire"
  ) {
    return;
  }

  let amount = 35;

  for (let i = 0; i < amount; i++) {

    const particle = document.createElement("div");

    particle.classList.add("weather-particle");

    particle.style.left =
      Math.random() * 100 + "%";

    particle.style.animationDuration =
      (4 + Math.random() * 6) + "s";

    particle.style.animationDelay =
      Math.random() * 5 + "s";


    if (
      environment === "snow" ||
      environment === "ice"
    ) {

      particle.classList.add("snow-particle");

      const size =
        4 + Math.random() * 8;

      particle.style.width = size + "px";
      particle.style.height = size + "px";

    }


    if (environment === "rain") {

      particle.classList.add("rain-particle");

      particle.style.animationDuration =
        (0.5 + Math.random() * 0.8) + "s";
    }


    layer.appendChild(particle);
  }
}


/* =========================
   🚀 LANCEMENT
========================= */

document.addEventListener("DOMContentLoaded", () => {

  setTimeout(() => {
    updateEnvironment();
  }, 100);

});
