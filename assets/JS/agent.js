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
let isFixed = false;
let isTransitioning = false;

function setFixed(on){
  if (on && !isFixed){
    isTransitioning = true;
    
    // Measure BEFORE changing anything to prevent layout shift
    const formHeight = form.offsetHeight;
    
    // Set spacer height FIRST (before adding class)
    spacer.style.height = formHeight + 'px';
    
    // Then add classes in next frame to ensure smooth transition
    requestAnimationFrame(() => {
      form.classList.add('is-fixed');
      spacer.classList.add('show');
      isFixed = true;
      
      // Allow time for the transition to complete
      setTimeout(() => {
        isTransitioning = false;
      }, 100);
    });
  } else if (!on && isFixed){
    isTransitioning = true;
    
    form.classList.remove('is-fixed');
    spacer.classList.remove('show');
    spacer.style.height = '0px';
    isFixed = false;
    
    setTimeout(() => {
      isTransitioning = false;
    }, 100);
  }
}

const io = new IntersectionObserver((entries) => {
  // Ignore callbacks during transition to prevent bouncing
  if (isTransitioning) return;
  
  const e = entries[0];
  
  // Fix when sentinel goes above viewport (not intersecting and above)
  if (!e.isIntersecting && e.boundingClientRect.top < 0) {
    setFixed(true);
  }
  // Unfix when sentinel comes back into view
  else if (e.isIntersecting) {
    setFixed(false);
  }
}, { root: null, threshold: 0, rootMargin: '0px' });
io.observe(sentinel);

/* Keep spacer height in sync on resize (in case form height changes) */
window.addEventListener('resize', () => {
  if (isFixed){
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
  if (isFixed) return; // when fixed at top, don't change on typing; submit will dock

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
      if (isFixed){
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
        if (isFixed){
          spacer.style.height = form.offsetHeight + 'px';
        }
      });
    });
  }, 400);
});
