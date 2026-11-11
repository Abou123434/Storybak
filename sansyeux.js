/* =========================================================
   STORYBAK — sansyeux.js
   MODE « SANS LES YEUX » : on teste l'OREILLE.
   Les couleurs sont cachées : seules les FORMES (● ▲ ■ ★) existent,
   et chaque forme a son propre SON (grave → aigu). Tu écoutes la
   séquence, puis tu la reproduis. Mets le son !
   3 vies ; à chaque réussite, il y a une note de plus.
   (règles communes dans arcade.js)
========================================================= */

Storybak.register('sansyeux', function (api) {
  'use strict';
  return window.StorybakArcade(api, {
    icon: '🎧', order: 60, titleKey: 'modeBlind', descKey: 'modeBlindDesc', bg: 'ville5.png',
    tr: {
      fr: { modeBlind: 'Sans les yeux', modeBlindDesc: 'Écoute les sons, couleurs cachées', blindListen: '🎧 Écoute bien les sons…', blindPlay: '🎧 Reproduis les sons avec les formes' },
      en: { modeBlind: 'Eyes closed', modeBlindDesc: 'Listen to the sounds, colors hidden', blindListen: '🎧 Listen carefully…', blindPlay: '🎧 Repeat the sounds with the shapes' },
      es: { modeBlind: 'Sin mirar', modeBlindDesc: 'Escucha los sonidos, colores ocultos', blindListen: '🎧 Escucha bien…', blindPlay: '🎧 Repite los sonidos con las formas' },
      de: { modeBlind: 'Ohne hinzusehen', modeBlindDesc: 'Höre die Töne, Farben versteckt', blindListen: '🎧 Hör gut zu…', blindPlay: '🎧 Wiederhole die Töne mit den Formen' },
      ar: { modeBlind: 'بلا نظر', modeBlindDesc: 'استمع للأصوات، الألوان مخفية', blindListen: '🎧 استمع جيدًا…', blindPlay: '🎧 أعد الأصوات بالأشكال' }
    },
    lives: 3,
    lenFor: function (n) { return 3 + n; },
    maxLen: 12,
    tfac: 1.6,
    roundOpts: function () {
      return {
        blind: true, tone: true, flashMs: 800, playMsg: 'blindPlay',
        onFlash: function (i) { if (i === 0) api.ui.setMsg('blindListen'); }
      };
    }
  });
});
