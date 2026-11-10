/* =========================================================
   STORYBAK — entrainement.js
   MODE « ENTRAÎNEMENT » : pour apprendre sans pression.
   - Pas de vie perdue, pas de récompense, pas de limite de temps courte.
   - Tu règles la longueur (2 à 12), la vitesse (lent / normal / rapide),
     et tu peux jouer à l'envers ou avec des sons.
   - Les séquences s'enchaînent ; quand tu te trompes, les réglages
     reviennent pour que tu changes si tu veux.
   - Le jeu retient ta meilleure série.
========================================================= */

Storybak.register('entrainement', function (api) {
  'use strict';

  const t = api.t, ui = api.ui, h = ui.h, engine = api.engine;

  api.addTranslations({
    fr: { modeTrain: 'Entraînement', modeTrainDesc: 'Sans vie ni récompense, pour progresser',
      trTitle: '🏋️ Entraînement', trLength: 'Longueur', trSpeed: 'Vitesse', trSlow: 'Lent', trNormal: 'Normal', trFast: 'Rapide',
      trReverse: '🔄 À l’envers', trSound: '🎧 Avec sons', trGo: '▶ Commencer', trStreak: 'Série', trBest: 'Record', trLen: 'Longueur',
      trOk: '✅ Bien joué !', trKo: '❌ Raté, essaie encore', trOn: 'Oui', trOff: 'Non', trReady: 'Règle puis appuie sur Commencer', trPlayRev: '🔄 À l’envers !' },
    en: { modeTrain: 'Practice', modeTrainDesc: 'No lives, no rewards, just improve',
      trTitle: '🏋️ Practice', trLength: 'Length', trSpeed: 'Speed', trSlow: 'Slow', trNormal: 'Normal', trFast: 'Fast',
      trReverse: '🔄 Backwards', trSound: '🎧 With sounds', trGo: '▶ Start', trStreak: 'Streak', trBest: 'Best', trLen: 'Length',
      trOk: '✅ Well played!', trKo: '❌ Missed, try again', trOn: 'Yes', trOff: 'No', trReady: 'Set up, then press Start', trPlayRev: '🔄 Backwards!' },
    es: { modeTrain: 'Entrenamiento', modeTrainDesc: 'Sin vidas ni premios, para mejorar',
      trTitle: '🏋️ Entrenamiento', trLength: 'Longitud', trSpeed: 'Velocidad', trSlow: 'Lento', trNormal: 'Normal', trFast: 'Rápido',
      trReverse: '🔄 Al revés', trSound: '🎧 Con sonidos', trGo: '▶ Empezar', trStreak: 'Racha', trBest: 'Récord', trLen: 'Longitud',
      trOk: '✅ ¡Bien jugado!', trKo: '❌ Fallaste, inténtalo otra vez', trOn: 'Sí', trOff: 'No', trReady: 'Ajusta y pulsa Empezar', trPlayRev: '🔄 ¡Al revés!' },
    de: { modeTrain: 'Training', modeTrainDesc: 'Ohne Leben und Belohnung, zum Üben',
      trTitle: '🏋️ Training', trLength: 'Länge', trSpeed: 'Tempo', trSlow: 'Langsam', trNormal: 'Normal', trFast: 'Schnell',
      trReverse: '🔄 Rückwärts', trSound: '🎧 Mit Tönen', trGo: '▶ Start', trStreak: 'Serie', trBest: 'Rekord', trLen: 'Länge',
      trOk: '✅ Gut gespielt!', trKo: '❌ Verfehlt, versuch es nochmal', trOn: 'Ja', trOff: 'Nein', trReady: 'Einstellen, dann Start drücken', trPlayRev: '🔄 Rückwärts!' },
    ar: { modeTrain: 'تدريب', modeTrainDesc: 'بلا أرواح ولا مكافآت، لتتحسن',
      trTitle: '🏋️ تدريب', trLength: 'الطول', trSpeed: 'السرعة', trSlow: 'بطيء', trNormal: 'عادي', trFast: 'سريع',
      trReverse: '🔄 بالعكس', trSound: '🎧 مع أصوات', trGo: '▶ ابدأ', trStreak: 'السلسلة', trBest: 'الأفضل', trLen: 'الطول',
      trOk: '✅ أحسنت!', trKo: '❌ أخطأت، حاول مجددًا', trOn: 'نعم', trOff: 'لا', trReady: 'اضبط ثم اضغط ابدأ', trPlayRev: '🔄 بالعكس!' }
  });

  const COLORS = ['red', 'green', 'blue', 'yellow'];
  const SPEEDS = [1300, 900, 600];            // ms entre 2 couleurs : lent, normal, rapide
  const SPEED_KEYS = ['trSlow', 'trNormal', 'trFast'];

  /* réglages (gardés seulement pendant la session) */
  let cfg = { len: 3, speed: 1, reverse: false, sound: false };
  let ov = null;
  let token = 0;
  let running = false;
  let streak = 0;

  const S = function () { return api.store.get(); };
  const later = function (fn, ms) { const my = token; setTimeout(function () { if (my === token) fn(); }, ms); };

  function btn(label, cls, fn) {
    const b = h('button', cls, label);
    b.type = 'button';
    b.addEventListener('click', fn);
    return b;
  }

  function renderStats() {
    ui.stats([[t('trStreak'), String(streak)], [t('trBest'), String(S().best)], [t('trLen'), String(cfg.len)]]);
  }

  function renderSheet() {
    const sheet = ov.sheet;
    sheet.textContent = '';
    sheet.appendChild(h('h2', 'sheet-title', t('trTitle')));

    const row = function (label, kids) { return h('div', 'diff-row', '', [h('b', '', label)].concat(kids)); };

    sheet.appendChild(row(t('trLength'), [
      btn('−', 'btn-soft', function () { cfg.len = Math.max(2, cfg.len - 1); renderSheet(); renderStats(); }),
      h('b', 'chip', String(cfg.len)),
      btn('+', 'btn-soft', function () { cfg.len = Math.min(12, cfg.len + 1); renderSheet(); renderStats(); })
    ]));
    sheet.appendChild(row(t('trSpeed'), SPEED_KEYS.map(function (k, i) {
      return btn(t(k), cfg.speed === i ? 'btn-ok' : 'btn-soft', function () { cfg.speed = i; renderSheet(); });
    })));
    sheet.appendChild(row(t('trReverse'), [
      btn(cfg.reverse ? t('trOn') : t('trOff'), cfg.reverse ? 'btn-ok' : 'btn-soft', function () { cfg.reverse = !cfg.reverse; renderSheet(); })
    ]));
    sheet.appendChild(row(t('trSound'), [
      btn(cfg.sound ? t('trOn') : t('trOff'), cfg.sound ? 'btn-ok' : 'btn-soft', function () { cfg.sound = !cfg.sound; renderSheet(); })
    ]));
    sheet.appendChild(h('div', 'sheet-foot', '', [btn(t('trGo'), 'btn-main', startTraining)]));
  }

  function openSettings() {
    token++;
    running = false;
    engine.cancel('cancelled');
    ui.board('grid');
    ui.setMsg('trReady');
    renderStats();
    renderSheet();
    ov.open();
  }

  function startTraining() {
    ov.close();
    running = true;
    streak = 0;
    ui.start(false); ui.ad(false);
    nextRound();
  }

  async function nextRound() {
    token++;
    const my = token;
    renderStats();
    const seq = [];
    for (let i = 0; i < cfg.len; i++) seq.push(COLORS[Math.floor(Math.random() * 4)]);
    const res = await engine.run({
      sequence: seq, timeLimit: 6 + cfg.len * 2,
      flashMs: SPEEDS[cfg.speed], reverse: cfg.reverse, tone: cfg.sound,
      playMsg: cfg.reverse ? 'trPlayRev' : undefined
    });
    if (my !== token) return;
    if (res.reason === 'cancelled') return;
    if (res.reason === 'interrupted') { openSettings(); return; }

    if (res.ok) {
      streak++;
      const s = S();
      if (streak > s.best) { api.batch(function () { s.best = streak; api.store.save(); }); }
      api.sound('win');
      ui.setMsg('trOk');
      renderStats();
      later(nextRound, 900);
    } else {
      api.sound('fail');
      ui.setMsg('trKo');
      later(openSettings, 1300);
    }
  }

  function isInt(n, a, b) { return Number.isInteger(n) && n >= a && n <= b; }

  return {
    icon: '🏋️', order: 35, titleKey: 'modeTrain', descKey: 'modeTrainDesc',
    defaults: function () { return { best: 0 }; },
    sanitize: function (d) { return d && typeof d === 'object' && isInt(d.best, 0, 9999) ? { best: d.best } : null; },

    enter: function () {
      if (!ov) ov = ui.overlay('trainSheet', { closable: false });
      ui.start(false); ui.ad(false);
      ui.background('ville9.png');
      streak = 0;
      openSettings();
    },
    leave: function () { token++; running = false; engine.cancel('cancelled'); if (ov) ov.close(); },
    confirmLeave: function () { return null; },        // l'entraînement ne coûte rien : on peut partir librement
    refresh: function () { if (ov && ov.isOpen()) renderSheet(); renderStats(); }
  };
});
