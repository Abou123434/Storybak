/* =========================================================
   STORYBAK — arcade.js
   OUTIL COMMUN des modes « jusqu'à la faute » :
   inverse.js, double.js, sansyeux.js, survie.js.

   Le principe : la séquence s'allonge d'une couleur à chaque réussite.
   Chaque faute coûte une vie du mode (pas celles du solo). Quand il n'y a
   plus de vie, la partie s'arrête : le meilleur score est gardé et le
   joueur gagne quelques pièces (1 pièce toutes les 3 manches réussies,
   40 au maximum).

   Chaque mode donne seulement ses RÈGLES (cfg) :
     id, icon, order, titleKey, descKey, tr (traductions du mode)
     lives          : nombre de vies
     lenFor(n)      : longueur de la séquence après n réussites
     tfac           : secondes accordées par couleur
     roundOpts(seq, n, api) : options du moteur (reverse, tone, blind…)
     bg             : image de fond

   Ce fichier doit être chargé AVANT les fichiers de modes.
========================================================= */

(function () {
  'use strict';

  const COLORS = ['red', 'green', 'blue', 'yellow'];
  const MAX_COINS = 40;

  const COMMON = {
    fr: { arScore: 'Score', arBest: 'Record', arLives: 'Vies', arReady: 'Appuie sur Commencer', arOk: '✅ Bravo !',
      arWrong: '❌ Raté ! Il te reste {n} vie(s)', arOver: '🏁 Fin : {n} manche(s) réussie(s)', arNewBest: '🏆 Nouveau record : {n} !', arAd: '🎥 Regarder une pub (+1 vie)', arAdLoad: 'Chargement de la pub…', arAdFail: 'Pub non terminée, réessaie', arAdOk: '✅ +1 vie, on continue !', arCoins: '+{n} 🪙' },
    en: { arScore: 'Score', arBest: 'Best', arLives: 'Lives', arReady: 'Press Start', arOk: '✅ Well done!',
      arWrong: '❌ Missed! {n} life/lives left', arOver: '🏁 Over: {n} round(s) cleared', arNewBest: '🏆 New record: {n}!', arAd: '🎥 Watch an ad (+1 life)', arAdLoad: 'Loading ad…', arAdFail: 'Ad not finished, try again', arAdOk: '✅ +1 life, keep going!', arCoins: '+{n} 🪙' },
    es: { arScore: 'Puntos', arBest: 'Récord', arLives: 'Vidas', arReady: 'Pulsa Empezar', arOk: '✅ ¡Bien!',
      arWrong: '❌ ¡Fallaste! Te quedan {n} vida(s)', arOver: '🏁 Fin: {n} manga(s) superada(s)', arNewBest: '🏆 ¡Nuevo récord: {n}!', arAd: '🎥 Ver anuncio (+1 vida)', arAdLoad: 'Cargando anuncio…', arAdFail: 'Anuncio no terminado, reintenta', arAdOk: '✅ ¡+1 vida, sigue!', arCoins: '+{n} 🪙' },
    de: { arScore: 'Punkte', arBest: 'Rekord', arLives: 'Leben', arReady: 'Drücke Start', arOk: '✅ Gut gemacht!',
      arWrong: '❌ Verfehlt! Noch {n} Leben', arOver: '🏁 Ende: {n} Runde(n) geschafft', arNewBest: '🏆 Neuer Rekord: {n}!', arAd: '🎥 Werbung ansehen (+1 Leben)', arAdLoad: 'Werbung lädt…', arAdFail: 'Werbung nicht beendet, nochmal', arAdOk: '✅ +1 Leben, weiter!', arCoins: '+{n} 🪙' },
    ar: { arScore: 'النقاط', arBest: 'الرقم القياسي', arLives: 'الأرواح', arReady: 'اضغط ابدأ', arOk: '✅ أحسنت!',
      arWrong: '❌ أخطأت! بقي {n} من الأرواح', arOver: '🏁 النهاية: {n} جولة ناجحة', arNewBest: '🏆 رقم قياسي جديد: {n}!', arAd: '🎥 شاهد إعلانًا (+1 روح)', arAdLoad: 'جارٍ تحميل الإعلان…', arAdFail: 'لم يكتمل الإعلان، حاول مجددًا', arAdOk: '✅ +1 روح، أكمل!', arCoins: '+{n} 🪙' }
  };

  function isInt(n, a, b) { return Number.isInteger(n) && n >= a && n <= b; }

  window.StorybakArcade = function (api, cfg) {
    const t = api.t, ui = api.ui;
    api.addTranslations(COMMON);
    api.addTranslations(cfg.tr);

    let token = 0;
    let n = 0;            // manches réussies pendant la partie
    let lives = 0;
    let active = false;   // une partie est en cours
    let paid = 0;         // pièces déjà versées pendant cette partie
    let counted = false;  // la partie est déjà comptée dans les stats
    let adUsed = false;   // une seule pub « continuer » par partie
    let adBusy = false;

    const S = function () { return api.store.get(); };
    const later = function (fn, ms) { const my = token; setTimeout(function () { if (my === token) fn(); }, ms); };

    function randomSeq(len) {
      const seq = [];
      for (let i = 0; i < len; i++) seq.push(COLORS[Math.floor(Math.random() * 4)]);
      return seq;
    }

    function renderStats() {
      ui.stats([[t('arScore'), String(n)], [t('arBest'), String(S().best)], [t('arLives'), active || lives > 0 ? '♥ ' + lives : '–']]);
    }

    function idle(msgKey, vars) {
      token++;
      api.engine.cancel('cancelled');
      active = false;
      ui.background(cfg.bg || 'ville1.png');
      ui.board('grid');
      ui.setMsg(msgKey || 'arReady', vars);
      ui.start(true);
      ui.ad(false);
      renderStats();
    }

    function begin() {
      if (active) return;
      n = 0; lives = cfg.lives; active = true; paid = 0; counted = false; adUsed = false;
      ui.start(false); ui.ad(false);
      nextRound();
    }

    async function nextRound() {
      token++;
      const my = token;
      const len = Math.min(cfg.maxLen || 14, cfg.lenFor(n));
      const seq = randomSeq(len);
      renderStats();
      const extra = cfg.roundOpts ? cfg.roundOpts(seq, n, api) : {};
      const opts = Object.assign({ sequence: seq, timeLimit: Math.ceil(2 + len * (cfg.tfac || 1.4)) }, extra);

      const res = await api.engine.run(opts);
      if (my !== token) return;
      if (res.reason === 'cancelled') return;
      if (res.reason === 'interrupted') { idle(); return; }

      if (res.ok) {
        n++;
        api.sound('win');
        ui.setMsg('arOk');
        renderStats();
        later(nextRound, 900);
      } else {
        lives--;
        api.sound('fail');
        renderStats();
        if (lives <= 0) { gameOver(); return; }
        ui.setMsg('arWrong', { n: lives });
        later(nextRound, 1500);
      }
    }

    function gameOver() {
      const s = S();
      const score = n;
      const coins = Math.min(MAX_COINS, Math.floor(score / 3)) - paid;
      const isBest = score > s.best;
      api.batch(function () {
        if (isBest) s.best = score;
        if (!counted) { s.runs++; counted = true; }
        if (coins > 0) { api.wallet.add('coins', coins); paid += coins; }
        api.store.save();
      });
      active = false;
      lives = 0;
      idle('arOver', { n: score });
      if (!adUsed && score > 0) {
        const b = ui.el('watchAdBtn');
        if (b) { b.textContent = t('arAd'); b.disabled = false; }
        ui.ad(true);
      }
      if (isBest && score > 0) api.toast('arNewBest', { n: score });
      else if (coins > 0) api.toast('arCoins', { n: coins });
    }

    /* pub récompensée : +1 vie, la partie continue (une seule fois) */
    async function watchAd() {
      if (adBusy || active || adUsed) return;
      adBusy = true;
      const b = ui.el('watchAdBtn');
      if (b) b.disabled = true;
      ui.setMsg('arAdLoad');
      let ok = false;
      try { ok = await api.ads.showRewarded(); } catch (e) { ok = false; }
      adBusy = false;
      if (b) b.disabled = false;
      if (!ok) { ui.setMsg('arAdFail'); return; }
      adUsed = true;
      ui.ad(false);
      active = true; lives = 1;
      ui.start(false);
      ui.board('grid');
      ui.setMsg('arAdOk');
      renderStats();
      later(nextRound, 900);
    }

    return {
      icon: cfg.icon, order: cfg.order, titleKey: cfg.titleKey, descKey: cfg.descKey,
      defaults: function () { return { best: 0, runs: 0 }; },
      sanitize: function (d) {
        if (!d || typeof d !== 'object' || !isInt(d.best, 0, 9999) || !isInt(d.runs, 0, 1e6)) return null;
        return { best: d.best, runs: d.runs };
      },
      enter: function () { n = 0; lives = 0; idle(); },
      leave: function () { token++; api.engine.cancel('cancelled'); active = false; },
      refresh: function () { if (!active) { renderStats(); } },
      onStart: begin,
      onAd: watchAd,
      confirmLeave: function () { return (active && api.engine.busy()) ? 'leaveConfirm' : null; }
    };
  };
})();
