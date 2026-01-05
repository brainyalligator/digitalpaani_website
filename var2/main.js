// Main entry point - loads the Three.js animation
import './three/main.js';

// Hero text scroll-driven animation
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initHeroText();
    initHeroText2();
  });
} else {
  initHeroText();
  initHeroText2();
}

function initHeroText() {
  const heroHeadline = document.getElementById('hero-headline');
  if (!heroHeadline) return;

  // Register ScrollTrigger plugin
  if (window.gsap && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
  } else {
    console.warn('GSAP or ScrollTrigger not available');
    return;
  }

  // Split text into individual characters
  const lines = heroHeadline.querySelectorAll('.line');

  lines.forEach(line => {
    const nodes = Array.from(line.childNodes);
    line.innerHTML = '';

    nodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        // Split text node into character spans (including spaces)
        const text = node.textContent;
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          const charSpan = document.createElement('span');
          charSpan.className = char === ' ' ? 'char space' : 'char';
          charSpan.textContent = char;
          line.appendChild(charSpan);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('accent-text')) {
        // Preserve accent-text span and split its content
        const accentSpan = document.createElement('span');
        accentSpan.className = 'accent-text';

        const accentText = node.textContent;
        for (let i = 0; i < accentText.length; i++) {
          const charSpan = document.createElement('span');
          charSpan.className = 'char';
          charSpan.textContent = accentText[i];
          accentSpan.appendChild(charSpan);
        }

        line.appendChild(accentSpan);
      }
    });
  });

  // Get all characters in document order
  const chars = heroHeadline.querySelectorAll('.char');
  if (chars.length === 0) return;

  // Create scroll-scrubbed animation with fade in and fade out when crack appears
  // Text fades in briefly then fades away as crack appears on tank
  // Timeline: fade in (0-4%), hold visible (4-8%), fade out (8-10%), invisible (10-100%)
  // Crack appears at scroll 10%, so text fades out right when crack starts appearing
  const tl = window.gsap.timeline({
    scrollTrigger: {
      trigger: "#scroll-container",
      start: "top bottom",
      end: "bottom bottom",
      scrub: true
    }
  });

  // Fade in phase: enhanced blue-to-white color transition
  tl.fromTo(chars, {
    opacity: 0,
    x: -12,
    color: "#1b73e8"  // Start blue
  }, {
    opacity: 1,
    x: 0,
    color: "#ffffff",  // End white
    stagger: {
      amount: 0.3,
      from: "start"
    },
    ease: "power2.out",
    duration: 0.04  // 0-4%
  });

  // Hold visible (4-8%)
  tl.to({}, { duration: 0.04 });

  // Fade out phase: fade out when crack appears (8-10%)
  tl.to(chars, {
    opacity: 0,
    x: 12,
    stagger: {
      amount: 0.1,
      from: "start"
    },
    ease: "power2.in",
    duration: 0.02  // 8-10% (crack appears at 10%)
  });

  // Hold invisible for the rest of the scroll (10-100%)
  tl.to({}, { duration: 0.90 });
}

// Second hero text animation - appears before sensors attach
function initHeroText2() {
  const heroHeadline2 = document.getElementById('hero-headline-2');
  if (!heroHeadline2) return;

  // GSAP should already be registered from initHeroText
  if (!window.gsap || !window.ScrollTrigger) {
    console.warn('GSAP or ScrollTrigger not available for text 2');
    return;
  }

  // Split text into individual characters
  const lines = heroHeadline2.querySelectorAll('.line');

  lines.forEach(line => {
    const nodes = Array.from(line.childNodes);
    line.innerHTML = '';

    nodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        // Split text node into character spans (including spaces)
        const text = node.textContent;
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          const charSpan = document.createElement('span');
          charSpan.className = char === ' ' ? 'char space' : 'char';
          charSpan.textContent = char;
          line.appendChild(charSpan);
        }
      }
    });
  });

  // Get all characters in document order
  const chars = heroHeadline2.querySelectorAll('.char');
  if (chars.length === 0) return;

  // Create scroll-scrubbed animation timed during/after sensor flash, BEFORE dashboard
  // Sensors flash: 58-62%, dashboard appears: 63%
  // Timeline: hold invisible (0-58%), fade in (58-60%), fade out (60-62%), invisible (62-100%)
  // Brief appearance during sensor flash, fully gone before dashboard
  const tl2 = window.gsap.timeline({
    scrollTrigger: {
      trigger: "#scroll-container",
      start: "top bottom",
      end: "bottom bottom",
      scrub: true
    }
  });

  // Hold invisible until sensor flash begins (0-58%)
  tl2.to({}, { duration: 0.58 });

  // Fade in phase: quick blue-to-white transition (58-60%)
  tl2.fromTo(chars, {
    opacity: 0,
    x: -12,
    color: "#1b73e8"  // Start blue
  }, {
    opacity: 1,
    x: 0,
    color: "#ffffff",  // End white
    stagger: {
      amount: 0.2,  // Slightly faster stagger
      from: "start"
    },
    ease: "power2.out",
    duration: 0.02  // 2% of scroll
  });

  // Fade out phase: quick fade before dashboard (60-62%)
  tl2.to(chars, {
    opacity: 0,
    x: 12,
    stagger: {
      amount: 0.1,
      from: "start"
    },
    ease: "power2.in",
    duration: 0.02  // 2% of scroll, completes at 62%
  });

  // Hold invisible (62-100%) - fully gone before dashboard at 63%
  tl2.to({}, { duration: 0.38 });
}