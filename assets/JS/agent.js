const form   = document.querySelector('.agent-form');
const input  = document.getElementById('agentInput');
const thread = document.getElementById('agentThread');
const card   = document.querySelector('.agent-card');

/* ---------- Sentinel + Spacer setup ---------- */
/* sentinel: sits BEFORE the form and tells us when the form reached the top */
const sentinel = document.createElement('div');
sentinel.className = 'agent-form-sentinel';
form.parentNode.insertBefore(sentinel, form);

/* spacer: occupies the form's place when we fix it */
const spacer = document.createElement('div');
spacer.className = 'agent-form-spacer';
form.parentNode.insertBefore(spacer, form);

/* ---------- Fix/unfix with scroll direction ---------- */
let lastScrollY = window.scrollY;

function setFixed(on){
  if (on){
    if (!form.classList.contains('is-fixed')){
      form.classList.add('is-fixed');
      spacer.classList.add('show');
      spacer.style.height = form.offsetHeight + 'px';
    }
  } else {
    if (form.classList.contains('is-fixed')){
      form.classList.remove('is-fixed');
      spacer.classList.remove('show');
      spacer.style.height = '0px';
    }
  }
}

const io = new IntersectionObserver((entries) => {
  const e = entries[0];
  const scrollingDown = window.scrollY > lastScrollY;
  lastScrollY = window.scrollY;

  // Fix ONLY when scrolling down and the sentinel has passed the top
  if (!e.isIntersecting && scrollingDown && e.boundingClientRect.top <= 0) {
    setFixed(true);
    return;
  }
  // Unfix otherwise (scrolling up or sentinel visible)
  setFixed(false);
}, { root: null, threshold: 0 });
io.observe(sentinel);

/* Keep spacer height in sync on resize (in case form height changes) */
window.addEventListener('resize', () => {
  if (form.classList.contains('is-fixed')){
    spacer.style.height = form.offsetHeight + 'px';
  }
});

/* ---------- Docking helpers ---------- */

function viewportH(){
  return (window.visualViewport?.height ?? window.innerHeight);
}

/**
 * Dock the agent-card so its bottom sits at the viewport bottom.
 * @param {'smooth'|'instant'|'auto'} behavior
 * @param {number} offset additional pixels to keep above viewport bottom (usually 0; you have padding in CSS)
 * @param {boolean} onlyIfBelow if true, only dock when card bottom is currently below the viewport bottom
 */
function dockCardBottom(behavior = 'smooth', offset = 0, onlyIfBelow = false){
  const viewH = viewportH();
  const desiredBottom = viewH - offset;
  const rect = card.getBoundingClientRect();
  const docBottom = rect.bottom + window.scrollY;

  if (onlyIfBelow && rect.bottom <= desiredBottom + 1) return;

  const targetScrollY = Math.max(0, docBottom - desiredBottom);
  window.scrollTo({ top: targetScrollY, behavior });
}

/* ---------- Thread visibility helpers ---------- */

function scrollThreadToBottom(){
  thread.scrollTop = thread.scrollHeight - thread.clientHeight;
}

/**
 * Reveal a specific bubble according to rules:
 * - If bubble taller than thread viewport:
 *    user -> show bottom of bubble
 *    bot  -> show top of bubble
 * - Else: standard "scroll to bottom"
 */
function revealBubble(bubble, who /* 'user' | 'bot' */){
  const viewport = thread.clientHeight;
  const bubbleTop = bubble.offsetTop;
  const bubbleHeight = bubble.offsetHeight;

  if (bubbleHeight > viewport){
    if (who === 'user'){
      thread.scrollTop = bubbleTop + bubbleHeight - viewport; // bottom of user bubble
    } else {
      thread.scrollTop = bubbleTop; // top of bot bubble
    }
  } else {
    // no overflow, keep usual behavior (end-of-thread)
    scrollThreadToBottom();
  }
}

/* ---------- Input focus/typing behavior ---------- */

/**
 * If the input/card is below the viewport, typing/focus should immediately dock it.
 */
function maybeDockOnFocusOrType(evtType){
  if (form.classList.contains('is-fixed')) return; // when fixed at top, don't change on typing; submit will dock

  const rect = card.getBoundingClientRect();
  const viewH = viewportH();
  const behavior = (evtType === 'input') ? 'instant' : 'smooth';

  // Only dock if the card bottom is below the viewport (i.e., input not fully visible)
  if (rect.bottom > viewH + 1){
    dockCardBottom(behavior, 0, /*onlyIfBelow*/ false);
  }
}

input.addEventListener('focus', () => maybeDockOnFocusOrType('focus'));
input.addEventListener('input', () => maybeDockOnFocusOrType('input'));

/* ---------- Submit handler ---------- */
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const val = input.value.trim();
  if (!val) return;

  // user bubble
  const user = document.createElement('div');
  user.className = 'msg user';
  user.textContent = val;
  thread.appendChild(user);
  input.value = '';

  // Always dock on send (even if fixed or mid-page), then reveal bubble
  requestAnimationFrame(() => {
    dockCardBottom('smooth', 0, /*onlyIfBelow*/ false);

    // After docking completes a frame later, reveal the proper part of the bubble
    requestAnimationFrame(() => {
      revealBubble(user, 'user');
      if (form.classList.contains('is-fixed')){
        spacer.style.height = form.offsetHeight + 'px';
      }
    });
  });

  // mock bot reply
  setTimeout(() => {
    const bot = document.createElement('div');
    bot.className = 'msg';
    bot.textContent = "Got it. (This will be wired to your Voiceflow agent later.)";
    thread.appendChild(bot);

    requestAnimationFrame(() => {
      dockCardBottom('smooth', 0, /*onlyIfBelow*/ false);

      requestAnimationFrame(() => {
        revealBubble(bot, 'bot');
        if (form.classList.contains('is-fixed')){
          spacer.style.height = form.offsetHeight + 'px';
        }
      });
    });
  }, 400);
});
