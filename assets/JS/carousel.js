document.addEventListener('DOMContentLoaded', () => {
  const section  = document.querySelector('.section-5');
  if (!section) return; // safety check

  const carousel = section.querySelector('.carousel');
  const track    = section.querySelector('.carousel-track');
  const slides   = [...section.querySelectorAll('.slide')];
  const tabs     = [...section.querySelectorAll('.carousel-tab')];

  let index = 0;
  let timer;
  let userPaused = false;

  function slideWidth() {
    return carousel.clientWidth;
  }

  function applyTransform() {
    const x = -index * slideWidth();
    track.style.transform = `translate3d(${x}px, 0, 0)`;
  }

  function goToSlide(i) {
    index = (i + slides.length) % slides.length;
    applyTransform();
    tabs.forEach((tab, j) => tab.classList.toggle('is-active', j === index));
  }

  function nextSlide() { goToSlide(index + 1); }
  function startAuto() { if (!userPaused) timer = setInterval(nextSlide, 5000); }
  function stopAuto()  { clearInterval(timer); }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => {
      userPaused = true;
      stopAuto();
      goToSlide(i);
    });
  });

  let resizeRAF = null;
  window.addEventListener('resize', () => {
    if (resizeRAF) cancelAnimationFrame(resizeRAF);
    resizeRAF = requestAnimationFrame(applyTransform);
  });

  window.addEventListener('load', applyTransform);

  goToSlide(0);
  startAuto();
});
