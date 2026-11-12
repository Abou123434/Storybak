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
  const NO_ADS_MODES = ['entrainement'];

  const counters = Object.create(null);
  let hooks = { pause: function () {}, resume: function () {} };
  let busy = false;      // une de NOS demandes est en cours
  let paused = false;    // le SDK a mis le jeu en pause (pub à l'écran)
  let pending = null;    // { onPause, onEnd, timer }
  let lastAdAt = Date.now();   // dernier moment où une pub a été demandée
  let entryPending = true;     // la pub d'arrivée n'a pas encore été demandée

  function sdkOk() {
    return typeof window.sdk !== 'undefined' && window.sdk && typeof window.sdk.showBanner === 'function';
  }

  function doPause() { if (!paused) { paused = true; try { hooks.pause(); } catch (e) { /* ignoré */ } } }
  function doResume() { if (paused) { paused = false; try { hooks.resume(); } catch (e) { /* ignoré */ } } }

  /* appelée par SDK_OPTIONS.onEvent (voir index.html) */
  function onSdkEvent(a) {
    if (!a || typeof a.name !== 'string') return;
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
      lastAdAt = Date.now();
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
        resolve(!!(played && sawPause));
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
  }

  function timeDue() { return Date.now() - lastAdAt >= TIME_PER_AD; }

  function isDue(modeId) {
    return enabledFor(modeId) && ((counters[modeId] || 0) >= ROUNDS_PER_AD || timeDue());
  }

  /* à appeler JUSTE AVANT de lancer une manche : affiche la pub si elle est due */
  async function breakIfDue(modeId) {
    if (!isDue(modeId)) return false;
    counters[modeId] = 0;               // remis à zéro même si le SDK ne diffuse rien : pas d'insistance
    return showInterstitial();
  }

  /* appelée quand le menu des modes vient de s'afficher :
     pub d'arrivée (une seule fois) ou pub des 10 minutes si elle est due */
  async function menuBreak() {
    if (entryPending) { entryPending = false; return showInterstitial(); }
    if (timeDue()) return showInterstitial();
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
