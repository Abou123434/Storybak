/* =========================================================
   STORYBAK — tournoi.js
   MODE « JOUER TOURNOI » : 8, 16 ou 32 joueurs, adversaires contrôlés par le jeu.

   Comment ça marche
   - Tu choisis la DIFFICULTÉ (Facile / Difficile) et le FORMAT :
     8 joueurs (gratuit), 16 joueurs (1 ticket), 32 joueurs (2 tickets).
   - Les formats se débloquent un par un : gagne un tournoi à 8 pour
     ouvrir celui à 16, gagne un tournoi à 16 pour ouvrir celui à 32.
   - Élimination directe. Un match = au meilleur des 3 manches, avec la
     MÊME séquence pour toi et l'adversaire. Celui qui se trompe perd la
     manche ; si les deux réussissent, le plus rapide gagne ; si personne
     ne réussit, on rejoue (jamais de 1-1).
   - Facile : IA plus faible, séquences courtes, pièces.
     Difficile : IA plus forte, pièces ×2, et pour le champion :
     trophée, thème de couleurs, ticket, vies pour le solo.
   - Tickets : 1 par jour, 1 par pub (3 max/jour), achat en pièces,
     1 par nouvelle ville en solo.
   - Le tableau place le plus fort dans l'autre moitié et un adversaire
     faible au premier match ; le niveau des IA s'adapte un peu à toi.
   - Tout est déterministe à partir d'une graine sauvegardée : recharger
     la page ne permet ni de changer l'adversaire ni de revoir la séquence
     (une manche quittée est comptée perdue).

   SOMMAIRE
   01. Textes
   02. Réglages des tournois
   03. IA et tableau (calcul)
   04. Données sauvegardées
   05. Fenêtres (lobby, tableau, résultats, trophées)
   06. Match (manches, barre de l'adversaire)
   07. Fin de tournoi et récompenses
   08. Interface du mode
========================================================= */

Storybak.register('tournoi', function (api) {
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
      modeTournoi: 'Jouer tournoi', modeTournoiDesc: '16 joueurs, trophées et thèmes',
      tTitle: '🏆 Tournoi', tYou: 'Toi',
      tierBronze: 'Bronze', tierSilver: 'Argent', tierGold: 'Or',
      tFree: 'Gratuit', tReq: '🔒 Niveau {n} requis en solo', tPrizes: 'Champion : {c} 🪙',
      tJoin: 'Participer', tResume: '▶ Reprendre le tournoi', tInProgress: 'Tournoi en cours',
      tDaily: '🎁 Ticket du jour', tDailyDone: '✔ Ticket du jour pris',
      tAdTicket: '🎥 Ticket gratuit (pub) {n}/{max}', tBuy: '🪙 Acheter 1 ticket ({n})',
      tNeedTicket: 'Pas assez de tickets', tNeedCoins: 'Pas assez de pièces', tTicketGot: '+1 🎟',
      tTrophies: '🏅 Trophées et thèmes', tBack: '← Retour',
      tRound: 'Tour', tMatch: 'Match', tManche: 'Manche',
      r16: 'Huitièmes', qf: 'Quarts de finale', sf: 'Demi-finales', fin: 'Finale',
      tBracket: 'Tableau du tournoi', tNext: 'Adversaire : {name} {stars}', tPlay: '▶ Jouer le match',
      tGetReady: 'Manche {n} — prépare-toi…',
      tWinSpeed: '✅ Manche gagnée ! {a}s contre {b}s', tWinOppFail: '✅ Manche gagnée ! L’adversaire s’est trompé',
      tLoseSpeed: '❌ Manche perdue : {a}s contre {b}s', tLoseFail: '❌ Manche perdue : tu t’es trompé',
      tDraw: '🤝 Personne ne réussit : on rejoue', tForfeit: '❌ Manche perdue (tu as quitté)',
      tMatchWin: '🎉 Match gagné {a}–{b} !', tAdvance: 'Prochain tour : {round}', tContinue: 'Continuer',
      tChampion: '🏆 Champion !', tPlace3: '🥈 Finaliste', tPlace2: '🥉 Demi-finaliste', tPlace1: 'Quart de finaliste', tPlace0: 'Éliminé au premier tour',
      tRewards: 'Récompenses', tRwCoins: '+{n} 🪙 pièces', tRwTickets: '+{n} 🎟 ticket', tRwLives: '+{n} ❤️ vies (solo)',
      tRwTrophy: '🏅 Trophée {tier}', tRwTheme: '🎨 Thème « {name} » débloqué',
      themeClassic: 'Classique', themeNeon: 'Néon', themeCrystal: 'Cristal', themeGold: 'Or',
      tUse: 'Utiliser', tUsing: '✔ Utilisé', tThemeHint: 'Gagne un tournoi à {n} joueurs en Difficile', r32: 'Seizièmes', tDiff: 'Difficulté', tEasy: 'Facile', tHard: 'Difficile', tDiffHint: 'Difficile : pièces ×2, trophée, thème, ticket', tFmtTitle: 'Tournoi {n} joueurs', tLockedFmt: '🔒 Gagne un tournoi à {n} joueurs', tElim: 'Éliminé : {round}', tEasyNote: 'Mode Difficile : trophée, thème et ticket à gagner', tRwUnlock: '🔓 Tournoi à {n} joueurs débloqué', tStats: '{p} tournois · {w} gagnés'
    },
    en: {
      modeTournoi: 'Play tournament', modeTournoiDesc: '16 players, trophies and themes',
      tTitle: '🏆 Tournament', tYou: 'You',
      tierBronze: 'Bronze', tierSilver: 'Silver', tierGold: 'Gold',
      tFree: 'Free', tReq: '🔒 Level {n} needed in solo', tPrizes: 'Champion: {c} 🪙',
      tJoin: 'Join', tResume: '▶ Resume tournament', tInProgress: 'Tournament in progress',
      tDaily: '🎁 Daily ticket', tDailyDone: '✔ Daily ticket taken',
      tAdTicket: '🎥 Free ticket (ad) {n}/{max}', tBuy: '🪙 Buy 1 ticket ({n})',
      tNeedTicket: 'Not enough tickets', tNeedCoins: 'Not enough coins', tTicketGot: '+1 🎟',
      tTrophies: '🏅 Trophies and themes', tBack: '← Back',
      tRound: 'Round', tMatch: 'Match', tManche: 'Game',
      r16: 'Round of 16', qf: 'Quarter-finals', sf: 'Semi-finals', fin: 'Final',
      tBracket: 'Tournament bracket', tNext: 'Opponent: {name} {stars}', tPlay: '▶ Play match',
      tGetReady: 'Game {n} — get ready…',
      tWinSpeed: '✅ Game won! {a}s vs {b}s', tWinOppFail: '✅ Game won! Your opponent made a mistake',
      tLoseSpeed: '❌ Game lost: {a}s vs {b}s', tLoseFail: '❌ Game lost: you made a mistake',
      tDraw: '🤝 Nobody succeeded: replay', tForfeit: '❌ Game lost (you left)',
      tMatchWin: '🎉 Match won {a}–{b}!', tAdvance: 'Next round: {round}', tContinue: 'Continue',
      tChampion: '🏆 Champion!', tPlace3: '🥈 Runner-up', tPlace2: '🥉 Semi-finalist', tPlace1: 'Quarter-finalist', tPlace0: 'Out in the first round',
      tRewards: 'Rewards', tRwCoins: '+{n} 🪙 coins', tRwTickets: '+{n} 🎟 ticket', tRwLives: '+{n} ❤️ lives (solo)',
      tRwTrophy: '🏅 {tier} trophy', tRwTheme: '🎨 Theme “{name}” unlocked',
      themeClassic: 'Classic', themeNeon: 'Neon', themeCrystal: 'Crystal', themeGold: 'Gold',
      tUse: 'Use', tUsing: '✔ In use', tThemeHint: 'Win a {n}-player tournament on Hard', r32: 'Round of 32', tDiff: 'Difficulty', tEasy: 'Easy', tHard: 'Hard', tDiffHint: 'Hard: coins ×2, trophy, theme, ticket', tFmtTitle: '{n}-player tournament', tLockedFmt: '🔒 Win a {n}-player tournament', tElim: 'Out: {round}', tEasyNote: 'Hard mode: win a trophy, theme and ticket', tRwUnlock: '🔓 {n}-player tournament unlocked', tStats: '{p} tournaments · {w} won'
    },
    es: {
      modeTournoi: 'Jugar torneo', modeTournoiDesc: '16 jugadores, trofeos y temas',
      tTitle: '🏆 Torneo', tYou: 'Tú',
      tierBronze: 'Bronce', tierSilver: 'Plata', tierGold: 'Oro',
      tFree: 'Gratis', tReq: '🔒 Nivel {n} necesario en solo', tPrizes: 'Campeón: {c} 🪙',
      tJoin: 'Participar', tResume: '▶ Reanudar torneo', tInProgress: 'Torneo en curso',
      tDaily: '🎁 Ticket diario', tDailyDone: '✔ Ticket diario recogido',
      tAdTicket: '🎥 Ticket gratis (anuncio) {n}/{max}', tBuy: '🪙 Comprar 1 ticket ({n})',
      tNeedTicket: 'No hay suficientes tickets', tNeedCoins: 'No hay suficientes monedas', tTicketGot: '+1 🎟',
      tTrophies: '🏅 Trofeos y temas', tBack: '← Volver',
      tRound: 'Ronda', tMatch: 'Partido', tManche: 'Manga',
      r16: 'Octavos', qf: 'Cuartos de final', sf: 'Semifinales', fin: 'Final',
      tBracket: 'Cuadro del torneo', tNext: 'Rival: {name} {stars}', tPlay: '▶ Jugar el partido',
      tGetReady: 'Manga {n} — prepárate…',
      tWinSpeed: '✅ ¡Manga ganada! {a}s contra {b}s', tWinOppFail: '✅ ¡Manga ganada! El rival se equivocó',
      tLoseSpeed: '❌ Manga perdida: {a}s contra {b}s', tLoseFail: '❌ Manga perdida: te equivocaste',
      tDraw: '🤝 Nadie acierta: se repite', tForfeit: '❌ Manga perdida (saliste)',
      tMatchWin: '🎉 ¡Partido ganado {a}–{b}!', tAdvance: 'Próxima ronda: {round}', tContinue: 'Continuar',
      tChampion: '🏆 ¡Campeón!', tPlace3: '🥈 Finalista', tPlace2: '🥉 Semifinalista', tPlace1: 'Cuartofinalista', tPlace0: 'Eliminado en la primera ronda',
      tRewards: 'Recompensas', tRwCoins: '+{n} 🪙 monedas', tRwTickets: '+{n} 🎟 ticket', tRwLives: '+{n} ❤️ vidas (solo)',
      tRwTrophy: '🏅 Trofeo {tier}', tRwTheme: '🎨 Tema «{name}» desbloqueado',
      themeClassic: 'Clásico', themeNeon: 'Neón', themeCrystal: 'Cristal', themeGold: 'Oro',
      tUse: 'Usar', tUsing: '✔ En uso', tThemeHint: 'Gana un torneo de {n} jugadores en Difícil', r32: 'Dieciseisavos', tDiff: 'Dificultad', tEasy: 'Fácil', tHard: 'Difícil', tDiffHint: 'Difícil: monedas ×2, trofeo, tema, ticket', tFmtTitle: 'Torneo de {n} jugadores', tLockedFmt: '🔒 Gana un torneo de {n} jugadores', tElim: 'Eliminado: {round}', tEasyNote: 'Modo Difícil: gana trofeo, tema y ticket', tRwUnlock: '🔓 Torneo de {n} jugadores desbloqueado', tStats: '{p} torneos · {w} ganados'
    },
    de: {
      modeTournoi: 'Turnier spielen', modeTournoiDesc: '16 Spieler, Pokale und Designs',
      tTitle: '🏆 Turnier', tYou: 'Du',
      tierBronze: 'Bronze', tierSilver: 'Silber', tierGold: 'Gold',
      tFree: 'Gratis', tReq: '🔒 Level {n} im Solo nötig', tPrizes: 'Sieger: {c} 🪙',
      tJoin: 'Teilnehmen', tResume: '▶ Turnier fortsetzen', tInProgress: 'Turnier läuft',
      tDaily: '🎁 Tagesticket', tDailyDone: '✔ Tagesticket abgeholt',
      tAdTicket: '🎥 Gratis-Ticket (Werbung) {n}/{max}', tBuy: '🪙 1 Ticket kaufen ({n})',
      tNeedTicket: 'Nicht genug Tickets', tNeedCoins: 'Nicht genug Münzen', tTicketGot: '+1 🎟',
      tTrophies: '🏅 Pokale und Designs', tBack: '← Zurück',
      tRound: 'Runde', tMatch: 'Match', tManche: 'Spiel',
      r16: 'Achtelfinale', qf: 'Viertelfinale', sf: 'Halbfinale', fin: 'Finale',
      tBracket: 'Turnierbaum', tNext: 'Gegner: {name} {stars}', tPlay: '▶ Match spielen',
      tGetReady: 'Spiel {n} — mach dich bereit…',
      tWinSpeed: '✅ Spiel gewonnen! {a}s gegen {b}s', tWinOppFail: '✅ Spiel gewonnen! Dein Gegner hat sich geirrt',
      tLoseSpeed: '❌ Spiel verloren: {a}s gegen {b}s', tLoseFail: '❌ Spiel verloren: du hast dich geirrt',
      tDraw: '🤝 Keiner schafft es: Wiederholung', tForfeit: '❌ Spiel verloren (du bist gegangen)',
      tMatchWin: '🎉 Match gewonnen {a}–{b}!', tAdvance: 'Nächste Runde: {round}', tContinue: 'Weiter',
      tChampion: '🏆 Sieger!', tPlace3: '🥈 Finalist', tPlace2: '🥉 Halbfinalist', tPlace1: 'Viertelfinalist', tPlace0: 'In der ersten Runde ausgeschieden',
      tRewards: 'Belohnungen', tRwCoins: '+{n} 🪙 Münzen', tRwTickets: '+{n} 🎟 Ticket', tRwLives: '+{n} ❤️ Leben (Solo)',
      tRwTrophy: '🏅 {tier}-Pokal', tRwTheme: '🎨 Design „{name}“ freigeschaltet',
      themeClassic: 'Klassisch', themeNeon: 'Neon', themeCrystal: 'Kristall', themeGold: 'Gold',
      tUse: 'Benutzen', tUsing: '✔ In Benutzung', tThemeHint: 'Gewinne ein Turnier mit {n} Spielern auf Schwer', r32: 'Sechzehntelfinale', tDiff: 'Schwierigkeit', tEasy: 'Leicht', tHard: 'Schwer', tDiffHint: 'Schwer: Münzen ×2, Pokal, Design, Ticket', tFmtTitle: 'Turnier mit {n} Spielern', tLockedFmt: '🔒 Gewinne ein Turnier mit {n} Spielern', tElim: 'Ausgeschieden: {round}', tEasyNote: 'Schwer-Modus: Pokal, Design und Ticket gewinnen', tRwUnlock: '🔓 Turnier mit {n} Spielern freigeschaltet', tStats: '{p} Turniere · {w} gewonnen'
    },
    ar: {
      modeTournoi: 'لعب بطولة', modeTournoiDesc: '16 لاعبًا، كؤوس وأنماط',
      tTitle: '🏆 البطولة', tYou: 'أنت',
      tierBronze: 'برونزية', tierSilver: 'فضية', tierGold: 'ذهبية',
      tFree: 'مجانًا', tReq: '🔒 يلزم المستوى {n} في اللعب الفردي', tPrizes: 'البطل: {c} 🪙',
      tJoin: 'شارك', tResume: '▶ متابعة البطولة', tInProgress: 'بطولة جارية',
      tDaily: '🎁 تذكرة اليوم', tDailyDone: '✔ تم أخذ تذكرة اليوم',
      tAdTicket: '🎥 تذكرة مجانية (إعلان) {n}/{max}', tBuy: '🪙 شراء تذكرة ({n})',
      tNeedTicket: 'لا تكفي التذاكر', tNeedCoins: 'لا تكفي العملات', tTicketGot: '+1 🎟',
      tTrophies: '🏅 الكؤوس والأنماط', tBack: '← رجوع',
      tRound: 'الدور', tMatch: 'المباراة', tManche: 'الجولة',
      r16: 'دور الـ16', qf: 'ربع النهائي', sf: 'نصف النهائي', fin: 'النهائي',
      tBracket: 'جدول البطولة', tNext: 'الخصم: {name} {stars}', tPlay: '▶ العب المباراة',
      tGetReady: 'الجولة {n} — استعد…',
      tWinSpeed: '✅ فزت بالجولة! {a}ث مقابل {b}ث', tWinOppFail: '✅ فزت بالجولة! أخطأ الخصم',
      tLoseSpeed: '❌ خسرت الجولة: {a}ث مقابل {b}ث', tLoseFail: '❌ خسرت الجولة: أخطأت',
      tDraw: '🤝 لم ينجح أحد: نعيد الجولة', tForfeit: '❌ خسرت الجولة (غادرت)',
      tMatchWin: '🎉 فزت بالمباراة {a}–{b}!', tAdvance: 'الدور التالي: {round}', tContinue: 'متابعة',
      tChampion: '🏆 بطل!', tPlace3: '🥈 وصيف', tPlace2: '🥉 نصف النهائي', tPlace1: 'ربع النهائي', tPlace0: 'خرجت من الدور الأول',
      tRewards: 'المكافآت', tRwCoins: '+{n} 🪙 عملة', tRwTickets: '+{n} 🎟 تذكرة', tRwLives: '+{n} ❤️ أرواح (فردي)',
      tRwTrophy: '🏅 كأس {tier}', tRwTheme: '🎨 تم فتح النمط «{name}»',
      themeClassic: 'كلاسيكي', themeNeon: 'نيون', themeCrystal: 'كريستال', themeGold: 'ذهبي',
      tUse: 'استخدم', tUsing: '✔ مستخدم', tThemeHint: 'اربح بطولة {n} لاعبًا في الوضع الصعب', r32: 'دور الـ32', tDiff: 'الصعوبة', tEasy: 'سهل', tHard: 'صعب', tDiffHint: 'صعب: عملات ×2، كأس، نمط، تذكرة', tFmtTitle: 'بطولة {n} لاعبًا', tLockedFmt: '🔒 اربح بطولة من {n} لاعبًا', tElim: 'خرجت: {round}', tEasyNote: 'الوضع الصعب: اربح كأسًا ونمطًا وتذكرة', tRwUnlock: '🔓 تم فتح بطولة {n} لاعبًا', tStats: '{p} بطولات · {w} فوز'
    }
  });


  /* =======================================================
     02. RÉGLAGES DES TOURNOIS
     3 formats (8 / 16 / 32 joueurs) × 2 difficultés (Facile / Difficile)
     - 8 joueurs : ouvert à tous, gratuit
     - 16 joueurs : se débloque en gagnant un tournoi à 8 (1 ticket)
     - 32 joueurs : se débloque en gagnant un tournoi à 16 (2 tickets)
     prizes : pièces selon la place → [éliminé au 1er match, … , finaliste, champion]
  ======================================================= */

  const FORMATS = [
    { size: 8,  stages: 3, cost: 0, icon: '🥉', trophy: 'bronze', theme: 'neon',    bg: 'ville2.png', boost: 0,    prizes: [5, 10, 20, 45],              hardTickets: 1, hardLives: 0 },
    { size: 16, stages: 4, cost: 1, icon: '🥈', trophy: 'silver', theme: 'crystal', bg: 'ville7.png', boost: 0.02, prizes: [8, 15, 30, 60, 120],        hardTickets: 1, hardLives: 2 },
    { size: 32, stages: 5, cost: 2, icon: '🥇', trophy: 'gold',   theme: 'gold',    bg: 'ville8.png', boost: 0.04, prizes: [12, 20, 40, 80, 150, 300],  hardTickets: 2, hardLives: 3 }
  ];
  /* mean : niveau moyen des IA · pace : lenteur de réponse (ms par couleur) · base : longueur des 1res séquences
     tfac : temps accordé par couleur · mult : multiplicateur des pièces */
  const DIFFS = [
    { id: 'easy', mean: 0.52, sd: 0.08, pace: 900, base: 2, tfac: 1.7, mult: 1, rich: false },
    { id: 'hard', mean: 0.80, sd: 0.06, pace: 650, base: 3, tfac: 1.2, mult: 2, rich: true }
  ];
  const STAGE_KEYS = ['r32', 'r16', 'qf', 'sf', 'fin'];
  const stageKey = function (F, st) { return STAGE_KEYS[5 - F.stages + st]; };
  const COLORS = ['red', 'green', 'blue', 'yellow'];
  const MAX_GAMES = 8;           // manches max par match (les manches nulles sont rejouées)

  const TICKET_PRICE = 200;      // pièces
  const ADS_PER_DAY = 3;
  const PAUSE_READY = 1400;      // ms avant chaque manche
  const PAUSE_RESULT = 2400;     // ms après chaque manche

  const NAMES = [
    'Ayo', 'Kofi', 'Awa', 'Moussa', 'Fatou', 'Yann', 'Léa', 'Ibrahim', 'Mariam', 'Koffi', 'Adjoua', 'Sékou',
    'Nadia', 'Karim', 'Samir', 'Leila', 'Tom', 'Lucas', 'Emma', 'Hugo', 'Mia', 'Noah', 'Sofia', 'Diego',
    'Lena', 'Jonas', 'Amina', 'Omar', 'Zoé', 'Kevin', 'Aïcha', 'Yao', 'Binta', 'Tariq', 'Ines', 'Marco',
    'Nora', 'Ali', 'Eva', 'Paul'
  ];


  /* =======================================================
     03. IA ET TABLEAU (calcul déterministe à partir de la graine)
  ======================================================= */

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
  function shuffle(arr, rng) {
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const x = arr[i]; arr[i] = arr[j]; arr[j] = x; }
    return arr;
  }

  /* longueur selon le tour et le nombre de manches DÉJÀ décidées (une manche nulle garde la même longueur) */
  function lenFor(D, stage, decided) { return Math.min(12, D.base + stage + decided); }
  function timeLimitFor(D, L) { return Math.ceil(2 + L * D.tfac); }

  function makeSeq(seed, stage, g, L) {
    const rng = mulberry32(mix(seed, stage * 10 + g + 1, 11));
    const seq = [];
    for (let i = 0; i < L; i++) seq.push(COLORS[Math.floor(rng() * 4)]);
    return seq;
  }

  function aiAttempt(ai, L, rng) {
    const p = clamp(ai.skill - 0.045 * (L - 3), 0.05, 0.985);
    const ok = rng() < p;
    const jitter = 0.85 + 0.3 * rng();
    if (ok) return { ok: true, f: L, ms: Math.round(400 + L * ai.pace * jitter) };
    const f = Math.floor(rng() * L);
    return { ok: false, f: f, ms: Math.round(400 + (f + 1) * ai.pace * jitter) };
  }

  /* 1 si A gagne la manche, -1 si B, 0 si égalité (personne ne réussit) */
  function cmp(a, b) {
    if (a.ok && b.ok) return a.ms < b.ms ? 1 : a.ms > b.ms ? -1 : 0;
    if (a.ok) return 1;
    if (b.ok) return -1;
    return 0;
  }

  /* match entre deux IA : les manches nulles sont rejouées, donc jamais de 1-1 */
  function simMatch(D, seed, stage, idx, a, b) {
    const rng = mulberry32(mix(seed, stage * 100 + idx + 1, 77));
    let sa = 0, sb = 0;
    for (let g = 0; g < MAX_GAMES && sa < 2 && sb < 2; g++) {
      const L = lenFor(D, stage, sa + sb);
      const r = cmp(aiAttempt(a, L, rng), aiAttempt(b, L, rng));
      if (r > 0) sa++; else if (r < 0) sb++;
    }
    if (sa === sb) { if (a.skill >= b.skill) sa = 2; else sb = 2; }
    return { sa: sa, sb: sb, winner: sa > sb ? a : b };
  }

  /* les places du tableau, calculées depuis la graine */
  function genField(fi, di, seed, ad) {
    const F = FORMATS[fi], D = DIFFS[di], N = F.size, half = N / 2;
    const rng = mulberry32(seed);
    const slot = Math.floor(rng() * N);
    const names = shuffle(NAMES.slice(), rng).slice(0, N - 1);
    const ais = names.map(function (name, i) {
      return { id: i, name: name, skill: clamp(D.mean + F.boost + ad / 1000 + D.sd * gauss(rng), 0.3, 0.97), pace: D.pace * (0.8 + 0.4 * rng()) };
    });
    const sorted = ais.slice().sort(function (x, y) { return y.skill - x.skill; });

    const slots = new Array(N).fill(null);
    slots[slot] = { id: 'P', name: '', isPlayer: true };

    /* le plus fort va dans l'AUTRE moitié du tableau : on le retrouve en finale */
    const strongest = sorted[0];
    slots[(slot < half ? half : 0) + Math.floor(rng() * half)] = strongest;

    /* premier adversaire : un des plus faibles */
    const weak = sorted.slice(-Math.max(2, Math.floor(ais.length / 3))).filter(function (x) { return x !== strongest; });
    const first = weak[Math.floor(rng() * weak.length)];
    slots[slot ^ 1] = first;

    const rest = shuffle(ais.filter(function (x) { return x !== strongest && x !== first; }), rng);
    for (let i = 0; i < N; i++) if (!slots[i]) slots[i] = rest.pop();
    return { slot: slot, slots: slots };
  }

  /* calcule tous les tours déjà joués + simulés. loss = défaite du joueur {pw, ow} (facultatif) */
  function computeRounds(cur, loss) {
    const F = FORMATS[cur.fmt], D = DIFFS[cur.diff];
    const field = genField(cur.fmt, cur.diff, cur.seed, cur.ad);
    const outcomes = cur.hist.map(function (x) { return { pw: x.pw, ow: x.ow, win: true }; });
    if (loss) outcomes.push({ pw: loss.pw, ow: loss.ow, win: false });

    let entrants = field.slots.slice();
    const rounds = [];
    for (let st = 0; st < F.stages; st++) {
      const matches = [], next = [];
      let pendingMatch = false;
      for (let i = 0; i < entrants.length; i += 2) {
        const a = entrants[i], b = entrants[i + 1];
        const isP = !!(a.isPlayer || b.isPlayer);
        const m = { a: a, b: b, sa: null, sb: null, winner: null, isPlayer: isP, done: false };
        if (isP) {
          const o = outcomes[st];
          if (o) {
            const pIsA = !!a.isPlayer;
            m.sa = pIsA ? o.pw : o.ow; m.sb = pIsA ? o.ow : o.pw;
            m.winner = o.win ? (pIsA ? a : b) : (pIsA ? b : a);
            m.done = true;
          } else pendingMatch = true;
        } else {
          const r = simMatch(D, cur.seed, st, i / 2, a, b);
          m.sa = r.sa; m.sb = r.sb; m.winner = r.winner; m.done = true;
        }
        matches.push(m); next.push(m.winner);
      }
      rounds.push({ stage: st, matches: matches });
      if (pendingMatch) break;
      entrants = next;
    }
    return { slot: field.slot, rounds: rounds };
  }

  function pendingPlayerMatch(br) {
    const last = br.rounds[br.rounds.length - 1];
    return last.matches.filter(function (m) { return m.isPlayer && !m.done; })[0] || null;
  }

  function stars(skill) {
    const n = clamp(Math.round((skill - 0.3) / 0.67 * 4) + 1, 1, 5);
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  }

  function randomSeed() {
    try { return crypto.getRandomValues(new Uint32Array(1))[0]; } catch (e) { return Math.floor(Math.random() * 4294967296) >>> 0; }
  }


  /* =======================================================
     04. DONNÉES SAUVEGARDÉES
  ======================================================= */

  function defaults() {
    return { played: 0, won: 0, finals: 0, lastDaily: '', adsDay: '', adsN: 0, adapt: 0, unlock: 0, diff: 0, current: null };
  }

  function isInt(n, a, b) { return Number.isInteger(n) && n >= a && n <= b; }

  function validCurrent(c) {
    if (c === null) return true;
    if (!c || typeof c !== 'object') return false;
    if (!isInt(c.fmt, 0, FORMATS.length - 1) || !isInt(c.diff, 0, DIFFS.length - 1)) return false;
    if (!isInt(c.seed, 0, 4294967295) || !isInt(c.ad, -60, 60)) return false;
    if (!Array.isArray(c.hist) || c.hist.length > FORMATS[c.fmt].stages - 1) return false;
    for (const x of c.hist) {
      if (!x || !isInt(x.pw, 0, 2) || !isInt(x.ow, 0, 2) || x.pw < x.ow) return false;
    }
    if (c.match !== null) {
      const m = c.match;
      if (!m || !isInt(m.pw, 0, 1) || !isInt(m.ow, 0, 1) || !isInt(m.g, 0, MAX_GAMES) || typeof m.pending !== 'boolean') return false;
    }
    return true;
  }

  function sanitize(d) {
    if (!d || typeof d !== 'object') return null;
    /* anciennes sauvegardes : les champs manquants prennent leur valeur de départ, un ancien tournoi en cours est abandonné */
    const o = Object.assign(defaults(), d);
    if (o.current && o.current.fmt === undefined) o.current = null;
    if (!isInt(o.played, 0, 1e6) || !isInt(o.won, 0, 1e6) || !isInt(o.finals, 0, 1e6) || !isInt(o.adsN, 0, 99) || !isInt(o.adapt, -60, 60)) return null;
    if (!isInt(o.unlock, 0, FORMATS.length - 1) || !isInt(o.diff, 0, DIFFS.length - 1)) return null;
    if (typeof o.lastDaily !== 'string' || typeof o.adsDay !== 'string' || o.lastDaily.length > 12 || o.adsDay.length > 12) return null;
    if (!validCurrent(o.current)) return null;
    const c = o.current ? {
      fmt: o.current.fmt, diff: o.current.diff, seed: o.current.seed, ad: o.current.ad,
      hist: o.current.hist.map(function (x) { return { pw: x.pw, ow: x.ow }; }),
      match: o.current.match ? { pw: o.current.match.pw, ow: o.current.match.ow, g: o.current.match.g, pending: o.current.match.pending } : null
    } : null;
    return { played: o.played, won: o.won, finals: o.finals, lastDaily: o.lastDaily, adsDay: o.adsDay, adsN: o.adsN, adapt: o.adapt, unlock: o.unlock, diff: o.diff, current: c };
  }

  const S = function () { return api.store.get(); };
  const cap = function (id) { return id.charAt(0).toUpperCase() + id.slice(1); };
  const trophyName = function (id) { return t('tier' + cap(id)); };
  const themeName = function (id) { return t('theme' + cap(id)); };
  const displayName = function (e) { return e.isPlayer ? t('tYou') : e.name; };


  /* =======================================================
     05. FENÊTRES : lobby, tableau, résultat de match, fin, trophées
  ======================================================= */

  let ov = null;
  let view = 'lobby';
  let viewData = null;
  let busy = false;

  function btn(label, cls, fn, disabled) {
    const b = h('button', cls || '', label);
    b.type = 'button';
    if (disabled) b.disabled = true;
    b.addEventListener('click', function () { if (!b.disabled) fn(); });
    return b;
  }

  function chips() {
    const w = api.wallet.get();
    return h('div', 'chips', '', [
      h('span', 'chip', '🪙 ' + w.coins), h('span', 'chip', '🎟 ' + w.tickets),
      h('span', 'chip', '🏅 ' + (w.trophies.bronze + w.trophies.silver + w.trophies.gold))
    ]);
  }

  function go(v, data) { view = v; viewData = data || null; render(); ov.open(); }

  function render() {
    if (!ov) return;
    ov.sheet.textContent = '';
    if (view === 'lobby') renderLobby();
    else if (view === 'bracket') renderBracket();
    else if (view === 'matchWin') renderMatchWin();
    else if (view === 'end') renderEnd();
    else if (view === 'trophies') renderTrophies();
  }

  /* ----- lobby ----- */
  function champCoins(F, D) { return F.prizes[F.stages] * D.mult; }

  function renderLobby() {
    const s = S(), w = api.wallet.get(), sheet = ov.sheet;
    const D = DIFFS[s.diff];

    sheet.appendChild(h('h2', 'sheet-title', t('tTitle')));
    sheet.appendChild(chips());

    if (s.current) {
      const F = FORMATS[s.current.fmt];
      const card = h('div', 'banner-card', '', [h('b', '', F.icon + ' ' + t('tInProgress') + ' — ' + t('tFmtTitle', { n: F.size }) + ' · ' + t(DIFFS[s.current.diff].id === 'hard' ? 'tHard' : 'tEasy'))]);
      card.appendChild(btn(t('tResume'), 'btn-main', function () { go('bracket'); }));
      sheet.appendChild(card);
    }

    /* tickets */
    const day = api.today();
    const dailyOk = s.lastDaily !== day;
    const adsLeft = Math.max(0, ADS_PER_DAY - (s.adsDay === day ? s.adsN : 0));
    sheet.appendChild(h('div', 'ticket-row', '', [
      btn(dailyOk ? t('tDaily') : t('tDailyDone'), 'btn-soft', claimDaily, !dailyOk),
      btn(t('tAdTicket', { n: ADS_PER_DAY - adsLeft, max: ADS_PER_DAY }), 'btn-soft', adTicket, adsLeft === 0 || busy),
      btn(t('tBuy', { n: TICKET_PRICE }), 'btn-soft', buyTicket, w.coins < TICKET_PRICE)
    ]));

    /* difficulté */
    sheet.appendChild(h('div', 'diff-row', '', [
      h('b', '', t('tDiff')),
      btn(t('tEasy'), s.diff === 0 ? 'btn-ok' : 'btn-soft', function () { setDiff(0); }),
      btn(t('tHard'), s.diff === 1 ? 'btn-ok' : 'btn-soft', function () { setDiff(1); })
    ]));
    sheet.appendChild(h('small', 'stats-line', t('tDiffHint')));

    /* formats */
    FORMATS.forEach(function (F, i) {
      const locked = i > s.unlock;
      const card = h('div', 'tier-card' + (locked ? ' locked' : ''));
      card.appendChild(h('div', 'tier-head', '', [
        h('b', '', F.icon + ' ' + t('tFmtTitle', { n: F.size })),
        h('span', 'tier-cost', F.cost === 0 ? t('tFree') : '🎟 ' + F.cost)
      ]));
      let info;
      if (locked) info = t('tLockedFmt', { n: FORMATS[i - 1].size });
      else info = t('tPrizes', { c: champCoins(F, D) }) + (D.rich ? ' · 🏅 · 🎨 ' + themeName(F.theme) : '');
      card.appendChild(h('small', 'tier-info', info));
      card.appendChild(btn(t('tJoin'), 'btn-main', function () { join(i); }, locked || !!s.current));
      sheet.appendChild(card);
    });

    sheet.appendChild(h('small', 'stats-line', t('tStats', { p: s.played, w: s.won })));

    sheet.appendChild(h('div', 'sheet-foot', '', [
      btn(t('tTrophies'), 'btn-soft', function () { go('trophies'); }),
      btn(t('modes'), 'btn-soft', function () { ov.close(); api.menu(); })
    ]));
  }

  function setDiff(i) {
    const s = S();
    if (s.diff === i) return;
    api.batch(function () { s.diff = i; api.store.save(); });
    api.sound('click');
    render();
  }

  function claimDaily() {
    const s = S(), day = api.today();
    if (s.lastDaily === day) return;
    api.batch(function () { s.lastDaily = day; api.wallet.add('tickets', 1); api.store.save(); });
    api.sound('win'); api.toast('tTicketGot'); render();
  }

  async function adTicket() {
    if (busy) return;
    const s = S(), day = api.today();
    if (s.adsDay !== day) { s.adsDay = day; s.adsN = 0; }
    if (s.adsN >= ADS_PER_DAY) return;
    busy = true; render();
    let ok = false;
    try { ok = await api.ads.showRewarded(); } catch (e) { ok = false; }
    busy = false;
    if (ok) {
      api.batch(function () { s.adsDay = day; s.adsN++; api.wallet.add('tickets', 1); api.store.save(); });
      api.sound('win'); api.toast('tTicketGot');
    } else api.toast('adFail');
    render();
  }

  function buyTicket() {
    if (api.wallet.get().coins < TICKET_PRICE) { api.toast('tNeedCoins'); return; }
    api.batch(function () { api.wallet.spend('coins', TICKET_PRICE); api.wallet.add('tickets', 1); });
    api.sound('click'); render();
  }

  function join(i) {
    const F = FORMATS[i], s = S(), w = api.wallet.get();
    if (s.current) return;
    if (i > s.unlock) { api.toast('tLockedFmt', { n: FORMATS[i - 1].size }); return; }
    if (w.tickets < F.cost) { api.sound('fail'); api.toast('tNeedTicket'); return; }
    api.batch(function () {
      if (F.cost > 0) api.wallet.spend('tickets', F.cost);
      s.current = { fmt: i, diff: s.diff, seed: randomSeed(), ad: s.adapt, hist: [], match: null };
      api.store.save();
    });
    api.sound('click');
    go('bracket');
  }

  /* ----- tableau ----- */
  function matchLine(m) {
    const done = m.done;
    const nameA = h('span', 'mn' + (done && m.winner === m.a ? ' win' : '') + (m.a.isPlayer ? ' me' : ''), displayName(m.a));
    const nameB = h('span', 'mn' + (done && m.winner === m.b ? ' win' : '') + (m.b.isPlayer ? ' me' : ''), displayName(m.b));
    const score = h('span', 'ms', done ? m.sa + '–' + m.sb : 'vs');
    return h('div', 'mline' + (m.isPlayer ? ' mine' : ''), '', [nameA, score, nameB]);
  }

  function bracketBlock(br, F) {
    const box = h('div', 'bracket');
    br.rounds.forEach(function (r) {
      box.appendChild(h('div', 'round-title', t(stageKey(F, r.stage))));
      r.matches.forEach(function (m) { box.appendChild(matchLine(m)); });
    });
    setTimeout(function () { box.scrollTop = box.scrollHeight; }, 0);
    return box;
  }

  function renderBracket() {
    const s = S(), sheet = ov.sheet, cur = s.current;
    if (!cur) { go('lobby'); return; }
    const F = FORMATS[cur.fmt];
    const br = computeRounds(cur);
    const pm = pendingPlayerMatch(br);

    sheet.appendChild(h('h2', 'sheet-title', F.icon + ' ' + t('tFmtTitle', { n: F.size })));
    sheet.appendChild(h('small', 'stats-line', t(DIFFS[cur.diff].id === 'hard' ? 'tHard' : 'tEasy')));
    if (pm) {
      const opp = pm.a.isPlayer ? pm.b : pm.a;
      sheet.appendChild(h('div', 'next-box', '', [
        h('b', '', t(stageKey(F, cur.hist.length))),
        h('span', '', t('tNext', { name: opp.name, stars: stars(opp.skill) }))
      ]));
    }
    sheet.appendChild(bracketBlock(br, F));
    sheet.appendChild(h('div', 'sheet-foot', '', [
      btn(t('tBack'), 'btn-soft', function () { go('lobby'); }),
      pm ? btn(t('tPlay'), 'btn-main', playMatch) : null
    ]));
  }

  /* ----- victoire de match ----- */
  function renderMatchWin() {
    const d = viewData, sheet = ov.sheet, F = FORMATS[d.fmt];
    sheet.appendChild(h('h2', 'sheet-title', t('tMatchWin', { a: d.pw, b: d.ow })));
    sheet.appendChild(h('p', 'sheet-text', t('tAdvance', { round: t(stageKey(F, d.nextStage)) })));
    sheet.appendChild(h('div', 'sheet-foot', '', [btn(t('tContinue'), 'btn-main', function () { go('bracket'); })]));
  }

  /* ----- fin de tournoi ----- */
  function renderEnd() {
    const d = viewData, sheet = ov.sheet, F = FORMATS[d.fmt];
    const title = d.place === F.stages ? t('tChampion')
      : d.place === F.stages - 1 ? t('tPlace3')
      : t('tElim', { round: t(stageKey(F, d.place)) });
    sheet.appendChild(h('h2', 'sheet-title', title));
    sheet.appendChild(h('div', 'rewards', '', [h('b', '', t('tRewards'))].concat(d.rewards.map(function (r) {
      return h('div', 'reward', t(r.key, r.vars));
    }))));
    if (d.place === F.stages && d.diff === 0) sheet.appendChild(h('small', 'stats-line', t('tEasyNote')));
    sheet.appendChild(bracketBlock(d.br, F));
    sheet.appendChild(h('div', 'sheet-foot', '', [btn(t('tContinue'), 'btn-main', function () { go('lobby'); })]));
  }

  /* ----- trophées et thèmes ----- */
  function renderTrophies() {
    const w = api.wallet.get(), sheet = ov.sheet;
    sheet.appendChild(h('h2', 'sheet-title', t('tTrophies')));
    sheet.appendChild(h('div', 'trophy-row', '', FORMATS.map(function (F) {
      return h('div', 'trophy', '', [h('span', 'trophy-icon', F.icon), h('b', '', '× ' + w.trophies[F.trophy]), h('small', '', trophyName(F.trophy))]);
    })));

    const list = h('div', 'theme-list');
    ['classic', 'neon', 'crystal', 'gold'].forEach(function (id) {
      const owned = w.themes.indexOf(id) !== -1;
      const F = FORMATS.filter(function (x) { return x.theme === id; })[0];
      const row = h('div', 'theme-row theme-' + id + (w.theme === id ? ' using' : ''));
      row.appendChild(h('div', 'theme-swatch', '', COLORS.map(function (c) { return h('i', c); })));
      row.appendChild(h('b', '', themeName(id)));
      if (owned) {
        row.appendChild(btn(w.theme === id ? t('tUsing') : t('tUse'), w.theme === id ? 'btn-ok' : 'btn-soft', function () { api.wallet.setTheme(id); api.sound('click'); render(); }, w.theme === id));
      } else {
        row.appendChild(h('small', 'theme-hint', '🔒 ' + t('tThemeHint', { n: F.size })));
      }
      list.appendChild(row);
    });
    sheet.appendChild(list);
    sheet.appendChild(h('div', 'sheet-foot', '', [btn(t('tBack'), 'btn-soft', function () { go('lobby'); })]));
  }


  /* =======================================================
     06. MATCH : manches, barre de l'adversaire
  ======================================================= */

  let inMatch = false;
  let matchGen = 0;
  let duel = null;        // éléments de la barre
  let barGen = 0;

  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function ensureDuel() {
    if (duel) return;
    const root = h('div', 'duel hidden');
    root.id = 'duelBar';
    const name = h('span', 'duel-name');
    const fill = h('i');
    const track = h('div', 'duel-track', '', [fill]);
    root.appendChild(h('div', 'duel-row', '', [name, track]));
    ui.el('timer').insertAdjacentElement('afterend', root);
    duel = { root: root, name: name, fill: fill };
  }

  function showDuel(opp) {
    ensureDuel();
    duel.name.textContent = '🤖 ' + opp.name + '  ' + stars(opp.skill);
    resetBar();
    duel.root.classList.remove('hidden');
  }
  function hideDuel() { if (duel) duel.root.classList.add('hidden'); }

  function resetBar() {
    barGen++;
    duel.fill.style.transition = 'none';
    duel.fill.style.width = '0%';
    duel.fill.classList.remove('fail');
    void duel.fill.offsetWidth;
  }
  /* la barre montre l'IA qui « joue » en même temps que toi */
  function runBar(ai, L) {
    const my = ++barGen;
    duel.fill.style.transition = 'width ' + ai.ms + 'ms linear';
    duel.fill.style.width = ((ai.ok ? 1 : ai.f / L) * 100) + '%';
    if (!ai.ok) setTimeout(function () { if (my === barGen) duel.fill.classList.add('fail'); }, ai.ms);
  }
  function settleBar(ai, L) {
    barGen++;
    duel.fill.style.transition = 'none';
    duel.fill.style.width = ((ai.ok ? 1 : ai.f / L) * 100) + '%';
    duel.fill.classList.toggle('fail', !ai.ok);
  }

  function hud(m, stage, F) {
    ui.stats([[t('tRound'), (stage + 1) + '/' + F.stages], [t('tMatch'), m.pw + '–' + m.ow], [t('tManche'), String(m.pw + m.ow + 1)]]);
  }

  async function playMatch() {
    if (inMatch) return;
    const s = S(), cur = s.current;
    if (!cur) return;
    const F = FORMATS[cur.fmt], D = DIFFS[cur.diff];
    const pm = pendingPlayerMatch(computeRounds(cur));
    if (!pm) return;
    const opp = pm.a.isPlayer ? pm.b : pm.a;
    const stage = cur.hist.length;

    inMatch = true;
    const myGen = ++matchGen;
    const alive = function () { return inMatch && myGen === matchGen; };

    ov.close();
    ui.start(false); ui.ad(false);
    ui.background(F.bg);
    showDuel(opp);

    let m = cur.match;
    if (!m) m = cur.match = { pw: 0, ow: 0, g: 0, pending: false };
    if (m.pending) { m.ow++; m.g++; m.pending = false; api.store.save(); }   // page rechargée en pleine manche = manche perdue

    while (m.pw < 2 && m.ow < 2 && m.g < MAX_GAMES && alive()) {
      hud(m, stage, F);
      ui.board('grid');
      resetBar();
      ui.setMsg('tGetReady', { n: m.pw + m.ow + 1 });
      await wait(PAUSE_READY);
      if (!alive()) break;

      const L = lenFor(D, stage, m.pw + m.ow);
      const ai = aiAttempt(opp, L, mulberry32(mix(cur.seed, stage * 10 + m.g + 1, 33)));
      m.pending = true; api.store.save();

      const res = await engine.run({
        sequence: makeSeq(cur.seed, stage, m.g, L),
        timeLimit: timeLimitFor(D, L),
        onAnswerStart: function () { runBar(ai, L); }
      });

      if (!alive()) {                              // le joueur a quitté : manche perdue
        if (m.pending) { m.ow++; m.g++; m.pending = false; api.store.save(); }
        break;
      }

      m.pending = false;
      let outcome, key, vars = null;
      if (res.reason === 'interrupted' || res.reason === 'cancelled') {
        outcome = -1; key = 'tForfeit';
      } else {
        outcome = cmp({ ok: res.ok, ms: res.ms }, ai);
        const a = (res.ms / 1000).toFixed(1), b = (ai.ms / 1000).toFixed(1);
        if (outcome > 0) { key = ai.ok ? 'tWinSpeed' : 'tWinOppFail'; vars = { a: a, b: b }; }
        else if (outcome < 0) { key = res.ok ? 'tLoseSpeed' : 'tLoseFail'; vars = { a: a, b: b }; }
        else key = 'tDraw';
      }
      if (outcome > 0) m.pw++; else if (outcome < 0) m.ow++;
      m.g++;
      api.store.save();

      settleBar(ai, L);
      api.sound(outcome > 0 ? 'win' : outcome < 0 ? 'fail' : 'click');
      ui.setMsg(key, vars);
      hud(m, stage, F);
      await wait(PAUSE_RESULT);
    }

    if (!alive()) return;
    inMatch = false;

    const won = m.pw >= m.ow;                       // si trop de manches nulles : avantage au joueur
    const result = { pw: m.pw, ow: m.ow };
    hideDuel();
    ui.board('grid');

    if (won) {
      cur.hist.push(result);
      cur.match = null;
      api.store.save();
      if (cur.hist.length >= F.stages) finishTournament(F.stages, null);
      else go('matchWin', { pw: result.pw, ow: result.ow, nextStage: cur.hist.length, fmt: cur.fmt });
    } else {
      finishTournament(stage, result);
    }
  }


  /* =======================================================
     07. FIN DE TOURNOI ET RÉCOMPENSES
     place : 0 = éliminé au 1er match … stages-1 = finaliste, stages = champion
     Facile  : pièces. Difficile : pièces ×2, et pour le champion trophée, thème, ticket, vies.
     Gagner un tournoi (peu importe la difficulté) débloque le format suivant.
  ======================================================= */

  function finishTournament(place, loss) {
    const s = S(), cur = s.current;
    const F = FORMATS[cur.fmt], D = DIFFS[cur.diff];
    const br = computeRounds(cur, loss);
    const champion = place === F.stages;
    const rewards = [];
    const coins = F.prizes[place] * D.mult;

    api.batch(function () {
      api.wallet.add('coins', coins);
      rewards.push({ key: 'tRwCoins', vars: { n: coins } });

      if (champion) {
        if (D.rich) {
          if (F.hardTickets) { api.wallet.add('tickets', F.hardTickets); rewards.push({ key: 'tRwTickets', vars: { n: F.hardTickets } }); }
          if (F.hardLives) { api.wallet.add('lives', F.hardLives); rewards.push({ key: 'tRwLives', vars: { n: F.hardLives } }); }
          api.wallet.addTrophy(F.trophy);
          rewards.push({ key: 'tRwTrophy', vars: { tier: trophyName(F.trophy) } });
          if (api.wallet.get().themes.indexOf(F.theme) === -1) {
            api.wallet.unlockTheme(F.theme);
            rewards.push({ key: 'tRwTheme', vars: { name: themeName(F.theme) } });
          }
        }
        if (cur.fmt + 1 > s.unlock && cur.fmt + 1 < FORMATS.length) {
          s.unlock = cur.fmt + 1;
          rewards.push({ key: 'tRwUnlock', vars: { n: FORMATS[s.unlock].size } });
        }
        s.won++;
      }
      if (place >= F.stages - 1) s.finals++;
      s.played++;
      /* les IA s'adaptent doucement : plus fortes si tu gagnes, plus faibles si tu sors tôt */
      s.adapt = clamp(s.adapt + (champion ? 20 : place === 0 ? -20 : 0), -60, 60);
      s.current = null;
      api.store.save();
    });

    api.sound(champion ? 'win' : 'click');
    go('end', { place: place, rewards: rewards, br: br, fmt: cur.fmt, diff: cur.diff });
  }


  /* =======================================================
     08. INTERFACE DU MODE
  ======================================================= */

  return {
    icon: '🏆', order: 20, titleKey: 'modeTournoi', descKey: 'modeTournoiDesc',
    defaults: defaults, sanitize: sanitize,

    enter: function () {
      if (!ov) ov = ui.overlay('tournoiSheet', { closable: false });
      ui.start(false); ui.ad(false);
      ui.board('grid');
      ui.background('ville5.png');
      ui.setMsgText('');
      ui.stats([[t('tMatch'), '–'], [t('tManche'), '–'], ['', '']]);
      inMatch = false;
      go('lobby');
    },

    leave: function () {
      inMatch = false; matchGen++; barGen++;
      hideDuel();
      if (ov) ov.close();
    },

    confirmLeave: function () { return (inMatch && engine.busy()) ? 'leaveConfirm' : null; },

    refresh: function () { if (ov && ov.isOpen()) render(); }
  };
});
