(function attachOverlayScrollbar(selector = '#agentThread') {
    const container = document.querySelector(selector);
    if (!container) return;
  
    // Inject overlay once
    if (!container.querySelector('.scrollbar-overlay')) {
      const overlay = document.createElement('div');
      overlay.className = 'scrollbar-overlay';
      overlay.innerHTML = '<div class="scrollbar-track"></div><div class="scrollbar-thumb"></div>';
      container.appendChild(overlay);
    }
  
    const thumb = container.querySelector('.scrollbar-thumb');
    const TRACK_INSET_TOP = 8;      // match CSS
    const TRACK_INSET_BOTTOM = 8;   // match CSS
    const MIN_THUMB = 32;
  
    let raf = null;
    function scheduleUpdate(){
      if (raf) return;
      raf = requestAnimationFrame(() => { update(); raf = null; });
    }
  
    function update() {
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      const scrollTop = container.scrollTop;
  
      const hasOverflow = scrollHeight > clientHeight + 1;
      if (!hasOverflow) {
        container.classList.remove('overlay-visible');
        thumb.style.display = 'none';
        return;
      }
      container.classList.add('overlay-visible');
      thumb.style.display = 'block';
  
      const trackHeight = clientHeight - TRACK_INSET_TOP - TRACK_INSET_BOTTOM;
      const visibleFraction = clientHeight / scrollHeight;
      const thumbHeight = Math.max(MIN_THUMB, Math.round(trackHeight * visibleFraction));
  
      const maxScroll = scrollHeight - clientHeight;
      const maxThumbTravel = trackHeight - thumbHeight;
      const scrollFraction = maxScroll > 0 ? scrollTop / maxScroll : 0;
      const thumbTop = TRACK_INSET_TOP + Math.round(maxThumbTravel * scrollFraction);
  
      thumb.style.height = thumbHeight + 'px';
      thumb.style.top = thumbTop + 'px';
    }
  
    // Events
    container.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('load', scheduleUpdate);
  
    // React to dynamic content
    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(scheduleUpdate);
      ro.observe(container);
      // If messages are inside a specific child, observe that instead:
      // ro.observe(container.querySelector('.messages') || container);
    }
    if ('MutationObserver' in window) {
      const mo = new MutationObserver(scheduleUpdate);
      mo.observe(container, { childList: true, subtree: true });
    }
  
    // Initial paint
    scheduleUpdate();
  })();
  
  