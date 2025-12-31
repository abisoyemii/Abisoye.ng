document.addEventListener("DOMContentLoaded", () => {
  // -------------------
  // COUNTER ANIMATION
  // -------------------
  const counters = document.querySelectorAll('.count');

  counters.forEach(counter => {
    const target = parseFloat(counter.getAttribute('data-target'));
    let current = 0;
    const duration = 30000; // 30 seconds
    const stepTime = 16;    // ~60fps
    const increment = target / (duration / stepTime);

    const updateCount = () => {
      current += increment;
      if (current < target) {
        counter.innerText = current.toFixed(1);
        requestAnimationFrame(updateCount);
      } else {
        counter.innerText = target;
      }
    };
    updateCount();
  });

  // -------------------
  // TESTIMONIAL SLIDER
  // -------------------
  const testimonials = document.querySelectorAll(".testimonial");
  const nextBtn = document.getElementById("nextTestimonial");
  const prevBtn = document.getElementById("prevTestimonial");

  if (testimonials.length && nextBtn && prevBtn) {
    let index = 0;

    function showTestimonial(i) {
      testimonials.forEach((t) => t.classList.remove("active"));
      testimonials[i].classList.add("active");
    }

    showTestimonial(index);

    nextBtn.addEventListener("click", () => {
      index = (index + 1) % testimonials.length;
      showTestimonial(index);
    });

    prevBtn.addEventListener("click", () => {
      index = (index - 1 + testimonials.length) % testimonials.length;
      showTestimonial(index);
    });
  }

  // -------------------
  // VIEW ALL PROJECTS TOGGLE (optional)
  // -------------------
  const viewAllBtn = document.getElementById("viewAllBtn");
  const allProjects = document.getElementById("all-projects");
  let isVisible = false;

  if (viewAllBtn && allProjects) {
    viewAllBtn.addEventListener("click", () => {
      if (!isVisible) {
        allProjects.style.display = "flex";
        viewAllBtn.textContent = "Hide Projects";
        isVisible = true;
      } else {
        allProjects.style.display = "none";
        viewAllBtn.textContent = "View All Projects";
        isVisible = false;
      }
    });
  }

  // -------------------
  // TYPED.JS - Hero typing
  // -------------------
  var typed = new Typed('.typed-text', {
  strings: ["Software Developer", "Développeur Logiciel"],
  typeSpeed: 100,
  backSpeed: 50,
  backDelay: 2000,
  loop: true
});



// -------------------
// MOBILE MENU
// -------------------
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobileMenu");
const closeMenu = document.getElementById("closeMenu");

hamburger.addEventListener("click", () => {
    mobileMenu.classList.add("active");
    document.body.style.overflow = "hidden";
});

closeMenu.addEventListener("click", () => {
    mobileMenu.classList.remove("active");
    document.body.style.overflow = "auto";
});

// -------------------
// SIDEBAR ANIMATION
// -------------------
window.addEventListener('load', () => {
    document.querySelector('.sidebar').classList.add('active');
});





document.querySelectorAll('#mobileMenu a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('active');
    document.body.style.overflow = 'auto';
  });
});



document.querySelectorAll('.second-button, .send-button, .button3, .button4, .button5').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById('contactForm').scrollIntoView({ behavior: 'smooth' });
  });
});




const revealItems = document.querySelectorAll(
  '.project-card, .service-card, .testimonial'
);

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
    }
  });
}, { threshold: 0.2 });

revealItems.forEach(item => observer.observe(item));
});



