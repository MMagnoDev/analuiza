/**
 * ANA LUIZA BERALDO — INTERACTION & SMOOTH SCROLL SCRIPT
 * Lenis Smooth Scroll, Staggered Reveal Animations & Continuous Auto Carousel
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. LENIS SMOOTH SCROLL INITIALIZATION
  // ==========================================
  let lenis = null;

  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.05,
      touchMultiplier: 1.6,
      infinite: false
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Smooth anchor navigation with Lenis
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId && targetId !== '#') {
          const targetElem = document.querySelector(targetId);
          if (targetElem) {
            e.preventDefault();
            lenis.scrollTo(targetElem, { offset: 0, duration: 1.2 });
          }
        }
      });
    });
  }

  // ==========================================
  // 2. REVEAL ON SCROLL OBSERVER
  // ==========================================
  const revealElements = document.querySelectorAll('.reveal-on-scroll');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('revealed'));
  }

  // ==========================================
  // 3. CONTINUOUS AUTOMATIC LOOP CAROUSEL (MOBILE)
  // ==========================================
  const carousel = document.getElementById('audienceCarousel');
  const dotsContainer = document.getElementById('audienceDots');

  if (carousel && dotsContainer) {
    const cards = carousel.querySelectorAll('.audience-card');
    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    let currentIndex = 0;
    let autoPlayInterval = null;
    let isProgrammaticScroll = false;
    let userResumeTimeout = null;

    // Update active dot
    function updateDots(index) {
      currentIndex = index;
      dots.forEach((dot, idx) => {
        if (idx === index) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }

    // Scroll to specific slide
    function goToSlide(index) {
      if (index >= 0 && index < cards.length) {
        isProgrammaticScroll = true;
        const targetCard = cards[index];
        const cardOffset = targetCard.offsetLeft - carousel.offsetLeft;
        
        carousel.scrollTo({
          left: cardOffset,
          behavior: 'smooth'
        });
        
        updateDots(index);

        // Reset programmatic flag after smooth scroll completes
        setTimeout(() => {
          isProgrammaticScroll = false;
        }, 600);
      }
    }

    // Auto-advance loop step
    function autoAdvance() {
      if (window.innerWidth <= 768) {
        let nextIndex = (currentIndex + 1) % cards.length;
        goToSlide(nextIndex);
      }
    }

    // Start auto loop timer
    function startAutoLoop() {
      stopAutoLoop();
      if (window.innerWidth <= 768) {
        autoPlayInterval = setInterval(autoAdvance, 3200);
      }
    }

    // Stop auto loop timer
    function stopAutoLoop() {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
      }
    }

    // Handle user manual touch / click
    function onUserInteraction() {
      stopAutoLoop();
      if (userResumeTimeout) clearTimeout(userResumeTimeout);
      // Resume autoplay after 4 seconds of idle
      userResumeTimeout = setTimeout(() => {
        startAutoLoop();
      }, 4000);
    }

    // Listen to manual user scroll only
    let scrollDebounce = null;
    carousel.addEventListener('scroll', () => {
      if (!isProgrammaticScroll) {
        onUserInteraction();
        if (scrollDebounce) clearTimeout(scrollDebounce);
        scrollDebounce = setTimeout(() => {
          const scrollLeft = carousel.scrollLeft;
          const cardWidth = cards[0].offsetWidth;
          if (cardWidth > 0) {
            const calculatedIndex = Math.round(scrollLeft / cardWidth);
            if (calculatedIndex >= 0 && calculatedIndex < cards.length && calculatedIndex !== currentIndex) {
              updateDots(calculatedIndex);
            }
          }
        }, 50);
      }
    }, { passive: true });

    // Touch events on carousel
    carousel.addEventListener('touchstart', onUserInteraction, { passive: true });
    carousel.addEventListener('pointerdown', onUserInteraction, { passive: true });

    // Dot click listeners
    dots.forEach((dot) => {
      dot.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
        onUserInteraction();
        goToSlide(idx);
      });
    });

    // Start initially
    startAutoLoop();

    // Check on resize / visibility
    window.addEventListener('resize', () => {
      if (window.innerWidth <= 768) {
        if (!autoPlayInterval) startAutoLoop();
      } else {
        stopAutoLoop();
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopAutoLoop();
      } else {
        startAutoLoop();
      }
    });
  }
});
