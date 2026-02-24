document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  // ===================
  // UTILITY FUNCTIONS
  // ===================
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  };

  const throttle = (func, limit) => {
    let inThrottle;
    return (...args) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  // ===================
  // COUNTER ANIMATION (Optimized)
  // ===================
  const initCounters = () => {
    const counters = document.querySelectorAll('.count');
    if (!counters.length) return;

    const animateCounter = (counter) => {
      const target = parseFloat(counter.getAttribute('data-target'));
      const duration = 2000; // 2 seconds (30s was too slow)
      const startTime = performance.now();
      const startValue = 0;

      const updateCount = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = startValue + (target - startValue) * easeOutQuart;

        counter.innerText = target % 1 !== 0 ? current.toFixed(1) : Math.floor(current);

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        } else {
          counter.innerText = target;
        }
      };

      requestAnimationFrame(updateCount);
    };

    // Intersection Observer for counters (only animate when visible)
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
          entry.target.classList.add('counted');
          animateCounter(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));
  };

  // ===================
  // TESTIMONIAL SLIDER (Enhanced)
  // ===================
  const initTestimonials = () => {
    const testimonials = document.querySelectorAll(".testimonial");
    const nextBtn = document.getElementById("nextTestimonial");
    const prevBtn = document.getElementById("prevTestimonial");
    
    if (!testimonials.length) return;

    let index = 0;
    let autoSlideInterval;
    const autoSlideDelay = 5000; // 5 seconds

    const showTestimonial = (i) => {
      testimonials.forEach((t) => {
        t.classList.remove("active");
        t.style.opacity = "0";
        t.style.transform = "translateX(20px)";
      });
      
      testimonials[i].classList.add("active");
      // Small delay for transition
      setTimeout(() => {
        testimonials[i].style.opacity = "1";
        testimonials[i].style.transform = "translateX(0)";
      }, 50);
    };

    const nextSlide = () => {
      index = (index + 1) % testimonials.length;
      showTestimonial(index);
    };

    const prevSlide = () => {
      index = (index - 1 + testimonials.length) % testimonials.length;
      showTestimonial(index);
    };

    const startAutoSlide = () => {
      autoSlideInterval = setInterval(nextSlide, autoSlideDelay);
    };

    const stopAutoSlide = () => {
      clearInterval(autoSlideInterval);
    };

    // Initialize
    showTestimonial(index);
    startAutoSlide();

    // Event listeners with pause on hover
    nextBtn?.addEventListener("click", () => {
      stopAutoSlide();
      nextSlide();
      startAutoSlide();
    });

    prevBtn?.addEventListener("click", () => {
      stopAutoSlide();
      prevSlide();
      startAutoSlide();
    });

    // Pause on hover
    const testimonialContainer = document.querySelector('.testimonial-wrapper');
    testimonialContainer?.addEventListener('mouseenter', stopAutoSlide);
    testimonialContainer?.addEventListener('mouseleave', startAutoSlide);

    // Touch support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    testimonialContainer?.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    testimonialContainer?.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    const handleSwipe = () => {
      const swipeThreshold = 50;
      const diff = touchStartX - touchEndX;
      
      if (Math.abs(diff) > swipeThreshold) {
        stopAutoSlide();
        if (diff > 0) nextSlide();
        else prevSlide();
        startAutoSlide();
      }
    };
  };

  // ===================
  // MOBILE MENU (Enhanced)
  // ===================
  const initMobileMenu = () => {
    const hamburger = document.getElementById("hamburger");
    const mobileMenu = document.getElementById("mobileMenu");
    const closeMenu = document.getElementById("closeMenu");

    if (!hamburger || !mobileMenu) return;

    const openMenu = () => {
      mobileMenu.classList.add("active");
      document.body.style.overflow = "hidden";
      // Add backdrop
      const backdrop = document.createElement('div');
      backdrop.id = 'menuBackdrop';
      backdrop.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.5);
        z-index: 9998;
        opacity: 0;
        transition: opacity 0.3s ease;
      `;
      document.body.appendChild(backdrop);
      setTimeout(() => backdrop.style.opacity = '1', 10);
      
      backdrop.addEventListener('click', closeMenuFn);
    };

    const closeMenuFn = () => {
      mobileMenu.classList.remove("active");
      document.body.style.overflow = "";
      const backdrop = document.getElementById('menuBackdrop');
      if (backdrop) {
        backdrop.style.opacity = '0';
        setTimeout(() => backdrop.remove(), 300);
      }
    };

    hamburger.addEventListener("click", openMenu);
    closeMenu?.addEventListener("click", closeMenuFn);

    // Close on link click
    document.querySelectorAll('#mobileMenu a').forEach(link => {
      link.addEventListener('click', closeMenuFn);
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
        closeMenuFn();
      }
    });
  };

  // ===================
  // SMOOTH SCROLL (Enhanced)
  // ===================
  const initSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;

        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      });
    });
  };

  // ===================
  // SCROLL REVEAL ANIMATION
  // ===================
  const initScrollReveal = () => {
    const revealElements = document.querySelectorAll(
      '.project-card, .service-card, .stat-box, .some-companies, .articles-header'
    );

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target); // Only animate once
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      revealObserver.observe(el);
    });

    // Add CSS class for revealed state
    const style = document.createElement('style');
    style.textContent = `
      .revealed {
        opacity: 1 !important;
        transform: translateY(0) !important;
      }
    `;
    document.head.appendChild(style);
  };

  // ===================
  // HEADER SCROLL EFFECT
  // ===================
  const initHeaderScroll = () => {
    const header = document.getElementById('first-header');
    if (!header) return;

    const handleScroll = throttle(() => {
      if (window.scrollY > 100) {
        header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
        header.style.padding = '0 20px';
      } else {
        header.style.boxShadow = 'none';
      }
    }, 100);

    window.addEventListener('scroll', handleScroll);
  };

  // ===================
  // FORM VALIDATION & SUBMISSION
  // ===================
  const initFormHandling = () => {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = form.querySelector('.send-button');
      const originalText = submitBtn.textContent;
      
      // Basic validation
      const inputs = form.querySelectorAll('input, textarea');
      let isValid = true;
      
      inputs.forEach(input => {
        if (!input.value.trim()) {
          isValid = false;
          input.style.borderColor = '#ff6b4a';
        } else {
          input.style.borderColor = '#e0e0e0';
        }
      });

      if (!isValid) {
        showNotification('Please fill in all fields', 'error');
        return;
      }

      // Loading state
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Sending...';

      // Simulate API call
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        showNotification('Message sent successfully!', 'success');
        form.reset();
      } catch (error) {
        showNotification('Failed to send message. Please try again.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  };

  // Notification helper
  const showNotification = (message, type) => {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      padding: 16px 24px;
      border-radius: 12px;
      color: white;
      font-weight: 600;
      z-index: 10000;
      transform: translateX(400px);
      transition: transform 0.3s ease;
      ${type === 'success' ? 'background: #8bd417;' : 'background: #ff6b4a;'}
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.style.transform = 'translateX(0)', 10);
    setTimeout(() => {
      notification.style.transform = 'translateX(400px)';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  };

  // ===================
  // LAZY LOADING IMAGES
  // ===================
  const initLazyLoading = () => {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  };

  // ===================
  // TYPED.JS (Your existing code - slightly enhanced)
  // ===================
  const initTyped = () => {
    const typedElement = document.querySelector('.typed-text');
    if (!typedElement || typeof Typed === 'undefined') return;

    new Typed('.typed-text', {
      strings: [
        "Software Developer", 
        "Développeur Logiciel",
        "UI/UX Designer",
        "Problem Solver"
      ],
      typeSpeed: 80,
      backSpeed: 50,
      backDelay: 2000,
      startDelay: 500,
      loop: true,
      smartBackspace: true,
      cursorChar: '|',
      autoInsertCss: true
    });
  };

  // ===================
  // VIEW ALL PROJECTS
  // ===================
  const initViewAllProjects = () => {
    const viewAllBtn = document.querySelector('.view');
    const hiddenProjects = document.querySelectorAll('.project-card.hidden');
    
    if (!viewAllBtn || !hiddenProjects.length) return;

    viewAllBtn.addEventListener('click', () => {
      const isExpanded = viewAllBtn.dataset.expanded === 'true';
      
      hiddenProjects.forEach((project, index) => {
        if (isExpanded) {
          project.style.display = 'none';
        } else {
          project.style.display = 'block';
          setTimeout(() => project.classList.add('revealed'), index * 100);
        }
      });

      viewAllBtn.textContent = isExpanded ? 'View All Projects' : 'Show Less';
      viewAllBtn.dataset.expanded = !isExpanded;
    });
  };

  // ===================
  // PERFORMANCE MONITORING
  // ===================
  const initPerformanceMetrics = () => {
    window.addEventListener('load', () => {
      const timing = performance.timing;
      const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
      console.log(`Page load time: ${pageLoadTime}ms`);
    });
  };

  // ===================
  // INITIALIZE ALL
  // ===================
  try {
    initCounters();
    initTestimonials();
    initMobileMenu();
    initSmoothScroll();
    initScrollReveal();
    initHeaderScroll();
    initFormHandling();
    initLazyLoading();
    initTyped();
    initViewAllProjects();
    initPerformanceMetrics();
    
    console.log('✅ All modules initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing modules:', error);
  }
});
