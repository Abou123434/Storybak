/* =========================================================
   STORYBAK — MODE TOURNOI (16 JOUEURS)
   Élimination directe : huitièmes, quarts, demies, finale.
   - Un ticket est dépensé au lancement (on en gagne en Solo).
   - À chaque match, toi et ton adversaire recevez la même séquence.
     Tu gagnes si tu la reproduis sans erreur ET plus vite que lui
     (ou s’il se trompe). Une erreur = éliminé.
   - Les autres matchs du tableau sont simulés.
   Le tableau est dessiné en HTML/CSS, sans image externe.
========================================================= */

(function () {
  'use strict';

  window.SBModes = window.SBModes || [];

  const STYLE_ID = 'storybak-tournament-style';
  const SCREEN_ID = 'storybakTournament';
  const SAVE_KEY = 'storybak_tour_v1';

  const PLAYERS = [
    { name: 'TOI', avatar: '👑' },
    { name: 'NOVA', avatar: '🦊' },
    { name: 'KAYRO', avatar: '🐺' },
    { name: 'ZENO', avatar: '🦁' },
    { name: 'MIRA', avatar: '🐯' },
    { name: 'AKIRA', avatar: '🐼' },
    { name: 'SORA', avatar: '🦅' },
    { name: 'RYU', avatar: '🐉' },
    { name: 'KAEL', avatar: '🦈' },
    { name: 'NEX', avatar: '🐻' },
    { name: 'AYO', avatar: '🦝' },
    { name: 'LIO', avatar: '🐸' },
    { name: 'ZACK', avatar: '🦄' },
    { name: 'ORION', avatar: '🐙' },
    { name: 'YUKI', avatar: '🐨' },
    { name: 'BLAZE', avatar: '🐲' }
  ];

  const SEQ_LEN = [3, 5, 7, 9];            // longueur de la séquence par tour
  const BOT_SUCCESS = [0.92, 0.84, 0.76, 0.68]; // chance qu’un adversaire réussisse
  const ROUND_KEYS = ['rndR16', 'rndQF', 'rndSF', 'rndFinal'];

  /* ------------------------------------------------------- */
  /* STYLES                                                  */
  /* ------------------------------------------------------- */

  function addStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;

    style.textContent = `
      body[data-screen="tour"] #${SCREEN_ID} { display: block; }

      #${SCREEN_ID} {
        display: none;
        width: min(1200px,100%);
        margin: 0 auto;
        padding: 14px 10px 28px;
        color: #edf6ff;
        box-sizing: border-box;
      }
      #${SCREEN_ID} * { box-sizing: border-box; }
      #${SCREEN_ID} button { font: inherit; cursor: pointer; }

      #${SCREEN_ID} .sb-tour-shell {
        position: relative;
        overflow: hidden;
        padding: 18px 14px 22px;
        border: 1px solid rgba(91,169,255,.48);
        border-radius: 22px;
        background: linear-gradient(145deg,rgba(12,22,58,.96),rgba(5,8,25,.97));
        box-shadow: 0 0 32px rgba(36,111,255,.17);
      }

      #${SCREEN_ID} .sb-tour-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }
      #${SCREEN_ID} .sb-tour-back {
        padding: 9px 12px;
        color: #eaf4ff;
        background: rgba(255,255,255,.08);
        border: 1px solid rgba(255,255,255,.18);
        border-radius: 11px;
        font-size: .82rem;
      }
      #${SCREEN_ID} .sb-tour-ticket {
        padding: 8px 11px;
        color: #ffe08a;
        border: 1px solid rgba(255,205,91,.35);
        border-radius: 10px;
        background: rgba(255,190,60,.08);
        font-size: .78rem;
        font-weight: 800;
      }

      #${SCREEN_ID} .sb-tour-heading { text-align: center; margin: 8px 0 12px; }
      #${SCREEN_ID} .sb-tour-emblem {
        display: inline-grid;
        place-items: center;
        width: 58px;
        height: 58px;
        margin-bottom: 8px;
        border-radius: 18px;
        font-size: 2rem;
        border: 1px solid rgba(101,211,255,.65);
        background: radial-gradient(circle,rgba(48,143,255,.32),rgba(13,23,65,.9));
        box-shadow: 0 0 24px rgba(51,171,255,.35);
      }
      #${SCREEN_ID} h1 {
        margin: 0;
        font-size: clamp(1.45rem,5vw,2.1rem);
        letter-spacing: 2px;
        font-weight: 900;
        text-shadow: 0 0 18px rgba(82,167,255,.55);
      }
      #${SCREEN_ID} .sb-tour-sub {
        margin: 5px 0 0;
        color: #8da9d9;
        font-size: .72rem;
        font-weight: 800;
        letter-spacing: 4px;
      }

      #${SCREEN_ID} .sb-tour-stats {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 7px;
        margin: 12px 0 8px;
      }
      #${SCREEN_ID} .sb-tour-stat {
        padding: 7px 10px;
        color: #c7d8f6;
        border: 1px solid rgba(125,160,225,.2);
        border-radius: 9px;
        background: rgba(255,255,255,.045);
        font-size: .72rem;
        font-weight: 800;
      }

      #${SCREEN_ID} .sb-status {
        margin: 12px 0 0;
        text-align: center;
        color: #dbe8ff;
        font-weight: 700;
        font-size: .85rem;
        line-height: 1.45;
      }
      #${SCREEN_ID} .sb-action {
        display: block;
        width: 100%;
        max-width: 440px;
        margin: 12px auto 0;
        padding: 14px 16px;
        border-radius: 13px;
        font-weight: 900;
        color: #eaf7ff;
        border: 1px solid rgba(95,190,255,.7);
        background: linear-gradient(110deg,#133a86,#4a2288);
        box-shadow: 0 0 20px rgba(57,143,255,.28);
      }
      #${SCREEN_ID} .sb-action:disabled { opacity: .5; cursor: not-allowed; box-shadow: none; }

      #${SCREEN_ID} .sb-bracket-scroll { width: 100%; overflow-x: auto; padding: 14px 2px 10px; }
      #${SCREEN_ID} .sb-bracket {
        direction: ltr;
        min-width: 760px;
        display: grid;
        grid-template-columns:
          minmax(150px,1fr) minmax(105px,.62fr) minmax(90px,.48fr) minmax(118px,.7fr)
          minmax(90px,.48fr) minmax(105px,.62fr) minmax(150px,1fr);
        align-items: stretch;
        gap: 7px;
      }
      #${SCREEN_ID} .sb-stage {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        gap: 9px;
        min-width: 0;
      }
      #${SCREEN_ID} .sb-stage-title {
        min-height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        color: #91c9ff;
        font-size: .62rem;
        font-weight: 900;
        letter-spacing: 1px;
      }
      #${SCREEN_ID} .sb-stage.qf .sb-stage-title { color: #b3a0ff; }
      #${SCREEN_ID} .sb-stage.sf .sb-stage-title { color: #ef9cff; }

      #${SCREEN_ID} .sb-match {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 4px;
        min-height: 66px;
        padding: 6px;
        border: 1px solid rgba(105,163,255,.48);
        border-radius: 10px;
        background: linear-gradient(135deg,rgba(22,42,91,.88),rgba(9,16,44,.94));
      }
      #${SCREEN_ID} .sb-stage.qf .sb-match { border-color: rgba(154,130,255,.55); }
      #${SCREEN_ID} .sb-stage.sf .sb-match { border-color: rgba(220,130,255,.58); }
      #${SCREEN_ID} .sb-match.sb-current {
        border-color: rgba(255,214,110,.95);
        box-shadow: 0 0 0 1px rgba(255,214,110,.8), 0 0 18px rgba(255,200,80,.35);
      }

      #${SCREEN_ID} .sb-player {
        display: flex;
        align-items: center;
        min-width: 0;
        gap: 6px;
        min-height: 25px;
        padding: 3px 4px;
        color: #dceaff;
        font-size: .67rem;
        font-weight: 800;
        border-radius: 6px;
        background: rgba(255,255,255,.045);
        border: 1px solid transparent;
      }
      #${SCREEN_ID} .sb-avatar {
        flex: 0 0 21px;
        width: 21px;
        height: 21px;
        display: grid;
        place-items: center;
        overflow: hidden;
        border-radius: 50%;
        color: #fff;
        font-size: 13px;
        background: linear-gradient(145deg,#287fd2,#653eaa);
        border: 1px solid rgba(185,222,255,.65);
      }
      #${SCREEN_ID} .sb-avatar img { width: 100%; height: 100%; object-fit: cover; }
      #${SCREEN_ID} .sb-player-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      #${SCREEN_ID} .sb-you { color: #ffe18a; background: rgba(255,190,60,.10); border-color: rgba(255,210,100,.38); }
      #${SCREEN_ID} .sb-tbd { color: #6f82b0; border: 1px dashed rgba(136,157,215,.35); background: transparent; }
      #${SCREEN_ID} .sb-win { border-color: rgba(90,230,150,.6); background: rgba(60,200,120,.16); }
      #${SCREEN_ID} .sb-lose { opacity: .45; }
      #${SCREEN_ID} .sb-lose .sb-player-name { text-decoration: line-through; }

      #${SCREEN_ID} .sb-final {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        justify-content: center;
        gap: 9px;
        padding: 8px 5px;
        text-align: center;
      }
      #${SCREEN_ID} .sb-cup {
        align-self: center;
        display: grid;
        place-items: center;
        width: 68px;
        height: 78px;
        font-size: 2.7rem;
        border: 1px solid rgba(255,208,99,.65);
        border-radius: 20px 20px 13px 13px;
        background: radial-gradient(circle,rgba(255,195,62,.22),rgba(18,25,57,.95));
        box-shadow: 0 0 24px rgba(255,190,55,.2);
      }
      #${SCREEN_ID} .sb-final strong { color: #ffe39a; font-size: .77rem; letter-spacing: 1px; }
      #${SCREEN_ID} .sb-champion {
        padding: 9px 4px;
        color: #c7d8f6;
        border: 1px solid rgba(255,208,99,.5);
        border-radius: 9px;
        background: rgba(255,200,70,.06);
        font-size: .68rem;
        font-weight: 900;
      }

      #${SCREEN_ID} .sb-tour-legend {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 8px;
        color: #a8badc;
        font-size: .68rem;
      }
      #${SCREEN_ID} .sb-dot { display: inline-block; width: 8px; height: 8px; margin: 0 5px; border-radius: 50%; background: #68caff; }
      #${SCREEN_ID} .sb-dot.you { background: #ffd36d; }
      #${SCREEN_ID} .sb-tour-note {
        margin: 12px 0 0;
        color: #8296c4;
        text-align: center;
        font-size: .72rem;
        line-height: 1.5;
      }

      @media (max-width: 520px) {
        #${SCREEN_ID} { padding-inline: 6px; }
        #${SCREEN_ID} .sb-tour-shell { padding: 13px 8px 18px; border-radius: 17px; }
      }
    `;

    document.head.appendChild(style);
  }

  /* ------------------------------------------------------- */
  /* MODE                                                    */
  /* ------------------------------------------------------- */

  window.SBModes.push(function (api) {
    const el = api.el;
    const t = api.t;

    api.addTexts({
      fr: {
        tourTitle: 'TOURNOI', tourSub: 'BRACKET · 16 JOUEURS',
        tourBack: '← Retour',
        tourTickets: '🎟 Tickets : {n}',
        tourStat1: '16 JOUEURS', tourStat2: 'ÉLIMINATION DIRECTE', tourStat3: '4 TOURS',
        rndR16: 'HUITIÈMES', rndQF: 'QUARTS', rndSF: 'DEMI', rndFinal: 'FINALE',
        tourFinalTitle: 'GRANDE FINALE', tourChampion: 'CHAMPION', tourTbd: 'À DÉTERMINER',
        tourIdle: 'Un ticket est utilisé au lancement. Élimination directe : une erreur et c’est fini !',
        tourStart: '🎟 Commencer le tournoi (1 ticket)',
        tourNoTicket: '🎟 Ticket requis — gagnes-en en mode Solo',
        tourNext: 'Prochain match : {round} contre {name}',
        tourPlay: '▶ Jouer le match',
        tourOut: '💔 Éliminé en {round}. {name} remporte le tournoi.',
        tourChamp: '🏆 Tu es CHAMPION ! +2 tickets et +500 points.',
        tourNew: '🔁 Nouveau tournoi',
        tourLegendYou: 'Ton avatar', tourLegendBots: 'Adversaires virtuels',
        tourNote: 'Même séquence pour tout le monde : reproduis-la sans erreur et plus vite que ton adversaire pour passer au tour suivant.',
        tourVs: '{round} · TOI vs {name}',
        tReady: 'Prêt ? Même séquence pour vous deux : sois juste et rapide !',
        tObserve: '👀 Observe bien la séquence !',
        tPlay: '🎮 Reproduis-la vite !',
        tLose: '❌ Raté ! {name} te sort du tournoi.',
        tTimeout: '⏰ Trop lent ! {name} te sort du tournoi.',
        tBotFail: '✅ Bravo ! {name} s’est trompé, tu passes au tour suivant.',
        tWinFast: '⚡ Plus rapide que {name} ({you}s contre {bot}s) !',
        tLoseSlow: '🐢 {name} a été plus rapide ({bot}s contre {you}s).',
        tourForfeit: 'Abandonner ce match ? Tu seras éliminé.'
      },
      en: {
        tourTitle: 'TOURNAMENT', tourSub: 'BRACKET · 16 PLAYERS',
        tourBack: '← Back',
        tourTickets: '🎟 Tickets: {n}',
        tourStat1: '16 PLAYERS', tourStat2: 'KNOCKOUT', tourStat3: '4 ROUNDS',
        rndR16: 'ROUND OF 16', rndQF: 'QUARTERS', rndSF: 'SEMIS', rndFinal: 'FINAL',
        tourFinalTitle: 'GRAND FINAL', tourChampion: 'CHAMPION', tourTbd: 'TO BE DECIDED',
        tourIdle: 'One ticket is spent when you start. Knockout: one mistake and you’re out!',
        tourStart: '🎟 Start the tournament (1 ticket)',
        tourNoTicket: '🎟 Ticket required — earn some in Solo mode',
        tourNext: 'Next match: {round} against {name}',
        tourPlay: '▶ Play the match',
        tourOut: '💔 Eliminated in the {round}. {name} wins the tournament.',
        tourChamp: '🏆 You are the CHAMPION! +2 tickets and +500 points.',
        tourNew: '🔁 New tournament',
        tourLegendYou: 'Your avatar', tourLegendBots: 'Virtual opponents',
        tourNote: 'Everyone gets the same sequence: repeat it without a mistake and faster than your opponent to advance.',
        tourVs: '{round} · YOU vs {name}',
        tReady: 'Ready? You both get the same sequence: be accurate and fast!',
        tObserve: '👀 Watch the sequence carefully!',
        tPlay: '🎮 Repeat it fast!',
        tLose: '❌ Missed! {name} knocks you out.',
        tTimeout: '⏰ Too slow! {name} knocks you out.',
        tBotFail: '✅ Well done! {name} made a mistake, you advance.',
        tWinFast: '⚡ Faster than {name} ({you}s vs {bot}s)!',
        tLoseSlow: '🐢 {name} was faster ({bot}s vs {you}s).',
        tourForfeit: 'Forfeit this match? You will be eliminated.'
      }
    });

    let T = null;            // état du tournoi
    let phase = 'bracket';   // bracket | ready | playing | result
    let ui = null;           // éléments de l’écran du tableau

    /* ---------- état du tournoi ---------- */

    function shuffle(list) {
      const a = list.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
      }
      return a;
    }

    function emptyMatches(n) {
      const list = [];
      for (let i = 0; i < n; i++) list.push({ a: null, b: null, w: null });
      return list;
    }

    function newTournament() {
      const others = [];
      for (let i = 1; i < PLAYERS.length; i++) others.push(i);
      const order = [0].concat(shuffle(others));

      const first = emptyMatches(8);
      first.forEach(function (m, i) { m.a = order[i * 2]; m.b = order[i * 2 + 1]; });

      return {
        started: false, finished: false,
        round: 0, rounds: [first, emptyMatches(4), emptyMatches(2), emptyMatches(1)],
        eliminatedAt: null, champion: null
      };
    }

    function myMatch() {
      return T.rounds[T.round].find(function (m) { return m.a === 0 || m.b === 0; });
    }

    function opponentOf(m) { return m.a === 0 ? m.b : m.a; }
    function roundName(r) { return t(ROUND_KEYS[r]); }

    function fillNext(r) {
      T.rounds[r + 1].forEach(function (m, i) {
        m.a = T.rounds[r][i * 2].w;
        m.b = T.rounds[r][i * 2 + 1].w;
      });
    }

    function simulateRound(r) {
      T.rounds[r].forEach(function (m) {
        if (m.w === null) m.w = Math.random() < 0.5 ? m.a : m.b;
      });
    }

    function persist() { api.store(SAVE_KEY, T); }

    function loadSaved() {
      const s = api.load(SAVE_KEY, null);
      if (!s || !Array.isArray(s.rounds) || s.rounds.length !== 4) return null;
      if (s.started && !s.finished) {
        const m = s.rounds[s.round] && s.rounds[s.round].find(function (x) { return x.a === 0 || x.b === 0; });
        if (!m) return null;
      }
      return s;
    }

    // Enregistre le résultat de TON match, simule le reste du tour, avance le tableau.
    function resolveMatch(youWon) {
      const r = T.round;
      const m = myMatch();
      m.w = youWon ? 0 : opponentOf(m);

      simulateRound(r);
      if (r < 3) fillNext(r);

      if (!youWon) {
        T.eliminatedAt = r;
        for (let k = r + 1; k < 4; k++) {
          simulateRound(k);
          if (k < 3) fillNext(k);
        }
        T.finished = true;
        T.champion = T.rounds[3][0].w;
      } else if (r === 3) {
        T.finished = true;
        T.champion = 0;
        const s = api.get();
        const score = s.score + 500;
        api.set({ tickets: s.tickets + 2, score: score, best: Math.max(s.best, score) });
      } else {
        T.round++;
      }
      persist();
    }

    /* ---------- écran du tableau ---------- */

    function makePlayer(index) {
      const row = document.createElement('div');

      if (index === null || index === undefined) {
        row.className = 'sb-player sb-tbd';
        row.textContent = '?';
        return row;
      }

      const player = PLAYERS[index];
      row.className = 'sb-player' + (index === 0 ? ' sb-you' : '');

      const avatar = document.createElement('span');
      avatar.className = 'sb-avatar';

      const src = index === 0 ? api.profileSrc() : '';
      if (src) {
        const img = document.createElement('img');
        img.alt = '';
        img.onerror = function () { img.remove(); avatar.textContent = player.avatar; };
        img.src = src;
        avatar.appendChild(img);
      } else {
        avatar.textContent = player.avatar;
      }

      const name = document.createElement('span');
      name.className = 'sb-player-name';
      name.textContent = player.name;

      row.appendChild(avatar);
      row.appendChild(name);
      return row;
    }

    function makeMatch(m, isCurrent) {
      const box = document.createElement('div');
      box.className = 'sb-match' + (isCurrent ? ' sb-current' : '');

      [m.a, m.b].forEach(function (idx) {
        const row = makePlayer(idx);
        if (m.w !== null && idx !== null) row.classList.add(idx === m.w ? 'sb-win' : 'sb-lose');
        box.appendChild(row);
      });
      return box;
    }

    function makeStage(round, cls, matches) {
      const stage = document.createElement('section');
      stage.className = 'sb-stage ' + cls;

      const title = document.createElement('div');
      title.className = 'sb-stage-title';
      title.textContent = roundName(round);
      stage.appendChild(title);

      const mine = T.started && !T.finished ? myMatch() : null;
      matches.forEach(function (m) { stage.appendChild(makeMatch(m, m === mine)); });
      return stage;
    }

    function makeFinal() {
      const box = document.createElement('section');
      box.className = 'sb-final';

      const title = document.createElement('div');
      title.className = 'sb-stage-title';
      title.textContent = t('tourFinalTitle');

      const cup = document.createElement('div');
      cup.className = 'sb-cup';
      cup.textContent = '🏆';

      const label = document.createElement('strong');
      label.textContent = t('tourChampion');

      const champ = document.createElement('div');
      champ.className = 'sb-champion';
      champ.textContent = T.champion === null ? t('tourTbd') : PLAYERS[T.champion].avatar + ' ' + PLAYERS[T.champion].name;

      const final = T.rounds[3][0];
      const mine = T.started && !T.finished ? myMatch() : null;

      box.appendChild(title);
      box.appendChild(cup);
      box.appendChild(makeMatch(final, final === mine));
      box.appendChild(label);
      box.appendChild(champ);
      return box;
    }

    function createScreen() {
      if (ui) return;

      const screen = document.createElement('main');
      screen.id = SCREEN_ID;

      screen.innerHTML =
        '<div class="sb-tour-shell">' +
          '<div class="sb-tour-top">' +
            '<button type="button" class="sb-tour-back"></button>' +
            '<div class="sb-tour-ticket"></div>' +
          '</div>' +
          '<header class="sb-tour-heading">' +
            '<div class="sb-tour-emblem">🏆</div>' +
            '<h1></h1><p class="sb-tour-sub"></p>' +
          '</header>' +
          '<div class="sb-tour-stats"><span class="sb-tour-stat"></span><span class="sb-tour-stat"></span><span class="sb-tour-stat"></span></div>' +
          '<p class="sb-status"></p>' +
          '<button type="button" class="sb-action"></button>' +
          '<div class="sb-bracket-scroll"><div class="sb-bracket"></div></div>' +
          '<div class="sb-tour-legend"><span><i class="sb-dot you"></i><b class="lg-you"></b></span><span><i class="sb-dot"></i><b class="lg-bots"></b></span></div>' +
          '<p class="sb-tour-note"></p>' +
        '</div>';

      document.body.appendChild(screen);

      ui = {
        screen: screen,
        back: screen.querySelector('.sb-tour-back'),
        tickets: screen.querySelector('.sb-tour-ticket'),
        title: screen.querySelector('h1'),
        sub: screen.querySelector('.sb-tour-sub'),
        stats: screen.querySelectorAll('.sb-tour-stat'),
        status: screen.querySelector('.sb-status'),
        action: screen.querySelector('.sb-action'),
        bracket: screen.querySelector('.sb-bracket'),
        lgYou: screen.querySelector('.lg-you'),
        lgBots: screen.querySelector('.lg-bots'),
        note: screen.querySelector('.sb-tour-note')
      };

      ui.back.addEventListener('click', function () { api.home(); });
      ui.action.addEventListener('click', onAction);
    }

    function refreshTickets() {
      if (ui) ui.tickets.textContent = t('tourTickets', { n: api.get().tickets });
    }

    function render() {
      if (!ui || !T) return;

      ui.back.textContent = t('tourBack');
      ui.title.textContent = t('tourTitle');
      ui.sub.textContent = t('tourSub');
      ui.stats[0].textContent = t('tourStat1');
      ui.stats[1].textContent = t('tourStat2');
      ui.stats[2].textContent = t('tourStat3');
      ui.lgYou.textContent = t('tourLegendYou');
      ui.lgBots.textContent = t('tourLegendBots');
      ui.note.textContent = t('tourNote');
      refreshTickets();

      // Statut + bouton principal
      const tickets = api.get().tickets;
      ui.action.disabled = false;

      if (!T.started) {
        ui.status.textContent = t('tourIdle');
        ui.action.textContent = tickets > 0 ? t('tourStart') : t('tourNoTicket');
        ui.action.disabled = tickets < 1;
      } else if (!T.finished) {
        const m = myMatch();
        ui.status.textContent = t('tourNext', { round: roundName(T.round), name: PLAYERS[opponentOf(m)].name });
        ui.action.textContent = t('tourPlay');
      } else {
        ui.status.textContent = T.champion === 0
          ? t('tourChamp')
          : t('tourOut', { round: roundName(T.eliminatedAt), name: PLAYERS[T.champion].name });
        ui.action.textContent = t('tourNew');
      }

      // Tableau
      const r = T.rounds;
      ui.bracket.replaceChildren(
        makeStage(0, 'r16', r[0].slice(0, 4)),
        makeStage(1, 'qf', r[1].slice(0, 2)),
        makeStage(2, 'sf', r[2].slice(0, 1)),
        makeFinal(),
        makeStage(2, 'sf', r[2].slice(1)),
        makeStage(1, 'qf', r[1].slice(2)),
        makeStage(0, 'r16', r[0].slice(4))
      );
    }

    function showBracket() {
      phase = 'bracket';
      api.board.cancel();
      api.setVersus('');
      api.setScreen('tour');
      render();
    }

    function onAction() {
      if (!T.started) {
        const s = api.get();
        if (s.tickets < 1) return;
        api.set({ tickets: s.tickets - 1 });
        T.started = true;
        persist();
        render();
      } else if (!T.finished) {
        openMatch();
      } else {
        T = newTournament();
        persist();
        render();
      }
    }

    /* ---------- match (utilise l’écran de jeu) ---------- */

    function openMatch() {
      const m = myMatch();
      phase = 'ready';
      api.setScreen('game');
      api.setVersus(t('tourVs', { round: roundName(T.round), name: PLAYERS[opponentOf(m)].name }));
      api.setStartText('start');
      api.setHidden(el.star, false);
      api.setMsg('tReady');
    }

    function makeSequence(length) {
      const seq = [];
      for (let i = 0; i < length; i++) seq.push(api.cfg.COLORS[Math.floor(Math.random() * api.cfg.COLORS.length)]);
      return seq;
    }

    function playMatch() {
      const r = T.round;
      const len = SEQ_LEN[r];
      const opp = PLAYERS[opponentOf(myMatch())];

      phase = 'playing';
      api.setHidden(el.star, true);
      api.setMsg('tObserve');

      api.board.play(makeSequence(len), {
        speed: Math.max(450, 720 - r * 70),
        seconds: Math.round(len * 1.4 + 3),

        onAnswer: function () { api.setMsg('tPlay'); },

        onDone: function (res) {
          const botOk = Math.random() < BOT_SUCCESS[r];
          const botTime = len * (0.75 + Math.random() * 0.8);
          const youWon = res.ok && (!botOk || res.elapsed < botTime);
          const vars = { name: opp.name, you: res.elapsed.toFixed(1), bot: botTime.toFixed(1) };

          let key;
          if (!res.ok) key = res.reason === 'timeout' ? 'tTimeout' : 'tLose';
          else if (!botOk) key = 'tBotFail';
          else key = youWon ? 'tWinFast' : 'tLoseSlow';

          api.safePlay(youWon ? el.winSound : el.failSound);
          resolveMatch(youWon);   // enregistré tout de suite, même si on quitte ensuite

          phase = 'result';
          api.setMsg(key, vars);
          api.setStartText('continue');
          api.setHidden(el.star, false);
        }
      });
    }

    /* ---------- contrat avec le noyau ---------- */

    return {
      id: 'tour',

      enter: function () {
        addStyles();
        createScreen();
        T = loadSaved() || newTournament();
        showBracket();
      },

      leave: function () {
        api.board.cancel();
        api.setVersus('');
        api.setHidden(el.star, false);
        phase = 'bracket';
      },

      onStart: function () {
        if (phase === 'ready') playMatch();
        else if (phase === 'result') showBracket();
      },

      // Bouton « Retour » de l’écran de jeu
      onBack: function () {
        if (phase === 'playing') {
          if (!window.confirm(t('tourForfeit'))) return;
          api.board.cancel();
          resolveMatch(false);
        }
        showBracket();
      },

      onUpdate: refreshTickets,

      onLang: function () {
        if (!T || !ui) return;
        render();
      },

      canLeave: function () { return true; }
    };
  });
})();
