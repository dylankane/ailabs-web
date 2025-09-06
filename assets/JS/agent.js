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

/* ---------- Thread visibility helpers ---------- */

/* Always show the newest bubble inside the thread */
function scrollThreadToBottom(){
  thread.scrollTop = thread.scrollHeight - thread.clientHeight;
}

/* If input is NOT fixed, keep the CARD bottom aligned to the viewport bottom (no extra gap) */
function keepCardBottomOnScreen(){
  if (form.classList.contains('is-fixed')) return; // only when not fixed

  const viewportH = (window.visualViewport?.height ?? window.innerHeight);
  const desiredBottom = viewportH; // no offset gap
  const cardBottom = card.getBoundingClientRect().bottom;
  const delta = cardBottom - desiredBottom;

  if (delta > 0){
    window.scrollBy({ top: delta, behavior: 'smooth' });
  }
}

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

  // make newest visible and keep the card bottom on-screen
  requestAnimationFrame(() => {
    scrollThreadToBottom();
    keepCardBottomOnScreen();
    if (form.classList.contains('is-fixed')){
      spacer.style.height = form.offsetHeight + 'px';
    }
  });

  // mock bot reply
  setTimeout(() => {
    const bot = document.createElement('div');
    bot.className = 'msg';
    bot.textContent = "Got it. (This will be wired to your Voiceflow agent later.)";
    thread.appendChild(bot);

    requestAnimationFrame(() => {
      scrollThreadToBottom();
      keepCardBottomOnScreen();
      if (form.classList.contains('is-fixed')){
        spacer.style.height = form.offsetHeight + 'px';
      }
    });
  }, 400);
});
