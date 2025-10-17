// Infinite Logo Carousel
document.addEventListener('DOMContentLoaded', function() {
    const carousels = document.querySelectorAll('.logos-carousel');
    
    carousels.forEach(carousel => {
        const track = carousel.querySelector('.logos-track');
        if (!track) return;
        
        const logos = Array.from(track.children);
        if (logos.length === 0) return;
        
        // Clone all logos to create seamless loop
        logos.forEach(logo => {
            const clone = logo.cloneNode(true);
            track.appendChild(clone);
        });
        
        // Calculate animation duration based on number of logos
        // More logos = longer duration for consistent speed
        const duration = logos.length * 5;
        track.style.animationDuration = `${duration}s`;
        
        // Start animation
        track.classList.add('animate');
    });
});
