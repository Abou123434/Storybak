/* =========================================================
   STORYBAK — MODE SOLO
   Se branche sur le noyau défini dans index.html (window.SBModes).
   Le joueur monte de niveau : séquences plus longues, plus rapides.
========================================================= */

(function () {
  'use strict';

  window.SBModes = window.SBModes || [];

  window.SBModes.push(function (api) {
    const el = api.el;
    let running = false;

    api.addTexts({
      fr: {
        soloReady: '🎯 Mode Solo : appuie sur Commencer',
        soloObserve: '👀 Observe bien la séquence !',
        soloPlay: '🎮 Reproduis la séquence !',
        soloWin: '🔥 Bravo ! Manche réussie.',
        soloFail: '❌ Séquence incorrecte. Réessaie !',
        soloTimeout: '⏰ Temps écoulé ! Réessaie !',
        soloNoLives: '🚫 Tu n’as plus de vies.',
        soloComplete: '🏆 Tous les niveaux sont terminés !'
      },
      en: {
        soloReady: '🎯 Solo mode: press Start',
        soloObserve: '👀 Watch the sequence carefully!',
        soloPlay: '🎮 Repeat the sequence!',
        soloWin: '🔥 Well done! Round completed.',
        soloFail: '❌ Incorrect sequence. Try again!',
        soloTimeout: '⏰ Time’s up! Try again!',
        soloNoLives: '🚫 You have no lives left.',
        soloComplete: '🏆 All levels completed!'
      },
      es: {
        soloReady: '🎯 Modo Solo: pulsa Empezar',
        soloObserve: '👀 ¡Observa bien la secuencia!',
        soloPlay: '🎮 ¡Repite la secuencia!',
        soloWin: '🔥 ¡Bravo! Ronda superada.',
        soloFail: '❌ Secuencia incorrecta. ¡Inténtalo de nuevo!',
        soloTimeout: '⏰ ¡Se acabó el tiempo!',
        soloNoLives: '🚫 Ya no te quedan vidas.',
        soloComplete: '🏆 ¡Todos los niveles completados!'
      },
      de: {
        soloReady: '🎯 Solo-Modus: drücke Start',
        soloObserve: '👀 Beobachte die Sequenz genau!',
        soloPlay: '🎮 Wiederhole die Sequenz!',
        soloWin: '🔥 Bravo! Runde geschafft.',
        soloFail: '❌ Falsche Sequenz. Versuch es nochmal!',
        soloTimeout: '⏰ Zeit abgelaufen!',
        soloNoLives: '🚫 Du hast keine Leben mehr.',
        soloComplete: '🏆 Alle Level abgeschlossen!'
      },
      ar: {
        soloReady: '🎯 النمط الفردي: اضغط ابدأ',
        soloObserve: '👀 راقب التسلسل جيدًا!',
        soloPlay: '🎮 أعد التسلسل!',
        soloWin: '🔥 أحسنت! أنهيت الجولة.',
        soloFail: '❌ تسلسل خاطئ. حاول مجددًا!',
        soloTimeout: '⏰ انتهى الوقت!',
        soloNoLives: '🚫 لم يعد لديك أرواح.',
        soloComplete: '🏆 أنهيت جميع المستويات!'
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
        api.updateUI();
        return;
      }

      running = true;
      api.setHidden(el.star, true);
      api.setMsg('soloObserve');

      api.board.play(makeSequence(api.cfg.lengthFor(save.level)), {
        speed: Math.max(420, 800 - Math.floor(save.level / 5) * 25),
        seconds: api.cfg.timeFor(save.level),

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
            if (remaining > 0) api.setMsg(result.reason === 'timeout' ? 'soloTimeout' : 'soloFail');
            else api.setMsg('soloNoLives');
          }

          // Pas de vies : le bouton pub prend le relais, sinon on propose de continuer.
          api.setHidden(el.star, api.get().lives <= 0);
          api.setStartText('next');
          api.updateUI();
        }
      });
    }

    return {
      id: 'solo',

      enter: function () {
        running = false;
        api.setScreen('game');
        api.setVersus('');
        api.setStartText('start');
        api.setHidden(el.star, api.get().lives <= 0);
        api.setMsg(api.get().lives > 0 ? 'soloReady' : 'soloNoLives');
      },

      leave: function () {
        running = false;
        api.board.cancel();
        api.setHidden(el.star, false);
      },

      onStart: function () {
        if (!running) startRound();
      },

      onBack: function () {
        api.home();
      },

      // Appelé par le noyau quand le joueur récupère des vies grâce à la pub.
      onLivesGranted: function () {
        api.setMsg('soloReady');
        api.setHidden(el.star, false);
      },

      canLeave: function () {
        return true;
      }
    };
  });
})();
