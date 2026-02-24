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

    // Scroll to game
    window.scrollToGame = () => {
        document.getElementById("gameSection").scrollIntoView({ behavior: "smooth" });
    };

    // ===================
    // GAME ENGINE
    // ===================
    
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    
    // Game state
    let gameState = "start"; // start, playing, paused, gameover
    let score = 0;
    let level = 1;
    let lives = 3;
    let currentSeason = "spring";
    let frameCount = 0;
    let gameLoopId = null;
    
    // High score from localStorage
    let highScore = localStorage.getItem("seasonGameHighScore") || 0;
    document.getElementById("highScoreDisplay").textContent = highScore;
    
    // Player
    const player = {
        x: canvas.width / 2,
        y: canvas.height - 80,
        width: 80,
        height: 20,
        speed: 8,
        dx: 0,
        color: "#8bd417"
    };
    
    // Game objects
    let items = [];
    let particles = [];
    let powerUps = [];
    
    // Seasons configuration
    const seasons = {
        spring: {
            name: "Spring",
            icon: "🌸",
            goodItems: ["🌸", "🦋", "🌷", "🐝"],
            badItems: ["❄️", "🍂", "☀️", "🎃"],
            color: "#f472b6",
            bg: "linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #312e81 100%)"
        },
        summer: {
            name: "Summer",
            icon: "☀️",
            goodItems: ["☀️", "🍦", "🏖️", "🌊"],
            badItems: ["❄️", "🌧️", "🍂", "🌸"],
            color: "#fbbf24",
            bg: "linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #92400e 100%)"
        },
        autumn: {
            name: "Autumn",
            icon: "🍂",
            goodItems: ["🍂", "🎃", "🍁", "🌰"],
            badItems: ["☀️", "🌸", "❄️", "🍦"],
            color: "#fb923c",
            bg: "linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #7c2d12 100%)"
        },
        winter: {
            name: "Winter",
            icon: "❄️",
            goodItems: ["❄️", "🧤", "⛄", "🎿"],
            badItems: ["☀️", "🦋", "🌸", "🏖️"],
            color: "#60a5fa",
            bg: "linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #1e3a8a 100%)"
        }
    };
    
    const seasonOrder = ["spring", "summer", "autumn", "winter"];
    let seasonIndex = 0;
    
    // Input handling
    const keys = {};
    let mouseX = player.x;
    
    document.addEventListener("keydown", (e) => {
        keys[e.key] = true;
        if (e.key === "Escape" && gameState === "playing") pauseGame();
    });
    
    document.addEventListener("keyup", (e) => {
        keys[e.key] = false;
    });
    
    canvas.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    });
    
    canvas.addEventListener("touchmove", (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        mouseX = (touch.clientX - rect.left) * (canvas.width / rect.width);
    }, { passive: false });
    
    // Item class
    class Item {
        constructor() {
            const season = seasons[currentSeason];
            const isGood = Math.random() > 0.3;
            
            this.emoji = isGood 
                ? season.goodItems[Math.floor(Math.random() * season.goodItems.length)]
                : season.badItems[Math.floor(Math.random() * season.badItems.length)];
            this.isGood = isGood;
            this.x = Math.random() * (canvas.width - 40) + 20;
            this.y = -40;
            this.size = 30;
            this.speed = 2 + (level * 0.5) + Math.random() * 2;
            this.rotation = 0;
            this.rotationSpeed = (Math.random() - 0.5) * 0.1;
        }
        
        update() {
            this.y += this.speed;
            this.rotation += this.rotationSpeed;
        }
        
        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.font = `${this.size}px Arial`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(this.emoji, 0, 0);
            ctx.restore();
        }
    }
    
    // Particle class
    class Particle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.vx = (Math.random() - 0.5) * 8;
            this.vy = (Math.random() - 0.5) * 8;
            this.life = 1;
            this.color = color;
            this.size = Math.random() * 6 + 2;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += 0.2;
            this.life -= 0.02;
        }
        
        draw() {
            ctx.save();
            ctx.globalAlpha = this.life;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
    
    // Power-up class
    class PowerUp {
        constructor() {
            this.types = [
                { emoji: "⚡", name: "speed", duration: 300 },
                { emoji: "🛡️", name: "shield", duration: 300 },
                { emoji: "2️⃣", name: "double", duration: 400 }
            ];
            this.type = this.types[Math.floor(Math.random() * this.types.length)];
            this.x = Math.random() * (canvas.width - 40) + 20;
            this.y = -40;
            this.size = 35;
            this.speed = 3;
            this.pulse = 0;
        }
        
        update() {
            this.y += this.speed;
            this.pulse += 0.1;
        }
        
        draw() {
            const scale = 1 + Math.sin(this.pulse) * 0.1;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.scale(scale, scale);
            ctx.font = `${this.size}px Arial`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            
            // Glow effect
            ctx.shadowColor = "#8bd417";
            ctx.shadowBlur = 20;
            ctx.fillText(this.type.emoji, 0, 0);
            ctx.restore();
        }
    }
    
    // Active power-ups
    let activePowerUps = {
        speed: 0,
        shield: 0,
        double: 0
    };
    
    // Game functions
    function startGame() {
        gameState = "playing";
        score = 0;
        level = 1;
        lives = 3;
        items = [];
        particles = [];
        powerUps = [];
        seasonIndex = 0;
        currentSeason = seasonOrder[0];
        activePowerUps = { speed: 0, shield: 0, double: 0 };
        
        document.getElementById("startOverlay").classList.add("hidden");
        document.getElementById("gameOverOverlay").classList.add("hidden");
        updateUI();
        
        gameLoopId = requestAnimationFrame(gameLoop);
    }
    
    function pauseGame() {
        if (gameState === "playing") {
            gameState = "paused";
            document.getElementById("pauseOverlay").classList.remove("hidden");
            cancelAnimationFrame(gameLoopId);
        }
    }
    
    function resumeGame() {
        if (gameState === "paused") {
            gameState = "playing";
            document.getElementById("pauseOverlay").classList.add("hidden");
            gameLoopId = requestAnimationFrame(gameLoop);
        }
    }
    
    function gameOver() {
        gameState = "gameover";
        cancelAnimationFrame(gameLoopId);
        
        // Update high score
        if (score > highScore) {
            highScore = score;
            localStorage.setItem("seasonGameHighScore", highScore);
            document.getElementById("highScoreDisplay").textContent = highScore;
        }
        
        document.getElementById("finalScore").textContent = score;
        document.getElementById("gameOverOverlay").classList.remove("hidden");
        
        // Add to leaderboard
        addToLeaderboard(score);
    }
    
    function updateUI() {
        document.getElementById("scoreDisplay").textContent = score;
        document.getElementById("levelDisplay").textContent = level;
        
        const season = seasons[currentSeason];
        document.getElementById("seasonIndicator").innerHTML = `
            <span class="season-icon">${season.icon}</span>
            <span class="season-name">${season.name}</span>
        `;
        
        let hearts = "";
        for (let i = 0; i < lives; i++) hearts += "❤️";
        document.getElementById("livesDisplay").textContent = hearts;
    }
    
    function createExplosion(x, y, color) {
        for (let i = 0; i < 15; i++) {
            particles.push(new Particle(x, y, color));
        }
    }
    
    function checkCollision(item) {
        const px = player.x - player.width / 2;
        const py = player.y;
        const pw = player.width;
        const ph = player.height;
        
        return item.x > px && item.x < px + pw &&
               item.y > py && item.y < py + ph;
    }
    
    function gameLoop() {
        if (gameState !== "playing") return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        const season = seasons[currentSeason];
        gradient.addColorStop(0, "#0f172a");
        gradient.addColorStop(1, season.color + "20");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Update player
        const speed = activePowerUps.speed > 0 ? player.speed * 1.5 : player.speed;
        
        if (keys["ArrowLeft"] || keys["a"]) {
            player.x -= speed;
        }
        if (keys["ArrowRight"] || keys["d"]) {
            player.x += speed;
        }
        
        // Mouse follow (smooth)
        player.x += (mouseX - player.x) * 0.1;
        
        // Clamp player
        player.x = Math.max(player.width / 2, Math.min(canvas.width - player.width / 2, player.x));
        
        // Draw player with glow
        ctx.save();
        ctx.shadowColor = player.color;
        ctx.shadowBlur = 20;
        ctx.fillStyle = player.color;
        ctx.beginPath();
        ctx.roundRect(player.x - player.width / 2, player.y, player.width, player.height, 10);
        ctx.fill();
        
        // Shield effect
        if (activePowerUps.shield > 0) {
            ctx.strokeStyle = "#60a5fa";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(player.x, player.y + player.height / 2, 50, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
        
        // Spawn items
        frameCount++;
        const spawnRate = Math.max(30, 60 - level * 5);
        
        if (frameCount % spawnRate === 0) {
            items.push(new Item());
        }
        
        // Spawn power-ups (rare)
        if (frameCount % 500 === 0 && Math.random() > 0.5) {
            powerUps.push(new PowerUp());
        }
        
        // Change season every 1000 frames
        if (frameCount % 1000 === 0) {
            seasonIndex = (seasonIndex + 1) % 4;
            currentSeason = seasonOrder[seasonIndex];
            updateUI();
            
            // Level up every 2 seasons
            if (seasonIndex % 2 === 0) {
                level++;
                updateUI();
            }
        }
        
        // Update and draw items
        items = items.filter(item => {
            item.update();
            item.draw();
            
            if (checkCollision(item)) {
                if (item.isGood) {
                    const points = activePowerUps.double > 0 ? 20 : 10;
                    score += points * level;
                    createExplosion(item.x, item.y, "#8bd417");
                } else {
                    if (activePowerUps.shield > 0) {
                        activePowerUps.shield = 0;
                        createExplosion(item.x, item.y, "#60a5fa");
                    } else {
                        lives--;
                        createExplosion(item.x, item.y, "#ef4444");
                        if (lives <= 0) {
                            gameOver();
                            return false;
                        }
                    }
                }
                updateUI();
                return false;
            }
            
            // Remove if off screen
            if (item.y > canvas.height) {
                if (item.isGood) {
                    // Missed good item
                }
                return false;
            }
            
            return true;
        });
        
        // Update and draw power-ups
        powerUps = powerUps.filter(pu => {
            pu.update();
            pu.draw();
            
            if (checkCollision(pu)) {
                activePowerUps[pu.type.name] = pu.type.duration;
                createExplosion(pu.x, pu.y, "#fbbf24");
                return false;
            }
            
            return pu.y < canvas.height;
        });
        
        // Update power-up timers
        Object.keys(activePowerUps).forEach(key => {
            if (activePowerUps[key] > 0) {
                activePowerUps[key]--;
            }
        });
        
        // Update and draw particles
        particles = particles.filter(p => {
            p.update();
            p.draw();
            return p.life > 0;
        });
        
        // Draw active power-up indicators
        let indicatorY = 20;
        Object.keys(activePowerUps).forEach(key => {
            if (activePowerUps[key] > 0) {
                const barWidth = 100;
                const progress = activePowerUps[key] / 400;
                
                ctx.fillStyle = "#334155";
                ctx.fillRect(20, indicatorY, barWidth, 8);
                
                const colors = { speed: "#fbbf24", shield: "#60a5fa", double: "#a855f7" };
                ctx.fillStyle = colors[key];
                ctx.fillRect(20, indicatorY, barWidth * progress, 8);
                
                indicatorY += 15;
            }
        });
        
        gameLoopId = requestAnimationFrame(gameLoop);
    }
    
    // Leaderboard
    const leaderboardData = [
        { name: "AlexDev", score: 9999, date: "Today", avatar: "https://i.pravatar.cc/150?img=1" },
        { name: "CodeNinja", score: 8750, date: "Today", avatar: "https://i.pravatar.cc/150?img=2" },
        { name: "WebWizard", score: 7200, date: "Yesterday", avatar: "https://i.pravatar.cc/150?img=3" },
        { name: "JSLegend", score: 6800, date: "Yesterday", avatar: "https://i.pravatar.cc/150?img=4" },
        { name: "FrontendPro", score: 5400, date: "2 days ago", avatar: "https://i.pravatar.cc/150?img=5" }
    ];
    
    function renderLeaderboard(period = "today") {
        const tbody = document.getElementById("leaderboardBody");
        tbody.innerHTML = "";
        
        const sorted = [...leaderboardData].sort((a, b) => b.score - a.score);
        
        sorted.forEach((entry, index) => {
            const row = document.createElement("div");
            row.className = `leader-row ${index < 3 ? 'top-' + (index + 1) : ''}`;
            
            const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';
            const rankIcon = index < 3 ? ['🥇', '🥈', '🥉'][index] : (index + 1);
            
            row.innerHTML = `
                <span class="rank ${rankClass}">${rankIcon}</span>
                <div class="player">
                    <img src="${entry.avatar}" alt="${entry.name}" class="player-avatar">
                    <span class="player-name">${entry.name}</span>
                </div>
                <span class="score">${entry.score.toLocaleString()}</span>
                <span class="date">${entry.date}</span>
            `;
            
            tbody.appendChild(row);
        });
    }
    
    function addToLeaderboard(score) {
        leaderboardData.push({
            name: "You",
            score: score,
            date: "Just now",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80"
        });
        renderLeaderboard();
    }
    
    renderLeaderboard();
    
    // Tab switching
    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            renderLeaderboard(btn.dataset.period);
        });
    });
    
    // Button event listeners
    document.getElementById("startBtn").addEventListener("click", startGame);
    document.getElementById("restartBtn").addEventListener("click", startGame);
    document.getElementById("resumeBtn").addEventListener("click", resumeGame);
    
    document.getElementById("pauseBtn").addEventListener("click", () => {
        if (gameState === "playing") pauseGame();
        else if (gameState === "paused") resumeGame();
    });
    
    // Sound toggle (mock)
    let soundOn = true;
    document.getElementById("soundBtn").addEventListener("click", function() {
        soundOn = !soundOn;
        this.innerHTML = soundOn ? '<i class="ri-volume-up-fill"></i> Sound On' : '<i class="ri-volume-mute-fill"></i> Sound Off';
        this.classList.toggle("active", soundOn);
    });
    
    // Fullscreen
    document.getElementById("fullscreenBtn").addEventListener("click", () => {
        if (!document.fullscreenElement) {
            canvas.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });
    
    // Animate numbers
    function animateValue(id, start, end, duration) {
        const obj = document.getElementById(id);
        const range = end - start;
        const increment = end > start ? 1 : -1;
        const stepTime = Math.abs(Math.floor(duration / range));
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            obj.textContent = current.toLocaleString();
            if (current === end) {
                clearInterval(timer);
            }
        }, stepTime);
    }
    
    // Animate hero stats on load
    setTimeout(() => {
        animateValue("totalPlayers", 0, 2847, 2000);
        animateValue("highScore", 0, 9999, 2500);
    }, 500);
});