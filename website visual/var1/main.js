// Main JavaScript file for DigitalPaani website
// This file contains hooks and setup for future Three.js scroll-based animation

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    init();
});

/**
 * Initialize the page and prepare for Three.js animation
 */
function init() {
    const animationContainer = document.getElementById('threejs-container');
    
    if (!animationContainer) {
        console.warn('Three.js container not found');
        return;
    }

    // Hook for Three.js scroll-based animation
    // This is where the Three.js scene will be initialized and mounted
    // Example structure:
    // 
    // function initThreeJSAnimation() {
    //     const scene = new THREE.Scene();
    //     const camera = new THREE.PerspectiveCamera(...);
    //     const renderer = new THREE.WebGLRenderer({ container: animationContainer });
    //     
    //     // Scroll-based animation logic
    //     window.addEventListener('scroll', () => {
    //         const scrollProgress = calculateScrollProgress();
    //         updateAnimation(scrollProgress);
    //     });
    // }
    //
    // initThreeJSAnimation();

    console.log('Page initialized. Three.js animation container ready at:', animationContainer);
}

/**
 * Placeholder function for calculating scroll progress
 * This will be used by the Three.js animation to sync with scroll position
 * 
 * @returns {number} Scroll progress value between 0 and 1
 */
function calculateScrollProgress() {
    const heroSection = document.querySelector('.hero');
    if (!heroSection) return 0;

    const rect = heroSection.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const sectionTop = rect.top;
    const sectionHeight = rect.height;

    // Calculate progress based on scroll position within hero section
    const progress = Math.max(0, Math.min(1, (windowHeight - sectionTop) / sectionHeight));
    return progress;
}

/**
 * Export function for Three.js animation integration
 * This can be called from external Three.js code to get scroll progress
 */
window.getScrollProgress = calculateScrollProgress;

