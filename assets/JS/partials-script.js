async function loadHTML(id, file) {
    const el = document.getElementById(id);
    const res = await fetch(file);
    el.innerHTML = await res.text();

    // Page-specific tweak
    const heroTag = el.querySelector('.hero-tag');
    if (heroTag) {
        heroTag.outerHTML = '<h2 class="hero-tag">Our Products.</h2>';
    }
}

// tiny helper to load a script when we want
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src;
        s.onload = resolve;
        s.onerror = reject;
        document.body.appendChild(s);
    });
}

loadHTML("header", "/en/partials/header.html")
    .then(() => loadScript('/assets/js/nav-menu.js'));
    
loadHTML("footer", "/en/partials/footer.html");

loadHTML("hero", "/en/partials/hero.html")
    .then(() => loadScript('/assets/js/ball.js'))
    .then(() => loadScript('/assets/js/agent.js'));