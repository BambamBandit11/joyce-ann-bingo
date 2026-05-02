(() => {
  'use strict';

  // ========== Phrases ==========
  const PHRASES = [
    'physical appearance',
    'house cleanliness',
    'eye brows',
    'personal style',
    'house style',
    'someone says "bucks"',
    'someone mentions cops',
    'tradition',
    'the chair',
    '"Oh......."',
    'unintentional innuendo',
    'bonus: is she catching on?',
    'dramatic pause',
    'side eye to camera',
    'awkward silence',
    'questionable decor',
    'backhanded compliment',
    'someone gets emotional',
    'food commentary',
    'passive aggressive comment',
    '"that\'s interesting..."',
    'unexpected guest',
    'old photos shown',
    'gossip about neighbors',
    'someone checks their phone',
    '"back in my day..."',
    'mysterious stain',
    'pet interruption',
    'loud chewing',
    '"bless your heart"',
    'unsolicited advice',
    'someone whispers',
    'kitchen disaster',
    'family secret dropped',
    'outfit change',
  ];

  // ========== Seeded PRNG (mulberry32) ==========
  function mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffleArray(arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ========== Seed Management ==========
  function getSeed() {
    const params = new URLSearchParams(window.location.search);
    let seed = parseInt(params.get('seed'), 10);
    if (isNaN(seed)) {
      seed = Math.floor(Math.random() * 1000000);
      setSeedInURL(seed);
    }
    return seed;
  }

  function setSeedInURL(seed) {
    const url = new URL(window.location);
    url.searchParams.set('seed', seed);
    window.history.replaceState({}, '', url);
  }

  // ========== Board Generation ==========
  function generateBoard(seed) {
    const rng = mulberry32(seed);
    const shuffled = shuffleArray(PHRASES, rng);
    const selected = shuffled.slice(0, 24);
    // Insert FREE at center (index 12)
    selected.splice(12, 0, 'FREE');
    return selected;
  }

  // ========== LocalStorage Helpers ==========
  function getPlayerName() {
    return localStorage.getItem('bingo_player_name') || '';
  }

  function setPlayerName(name) {
    localStorage.setItem('bingo_player_name', name);
  }

  function getMarkedKey(seed) {
    return `bingo_marked_${seed}`;
  }

  function getMarkedState(seed) {
    try {
      const raw = localStorage.getItem(getMarkedKey(seed));
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function saveMarkedState(seed, state) {
    localStorage.setItem(getMarkedKey(seed), JSON.stringify(state));
  }

  // ========== Bingo Detection ==========
  function checkBingo(marked) {
    const grid = [];
    for (let r = 0; r < 5; r++) {
      grid.push([]);
      for (let c = 0; c < 5; c++) {
        const idx = r * 5 + c;
        grid[r].push(!!marked[idx]);
      }
    }

    // Rows
    for (let r = 0; r < 5; r++) {
      if (grid[r].every(Boolean)) return true;
    }
    // Columns
    for (let c = 0; c < 5; c++) {
      if (grid.every(row => row[c])) return true;
    }
    // Diagonals
    if ([0, 1, 2, 3, 4].every(i => grid[i][i])) return true;
    if ([0, 1, 2, 3, 4].every(i => grid[i][4 - i])) return true;

    return false;
  }

  // ========== Confetti ==========
  function spawnConfetti(container) {
    container.innerHTML = '';
    const colors = ['#e8594f', '#f4a623', '#6c8ebf', '#82c991', '#e86fbf', '#f0e040'];
    for (let i = 0; i < 60; i++) {
      const el = document.createElement('div');
      el.classList.add('confetti');
      el.style.left = Math.random() * 100 + '%';
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
      el.style.animationDuration = (1.5 + Math.random() * 2) + 's';
      el.style.animationDelay = Math.random() * 0.8 + 's';
      el.style.width = (6 + Math.random() * 8) + 'px';
      el.style.height = (6 + Math.random() * 8) + 'px';
      container.appendChild(el);
    }
  }

  // ========== Toast ==========
  function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.remove('hidden');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => toast.classList.add('hidden'), 2200);
  }

  // ========== App Init ==========
  function init() {
    const seed = getSeed();
    const nameModal = document.getElementById('name-modal');
    const bingoModal = document.getElementById('bingo-modal');
    const app = document.getElementById('app');
    const nameInput = document.getElementById('name-input');
    const nameSubmit = document.getElementById('name-submit');
    const playerDisplay = document.getElementById('player-display');
    const boardEl = document.getElementById('board');
    const copyLinkBtn = document.getElementById('copy-link');
    const callBingoBtn = document.getElementById('call-bingo');
    const newGameBtn = document.getElementById('new-game');
    const resetBtn = document.getElementById('reset-board');
    const bingoCloseBtn = document.getElementById('bingo-close');
    const bingoMessage = document.getElementById('bingo-message');
    const confettiContainer = document.getElementById('confetti-container');

    let playerName = getPlayerName();
    let marked = getMarkedState(seed);
    let bingoAlerted = false;

    // Always mark FREE space
    marked[12] = true;

    // ---- Name Modal ----
    function showNameModal() {
      nameModal.classList.remove('hidden');
      app.classList.add('hidden');
      nameInput.value = playerName;
      setTimeout(() => nameInput.focus(), 100);
    }

    function submitName() {
      const name = nameInput.value.trim();
      if (!name) {
        nameInput.focus();
        return;
      }
      playerName = name;
      setPlayerName(name);
      nameModal.classList.add('hidden');
      app.classList.remove('hidden');
      playerDisplay.textContent = `Playing as ${playerName}`;
      renderBoard();
    }

    if (!playerName) {
      showNameModal();
    } else {
      nameModal.classList.add('hidden');
      app.classList.remove('hidden');
      playerDisplay.textContent = `Playing as ${playerName}`;
      renderBoard();
    }

    nameSubmit.addEventListener('click', submitName);
    nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submitName();
    });

    // ---- Board Rendering ----
    function renderBoard() {
      const phrases = generateBoard(seed);
      boardEl.innerHTML = '';

      phrases.forEach((phrase, idx) => {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.textContent = phrase;

        if (idx === 12) {
          cell.classList.add('free', 'marked');
        } else if (marked[idx]) {
          cell.classList.add('marked');
        }

        cell.addEventListener('click', () => {
          if (idx === 12) return; // FREE space
          if (marked[idx]) {
            delete marked[idx];
            cell.classList.remove('marked');
          } else {
            marked[idx] = true;
            cell.classList.add('marked');
          }
          saveMarkedState(seed, marked);

          if (!bingoAlerted && checkBingo(marked)) {
            bingoAlerted = true;
            showBingoModal();
          }
        });

        boardEl.appendChild(cell);
      });
    }

    // ---- Bingo Modal ----
    function showBingoModal() {
      bingoMessage.textContent = `${playerName}, you got BINGO! 🎉`;
      bingoModal.classList.remove('hidden');
      spawnConfetti(confettiContainer);
    }

    bingoCloseBtn.addEventListener('click', () => {
      bingoModal.classList.add('hidden');
    });

    // ---- Toolbar Actions ----
    copyLinkBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(window.location.href).then(() => {
        showToast('Game link copied!');
      }).catch(() => {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = window.location.href;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('Game link copied!');
      });
    });

    callBingoBtn.addEventListener('click', () => {
      showBingoModal();
    });

    newGameBtn.addEventListener('click', () => {
      const newSeed = Math.floor(Math.random() * 1000000);
      const url = new URL(window.location);
      url.searchParams.set('seed', newSeed);
      window.location.href = url.toString();
    });

    resetBtn.addEventListener('click', () => {
      marked = { 12: true };
      saveMarkedState(seed, marked);
      bingoAlerted = false;
      renderBoard();
      showToast('Board reset!');
    });
  }

  // Start app when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
