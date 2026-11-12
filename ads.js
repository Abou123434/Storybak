/* =========================================================
   ads.js — publicités GameMonetize (un seul point d'entrée)

   Ce que le SDK GameMonetize HTML5 permet réellement (doc officielle) :
     • sdk.showBanner()  → UNE pub vidéo plein écran (interstitielle)
     • événements SDK_READY, SDK_GAME_PAUSE, SDK_GAME_START (+ SDK_ERROR)
   Il n'y a PAS de pub récompensée, ni de bannière fixe haut/bas.
   Rien n'est donc simulé ici : si le SDK est absent ou refuse la pub,
   le jeu continue normalement sans rien donner ni rien bloquer.

   Règles :
     • une pub plein écran toutes les ROUNDS_PER_AD manches terminées
       (gagnées, ratées ou temps écoulé ; jamais les manches abandonnées)
     • une pub à l'arrivée dans le jeu, dès que le menu des modes est affiché
     • une pub toutes les TIME_PER_AD (10 min) : elle attend que le joueur ait
       fini son action, puis part avant la manche suivante ou au retour au menu
     • jamais pendant une séquence : la pub est demandée juste avant le
       début de la manche suivante
     • compteur séparé pour chaque mode ; aucune pub dans NO_ADS_MODES
========================================================= */

window.StorybakAds = (function () {
  'use strict';

  const ROUNDS_PER_AD = 3;
  const TIME_PER_AD = 10 * 60 * 1000;
  const START_TIMEOUT = 15000;     // le SDK annule lui-même sa demande après ~12 s
  const END_TIMEOUT = 90000;       // sécurité : on ne reste jamais bloqué dans une pub
  const RETRY_MS = 45000;          // si le SDK ne diffuse rien, on réessaie au plus toutes les 45 s
  const NO_ADS_MODES = ['entrainement'];

  const counters = Object.create(null);
  let hooks = { pause: function () {}, resume: function () {} };
  let busy = false;      // une de NOS demandes est en cours
  let paused = false;    // le SDK a mis le jeu en pause (pub à l'écran)
  let pending = null;    // { onPause, onEnd, timer }
  let lastAdAt = Date.now();   // dernier moment où une pub a été demandée
  let entryPending = true;     // la pub d'arrivée n'a pas encore été demandée
  let retryAt = 0;             // pas de nouvelle demande avant ce moment (après un refus du SDK)

  /* ----- journal de diagnostic : ouvre le jeu avec ?adsdebug=1 pour l'afficher ----- */
  let debugOn = false;
  try { debugOn = /[?&]adsdebug=1/.test(location.search) || localStorage.getItem('adsdebug') === '1'; } catch (e) { /* ignoré */ }
  let box = null;
  const lines = [];
  function log(msg) {
    if (!debugOn) return;
    try {
      lines.push(new Date().toTimeString().slice(0, 8) + ' ' + msg);
      if (lines.length > 9) lines.shift();
      if (!box && document.body) {
        box = document.createElement('pre');
        box.style.cssText = 'position:fixed;left:4px;bottom:4px;z-index:2147483647;margin:0;padding:4px 6px;max-width:92vw;background:rgba(0,0,0,.8);color:#7CFC7C;font:10px/1.3 monospace;white-space:pre-wrap;pointer-events:none;border-radius:6px';
        document.body.appendChild(box);
      }
      if (box) box.textContent = lines.join('\n');
    } catch (e) { /* ignoré */ }
  }

  function sdkOk() {
    return typeof window.sdk !== 'undefined' && window.sdk && typeof window.sdk.showBanner === 'function';
  }

  function doPause() { if (!paused) { paused = true; try { hooks.pause(); } catch (e) { /* ignoré */ } } }
  function doResume() { if (paused) { paused = false; try { hooks.resume(); } catch (e) { /* ignoré */ } } }

  /* appelée par SDK_OPTIONS.onEvent (voir index.html) */
  function onSdkEvent(a) {
    if (!a || typeof a.name !== 'string') return;
    log('SDK ' + a.name);
    switch (a.name) {
      case 'SDK_GAME_PAUSE':
        doPause();
        if (pending && pending.onPause) pending.onPause();
        break;
      case 'SDK_GAME_START':
        doResume();
        if (pending && pending.onEnd) pending.onEnd(true);
        break;
      case 'SDK_ERROR':
        doResume();
        if (pending && pending.onEnd) pending.onEnd(false);
        break;
      default: break;   // SDK_READY : rien à initialiser, la pub est demandée à la demande
    }
  }

  /* Affiche une pub plein écran. Résout true si une pub a réellement été jouée,
     false sinon. Ne rejette jamais et ne laisse jamais le jeu en pause. */
  function showInterstitial() {
    return new Promise(function (resolve) {
      if (busy || paused || !sdkOk()) { resolve(false); return; }
      busy = true;
      log('showBanner()');
      let sawPause = false;
      let finished = false;
      const p = {};
      function end(played) {
        if (finished) return;
        finished = true;
        clearTimeout(p.timer);
        pending = null;
        busy = false;
        doResume();                       // sécurité : jamais de jeu muet ou figé
        const shown = !!(played && sawPause);
        log(shown ? 'pub jouée' : 'pas de pub diffusée (le SDK a refusé ou rien à afficher)');
        if (shown) {                      // une vraie pub vient de passer : on repart de zéro
          lastAdAt = Date.now();
          retryAt = 0;
          Object.keys(counters).forEach(function (k) { counters[k] = 0; });
        } else {
          retryAt = Date.now() + RETRY_MS;
        }
        resolve(shown);
      }
      p.onPause = function () {
        sawPause = true;
        clearTimeout(p.timer);
        p.timer = setTimeout(function () { end(false); }, END_TIMEOUT);
      };
      p.onEnd = end;
      p.timer = setTimeout(function () { end(false); }, START_TIMEOUT);
      pending = p;
      try { window.sdk.showBanner(); } catch (e) { end(false); }
    });
  }

  /* ----- compteur de manches (par mode) ----- */

  function enabledFor(modeId) { return NO_ADS_MODES.indexOf(modeId) === -1; }

  /* une manche vient de se terminer pour de bon */
  function roundFinished(modeId) {
    if (!enabledFor(modeId)) return;
    counters[modeId] = (counters[modeId] || 0) + 1;
    log('manche finie (' + modeId + ') : ' + counters[modeId] + '/' + ROUNDS_PER_AD);
  }

  function timeDue() { return Date.now() - lastAdAt >= TIME_PER_AD; }

  function isDue(modeId) {
    if (!enabledFor(modeId) || !sdkOk() || Date.now() < retryAt) return false;
    return (counters[modeId] || 0) >= ROUNDS_PER_AD || timeDue();
  }

  /* à appeler JUSTE AVANT de lancer une manche : affiche la pub si elle est due */
  async function breakIfDue(modeId) {
    if (!isDue(modeId)) return false;
    log('pub due (' + modeId + ', manches: ' + (counters[modeId] || 0) + ')');
    return showInterstitial();          // si le SDK refuse : la pub reste due et sera retentée plus tard
  }

  /* appelée quand le menu des modes vient de s'afficher :
     pub d'arrivée (une seule fois) ou pub des 10 minutes si elle est due */
  async function menuBreak() {
    if (entryPending) { entryPending = false; log('pub d arrivée'); return showInterstitial(); }
    if (timeDue() && Date.now() >= retryAt) { log('pub des 10 min (menu)'); return showInterstitial(); }
    return false;
  }

  /* le cœur du jeu donne ici ses fonctions « couper / remettre le son » */
  function bind(h) {
    if (h && typeof h.pause === 'function' && typeof h.resume === 'function') hooks = { pause: h.pause, resume: h.resume };
  }

  return Object.freeze({
    onSdkEvent: onSdkEvent,
    bind: bind,
    roundFinished: roundFinished,
    isDue: isDue,
    breakIfDue: breakIfDue,
    menuBreak: menuBreak,
    showInterstitial: showInterstitial,
    isBusy: function () { return busy || paused; },
    available: sdkOk,
    ROUNDS_PER_AD: ROUNDS_PER_AD
  });
})();
