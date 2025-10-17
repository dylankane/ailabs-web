// Card Carousel with Progress Bar
document.addEventListener('DOMContentLoaded', function() {
    const carousels = document.querySelectorAll('.agent-cards');
    
    carousels.forEach(carouselContainer => {
        const carousel = carouselContainer.querySelector('.cards-carousel');
        if (!carousel) return;
        
        const track = carousel.querySelector('.cards-track');
        const cards = Array.from(track.querySelectorAll('.idea-card'));
        const controls = carouselContainer.querySelector('.carousel-controls');
        const prevBtn = controls.querySelector('.prev-btn');
        const nextBtn = controls.querySelector('.next-btn');
        const progressFill = controls.querySelector('.progress-fill');
        
        if (cards.length === 0) return;
        
        let currentIndex = 0;
        let autoPlayInterval;
        let isAutoPlaying = true;
        const autoPlayDelay = 5000; // 5 seconds
        
        // Determine cards per view based on screen size
        function getCardsPerView() {
            return window.innerWidth <= 768 ? 1 : 2;
        }
        
        // Calculate maximum index (last position where we can still see full cards)
        function getMaxIndex() {
            const cardsPerView = getCardsPerView();
            return Math.max(0, cards.length - cardsPerView);
        }
        
        // Update carousel position
        function updateCarousel(animate = true) {
            const cardWidth = cards[0].offsetWidth;
            const gap = parseFloat(getComputedStyle(track).gap) || 0;
            // Move by one card at a time
            const offset = currentIndex * (cardWidth + gap);
            
            track.style.transition = animate ? 'transform 0.5s ease' : 'none';
            track.style.transform = `translateX(-${offset}px)`;
            
            // Update progress bar
            const maxIndex = getMaxIndex();
            const progress = maxIndex > 0 ? ((currentIndex) / maxIndex) * 100 : 100;
            progressFill.style.width = `${progress}%`;
            
            // Update button states
            prevBtn.disabled = currentIndex === 0;
            nextBtn.disabled = currentIndex >= maxIndex;
        }
        
        // Go to next slide
        function nextSlide() {
            const maxIndex = getMaxIndex();
            if (currentIndex < maxIndex) {
                currentIndex++;
            } else {
                currentIndex = 0; // Loop back to start
            }
            updateCarousel();
        }
        
        // Go to previous slide
        function prevSlide() {
            if (currentIndex > 0) {
                currentIndex--;
                updateCarousel();
            }
        }
        
        // Start auto-play
        function startAutoPlay() {
            if (!isAutoPlaying) return;
            autoPlayInterval = setInterval(() => {
                nextSlide();
            }, autoPlayDelay);
        }
        
        // Stop auto-play
        function stopAutoPlay() {
            isAutoPlaying = false;
            clearInterval(autoPlayInterval);
        }
        
        // Event listeners
        nextBtn.addEventListener('click', () => {
            stopAutoPlay();
            nextSlide();
        });
        
        prevBtn.addEventListener('click', () => {
            stopAutoPlay();
            prevSlide();
        });
        
        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const maxIndex = getMaxIndex();
                if (currentIndex > maxIndex) {
                    currentIndex = maxIndex;
                }
                updateCarousel(false);
            }, 250);
        });
        
        // Handle card expansion
        const expandButtons = carouselContainer.querySelectorAll('.btn-expand');
        const closeButtons = carouselContainer.querySelectorAll('.btn-close-expand');
        
        expandButtons.forEach((btn, index) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                
                const card = btn.closest('.idea-card');
                const expandedSection = card.querySelector('.card-expanded');
                const isActive = expandedSection.classList.contains('active');
                
                // Close all other expanded cards in this carousel
                carouselContainer.querySelectorAll('.card-expanded.active').forEach(section => {
                    section.classList.remove('active');
                    section.closest('.idea-card').classList.remove('expanded');
                });
                
                // Toggle this card (if it wasn't already open)
                if (!isActive) {
                    stopAutoPlay(); // Pause carousel when expanding
                    expandedSection.classList.add('active');
                    card.classList.add('expanded');
                }
            });
        });
        
        closeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const card = btn.closest('.idea-card');
                const expandedSection = card.querySelector('.card-expanded');
                
                expandedSection.classList.remove('active');
                card.classList.remove('expanded');
                // Note: Auto-play remains paused after user interaction
            });
        });
        
        // Initialize
        updateCarousel(false);
        startAutoPlay();
    });
});
