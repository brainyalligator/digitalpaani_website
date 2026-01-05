/**
 * Scroll-Based Carousel for Solutions Page
 * Single viewport with overlapping transitions
 * Both images and text change together based on scroll
 */

class ScrollCarousel {
    constructor() {
        this.images = document.querySelectorAll('.carousel-image');
        this.slides = document.querySelectorAll('.benefit-slide');
        this.currentSlide = 0;
        this.totalSlides = this.images.length;
        this.isTransitioning = false;
        this.minScrollTop = 0; // Minimum scroll position

        this.init();
    }

    init() {
        if (this.totalSlides === 0) return;

        // Set first slide as active
        this.images[0].classList.add('active');
        this.slides[0].classList.add('active');

        // Listen to window scroll events
        window.addEventListener('scroll', () => this.handleScroll());

        // Store initial scroll position
        this.minScrollTop = window.pageYOffset || document.documentElement.scrollTop;

        console.log('✅ ScrollCarousel initialized:', {
            totalSlides: this.totalSlides,
            pageHeight: document.body.scrollHeight,
            viewportHeight: window.innerHeight,
            minScrollTop: this.minScrollTop
        });
    }

    handleScroll() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Prevent scrolling above initial position
        if (scrollTop < this.minScrollTop) {
            window.scrollTo(0, this.minScrollTop);
            return;
        }

        if (this.isTransitioning) return;

        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const adjustedScroll = scrollTop - this.minScrollTop;
        const adjustedMaxScroll = maxScroll - this.minScrollTop;

        // Calculate which slide should be active based on scroll percentage
        // Divide scroll into equal sections for each slide
        const scrollPercentage = adjustedScroll / adjustedMaxScroll;
        const slideIndex = Math.min(
            Math.floor(scrollPercentage * this.totalSlides),
            this.totalSlides - 1
        );

        console.log('📜 Scroll:', {
            scrollTop: scrollTop.toFixed(0),
            adjustedScroll: adjustedScroll.toFixed(0),
            percentage: (scrollPercentage * 100).toFixed(1) + '%',
            currentSlide: this.currentSlide,
            targetSlide: slideIndex
        });

        // Only update if the slide has changed
        if (slideIndex !== this.currentSlide) {
            this.changeSlide(slideIndex);
        }
    }

    changeSlide(newSlideIndex) {
        if (newSlideIndex === this.currentSlide) return;

        console.log('🔄 Transitioning from slide', this.currentSlide, 'to slide', newSlideIndex);

        this.isTransitioning = true;

        // Remove active class from current slide
        this.images[this.currentSlide].classList.remove('active');
        this.slides[this.currentSlide].classList.remove('active');

        // Update current slide
        this.currentSlide = newSlideIndex;

        // Add active class to new slide (triggers upward fade animation)
        this.images[this.currentSlide].classList.add('active');
        this.slides[this.currentSlide].classList.add('active');

        // Allow new transitions after animation completes
        setTimeout(() => {
            this.isTransitioning = false;
        }, 800);
    }
}

// Initialize carousel when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ScrollCarousel();
    });
} else {
    new ScrollCarousel();
}
