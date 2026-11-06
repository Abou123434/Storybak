/* =========================================================
   STORYBAK — MODE TOURNOI (16 JOUEURS)
   Tableau dessiné en HTML/CSS : aucune image externe requise.
========================================================= */

(function () {
  'use strict';

  window.SBModes = window.SBModes || [];

  const STYLE_ID = 'storybak-tournament-style';
  const SCREEN_ID = 'storybakTournament';
  const LAUNCH_ID = 'tourLaunchBtn';

  const PLAYERS = [
    { name: 'TOI', avatar: '👑', you: true },
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

  function addStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;

    style.textContent = `
      #${LAUNCH_ID} {
        order: 12;
        width: 100%;
        padding: 14px 16px;
        color: #eaf7ff;
        font-weight: 900;
        letter-spacing: .5px;
        border: 1px solid rgba(95,190,255,.7);
        background: linear-gradient(110deg,#102b66,#442078);
        box-shadow: 0 0 20px rgba(57,143,255,.28);
      }

      body[data-screen="tour"] #game {
        display: none !important;
      }

      body[data-screen="tour"] #${SCREEN_ID} {
        display: block;
      }

      #${SCREEN_ID} {
        display: none;
        width: min(1200px,100%);
        min-height: 100vh;
        margin: 0 auto;
        padding: 18px 12px 24px;
        color: #edf6ff;
        font-family: system-ui,sans-serif;
        background:
          radial-gradient(ellipse at 50% 35%,rgba(26,65,150,.22),transparent 55%),
          linear-gradient(180deg,#050817,#090d25 55%,#050817);
        box-sizing: border-box;
      }

      #${SCREEN_ID} * {
        box-sizing: border-box;
      }

      #${SCREEN_ID} .sb-tour-shell {
        position: relative;
        overflow: hidden;
        padding: 18px 14px 22px;
        border: 1px solid rgba(91,169,255,.48);
        border-radius: 22px;
        background: linear-gradient(145deg,rgba(12,22,58,.96),rgba(5,8,25,.97));
        box-shadow: 0 0 32px rgba(36,111,255,.17);
      }

      #${SCREEN_ID} .sb-tour-shell::before {
        content: "";
        position: absolute;
        inset: 7px;
        border: 1px solid rgba(129,165,255,.13);
        border-radius: 16px;
        pointer-events: none;
      }

      #${SCREEN_ID} .sb-tour-top {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 18px;
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

      #${SCREEN_ID} .sb-tour-heading {
        text-align: center;
        margin: 8px 0 16px;
      }

      #${SCREEN_ID} .sb-tour-emblem {
        display: inline-grid;
        place-items: center;
        width: 58px;
        height: 58px;
        margin-bottom: 8px;
        border-radius: 18px;
        color: #9beaff;
        font-size: 2rem;
        border: 1px solid rgba(101,211,255,.65);
        background: radial-gradient(circle,rgba(48,143,255,.32),rgba(13,23,65,.9));
        box-shadow: 0 0 24px rgba(51,171,255,.35);
      }

      #${SCREEN_ID} .sb-tour-heading h1 {
        margin: 0;
        color: #f2f7ff;
        font-size: clamp(1.45rem,5vw,2.1rem);
        letter-spacing: 2px;
        font-weight: 1000;
        text-shadow: 0 0 18px rgba(82,167,255,.55);
      }

      #${SCREEN_ID} .sb-tour-heading p {
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
        margin: 14px 0 18px;
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

      #${SCREEN_ID} .sb-bracket-scroll {
        width: 100%;
        overflow-x: auto;
        padding: 8px 2px 14px;
      }

      #${SCREEN_ID} .sb-bracket {
        min-width: 760px;
        display: grid;
        grid-template-columns:
          minmax(175px,1fr)
          minmax(105px,.62fr)
          minmax(90px,.48fr)
          minmax(118px,.7fr)
          minmax(118px,.7fr)
          minmax(90px,.48fr)
          minmax(105px,.62fr)
          minmax(175px,1fr);
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

      #${SCREEN_ID} .sb-stage.qf .sb-stage-title {
        color: #b3a0ff;
      }

      #${SCREEN_ID} .sb-stage.sf .sb-stage-title {
        color: #ef9cff;
      }

      #${SCREEN_ID} .sb-match {
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 4px;
        min-height: 66px;
        padding: 6px;
        border: 1px solid rgba(105,163,255,.48);
        border-radius: 10px;
        background: linear-gradient(135deg,rgba(22,42,91,.88),rgba(9,16,44,.94));
        box-shadow: inset 0 0 12px rgba(72,136,255,.08);
      }

      #${SCREEN_ID} .sb-stage.qf .sb-match {
        border-color: rgba(154,130,255,.55);
      }

      #${SCREEN_ID} .sb-stage.sf .sb-match {
        border-color: rgba(220,130,255,.58);
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

      #${SCREEN_ID} .sb-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      #${SCREEN_ID} .sb-player-name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      #${SCREEN_ID} .sb-you {
        color: #ffe18a;
        border: 1px solid rgba(255,210,100,.38);
        background: rgba(255,190,60,.10);
      }

      #${SCREEN_ID} .sb-empty {
        display: grid;
        place-items: center;
        min-height: 66px;
        padding: 7px 4px;
        color: #7184b2;
        text-align: center;
        font-size: .64rem;
        font-weight: 800;
        border: 1px dashed rgba(136,157,215,.35);
        border-radius: 10px;
        background: rgba(255,255,255,.025);
      }

      #${SCREEN_ID} .sb-final {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 9px;
        padding: 8px 5px;
        text-align: center;
      }

      #${SCREEN_ID} .sb-cup {
        display: grid;
        place-items: center;
        width: 68px;
        height: 78px;
        color: #ffe18a;
        font-size: 2.7rem;
        border: 1px solid rgba(255,208,99,.65);
        border-radius: 20px 20px 13px 13px;
        background: radial-gradient(circle,rgba(255,195,62,.22),rgba(18,25,57,.95));
        box-shadow: 0 0 24px rgba(255,190,55,.2);
      }

      #${SCREEN_ID} .sb-final strong {
        color: #ffe39a;
        font-size: .77rem;
        letter-spacing: 1px;
      }

      #${SCREEN_ID} .sb-champion {
        width: 100%;
        padding: 9px 4px;
        color: #c7d8f6;
        border: 1px solid rgba(255,208,99,.5);
        border-radius: 9px;
        background: rgba(255,200,70,.06);
        font-size: .65rem;
        font-weight: 900;
      }

      #${SCREEN_ID} .sb-tour-note {
        margin: 12px 0 0;
        color: #8296c4;
        text-align: center;
        font-size: .72rem;
        line-height: 1.5;
      }

      #${SCREEN_ID} .sb-tour-legend {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 12px;
        color: #a8badc;
        font-size: .68rem;
      }

      #${SCREEN_ID} .sb-dot {
        display: inline-block;
        width: 8px;
        height: 8px;
        margin-right: 5px;
        border-radius: 50%;
        background: #68caff;
      }

      #${SCREEN_ID} .sb-dot.you {
        background: #ffd36d;
      }

      @media (max-width: 520px) {
        #${SCREEN_ID} {
          padding-inline: 7px;
        }

        #${SCREEN_ID} .sb-tour-shell {
          padding: 13px 8px 18px;
          border-radius: 17px;
        }

        #${SCREEN_ID} .sb-tour-ticket {
          font-size: .68rem;
          padding: 7px 8px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function makePlayer(player, profileSrc) {
    const row = document.createElement('div');

    row.className = 'sb-player' +
      (player.you ? ' sb-you' : '');

    const avatar = document.createElement('span');
    avatar.className = 'sb-avatar';

    if (player.you && profileSrc) {
      const img = document.createElement('img');
      img.src = profileSrc;
      img.alt = 'Ton avatar';

      img.onerror = function () {
        avatar.textContent = player.avatar;
      };

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

  function makeMatch(players, profileSrc) {
    const match = document.createElement('div');
    match.className = 'sb-match';

    players.forEach(function (player) {
      match.appendChild(makePlayer(player, profileSrc));
    });

    return match;
  }

  function makeEmpty(label) {
    const node = document.createElement('div');
    node.className = 'sb-empty';
    node.textContent = label || 'À VENIR';

    return node;
  }

  function makeStage(title, className, count, side) {
    const stage = document.createElement('section');

    stage.className = 'sb-stage ' + className +
      (side ? ' ' + side : '');

    const heading = document.createElement('div');
    heading.className = 'sb-stage-title';
    heading.textContent = title;

    stage.appendChild(heading);

    for (let i = 0; i < count; i++) {

      if (className === 'r16') {

        const offset = side === 'right' ? 8 : 0;

        stage.appendChild(
          makeMatch([
            PLAYERS[offset + i * 2],
            PLAYERS[offset + i * 2 + 1]
          ])
        );

      } else {

        stage.appendChild(
          makeEmpty('QUALIFIÉ ' + (i + 1))
        );

      }
    }

    return stage;
  }

  function createScreen(api) {

    let screen = document.getElementById(SCREEN_ID);

    if (screen) return screen;

    screen = document.createElement('main');
    screen.id = SCREEN_ID;

    const shell = document.createElement('div');
    shell.className = 'sb-tour-shell';

    const top = document.createElement('div');
    top.className = 'sb-tour-top';

    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'sb-tour-back';
    back.textContent = '← Retour';

    back.addEventListener('click', function () {
      api.home();
    });

    const ticket = document.createElement('div');
    ticket.className = 'sb-tour-ticket';
    ticket.id = 'sbTourTickets';
    ticket.textContent = '🎟 Tickets : 0';

    top.appendChild(back);
    top.appendChild(ticket);

    const heading = document.createElement('header');
    heading.className = 'sb-tour-heading';

    heading.innerHTML = `
      <div class="sb-tour-emblem">🏆</div>
      <h1>TOURNOI</h1>
      <p>BRACKET · 16 JOUEURS</p>
    `;

    const stats = document.createElement('div');
    stats.className = 'sb-tour-stats';

    [
      '16 JOUEURS',
      'ÉLIMINATION DIRECTE',
      '4 TOURS'
    ].forEach(function (label) {

      const item = document.createElement('span');
      item.className = 'sb-tour-stat';
      item.textContent = label;

      stats.appendChild(item);
    });

    const scroll = document.createElement('div');
    scroll.className = 'sb-bracket-scroll';

    const bracket = document.createElement('div');
    bracket.className = 'sb-bracket';

    const leftR16 = makeStage(
      'HUITIÈMES',
      'r16',
      4,
      'left'
    );

    const leftQF = makeStage(
      'QUARTS',
      'qf',
      2,
      'left'
    );

    const leftSF = makeStage(
      'DEMI',
      'sf',
      1,
      'left'
    );

    const final = document.createElement('section');
    final.className = 'sb-final';

    final.innerHTML = `
      <div class="sb-stage-title">GRANDE FINALE</div>
      <div class="sb-cup">🏆</div>
      <strong>CHAMPION</strong>
      <div class="sb-champion">À DÉTERMINER</div>
    `;

    const rightSF = makeStage(
      'DEMI',
      'sf',
      1,
      'right'
    );

    const rightQF = makeStage(
      'QUARTS',
      'qf',
      2,
      'right'
    );

    const rightR16 = makeStage(
      'HUITIÈMES',
      'r16',
      4,
      'right'
    );

    [
      leftR16,
      leftQF,
      leftSF,
      final,
      rightSF,
      rightQF,
      rightR16
    ].forEach(function (node) {
      bracket.appendChild(node);
    });

    scroll.appendChild(bracket);

    const legend = document.createElement('div');
    legend.className = 'sb-tour-legend';

    legend.innerHTML = `
      <span><i class="sb-dot you"></i>Ton avatar</span>
      <span><i class="sb-dot"></i>Adversaires virtuels</span>
    `;

    const note = document.createElement('p');
    note.className = 'sb-tour-note';

    note.textContent =
      'Le tableau affiche les 16 participants. ' +
      'Les cases des prochains tours se rempliront ' +
      'au fur et à mesure des matchs.';

    shell.appendChild(top);
    shell.appendChild(heading);
    shell.appendChild(stats);
    shell.appendChild(scroll);
    shell.appendChild(legend);
    shell.appendChild(note);

    screen.appendChild(shell);
    document.body.appendChild(screen);

    return screen;
  }

  function addLaunchButton() {

    if (document.getElementById(LAUNCH_ID)) return;

    const game = document.getElementById('game');

    if (!game) return;

    const button = document.createElement('button');

    button.id = LAUNCH_ID;
    button.type = 'button';
    button.dataset.mode = 'tour';

    button.textContent =
      '🏆 Jouer le tournoi · 16 joueurs';

    game.appendChild(button);
  }

  addStyles();
  addLaunchButton();

  window.SBModes.push(function (api) {

    return {

      id: 'tour',

      screen: 'tour',

      enter: function () {

        createScreen(api);

        const save = api.get();

        const ticket =
          document.getElementById('sbTourTickets');

        if (ticket) {
          ticket.textContent =
            '🎟 Tickets : ' + save.tickets;
        }
      },

      leave: function () {},

      pause: function () {},

      resume: function () {},

      canLeave: function () {
        return true;
      }

    };

  });

})();