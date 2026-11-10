/* =========================================================
   STORYBAK — double.js
   MODE « DOUBLE » : deux séquences à la suite, à retenir ENSEMBLE.
   Le jeu montre la séquence 1, fait une pause, puis la séquence 2.
   Tu reproduis la séquence 1 puis la séquence 2 sans t'arrêter.
   3 vies ; à chaque réussite, il y a une couleur de plus.
   (règles communes dans arcade.js)
========================================================= */

Storybak.register('double', function (api) {
  'use strict';
  return window.StorybakArcade(api, {
    icon: '2️⃣', order: 50, titleKey: 'modeDouble', descKey: 'modeDoubleDesc', bg: 'ville4.png',
    tr: {
      fr: { modeDouble: 'Mode double', modeDoubleDesc: 'Deux séquences à retenir ensemble', dblFirst: '1️⃣ Première séquence…', dblSecond: '2️⃣ Deuxième séquence…', dblPlay: '2️⃣ Refais la 1re puis la 2e séquence' },
      en: { modeDouble: 'Double mode', modeDoubleDesc: 'Two sequences to remember together', dblFirst: '1️⃣ First sequence…', dblSecond: '2️⃣ Second sequence…', dblPlay: '2️⃣ Repeat the 1st then the 2nd sequence' },
      es: { modeDouble: 'Modo doble', modeDoubleDesc: 'Dos secuencias para recordar juntas', dblFirst: '1️⃣ Primera secuencia…', dblSecond: '2️⃣ Segunda secuencia…', dblPlay: '2️⃣ Repite la 1.ª y luego la 2.ª' },
      de: { modeDouble: 'Doppel-Modus', modeDoubleDesc: 'Zwei Folgen zusammen merken', dblFirst: '1️⃣ Erste Folge…', dblSecond: '2️⃣ Zweite Folge…', dblPlay: '2️⃣ Wiederhole die 1. dann die 2. Folge' },
      ar: { modeDouble: 'الوضع المزدوج', modeDoubleDesc: 'تسلسلان يجب تذكرهما معًا', dblFirst: '1️⃣ التسلسل الأول…', dblSecond: '2️⃣ التسلسل الثاني…', dblPlay: '2️⃣ أعد الأول ثم الثاني' }
    },
    lives: 3,
    lenFor: function (n) { return 4 + n; },
    maxLen: 14,
    tfac: 1.5,
    roundOpts: function (seq) {
      const split = Math.floor(seq.length / 2);
      return {
        pauseAt: split, pauseMs: 1200, playMsg: 'dblPlay',
        onFlash: function (i) {
          if (i === 0) api.ui.setMsg('dblFirst');
          else if (i === split) api.ui.setMsg('dblSecond');
        }
      };
    }
  });
});
