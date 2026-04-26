/* ====================================================
   script.js  –  Loading screen, question flow, run-away
   ==================================================== */

// ─────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────
function rand(min, max) {
  return Math.random() * (max - min) + min;
}

// ─────────────────────────────────────────────────────
// 1.  LOADING-SCREEN HEARTS
// ─────────────────────────────────────────────────────
const HEART_EMOJIS = ['💕','🌸','✨','💖','🌺','💗','🌷','💝'];

function spawnLoadingHeart() {
  const bg   = document.getElementById('heartsBg');
  const el   = document.createElement('span');
  el.classList.add('h-particle');
  el.textContent = HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)];
  el.style.left     = rand(2, 96) + 'vw';
  el.style.bottom   = '-30px';
  const dur         = rand(5, 10);
  el.style.animationDuration  = dur + 's';
  el.style.animationDelay     = rand(0, 3) + 's';
  el.style.fontSize           = rand(14, 26) + 'px';
  bg.appendChild(el);
  setTimeout(() => el.remove(), (dur + 3) * 1000);
}

// ─────────────────────────────────────────────────────
// 2.  LOADING BAR PROGRESS
// ─────────────────────────────────────────────────────
let loadPct    = 0;
let loadTimer  = null;
let heartTimer = null;

function startLoading() {
  // Spawn hearts every 400 ms
  heartTimer = setInterval(spawnLoadingHeart, 400);

  // Advance bar
  loadTimer = setInterval(() => {
    loadPct += rand(1, 4);
    if (loadPct >= 100) {
      loadPct = 100;
      clearInterval(loadTimer);
      document.getElementById('loadingBar').style.width = '100%';
      setTimeout(finishLoading, 650);
    } else {
      document.getElementById('loadingBar').style.width = loadPct + '%';
    }
  }, 80);
}

function finishLoading() {
  clearInterval(heartTimer);
  const ls = document.getElementById('loading-screen');
  ls.classList.add('fade-out');
  setTimeout(() => {
    ls.style.display = 'none';
    showMainContent();
  }, 850);
}

// ─────────────────────────────────────────────────────
// 3.  MAIN CONTENT + FLOATING HEARTS
// ─────────────────────────────────────────────────────
function showMainContent() {
  const mc = document.getElementById('main-content');
  mc.classList.remove('hidden');
  startFloatingHearts();
}

function startFloatingHearts() {
  const container = document.getElementById('floatingHearts');
  setInterval(() => {
    const el    = document.createElement('span');
    el.classList.add('fh');
    el.textContent = HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)];
    el.style.left  = rand(2, 96) + 'vw';
    el.style.bottom = '-30px';
    const dur   = rand(7, 14);
    el.style.animationDuration = dur + 's';
    el.style.animationDelay    = rand(0, 2) + 's';
    el.style.fontSize          = rand(12, 22) + 'px';
    container.appendChild(el);
    setTimeout(() => el.remove(), (dur + 2.5) * 1000);
  }, 600);
}

// ─────────────────────────────────────────────────────
// 4.  QUESTION FLOW
// ─────────────────────────────────────────────────────
let currentPage = 1;
const totalQ    = 5;

function handleAnswer(questionNum, isCorrect) {
  if (!isCorrect) return; // "No" button guarded by preventWrong
  if (questionNum > totalQ) return;

  // Visual feedback on the YES button
  const yesBtn = document.getElementById('q' + questionNum + '-yes');
  if (yesBtn) {
    yesBtn.classList.add('answered');
    yesBtn.textContent = ''; // clear for sparkle emoji
    const icon = document.createElement('span');
    icon.className = 'btn-icon';
    icon.textContent = '✅';
    const lbl = document.createElement('span');
    lbl.textContent = 'Yay! 🎉';
    yesBtn.appendChild(icon);
    yesBtn.appendChild(lbl);
  }

  // Brief delay then go to next page
  setTimeout(() => {
    goToPage(questionNum + 1);
  }, 700);
}

function goToPage(num) {
  const current = document.getElementById(
    currentPage <= totalQ ? 'page' + currentPage : 'pageFinal'
  );
  const next    = document.getElementById(
    num <= totalQ ? 'page' + num : 'pageFinal'
  );

  if (!next) return;

  // Exit current
  current.classList.remove('active');
  current.classList.add('exit');
  setTimeout(() => current.classList.remove('exit'), 600);

  // Enter next
  next.classList.add('active');

  currentPage = num;

  // If final page, launch confetti
  if (num > totalQ) {
    setTimeout(launchConfetti, 300);
  }
}

// ─────────────────────────────────────────────────────
// 5.  RUN-AWAY "NO" BUTTON
// ─────────────────────────────────────────────────────
function runAway(btn) {
  const vw   = window.innerWidth;
  const vh   = window.innerHeight;

  // Actual button dimensions
  const btnW = btn.offsetWidth  || 120;
  const btnH = btn.offsetHeight || 60;

  // Hard screen bounds - 8 px padding on every edge
  const minX = 8;
  const minY = 8;
  const maxX = vw - btnW - 8;
  const maxY = vh - btnH - 8;

  // Current fixed-space position
  const rect = btn.getBoundingClientRect();
  const curX = rect.left;
  const curY = rect.top;

  // Collect every element the button must NOT land on
  const avoidSelectors = [
    '.correct-btn',   // Yes button
    '.question-card', // whole card
    '.page-dots',     // progress dots
  ];
  const avoidRects = [];
  avoidSelectors.forEach(function(sel) {
    document.querySelectorAll(sel).forEach(function(el) {
      avoidRects.push(el.getBoundingClientRect());
    });
  });

  // Returns true if placing the button at (x,y) would overlap any avoid-rect
  function overlaps(x, y) {
    var PAD = 14;
    return avoidRects.some(function(r) {
      return x        < r.right  + PAD &&
             x + btnW > r.left   - PAD &&
             y        < r.bottom + PAD &&
             y + btnH > r.top    - PAD;
    });
  }

  // Try 40 random spots; keep the farthest non-overlapping one
  var bestX = -1, bestY = -1, bestDist = -1;

  for (var i = 0; i < 40; i++) {
    var nx = rand(minX, maxX);
    var ny = rand(minY, maxY);

    if (overlaps(nx, ny)) continue;

    var dist = Math.hypot(nx - curX, ny - curY);
    if (dist > bestDist) {
      bestDist = dist;
      bestX = nx;
      bestY = ny;
    }
  }

  // Fallback: if every random spot overlapped, use the farthest corner
  if (bestX === -1) {
    var corners = [
      { x: minX, y: minY },
      { x: maxX, y: minY },
      { x: minX, y: maxY },
      { x: maxX, y: maxY },
    ];
    corners.forEach(function(c) {
      var d = Math.hypot(c.x - curX, c.y - curY);
      if (d > bestDist) { bestDist = d; bestX = c.x; bestY = c.y; }
    });
  }

  // Final clamp - absolute safety net
  bestX = Math.max(minX, Math.min(bestX, maxX));
  bestY = Math.max(minY, Math.min(bestY, maxY));

  // Apply - always on top of everything
  btn.style.position   = 'fixed';
  btn.style.left       = bestX + 'px';
  btn.style.top        = bestY + 'px';
  btn.style.zIndex     = '9999';
  btn.style.transition = 'left 0.28s cubic-bezier(.34,1.56,.64,1), top 0.28s cubic-bezier(.34,1.56,.64,1)';
}

function preventWrong(e) {
  e.preventDefault();
  e.stopPropagation();
}

// ─────────────────────────────────────────────────────
// 6.  CONFETTI
// ─────────────────────────────────────────────────────
const CONFETTI = ['💕','🌸','✨','💖','🎉','🌺','🎊','💗','🌷','🥰'];

function launchConfetti() {
  const container = document.getElementById('confettiContainer');
  if (!container) return;

  for (let i = 0; i < 40; i++) {
    setTimeout(() => {
      const el = document.createElement('span');
      el.classList.add('confetti-piece');
      el.textContent = CONFETTI[Math.floor(Math.random() * CONFETTI.length)];
      el.style.left             = rand(0, 100) + '%';
      el.style.fontSize         = rand(14, 28) + 'px';
      const dur                 = rand(2.5, 5);
      el.style.animationDuration = dur + 's';
      el.style.animationDelay   = rand(0, 1.5) + 's';
      container.appendChild(el);
      setTimeout(() => el.remove(), (dur + 2) * 1000);
    }, i * 60);
  }
}

// ─────────────────────────────────────────────────────
// 7.  TULIP PAGE
// ─────────────────────────────────────────────────────
function goToTulip() {
  const finalPage  = document.getElementById('pageFinal');
  const tulipPage  = document.getElementById('pageTulip');

  // Slide out final page
  finalPage.classList.remove('active');
  finalPage.classList.add('exit');
  setTimeout(() => finalPage.classList.remove('exit'), 600);

  // Reset tulip animations by cloning & replacing the SVG
  const stage = document.getElementById('tulipStage');
  const oldSvg = stage.querySelector('svg');
  if (oldSvg) {
    const newSvg = oldSvg.cloneNode(true);
    oldSvg.replaceWith(newSvg);
  }

  // Slide in tulip page
  tulipPage.classList.add('active');
  currentPage = 'tulip';
}

// ─────────────────────────────────────────────────────
// 8.  PHOTOS PAGE
// ─────────────────────────────────────────────────────
const PHOTO_DELAYS = [0.1, 0.55, 1.0, 1.45]; // seconds, staggered

function goToPhotos() {
  const tulipPage  = document.getElementById('pageTulip');
  const photosPage = document.getElementById('pagePhotos');

  // Slide out tulip page
  tulipPage.classList.remove('active');
  tulipPage.classList.add('exit');
  setTimeout(() => tulipPage.classList.remove('exit'), 600);

  // Reset: remove .dropping from all frames so animation can replay
  const frames = photosPage.querySelectorAll('.p-frame');
  frames.forEach(f => {
    f.classList.remove('dropping');
    f.style.opacity = '0';
  });

  // Hide love message
  const msg = document.getElementById('photosMsg');
  if (msg) msg.classList.remove('visible');

  // Slide in photos page
  photosPage.classList.add('active');
  currentPage = 'photos';

  // Trigger drop animations next frame (allow reflow)
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      frames.forEach((f, i) => {
        f.style.setProperty('--drop-delay', PHOTO_DELAYS[i] + 's');
        f.style.opacity = '';
        f.classList.add('dropping');
      });
    });
  });

  // Show love message after last photo settles
  // Last delay: 1.45s + animation 1.15s = ~2.6s, add buffer = 3.2s
  setTimeout(() => {
    if (msg) msg.classList.add('visible');
  }, 3200);
}

// ─────────────────────────────────────────────────────
// 8.  RESTART
// ─────────────────────────────────────────────────────
function restartGame() {
  // Reset wrong-button positions
  document.querySelectorAll('.wrong-btn').forEach(btn => {
    btn.style.position   = '';
    btn.style.left       = '';
    btn.style.top        = '';
    btn.style.transition = '';
    btn.style.zIndex     = '';
  });

  // Reset correct-btn states
  document.querySelectorAll('.correct-btn').forEach(btn => {
    btn.classList.remove('answered');
    // Restore original content by re-reading data attribute
  });

  // Rebuild Yes buttons (they had innerHTML cleared)
  const btnDefs = [
    { id: 'q1-yes', icon: '🥰', label: 'Yes!',     q: 1 },
    { id: 'q2-yes', icon: '💞', label: 'Forever!', q: 2 },
    { id: 'q3-yes', icon: '💗', label: 'Always!',  q: 3 },
    { id: 'q4-yes', icon: '🤭', label: 'I promise!', q: 4 },
    { id: 'q5-yes', icon: '🥰', label: 'Ready!',  q: 5 },
  ];

  btnDefs.forEach(({ id, icon, label, q }) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.innerHTML = '';
    const iconEl = document.createElement('span');
    iconEl.className = 'btn-icon';
    iconEl.textContent = icon;
    const lblEl = document.createElement('span');
    lblEl.textContent = label;
    btn.appendChild(iconEl);
    btn.appendChild(lblEl);
    btn.classList.remove('answered');
    btn.onclick = () => handleAnswer(q, true);
  });

  // Hide whichever end-page is active, show page 1
  ['pageFinal', 'pageTulip', 'pagePhotos', 'pageSinglePhoto', 'pageSorry', 'pageTrueLove'].forEach(id => {
    const pg = document.getElementById(id);
    if (!pg) return;
    pg.classList.remove('active');
    pg.classList.add('exit');
    setTimeout(() => pg.classList.remove('exit'), 600);
  });

  currentPage = 1;
  const p1 = document.getElementById('page1');
  p1.classList.add('active');
}

// ─────────────────────────────────────────────────────
// 9.  NEW SEQUENCE (Single Photo, Sorry, True Love)
// ─────────────────────────────────────────────────────
function goToSinglePhoto() {
  const photosPage = document.getElementById('pagePhotos');
  const singlePage = document.getElementById('pageSinglePhoto');

  photosPage.classList.remove('active');
  photosPage.classList.add('exit');
  setTimeout(() => photosPage.classList.remove('exit'), 600);

  singlePage.classList.add('active');
  currentPage = 'singlePhoto';
}

function goToSorry() {
  const singlePage = document.getElementById('pageSinglePhoto');
  const sorryPage  = document.getElementById('pageSorry');

  singlePage.classList.remove('active');
  singlePage.classList.add('exit');
  setTimeout(() => singlePage.classList.remove('exit'), 600);

  sorryPage.classList.add('active');
  currentPage = 'sorry';
}

function goToTrueLove() {
  const sorryPage    = document.getElementById('pageSorry');
  const trueLovePage = document.getElementById('pageTrueLove');

  sorryPage.classList.remove('active');
  sorryPage.classList.add('exit');
  setTimeout(() => sorryPage.classList.remove('exit'), 600);

  trueLovePage.classList.add('active');
  currentPage = 'trueLove';

  // Launch confetti on true love page
  setTimeout(() => {
    const container = document.getElementById('confettiContainer2');
    if (!container) return;
    for (let i = 0; i < 40; i++) {
      setTimeout(() => {
        const el = document.createElement('span');
        el.classList.add('confetti-piece');
        el.textContent = CONFETTI[Math.floor(Math.random() * CONFETTI.length)];
        el.style.left             = rand(0, 100) + '%';
        el.style.fontSize         = rand(14, 28) + 'px';
        const dur                 = rand(2.5, 5);
        el.style.animationDuration = dur + 's';
        el.style.animationDelay   = rand(0, 1.5) + 's';
        container.appendChild(el);
        setTimeout(() => el.remove(), (dur + 2) * 1000);
      }, i * 60);
    }
  }, 300);
}

// ─────────────────────────────────────────────────────
// 10. KICK OFF
// ─────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  // Start after a tiny delay for fonts to load
  setTimeout(startLoading, 300);
});
