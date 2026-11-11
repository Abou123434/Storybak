/* =========================================================
   STORYBAK — Memory Flash Pro
   script.js = NOYAU COMMUN (version 3)

   Ce fichier contient ce qui sert à TOUS les modes :
   la sauvegarde signée, le portefeuille (pièces, tickets, vies,
   trophées, thèmes), le moteur d'une manche, la pub, les langues
   et le menu « Choisis ton mode ».

   Les modes sont dans des fichiers séparés :
     solo.js     → Jouer solo
     tournoi.js  → Jouer tournoi
     defi.js     → Jouer défi (à venir)

   Pour ajouter un mode : créer son fichier, l'ajouter dans index.html
   après script.js, et appeler Storybak.register('monmode', function (api) {...}).

   SOMMAIRE
   01. Configuration
   02. Langues
   03. Sauvegarde signée + portefeuille
   04. Pub (UN SEUL point d'entrée)
   05. Interface commune
   06. Moteur de manche
   07. Modes (menu, entrer, quitter)
   08. Démarrage
========================================================= */

(function () {
  'use strict';

  /* =======================================================
     01. CONFIGURATION
  ======================================================= */

  const SAVE_KEY = 'storybak_save_v3';
  const OLD_V2_KEY = 'storybak_save_v2';
  const SIGN_SECRET = 'sb#2026!memory-flash-pro';

  const START_LIVES = 5;
  const MAX_LIVES = 20;
  const MAX_TICKETS = 99;
  const MAX_COINS = 1000000000;

  const COLORS = ['red', 'green', 'blue', 'yellow'];
  const SITE_URL = 'https://storybak.vercel.app/';

  const THEMES = ['classic', 'neon', 'crystal', 'gold'];
  const TROPHY_TIERS = ['bronze', 'silver', 'gold'];

  /* modes annoncés mais pas encore là : affichés « Bientôt » dans le menu */
  const SOON_MODES = [{ id: 'defi', icon: '⚔️', titleKey: 'modeDefi', descKey: 'modeDefiDesc' }];

  /* vitesse de la séquence (ms) */
  const FLASH_START = 500;
  const FLASH_SPEED = 900;
  const FLASH_ON = 450;


  /* =======================================================
     02. LANGUES
     Chaque mode ajoute ses textes avec api.addTranslations().
  ======================================================= */

  const TR = { fr: {}, en: {}, es: {}, de: {}, ar: {} };
  const COLOR_NAMES = {
    fr: { red: 'Rouge', green: 'Vert', blue: 'Bleu', yellow: 'Jaune' },
    en: { red: 'Red', green: 'Green', blue: 'Blue', yellow: 'Yellow' },
    es: { red: 'Rojo', green: 'Verde', blue: 'Azul', yellow: 'Amarillo' },
    de: { red: 'Rot', green: 'Grün', blue: 'Blau', yellow: 'Gelb' },
    ar: { red: 'أحمر', green: 'أخضر', blue: 'أزرق', yellow: 'أصفر' }
  };

  function addTranslations(obj) {
    Object.keys(obj).forEach(function (l) {
      if (TR[l]) Object.assign(TR[l], obj[l]);
    });
  }

  addTranslations({
    fr: {
      title: '🧠 Memory Flash Pro', timer: '⏱ Temps', observe: '👀 Observe bien !', play: '🎮 Reproduis la séquence !',
      loading: '⏳ Chargement...', adFail: '⚠️ Pub indisponible, réessaie.', langLabel: '🌍 Langue :',
      share: '📤 Partager', apk: '📥 Télécharger l’APK', shareText: 'Joue à Memory Flash Pro',
      tamper: '⚠️ Sauvegarde invalide : progression remise à zéro', close: 'Fermer',
      coins: 'Pièces', tickets: 'Tickets', trophies: 'Trophées',
      modes: '← Retour', modeTitle: 'Choisis ton mode', soon: 'Bientôt',
      leaveConfirm: 'Quitter la manche en cours ? Elle sera perdue.',
      modeDefi: 'Jouer défi', modeDefiDesc: 'Défie tes amis'
    },
    en: {
      title: '🧠 Memory Flash Pro', timer: '⏱ Time', observe: '👀 Watch carefully!', play: '🎮 Repeat the sequence!',
      loading: '⏳ Loading...', adFail: '⚠️ Ad unavailable, try again.', langLabel: '🌍 Language :',
      share: '📤 Share', apk: '📥 Download APK', shareText: 'Play Memory Flash Pro',
      tamper: '⚠️ Invalid save: progress has been reset', close: 'Close',
      coins: 'Coins', tickets: 'Tickets', trophies: 'Trophies',
      modes: '← Back', modeTitle: 'Choose your mode', soon: 'Coming soon',
      leaveConfirm: 'Leave the current round? It will be lost.',
      modeDefi: 'Challenge', modeDefiDesc: 'Challenge your friends'
    },
    es: {
      title: '🧠 Memoria Flash Pro', timer: '⏱ Tiempo', observe: '👀 ¡Observa bien!', play: '🎮 ¡Repite la secuencia!',
      loading: '⏳ Cargando...', adFail: '⚠️ Anuncio no disponible, inténtalo de nuevo.', langLabel: '🌍 Idioma :',
      share: '📤 Compartir', apk: '📥 Descargar APK', shareText: 'Juega a Memory Flash Pro',
      tamper: '⚠️ Partida no válida: progreso reiniciado', close: 'Cerrar',
      coins: 'Monedas', tickets: 'Tickets', trophies: 'Trofeos',
      modes: '← Volver', modeTitle: 'Elige tu modo', soon: 'Próximamente',
      leaveConfirm: '¿Salir de la ronda actual? Se perderá.',
      modeDefi: 'Desafío', modeDefiDesc: 'Desafía a tus amigos'
    },
    de: {
      title: '🧠 Memory Flash Pro', timer: '⏱ Zeit', observe: '👀 Gut beobachten!', play: '🎮 Wiederhole die Sequenz!',
      loading: '⏳ Lädt...', adFail: '⚠️ Werbung nicht verfügbar, versuche es erneut.', langLabel: '🌍 Sprache :',
      share: '📤 Teilen', apk: '📥 APK herunterladen', shareText: 'Spiele Memory Flash Pro',
      tamper: '⚠️ Ungültiger Spielstand: Fortschritt zurückgesetzt', close: 'Schließen',
      coins: 'Münzen', tickets: 'Tickets', trophies: 'Trophäen',
      modes: '← Zurück', modeTitle: 'Wähle deinen Modus', soon: 'Demnächst',
      leaveConfirm: 'Aktuelle Runde verlassen? Sie geht verloren.',
      modeDefi: 'Herausforderung', modeDefiDesc: 'Fordere deine Freunde heraus'
    },
    ar: {
      title: '🧠 لعبة الذاكرة', timer: '⏱ الوقت', observe: '👀 راقب جيدًا!', play: '🎮 أعد التسلسل!',
      loading: '⏳ جارٍ التحميل...', adFail: '⚠️ الإعلان غير متاح، حاول مرة أخرى.', langLabel: '🌍 اللغة :',
      share: '📤 مشاركة', apk: '📥 تحميل APK', shareText: 'العب Memory Flash Pro',
      tamper: '⚠️ حفظ غير صالح: تمت إعادة التقدم', close: 'إغلاق',
      coins: 'العملات', tickets: 'التذاكر', trophies: 'الكؤوس',
      modes: '← رجوع', modeTitle: 'اختر وضع اللعب', soon: 'قريبًا',
      leaveConfirm: 'مغادرة الجولة الحالية؟ ستفقدها.',
      modeDefi: 'تحدٍّ', modeDefiDesc: 'تحدَّ أصدقاءك'
    }
  });

  let lang = 'fr';
  try { lang = localStorage.getItem('lang') || 'fr'; } catch (e) { /* stockage indisponible */ }
  if (!TR[lang]) lang = 'fr';

  function t(key, vars) {
    let s = (TR[lang] && TR[lang][key]) || TR.fr[key] || key;
    if (vars) for (const k in vars) s = s.split('{' + k + '}').join(vars[k]);
    return s;
  }


  /* =======================================================
     03. SAUVEGARDE SIGNÉE + PORTEFEUILLE
     Tout est codé et SIGNÉ. Si quelqu'un modifie la sauvegarde dans
     le navigateur, la signature ne correspond plus : elle est refusée
     et la progression repart à zéro. (Un jeu 100 % navigateur ne peut
     jamais être inviolable : ça arrête la triche simple.)
  ======================================================= */

  function newWallet() {
    return { coins: 0, tickets: 1, lives: START_LIVES, trophies: { bronze: 0, silver: 0, gold: 0 }, themes: ['classic'], theme: 'classic' };
  }

  let wallet = newWallet();
  let stores = {};          // données de chaque mode : { solo: {...}, tournoi: {...} }
  let lastSeen = 0;         // horloge « qui ne recule jamais »
  let tampered = false;
  let batchDepth = 0;
  let dirty = false;

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
    const payload = JSON.stringify({ w: wallet, m: stores, s: lastSeen });
    return btoa(unescape(encodeURIComponent(payload))) + '.' + hash53(payload + SIGN_SECRET);
  }

  function decodeSave(raw) {
    if (typeof raw !== 'string') return null;
    const cut = raw.lastIndexOf('.');
    if (cut < 1) return null;
    let payload, obj;
    try { payload = decodeURIComponent(escape(atob(raw.slice(0, cut)))); } catch (e) { return null; }
    if (hash53(payload + SIGN_SECRET) !== raw.slice(cut + 1)) return null;
    try { obj = JSON.parse(payload); } catch (e) { return null; }
    if (!obj || typeof obj !== 'object' || !obj.w || typeof obj.m !== 'object' || obj.m === null) return null;
    return obj;
  }

  function isInt(n, min, max) { return Number.isInteger(n) && n >= min && n <= max; }

  function sanitizeWallet(w) {
    if (!w || typeof w !== 'object') return null;
    if (!isInt(w.coins, 0, MAX_COINS) || !isInt(w.tickets, 0, MAX_TICKETS) || !isInt(w.lives, 0, MAX_LIVES)) return null;
    if (!w.trophies || typeof w.trophies !== 'object') return null;
    const tr = {};
    for (const k of TROPHY_TIERS) { if (!isInt(w.trophies[k], 0, 99999)) return null; tr[k] = w.trophies[k]; }
    if (!Array.isArray(w.themes) || w.themes.length > THEMES.length) return null;
    const th = w.themes.filter(function (x, i, a) { return THEMES.indexOf(x) !== -1 && a.indexOf(x) === i; });
    if (th.length !== w.themes.length || th.indexOf('classic') === -1) return null;
    if (th.indexOf(w.theme) === -1) return null;
    return { coins: w.coins, tickets: w.tickets, lives: w.lives, trophies: tr, themes: th, theme: w.theme };
  }

  function saveGame() {
    if (batchDepth > 0) { dirty = true; return; }
    try { localStorage.setItem(SAVE_KEY, encodeSave()); } catch (e) { /* ignoré */ }
  }

  /* regroupe plusieurs changements en UNE seule écriture (ex : fin de tournoi) */
  function batch(fn) {
    batchDepth++;
    try { fn(); } finally {
      batchDepth--;
      if (batchDepth === 0 && dirty) { dirty = false; saveGame(); }
    }
  }

  /* horloge qui ne recule jamais : changer l'heure du téléphone vers le passé ne sert à rien */
  function now() {
    const n = Math.max(Date.now(), lastSeen);
    lastSeen = n;
    return n;
  }
  function today() {
    const d = new Date(now());
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  /* portefeuille : seule façon de changer pièces / tickets / vies / trophées / thèmes */
  const walletApi = {
    get: function () {
      return { coins: wallet.coins, tickets: wallet.tickets, lives: wallet.lives,
        trophies: Object.assign({}, wallet.trophies), themes: wallet.themes.slice(), theme: wallet.theme };
    },
    add: function (kind, n) {
      const max = { coins: MAX_COINS, tickets: MAX_TICKETS, lives: MAX_LIVES }[kind];
      if (max === undefined || !Number.isInteger(n)) return false;
      wallet[kind] = Math.max(0, Math.min(max, wallet[kind] + n));
      saveGame(); refreshHeader();
      return true;
    },
    spend: function (kind, n) {
      if (!['coins', 'tickets', 'lives'].includes(kind) || !Number.isInteger(n) || n < 0 || wallet[kind] < n) return false;
      wallet[kind] -= n; saveGame(); refreshHeader();
      return true;
    },
    addTrophy: function (tier) {
      if (TROPHY_TIERS.indexOf(tier) === -1) return false;
      wallet.trophies[tier]++; saveGame(); return true;
    },
    unlockTheme: function (id) {
      if (THEMES.indexOf(id) === -1) return false;
      if (wallet.themes.indexOf(id) === -1) wallet.themes.push(id);
      saveGame(); return true;
    },
    setTheme: function (id) {
      if (wallet.themes.indexOf(id) === -1) return false;
      wallet.theme = id; saveGame(); applyTheme(); return true;
    }
  };

  /* chargement : v3 → ancienne v2 → toutes premières clés */
  function loadGame(modes) {
    let raw = null;
    try { raw = localStorage.getItem(SAVE_KEY); } catch (e) { /* ignoré */ }

    function fresh() {
      wallet = newWallet(); stores = {};
      modes.forEach(function (m) { stores[m.id] = m.obj.defaults ? m.obj.defaults() : {}; });
    }

    if (raw !== null) {
      const obj = decodeSave(raw);
      const w = obj && sanitizeWallet(obj.w);
      let ok = !!w;
      const st = {};
      if (ok) {
        modes.forEach(function (m) {
          if (!ok) return;
          const saved = obj.m[m.id];
          if (saved === undefined) { st[m.id] = m.obj.defaults ? m.obj.defaults() : {}; return; }
          const clean = m.obj.sanitize ? m.obj.sanitize(saved) : saved;
          if (clean === null || clean === undefined) ok = false; else st[m.id] = clean;
        });
      }
      if (ok) {
        wallet = w; stores = st;
        lastSeen = isInt(obj.s, 0, 9e15) ? obj.s : 0;
        return;
      }
      tampered = true;
      fresh(); saveGame();
      return;
    }

    fresh();

    /* ancienne version 2 : [2, vies, niveau, niveauMax, score] */
    let migrated = false;
    try {
      const old = localStorage.getItem(OLD_V2_KEY);
      if (old !== null) {
        const cut = old.lastIndexOf('.');
        const payload = atob(old.slice(0, cut));
        if (hash53(payload + SIGN_SECRET) === old.slice(cut + 1)) {
          const a = JSON.parse(payload);
          if (Array.isArray(a) && a[0] === 2 && a.length === 5) {
            wallet.lives = Math.max(0, Math.min(MAX_LIVES, a[1] | 0));
            stores.solo = { level: Math.max(1, Math.min(1000, a[2] | 0)), maxLevel: Math.max(1, Math.min(1000, a[3] | 0)), score: Math.max(0, a[4] | 0) };
            if (stores.solo.maxLevel < stores.solo.level) stores.solo.maxLevel = stores.solo.level;
            migrated = true;
          }
        }
        localStorage.removeItem(OLD_V2_KEY);
      }
    } catch (e) { /* ignoré */ }

    /* toute première version : clés simples level / lives / score */
    if (!migrated) {
      try {
        const oldLevel = localStorage.getItem('level');
        if (oldLevel !== null) {
          const lv = Math.max(1, Math.min(1000, parseInt(oldLevel, 10) || 1));
          stores.solo = { level: lv, maxLevel: lv, score: Math.max(0, Math.min(1e9, parseInt(localStorage.getItem('score'), 10) || 0)) };
          wallet.lives = Math.max(0, Math.min(9, isNaN(parseInt(localStorage.getItem('lives'), 10)) ? START_LIVES : parseInt(localStorage.getItem('lives'), 10)));
          ['level', 'lives', 'score'].forEach(function (k) { localStorage.removeItem(k); });
        }
      } catch (e) { /* ignoré */ }
    }
    saveGame();
  }


  /* =======================================================
     04. PUB — UN SEUL POINT D'ENTRÉE
     Pour brancher la vraie pub : remplace UNIQUEMENT le contenu de
     showRewarded(). Il doit renvoyer true si la pub a été regardée en
     entier, sinon false. Tous les modes passent par là.
  ======================================================= */

  const Ads = Object.freeze({
    showRewarded: function () {
      return new Promise(function (resolve) {
        // ⬇️ SIMULATION : à remplacer par le vrai appel de pub
        setTimeout(function () { resolve(true); }, 1000);
      });
    }
  });


  /* =======================================================
     05. INTERFACE COMMUNE
  ======================================================= */

  const $ = function (id) { return document.getElementById(id); };
  const el = {};
  let msgState = { key: null, vars: null, text: null };
  let statsState = null;
  let toastTimer = null;

  function h(tag, cls, text, kids) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null && text !== '') n.textContent = text;
    if (kids) kids.forEach(function (k) { if (k) n.appendChild(k); });
    return n;
  }

  function setHidden(node, hidden) { if (node) node.classList.toggle('hidden', hidden); }
  function setText(node, text) { if (node) node.textContent = text; }

  function setMsg(key, vars) {
    msgState = { key: key, vars: vars || null, text: null };
    if (el.msg) el.msg.textContent = t(key, vars);
  }
  function setMsgText(text) {
    msgState = { key: null, vars: null, text: text };
    if (el.msg) el.msg.textContent = text;
  }

  function toast(key, vars, raw) {
    if (!el.toast) return;
    el.toast.textContent = raw ? key : t(key, vars);
    el.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.toast.classList.remove('show'); }, 2800);
  }

  function board(mode) {
    if (!el.flashGrid || !el.answerBox) return;
    el.flashGrid.style.display = mode === 'grid' ? 'grid' : 'none';
    setHidden(el.flashGrid, mode !== 'grid');
    setHidden(el.answerBox, mode !== 'answer');
  }

  /* Les 3 pastilles du haut. Chaque mode donne [[libellé, valeur], ...] */
  function stats(triple) {
    statsState = triple;
    const slots = [['levelLabel', 'level'], ['scoreLabel', 'score'], ['livesLabel', 'lives']];
    slots.forEach(function (s, i) {
      const p = triple && triple[i];
      setText(el[s[0]], p ? p[0] : '');
      setText(el[s[1]], p ? p[1] : '');
    });
  }

  function background(name) {
    const url = name ? 'url("./' + name + '")' : '';
    if (document.body.style.backgroundImage !== url) document.body.style.backgroundImage = url;
  }

  function applyTheme() {
    THEMES.forEach(function (x) { document.body.classList.remove('theme-' + x); });
    document.body.classList.add('theme-' + wallet.theme);
  }

  /* fenêtres plein écran (tournoi, carte, menu des modes) */
  const openOverlays = [];
  function overlay(id, opts) {
    opts = opts || {};
    const root = h('div', 'overlay hidden');
    root.id = id;
    const sheet = h('div', 'sheet');
    root.appendChild(sheet);
    document.body.appendChild(root);
    const api = {
      root: root, sheet: sheet,
      open: function () { root.classList.remove('hidden'); if (openOverlays.indexOf(api) === -1) openOverlays.push(api); },
      close: function () {
        root.classList.add('hidden');
        const i = openOverlays.indexOf(api); if (i !== -1) openOverlays.splice(i, 1);
        if (opts.onClose) opts.onClose();
      },
      isOpen: function () { return !root.classList.contains('hidden'); }
    };
    if (opts.closable) root.addEventListener('click', function (e) { if (e.target === root) api.close(); });
    api.closable = !!opts.closable;
    return api;
  }

  function refreshHeader() { if (menuOv && menuOv.isOpen()) renderModeMenu(); }

  function updateShareLinks() {
    const text = t('shareText') + ' ' + SITE_URL;
    if (el.whatsappShare) el.whatsappShare.href = 'https://wa.me/?text=' + encodeURIComponent(text);
    if (el.facebookShare) el.facebookShare.href = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(SITE_URL);
  }

  function updateUI() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    setText(el.title, t('title'));
    setText(el.langLabel, t('langLabel'));
    setText(el.shareBtn, t('share'));
    setText(el.apkBtn, t('apk'));
    setText(el.modesBtn, t('modes'));

    document.querySelectorAll('.color-name').forEach(function (n) {
      const name = COLOR_NAMES[lang] && COLOR_NAMES[lang][n.dataset.color];
      if (name) n.textContent = name;
    });

    if (msgState.key) el.msg.textContent = t(msgState.key, msgState.vars);
    updateTimerUI();
    updateShareLinks();

    if (current && current.obj.refresh) current.obj.refresh();
    if (menuOv && menuOv.isOpen()) renderModeMenu();
  }

  function setLanguage(newLang) {
    if (!TR[newLang]) return;
    lang = newLang;
    try { localStorage.setItem('lang', lang); } catch (e) { /* ignoré */ }
    updateUI();
  }

  function sound(name) {
    const a = { click: el.clickSound, win: el.winSound, fail: el.failSound }[name];
    if (!a) return;
    try {
      a.currentTime = 0;
      const p = a.play();
      if (p && p.catch) p.catch(function () { /* son bloqué par le navigateur : ignoré */ });
    } catch (e) { /* ignoré */ }
  }


  /* =======================================================
     06. MOTEUR DE MANCHE
     Utilisé par TOUS les modes :
       api.engine.run({ sequence, timeLimit, onAnswerStart, onPick, ...options })
     options facultatives :
       flashMs   : durée entre 2 couleurs (séquence rapide)
       reverse   : il faut répondre à l'ENVERS
       tone      : chaque couleur a un son (WebAudio)
       blind     : les couleurs sont cachées (formes seulement)
       playMsg   : clé de traduction du message pendant la réponse
       pauseAt / pauseMs : pause avant la couleur n° pauseAt (séquence double)
       onFlash(i): appelé à chaque couleur montrée
     montre la séquence, puis laisse répondre, puis renvoie
       { ok, reason, ms, correct }
     reason : 'done' | 'wrong' | 'timeout' | 'cancelled' | 'interrupted'
  ======================================================= */

  let runId = 0;
  let pending = [];
  let timerId = null;
  let active = null;
  let timeLeft = 0;
  let timerShown = false;

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

  function updateTimerUI() {
    if (el.timer && timerShown) el.timer.textContent = t('timer') + ' : ' + timeLeft + 's';
  }

  function finishRound(res) {
    if (!active || active.done) return;
    active.done = true;
    const resolve = active.resolve;
    active = null;
    runId++;
    pending.forEach(clearTimeout);
    pending = [];
    stopTimer();
    document.querySelectorAll('#flashGrid .btn.active').forEach(function (n) { n.classList.remove('active'); });
    document.body.classList.remove('blind');
    resolve(res);
  }

  function cancelRound(reason) {
    if (active) finishRound({ ok: false, reason: reason || 'cancelled', ms: 0, correct: active.player.length });
    else { runId++; pending.forEach(clearTimeout); pending = []; stopTimer(); document.body.classList.remove('blind'); }
  }

  /* un son par couleur (mode « sans les yeux ») */
  let actx = null;
  const TONES = { red: 262, green: 330, blue: 392, yellow: 523 };
  function tone(color) {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
      const o = actx.createOscillator(), g = actx.createGain(), now = actx.currentTime;
      o.type = 'sine'; o.frequency.value = TONES[color] || 330;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.35, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
      o.connect(g); g.connect(actx.destination);
      o.start(now); o.stop(now + 0.45);
    } catch (e) { /* son bloqué : ignoré */ }
  }

  function flash(color, on, withTone) {
    const node = document.querySelector('#flashGrid .btn.' + color);
    if (!node) return;
    node.classList.add('active');
    if (withTone) tone(color); else sound('click');
    later(function () { node.classList.remove('active'); }, on || FLASH_ON);
  }

  function runRound(opts) {
    cancelRound('cancelled');
    return new Promise(function (resolve) {
      const seq = opts.sequence.slice();
      active = { resolve: resolve, seq: seq, exp: opts.reverse ? seq.slice().reverse() : seq, player: [], canPlay: false, t0: 0, done: false, opts: opts };
      document.body.classList.toggle('blind', !!opts.blind);

      setMsg('observe');
      board('grid');

      /* opts.flashMs (facultatif) : durée entre deux couleurs, pour les séquences rapides */
      const step = Math.max(250, Math.min(1500, Number(opts.flashMs) || FLASH_SPEED));
      const on = Math.min(FLASH_ON, Math.round(step * 0.5));
      const pauseAt = Number.isInteger(opts.pauseAt) ? opts.pauseAt : -1;
      const pauseMs = Math.max(0, Math.min(3000, Number(opts.pauseMs) || 0));
      const at = function (i) { return FLASH_START + i * step + (pauseAt >= 0 && i >= pauseAt ? pauseMs : 0); };
      seq.forEach(function (color, i) {
        later(function () { if (opts.onFlash) opts.onFlash(i); flash(color, on, !!opts.tone); }, at(i));
      });
      later(beginAnswer, at(seq.length) + 250);
    });
  }

  function beginAnswer() {
    if (!active) return;
    board('answer');
    active.canPlay = true;
    active.t0 = performance.now();
    setMsg(active.opts.playMsg || 'play');

    timeLeft = active.opts.timeLimit || 10;
    timerShown = true;
    updateTimerUI();
    timerId = setInterval(function () {
      if (!active) return;
      timeLeft--;
      updateTimerUI();
      if (timeLeft <= 0) finishRound({ ok: false, reason: 'timeout', ms: Math.round(performance.now() - active.t0), correct: active.player.length });
    }, 1000);

    if (active.opts.onAnswerStart) active.opts.onAnswerStart();
  }

  function pick(color) {
    if (!active || !active.canPlay || COLORS.indexOf(color) === -1) return;
    if (active.opts.tone) tone(color); else sound('click');
    active.player.push(color);
    const i = active.player.length - 1;
    const ms = Math.round(performance.now() - active.t0);

    if (active.player[i] !== active.exp[i]) {
      finishRound({ ok: false, reason: 'wrong', ms: ms, correct: i });
      return;
    }
    if (active.opts.onPick) active.opts.onPick(i + 1);
    if (active.player.length === active.seq.length) finishRound({ ok: true, reason: 'done', ms: ms, correct: active.seq.length });
  }

  const engine = Object.freeze({
    run: runRound,
    cancel: cancelRound,
    busy: function () { return !!active; }
  });


  /* =======================================================
     07. MODES : menu, entrer, quitter
  ======================================================= */

  const factories = [];
  let booted = false;
  let modes = [];
  let current = null;
  let menuOv = null;

  function register(id, factory) {
    if (booted) throw new Error('Storybak : les modes doivent être enregistrés avant le démarrage');
    if (typeof id !== 'string' || typeof factory !== 'function') throw new Error('Storybak.register(id, factory)');
    factories.push({ id: id, factory: factory });
  }

  function makeApi(id) {
    return Object.freeze({
      id: id,
      t: t, addTranslations: addTranslations, lang: function () { return lang; },
      wallet: walletApi,
      store: Object.freeze({ get: function () { return stores[id]; }, save: saveGame }),
      readStore: function (other) { return stores[other] ? JSON.parse(JSON.stringify(stores[other])) : null; },
      batch: batch, now: now, today: today,
      sound: sound, toast: toast, engine: engine, ads: Ads,
      ui: Object.freeze({
        el: function (name) { return el[name] || $(name); },
        h: h, setMsg: setMsg, setMsgText: setMsgText, board: board, stats: stats, background: background,
        start: function (show) { setHidden(el.star, !show); },
        ad: function (show) { if (el.watchAdBtn) el.watchAdBtn.style.display = show ? 'block' : 'none'; },
        overlay: overlay
      }),
      menu: function () { showModeMenu(); }
    });
  }

  function renderModeMenu() {
    const w = walletApi.get();
    const sheet = menuOv.sheet;
    sheet.textContent = '';

    sheet.appendChild(h('h2', 'sheet-title', t('modeTitle')));
    sheet.appendChild(h('div', 'chips', '', [
      h('span', 'chip', '🪙 ' + w.coins), h('span', 'chip', '🎟 ' + w.tickets),
      h('span', 'chip', '🏅 ' + (w.trophies.bronze + w.trophies.silver + w.trophies.gold))
    ]));

    const list = h('div', 'mode-list');
    modes.forEach(function (m) {
      const card = h('button', 'mode-card', '', [
        h('span', 'mode-icon', m.obj.icon || '🎮'),
        h('span', 'mode-text', '', [h('b', '', t(m.obj.titleKey)), h('small', '', t(m.obj.descKey))])
      ]);
      card.type = 'button';
      card.addEventListener('click', function () { sound('click'); enterMode(m.id); });
      list.appendChild(card);
    });
    SOON_MODES.forEach(function (s) {
      if (modes.some(function (m) { return m.id === s.id; })) return;
      const card = h('button', 'mode-card soon', '', [
        h('span', 'mode-icon', s.icon),
        h('span', 'mode-text', '', [h('b', '', t(s.titleKey)), h('small', '', t(s.descKey))]),
        h('span', 'soon-badge', t('soon'))
      ]);
      card.type = 'button';
      card.disabled = true;
      list.appendChild(card);
    });
    sheet.appendChild(list);
  }

  function leaveCurrent() {
    if (!current) return true;
    const key = current.obj.confirmLeave ? current.obj.confirmLeave() : null;
    if (key && !window.confirm(t(key))) return false;
    engine.cancel('cancelled');
    if (current.obj.leave) current.obj.leave();
    current = null;
    return true;
  }

  function showModeMenu() {
    if (!leaveCurrent()) return;
    document.body.dataset.mode = 'menu';
    openOverlays.slice().forEach(function (o) { if (o !== menuOv) o.close(); });
    background('ville1.png');
    stats(null);
    setMsgText('');
    msgState = { key: null, vars: null, text: '' };
    board('grid');
    setHidden(el.modesBtn, true);
    setHidden(el.star, true);
    if (el.watchAdBtn) el.watchAdBtn.style.display = 'none';
    renderModeMenu();
    menuOv.open();
  }

  function enterMode(id) {
    const m = modes.filter(function (x) { return x.id === id; })[0];
    if (!m) return;
    if (current && !leaveCurrent()) return;
    menuOv.close();
    current = m;
    document.body.dataset.mode = id;
    setHidden(el.modesBtn, false);
    if (m.obj.enter) m.obj.enter();
    updateUI();
  }


  /* =======================================================
     08. DÉMARRAGE
  ======================================================= */

  function buildCommonUI() {
    el.modesBtn = h('button', '', '');
    el.modesBtn.id = 'modesBtn';
    el.modesBtn.type = 'button';
    el.modesBtn.addEventListener('click', function () { sound('click'); showModeMenu(); });
    el.star.insertAdjacentElement('afterend', el.modesBtn);

    el.toast = h('div', 'toast');
    el.toast.id = 'toast';
    el.toast.setAttribute('role', 'status');
    document.body.appendChild(el.toast);

    menuOv = overlay('modeMenu', { closable: false });
  }

  function bindEvents() {
    el.star.addEventListener('click', function () { if (current && current.obj.onStart) current.obj.onStart(); });
    if (el.watchAdBtn) el.watchAdBtn.addEventListener('click', function () { if (current && current.obj.onAd) current.obj.onAd(); });

    if (el.langSelect) {
      el.langSelect.value = lang;
      el.langSelect.addEventListener('change', function (e) { setLanguage(e.target.value); });
    }

    /* si le joueur quitte l'onglet / l'appli, on interrompt la manche (chaque mode décide de la suite) */
    document.addEventListener('visibilitychange', function () { if (document.hidden && active) engine.cancel('interrupted'); });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      const top = openOverlays[openOverlays.length - 1];
      if (top && top.closable) top.close();
    });

    if (el.shareBtn && el.shareMenu) el.shareBtn.addEventListener('click', function () { el.shareMenu.classList.toggle('hidden'); });

    if (el.profilePic && el.profileModal) {
      el.profilePic.addEventListener('click', function () { el.profileModal.style.display = 'flex'; });
      el.profileModal.addEventListener('click', function () { el.profileModal.style.display = 'none'; });
    }
  }

  function boot() {
    booted = true;
    ['msg', 'timer', 'title', 'watchAdBtn', 'scoreLabel', 'levelLabel', 'livesLabel', 'level', 'score', 'lives',
      'langLabel', 'langSelect', 'star', 'flashGrid', 'answerBox', 'shareBtn', 'shareMenu', 'whatsappShare',
      'facebookShare', 'profilePic', 'profileModal', 'clickSound', 'winSound', 'failSound'
    ].forEach(function (id) { el[id] = $(id); });
    el.apkBtn = document.querySelector('a[href$=".apk"] button');

    buildCommonUI();

    /* crée les modes, triés par ordre */
    factories.forEach(function (f) {
      const obj = f.factory(makeApi(f.id));
      if (obj) modes.push({ id: f.id, order: obj.order || 100, obj: obj });
    });
    modes.sort(function (a, b) { return a.order - b.order; });

    loadGame(modes);
    applyTheme();
    bindEvents();
    updateUI();
    /* un mode peut s'ouvrir tout seul (ex. lien de défi reçu) ; sinon : choix du mode */
    const auto = modes.filter(function (m) { return m.obj.autoEnter && m.obj.autoEnter(); })[0];
    if (auto) enterMode(auto.id); else showModeMenu();
    if (tampered) toast('tamper');
  }

  /* seules fonctions visibles de l'extérieur : pick (boutons du HTML) et register (nouveaux modes) */
  window.pick = pick;
  Object.defineProperty(window, 'Storybak', { value: Object.freeze({ register: register }), writable: false, configurable: false });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else setTimeout(boot, 0);

  /* @@TEST_HOOK@@ */
})();
