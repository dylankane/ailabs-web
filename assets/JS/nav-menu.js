// Menu open/close
const menuToggle = document.getElementById('menuToggle');
const siteMenu = document.getElementById('siteMenu');

function closeMenu() {
  siteMenu.classList.remove('open');
  siteMenu.setAttribute('aria-hidden', 'true');
  menuToggle.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('no-scroll');
  menuToggle.focus();
}

function openMenu() {
  siteMenu.classList.add('open');
  siteMenu.setAttribute('aria-hidden', 'false');
  menuToggle.setAttribute('aria-expanded', 'true');
  document.body.classList.add('no-scroll');
}

menuToggle.addEventListener('click', () => {
  if (siteMenu.classList.contains('open')) {
    closeMenu();
  } else {
    openMenu();
  }
});

siteMenu.addEventListener('click', (e) => {
  // Close if clicking backdrop or a link
  if (e.target === siteMenu || e.target.closest('a')) closeMenu();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && siteMenu.classList.contains('open')) closeMenu();
});
