/* =========================================================
   STORYBAK — MODE SOLO
   Ce fichier s'enregistre auprès du noyau script.js.
   Il réutilise le plateau, la sauvegarde et les règles
   de progression déjà présents dans le jeu.
========================================================= */

(function () {
  'use strict';

  window.SBModes = window.SBModes || [];

  window.SBModes.push(function (api) {
    const el = api.el;
    let running = false;
    let round = 0;

    api.addTexts({
      fr: {
        soloReady: '🎯 Mode Solo : appuie sur Commencer',
        soloObserve: '👀 Observe bien la séquence !',
        soloPlay: '🎮 Reproduis la séquence !',
        soloWin: '🔥 Bravo ! Manche réussie.',
        soloFail: '❌ Séquence incorrecte. Réessaie !',
        soloNoLives: '🚫 Tu n’as plus de vies.',
        soloComplete: '🏆 Tous les niveaux sont terminés !'
      },
      en: {
        soloReady: '🎯 Solo mode: press Start',
        soloObserve: '👀 Watch the sequence carefully!',
        soloPlay: '🎮 Repeat the sequence!',
        soloWin: '🔥 Well done! Round completed.',
        soloFail: '❌ Incorrect sequence. Try again!',
        soloNoLives: '🚫 You have no lives left.',
        soloComplete: '🏆 All levels completed!'
      }
    });

    function makeSequence(length) {
      const colors = api.cfg.COLORS;
      const sequence = [];
      for (let i = 0; i < length; i++) {
        sequence.push(colors[Math.floor(Math.random() * colors.length)]);
      }
      return sequence;
    }

    function startRound() {
      const save = api.get();
      if (save.lives <= 0) {
        api.setMsg('soloNoLives');
        return;
      }

      running = true;
      const level = save.level;
      const length = api.cfg.lengthFor(level);
      const seconds = api.cfg.timeFor(level);

      api.setHidden(el.star, true);
      api.setMsg('soloObserve');

      api.board.play(makeSequence(length), {
        speed: Math.max(420, 900 - Math.floor(level / 20) * 25),
        seconds: seconds,
        onAnswer: function () {
          api.setMsg('soloPlay');
        },
        onDone: function (result) {
          running = false;

          if (result.ok) {
            const progress = api.winLevel();
            api.safePlay(el.winSound);
            if (progress.finished) {
              api.setMsg('soloComplete');
            } else {
              api.setMsg('soloWin');
              if (progress.ticket) api.toast('ticketWon');
            }
          } else {
            const remaining = api.loseLife();
            api.safePlay(el.failSound);
            api.setMsg(remaining > 0 ? 'soloFail' : 'soloNoLives');
          }

          api.setHidden(el.star, false);
          api.updateUI();
        }
      });
    }

    function onStart() {
      if (running) return;
      startRound();
    }

    return {
      id: 'solo',
      screen: 'solo',

      enter: function () {
        round = 0;
        api.setMsg('soloReady');
        api.setHidden(el.star, false);
        if (el.star) el.star.addEventListener('click', onStart);
      },

      leave: function () {
        running = false;
        api.board.cancel();
        if (el.star) el.star.removeEventListener('click', onStart);
        api.setHidden(el.star, false);
      },

      pause: function () {
        if (running) api.board.cancel();
        running = false;
      },

      resume: function () {},

      canLeave: function () {
        return true;
      }
    };
  });
})();
