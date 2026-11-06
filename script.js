/* =========================================================
   STORYBAK — Memory Flash Pro
   script.js (version 2, complète)

   SOMMAIRE
   01. Configuration
   02. Textes et langues
   03. Sauvegarde sécurisée (signée)
   04. Pub (UN SEUL point d'entrée)
   05. Sons, messages, bouton Commencer
   06. Déroulement d'une manche
   07. Carte des villes (villes verrouillées)
   08. Interface (textes, fond, partage, profil)
   09. Démarrage

   Tout le code est dans une fonction fermée : on ne peut plus
   changer les vies, le niveau ou le score depuis la console.
========================================================= */

(function () {
  'use strict';

  /* =======================================================
     01. CONFIGURATION
  ======================================================= */

  const MAX_LEVEL = 1000;
  const START_LIVES = 5;
  const MAX_LIVES = 20;
  const AD_REWARD_LIVES = 4;

  const COLORS = ['red', 'green', 'blue', 'yellow'];
  const SITE_URL = 'https://storybak.vercel.app/';

  /* 9 villes : une ville change tous les 20 niveaux (la 9e dès le niveau 161) */
  const CITIES = [
    'ville1.png', 'ville2.png', 'ville3.png', 'ville4.png', 'ville5.png',
    'ville6.png', 'ville7.png', 'ville8.png', 'ville9.png'
  ];
  const CITY_SIZE = 20;
  const LAST_CITY = CITIES.length - 1;

  const SAVE_KEY = 'storybak_save_v2';
  const SIGN_SECRET = 'sb#2026!memory-flash-pro';

  /* difficulté : nombre de couleurs de la séquence */
  function lengthFor(level) {
    if (level <= 10) return 3;
    if (level <= 30) return 4;
    if (level <= 100) return 5;
    if (level <= 200) return 6;
    if (level <= 400) return 7;
    if (level <= 700) return 8;
    return 10;
  }

  /* difficulté : temps pour répondre (secondes) */
  function timeFor(level) {
    if (level <= 10) return 5;
    if (level <= 30) return 7;
    if (level <= 100) return 9;
    if (level <= 200) return 10;
    if (level <= 400) return 15;
    if (level <= 700) return 20;
    return 30;
  }

  /* villes */
  function cityOf(level) { return Math.min(LAST_CITY, Math.floor((level - 1) / CITY_SIZE)); }
  function cityStart(k) { return k * CITY_SIZE + 1; }
  function cityEnd(k) { return k === LAST_CITY ? MAX_LEVEL : (k + 1) * CITY_SIZE; }


  /* =======================================================
     02. TEXTES ET LANGUES
  ======================================================= */

  const TR = {
    fr: {
      title: '🧠 Memory Flash Pro', start: '⭐ Commencer', watchAd: '🎥 Regarder une pub',
      score: 'Score', level: 'Niveau', lives: 'Vies', timer: '⏱ Temps',
      ready: 'Appuie sur Commencer', observe: '👀 Observe bien !', play: '🎮 Reproduis la séquence !',
      win: '🔥 Gagné !', error: '❌ Erreur ! Vie restante : {n}',
      gameover: '🚫 Plus de vies ! Regarde une pub', loading: '⏳ Chargement...',
      adwin: '✅ +4 vies ajoutées', adFail: '⚠️ Pub indisponible, réessaie.',
      finished: '🏆 Bravo ! Tu as terminé les 1000 niveaux !',
      map: '🗺 Carte', mapTitle: 'Choisis une ville', close: 'Fermer', city: 'Ville',
      range: 'Niveaux {a}–{b}', needLevel: '🔒 Atteins le niveau {n}',
      unlocked: '🏙 Nouvelle ville débloquée !', tamper: '⚠️ Sauvegarde invalide : progression remise à zéro',
      langLabel: '🌍 Langue :', share: '📤 Partager', apk: '📥 Télécharger l’APK', shareText: 'Joue à Memory Flash Pro'
    },
    en: {
      title: '🧠 Memory Flash Pro', start: '⭐ Start', watchAd: '🎥 Watch Ad',
      score: 'Score', level: 'Level', lives: 'Lives', timer: '⏱ Time',
      ready: 'Press Start', observe: '👀 Watch carefully!', play: '🎮 Repeat the sequence!',
      win: '🔥 You win!', error: '❌ Wrong! Lives left: {n}',
      gameover: '🚫 No lives left! Watch an ad', loading: '⏳ Loading...',
      adwin: '✅ +4 lives added', adFail: '⚠️ Ad unavailable, try again.',
      finished: '🏆 Bravo! You finished all 1000 levels!',
      map: '🗺 Map', mapTitle: 'Choose a city', close: 'Close', city: 'City',
      range: 'Levels {a}–{b}', needLevel: '🔒 Reach level {n}',
      unlocked: '🏙 New city unlocked!', tamper: '⚠️ Invalid save: progress has been reset',
      langLabel: '🌍 Language :', share: '📤 Share', apk: '📥 Download APK', shareText: 'Play Memory Flash Pro'
    },
    es: {
      title: '🧠 Memoria Flash Pro', start: '⭐ Empezar', watchAd: '🎥 Ver anuncio',
      score: 'Puntuación', level: 'Nivel', lives: 'Vidas', timer: '⏱ Tiempo',
      ready: 'Pulsa Empezar', observe: '👀 ¡Observa bien!', play: '🎮 ¡Repite la secuencia!',
      win: '🔥 ¡Ganaste!', error: '❌ ¡Error! Vidas restantes: {n}',
      gameover: '🚫 Sin vidas. Mira un anuncio', loading: '⏳ Cargando...',
      adwin: '✅ +4 vidas añadidas', adFail: '⚠️ Anuncio no disponible, inténtalo de nuevo.',
      finished: '🏆 ¡Bravo! ¡Has completado los 1000 niveles!',
      map: '🗺 Mapa', mapTitle: 'Elige una ciudad', close: 'Cerrar', city: 'Ciudad',
      range: 'Niveles {a}–{b}', needLevel: '🔒 Llega al nivel {n}',
      unlocked: '🏙 ¡Nueva ciudad desbloqueada!', tamper: '⚠️ Partida no válida: progreso reiniciado',
      langLabel: '🌍 Idioma :', share: '📤 Compartir', apk: '📥 Descargar APK', shareText: 'Juega a Memory Flash Pro'
    },
    de: {
      title: '🧠 Memory Flash Pro', start: '⭐ Starten', watchAd: '🎥 Werbung ansehen',
      score: 'Punkte', level: 'Level', lives: 'Leben', timer: '⏱ Zeit',
      ready: 'Drücke Starten', observe: '👀 Gut beobachten!', play: '🎮 Wiederhole die Sequenz!',
      win: '🔥 Gewonnen!', error: '❌ Fehler! Leben übrig: {n}',
      gameover: '🚫 Keine Leben mehr! Sieh dir Werbung an', loading: '⏳ Lädt...',
      adwin: '✅ +4 Leben hinzugefügt', adFail: '⚠️ Werbung nicht verfügbar, versuche es erneut.',
      finished: '🏆 Bravo! Alle 1000 Level geschafft!',
      map: '🗺 Karte', mapTitle: 'Wähle eine Stadt', close: 'Schließen', city: 'Stadt',
      range: 'Level {a}–{b}', needLevel: '🔒 Erreiche Level {n}',
      unlocked: '🏙 Neue Stadt freigeschaltet!', tamper: '⚠️ Ungültiger Spielstand: Fortschritt zurückgesetzt',
      langLabel: '🌍 Sprache :', share: '📤 Teilen', apk: '📥 APK herunterladen', shareText: 'Spiele Memory Flash Pro'
    },
    ar: {
      title: '🧠 لعبة الذاكرة', start: '⭐ ابدأ', watchAd: '🎥 مشاهدة إعلان',
      score: 'النقاط', level: 'المستوى', lives: 'الأرواح', timer: '⏱ الوقت',
      ready: 'اضغط على ابدأ', observe: '👀 راقب جيدًا!', play: '🎮 أعد التسلسل!',
      win: '🔥 فزت!', error: '❌ خطأ! الأرواح المتبقية: {n}',
      gameover: '🚫 انتهت الأرواح! شاهد إعلانًا', loading: '⏳ جارٍ التحميل...',
      adwin: '✅ تمت إضافة 4 أرواح', adFail: '⚠️ الإعلان غير متاح، حاول مرة أخرى.',
      finished: '🏆 أحسنت! أنهيت المستويات الـ1000!',
      map: '🗺 الخريطة', mapTitle: 'اختر مدينة', close: 'إغلاق', city: 'مدينة',
      range: 'المستويات {a}–{b}', needLevel: '🔒 يلزم الوصول إلى المستوى {n}',
      unlocked: '🏙 تم فتح مدينة جديدة!', tamper: '⚠️ حفظ غير صالح: تمت إعادة التقدم',
      langLabel: '🌍 اللغة :', share: '📤 مشاركة', apk: '📥 تحميل APK', shareText: 'العب Memory Flash Pro'
    }
  };

  const COLOR_NAMES = {
    fr: { red: 'Rouge', green: 'Vert', blue: 'Bleu', yellow: 'Jaune' },
    en: { red: 'Red', green: 'Green', blue: 'Blue', yellow: 'Yellow' },
    es: { red: 'Rojo', green: 'Verde', blue: 'Azul', yellow: 'Amarillo' },
    de: { red: 'Rot', green: 'Grün', blue: 'Blau', yellow: 'Gelb' },
    ar: { red: 'أحمر', green: 'أخضر', blue: 'أزرق', yellow: 'أصفر' }
  };

  let lang = 'fr';
  try { lang = localStorage.getItem('lang') || 'fr'; } catch (e) { /* stockage indisponible */ }
  if (!TR[lang]) lang = 'fr';

  function t(key, vars) {
    let s = (TR[lang] && TR[lang][key]) || TR.fr[key] || key;
    if (vars) for (const k in vars) s = s.split('{' + k + '}').join(vars[k]);
    return s;
  }


  /* =======================================================
     03. SAUVEGARDE SÉCURISÉE
     Les données sont codées et SIGNÉES. Si quelqu'un les modifie
     dans le navigateur, la signature ne correspond plus :
     la sauvegarde est refusée et remise à zéro.
     (Un jeu 100 % navigateur ne peut jamais être inviolable ;
     cette protection arrête la triche simple.)
  ======================================================= */

  let lives = START_LIVES;
  let level = 1;
  let maxLevel = 1;   // plus haut niveau atteint = ce qui débloque les villes
  let score = 0;
  let tampered = false;

  function hash53(str, seed) {
    let h1 = 0xdeadbeef ^ (seed || 0), h2 = 0x41c6ce57 ^ (seed || 0);
    for (let i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
  }

  function encodeSave() {
    const payload = JSON.stringify([2, lives, level, maxLevel, score]);
    return btoa(payload) + '.' + hash53(payload + SIGN_SECRET);
  }

  function decodeSave(raw) {
    if (typeof raw !== 'string') return null;
    const cut = raw.lastIndexOf('.');
    if (cut < 1) return null;

    let payload, arr;
    try { payload = atob(raw.slice(0, cut)); } catch (e) { return null; }
    if (hash53(payload + SIGN_SECRET) !== raw.slice(cut + 1)) return null;
    try { arr = JSON.parse(payload); } catch (e) { return null; }

    if (!Array.isArray(arr) || arr.length !== 5 || arr[0] !== 2) return null;
    const v = { lives: arr[1], level: arr[2], maxLevel: arr[3], score: arr[4] };
    if (!Object.values(v).every(Number.isInteger)) return null;
    if (v.lives < 0 || v.lives > MAX_LIVES) return null;
    if (v.level < 1 || v.level > MAX_LEVEL) return null;
    if (v.maxLevel < v.level || v.maxLevel > MAX_LEVEL) return null;
    if (v.score < 0 || v.score > 1e9) return null;
    return v;
  }

  function saveGame() {
    try { localStorage.setItem(SAVE_KEY, encodeSave()); } catch (e) { /* ignoré */ }
  }

  function clamp(n, min, max, fallback) {
    n = parseInt(n, 10);
    return isNaN(n) ? fallback : Math.max(min, Math.min(max, n));
  }

  function loadGame() {
    let raw = null;
    try { raw = localStorage.getItem(SAVE_KEY); } catch (e) { /* ignoré */ }

    if (raw !== null) {
      const v = decodeSave(raw);
      if (v) { ({ lives, level, maxLevel, score } = v); return; }
      tampered = true;                      // sauvegarde modifiée ou abîmée
      lives = START_LIVES; level = 1; maxLevel = 1; score = 0;
      saveGame();
      return;
    }

    /* ancienne version (une seule fois) : on récupère la progression, puis on efface */
    try {
      const oldLevel = localStorage.getItem('level');
      if (oldLevel !== null) {
        level = clamp(oldLevel, 1, MAX_LEVEL, 1);
        maxLevel = level;
        lives = clamp(localStorage.getItem('lives'), 0, 9, START_LIVES);
        score = clamp(localStorage.getItem('score'), 0, 1e9, 0);
        ['level', 'lives', 'score'].forEach(function (k) { localStorage.removeItem(k); });
      }
    } catch (e) { /* ignoré */ }
    saveGame();
  }


  /* =======================================================
     04. PUB — UN SEUL POINT D'ENTRÉE
     Le jeu n'a plus qu'UNE pub : la pub récompensée (+4 vies).
     Pour l'instant elle est simulée. Quand tu auras le vrai
     SDK (Playgama, GameMonetize…), remplace UNIQUEMENT le
     contenu de showRewarded() : il doit renvoyer true si la
     pub a été regardée en entier, sinon false.
  ======================================================= */

  const Ads = {
    showRewarded: function () {
      return new Promise(function (resolve) {
        // ⬇️ SIMULATION : à remplacer par le vrai appel de pub
        setTimeout(function () { resolve(true); }, 1000);
      });
    }
  };


  /* =======================================================
     05. SONS, MESSAGES, BOUTON COMMENCER
  ======================================================= */

  const $ = function (id) { return document.getElementById(id); };

  let el = {};            // éléments HTML, remplis au démarrage
  let msgState = { key: 'ready', vars: null };
  let timeLeft = 0;
  let timerShown = false;

  function safePlay(audio) {
    if (!audio) return;
    try {
      audio.currentTime = 0;
      const p = audio.play();
      if (p && p.catch) p.catch(function () { /* son bloqué par le navigateur : ignoré */ });
    } catch (e) { /* ignoré */ }
  }

  function setMsg(key, vars) {
    msgState = { key: key, vars: vars || null };
    if (el.msg) el.msg.textContent = t(key, vars);
  }

  function showEl(node, display) { if (node) node.style.display = display; }
  function setHidden(node, hidden) { if (node) node.classList.toggle('hidden', hidden); }

  /* Le bouton Commencer DISPARAÎT dès que la partie démarre,
     et ne revient que quand le joueur peut relancer. */
  function showStart(visible) { setHidden(el.star, !visible); }

  function showAdButton(visible) { showEl(el.watchAdBtn, visible ? 'block' : 'none'); }

  let toastTimer = null;
  function toast(key, vars) {
    if (!el.toast) return;
    el.toast.textContent = t(key, vars);
    el.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.toast.classList.remove('show'); }, 2800);
  }


  /* =======================================================
     06. DÉROULEMENT D'UNE MANCHE
  ======================================================= */

  let sequence = [];
  let player = [];
  let canPlay = false;
  let roundActive = false;
  let adBusy = false;

  /* Tous les délais de la manche passent par later() : on peut donc
     TOUT annuler d'un coup (carte, changement d'onglet, nouvelle manche)
     sans qu'une ancienne séquence ne se mélange à la nouvelle. */
  let runId = 0;
  let pending = [];
  let timerId = null;

  function later(fn, ms) {
    const id = runId;
    pending.push(setTimeout(function () { if (id === runId) fn(); }, ms));
  }

  function stopTimer() {
    clearInterval(timerId);
    timerId = null;
    timerShown = false;
    if (el.timer) el.timer.textContent = '';
  }

  function cancelRound() {
    runId++;
    pending.forEach(clearTimeout);
    pending = [];
    stopTimer();
    canPlay = false;
    document.querySelectorAll('#flashGrid .btn.active').forEach(function (n) { n.classList.remove('active'); });
  }

  /* écran « prêt » : Commencer visible, ou pub si plus de vies */
  function renderIdle() {
    cancelRound();
    roundActive = false;
    sequence = []; player = [];
    setHidden(el.answerBox, true);

    if (lives <= 0) {
      setHidden(el.flashGrid, true);
      setMsg('gameover');
      showStart(false);
      showAdButton(true);
    } else {
      showEl(el.flashGrid, 'grid');
      setHidden(el.flashGrid, false);
      setMsg('ready');
      showStart(true);
      showAdButton(false);
    }
  }

  function startGame() {
    if (roundActive || adBusy) return;
    if (lives <= 0) { renderIdle(); return; }
    nextRound();
  }

  function nextRound() {
    cancelRound();
    roundActive = true;
    showStart(false);          // ← le bouton Commencer disparaît
    showAdButton(false);

    sequence = []; player = [];
    const count = lengthFor(level);
    const pool = level <= 10 ? COLORS.slice(0, 3) : COLORS;
    for (let i = 0; i < count; i++) sequence.push(pool[Math.floor(Math.random() * pool.length)]);

    setMsg('observe');
    setHidden(el.answerBox, true);
    showEl(el.flashGrid, 'grid');
    setHidden(el.flashGrid, false);

    const speed = 900;
    sequence.forEach(function (color, i) { later(function () { flash(color); }, 500 + i * speed); });
    later(beginAnswer, 500 + sequence.length * speed + 250);
  }

  function flash(color) {
    const node = document.querySelector('#flashGrid .btn.' + color);
    if (!node) return;
    node.classList.add('active');
    safePlay(el.clickSound);
    later(function () { node.classList.remove('active'); }, 450);
  }

  function beginAnswer() {
    showEl(el.flashGrid, 'none');
    setHidden(el.answerBox, false);
    canPlay = true;
    setMsg('play');
    startTimer();
  }

  function startTimer() {
    stopTimer();
    timeLeft = timeFor(level);
    timerShown = true;
    updateTimerUI();
    timerId = setInterval(function () {
      timeLeft--;
      updateTimerUI();
      if (timeLeft <= 0) wrongAnswer();
    }, 1000);
  }

  function updateTimerUI() {
    if (el.timer && timerShown) el.timer.textContent = t('timer') + ' : ' + timeLeft + 's';
  }

  function pick(color) {
    if (!canPlay || COLORS.indexOf(color) === -1) return;
    safePlay(el.clickSound);
    player.push(color);

    const i = player.length - 1;
    if (player[i] !== sequence[i]) { wrongAnswer(); return; }
    if (player.length === sequence.length) winRound();
  }

  function winRound() {
    stopTimer();
    canPlay = false;
    safePlay(el.winSound);

    /* le score ne monte que sur un niveau NOUVEAU (pas en rejouant un ancien) */
    if (level >= maxLevel) score += level * 10;

    if (level >= MAX_LEVEL) {
      saveGame(); updateUI();
      roundActive = false;
      setHidden(el.answerBox, true); setHidden(el.flashGrid, true);
      setMsg('finished');
      showStart(true);
      return;
    }

    const before = maxLevel;
    level++;
    if (level > maxLevel) maxLevel = level;
    saveGame();
    updateUI();
    setMsg('win');

    if (level > before && cityStart(cityOf(level)) === level && level > 1) toast('unlocked');

    later(nextRound, 1200);
  }

  function wrongAnswer() {
    stopTimer();
    canPlay = false;
    safePlay(el.failSound);

    lives = Math.max(0, lives - 1);
    saveGame();
    updateUI();

    if (lives > 0) {
      setMsg('error', { n: lives });
      later(nextRound, 1500);
    } else {
      roundActive = false;
      setHidden(el.answerBox, true);
      setHidden(el.flashGrid, true);
      setMsg('gameover');
      showStart(false);
      showAdButton(true);
    }
  }

  /* pub récompensée : +4 vies */
  async function watchAd() {
    if (adBusy || roundActive) return;
    adBusy = true;
    if (el.watchAdBtn) el.watchAdBtn.disabled = true;
    setMsg('loading');

    let rewarded = false;
    try { rewarded = await Ads.showRewarded(); } catch (e) { rewarded = false; }

    adBusy = false;
    if (el.watchAdBtn) el.watchAdBtn.disabled = false;

    if (rewarded) {
      lives = Math.min(MAX_LIVES, lives + AD_REWARD_LIVES);
      saveGame();
      updateUI();
      renderIdle();            // Commencer revient
      setMsg('adwin');
    } else {
      setMsg('adFail');
    }
  }


  /* =======================================================
     07. CARTE DES VILLES
     Une ville est débloquée quand on a ATTEINT son premier niveau
     (maxLevel, qui est signé dans la sauvegarde).
     Les villes verrouillées sont grisées avec un cadenas.
  ======================================================= */

  function isUnlocked(k) { return maxLevel >= cityStart(k); }

  function levelFor(k) {
    const a = cityStart(k), b = cityEnd(k);
    return (maxLevel >= a && maxLevel <= b) ? maxLevel : a;   // ville en cours : on reprend où on en est
  }

  function openMap() {
    if (adBusy) return;
    renderIdle();                 // arrête la manche sans enlever de vie
    renderMap();
    setHidden(el.cityMenu, false);
  }

  function closeMap() { setHidden(el.cityMenu, true); }

  function renderMap() {
    const grid = el.cityGrid;
    el.cityTitle.textContent = t('mapTitle');
    el.cityClose.textContent = t('close');
    grid.textContent = '';

    for (let k = 0; k <= LAST_CITY; k++) {
      const open = isUnlocked(k);
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'city-card' + (open ? '' : ' locked') + (cityOf(level) === k ? ' current' : '');
      card.style.setProperty('--img', 'url("' + CITIES[k] + '")');

      const name = document.createElement('span');
      name.className = 'city-name';
      name.textContent = t('city') + ' ' + (k + 1);

      const req = document.createElement('span');
      req.className = 'city-req';
      req.textContent = open ? t('range', { a: cityStart(k), b: cityEnd(k) }) : t('needLevel', { n: cityStart(k) });

      card.appendChild(name);
      card.appendChild(req);
      if (!open) {
        const lock = document.createElement('span');
        lock.className = 'lock-badge';
        lock.textContent = '🔒';
        card.appendChild(lock);
      }
      card.addEventListener('click', function () { chooseCity(k); });
      grid.appendChild(card);
    }
  }

  function chooseCity(k) {
    if (!isUnlocked(k)) {                      // verrouillée : message, rien ne change
      safePlay(el.failSound);
      toast('needLevel', { n: cityStart(k) });
      return;
    }
    safePlay(el.clickSound);
    level = levelFor(k);
    saveGame();
    closeMap();
    updateUI();
    renderIdle();
  }


  /* =======================================================
     08. INTERFACE
  ======================================================= */

  function updateBackground() {
    const url = 'url("./' + CITIES[cityOf(level)] + '")';
    if (document.body.style.backgroundImage !== url) document.body.style.backgroundImage = url;
  }

  function setText(node, text) { if (node) node.textContent = text; }

  function updateUI() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    setText(el.level, level);
    setText(el.score, score);
    setText(el.lives, lives);

    setText(el.title, t('title'));
    setText(el.startText, t('start'));
    setText(el.watchAdBtn, t('watchAd'));
    setText(el.scoreLabel, t('score'));
    setText(el.levelLabel, t('level'));
    setText(el.livesLabel, t('lives'));
    setText(el.langLabel, t('langLabel'));
    setText(el.shareBtn, t('share'));
    setText(el.mapBtn, t('map'));
    setText(el.apkBtn, t('apk'));

    document.querySelectorAll('.color-name').forEach(function (n) {
      const name = COLOR_NAMES[lang] && COLOR_NAMES[lang][n.dataset.color];
      if (name) n.textContent = name;
    });

    if (el.msg) el.msg.textContent = t(msgState.key, msgState.vars);
    updateTimerUI();
    updateShareLinks();
    updateBackground();
    if (el.cityMenu && !el.cityMenu.classList.contains('hidden')) renderMap();
  }

  function updateShareLinks() {
    const text = t('shareText') + ' ' + SITE_URL;
    if (el.whatsappShare) el.whatsappShare.href = 'https://wa.me/?text=' + encodeURIComponent(text);
    if (el.facebookShare) el.facebookShare.href = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(SITE_URL);
  }

  function setLanguage(newLang) {
    if (!TR[newLang]) return;
    lang = newLang;
    try { localStorage.setItem('lang', lang); } catch (e) { /* ignoré */ }
    updateUI();
  }

  function buildExtraUI() {
    /* bouton « Carte » */
    const mapBtn = document.createElement('button');
    mapBtn.id = 'mapBtn';
    mapBtn.type = 'button';
    el.star.insertAdjacentElement('afterend', mapBtn);
    el.mapBtn = mapBtn;

    /* fenêtre de la carte */
    const menu = document.createElement('div');
    menu.id = 'cityMenu';
    menu.className = 'city-menu hidden';
    menu.innerHTML =
      '<div class="city-panel">' +
      '<h2 class="city-title" id="cityTitle"></h2>' +
      '<div class="city-grid" id="cityGrid"></div>' +
      '<button type="button" class="city-close" id="cityClose"></button>' +
      '</div>';
    document.body.appendChild(menu);

    /* message temporaire */
    const toastEl = document.createElement('div');
    toastEl.id = 'toast';
    toastEl.className = 'toast';
    toastEl.setAttribute('role', 'status');
    document.body.appendChild(toastEl);

    el.cityMenu = menu;
    el.cityGrid = $('cityGrid');
    el.cityTitle = $('cityTitle');
    el.cityClose = $('cityClose');
    el.toast = toastEl;
  }

  function bindEvents() {
    el.star.addEventListener('click', startGame);
    if (el.watchAdBtn) el.watchAdBtn.addEventListener('click', watchAd);
    el.mapBtn.addEventListener('click', openMap);
    el.cityClose.addEventListener('click', closeMap);
    el.cityMenu.addEventListener('click', function (e) { if (e.target === el.cityMenu) closeMap(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMap(); });

    if (el.langSelect) {
      el.langSelect.value = lang;
      el.langSelect.addEventListener('change', function (e) { setLanguage(e.target.value); });
    }

    /* si le joueur quitte l'onglet / l'appli, on arrête la manche (sans perdre de vie) */
    document.addEventListener('visibilitychange', function () {
      if (document.hidden && roundActive) renderIdle();
    });

    /* partage */
    if (el.shareBtn && el.shareMenu) {
      el.shareBtn.addEventListener('click', function () { el.shareMenu.classList.toggle('hidden'); });
    }

    /* photo de profil */
    if (el.profilePic && el.profileModal) {
      el.profilePic.addEventListener('click', function () { el.profileModal.style.display = 'flex'; });
      el.profileModal.addEventListener('click', function () { el.profileModal.style.display = 'none'; });
    }
  }


  /* =======================================================
     09. DÉMARRAGE
  ======================================================= */

  function init() {
    ['msg', 'timer', 'level', 'score', 'lives', 'title', 'startText', 'watchAdBtn', 'scoreLabel',
      'levelLabel', 'livesLabel', 'langLabel', 'langSelect', 'star', 'flashGrid', 'answerBox',
      'shareBtn', 'shareMenu', 'whatsappShare', 'facebookShare', 'profilePic', 'profileModal',
      'clickSound', 'winSound', 'failSound'
    ].forEach(function (id) { el[id] = $(id); });
    el.apkBtn = document.querySelector('a[href$=".apk"] button');

    loadGame();
    buildExtraUI();
    bindEvents();
    renderIdle();
    updateUI();

    if (tampered) toast('tamper');
  }

  /* les boutons du HTML appellent pick('red') : seule fonction visible de l'extérieur */
  window.pick = pick;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  /* @@TEST_HOOK@@ */
})();
