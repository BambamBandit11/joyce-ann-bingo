(function () {
  'use strict';

  // ===== Phrases =====
  // The first 12 are mandatory. The rest fill the pool to 30+.
  var ALL_PHRASES = [
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
    'suspicious casserole',
    'someone whispers',
    'eye roll',
    'nervous laughter',
  ];

  // ===== Seeded PRNG (mulberry32) =====
  function mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Shuffle an array in place using the seeded RNG.
  function shuffle(arr, rng) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  // ===== Seed Management =====
  function getSeed() {
    var params = new URLSearchParams(window.location.search);
    var raw = params.get('seed');
    if (raw !== null) {
      var n = parseInt(raw, 10);
      if (!isNaN(n)) return n;
    }
    return null;
  }

  function generateSeed() {
    return Math.floor(Math.random() * 2147483647) + 1;
  }

  function setSeedInURL(seed) {
    var url = new URL(window.location.href);
    url.searchParams.set('seed', seed);
    window.history.replaceState(null, '', url.toString());
  }

  // ===== Board Generation =====
  // Returns an array of 25 phrases where index 12 is "FREE".
  function generateBoard(seed) {
    var rng = mulberry32(seed);
    var pool = ALL_PHRASES.slice();
    shuffle(pool, rng);
    var picked = pool.slice(0, 24);
    // Insert FREE at center (index 12).
    picked.splice(12, 0, 'FREE');
    return picked;
  }

  // ===== LocalStorage Helpers =====
  var STORAGE_NAME_KEY = 'joyce-ann-bingo-player';

  function getPlayerName() {
    return localStorage.getItem(STORAGE_NAME_KEY) || '';
  }

  function setPlayerName(name) {
    localStorage.setItem(STORAGE_NAME_KEY, name);
  }

  function marksKey(seed) {
    return 'joyce-ann-bingo-marks-' + seed;
  }

  function loadMarks(seed) {
    try {
      var raw = localStorage.getItem(marksKey(seed));
      if (raw) return JSON.parse(raw);
    } catch (_) {
      // Ignore parse errors.
    }
    return {};
  }

  function saveMarks(seed, marks) {
    localStorage.setItem(marksKey(seed), JSON.stringify(marks));
  }

  // ===== Bingo Detection =====
  // marks is an object mapping index (string) -> true.
  // Index 12 (FREE) is always marked.
  function checkBingo(marks) {
    var lines = [
      // Rows
      [0, 1, 2, 3, 4],
      [5, 6, 7, 8, 9],
      [10, 11, 12, 13, 14],
      [15, 16, 17, 18, 19],
      [20, 21, 22, 23, 24],
      // Columns
      [0, 5, 10, 15, 20],
      [1, 6, 11, 16, 21],
      [2, 7, 12, 17, 22],
      [3, 8, 13, 18, 23],
      [4, 9, 14, 19, 24],
      // Diagonals
      [0, 6, 12, 18, 24],
      [4, 8, 12, 16, 20],
    ];

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var complete = true;
      for (var j = 0; j < line.length; j++) {
        if (!marks[String(line[j])]) {
          complete = false;
          break;
        }
      }
      if (complete) return true;
    }
    return false;
  }

  // ===== Confetti =====
  function spawnConfetti(container) {
    container.innerHTML = '';
    var colors = [
      '#f582ae', '#ffc857', '#8bd3dd', '#6bcb77',
      '#ff6b6b', '#a76bff', '#ff9a3c',
    ];
    for (var i = 0; i < 60; i++) {
      var piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + '%';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.width = (6 + Math.random() * 8) + 'px';
      piece.style.height = (6 + Math.random() * 8) + 'px';
      piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      piece.style.animationDuration = (1.5 + Math.random() * 2) + 's';
      piece.style.animationDelay = (Math.random() * 1.5) + 's';
      container.appendChild(piece);
    }
  }

  // ===== Toast =====
  function showToast(message) {
    var toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('hidden');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(function () {
      toast.classList.add('hidden');
    }, 2000);
  }

  // ===== App Init =====
  function init() {
    var seed = getSeed();
    if (seed === null) {
      seed = generateSeed();
      setSeedInURL(seed);
    }

    var nameModal = document.getElementById('name-modal');
    var nameInput = document.getElementById('name-input');
    var nameSubmit = document.getElementById('name-submit');
    var bingoModal = document.getElementById('bingo-modal');
    var bingoMessage = document.getElementById('bingo-message');
    var bingoClose = document.getElementById('bingo-close');
    var confettiContainer = document.getElementById('confetti-container');
    var appEl = document.getElementById('app');
    var playerDisplay = document.getElementById('player-display');
    var boardEl = document.getElementById('bingo-board');

    var playerName = getPlayerName();
    var marks = loadMarks(seed);
    // FREE space is always marked.
    marks['12'] = true;

    var board = generateBoard(seed);

    // --- Name Modal ---
    function finishNameEntry() {
      var val = nameInput.value.trim();
      if (!val) return;
      playerName = val;
      setPlayerName(playerName);
      nameModal.classList.add('hidden');
      appEl.classList.remove('hidden');
      playerDisplay.textContent = 'Player: ' + playerName;
    }

    if (playerName) {
      nameModal.classList.add('hidden');
      appEl.classList.remove('hidden');
      playerDisplay.textContent = 'Player: ' + playerName;
    } else {
      nameModal.classList.remove('hidden');
      appEl.classList.add('hidden');
      setTimeout(function () { nameInput.focus(); }, 100);
    }

    nameSubmit.addEventListener('click', finishNameEntry);
    nameInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') finishNameEntry();
    });

    // --- Render Board ---
    function renderBoard() {
      boardEl.innerHTML = '';
      for (var i = 0; i < 25; i++) {
        var cell = document.createElement('div');
        cell.className = 'cell';
        cell.textContent = board[i];
        cell.dataset.index = i;

        if (i === 12) {
          cell.classList.add('free');
          cell.classList.add('marked');
        } else if (marks[String(i)]) {
          cell.classList.add('marked');
        }

        cell.addEventListener('click', onCellClick);
        boardEl.appendChild(cell);
      }
    }

    function onCellClick(e) {
      var idx = e.currentTarget.dataset.index;
      if (idx === '12') return; // Cannot toggle FREE.

      if (marks[idx]) {
        delete marks[idx];
        e.currentTarget.classList.remove('marked');
      } else {
        marks[idx] = true;
        e.currentTarget.classList.add('marked');
      }

      saveMarks(seed, marks);

      if (checkBingo(marks)) {
        showBingoCelebration();
      }
    }

    renderBoard();

    // --- Bingo Celebration ---
    function showBingoCelebration() {
      bingoMessage.textContent = 'BINGO, ' + playerName + '! \uD83C\uDF89';
      bingoModal.classList.remove('hidden');
      spawnConfetti(confettiContainer);
    }

    bingoClose.addEventListener('click', function () {
      bingoModal.classList.add('hidden');
    });

    // --- Toolbar Buttons ---
    document.getElementById('btn-copy-link').addEventListener('click', function () {
      var url = window.location.href;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () {
          showToast('Link copied!');
        });
      } else {
        // Fallback for older browsers.
        var ta = document.createElement('textarea');
        ta.value = url;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('Link copied!');
      }
    });

    document.getElementById('btn-new-game').addEventListener('click', function () {
      var newSeed = generateSeed();
      var url = new URL(window.location.href);
      url.searchParams.set('seed', newSeed);
      window.location.href = url.toString();
    });

    document.getElementById('btn-reset').addEventListener('click', function () {
      marks = { '12': true };
      saveMarks(seed, marks);
      renderBoard();
    });

    document.getElementById('btn-call-bingo').addEventListener('click', function () {
      showBingoCelebration();
    });
  }

  // Start the app once the DOM is ready.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
