document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // Initialize AOS
    AOS.init({
        duration: 800,
        once: true,
        offset: 100
    });

    // Header scroll effect
    const header = document.getElementById("first-header");
    const scrollThreshold = 50;

    const handleScroll = () => {
        if (window.scrollY > scrollThreshold) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    // Mobile menu
    const hamburger = document.getElementById("hamburger");
    const mobileMenu = document.getElementById("mobileMenu");
    const closeMenu = document.getElementById("closeMenu");

    const toggleMenu = () => {
        mobileMenu.classList.toggle("active");
        document.body.style.overflow = mobileMenu.classList.contains("active") ? "hidden" : "";
    };

    hamburger.addEventListener("click", toggleMenu);
    closeMenu.addEventListener("click", toggleMenu);

    document.querySelectorAll("#mobileMenu a").forEach(link => {
        link.addEventListener("click", toggleMenu);
    });

    // Search functionality
    const searchInput = document.getElementById("searchInput");
    const articleCards = document.querySelectorAll(".article-card, .featured-card");

    searchInput.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase();
        
        articleCards.forEach(card => {
            const title = card.querySelector("h2, h4").textContent.toLowerCase();
            const content = card.querySelector("p").textContent.toLowerCase();
            
            if (title.includes(searchTerm) || content.includes(searchTerm)) {
                card.style.display = "";
                card.style.opacity = "1";
            } else {
                card.style.opacity = "0";
                setTimeout(() => {
                    if (card.style.opacity === "0") {
                        card.style.display = "none";
                    }
                }, 300);
            }
        });
    });

    // Filter functionality
    const filterBtns = document.querySelectorAll(".filter-btn");
    const gridCards = document.querySelectorAll(".article-card");

    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            // Update active state
            filterBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const filter = btn.dataset.filter;

            gridCards.forEach((card, index) => {
                const category = card.dataset.category;
                
                if (filter === "all" || category === filter) {
                    card.style.display = "";
                    setTimeout(() => {
                        card.style.opacity = "1";
                        card.style.transform = "translateY(0)";
                    }, 50 * index);
                } else {
                    card.style.opacity = "0";
                    card.style.transform = "translateY(20px)";
                    setTimeout(() => {
                        card.style.display = "none";
                    }, 300);
                }
            });
        });
    });

    // Sort functionality
    const sortSelect = document.getElementById("sortSelect");
    const articlesList = document.querySelector(".articles-list");

    sortSelect.addEventListener("change", () => {
        const sortValue = sortSelect.value;
        const cards = Array.from(document.querySelectorAll(".article-card"));
        
        cards.sort((a, b) => {
            const dateA = new Date(a.querySelector(".date").textContent);
            const dateB = new Date(b.querySelector(".date").textContent);
            
            if (sortValue === "newest") return dateB - dateA;
            if (sortValue === "oldest") return dateA - dateB;
            if (sortValue === "popular") {
                // Mock popularity sort - random for demo
                return Math.random() - 0.5;
            }
            return 0;
        });

        cards.forEach(card => {
            articlesList.appendChild(card);
            AOS.refresh();
        });
    });

    // Load more functionality
    const loadMoreBtn = document.getElementById("loadMoreBtn");
    let articlesLoaded = 6;

    loadMoreBtn.addEventListener("click", () => {
        loadMoreBtn.classList.add("loading");
        
        // Simulate API call
        setTimeout(() => {
            // Create new articles (mock data)
            const newArticles = [
                {
                    category: "react",
                    image: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=600&q=80",
                    title: "React Server Components: A Complete Guide",
                    excerpt: "Understanding the future of React with server components and streaming SSR.",
                    date: "Dec 5, 2024",
                    readTime: "14 min"
                },
                {
                    category: "css",
                    image: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=600&q=80",
                    title: "Modern CSS Architecture with Layers",
                    excerpt: "How to organize and maintain large CSS codebases using @layer and modern methodologies.",
                    date: "Nov 28, 2024",
                    readTime: "9 min"
                },
                {
                    category: "javascript",
                    image: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=600&q=80",
                    title: "TypeScript Best Practices for 2025",
                    excerpt: "Level up your TypeScript skills with these advanced patterns and utilities.",
                    date: "Nov 20, 2024",
                    readTime: "12 min"
                }
            ];

            newArticles.forEach((article, index) => {
                const card = document.createElement("article");
                card.className = "article-card";
                card.dataset.category = article.category;
                card.dataset.aos = "fade-up";
                card.dataset.aosDelay = (index * 100).toString();
                
                card.innerHTML = `
                    <div class="article-image">
                        <img src="${article.image}" alt="${article.title}">
                    </div>
                    <div class="article-body">
                        <div class="article-meta">
                            <span class="category ${article.category}">${article.category}</span>
                            <span class="read-time"><i class="ri-time-line"></i> ${article.readTime}</span>
                        </div>
                        <h4>${article.title}</h4>
                        <p>${article.excerpt}</p>
                        <div class="article-footer">
                            <span class="date">${article.date}</span>
                            <a href="#" class="read-link">Read <i class="ri-arrow-right-up-line"></i></a>
                        </div>
                    </div>
                `;
                
                articlesList.appendChild(card);
            });

            AOS.refresh();
            loadMoreBtn.classList.remove("loading");
            articlesLoaded += 3;

            // Hide button if max reached
            if (articlesLoaded >= 12) {
                loadMoreBtn.style.display = "none";
            }
        }, 1500);
    });

    // Newsletter form
    const newsletterForm = document.getElementById("newsletterForm");
    
    newsletterForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = newsletterForm.querySelector("input").value;
        
        // Show success message
        const btn = newsletterForm.querySelector("button");
        const originalText = btn.textContent;
        
        btn.textContent = "Subscribed!";
        btn.style.background = "#10b981";
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = "";
            newsletterForm.reset();
        }, 3000);
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute("href"));
            if (target) {
                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    });
});