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



// ============================================
// PROJECT BUILDER LOGIC
// ============================================

let currentStep = 1;
const totalSteps = 4;

const projectData = {
    type: null,
    typeLabel: '',
    stage: null,
    stageLabel: '',
    urgency: 'standard',
    urgencyLabel: 'Standard',
    budget: '$5,000 - $10,000',
    projectName: '',
    description: '',
    name: '',
    email: ''
};

const budgetRanges = {
    1: '$200 - $300',
    2: '$400 - $500',
    3: '$600 - $700',
    4: '$800 - $900',
    5: '$1,200+'
};

const timelines = {
    mobile: '8-10 weeks',
    website: '4-6 weeks',
    'ai-agent': '3-5 weeks',
    custom: '6-12 weeks'
};

const stageTimelines = {
    idea: '8-10 weeks',
    designs: '6-8 weeks',
    mvp: '4-6 weeks'
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.project-builder')) {
        updateProgress();
        updateButtons();
        
        // Add input listeners
        ['projectDesc', 'userName', 'userEmail'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', checkCanProceed);
        });
    }
});

function selectOption(element, category) {
    const parent = element.parentElement;
    parent.querySelectorAll('.option-card').forEach(card => card.classList.remove('selected'));
    element.classList.add('selected');
    
    const value = element.getAttribute('data-value');
    const label = element.querySelector('h4').textContent;
    
    if (category === 'type') {
        projectData.type = value;
        projectData.typeLabel = label;
        document.getElementById('previewType').textContent = label;
        document.getElementById('timelineEstimate').textContent = timelines[value] || '6-8 weeks';
    } else if (category === 'stage') {
        projectData.stage = value;
        projectData.stageLabel = label;
        document.getElementById('previewStage').textContent = label;
        document.getElementById('stageTimeline').textContent = stageTimelines[value] || '6-8 weeks';
    } else if (category === 'urgency') {
        projectData.urgency = value;
        projectData.urgencyLabel = label;
        document.getElementById('previewUrgency').textContent = label;
    }
    
    checkCanProceed();
}

function updateBudget(value) {
    projectData.budget = budgetRanges[value];
    document.getElementById('budgetValue').textContent = projectData.budget;
    document.getElementById('previewBudget').textContent = projectData.budget;
}

function checkCanProceed() {
    const nextBtn = document.getElementById('nextBtn');
    let canProceed = false;
    
    if (currentStep === 1) canProceed = !!projectData.type;
    else if (currentStep === 2) canProceed = !!projectData.stage;
    else if (currentStep === 3) canProceed = true;
    else if (currentStep === 4) {
        const desc = document.getElementById('projectDesc')?.value.trim();
        const name = document.getElementById('userName')?.value.trim();
        const email = document.getElementById('userEmail')?.value.trim();
        canProceed = !!(desc && name && email);
    }
    
    if (nextBtn) nextBtn.disabled = !canProceed;
}

function changeStep(direction) {
    if (direction === 1 && currentStep === 4) {
        submitToFormspree();
        return;
    }
    
    const newStep = currentStep + direction;
    if (newStep < 1 || newStep > 4) return;
    
    document.querySelector(`.step[data-step="${currentStep}"]`)?.classList.remove('active');
    currentStep = newStep;
    document.querySelector(`.step[data-step="${currentStep}"]`)?.classList.add('active');
    
    updateProgress();
    updateButtons();
    
    if (currentStep === 4) updateFinalSummary();
}

function updateProgress() {
    const progress = ((currentStep - 1) / 3) * 100;
    const fill = document.getElementById('progressFill');
    if (fill) fill.style.width = progress + '%';
    
    document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
        const stepNum = index + 1;
        indicator.classList.remove('active', 'completed');
        
        if (stepNum === currentStep) {
            indicator.classList.add('active');
        } else if (stepNum < currentStep) {
            indicator.classList.add('completed');
            indicator.innerHTML = '✓';
        } else {
            indicator.textContent = stepNum;
        }
    });
}

function updateButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) prevBtn.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
    
    if (nextBtn) {
        if (currentStep === 4) {
            nextBtn.innerHTML = 'Send <i class="ri-send-plane-line"></i>';
        } else {
            nextBtn.innerHTML = 'Continue <i class="ri-arrow-right-line"></i>';
        }
    }
    
    checkCanProceed();
}

function updateFinalSummary() {
    document.getElementById('finalType').textContent = projectData.typeLabel || '-';
    document.getElementById('finalStage').textContent = projectData.stageLabel || '-';
    
    const baseWeeks = projectData.type === 'mobile' || projectData.type === 'custom' ? 9 : 5;
    const multiplier = {asap: 0.7, standard: 1, flexible: 1.2}[projectData.urgency] || 1;
    const totalWeeks = Math.round(baseWeeks * multiplier);
    
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + (totalWeeks * 7));
    document.getElementById('finalTimeline').textContent = deliveryDate.toLocaleDateString('en-US', {month: 'short', year: 'numeric'});
}



















// ============================================
// FORMSPREE SUBMISSION - THIS IS THE KEY FUNCTION
// ============================================

function submitToFormspree() {
    // Get latest values
    projectData.projectName = document.getElementById('projectName')?.value.trim() || '';
    projectData.description = document.getElementById('projectDesc')?.value.trim() || '';
    projectData.name = document.getElementById('userName')?.value.trim() || '';
    projectData.email = document.getElementById('userEmail')?.value.trim() || '';
    
    console.log('Submitting to Formspree:', projectData);
    
    const btn = document.getElementById('nextBtn');
    btn.innerHTML = 'Sending... <i class="ri-loader-4-line ri-spin"></i>';
    btn.disabled = true;
    
    // YOUR FORMSPREE ID - MAKE SURE THIS IS CORRECT
    const FORMSPREE_ID = 'b3f7f010cc18'; // Your ID from the screenshot
    
    fetch(`https://usebasin.com/f/b3f7f010cc18`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: projectData.name,
            email: projectData.email,
            project: projectData.projectName || 'Untitled Project',
            type: projectData.typeLabel || 'Not selected',
            stage: projectData.stageLabel || 'Not selected',
            urgency: projectData.urgencyLabel || 'Standard',
            budget: projectData.budget || '$5,000 - $10,000',
            message: projectData.description,
            _subject: `New Project: ${projectData.typeLabel || 'Unknown'} from ${projectData.name}`
        })
    })
    .then(async response => {
        console.log('Response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Success:', data);
            showSuccess();
        } else {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error('Failed to send');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to send. Please email me directly at hello@abisoye.ng');
        btn.innerHTML = 'Send <i class="ri-send-plane-line"></i>';
        btn.disabled = false;
    });
}

function showSuccess() {
    document.querySelector(`.step[data-step="4"]`)?.classList.remove('active');
    document.querySelector('.step[data-step="5"]')?.classList.add('active');
    
    const footer = document.getElementById('builderFooter');
    if (footer) footer.style.display = 'none';
    
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) progressBar.style.opacity = '0';
}

function openWhatsApp() {
    const phoneNumber = '2347031323048';
    const text = `Hi Abisoye, I just submitted a project brief for ${projectData.typeLabel || 'a project'}. Looking forward to discussing! - ${projectData.name || 'A client'}`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`, '_blank');
}