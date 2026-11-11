/* =========================================================
   STORYBAK — survie.js
   MODE « SURVIE » : une seule vie, une séquence qui s'allonge sans fin.
   À chaque réussite, il y a une couleur de plus et les couleurs
   s'allument un peu plus vite. La première faute arrête la partie ;
   ton meilleur score est gardé.
   (règles communes dans arcade.js)
========================================================= */

Storybak.register('survie', function (api) {
  'use strict';
  return window.StorybakArcade(api, {
    icon: '🔥', order: 70, titleKey: 'modeSurvie', descKey: 'modeSurvieDesc', bg: 'ville6.png',
    tr: {
      fr: { modeSurvie: 'Mode survie', modeSurvieDesc: 'Une seule vie, va le plus loin possible' },
      en: { modeSurvie: 'Survival mode', modeSurvieDesc: 'One life, go as far as you can' },
      es: { modeSurvie: 'Modo supervivencia', modeSurvieDesc: 'Una sola vida, llega lo más lejos posible' },
      de: { modeSurvie: 'Überlebens-Modus', modeSurvieDesc: 'Ein Leben, komm so weit du kannst' },
      ar: { modeSurvie: 'وضع البقاء', modeSurvieDesc: 'حياة واحدة، اذهب أبعد ما تستطيع' }
    },
    lives: 1,
    lenFor: function (n) { return 3 + n; },
    maxLen: 20,
    tfac: 1.4,
    roundOpts: function (seq, n) { return { flashMs: Math.max(420, 900 - n * 25) }; }
  });
});
