/* =========================================================
   STORYBAK — solo.js
   MODE « JOUER SOLO » : 1000 niveaux, 9 villes, vies, pub.

   Ce mode utilise le noyau (script.js) : moteur de manche,
   sauvegarde signée, portefeuille, pub.

   SOMMAIRE
   01. Configuration et textes
   02. Données et difficulté
   03. Déroulement
   04. Carte des villes
   05. Interface du mode
========================================================= */

Storybak.register('solo', function (api) {
  'use strict';

  const t = api.t;
  const ui = api.ui;
  const engine = api.engine;


  /* =======================================================
     01. CONFIGURATION ET TEXTES
  ======================================================= */

  const MAX_LEVEL = 1000;
  const REFILL_LIVES = 5;   // vies données par le bouton « Rejouer » quand il n'en reste plus (gratuit, sans pub)
  const COLORS = ['red', 'green', 'blue', 'yellow'];

  /* 9 villes : une ville change tous les 20 niveaux (la 9e dès le niveau 161) */
  const CITIES = [
    'ville1.png', 'ville2.png', 'ville3.png', 'ville4.png', 'ville5.png',
    'ville6.png', 'ville7.png', 'ville8.png', 'ville9.png'
  ];
  const CITY_SIZE = 20;
  const LAST_CITY = CITIES.length - 1;

  api.addTranslations({
    fr: {
      modeSolo: 'Jouer solo', modeSoloDesc: '1000 niveaux, 9 villes',
      start: '⭐ Commencer', refill: '🔄 Rejouer (+5 vies)', score: 'Score', level: 'Niveau', lives: 'Vies',
      ready: 'Appuie sur Commencer', win: '🔥 Gagné !', error: '❌ Erreur ! Vie restante : {n}',
      gameover: '🚫 Plus de vies !',
      finished: '🏆 Bravo ! Tu as terminé les 1000 niveaux !',
      map: '🗺 Carte', mapTitle: 'Choisis une ville', city: 'Ville',
      range: 'Niveaux {a}–{b}', needLevel: '🔒 Atteins le niveau {n}',
      unlocked: '🏙 Nouvelle ville ! +1 🎟 +25 🪙'
    },
    en: {
      modeSolo: 'Play solo', modeSoloDesc: '1000 levels, 9 cities',
      start: '⭐ Start', refill: '🔄 Play again (+5 lives)', score: 'Score', level: 'Level', lives: 'Lives',
      ready: 'Press Start', win: '🔥 You win!', error: '❌ Wrong! Lives left: {n}',
      gameover: '🚫 No lives left!',
      finished: '🏆 Bravo! You finished all 1000 levels!',
      map: '🗺 Map', mapTitle: 'Choose a city', city: 'City',
      range: 'Levels {a}–{b}', needLevel: '🔒 Reach level {n}',
      unlocked: '🏙 New city! +1 🎟 +25 🪙'
    },
    es: {
      modeSolo: 'Jugar solo', modeSoloDesc: '1000 niveles, 9 ciudades',
      start: '⭐ Empezar', refill: '🔄 Jugar otra vez (+5 vidas)', score: 'Puntuación', level: 'Nivel', lives: 'Vidas',
      ready: 'Pulsa Empezar', win: '🔥 ¡Ganaste!', error: '❌ ¡Error! Vidas restantes: {n}',
      gameover: '🚫 ¡Sin vidas!',
      finished: '🏆 ¡Bravo! ¡Has completado los 1000 niveles!',
      map: '🗺 Mapa', mapTitle: 'Elige una ciudad', city: 'Ciudad',
      range: 'Niveles {a}–{b}', needLevel: '🔒 Llega al nivel {n}',
      unlocked: '🏙 ¡Nueva ciudad! +1 🎟 +25 🪙'
    },
    de: {
      modeSolo: 'Solo spielen', modeSoloDesc: '1000 Level, 9 Städte',
      start: '⭐ Starten', refill: '🔄 Nochmal spielen (+5 Leben)', score: 'Punkte', level: 'Level', lives: 'Leben',
      ready: 'Drücke Starten', win: '🔥 Gewonnen!', error: '❌ Fehler! Leben übrig: {n}',
      gameover: '🚫 Keine Leben mehr!',
      finished: '🏆 Bravo! Alle 1000 Level geschafft!',
      map: '🗺 Karte', mapTitle: 'Wähle eine Stadt', city: 'Stadt',
      range: 'Level {a}–{b}', needLevel: '🔒 Erreiche Level {n}',
      unlocked: '🏙 Neue Stadt! +1 🎟 +25 🪙'
    },
    ar: {
      modeSolo: 'لعب فردي', modeSoloDesc: '1000 مستوى، 9 مدن',
      start: '⭐ ابدأ', refill: '🔄 العب مجددًا (+5 أرواح)', score: 'النقاط', level: 'المستوى', lives: 'الأرواح',
      ready: 'اضغط على ابدأ', win: '🔥 فزت!', error: '❌ خطأ! الأرواح المتبقية: {n}',
      gameover: '🚫 انتهت الأرواح!',
      finished: '🏆 أحسنت! أنهيت المستويات الـ1000!',
      map: '🗺 الخريطة', mapTitle: 'اختر مدينة', city: 'مدينة',
      range: 'المستويات {a}–{b}', needLevel: '🔒 يلزم الوصول إلى المستوى {n}',
      unlocked: '🏙 مدينة جديدة! +1 🎟 +25 🪙'
    }
  });


  /* =======================================================
     02. DONNÉES ET DIFFICULTÉ
  ======================================================= */

  function defaults() { return { level: 1, maxLevel: 1, score: 0 }; }

  /* vérifie la sauvegarde du mode ; renvoie null si elle a été modifiée */
  function sanitize(d) {
    if (!d || typeof d !== 'object') return null;
    const ok = Number.isInteger(d.level) && Number.isInteger(d.maxLevel) && Number.isInteger(d.score) &&
      d.level >= 1 && d.level <= MAX_LEVEL && d.maxLevel >= d.level && d.maxLevel <= MAX_LEVEL &&
      d.score >= 0 && d.score <= 1e9;
    return ok ? { level: d.level, maxLevel: d.maxLevel, score: d.score } : null;
  }

  const S = function () { return api.store.get(); };

  function lengthFor(level) {
    if (level <= 10) return 3;
    if (level <= 30) return 4;
    if (level <= 100) return 5;
    if (level <= 200) return 6;
    if (level <= 400) return 7;
    if (level <= 700) return 8;
    return 10;
  }

  function timeFor(level) {
    if (level <= 10) return 5;
    if (level <= 30) return 7;
    if (level <= 100) return 9;
    if (level <= 200) return 10;
    if (level <= 400) return 15;
    if (level <= 700) return 20;
    return 30;
  }

  function cityOf(level) { return Math.min(LAST_CITY, Math.floor((level - 1) / CITY_SIZE)); }
  function cityStart(k) { return k * CITY_SIZE + 1; }
  function cityEnd(k) { return k === LAST_CITY ? MAX_LEVEL : (k + 1) * CITY_SIZE; }

  function makeSequence(level) {
    const pool = level <= 10 ? COLORS.slice(0, 3) : COLORS;
    const seq = [];
    for (let i = 0; i < lengthFor(level); i++) seq.push(pool[Math.floor(Math.random() * pool.length)]);
    return seq;
  }


  /* =======================================================
     03. DÉROULEMENT
  ======================================================= */

  let roundActive = false;
  let token = 0;          // invalide les anciennes manches
  let gen = 0;            // invalide les anciens délais
  let mapBtn = null;
  let mapOv = null;

  function later(fn, ms) {
    const g = gen;
    setTimeout(function () { if (g === gen) fn(); }, ms);
  }

  function lives() { return api.wallet.get().lives; }

  function renderStats() {
    ui.stats([[t('level'), S().level], [t('score'), S().score], [t('lives'), lives()]]);
  }

  /* écran « prêt » : Commencer visible, ou pub si plus de vies */
  function renderIdle() {
    token++; gen++;
    engine.cancel('cancelled');
    roundActive = false;
    ui.background(CITIES[cityOf(S().level)]);
    renderStats();

    if (lives() <= 0) {
      ui.board('none');
      ui.setMsg('gameover');
      ui.start(false);
      ui.ad(true);
    } else {
      ui.board('grid');
      ui.setMsg('ready');
      ui.start(true);
      ui.ad(false);
    }
  }

  function startGame() {
    if (roundActive) return;
    if (lives() <= 0) { renderIdle(); return; }
    nextRound();
  }

  async function nextRound() {
    token++; gen++;
    const my = token;
    roundActive = true;
    ui.start(false);            // le bouton Commencer disparaît
    ui.ad(false);

    const res = await engine.run({ sequence: makeSequence(S().level), timeLimit: timeFor(S().level) });
    if (my !== token) return;                       // manche annulée entre-temps
    if (res.reason === 'cancelled') return;
    if (res.reason === 'interrupted') { renderIdle(); return; }   // onglet quitté : pas de vie perdue
    if (res.ok) winRound(); else wrongAnswer();
  }

  function winRound() {
    api.sound('win');
    const s = S();
    const isNew = s.level >= s.maxLevel;      // le score ne monte que sur un niveau NOUVEAU
    let finished = false, newCity = false;

    api.batch(function () {
      if (isNew) s.score += s.level * 10;
      api.wallet.add('coins', 1 + Math.floor(s.level / 20));

      if (s.level >= MAX_LEVEL) {
        finished = true;
      } else {
        const before = s.maxLevel;
        s.level++;
        if (s.level > s.maxLevel) s.maxLevel = s.level;
        if (s.level > before && cityStart(cityOf(s.level)) === s.level) {
          api.wallet.add('tickets', 1);     // nouvelle ville : un ticket de tournoi offert
          api.wallet.add('coins', 25);
          newCity = true;
        }
      }
      api.store.save();
    });

    if (newCity) api.toast('unlocked');
    renderStats();
    ui.background(CITIES[cityOf(s.level)]);

    if (finished) {
      roundActive = false;
      ui.board('none');
      ui.setMsg('finished');
      ui.start(true);
      return;
    }
    ui.setMsg('win');
    later(nextRound, 1200);
  }

  function wrongAnswer() {
    api.sound('fail');
    api.wallet.add('lives', -1);
    renderStats();

    if (lives() > 0) {
      ui.setMsg('error', { n: lives() });
      later(nextRound, 1500);
    } else {
      roundActive = false;
      ui.board('none');
      ui.setMsg('gameover');
      ui.start(false);
      ui.ad(true);
    }
  }

  /* plus de vies : « Rejouer » redonne des vies gratuitement (aucune pub récompensée) */
  function refill() {
    if (roundActive || lives() > 0) return;
    api.wallet.add('lives', REFILL_LIVES);
    api.sound('click');
    renderIdle();                // Commencer revient
  }


  /* =======================================================
     04. CARTE DES VILLES
     Une ville est débloquée quand on a ATTEINT son premier niveau.
  ======================================================= */

  function isUnlocked(k) { return S().maxLevel >= cityStart(k); }

  function levelFor(k) {
    const a = cityStart(k), b = cityEnd(k);
    return (S().maxLevel >= a && S().maxLevel <= b) ? S().maxLevel : a;   // ville en cours : on reprend où on en est
  }

  function openMap() {
    renderIdle();                 // arrête la manche sans enlever de vie
    renderMap();
    mapOv.open();
  }

  function renderMap() {
    const sheet = mapOv.sheet;
    sheet.textContent = '';
    sheet.appendChild(ui.h('h2', 'sheet-title', t('mapTitle')));

    const grid = ui.h('div', 'city-grid');
    for (let k = 0; k <= LAST_CITY; k++) {
      const open = isUnlocked(k);
      const card = ui.h('button', 'city-card' + (open ? '' : ' locked') + (cityOf(S().level) === k ? ' current' : ''), '', [
        ui.h('span', 'city-name', t('city') + ' ' + (k + 1)),
        ui.h('span', 'city-req', open ? t('range', { a: cityStart(k), b: cityEnd(k) }) : t('needLevel', { n: cityStart(k) })),
        open ? null : ui.h('span', 'lock-badge', '🔒')
      ]);
      card.type = 'button';
      card.style.setProperty('--img', 'url("' + CITIES[k] + '")');
      card.addEventListener('click', function () { chooseCity(k); });
      grid.appendChild(card);
    }
    sheet.appendChild(grid);

    const close = ui.h('button', 'sheet-close', t('close'));
    close.type = 'button';
    close.addEventListener('click', function () { mapOv.close(); });
    sheet.appendChild(close);
  }

  function chooseCity(k) {
    if (!isUnlocked(k)) {                      // verrouillée : message, rien ne change
      api.sound('fail');
      api.toast('needLevel', { n: cityStart(k) });
      return;
    }
    api.sound('click');
    S().level = levelFor(k);
    api.store.save();
    mapOv.close();
    renderIdle();
  }


  /* =======================================================
     05. INTERFACE DU MODE
  ======================================================= */

  function ensureUI() {
    if (mapBtn) return;
    mapBtn = ui.h('button', '', '');
    mapBtn.id = 'mapBtn';
    mapBtn.type = 'button';
    mapBtn.addEventListener('click', openMap);
    ui.el('star').insertAdjacentElement('afterend', mapBtn);
    mapOv = ui.overlay('cityMenu', { closable: true });
  }

  function texts() {
    ui.el('startText').textContent = t('start');
    ui.el('refillBtn').textContent = t('refill');
    mapBtn.textContent = t('map');
  }

  return {
    icon: '🎮', order: 10, titleKey: 'modeSolo', descKey: 'modeSoloDesc',
    defaults: defaults, sanitize: sanitize,

    enter: function () {
      ensureUI();
      mapBtn.classList.remove('hidden');
      texts();
      renderIdle();
    },

    leave: function () {
      token++; gen++;
      engine.cancel('cancelled');
      roundActive = false;
      if (mapOv) mapOv.close();
      if (mapBtn) mapBtn.classList.add('hidden');
      ui.start(false);
      ui.ad(false);
    },

    refresh: function () {
      if (!mapBtn) return;
      texts();
      renderStats();
      if (mapOv && mapOv.isOpen()) renderMap();
    },

    onStart: startGame,
    onRefill: refill
  };
});
