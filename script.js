/* =========================================================
   🧠 MEMORY FLASH PRO
   VERSION 4.0
   🎮 JEU + 🌍 MONDE CSS/JS
   🚫 AUCUNE IMAGE
========================================================= */


/* =========================================================
   💾 VERSION DU JEU
========================================================= */

const GAME_VERSION = "4.0";

if (localStorage.getItem("gameVersion") !== GAME_VERSION) {

  localStorage.removeItem("lives");
  localStorage.removeItem("level");
  localStorage.removeItem("score");

  localStorage.setItem("gameVersion", GAME_VERSION);
}


/* =========================================================
   🎮 VARIABLES DU JEU
========================================================= */

let sequence = [];
let player = [];

let level = 1;
let score = 0;
let lives = 5;

let timer = null;
let timeLeft = 10;

let canPlay = false;
let adInProgress = false;

const colors = [
  "red",
  "green",
  "blue",
  "yellow"
];


/* =========================================================
   🔧 FONCTION GET
========================================================= */

function get(id) {
  return document.getElementById(id);
}


/* =========================================================
   🌍 LANGUES
========================================================= */

let lang =
  localStorage.getItem("lang") || "fr";


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

    error:
      "❌ Erreur ! Vie restante : ",

    gameover:
      "🚫 Plus de vies ! Regarde une pub",

    ad:
      "🎥 Publicité en cours...",

    adwin:
      "✅ +4 vies ajoutées",

    timer:
      "⏱ Temps"

  },


  en: {

    title: "🧠 Memory Flash Pro",

    start: "⭐ Start",

    watchAd: "🎥 Watch Ad",

    score: "Score",

    level: "Level",

    lives: "Lives",

    observe:
      "👀 Watch carefully!",

    play:
      "🎮 Repeat the sequence!",

    win:
      "🔥 You win!",

    error:
      "❌ Wrong! Lives left: ",

    gameover:
      "🚫 No lives left! Watch an ad",

    ad:
      "🎥 Ad running...",

    adwin:
      "✅ +4 lives added",

    timer:
      "⏱ Time"

  },


  es: {

    title:
      "🧠 Memoria Flash Pro",

    start:
      "⭐ Empezar",

    watchAd:
      "🎥 Ver anuncio",

    score:
      "Puntuación",

    level:
      "Nivel",

    lives:
      "Vidas",

    observe:
      "👀 ¡Observa bien!",

    play:
      "🎮 ¡Repite la secuencia!",

    win:
      "🔥 ¡Ganaste!",

    error:
      "❌ Error! Vidas restantes: ",

    gameover:
      "🚫 Sin vidas. Mira un anuncio",

    ad:
      "🎥 Anuncio en curso...",

    adwin:
      "✅ +4 vidas añadidas",

    timer:
      "⏱ Tiempo"

  },


  de: {

    title:
      "🧠 Memory Flash Pro",

    start:
      "⭐ Starten",

    watchAd:
      "🎥 Werbung ansehen",

    score:
      "Punkte",

    level:
      "Level",

    lives:
      "Leben",

    observe:
      "👀 Gut beobachten!",

    play:
      "🎮 Wiederhole die Sequenz!",

    win:
      "🔥 Gewonnen!",

    error:
      "❌ Fehler! Leben übrig: ",

    gameover:
      "🚫 Keine Leben mehr!",

    ad:
      "🎥 Werbung läuft...",

    adwin:
      "✅ +4 Leben hinzugefügt",

    timer:
      "⏱ Zeit"

  },


  ar: {

    title:
      "🧠 لعبة الذاكرة",

    start:
      "⭐ ابدأ",

    watchAd:
      "🎥 مشاهدة إعلان",

    score:
      "النقاط",

    level:
      "المستوى",

    lives:
      "الأرواح",

    observe:
      "👀 راقب جيدًا!",

    play:
      "🎮 أعد التسلسل!",

    win:
      "🔥 فزت!",

    error:
      "❌ خطأ! الأرواح المتبقية: ",

    gameover:
      "🚫 انتهت الأرواح! شاهد إعلانًا",

    ad:
      "🎥 الإعلان يعمل...",

    adwin:
      "✅ تمت إضافة 4 أرواح",

    timer:
      "⏱ الوقت"

  }

};


/* =========================================================
   🎨 NOMS DES COULEURS
========================================================= */

const colorNames = {

  fr: {
    red: "Rouge",
    green: "Vert",
    blue: "Bleu",
    yellow: "Jaune"
  },

  en: {
    red: "Red",
    green: "Green",
    blue: "Blue",
    yellow: "Yellow"
  },

  es: {
    red: "Rojo",
    green: "Verde",
    blue: "Azul",
    yellow: "Amarillo"
  },

  de: {
    red: "Rot",
    green: "Grün",
    blue: "Blau",
    yellow: "Gelb"
  },

  ar: {
    red: "أحمر",
    green: "أخضر",
    blue: "أزرق",
    yellow: "أصفر"
  }

};


function t(key) {

  return (
    translations[lang]?.[key] ||
    translations.fr[key] ||
    key
  );

}


/* =========================================================
   🌍 CHANGEMENT DE LANGUE
========================================================= */

function setLanguage(newLang) {

  if (!translations[newLang]) {
    newLang = "fr";
  }

  lang = newLang;

  localStorage.setItem(
    "lang",
    lang
  );

  updateUI();

}


/* =========================================================
   💾 SAUVEGARDE
========================================================= */

function saveGame() {

  localStorage.setItem(
    "lives",
    lives
  );

  localStorage.setItem(
    "level",
    level
  );

  localStorage.setItem(
    "score",
    score
  );

}


/* =========================================================
   💾 CHARGEMENT
========================================================= */

function loadGame() {

  const savedLives =
    parseInt(
      localStorage.getItem("lives")
    );

  const savedLevel =
    parseInt(
      localStorage.getItem("level")
    );

  const savedScore =
    parseInt(
      localStorage.getItem("score")
    );


  lives =
    isNaN(savedLives)
      ? 5
      : savedLives;


  level =
    isNaN(savedLevel)
      ? 1
      : savedLevel;


  score =
    isNaN(savedScore)
      ? 0
      : savedScore;


  /* sécurité */

  if (level < 1)
    level = 1;

  if (level > 1000)
    level = 1000;

  if (score < 0)
    score = 0;

}


/* =========================================================
   🔊 SONS
========================================================= */

function playSound(id) {

  const sound = get(id);

  if (!sound)
    return;

  try {

    sound.currentTime = 0;

    const promise =
      sound.play();

    if (promise) {
      promise.catch(() => {});
    }

  } catch (error) {

    console.log(
      "Son indisponible :",
      id
    );

  }

}


/* =========================================================
   🚀 INITIALISATION
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadGame();

    const starBtn =
      get("star");

    const adBtn =
      get("watchAdBtn");

    const langSelect =
      get("langSelect");


    /* ⭐ bouton commencer */

    if (starBtn) {

      starBtn.addEventListener(
        "click",
        () => {

          if (lives <= 0) {

            watchAd();

          } else {

            startGame();

          }

        }
      );

    }


    /* 🎥 publicité */

    if (adBtn) {

      adBtn.addEventListener(
        "click",
        watchAd
      );

    }


    /* 🌍 langue */

    if (langSelect) {

      langSelect.value = lang;

      langSelect.addEventListener(
        "change",
        event => {

          setLanguage(
            event.target.value
          );

        }
      );

    }


    /* UI */

    updateUI();

    updateButtonsState();


    /* 🌍 création du monde */

    setTimeout(
      () => {

        createWorld();

      },
      150
    );


    /* 🔗 partage */

    setupShare();


    /* 👤 profil */

    setupProfile();

  }
);


/* =========================================================
   🎮 START GAME
========================================================= */

function startGame() {

  if (lives <= 0)
    return;


  sequence = [];

  player = [];


  const adBtn =
    get("watchAdBtn");


  if (adBtn) {

    adBtn.style.display =
      "none";

  }


  nextRound();

}


/* =========================================================
   🔄 PROCHAIN ROUND
========================================================= */

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


  for (
    let i = 0;
    i < length;
    i++
  ) {

    const randomColor =
      availableColors[
        Math.floor(
          Math.random() *
          availableColors.length
        )
      ];

    sequence.push(
      randomColor
    );

  }


  if (get("msg")) {

    get("msg").textContent =
      t("observe");

  }


  if (get("flashGrid")) {

    get("flashGrid").style.display =
      "grid";

  }


  if (get("answerBox")) {

    get("answerBox")
      .classList
      .add("hidden");

  }


  showSequence();

}


/* =========================================================
   👀 AFFICHAGE DE LA SÉQUENCE
========================================================= */

function showSequence() {

  const speed = 900;

  let i = 0;


  const interval =
    setInterval(
      () => {

        if (
          i >= sequence.length
        ) {

          clearInterval(
            interval
          );

          return;

        }


        flash(
          sequence[i]
        );

        i++;

      },
      speed
    );


  setTimeout(
    () => {

      if (get("flashGrid")) {

        get("flashGrid")
          .style.display =
          "none";

      }


      if (get("answerBox")) {

        get("answerBox")
          .classList
          .remove("hidden");

      }


      canPlay = true;


      if (get("msg")) {

        get("msg").textContent =
          t("play");

      }


      startTimer();

    },
    sequence.length * speed + 700
  );

}


/* =========================================================
   ✨ FLASH COULEUR
========================================================= */

function flash(color) {

  const el =
    document.querySelector(
      "." + color
    );


  if (!el)
    return;


  el.classList.add(
    "active"
  );


  playSound(
    "clickSound"
  );


  setTimeout(
    () => {

      el.classList.remove(
        "active"
      );

    },
    250
  );

}


/* =========================================================
   🎮 CHOIX DU JOUEUR
========================================================= */

function pick(color) {

  if (!canPlay)
    return;


  player.push(color);


  const index =
    player.length - 1;


  if (
    player[index] !==
    sequence[index]
  ) {

    gameOver();

    return;

  }


  if (
    player.length ===
    sequence.length
  ) {

    winRound();

  }

}


/* =========================================================
   ⏱️ TIMER
========================================================= */

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


  timer =
    setInterval(
      () => {

        timeLeft--;

        updateTimerUI();


        if (timeLeft <= 0) {

          clearInterval(
            timer
          );

          gameOver();

        }

      },
      1000
    );

}


/* =========================================================
   ⏱️ AFFICHAGE TIMER
========================================================= */

function updateTimerUI() {

  const timerElement =
    get("timer");


  if (timerElement) {

    timerElement.textContent =
      `${t("timer")} : ${timeLeft}s`;

  }

}


/* =========================================================
   🏆 VICTOIRE
========================================================= */

function winRound() {

  clearInterval(timer);

  canPlay = false;


  playSound(
    "winSound"
  );


  score +=
    level * 10;


  if (level < 1000) {

    level++;

  }

  else {

    saveGame();

    updateUI();

    createWorld();


    if (get("msg")) {

      get("msg").textContent =
        "🏆 Bravo ! Tu as terminé les 1000 niveaux !";

    }

    return;

  }


  saveGame();

  updateUI();


  /* 🌍 nouveau décor */

  createWorld();


  if (get("msg")) {

    get("msg").textContent =
      t("win");

  }


  setTimeout(
    () => {

      nextRound();

    },
    1200
  );

}


/* =========================================================
   ❌ GAME OVER
========================================================= */

function gameOver() {

  clearInterval(timer);

  canPlay = false;


  playSound(
    "failSound"
  );


  lives--;


  if (lives < 0)
    lives = 0;


  saveGame();

  updateUI();

  updateButtonsState();


  if (lives > 0) {

    if (get("msg")) {

      get("msg").textContent =
        t("error") +
        lives;

    }


    setTimeout(
      () => {

        nextRound();

      },
      1500
    );

  }

  else {

    if (get("msg")) {

      get("msg").textContent =
        t("gameover");

    }


    if (get("flashGrid")) {

      get("flashGrid")
        .style.display =
        "none";

    }


    if (get("answerBox")) {

      get("answerBox")
        .classList
        .add("hidden");

    }


    const adBtn =
      get("watchAdBtn");


    if (adBtn) {

      adBtn.style.display =
        "inline-block";

    }

  }

}


/* =========================================================
   🎥 PUB
========================================================= */

function watchAd() {

  if (adInProgress)
    return;


  adInProgress = true;


  const btn =
    get("watchAdBtn");


  if (btn) {

    btn.disabled = true;

  }


  if (get("msg")) {

    get("msg").textContent =
      t("ad");

  }


  setTimeout(
    () => {

      lives += 4;


      saveGame();

      updateUI();

      updateButtonsState();


      adInProgress = false;


      if (btn) {

        btn.disabled = false;

        btn.style.display =
          "none";

      }


      if (get("msg")) {

        get("msg").textContent =
          t("adwin");

      }


      setTimeout(
        () => {

          startGame();

        },
        1200
      );


    },
    5000
  );

}


/* =========================================================
   🎨 UPDATE UI
========================================================= */

function updateUI() {

  if (get("score"))
    get("score").textContent =
      score;


  if (get("level"))
    get("level").textContent =
      level;


  if (get("lives"))
    get("lives").textContent =
      lives;


  if (get("title"))
    get("title").textContent =
      t("title");


  if (get("startText"))
    get("startText").textContent =
      t("start");


  if (get("watchAdBtn"))
    get("watchAdBtn").textContent =
      t("watchAd");


  if (get("scoreLabel"))
    get("scoreLabel").textContent =
      t("score");


  if (get("levelLabel"))
    get("levelLabel").textContent =
      t("level");


  if (get("livesLabel"))
    get("livesLabel").textContent =
      t("lives");


  document
    .querySelectorAll(
      ".color-name"
    )
    .forEach(
      element => {

        const color =
          element.dataset.color;


        if (
          colorNames[lang] &&
          colorNames[lang][color]
        ) {

          element.textContent =
            colorNames[lang][color];

        }

      }
    );

}


/* =========================================================
   ⭐ ÉTAT BOUTON
========================================================= */

function updateButtonsState() {

  const starBtn =
    get("star");


  if (!starBtn)
    return;


  if (lives <= 0) {

    starBtn.style.opacity =
      "0.6";

  }

  else {

    starBtn.style.opacity =
      "1";

  }

}


/* =========================================================
   🔗 PARTAGE
========================================================= */

function setupShare() {

  const shareBtn =
    get("shareBtn");

  const shareMenu =
    get("shareMenu");


  if (!shareBtn ||
      !shareMenu)
    return;


  const siteUrl =
    "https://storybak.vercel.app/";


  const whatsapp =
    get("whatsappShare");


  const facebook =
    get("facebookShare");


  if (whatsapp) {

    whatsapp.href =
      `https://wa.me/?text=Joue%20à%20Memory%20Flash%20Pro%20${encodeURIComponent(siteUrl)}`;

  }


  if (facebook) {

    facebook.href =
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(siteUrl)}`;

  }


  shareBtn.addEventListener(
    "click",
    () => {

      shareMenu
        .classList
        .toggle("hidden");

    }
  );

}


/* =========================================================
   👤 PROFIL
========================================================= */

function setupProfile() {

  const profilePic =
    get("profilePic");

  const profileModal =
    get("profileModal");


  if (!profilePic ||
      !profileModal)
    return;


  profilePic.onclick =
    () => {

      profileModal.style.display =
        "flex";

    };


  profileModal.onclick =
    () => {

      profileModal.style.display =
        "none";

    };

}


/* =========================================================
   🌍 ENVIRONNEMENTS
========================================================= */

function getEnvironment() {

  if (level <= 10)
    return "snowCity";


  if (level <= 30)
    return "iceCity";


  if (level <= 100)
    return "forestCity";


  if (level <= 200)
    return "rainCity";


  if (level <= 400)
    return "sunCity";


  if (level <= 700)
    return "sunsetCity";


  if (level <= 900)
    return "nightCity";


  return "fireCity";

}


/* =========================================================
   🏙️ CRÉATION DU MONDE
========================================================= */

function createWorld() {

  let world =
    get("worldScene");


  if (!world) {

    world =
      document.createElement(
        "div"
      );

    world.id =
      "worldScene";

    document.body.prepend(
      world
    );

  }


  world.innerHTML = "";


  const environment =
    getEnvironment();


  world.dataset.environment =
    environment;


  /* 🌌 CIEL */

  const sky =
    document.createElement(
      "div"
    );

  sky.className =
    "world-sky";


  world.appendChild(
    sky
  );


  /* ⭐ ÉTOILES */

  createStars(
    world,
    environment
  );


  /* ☁️ NUAGES */

  createClouds(
    world,
    environment
  );


  /* 🌙 LUNE */

  if (
    environment === "snowCity" ||
    environment === "iceCity" ||
    environment === "nightCity" ||
    environment === "fireCity"
  ) {

    createMoon(world);

  }


  /* 🏔️ MONTAGNES */

  if (
    environment === "snowCity" ||
    environment === "iceCity" ||
    environment === "forestCity"
  ) {

    createMountains(world);

  }


  /* 🌲 ARBRES */

  if (
    environment === "snowCity" ||
    environment === "forestCity"
  ) {

    createTrees(world);

  }


  /* 🏢 IMMEUBLES */

  createBuildings(
    world,
    environment
  );


  /* 🌊 RIVIÈRE */

  if (
    environment === "snowCity" ||
    environment === "forestCity" ||
    environment === "sunsetCity"
  ) {

    createRiver(world);

  }


  /* 🛣️ ROUTE */

  createRoad(world);


  /* 💡 LAMPADAIRES */

  createLamps(world);


  /* 🚗 VOITURES */

  createCars(world);


  /* 🌫️ BROUILLARD */

  if (
    environment === "snowCity" ||
    environment === "rainCity" ||
    environment === "nightCity"
  ) {

    createFog(world);

  }


  /* ❄️ NEIGE */

  if (
    environment === "snowCity" ||
    environment === "iceCity"
  ) {

    createSnow(world);

  }


  /* 🌧️ PLUIE */

  if (
    environment === "rainCity"
  ) {

    createRain(world);

  }


  /* 🔥 FEU */

  if (
    environment === "fireCity"
  ) {

    createFire(world);

  }


  /* 🎨 COULEUR SPÉCIALE DU CIEL */

  applySkyStyle(
    world,
    environment
  );

}


/* =========================================================
   🌌 CIEL SELON ENVIRONNEMENT
========================================================= */

function applySkyStyle(
  world,
  environment
) {

  const sky =
    world.querySelector(
      ".world-sky"
    );


  if (!sky)
    return;


  const skies = {

    snowCity:
      "linear-gradient(180deg,#020718,#12315d,#577da3,#101827)",

    iceCity:
      "linear-gradient(180deg,#06172b,#2383ae,#8bdcff,#17344b)",

    forestCity:
      "linear-gradient(180deg,#061b19,#15533d,#6c9d76,#102719)",

    rainCity:
      "linear-gradient(180deg,#111a29,#263d50,#526777,#080d13)",

    sunCity:
      "linear-gradient(180deg,#43b8ff,#7ed8ff,#ffd56a,#e98435)",

    sunsetCity:
      "linear-gradient(180deg,#17113e,#5a2c68,#d25862,#f2a04d)",

    nightCity:
      "linear-gradient(180deg,#020516,#07133b,#142558,#03050e)",

    fireCity:
      "linear-gradient(180deg,#080102,#280706,#711b0c,#170303)"

  };


  sky.style.background =
    skies[environment];

}


/* =========================================================
   🌙 LUNE
========================================================= */

function createMoon(world) {

  const moon =
    document.createElement(
      "div"
    );

  moon.className =
    "world-moon";


  world.appendChild(
    moon
  );

}


/* =========================================================
   ⭐ ÉTOILES
========================================================= */

function createStars(
  world,
  environment
) {

  const night =
    environment === "snowCity" ||
    environment === "iceCity" ||
    environment === "nightCity" ||
    environment === "fireCity";


  if (!night)
    return;


  const amount =
    environment === "nightCity"
      ? 120
      : 70;


  for (
    let i = 0;
    i < amount;
    i++
  ) {

    const star =
      document.createElement(
        "div"
      );

    star.className =
      "world-star";


    star.style.left =
      Math.random() * 100 +
      "%";


    star.style.top =
      Math.random() * 60 +
      "%";


    star.style.animationDelay =
      Math.random() * 4 +
      "s";


    const size =
      2 +
      Math.random() * 3;


    star.style.width =
      size + "px";


    star.style.height =
      size + "px";


    world.appendChild(
      star
    );

  }

}


/* =========================================================
   ☁️ NUAGES
========================================================= */

function createClouds(
  world,
  environment
) {

  if (
    environment === "nightCity" ||
    environment === "fireCity"
  ) {

    return;

  }


  for (
    let i = 0;
    i < 7;
    i++
  ) {

    const cloud =
      document.createElement(
        "div"
      );

    cloud.className =
      "world-cloud";


    cloud.style.top =
      8 +
      Math.random() * 35 +
      "%";


    cloud.style.left =
      Math.random() * 100 +
      "%";


    cloud.style.animationDuration =
      25 +
      Math.random() * 35 +
      "s";


    cloud.style.animationDelay =
      Math.random() * -30 +
      "s";


    world.appendChild(
      cloud
    );

  }

}


/* =========================================================
   🏔️ MONTAGNES
========================================================= */

function createMountains(world) {

  const mountains =
    document.createElement(
      "div"
    );

  mountains.className =
    "world-mountains";


  world.appendChild(
    mountains
  );

}


/* =========================================================
   🏢 IMMEUBLES
========================================================= */

function createBuildings(
  world,
  environment
) {

  let amount = 18;


  if (
    environment === "forestCity"
  ) {

    amount = 11;

  }


  if (
    environment === "fireCity"
  ) {

    amount = 22;

  }


  let position = -2;


  for (
    let i = 0;
    i < amount;
    i++
  ) {

    const building =
      document.createElement(
        "div"
      );

    building.className =
      "world-building";


    const width =
      4 +
      Math.random() * 5;


    const height =
      14 +
      Math.random() * 38;


    building.style.left =
      position + "%";


    building.style.width =
      width + "%";


    building.style.height =
      height + "%";


    /* couleurs */

    if (
      environment === "sunCity"
    ) {

      building.style.background =
        "linear-gradient(90deg,#30343b,#777f86,#25282e)";

    }


    if (
      environment === "sunsetCity"
    ) {

      building.style.background =
        "linear-gradient(90deg,#21152f,#70435d,#17101f)";

    }


    if (
      environment === "nightCity"
    ) {

      building.style.background =
        "linear-gradient(90deg,#030611,#111d3b,#02040a)";

    }


    if (
      environment === "fireCity"
    ) {

      building.style.background =
        "linear-gradient(90deg,#100303,#421009,#070101)";

    }


    if (
      environment === "iceCity"
    ) {

      building.style.background =
        "linear-gradient(90deg,#0c3047,#3f7790,#0a2335)";

    }


    /* 🪟 fenêtres */

    const rows =
      Math.max(
        4,
        Math.floor(
          height / 5
        )
      );


    const columns =
      Math.max(
        2,
        Math.floor(
          width / 1.8
        )
      );


    for (
      let r = 0;
      r < rows;
      r++
    ) {

      for (
        let c = 0;
        c < columns;
        c++
      ) {

        if (
          Math.random() > .62
        ) {

          continue;

        }


        const window =
          document.createElement(
            "div"
          );


        window.className =
          "world-window";


        window.style.left =
          (
            8 +
            c *
            (
              78 /
              Math.max(
                1,
                columns
              )
            )
          ) + "%";


        window.style.top =
          (
            8 +
            r *
            (
              84 /
              Math.max(
                1,
                rows
              )
            )
          ) + "%";


        window.style.animationDelay =
          Math.random() * 5 +
          "s";


        world.appendChild(
          building
        );


        building.appendChild(
          window
        );

      }

    }


    position +=
      width +
      Math.random() * 1.5;

  }

}


/* =========================================================
   🌲 ARBRES
========================================================= */

function createTrees(world) {

  for (
    let i = 0;
    i < 22;
    i++
  ) {

    const tree =
      document.createElement(
        "div"
      );

    tree.className =
      "world-tree";


    tree.style.left =
      Math.random() * 100 +
      "%";


    tree.style.transform =
      `scale(${
        .65 +
        Math.random() * .8
      })`;


    tree.style.bottom =
      (
        18 +
        Math.random() * 7
      ) + "%";


    world.appendChild(
      tree
    );

  }

}


/* =========================================================
   🌊 RIVIÈRE
========================================================= */

function createRiver(world) {

  const river =
    document.createElement(
      "div"
    );

  river.className =
    "world-river";


  world.appendChild(
    river
  );

}


/* =========================================================
   🛣️ ROUTE
========================================================= */

function createRoad(world) {

  const road =
    document.createElement(
      "div"
    );

  road.className =
    "world-road";


  world.appendChild(
    road
  );

}


/* =========================================================
   💡 LAMPADAIRES
========================================================= */

function createLamps(world) {

  for (
    let i = 0;
    i < 8;
    i++
  ) {

    const lamp =
      document.createElement(
        "div"
      );

    lamp.className =
      "world-lamp";


    lamp.style.left =
      (
        3 +
        i * 14
      ) + "%";


    world.appendChild(
      lamp
    );

  }

}


/* =========================================================
   🚗 VOITURES
========================================================= */

function createCars(world) {

  const carColors = [

    "#ff3030",
    "#208cff",
    "#eeeeee",
    "#ffd21c",
    "#20c878",
    "#a83cff"

  ];


  for (
    let i = 0;
    i < 5;
    i++
  ) {

    const car =
      document.createElement(
        "div"
      );

    car.className =
      "world-car";


    car.style.bottom =
      (
        4 +
        i * 4
      ) + "%";


    car.style.animationDuration =
      (
        7 +
        Math.random() * 8
      ) + "s";


    car.style.animationDelay =
      Math.random() * -10 +
      "s";


    const color =
      carColors[
        Math.floor(
          Math.random() *
          carColors.length
        )
      ];


    car.style.background =
      `linear-gradient(
        180deg,
        ${color},
        #111
      )`;


    world.appendChild(
      car
    );

  }

}


/* =========================================================
   🌫️ BROUILLARD
========================================================= */

function createFog(world) {

  const fog =
    document.createElement(
      "div"
    );

  fog.className =
    "world-fog";


  world.appendChild(
    fog
  );

}


/* =========================================================
   ❄️ NEIGE
========================================================= */

function createSnow(world) {

  for (
    let i = 0;
    i < 100;
    i++
  ) {

    const snow =
      document.createElement(
        "div"
      );

    snow.className =
      "world-snow";


    const size =
      3 +
      Math.random() * 9;


    snow.style.width =
      size + "px";


    snow.style.height =
      size + "px";


    snow.style.left =
      Math.random() * 100 +
      "%";


    snow.style.animationDuration =
      (
        4 +
        Math.random() * 8
      ) + "s";


    snow.style.animationDelay =
      Math.random() * -10 +
      "s";


    world.appendChild(
      snow
    );

  }

}


/* =========================================================
   🌧️ PLUIE
========================================================= */

function createRain(world) {

  for (
    let i = 0;
    i < 150;
    i++
  ) {

    const rain =
      document.createElement(
        "div"
      );

    rain.className =
      "world-rain";


    rain.style.left =
      Math.random() * 100 +
      "%";


    rain.style.animationDuration =
      (
        .45 +
        Math.random() * .7
      ) + "s";


    rain.style.animationDelay =
      Math.random() * -3 +
      "s";


    world.appendChild(
      rain
    );

  }

}


/* =========================================================
   🔥 FEU + 💨 FUMÉE
========================================================= */

function createFire(world) {

  /* 🔥 étincelles */

  for (
    let i = 0;
    i < 50;
    i++
  ) {

    const fire =
      document.createElement(
        "div"
      );

    fire.className =
      "world-fire";


    fire.style.left =
      Math.random() * 100 +
      "%";


    fire.style.animationDuration =
      (
        1 +
        Math.random() * 2
      ) + "s";


    fire.style.animationDelay =
      Math.random() * 3 +
      "s";


    world.appendChild(
      fire
    );

  }


  /* 💨 fumée */

  for (
    let i = 0;
    i < 10;
    i++
  ) {

    const smoke =
      document.createElement(
        "div"
      );

    smoke.className =
      "world-smoke";


    smoke.style.left =
      (
        5 +
        Math.random() * 90
      ) + "%";


    smoke.style.animationDelay =
      Math.random() * 5 +
      "s";


    world.appendChild(
      smoke
    );

  }

}


/* =========================================================
   🔄 RECRÉER LE MONDE SI BESOIN
========================================================= */

function refreshWorld() {

  createWorld();

}


/* =========================================================
   🚀 SÉCURITÉ : SI LE SCRIPT EST CHARGÉ APRÈS DOM
========================================================= */

if (
  document.readyState ===
  "interactive" ||
  document.readyState ===
  "complete"
) {

  setTimeout(
    () => {

      loadGame();

      updateUI();

      updateButtonsState();

      createWorld();

    },
    100
  );

    }
