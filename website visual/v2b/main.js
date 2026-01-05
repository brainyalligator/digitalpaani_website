/**
 * Simple Image Slideshow
 * Auto-advances through slides every 3.5 seconds
 * Uses smooth crossfade with gentle horizontal slide
 */

class Slideshow {
    constructor() {
        this.slides = document.querySelectorAll('.slide');
        this.currentIndex = 0;
        this.interval = 3500; // 3.5 seconds
        this.timerId = null;

        this.init();
    }

    init() {
        // Ensure first slide is visible
        if (this.slides.length > 0) {
            this.slides[0].classList.add('active');
        }

        // Start auto-advance
        this.start();

        // Pause on hover for better UX
        const container = document.querySelector('.slideshow-container');
        if (container) {
            container.addEventListener('mouseenter', () => this.pause());
            container.addEventListener('mouseleave', () => this.start());

            // Add click to advance functionality
            container.addEventListener('click', () => {
                this.nextSlide();
                // Reset the timer to continue auto-advancing from this point
                this.start();
            });

            // Add cursor pointer to indicate clickability
            container.style.cursor = 'pointer';
        }
    }

    start() {
        // Clear any existing timer
        this.pause();

        // Start new timer
        this.timerId = setInterval(() => {
            this.nextSlide();
        }, this.interval);
    }

    pause() {
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
    }

    nextSlide() {
        // Mark current slide as exiting
        this.slides[this.currentIndex].classList.add('exiting');
        this.slides[this.currentIndex].classList.remove('active');

        // Move to next slide
        this.currentIndex = (this.currentIndex + 1) % this.slides.length;

        // Activate next slide
        this.slides[this.currentIndex].classList.remove('exiting');
        this.slides[this.currentIndex].classList.add('active');

        // Clean up exiting class after transition completes
        setTimeout(() => {
            this.slides.forEach(slide => {
                if (!slide.classList.contains('active')) {
                    slide.classList.remove('exiting');
                }
            });
        }, 800);
    }
}

// Initialize slideshow when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new Slideshow();
    });
} else {
    new Slideshow();
}
