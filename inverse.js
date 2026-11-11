/* =========================================================
   STORYBAK — inverse.js
   MODE « INVERSÉ » : il faut reproduire la séquence À L'ENVERS.
   Les couleurs s'allument dans un ordre ; tu réponds en commençant
   par la DERNIÈRE. 3 vies, la séquence s'allonge à chaque réussite.
   (règles communes dans arcade.js)
========================================================= */

Storybak.register('inverse', function (api) {
  'use strict';
  return window.StorybakArcade(api, {
    icon: '🔄', order: 40, titleKey: 'modeInverse', descKey: 'modeInverseDesc', bg: 'ville3.png',
    tr: {
      fr: { modeInverse: 'Mode inversé', modeInverseDesc: 'Reproduis la séquence à l’envers', invPlay: '🔄 À l’envers ! Commence par la dernière' },
      en: { modeInverse: 'Reverse mode', modeInverseDesc: 'Repeat the sequence backwards', invPlay: '🔄 Backwards! Start with the last one' },
      es: { modeInverse: 'Modo inverso', modeInverseDesc: 'Repite la secuencia al revés', invPlay: '🔄 ¡Al revés! Empieza por la última' },
      de: { modeInverse: 'Rückwärts-Modus', modeInverseDesc: 'Wiederhole die Folge rückwärts', invPlay: '🔄 Rückwärts! Beginne mit der letzten' },
      ar: { modeInverse: 'الوضع المعكوس', modeInverseDesc: 'أعد التسلسل بالعكس', invPlay: '🔄 بالعكس! ابدأ بالأخيرة' }
    },
    lives: 3,
    lenFor: function (n) { return 3 + n; },
    maxLen: 12,
    tfac: 1.9,
    roundOpts: function () { return { reverse: true, playMsg: 'invPlay' }; }
  });
});
