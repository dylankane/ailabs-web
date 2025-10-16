// ball.js
(() => {
  const prefersReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const container = document.querySelector('.hero-container');
  const ball = document.querySelector('.hero-ball');
  const ballInner = document.querySelector('.hero-ball-inner');
  const h1 = document.querySelector('.hero-title h1');
  const inputWrap = document.querySelector('.agent-input');
  const welcomeTag = document.querySelector('.welcome-tag');
  if (!container || !ball || !ballInner || !h1 || !inputWrap) return;

  // --- Tunables ---
  const KISS = 1;      // px “touch” the input top border
  const SQUASH_X = 1.16;   // stronger squash
  const SQUASH_Y = 0.80;
  const DROP_MS = 1600;   // linear fall
  const SQUASH_MS = 100;    // impact squash
  const BOUNCE_MS = 1600;   // linear rise + short settle
  const OVERSHOOT_Y = 8;      // px overshoot before settle
  const WOBBLE_PX = 6;      // idle wobble amplitude
  const WOBBLE_MS = 1600;   // wobble period
  const WOBBLE_LOOPS = 3;      // stop after N loops

  const REST_X_NUDGE = 0;
  const REST_Y_NUDGE = 0;

  let anims = { drop: null, squash: null, rise: null, settle: null, wobble: null };
  let ranOnce = false; // whether the main animation has completed once

  function px(n) { return `${Math.round(n)}px`; }
  function sizePx(el) { return parseFloat(getComputedStyle(el).width); }

  async function readyFonts() {
    try { if (document.fonts && document.fonts.ready) await document.fonts.ready; } catch { }
  }

  function measure() {
    const D = sizePx(ball);
    const r = D / 2;

    const cont = container.getBoundingClientRect();
    const h1r = h1.getBoundingClientRect();
    const inr = inputWrap.getBoundingClientRect();

    // TRUE midpoint of H1 (horizontal + vertical)
    const restX = (h1r.left - cont.left) + (h1r.width / 2) - r + REST_X_NUDGE;
    const restY = (h1r.top - cont.top) + (h1r.height / 2) - r + REST_Y_NUDGE;

    // Impact Y (kiss input top border)
    const impactY = (inr.top - cont.top) - D - KISS;

    // Start off-screen above (aligned horizontally with rest)
    const startX = restX;
    const startY = -D * 1.6;

    return { D, r, startX, startY, restX, restY, impactY };
  }

  function setTransform(x, y, sx = 1, sy = 1) {
    ball.style.transform = `translate3d(${px(x)}, ${px(y)}, 0) scale(${sx}, ${sy})`;
  }

  function cancelAllAnims() {
    // Cancel saved handles
    Object.values(anims).forEach(a => { try { a?.cancel(); } catch { } });
    // Cancel any stray animations the element knows about
    try { ball.getAnimations().forEach(a => a.cancel()); } catch { }
    try { ballInner.getAnimations().forEach(a => a.cancel()); } catch { }
    // Clear handles
    anims = { drop: null, squash: null, rise: null, settle: null, wobble: null };
  }

  // 1) Linear fall
  function animateDrop(m) {
    anims.drop = ball.animate(
      [
        { transform: `translate3d(${px(m.startX)}, ${px(m.startY)}, 0) scale(1,1)` },
        { transform: `translate3d(${px(m.startX)}, ${px(m.impactY)}, 0) scale(1,1)` }
      ],
      { duration: DROP_MS, easing: 'linear', fill: 'forwards' }
    );
    return anims.drop.finished;
  }

  // 2) Exaggerated squash
  function animateSquash(m) {
    anims.squash = ball.animate(
      [
        { transform: `translate3d(${px(m.startX)}, ${px(m.impactY)}, 0) scale(1,1)` },
        { transform: `translate3d(${px(m.startX)}, ${px(m.impactY)}, 0) scale(${SQUASH_X}, ${SQUASH_Y})` },
        { transform: `translate3d(${px(m.startX)}, ${px(m.impactY)}, 0) scale(1,1)` }
      ],
      { duration: SQUASH_MS, easing: 'linear', fill: 'forwards' }
    );
    return anims.squash.finished;
  }

  // 3) Linear rise to overshoot, then eased settle
  function animateBounceToRest(m) {
    const riseMs = Math.round(BOUNCE_MS * 0.8);
    const settleMs = BOUNCE_MS - riseMs;

    anims.rise = ball.animate(
      [
        { transform: `translate3d(${px(m.startX)}, ${px(m.impactY)}, 0) scale(1,1)` },
        { transform: `translate3d(${px(m.restX)}, ${px(m.restY - OVERSHOOT_Y)}, 0) scale(0.99, 1.01)` }
      ],
      { duration: riseMs, easing: 'linear', fill: 'forwards' }
    );

    return anims.rise.finished.then(() => {
      // as the ball begins to settle, flip welcome-tag color
      welcomeTag?.classList.add('is-dark');

      anims.settle = ball.animate(
        [
          { transform: `translate3d(${px(m.restX)}, ${px(m.restY - OVERSHOOT_Y)}, 0) scale(0.99, 1.01)` },
          { transform: `translate3d(${px(m.restX)}, ${px(m.restY)}, 0) scale(1,1)` }
        ],
        { duration: settleMs, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', fill: 'forwards' }
      );

      return anims.settle.finished;
    });
  }

  // 4) Short-lived wobble (stops after WOBBLE_LOOPS)
  function startIdleWobbleOnce() {
    anims.wobble = ballInner.animate(
      [
        { transform: 'translateY(0px) scale(1)' },
        { transform: `translateY(-${WOBBLE_PX}px) scale(0.992)` },
        { transform: 'translateY(0px) scale(1)' }
      ],
      {
        duration: WOBBLE_MS,
        easing: 'ease-in-out',
        iterations: WOBBLE_LOOPS,
        direction: 'alternate',
        fill: 'forwards'
      }
    );
  }

  function recenterToRest() {
    cancelAllAnims();
    const m = measure();
    setTransform(m.restX, m.restY, 1, 1);
  }

  async function run() {
    await readyFonts();

    // prevent initial flash at (0,0): reveal offscreen, then measure
    ball.style.display = 'block';
    ball.style.transform = 'translate3d(-9999px,-9999px,0)';

    let m = measure();

    if (prefersReduce) {
      setTransform(m.restX, m.restY, 1, 1);
      welcomeTag?.classList.add('is-dark');
      ranOnce = true;
      return;
    }

    setTransform(m.startX, m.startY, 1, 1);

    try {
      await animateDrop(m);
      await animateSquash(m);
      await animateBounceToRest(m);
      startIdleWobbleOnce();
      ranOnce = true;
    } catch {
      // if animation is interrupted (e.g., resizing), snap to rest
      recenterToRest();
      ranOnce = true;
    }

    // Re-center on H1 midpoint after resize/orientation change (no replay)
    let timer;
    function debouncedRecenter() {
      clearTimeout(timer);
      timer = setTimeout(() => {
        recenterToRest();
      }, 100);
    }

    // Standard resize + orientation
    window.addEventListener('resize', debouncedRecenter);
    window.addEventListener('orientationchange', debouncedRecenter);

    // Visual viewport (mobile address bar / devtools drag)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', debouncedRecenter);
    }

    // If user resizes mid-animation, cancel and snap
    window.addEventListener('resize', () => {
      if (!ranOnce) recenterToRest();
    }, { passive: true });
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(run, 0);
  } else {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  }
})();
