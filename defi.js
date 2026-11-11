/* =========================================================
   STORYBAK — defi.js
   MODE « JOUER DÉFI » : deux façons de se défier.

   1) DÉFI PAR LIEN (entre amis, sans serveur)
      - Tu joues une série de 5 manches (séquences de 3 à 7 couleurs).
      - Le jeu crée un lien qui contient la série + ton résultat.
      - Ton ami ouvre le lien, joue EXACTEMENT les mêmes séquences,
        puis le jeu compare : plus de manches réussies = gagne ;
        à égalité, le plus rapide gagne.
      - Le lien est signé : si on modifie le résultat dans le lien,
        il est refusé. (Sans serveur, ce n'est qu'une protection légère.)
      - Récompenses (pièces) seulement en relevant le défi d'un autre,
        une seule fois par défi.

   3) DÉFIS À DÉBLOQUER : objectifs (ex. « 5 couleurs en 7 secondes »).
      Réussis un défi pour ouvrir le suivant ; récompense la 1re fois.

   Facile / Difficile : choix pour le défi ami et le duel contre l'IA.

   2) DUEL CONTRE L'IA AVEC MISE
      - Tu mises des pièces (20 / 50 / 100) ou 1 ticket.
      - Match au meilleur des 3 manches contre un adversaire du jeu.
      - Gagné : tu récupères le double de ta mise. Perdu : mise perdue.
      - Plus la mise est grosse, plus l'adversaire est fort.
      - Limite : 8 duels par jour. Quitter / recharger en plein duel
        = manche perdue (la mise est prélevée dès le départ).

   SOMMAIRE
   01. Textes
   02. Réglages et calculs
   03. Lien de défi (encodage signé)
   04. Données sauvegardées
   05. Fenêtres
   06. Série d'amis (jeu)
   07. Duel contre l'IA (jeu)
   07b. Défis à débloquer (objectifs)
   08. Interface du mode
========================================================= */

Storybak.register('defi', function (api) {
  'use strict';

  const t = api.t;
  const ui = api.ui;
  const h = ui.h;
  const engine = api.engine;


  /* =======================================================
     01. TEXTES
  ======================================================= */

  api.addTranslations({
    fr: {
      dTitle: '⚔️ Défi', dFriend: '👥 Défier un ami', dFriendDesc: 'Même série pour vous deux, lien à envoyer',
      dAI: '🤖 Duel contre l’IA', dAIDesc: 'Mise des pièces ou un ticket',
      dHistory: '📜 Mes défis', dNoHistory: 'Aucun défi pour le moment', dBack: '← Retour', dContinue: 'Continuer',
      dResume: '▶ Reprendre', dResumeFriend: 'Défi en cours', dResumeDuel: 'Duel en cours',
      dNameLabel: 'Ton nom (visible par ton ami)', dDefaultName: 'Joueur', dCreate: 'Créer mon défi',
      dSeriesInfo: '{n} manches · séquences de 3 à {m} · les mêmes pour ton ami',
      dReady: 'Manche {i}/{n} — prépare-toi…', dOk: '✅ Réussi en {s}s', dKo: '❌ Raté',
      dRound: 'Manche', dDone: 'Réussies', dTime: 'Temps',
      dMyResult: 'Ton résultat : {w}/{n} réussies en {s}s',
      dShareIntro: 'Envoie ce lien à ton ami :', dShareText: '{name} te défie sur Memory Flash Pro : {w}/{n} manches en {s}s. Peux-tu faire mieux ?',
      dWhatsapp: '📤 Envoyer sur WhatsApp', dCopy: '📋 Copier le lien', dCopied: 'Lien copié !', dShareNative: '📲 Partager',
      dIncoming: '{name} te défie !', dIncomingDesc: 'Série de {n} manches. Plus de manches réussies, ou plus rapide, gagne.',
      dAccept: '▶ Relever le défi', dInvalid: 'Lien de défi invalide ou modifié', dOwn: 'C’est ton propre défi : envoie-le à un ami',
      dWin: '🏆 Tu as gagné !', dLose: '😅 Tu as perdu', dDraw: '🤝 Égalité parfaite',
      dYou: 'Toi', dRoundsLine: '{w}/{n} réussies · {s}s',
      dRewardCoins: '+{n} 🪙 pièces', dNoReward: 'Pas de récompense (défi déjà joué)',
      dRevenge: '🔁 Lancer mon propre défi', dPending: 'En attente de ton ami',
      dStakeTitle: 'Choisis ta mise', dStakeCoins: '🪙 {n} pièces', dStakeTicket: '🎟 1 ticket',
      dStakeInfo: 'Gagne : +{n}', dStakeInfoT: 'Gagne : +1 🎟', dBet: 'Miser', dNeedCoins: 'Pas assez de pièces', dNeedTicket: 'Pas de ticket',
      dLimit: 'Duels restants aujourd’hui : {n}', dLimitOut: 'Limite atteinte pour aujourd’hui, reviens demain',
      dOpp: 'Adversaire : {name} {stars}', dMatch: 'Match', dManche: 'Manche',
      dWinS: '✅ Manche gagnée ! {a}s contre {b}s', dWinF: '✅ Manche gagnée ! L’adversaire s’est trompé',
      dLoseS: '❌ Manche perdue : {a}s contre {b}s', dLoseF: '❌ Manche perdue : tu t’es trompé',
      dDrawR: '🤝 Personne ne réussit : on rejoue', dForfeit: '❌ Manche perdue (tu as quitté)',
      dDuelWin: '🎉 Duel gagné !', dDuelLose: '😅 Duel perdu', dStakeBack: 'Gain : +{n}', dStakeLost: 'Mise perdue : {n}',
      dDouble: '🎥 Doubler le gain (pub)', dDoubleOk: '✅ Gain doublé : +{n} {w}', dDoubleFail: 'Pub non terminée, réessaie',
      dTicketsWord: '🎟 ticket(s)', dCoinsWord: '🪙 pièces', dDiff: 'Difficulté', dEasy: 'Facile', dHard: 'Difficile', dMissions: '🎯 Défis à débloquer', dMissionsDesc: 'Réussis un défi pour ouvrir le suivant', dMTitle: 'Défi {n}', dMGoal: '{r} manches · {l} couleurs · {s} s par manche', dMFast: '⚡ Séquence rapide', dMNoFault: 'Aucune faute permise', dMFaults: '{n} faute(s) permise(s)', dMReward: 'Récompense : {r}', dMStart: '▶ Commencer le défi', dMLocked: '🔒 Réussis d’abord le défi {n}', dMDone: '✔ Réussi', dMSuccess: '🎉 Défi réussi !', dMFail: '😅 Défi raté', dMFailDesc: 'Essaie encore, c’est gratuit', dMNext: 'Défi suivant ▶', dMRetry: '🔁 Réessayer', dMUnlocked: '🔓 Défi {n} débloqué', dMAlready: 'Déjà réussi : pas de récompense', dMAll: '🏆 Tous les défis sont réussis !', dFaults: 'Fautes', dRewardTickets: '+{n} 🎟 ticket(s)', dTicketHard: 'Difficile seulement', dDiffHintDuel: 'Facile : IA plus faible, gain ×1,5 · Difficile : gain ×2', dAgain: '🔁 Rejouer'
    },
    en: {
      dTitle: '⚔️ Challenge', dFriend: '👥 Challenge a friend', dFriendDesc: 'Same series for both, send a link',
      dAI: '🤖 Duel vs AI', dAIDesc: 'Bet coins or a ticket',
      dHistory: '📜 My challenges', dNoHistory: 'No challenge yet', dBack: '← Back', dContinue: 'Continue',
      dResume: '▶ Resume', dResumeFriend: 'Challenge in progress', dResumeDuel: 'Duel in progress',
      dNameLabel: 'Your name (seen by your friend)', dDefaultName: 'Player', dCreate: 'Create my challenge',
      dSeriesInfo: '{n} games · sequences of 3 to {m} · same for your friend',
      dReady: 'Game {i}/{n} — get ready…', dOk: '✅ Done in {s}s', dKo: '❌ Missed',
      dRound: 'Game', dDone: 'Solved', dTime: 'Time',
      dMyResult: 'Your result: {w}/{n} solved in {s}s',
      dShareIntro: 'Send this link to your friend:', dShareText: '{name} challenges you on Memory Flash Pro: {w}/{n} games in {s}s. Can you do better?',
      dWhatsapp: '📤 Send on WhatsApp', dCopy: '📋 Copy link', dCopied: 'Link copied!', dShareNative: '📲 Share',
      dIncoming: '{name} challenges you!', dIncomingDesc: '{n} games. More games solved, or faster, wins.',
      dAccept: '▶ Accept the challenge', dInvalid: 'Invalid or modified challenge link', dOwn: 'This is your own challenge: send it to a friend',
      dWin: '🏆 You won!', dLose: '😅 You lost', dDraw: '🤝 Perfect tie',
      dYou: 'You', dRoundsLine: '{w}/{n} solved · {s}s',
      dRewardCoins: '+{n} 🪙 coins', dNoReward: 'No reward (challenge already played)',
      dRevenge: '🔁 Start my own challenge', dPending: 'Waiting for your friend',
      dStakeTitle: 'Choose your bet', dStakeCoins: '🪙 {n} coins', dStakeTicket: '🎟 1 ticket',
      dStakeInfo: 'Win: +{n}', dStakeInfoT: 'Win: +1 🎟', dBet: 'Bet', dNeedCoins: 'Not enough coins', dNeedTicket: 'No ticket',
      dLimit: 'Duels left today: {n}', dLimitOut: 'Limit reached for today, come back tomorrow',
      dOpp: 'Opponent: {name} {stars}', dMatch: 'Match', dManche: 'Game',
      dWinS: '✅ Game won! {a}s vs {b}s', dWinF: '✅ Game won! Your opponent made a mistake',
      dLoseS: '❌ Game lost: {a}s vs {b}s', dLoseF: '❌ Game lost: you made a mistake',
      dDrawR: '🤝 Nobody succeeded: replay', dForfeit: '❌ Game lost (you left)',
      dDuelWin: '🎉 Duel won!', dDuelLose: '😅 Duel lost', dStakeBack: 'Prize: +{n}', dStakeLost: 'Bet lost: {n}',
      dDouble: '🎥 Double the prize (ad)', dDoubleOk: '✅ Prize doubled: +{n} {w}', dDoubleFail: 'Ad not finished, try again',
      dTicketsWord: '🎟 ticket(s)', dCoinsWord: '🪙 coins', dDiff: 'Difficulty', dEasy: 'Easy', dHard: 'Hard', dMissions: '🎯 Challenges to unlock', dMissionsDesc: 'Beat one challenge to open the next', dMTitle: 'Challenge {n}', dMGoal: '{r} games · {l} colors · {s} s per game', dMFast: '⚡ Fast sequence', dMNoFault: 'No mistakes allowed', dMFaults: '{n} mistake(s) allowed', dMReward: 'Reward: {r}', dMStart: '▶ Start challenge', dMLocked: '🔒 Beat challenge {n} first', dMDone: '✔ Done', dMSuccess: '🎉 Challenge complete!', dMFail: '😅 Challenge failed', dMFailDesc: 'Try again, it’s free', dMNext: 'Next challenge ▶', dMRetry: '🔁 Retry', dMUnlocked: '🔓 Challenge {n} unlocked', dMAlready: 'Already done: no reward', dMAll: '🏆 All challenges complete!', dFaults: 'Mistakes', dRewardTickets: '+{n} 🎟 ticket(s)', dTicketHard: 'Hard only', dDiffHintDuel: 'Easy: weaker AI, prize ×1.5 · Hard: prize ×2', dAgain: '🔁 Play again'
    },
    es: {
      dTitle: '⚔️ Desafío', dFriend: '👥 Desafiar a un amigo', dFriendDesc: 'Misma serie para los dos, envía un enlace',
      dAI: '🤖 Duelo contra la IA', dAIDesc: 'Apuesta monedas o un ticket',
      dHistory: '📜 Mis desafíos', dNoHistory: 'Aún no hay desafíos', dBack: '← Volver', dContinue: 'Continuar',
      dResume: '▶ Reanudar', dResumeFriend: 'Desafío en curso', dResumeDuel: 'Duelo en curso',
      dNameLabel: 'Tu nombre (lo verá tu amigo)', dDefaultName: 'Jugador', dCreate: 'Crear mi desafío',
      dSeriesInfo: '{n} mangas · secuencias de 3 a {m} · las mismas para tu amigo',
      dReady: 'Manga {i}/{n} — prepárate…', dOk: '✅ Logrado en {s}s', dKo: '❌ Fallado',
      dRound: 'Manga', dDone: 'Logradas', dTime: 'Tiempo',
      dMyResult: 'Tu resultado: {w}/{n} logradas en {s}s',
      dShareIntro: 'Envía este enlace a tu amigo:', dShareText: '{name} te desafía en Memory Flash Pro: {w}/{n} mangas en {s}s. ¿Puedes hacerlo mejor?',
      dWhatsapp: '📤 Enviar por WhatsApp', dCopy: '📋 Copiar enlace', dCopied: '¡Enlace copiado!', dShareNative: '📲 Compartir',
      dIncoming: '¡{name} te desafía!', dIncomingDesc: '{n} mangas. Gana quien logre más mangas, o sea más rápido.',
      dAccept: '▶ Aceptar el desafío', dInvalid: 'Enlace de desafío inválido o modificado', dOwn: 'Es tu propio desafío: envíalo a un amigo',
      dWin: '🏆 ¡Ganaste!', dLose: '😅 Perdiste', dDraw: '🤝 Empate perfecto',
      dYou: 'Tú', dRoundsLine: '{w}/{n} logradas · {s}s',
      dRewardCoins: '+{n} 🪙 monedas', dNoReward: 'Sin recompensa (desafío ya jugado)',
      dRevenge: '🔁 Lanzar mi propio desafío', dPending: 'Esperando a tu amigo',
      dStakeTitle: 'Elige tu apuesta', dStakeCoins: '🪙 {n} monedas', dStakeTicket: '🎟 1 ticket',
      dStakeInfo: 'Ganas: +{n}', dStakeInfoT: 'Ganas: +1 🎟', dBet: 'Apostar', dNeedCoins: 'No hay suficientes monedas', dNeedTicket: 'Sin ticket',
      dLimit: 'Duelos restantes hoy: {n}', dLimitOut: 'Límite alcanzado hoy, vuelve mañana',
      dOpp: 'Rival: {name} {stars}', dMatch: 'Partido', dManche: 'Manga',
      dWinS: '✅ ¡Manga ganada! {a}s contra {b}s', dWinF: '✅ ¡Manga ganada! El rival se equivocó',
      dLoseS: '❌ Manga perdida: {a}s contra {b}s', dLoseF: '❌ Manga perdida: te equivocaste',
      dDrawR: '🤝 Nadie acierta: se repite', dForfeit: '❌ Manga perdida (saliste)',
      dDuelWin: '🎉 ¡Duelo ganado!', dDuelLose: '😅 Duelo perdido', dStakeBack: 'Premio: +{n}', dStakeLost: 'Apuesta perdida: {n}',
      dDouble: '🎥 Duplicar premio (anuncio)', dDoubleOk: '✅ Premio duplicado: +{n} {w}', dDoubleFail: 'Anuncio no terminado, reintenta',
      dTicketsWord: '🎟 ticket(s)', dCoinsWord: '🪙 monedas', dDiff: 'Dificultad', dEasy: 'Fácil', dHard: 'Difícil', dMissions: '🎯 Desafíos por desbloquear', dMissionsDesc: 'Supera un desafío para abrir el siguiente', dMTitle: 'Desafío {n}', dMGoal: '{r} mangas · {l} colores · {s} s por manga', dMFast: '⚡ Secuencia rápida', dMNoFault: 'No se permiten fallos', dMFaults: '{n} fallo(s) permitido(s)', dMReward: 'Recompensa: {r}', dMStart: '▶ Empezar el desafío', dMLocked: '🔒 Supera antes el desafío {n}', dMDone: '✔ Superado', dMSuccess: '🎉 ¡Desafío superado!', dMFail: '😅 Desafío fallado', dMFailDesc: 'Inténtalo otra vez, es gratis', dMNext: 'Siguiente desafío ▶', dMRetry: '🔁 Reintentar', dMUnlocked: '🔓 Desafío {n} desbloqueado', dMAlready: 'Ya superado: sin recompensa', dMAll: '🏆 ¡Todos los desafíos superados!', dFaults: 'Fallos', dRewardTickets: '+{n} 🎟 ticket(s)', dTicketHard: 'Solo Difícil', dDiffHintDuel: 'Fácil: IA más débil, premio ×1,5 · Difícil: premio ×2', dAgain: '🔁 Jugar otra vez'
    },
    de: {
      dTitle: '⚔️ Herausforderung', dFriend: '👥 Freund herausfordern', dFriendDesc: 'Gleiche Serie für beide, Link senden',
      dAI: '🤖 Duell gegen die KI', dAIDesc: 'Münzen oder ein Ticket setzen',
      dHistory: '📜 Meine Herausforderungen', dNoHistory: 'Noch keine Herausforderung', dBack: '← Zurück', dContinue: 'Weiter',
      dResume: '▶ Fortsetzen', dResumeFriend: 'Herausforderung läuft', dResumeDuel: 'Duell läuft',
      dNameLabel: 'Dein Name (sieht dein Freund)', dDefaultName: 'Spieler', dCreate: 'Meine Herausforderung erstellen',
      dSeriesInfo: '{n} Spiele · Folgen von 3 bis {m} · gleich für deinen Freund',
      dReady: 'Spiel {i}/{n} — mach dich bereit…', dOk: '✅ Geschafft in {s}s', dKo: '❌ Verfehlt',
      dRound: 'Spiel', dDone: 'Geschafft', dTime: 'Zeit',
      dMyResult: 'Dein Ergebnis: {w}/{n} geschafft in {s}s',
      dShareIntro: 'Schick diesen Link deinem Freund:', dShareText: '{name} fordert dich bei Memory Flash Pro heraus: {w}/{n} Spiele in {s}s. Schaffst du es besser?',
      dWhatsapp: '📤 Per WhatsApp senden', dCopy: '📋 Link kopieren', dCopied: 'Link kopiert!', dShareNative: '📲 Teilen',
      dIncoming: '{name} fordert dich heraus!', dIncomingDesc: '{n} Spiele. Mehr geschaffte Spiele oder schneller gewinnt.',
      dAccept: '▶ Herausforderung annehmen', dInvalid: 'Ungültiger oder veränderter Link', dOwn: 'Das ist deine eigene Herausforderung: sende sie einem Freund',
      dWin: '🏆 Du hast gewonnen!', dLose: '😅 Du hast verloren', dDraw: '🤝 Perfektes Unentschieden',
      dYou: 'Du', dRoundsLine: '{w}/{n} geschafft · {s}s',
      dRewardCoins: '+{n} 🪙 Münzen', dNoReward: 'Keine Belohnung (schon gespielt)',
      dRevenge: '🔁 Eigene Herausforderung starten', dPending: 'Warte auf deinen Freund',
      dStakeTitle: 'Wähle deinen Einsatz', dStakeCoins: '🪙 {n} Münzen', dStakeTicket: '🎟 1 Ticket',
      dStakeInfo: 'Gewinn: +{n}', dStakeInfoT: 'Gewinn: +1 🎟', dBet: 'Setzen', dNeedCoins: 'Nicht genug Münzen', dNeedTicket: 'Kein Ticket',
      dLimit: 'Duelle heute übrig: {n}', dLimitOut: 'Heute am Limit, komm morgen wieder',
      dOpp: 'Gegner: {name} {stars}', dMatch: 'Match', dManche: 'Spiel',
      dWinS: '✅ Spiel gewonnen! {a}s gegen {b}s', dWinF: '✅ Spiel gewonnen! Dein Gegner hat sich geirrt',
      dLoseS: '❌ Spiel verloren: {a}s gegen {b}s', dLoseF: '❌ Spiel verloren: du hast dich geirrt',
      dDrawR: '🤝 Keiner schafft es: Wiederholung', dForfeit: '❌ Spiel verloren (du bist gegangen)',
      dDuelWin: '🎉 Duell gewonnen!', dDuelLose: '😅 Duell verloren', dStakeBack: 'Gewinn: +{n}', dStakeLost: 'Einsatz verloren: {n}',
      dDouble: '🎥 Gewinn verdoppeln (Werbung)', dDoubleOk: '✅ Gewinn verdoppelt: +{n} {w}', dDoubleFail: 'Werbung nicht beendet, nochmal',
      dTicketsWord: '🎟 Ticket(s)', dCoinsWord: '🪙 Münzen', dDiff: 'Schwierigkeit', dEasy: 'Leicht', dHard: 'Schwer', dMissions: '🎯 Freizuschaltende Aufgaben', dMissionsDesc: 'Schaffe eine Aufgabe, um die nächste zu öffnen', dMTitle: 'Aufgabe {n}', dMGoal: '{r} Spiele · {l} Farben · {s} s pro Spiel', dMFast: '⚡ Schnelle Folge', dMNoFault: 'Keine Fehler erlaubt', dMFaults: '{n} Fehler erlaubt', dMReward: 'Belohnung: {r}', dMStart: '▶ Aufgabe starten', dMLocked: '🔒 Schaffe zuerst Aufgabe {n}', dMDone: '✔ Geschafft', dMSuccess: '🎉 Aufgabe geschafft!', dMFail: '😅 Aufgabe gescheitert', dMFailDesc: 'Versuch es nochmal, kostenlos', dMNext: 'Nächste Aufgabe ▶', dMRetry: '🔁 Nochmal', dMUnlocked: '🔓 Aufgabe {n} freigeschaltet', dMAlready: 'Schon geschafft: keine Belohnung', dMAll: '🏆 Alle Aufgaben geschafft!', dFaults: 'Fehler', dRewardTickets: '+{n} 🎟 Ticket(s)', dTicketHard: 'Nur Schwer', dDiffHintDuel: 'Leicht: schwächere KI, Gewinn ×1,5 · Schwer: Gewinn ×2', dAgain: '🔁 Nochmal spielen'
    },
    ar: {
      dTitle: '⚔️ تحدٍّ', dFriend: '👥 تحدَّ صديقًا', dFriendDesc: 'نفس السلسلة للاثنين، أرسل رابطًا',
      dAI: '🤖 مبارزة ضد الذكاء الاصطناعي', dAIDesc: 'راهن بعملات أو تذكرة',
      dHistory: '📜 تحدياتي', dNoHistory: 'لا توجد تحديات بعد', dBack: '← رجوع', dContinue: 'متابعة',
      dResume: '▶ استئناف', dResumeFriend: 'تحدٍّ جارٍ', dResumeDuel: 'مبارزة جارية',
      dNameLabel: 'اسمك (يراه صديقك)', dDefaultName: 'لاعب', dCreate: 'أنشئ تحدّيّ',
      dSeriesInfo: '{n} جولات · تسلسلات من 3 إلى {m} · نفسها لصديقك',
      dReady: 'الجولة {i}/{n} — استعد…', dOk: '✅ نجحت في {s}ث', dKo: '❌ فشلت',
      dRound: 'الجولة', dDone: 'الناجحة', dTime: 'الوقت',
      dMyResult: 'نتيجتك: {w}/{n} ناجحة في {s}ث',
      dShareIntro: 'أرسل هذا الرابط إلى صديقك:', dShareText: '{name} يتحداك في لعبة الذاكرة: {w}/{n} جولات في {s}ث. هل تستطيع التفوق؟',
      dWhatsapp: '📤 أرسل عبر واتساب', dCopy: '📋 انسخ الرابط', dCopied: 'تم نسخ الرابط!', dShareNative: '📲 مشاركة',
      dIncoming: '{name} يتحداك!', dIncomingDesc: '{n} جولات. يفوز من ينجح في جولات أكثر أو أسرع.',
      dAccept: '▶ اقبل التحدي', dInvalid: 'رابط التحدي غير صالح أو معدَّل', dOwn: 'هذا تحدّيك أنت: أرسله إلى صديق',
      dWin: '🏆 لقد فزت!', dLose: '😅 لقد خسرت', dDraw: '🤝 تعادل تام',
      dYou: 'أنت', dRoundsLine: '{w}/{n} ناجحة · {s}ث',
      dRewardCoins: '+{n} 🪙 عملة', dNoReward: 'لا مكافأة (تحدٍّ لُعب من قبل)',
      dRevenge: '🔁 ابدأ تحدّيّ الخاص', dPending: 'بانتظار صديقك',
      dStakeTitle: 'اختر رهانك', dStakeCoins: '🪙 {n} عملة', dStakeTicket: '🎟 تذكرة واحدة',
      dStakeInfo: 'الربح: +{n}', dStakeInfoT: 'الربح: +1 🎟', dBet: 'راهن', dNeedCoins: 'لا تكفي العملات', dNeedTicket: 'لا توجد تذكرة',
      dLimit: 'المبارزات المتبقية اليوم: {n}', dLimitOut: 'بلغت الحد اليوم، عد غدًا',
      dOpp: 'الخصم: {name} {stars}', dMatch: 'المباراة', dManche: 'الجولة',
      dWinS: '✅ فزت بالجولة! {a}ث مقابل {b}ث', dWinF: '✅ فزت بالجولة! أخطأ الخصم',
      dLoseS: '❌ خسرت الجولة: {a}ث مقابل {b}ث', dLoseF: '❌ خسرت الجولة: أخطأت',
      dDrawR: '🤝 لم ينجح أحد: نعيد الجولة', dForfeit: '❌ خسرت الجولة (غادرت)',
      dDuelWin: '🎉 فزت بالمبارزة!', dDuelLose: '😅 خسرت المبارزة', dStakeBack: 'الربح: +{n}', dStakeLost: 'خسرت الرهان: {n}',
      dDouble: '🎥 ضاعف الربح (إعلان)', dDoubleOk: '✅ تضاعف الربح: +{n} {w}', dDoubleFail: 'لم يكتمل الإعلان، حاول مجددًا',
      dTicketsWord: '🎟 تذكرة', dCoinsWord: '🪙 عملة', dDiff: 'الصعوبة', dEasy: 'سهل', dHard: 'صعب', dMissions: '🎯 تحديات للفتح', dMissionsDesc: 'أنجز تحديًا لتفتح التالي', dMTitle: 'التحدي {n}', dMGoal: '{r} جولات · {l} ألوان · {s} ث لكل جولة', dMFast: '⚡ تسلسل سريع', dMNoFault: 'لا أخطاء مسموحة', dMFaults: 'مسموح بـ {n} أخطاء', dMReward: 'المكافأة: {r}', dMStart: '▶ ابدأ التحدي', dMLocked: '🔒 أنجز التحدي {n} أولًا', dMDone: '✔ منجز', dMSuccess: '🎉 أنجزت التحدي!', dMFail: '😅 فشل التحدي', dMFailDesc: 'حاول مجددًا، إنه مجاني', dMNext: 'التحدي التالي ▶', dMRetry: '🔁 أعد المحاولة', dMUnlocked: '🔓 تم فتح التحدي {n}', dMAlready: 'منجز سابقًا: لا مكافأة', dMAll: '🏆 أنجزت كل التحديات!', dFaults: 'الأخطاء', dRewardTickets: '+{n} 🎟 تذكرة', dTicketHard: 'للصعب فقط', dDiffHintDuel: 'سهل: ذكاء أضعف، ربح ×1.5 · صعب: ربح ×2', dAgain: '🔁 العب مجددًا'
    }
  });


  /* =======================================================
     02. RÉGLAGES ET CALCULS
  ======================================================= */

  const COLORS = ['red', 'green', 'blue', 'yellow'];
  const SERIES_N = 5;                         // manches d'un défi entre amis
  const SERIES_LENS = [[3, 3, 4, 4, 5], [3, 4, 5, 6, 7]];   // longueurs : Facile, Difficile
  const SERIES_TL = [1.8, 1.4];               // temps accordé par couleur : Facile, Difficile
  const REWARD = { w: 30, d: 10, l: 5 };      // pièces en relevant un défi
  const HISTORY_MAX = 20;
  const NAME_MAX = 12;

  /* défis à débloquer : réussis-en un pour ouvrir le suivant
     r = manches à réussir · l = longueur (ramp = +1 couleur toutes les 1/ramp manches) · s = secondes par manche
     miss = fautes permises · fast = ms entre 2 couleurs (séquence rapide) */
  const MISSIONS = [
    { r: 3, l: 3, s: 10, miss: 0, coins: 10 },
    { r: 3, l: 4, s: 8,  miss: 0, coins: 15 },
    { r: 3, l: 5, s: 7,  miss: 0, coins: 25 },                       // « mémoriser 5 couleurs en 7 secondes »
    { r: 4, l: 4, s: 6,  miss: 1, fast: 700, coins: 30, tickets: 1 },
    { r: 3, l: 6, s: 9,  miss: 1, coins: 40 },
    { r: 5, l: 5, s: 7,  miss: 0, coins: 50, tickets: 1 },
    { r: 4, l: 5, s: 6,  miss: 1, fast: 540, coins: 60 },
    { r: 3, l: 8, s: 12, miss: 1, coins: 80 },
    { r: 8, l: 4, s: 8,  miss: 1, ramp: 0.5, coins: 100, tickets: 1 },
    { r: 5, l: 7, s: 8,  miss: 0, fast: 480, coins: 200, tickets: 2 }
  ];
  const MISSION_BG = ['ville1.png', 'ville3.png', 'ville4.png', 'ville5.png', 'ville6.png', 'ville7.png', 'ville8.png', 'ville9.png', 'ville2.png', 'ville1.png'];
  const missionLen = function (M, i) { return M.l + (M.ramp ? Math.floor(i * M.ramp) : 0); };

  /* mises du duel contre l'IA */
  const STAKES = [
    { kind: 'coins',   n: 20,  mean: 0.68, base: 3, pace: 760 },
    { kind: 'coins',   n: 50,  mean: 0.77, base: 4, pace: 700 },
    { kind: 'coins',   n: 100, mean: 0.85, base: 4, pace: 640 },
    { kind: 'tickets', n: 1,   mean: 0.90, base: 5, pace: 600 }
  ];
  const DUELS_PER_DAY = 8;
  const NAMES = ['Ayo', 'Kofi', 'Awa', 'Moussa', 'Fatou', 'Yann', 'Léa', 'Ibrahim', 'Mariam', 'Sékou', 'Nadia', 'Karim',
    'Samir', 'Leila', 'Tom', 'Lucas', 'Emma', 'Hugo', 'Mia', 'Noah', 'Sofia', 'Diego', 'Amina', 'Omar'];

  const PAUSE_READY = 1200;
  const PAUSE_RESULT = 1800;

  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let x = Math.imul(a ^ a >>> 15, 1 | a);
      x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x;
      return ((x ^ x >>> 14) >>> 0) / 4294967296;
    };
  }
  function mix(a, b, c) { return (Math.imul(a ^ 0x9E3779B1, 2654435761) ^ Math.imul(b + 0x85EBCA6B, 2246822507) ^ Math.imul((c || 0) + 0xC2B2AE35, 3266489909)) >>> 0; }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function gauss(rng) { return (rng() + rng() + rng() - 1.5) * 2; }
  function randomSeed() {
    try { return crypto.getRandomValues(new Uint32Array(1))[0]; } catch (e) { return Math.floor(Math.random() * 4294967296) >>> 0; }
  }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function makeSeq(seed, g, L, salt) {
    const rng = mulberry32(mix(seed, g + 1, salt));
    const seq = [];
    for (let i = 0; i < L; i++) seq.push(COLORS[Math.floor(rng() * 4)]);
    return seq;
  }
  const timeLimit = function (L, f) { return Math.ceil(2 + L * f); };

  /* temps stockés en centièmes de seconde (1..9999), 0 = manche ratée */
  const toCs = function (ms) { return clamp(Math.round(ms / 10), 1, 9999); };
  const secs = function (cs) { return (cs / 100).toFixed(1); };

  function summary(res) {
    let w = 0, cs = 0;
    res.forEach(function (x) { if (x > 0) { w++; cs += x; } });
    return { w: w, cs: cs };
  }
  /* 1 = A gagne, -1 = B gagne, 0 = égalité */
  function compare(a, b) {
    const x = summary(a), y = summary(b);
    if (x.w !== y.w) return x.w > y.w ? 1 : -1;
    if (x.cs !== y.cs) return x.cs < y.cs ? 1 : -1;
    return 0;
  }

  function aiAttempt(ai, L, rng) {
    const p = clamp(ai.skill - 0.045 * (L - 3), 0.05, 0.985);
    const ok = rng() < p;
    const jitter = 0.85 + 0.3 * rng();
    if (ok) return { ok: true, f: L, ms: Math.round(400 + L * ai.pace * jitter) };
    const f = Math.floor(rng() * L);
    return { ok: false, f: f, ms: Math.round(400 + (f + 1) * ai.pace * jitter) };
  }
  function cmpRound(a, b) {
    if (a.ok && b.ok) return a.ms < b.ms ? 1 : a.ms > b.ms ? -1 : 0;
    if (a.ok) return 1;
    if (b.ok) return -1;
    return 0;
  }
  function makeAi(stakeIdx, seed, diff) {
    const S = STAKES[stakeIdx], rng = mulberry32(mix(seed, 9, 4));
    const mean = diff === 0 ? S.mean - 0.14 : S.mean;
    return { name: NAMES[Math.floor(rng() * NAMES.length)], skill: clamp(mean + 0.05 * gauss(rng), 0.3, 0.97), pace: S.pace * (diff === 0 ? 1.25 : 1) * (0.85 + 0.3 * rng()) };
  }
  /* gain du duel : Facile ×1,5 (pièces), Difficile ×2 */
  function duelPayout(st, diff) { return st.kind === 'tickets' ? st.n * 2 : (diff === 0 ? Math.floor(st.n * 1.5) : st.n * 2); }
  function stars(skill) {
    const n = clamp(Math.round((skill - 0.35) / 0.62 * 4) + 1, 1, 5);
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  }


  /* =======================================================
     03. LIEN DE DÉFI (encodage signé)
     #d=<données en base64>.<signature>
     données = [2, graine, nom, [résultats des 5 manches], difficulté]
  ======================================================= */

  const LINK_SECRET = 'sbk-defi/2f9c-v1';

  function sign(str) {
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    const s = str + LINK_SECRET;
    for (let i = 0, ch; i < s.length; i++) {
      ch = s.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (h2 >>> 0).toString(36) + (h1 >>> 0).toString(36);
  }
  function b64enc(s) { return btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function b64dec(s) {
    s = s.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    return decodeURIComponent(escape(atob(s)));
  }

  function cleanName(n) {
    n = String(n || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, NAME_MAX);
    return n || t('dDefaultName');
  }
  function validRes(r) {
    return Array.isArray(r) && r.length === SERIES_N && r.every(function (x) { return Number.isInteger(x) && x >= 0 && x <= 9999; });
  }

  function encode(seed, name, res, diff) {
    const body = b64enc(JSON.stringify([2, seed, name, res, diff]));
    return body + '.' + sign(body);
  }
  /* renvoie {seed, name, res} ou null si invalide / modifié */
  function decode(enc) {
    try {
      if (typeof enc !== 'string' || enc.length > 400) return null;
      const cut = enc.lastIndexOf('.');
      if (cut < 1) return null;
      const body = enc.slice(0, cut);
      if (sign(body) !== enc.slice(cut + 1)) return null;
      const a = JSON.parse(b64dec(body));
      if (!Array.isArray(a) || (a[0] !== 1 && a[0] !== 2) || !Number.isInteger(a[1]) || a[1] < 0 || a[1] > 4294967295) return null;
      if (typeof a[2] !== 'string' || a[2].length > NAME_MAX || !validRes(a[3])) return null;
      const diff = a[0] === 1 ? 1 : a[4];                 // anciens liens (v1) = série difficile
      if (diff !== 0 && diff !== 1) return null;
      return { seed: a[1], name: a[2], res: a[3], diff: diff };
    } catch (e) { return null; }
  }
  function pageUrl() { return location.href.split('#')[0]; }
  function linkFor(enc) { return pageUrl() + '#d=' + enc; }
  function hashEnc() {
    const m = /^#d=([A-Za-z0-9_\-.]+)$/.exec(location.hash || '');
    return m ? m[1] : null;
  }
  function clearHash() {
    try { history.replaceState(null, '', pageUrl()); } catch (e) { /* ignore */ }
  }


  /* =======================================================
     04. DONNÉES SAUVEGARDÉES
  ======================================================= */

  function defaults() {
    return { name: '', history: [], created: [], cur: null, duel: null, duelDay: '', duelsN: 0, won: 0, lost: 0, diff: 0, ms: 0 };
  }

  function isInt(n, a, b) { return Number.isInteger(n) && n >= a && n <= b; }

  function sanitize(d0) {
    if (!d0 || typeof d0 !== 'object') return null;
    const d = Object.assign(defaults(), d0);             // anciennes sauvegardes : champs manquants = valeur de départ
    if (!isInt(d.diff, 0, 1) || !isInt(d.ms, 0, MISSIONS.length)) return null;
    if (typeof d.name !== 'string' || d.name.length > NAME_MAX) return null;
    if (!isInt(d.duelsN, 0, 99) || !isInt(d.won, 0, 1e6) || !isInt(d.lost, 0, 1e6)) return null;
    if (typeof d.duelDay !== 'string' || d.duelDay.length > 12) return null;
    if (!Array.isArray(d.created) || d.created.length > 40 || !d.created.every(function (x) { return isInt(x, 0, 4294967295); })) return null;
    if (!Array.isArray(d.history) || d.history.length > HISTORY_MAX) return null;
    const hist = [];
    for (const x of d.history) {
      if (!x || !isInt(x.id, 0, 4294967295) || (x.role !== 'c' && x.role !== 'a')) return null;
      if (typeof x.name !== 'string' || x.name.length > NAME_MAX || !validRes(x.mine)) return null;
      if (x.theirs !== null && !validRes(x.theirs)) return null;
      if (['p', 'w', 'l', 'd'].indexOf(x.out) === -1 || !isInt(x.rew, 0, 100)) return null;
      const xd = x.diff === undefined ? 1 : x.diff;
      if (xd !== 0 && xd !== 1) return null;
      hist.push({ id: x.id, role: x.role, name: x.name, mine: x.mine.slice(), theirs: x.theirs ? x.theirs.slice() : null, out: x.out, rew: x.rew, diff: xd });
    }
    let cur = null;
    if (d.cur !== null) {
      const c = d.cur;
      if (!c || (c.role !== 'c' && c.role !== 'a') || !isInt(c.seed, 0, 4294967295) || typeof c.pending !== 'boolean') return null;
      if (typeof c.name !== 'string' || c.name.length > NAME_MAX) return null;
      if (!Array.isArray(c.res) || c.res.length > SERIES_N || !c.res.every(function (x) { return isInt(x, 0, 9999); })) return null;
      if (c.role === 'a' && !validRes(c.theirs)) return null;
      const cd = c.diff === undefined ? 1 : c.diff;
      if (cd !== 0 && cd !== 1) return null;
      cur = { role: c.role, seed: c.seed, name: c.name, theirs: c.theirs ? c.theirs.slice() : null, res: c.res.slice(), pending: c.pending, diff: cd };
    }
    let duel = null;
    if (d.duel !== null) {
      const u = d.duel;
      if (!u || !isInt(u.stake, 0, STAKES.length - 1) || !isInt(u.seed, 0, 4294967295)) return null;
      if (!isInt(u.pw, 0, 2) || !isInt(u.ow, 0, 2) || !isInt(u.g, 0, 6) || typeof u.pending !== 'boolean') return null;
      const ud = u.diff === undefined ? 1 : u.diff;
      if (ud !== 0 && ud !== 1) return null;
      duel = { stake: u.stake, seed: u.seed, pw: u.pw, ow: u.ow, g: u.g, pending: u.pending, diff: ud };
    }
    return { name: d.name, history: hist, created: d.created.slice(), cur: cur, duel: duel, duelDay: d.duelDay, duelsN: d.duelsN, won: d.won, lost: d.lost, diff: d.diff, ms: d.ms };
  }

  const S = function () { return api.store.get(); };
  function duelsLeft() { const s = S(); return Math.max(0, DUELS_PER_DAY - (s.duelDay === api.today() ? s.duelsN : 0)); }


  /* =======================================================
     05. FENÊTRES
  ======================================================= */

  let ov = null;
  let view = 'home';
  let viewData = null;

  function btn(label, cls, fn, disabled) {
    const b = h('button', cls || '', label);
    b.type = 'button';
    if (disabled) b.disabled = true;
    b.addEventListener('click', function () { if (!b.disabled) fn(); });
    return b;
  }
  function chips() {
    const w = api.wallet.get();
    return h('div', 'chips', '', [h('span', 'chip', '🪙 ' + w.coins), h('span', 'chip', '🎟 ' + w.tickets)]);
  }
  function go(v, data) { view = v; viewData = data || null; render(); ov.open(); }

  /* choix Facile / Difficile (mémorisé) */
  function diffRow() {
    const s = S();
    const pick = function (i) {
      if (s.diff === i) return;
      api.batch(function () { s.diff = i; api.store.save(); });
      api.sound('click'); render();
    };
    return h('div', 'diff-row', '', [
      h('b', '', t('dDiff')),
      btn(t('dEasy'), s.diff === 0 ? 'btn-ok' : 'btn-soft', function () { pick(0); }),
      btn(t('dHard'), s.diff === 1 ? 'btn-ok' : 'btn-soft', function () { pick(1); })
    ]);
  }

  function render() {
    if (!ov) return;
    ov.sheet.textContent = '';
    const fn = { home: renderHome, create: renderCreate, share: renderShare, incoming: renderIncoming,
      result: renderResult, history: renderHistory, stake: renderStake, duelEnd: renderDuelEnd,
      missions: renderMissions, mission: renderMission, missionEnd: renderMissionEnd }[view];
    if (fn) fn();
  }

  /* ----- accueil ----- */
  function renderHome() {
    const s = S(), sheet = ov.sheet;
    sheet.appendChild(h('h2', 'sheet-title', t('dTitle')));
    sheet.appendChild(chips());

    if (s.cur) {
      const card = h('div', 'banner-card', '', [h('b', '', '👥 ' + t('dResumeFriend'))]);
      card.appendChild(btn(t('dResume'), 'btn-main', function () { startSeries(); }));
      sheet.appendChild(card);
    }
    if (s.duel) {
      const card = h('div', 'banner-card', '', [h('b', '', '🤖 ' + t('dResumeDuel'))]);
      card.appendChild(btn(t('dResume'), 'btn-main', function () { startDuel(); }));
      sheet.appendChild(card);
    }

    const list = h('div', 'mode-list');
    [['dFriend', 'dFriendDesc', '👥', function () { go('create'); }],
     ['dAI', 'dAIDesc', '🤖', function () { go('stake'); }],
     ['dMissions', 'dMissionsDesc', '🎯', function () { go('missions'); }]].forEach(function (x) {
      const c = h('button', 'mode-card', '', [
        h('span', 'mode-icon', x[2]),
        h('span', 'mode-text', '', [h('b', '', t(x[0])), h('small', '', t(x[1]))])
      ]);
      c.type = 'button';
      c.addEventListener('click', function () { api.sound('click'); x[3](); });
      list.appendChild(c);
    });
    sheet.appendChild(list);

    sheet.appendChild(h('div', 'sheet-foot', '', [
      btn(t('dHistory'), 'btn-soft', function () { go('history'); }),
      btn(t('modes'), 'btn-soft', function () { ov.close(); api.menu(); })
    ]));
  }

  /* ----- créer un défi ----- */
  function renderCreate() {
    const s = S(), sheet = ov.sheet;
    sheet.appendChild(h('h2', 'sheet-title', t('dFriend')));
    sheet.appendChild(diffRow());
    sheet.appendChild(h('p', 'sheet-text', t('dSeriesInfo', { n: SERIES_N, m: SERIES_LENS[s.diff][SERIES_N - 1] })));
    sheet.appendChild(h('label', 'sheet-text', t('dNameLabel')));
    const input = h('input', 'name-input');
    input.type = 'text'; input.maxLength = NAME_MAX; input.value = s.name || ''; input.placeholder = t('dDefaultName');
    input.autocomplete = 'off';
    input.addEventListener('input', function () { s.name = input.value.slice(0, NAME_MAX); });
    sheet.appendChild(input);
    sheet.appendChild(h('div', 'sheet-foot', '', [
      btn(t('dBack'), 'btn-soft', function () { go('home'); }),
      btn(t('dCreate'), 'btn-main', function () {
        const name = cleanName(input.value);
        api.batch(function () {
          s.name = input.value.trim() ? name : '';
          s.cur = { role: 'c', seed: randomSeed(), name: name, theirs: null, res: [], pending: false, diff: s.diff };
          api.store.save();
        });
        startSeries();
      })
    ]));
  }

  /* ----- partager mon défi ----- */
  function renderShare() {
    const d = viewData, sheet = ov.sheet;
    const sm = summary(d.mine);
    const enc = encode(d.seed, d.name, d.mine, d.diff);
    const url = linkFor(enc);
    const text = t('dShareText', { name: d.name, w: sm.w, n: SERIES_N, s: secs(sm.cs) });

    sheet.appendChild(h('h2', 'sheet-title', t('dMyResult', { w: sm.w, n: SERIES_N, s: secs(sm.cs) })));
    sheet.appendChild(h('p', 'sheet-text', t('dShareIntro')));
    const box = h('input', 'name-input link-box');
    box.type = 'text'; box.readOnly = true; box.value = url;
    box.addEventListener('focus', function () { box.select(); });
    sheet.appendChild(box);

    const wa = h('a', 'btn-main link-btn', t('dWhatsapp'));
    wa.href = 'https://wa.me/?text=' + encodeURIComponent(text + ' ' + url);
    wa.target = '_blank'; wa.rel = 'noopener';
    const row = h('div', 'ticket-row', '', [wa]);
    row.appendChild(btn(t('dCopy'), 'btn-soft', function () { copy(url, box); }));
    if (navigator.share) {
      row.appendChild(btn(t('dShareNative'), 'btn-soft', function () {
        navigator.share({ text: text, url: url }).catch(function () { /* annulé */ });
      }));
    }
    sheet.appendChild(row);
    sheet.appendChild(h('div', 'sheet-foot', '', [btn(t('dContinue'), 'btn-main', function () { go('home'); })]));
  }
  function copy(text, box) {
    const fallback = function () { box.focus(); box.select(); try { document.execCommand('copy'); api.toast('dCopied'); } catch (e) { /* ignore */ } };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { api.toast('dCopied'); }, fallback);
    else fallback();
  }

  /* ----- défi reçu ----- */
  function renderIncoming() {
    const d = viewData, sheet = ov.sheet;
    const own = S().created.indexOf(d.seed) !== -1;
    sheet.appendChild(h('h2', 'sheet-title', t('dIncoming', { name: d.name })));
    sheet.appendChild(h('p', 'sheet-text', t('dIncomingDesc', { n: SERIES_N }) + ' · ' + t(d.diff === 0 ? 'dEasy' : 'dHard')));
    if (own) sheet.appendChild(h('p', 'sheet-text', t('dOwn')));
    sheet.appendChild(h('div', 'sheet-foot', '', [
      btn(t('dBack'), 'btn-soft', function () { leaveLink(); go('home'); }),
      btn(t('dAccept'), 'btn-main', function () {
        api.batch(function () {
          S().cur = { role: 'a', seed: d.seed, name: d.name, theirs: d.res.slice(), res: [], pending: false, diff: d.diff };
          api.store.save();
        });
        startSeries();
      })
    ]));
  }
  function leaveLink() { clearHash(); }

  /* ----- résultat d'un défi relevé ----- */
  function renderResult() {
    const e = viewData, sheet = ov.sheet;
    const title = e.out === 'w' ? 'dWin' : e.out === 'l' ? 'dLose' : 'dDraw';
    sheet.appendChild(h('h2', 'sheet-title', t(title)));

    const me = summary(e.mine), op = summary(e.theirs);
    const grid = h('div', 'versus');
    grid.appendChild(h('b', '', t('dYou')));
    grid.appendChild(h('span', '', ''));
    grid.appendChild(h('b', '', e.name));
    for (let i = 0; i < SERIES_N; i++) {
      grid.appendChild(h('span', e.mine[i] ? 'ok' : 'ko', e.mine[i] ? '✅ ' + secs(e.mine[i]) + 's' : '❌'));
      grid.appendChild(h('span', 'rn', String(i + 1)));
      grid.appendChild(h('span', e.theirs[i] ? 'ok' : 'ko', e.theirs[i] ? '✅ ' + secs(e.theirs[i]) + 's' : '❌'));
    }
    grid.appendChild(h('small', '', t('dRoundsLine', { w: me.w, n: SERIES_N, s: secs(me.cs) })));
    grid.appendChild(h('span', '', ''));
    grid.appendChild(h('small', '', t('dRoundsLine', { w: op.w, n: SERIES_N, s: secs(op.cs) })));
    sheet.appendChild(grid);

    sheet.appendChild(h('div', 'rewards', '', [h('div', 'reward', e.rew > 0 ? t('dRewardCoins', { n: e.rew }) : t('dNoReward'))]));
    sheet.appendChild(h('div', 'sheet-foot', '', [
      btn(t('dRevenge'), 'btn-soft', function () { go('create'); }),
      btn(t('dContinue'), 'btn-main', function () { go('home'); })
    ]));
  }

  /* ----- historique ----- */
  function renderHistory() {
    const s = S(), sheet = ov.sheet;
    sheet.appendChild(h('h2', 'sheet-title', t('dHistory')));
    if (!s.history.length) sheet.appendChild(h('p', 'sheet-text', t('dNoHistory')));
    const list = h('div', 'theme-list');
    s.history.forEach(function (e) {
      const icon = e.out === 'w' ? '🏆' : e.out === 'l' ? '😅' : e.out === 'd' ? '🤝' : '⏳';
      const sm = summary(e.mine);
      const label = e.role === 'c' ? t('dPending') : e.name;
      const row = h('button', 'mode-card hist-row', '', [
        h('span', 'mode-icon', icon),
        h('span', 'mode-text', '', [h('b', '', label), h('small', '', t('dRoundsLine', { w: sm.w, n: SERIES_N, s: secs(sm.cs) }))])
      ]);
      row.type = 'button';
      row.addEventListener('click', function () {
        if (e.role === 'a') go('result', e); else go('share', { seed: e.id, name: e.name, mine: e.mine, diff: e.diff });
      });
      list.appendChild(row);
    });
    sheet.appendChild(list);
    sheet.appendChild(h('div', 'sheet-foot', '', [btn(t('dBack'), 'btn-soft', function () { go('home'); })]));
  }

  /* ----- choix de la mise ----- */
  function renderStake() {
    const s = S(), w = api.wallet.get(), sheet = ov.sheet;
    const left = duelsLeft();
    sheet.appendChild(h('h2', 'sheet-title', t('dStakeTitle')));
    sheet.appendChild(chips());
    sheet.appendChild(diffRow());
    sheet.appendChild(h('small', 'stats-line', t('dDiffHintDuel')));
    sheet.appendChild(h('small', 'stats-line', left > 0 ? t('dLimit', { n: left }) : t('dLimitOut')));
    STAKES.forEach(function (st, i) {
      const isT = st.kind === 'tickets';
      const have = isT ? w.tickets >= st.n : w.coins >= st.n;
      const lockedEasy = isT && s.diff === 0;
      const card = h('div', 'tier-card');
      card.appendChild(h('div', 'tier-head', '', [
        h('b', '', isT ? t('dStakeTicket') : t('dStakeCoins', { n: st.n })),
        h('span', 'tier-cost', '★'.repeat(i + 1))
      ]));
      card.appendChild(h('small', 'tier-info', lockedEasy ? '🔒 ' + t('dTicketHard') : isT ? t('dStakeInfoT') : t('dStakeInfo', { n: duelPayout(st, s.diff) - st.n })));
      card.appendChild(btn(t('dBet'), 'btn-main', function () { bet(i); }, !!s.duel || left === 0 || !have || lockedEasy));
      sheet.appendChild(card);
    });
    sheet.appendChild(h('div', 'sheet-foot', '', [btn(t('dBack'), 'btn-soft', function () { go('home'); })]));
  }

  function bet(i) {
    const s = S(), st = STAKES[i], w = api.wallet.get();
    if (s.duel || duelsLeft() === 0) return;
    if (st.kind === 'tickets' && s.diff === 0) { api.toast('dTicketHard'); return; }
    if (st.kind === 'coins' && w.coins < st.n) { api.toast('dNeedCoins'); return; }
    if (st.kind === 'tickets' && w.tickets < st.n) { api.toast('dNeedTicket'); return; }
    api.batch(function () {
      api.wallet.spend(st.kind, st.n);
      const day = api.today();
      if (s.duelDay !== day) { s.duelDay = day; s.duelsN = 0; }
      s.duelsN++;
      s.duel = { stake: i, seed: randomSeed(), pw: 0, ow: 0, g: 0, pending: false, diff: s.diff };
      api.store.save();
    });
    api.sound('click');
    startDuel();
  }

  /* ----- fin du duel ----- */
  function renderDuelEnd() {
    const d = viewData, sheet = ov.sheet, st = STAKES[d.stake];
    sheet.appendChild(h('h2', 'sheet-title', t(d.won ? 'dDuelWin' : 'dDuelLose')));
    sheet.appendChild(h('p', 'sheet-text', d.pw + '–' + d.ow));
    const word = st.kind === 'tickets' ? t('dTicketsWord') : t('dCoinsWord');
    sheet.appendChild(h('div', 'rewards', '', [h('div', 'reward', d.won ? t('dStakeBack', { n: (duelPayout(st, d.diff) - st.n) + ' ' + word }) : t('dStakeLost', { n: st.n + ' ' + word }))]));
    if (d.won && !d.doubled) {
      const extra = duelPayout(st, d.diff) - st.n;
      const note = h('p', 'sheet-text', '');
      const adBtn = btn(t('dDouble'), 'btn-soft', async function () {
        if (d.doubled || adBtn.disabled) return;
        adBtn.disabled = true;
        let ok = false;
        try { ok = await api.ads.showRewarded(); } catch (e) { ok = false; }
        if (!ok) { adBtn.disabled = false; note.textContent = t('dDoubleFail'); return; }
        d.doubled = true;
        api.wallet.add(st.kind, extra);
        api.sound('win');
        note.textContent = t('dDoubleOk', { n: extra, w: word });
        adBtn.remove();
      });
      sheet.appendChild(adBtn);
      sheet.appendChild(note);
    }
    sheet.appendChild(h('div', 'sheet-foot', '', [
      btn(t('dAgain'), 'btn-soft', function () { go('stake'); }),
      btn(t('dContinue'), 'btn-main', function () { go('home'); })
    ]));
  }


  /* =======================================================
     06. SÉRIE D'AMIS (jeu)
  ======================================================= */

  let inRun = false;
  let runGen = 0;

  function hudSeries(cur) {
    const sm = summary(cur.res);
    ui.stats([[t('dRound'), Math.min(cur.res.length + 1, SERIES_N) + '/' + SERIES_N], [t('dDone'), String(sm.w)], [t('dTime'), secs(sm.cs) + 's']]);
  }

  async function startSeries() {
    const cur = S().cur;
    if (!cur || inRun) return;
    if (cur.pending) {                               // rechargé en pleine manche = manche ratée
      cur.res.push(0); cur.pending = false; api.store.save();
    }
    if (cur.res.length >= SERIES_N) { finishSeries(); return; }

    inRun = true;
    const gen = ++runGen;
    const alive = function () { return inRun && gen === runGen; };
    ov.close();
    ui.start(false); ui.ad(false);
    ui.background('ville4.png');

    while (cur.res.length < SERIES_N && alive()) {
      const g = cur.res.length, L = SERIES_LENS[cur.diff][g];
      hudSeries(cur);
      ui.board('grid');
      ui.setMsg('dReady', { i: g + 1, n: SERIES_N });
      await wait(PAUSE_READY);
      if (!alive()) return;

      cur.pending = true; api.store.save();
      const res = await engine.run({ sequence: makeSeq(cur.seed, g, L, 21), timeLimit: timeLimit(L, SERIES_TL[cur.diff]) });

      if (!alive()) {
        if (cur.pending) { cur.res.push(0); cur.pending = false; api.store.save(); }
        return;
      }
      cur.pending = false;
      const ok = res.ok && res.reason === 'done';
      cur.res.push(ok ? toCs(res.ms) : 0);
      api.store.save();
      api.sound(ok ? 'win' : 'fail');
      ui.setMsg(ok ? 'dOk' : 'dKo', { s: secs(toCs(res.ms)) });
      hudSeries(cur);
      await wait(PAUSE_RESULT);
    }
    if (!alive()) return;
    inRun = false;
    finishSeries();
  }

  function finishSeries() {
    const s = S(), cur = s.cur;
    if (!cur) return;
    ui.board('grid');
    const mine = cur.res.slice();

    if (cur.role === 'c') {
      api.batch(function () {
        s.history.unshift({ id: cur.seed, role: 'c', name: cur.name, mine: mine, theirs: null, out: 'p', rew: 0, diff: cur.diff });
        if (s.history.length > HISTORY_MAX) s.history.length = HISTORY_MAX;
        if (s.created.indexOf(cur.seed) === -1) s.created.push(cur.seed);
        if (s.created.length > 40) s.created.shift();
        s.cur = null;
        api.store.save();
      });
      go('share', { seed: cur.seed, name: cur.name, mine: mine, diff: cur.diff });
      return;
    }

    /* défi relevé */
    const r = compare(mine, cur.theirs);
    const out = r > 0 ? 'w' : r < 0 ? 'l' : 'd';
    const own = s.created.indexOf(cur.seed) !== -1;
    const seen = s.history.some(function (x) { return x.role === 'a' && x.id === cur.seed; });
    const rew = (own || seen) ? 0 : REWARD[out];
    const entry = { id: cur.seed, role: 'a', name: cur.name, mine: mine, theirs: cur.theirs.slice(), out: out, rew: rew, diff: cur.diff };
    api.batch(function () {
      if (rew > 0) api.wallet.add('coins', rew);
      if (!seen) {
        s.history.unshift(entry);
        if (s.history.length > HISTORY_MAX) s.history.length = HISTORY_MAX;
      }
      s.cur = null;
      api.store.save();
    });
    clearHash();
    api.sound(out === 'w' ? 'win' : 'click');
    go('result', entry);
  }


  /* =======================================================
     07. DUEL CONTRE L'IA (jeu)
  ======================================================= */

  let inDuel = false;
  let duelGen = 0;
  let duelBar = null;
  let barGen = 0;

  function ensureBar() {
    if (duelBar) return;
    const root = h('div', 'duel hidden');
    const name = h('span', 'duel-name');
    const fill = h('i');
    root.appendChild(h('div', 'duel-row', '', [name, h('div', 'duel-track', '', [fill])]));
    ui.el('timer').insertAdjacentElement('afterend', root);
    duelBar = { root: root, name: name, fill: fill };
  }
  function resetBar() {
    barGen++;
    duelBar.fill.style.transition = 'none'; duelBar.fill.style.width = '0%'; duelBar.fill.classList.remove('fail');
    void duelBar.fill.offsetWidth;
  }
  function runBar(ai, L) {
    const my = ++barGen;
    duelBar.fill.style.transition = 'width ' + ai.ms + 'ms linear';
    duelBar.fill.style.width = ((ai.ok ? 1 : ai.f / L) * 100) + '%';
    if (!ai.ok) setTimeout(function () { if (my === barGen) duelBar.fill.classList.add('fail'); }, ai.ms);
  }
  function settleBar(ai, L) {
    barGen++;
    duelBar.fill.style.transition = 'none';
    duelBar.fill.style.width = ((ai.ok ? 1 : ai.f / L) * 100) + '%';
    duelBar.fill.classList.toggle('fail', !ai.ok);
  }
  function hideBar() { if (duelBar) duelBar.root.classList.add('hidden'); }
  function hudDuel(u) { ui.stats([[t('dMatch'), u.pw + '–' + u.ow], [t('dManche'), String(Math.min(u.g + 1, 5))], ['', '']]); }

  async function startDuel() {
    const s = S(), u = s.duel;
    if (!u || inDuel) return;
    const st = STAKES[u.stake], ai = makeAi(u.stake, u.seed, u.diff);
    if (u.pending) { u.ow++; u.g++; u.pending = false; api.store.save(); }   // rechargé en pleine manche = manche perdue

    inDuel = true;
    const gen = ++duelGen;
    const alive = function () { return inDuel && gen === duelGen; };
    ov.close();
    ui.start(false); ui.ad(false);
    ui.background('ville6.png');
    ensureBar();
    duelBar.name.textContent = '🤖 ' + ai.name + '  ' + stars(ai.skill);
    duelBar.root.classList.remove('hidden');

    while (u.pw < 2 && u.ow < 2 && u.g < 5 && alive()) {
      hudDuel(u); ui.board('grid'); resetBar();
      ui.setMsg('dReady', { i: u.g + 1, n: 3 });
      await wait(PAUSE_READY);
      if (!alive()) break;

      const L = Math.min(10, Math.max(2, st.base + u.g - (u.diff === 0 ? 1 : 0)));
      const a = aiAttempt(ai, L, mulberry32(mix(u.seed, u.g + 1, 33)));
      u.pending = true; api.store.save();
      const res = await engine.run({
        sequence: makeSeq(u.seed, u.g, L, 57), timeLimit: timeLimit(L, u.diff === 0 ? 1.6 : 1.2),
        onAnswerStart: function () { runBar(a, L); }
      });

      if (!alive()) {
        if (u.pending) { u.ow++; u.g++; u.pending = false; api.store.save(); }
        break;
      }
      u.pending = false;
      let outcome, key, vars = null;
      if (res.reason === 'cancelled' || res.reason === 'interrupted') { outcome = -1; key = 'dForfeit'; }
      else {
        outcome = cmpRound({ ok: res.ok, ms: res.ms }, a);
        const x = (res.ms / 1000).toFixed(1), y = (a.ms / 1000).toFixed(1);
        if (outcome > 0) { key = a.ok ? 'dWinS' : 'dWinF'; vars = { a: x, b: y }; }
        else if (outcome < 0) { key = res.ok ? 'dLoseS' : 'dLoseF'; vars = { a: x, b: y }; }
        else key = 'dDrawR';
      }
      if (outcome > 0) u.pw++; else if (outcome < 0) u.ow++;
      u.g++;                                   // une manche nulle est rejouée avec une nouvelle séquence
      api.store.save();

      settleBar(a, L);
      api.sound(outcome > 0 ? 'win' : outcome < 0 ? 'fail' : 'click');
      ui.setMsg(key, vars);
      hudDuel(u);
      await wait(PAUSE_RESULT);
    }

    if (!alive()) {
      /* le joueur est parti : si le duel était déjà décidé, on le règle, sinon il reprendra plus tard */
      if (u.ow >= 2 || u.g >= 5) { s.duel = null; api.store.save(); }
      return;
    }
    inDuel = false;
    hideBar();
    ui.board('grid');
    settleDuel();
  }

  function settleDuel() {
    const s = S(), u = s.duel;
    if (!u) return;
    const st = STAKES[u.stake];
    const won = u.pw >= 2 || (u.pw > u.ow && u.g >= 5);       // égalité après 5 manches : la maison gagne
    const res = { stake: u.stake, pw: u.pw, ow: u.ow, won: won, diff: u.diff };
    api.batch(function () {
      if (won) { api.wallet.add(st.kind, duelPayout(st, u.diff)); s.won++; } else s.lost++;
      s.duel = null;
      api.store.save();
    });
    api.sound(won ? 'win' : 'fail');
    go('duelEnd', res);
  }



  /* =======================================================
     07b. DÉFIS À DÉBLOQUER (objectifs)
     Réussis un défi pour ouvrir le suivant. Récompense une seule fois.
     Un défi raté peut être refait gratuitement.
  ======================================================= */

  function missionGoalText(M) {
    const lastL = missionLen(M, M.r - 1);
    return t('dMGoal', { r: M.r, l: lastL === M.l ? String(M.l) : M.l + '–' + lastL, s: M.s });
  }
  function missionRewardText(M) {
    const parts = [t('dRewardCoins', { n: M.coins })];
    if (M.tickets) parts.push(t('dRewardTickets', { n: M.tickets }));
    return parts.join('  ');
  }

  function renderMissions() {
    const s = S(), sheet = ov.sheet;
    sheet.appendChild(h('h2', 'sheet-title', t('dMissions')));
    sheet.appendChild(chips());
    const list = h('div', 'mode-list');
    MISSIONS.forEach(function (M, i) {
      const done = i < s.ms, open = i <= s.ms;
      const row = h('button', 'mode-card' + (open ? '' : ' soon'), '', [
        h('span', 'mode-icon', done ? '✅' : open ? '🎯' : '🔒'),
        h('span', 'mode-text', '', [
          h('b', '', t('dMTitle', { n: i + 1 })),
          h('small', '', open ? missionGoalText(M) : t('dMLocked', { n: i }))
        ])
      ]);
      row.type = 'button';
      row.addEventListener('click', function () {
        if (!open) { api.sound('fail'); api.toast('dMLocked', { n: i }); return; }
        api.sound('click'); go('mission', { i: i });
      });
      list.appendChild(row);
    });
    sheet.appendChild(list);
    sheet.appendChild(h('div', 'sheet-foot', '', [btn(t('dBack'), 'btn-soft', function () { go('home'); })]));
  }

  function renderMission() {
    const i = viewData.i, M = MISSIONS[i], sheet = ov.sheet;
    const done = i < S().ms;
    sheet.appendChild(h('h2', 'sheet-title', t('dMTitle', { n: i + 1 })));
    const lines = [h('p', 'sheet-text', missionGoalText(M))];
    if (M.fast) lines.push(h('p', 'sheet-text', t('dMFast')));
    lines.push(h('p', 'sheet-text', M.miss ? t('dMFaults', { n: M.miss }) : t('dMNoFault')));
    lines.forEach(function (x) { sheet.appendChild(x); });
    sheet.appendChild(h('div', 'rewards', '', [h('div', 'reward', done ? t('dMAlready') : t('dMReward', { r: missionRewardText(M) }))]));
    sheet.appendChild(h('div', 'sheet-foot', '', [
      btn(t('dBack'), 'btn-soft', function () { go('missions'); }),
      btn(t('dMStart'), 'btn-main', function () { startMission(i); })
    ]));
  }

  function renderMissionEnd() {
    const d = viewData, sheet = ov.sheet;
    sheet.appendChild(h('h2', 'sheet-title', t(d.ok ? 'dMSuccess' : 'dMFail')));
    if (d.ok) {
      const box = h('div', 'rewards');
      if (d.first) {
        box.appendChild(h('div', 'reward', missionRewardText(MISSIONS[d.i])));
        box.appendChild(h('div', 'reward', d.i + 1 < MISSIONS.length ? t('dMUnlocked', { n: d.i + 2 }) : t('dMAll')));
      } else box.appendChild(h('div', 'reward', t('dMAlready')));
      sheet.appendChild(box);
    } else sheet.appendChild(h('p', 'sheet-text', t('dMFailDesc')));
    const foot = h('div', 'sheet-foot');
    foot.appendChild(btn(t('dBack'), 'btn-soft', function () { go('missions'); }));
    if (!d.ok) foot.appendChild(btn(t('dMRetry'), 'btn-main', function () { startMission(d.i); }));
    else if (d.i + 1 < MISSIONS.length) foot.appendChild(btn(t('dMNext'), 'btn-main', function () { go('mission', { i: d.i + 1 }); }));
    sheet.appendChild(foot);
  }

  function hudMission(M, succ, faults) {
    ui.stats([[t('dDone'), succ + '/' + M.r], [t('dFaults'), M.miss ? faults + '/' + M.miss : '0'], [t('dTime'), M.s + 's']]);
  }

  async function startMission(i) {
    if (inRun || inDuel) return;
    const M = MISSIONS[i];
    inRun = true;
    const gen = ++runGen;
    const alive = function () { return inRun && gen === runGen; };
    ov.close();
    ui.start(false); ui.ad(false);
    ui.background(MISSION_BG[i % MISSION_BG.length]);

    const seed = randomSeed();
    let succ = 0, faults = 0, tries = 0;
    while (succ < M.r && faults <= M.miss && alive()) {
      hudMission(M, succ, faults);
      ui.board('grid');
      ui.setMsg('dReady', { i: succ + 1, n: M.r });
      await wait(PAUSE_READY);
      if (!alive()) return;

      const L = missionLen(M, succ);
      const res = await engine.run({ sequence: makeSeq(seed, tries++, L, 91), timeLimit: M.s, flashMs: M.fast });
      if (!alive()) return;
      const ok = res.ok && res.reason === 'done';
      if (ok) succ++; else faults++;
      api.sound(ok ? 'win' : 'fail');
      ui.setMsg(ok ? 'dOk' : 'dKo', { s: secs(toCs(res.ms)) });
      hudMission(M, succ, faults);
      await wait(PAUSE_RESULT);
    }
    if (!alive()) return;
    inRun = false;
    finishMission(i, succ >= M.r);
  }

  function finishMission(i, ok) {
    const s = S(), M = MISSIONS[i];
    ui.board('grid');
    let first = false;
    if (ok && i === s.ms) {                               // première réussite : récompense + déblocage du suivant
      first = true;
      api.batch(function () {
        api.wallet.add('coins', M.coins);
        if (M.tickets) api.wallet.add('tickets', M.tickets);
        s.ms = i + 1;
        api.store.save();
      });
    }
    api.sound(ok ? 'win' : 'fail');
    go('missionEnd', { i: i, ok: ok, first: first });
  }


  /* =======================================================
     08. INTERFACE DU MODE
  ======================================================= */

  function openFromLink() {
    const enc = hashEnc();
    if (!enc) return false;
    const d = decode(enc);
    if (!d) { api.toast('dInvalid'); clearHash(); return false; }
    const done = S().history.filter(function (x) { return x.role === 'a' && x.id === d.seed; })[0];
    if (done) { clearHash(); go('result', done); return true; }
    go('incoming', d);
    return true;
  }

  return {
    icon: '⚔️', order: 30, titleKey: 'modeDefi', descKey: 'modeDefiDesc',
    defaults: defaults, sanitize: sanitize,

    /* un lien #d=… reçu ouvre directement ce mode */
    autoEnter: function () {
      const e = hashEnc();
      if (!e) return false;
      if (decode(e)) return true;
      api.toast('dInvalid'); clearHash();
      return false;
    },

    enter: function () {
      if (!ov) ov = ui.overlay('defiSheet', { closable: false });
      ui.start(false); ui.ad(false);
      ui.board('grid');
      ui.background('ville3.png');
      ui.setMsgText('');
      ui.stats([[t('dRound'), '–'], ['', ''], ['', '']]);
      inRun = false; inDuel = false;
      /* une partie interrompue par un rechargement : la manche en cours est perdue, puis on reprend */
      const s = S();
      if (s.cur && s.cur.pending) { s.cur.res.push(0); s.cur.pending = false; api.store.save(); }
      if (s.duel && s.duel.pending) { s.duel.ow++; s.duel.g++; s.duel.pending = false; api.store.save(); }
      if (s.duel && (s.duel.ow >= 2 || s.duel.pw >= 2 || s.duel.g >= 5)) settleDuel();
      else if (!openFromLink()) go('home');
    },

    leave: function () {
      inRun = false; inDuel = false; runGen++; duelGen++; barGen++;
      hideBar();
      if (ov) ov.close();
    },

    confirmLeave: function () { return ((inRun || inDuel) && engine.busy()) ? 'leaveConfirm' : null; },

    refresh: function () { if (ov && ov.isOpen()) render(); }
  };
});
