// NEON SERPENT - Advanced Snake Game 2025
// Particle System Class
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.resize();
        
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticle(x, y, color, type = 'normal') {
        this.particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            size: Math.random() * 10 + 5,
            color,
            life: 1,
            type,
            rotation: Math.random() * 360
        });
    }

    update() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
            p.vy += 0.1; // gravity
            
            if (p.type === 'sparkle') {
                p.rotation += 5;
                this.ctx.save();
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate(p.rotation * Math.PI / 180);
                this.ctx.globalAlpha = p.life;
                this.ctx.fillStyle = p.color;
                this.ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
                this.ctx.restore();
            } else {
                this.ctx.globalAlpha = p.life;
                this.ctx.fillStyle = p.color;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            return p.life > 0;
        });
    }
}

// Main Game Class
class NeonSerpent {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.particleCanvas = document.getElementById('particleCanvas');
        this.particles = new ParticleSystem(this.particleCanvas);
        
        // Game Settings
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        // Snake - Start with 3 segments in a line
        this.snake = [
            {x: 10, y: 10},
            {x: 9, y: 10},
            {x: 8, y: 10}
        ];
        // Set initial direction to RIGHT so snake moves immediately
        this.direction = {x: 1, y: 0};
        this.nextDirection = {x: 1, y: 0};
        this.snakeLength = 3;
        
        // Food
        this.food = {};
        this.specialFood = null;
        this.foodTypes = ['normal', 'special', 'treasure', 'speed', 'invincible', 'magnet'];
        this.foodSpawnTimer = 0;
        
        // Power-ups
        this.powerups = {
            speed: { active: false, duration: 0, maxDuration: 500 },
            invincible: { active: false, duration: 0, maxDuration: 300 },
            magnet: { active: false, duration: 0, maxDuration: 400 }
        };
        
        // Stats
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
        this.level = 1;
        this.combo = 1;
        this.comboTimer = 0;
        this.foodsEaten = 0;
        this.powerupsCollected = 0;
        this.survivalTime = 0;
        
        // Game State
        this.gameActive = true; // Start active
        this.gamePaused = false;
        this.gameSpeed = 100;
        this.speedMultiplier = 1;
        
        // Visual Effects
        this.trail = [];
        this.trailLength = 10;
        this.screenShake = 0;
        this.flashEffect = 0;
        
        // Achievements
        this.achievements = JSON.parse(localStorage.getItem('snakeAchievements')) || [];
        
        // Initialize
        this.init();
    }

    init() {
        this.spawnFood();
        this.setupEventListeners();
        this.updateHighScore();
        this.startGame();
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Button controls
        const upBtn = document.getElementById('upBtn');
        const downBtn = document.getElementById('downBtn');
        const leftBtn = document.getElementById('leftBtn');
        const rightBtn = document.getElementById('rightBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const restartBtn = document.getElementById('restartBtn');
        const boostBtn = document.getElementById('boostBtn');
        const specialBtn = document.getElementById('specialBtn');
        const soundToggle = document.getElementById('soundToggle');
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        
        if (upBtn) upBtn.addEventListener('click', () => this.setDirection({x: 0, y: -1}));
        if (downBtn) downBtn.addEventListener('click', () => this.setDirection({x: 0, y: 1}));
        if (leftBtn) leftBtn.addEventListener('click', () => this.setDirection({x: -1, y: 0}));
        if (rightBtn) rightBtn.addEventListener('click', () => this.setDirection({x: 1, y: 0}));
        
        if (pauseBtn) pauseBtn.addEventListener('click', () => this.togglePause());
        if (restartBtn) restartBtn.addEventListener('click', () => this.restartGame());
        if (boostBtn) boostBtn.addEventListener('click', () => this.activateBoost());
        if (specialBtn) specialBtn.addEventListener('click', () => this.activateSpecial());
        
        if (soundToggle) soundToggle.addEventListener('click', () => this.toggleSound());
        if (fullscreenBtn) fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        
        // Custom cursor
        document.addEventListener('mousemove', (e) => {
            const cursor = document.getElementById('customCursor');
            if (cursor) {
                cursor.style.left = e.clientX + 'px';
                cursor.style.top = e.clientY + 'px';
            }
        });
    }

    handleKeyPress(e) {
        if (!this.gameActive || this.gamePaused) return;
        
        switch(e.key) {
            case 'ArrowUp': 
                e.preventDefault();
                this.setDirection({x: 0, y: -1}); 
                break;
            case 'ArrowDown': 
                e.preventDefault();
                this.setDirection({x: 0, y: 1}); 
                break;
            case 'ArrowLeft': 
                e.preventDefault();
                this.setDirection({x: -1, y: 0}); 
                break;
            case 'ArrowRight': 
                e.preventDefault();
                this.setDirection({x: 1, y: 0}); 
                break;
            case ' ': 
                e.preventDefault();
                this.togglePause(); 
                break;
            case 'b': 
            case 'B':
                this.activateBoost(); 
                break;
        }
    }

    setDirection(newDir) {
        // Prevent going back into itself
        if ((this.direction.x !== -newDir.x || this.direction.y !== -newDir.y) && 
            !(this.direction.x === 0 && this.direction.y === 0)) {
            this.nextDirection = newDir;
        }
    }

    startGame() {
        this.gameActive = true;
        this.gamePaused = false;
        
        // Clear any existing intervals
        if (this.gameLoop) clearInterval(this.gameLoop);
        if (this.timerInterval) clearInterval(this.timerInterval);
        
        // Start game loop
        this.gameLoop = setInterval(() => this.update(), this.gameSpeed / this.speedMultiplier);
        
        // Survival timer
        this.timerInterval = setInterval(() => {
            if (this.gameActive && !this.gamePaused) {
                this.survivalTime++;
                this.updateStats();
            }
        }, 1000);
        
        // Initial draw
        this.draw();
    }

    update() {
        if (!this.gameActive || this.gamePaused) return;
        
        // Update direction
        this.direction = {...this.nextDirection};
        
        // Don't move if direction is zero (shouldn't happen now)
        if (this.direction.x === 0 && this.direction.y === 0) return;
        
        // Move snake
        const head = {...this.snake[0]};
        head.x += this.direction.x;
        head.y += this.direction.y;
        
        // Wrap around screen (with cool effect)
        if (head.x < 0) {
            head.x = this.tileCount - 1;
            this.createWrapEffect('left');
        }
        if (head.x >= this.tileCount) {
            head.x = 0;
            this.createWrapEffect('right');
        }
        if (head.y < 0) {
            head.y = this.tileCount - 1;
            this.createWrapEffect('top');
        }
        if (head.y >= this.tileCount) {
            head.y = 0;
            this.createWrapEffect('bottom');
        }
        
        // Check collision with self (skip if invincible)
        if (!this.powerups.invincible.active) {
            for (let i = 0; i < this.snake.length; i++) {
                if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                    this.gameOver();
                    return;
                }
            }
        }
        
        // Add trail effect
        this.trail.unshift({...head});
        if (this.trail.length > this.trailLength) {
            this.trail.pop();
        }
        
        // Add new head
        this.snake.unshift(head);
        
        // Check food collision
        this.checkFoodCollision(head);
        
        // Maintain snake length (remove tail if we didn't eat)
        while (this.snake.length > this.snakeLength) {
            this.snake.pop();
        }
        
        // Update power-ups
        this.updatePowerups();
        
        // Update combo
        if (this.comboTimer > 0) {
            this.comboTimer--;
            if (this.comboTimer === 0) {
                this.combo = 1;
            }
        }
        
        // Spawn special food
        this.foodSpawnTimer++;
        if (this.foodSpawnTimer > 200 && !this.specialFood) {
            this.spawnSpecialFood();
            this.foodSpawnTimer = 0;
        }
        
        // Render
        this.draw();
        
        // Update stats
        this.updateStats();
    }

    checkFoodCollision(head) {
        // Normal food
        if (this.food && head.x === this.food.x && head.y === this.food.y) {
            this.eatFood('normal');
            this.spawnFood();
        }
        
        // Special food
        if (this.specialFood && head.x === this.specialFood.x && head.y === this.specialFood.y) {
            this.eatFood(this.specialFood.type);
            this.specialFood = null;
        }
    }

    eatFood(type) {
        // Base score
        let points = 10;
        
        switch(type) {
            case 'normal':
                points = 10 * this.combo;
                this.createParticleEffect(this.food.x * this.gridSize + 10, this.food.y * this.gridSize + 10, '#00ff9d', 'sparkle');
                break;
            case 'special':
                points = 50 * this.combo;
                this.createParticleEffect(this.specialFood.x * this.gridSize + 10, this.specialFood.y * this.gridSize + 10, '#ff00e5', 'explosion');
                this.powerupsCollected++;
                break;
            case 'treasure':
                points = 100 * this.combo;
                this.snakeLength += 5;
                this.createParticleEffect(this.specialFood.x * this.gridSize + 10, this.specialFood.y * this.gridSize + 10, 'gold', 'treasure');
                this.powerupsCollected += 2;
                break;
            case 'speed':
                points = 30 * this.combo;
                this.activatePowerup('speed');
                this.createParticleEffect(this.specialFood.x * this.gridSize + 10, this.specialFood.y * this.gridSize + 10, '#00ff9d', 'boost');
                this.powerupsCollected++;
                break;
            case 'invincible':
                points = 40 * this.combo;
                this.activatePowerup('invincible');
                this.createParticleEffect(this.specialFood.x * this.gridSize + 10, this.specialFood.y * this.gridSize + 10, '#ff00e5', 'shield');
                this.powerupsCollected++;
                break;
            case 'magnet':
                points = 35 * this.combo;
                this.activatePowerup('magnet');
                this.createParticleEffect(this.specialFood.x * this.gridSize + 10, this.specialFood.y * this.gridSize + 10, '#7000ff', 'magnet');
                this.powerupsCollected++;
                break;
        }
        
        // Add score
        this.score += points;
        this.snakeLength++;
        this.foodsEaten++;
        
        // Update combo
        this.combo++;
        this.comboTimer = 50;
        if (this.combo > 1) {
            this.createComboEffect();
        }
        
        // Level up
        if (this.foodsEaten % 5 === 0) {
            this.level++;
            this.gameSpeed = Math.max(50, this.gameSpeed - 5);
            this.createLevelUpEffect();
        }
        
        // Check high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
            this.createHighScoreEffect();
        }
        
        // Check achievements
        this.checkAchievements();
        
        // Screen flash
        this.flashEffect = 10;
    }

    activatePowerup(type) {
        if (!this.powerups[type]) return;
        
        this.powerups[type].active = true;
        this.powerups[type].duration = this.powerups[type].maxDuration;
        
        // Update UI
        const slot = document.getElementById(type + 'Boost') || document.getElementById(type);
        if (slot) {
            slot.classList.add('active');
        }
        
        // Special effects
        if (type === 'speed') {
            this.speedMultiplier = 1.5;
            // Restart game loop with new speed
            clearInterval(this.gameLoop);
            this.gameLoop = setInterval(() => this.update(), this.gameSpeed / this.speedMultiplier);
        }
    }

    updatePowerups() {
        for (let [type, powerup] of Object.entries(this.powerups)) {
            if (powerup.active) {
                powerup.duration--;
                
                // Update timer UI
                const timer = document.getElementById(type + 'Timer');
                if (timer) {
                    const percentage = (powerup.duration / powerup.maxDuration) * 100;
                    timer.style.width = percentage + '%';
                }
                
                if (powerup.duration <= 0) {
                    powerup.active = false;
                    
                    // Reset effects
                    if (type === 'speed') {
                        this.speedMultiplier = 1;
                        // Restart game loop with normal speed
                        clearInterval(this.gameLoop);
                        this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
                    }
                    
                    // Update UI
                    const slot = document.getElementById(type + 'Boost') || document.getElementById(type);
                    if (slot) {
                        slot.classList.remove('active');
                    }
                }
            }
        }
    }

    spawnFood() {
        let validPosition = false;
        let attempts = 0;
        const maxAttempts = 100;
        
        while (!validPosition && attempts < maxAttempts) {
            this.food = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
            
            validPosition = !this.snake.some(segment => segment.x === this.food.x && segment.y === this.food.y);
            attempts++;
        }
        
        // If we can't find a valid position, game is basically won!
        if (attempts >= maxAttempts) {
            this.gameOver();
        }
    }

    spawnSpecialFood() {
        const type = this.foodTypes[Math.floor(Math.random() * this.foodTypes.length)];
        
        let validPosition = false;
        let attempts = 0;
        const maxAttempts = 100;
        
        while (!validPosition && attempts < maxAttempts) {
            this.specialFood = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount),
                type: type
            };
            
            validPosition = !this.snake.some(segment => segment.x === this.specialFood.x && segment.y === this.specialFood.y) &&
                           (!this.food || (this.specialFood.x !== this.food.x || this.specialFood.y !== this.food.y));
            attempts++;
        }
        
        // Update preview
        this.updateFoodPreview(type);
    }

    updateFoodPreview(type) {
        const icon = document.getElementById('nextFoodIcon');
        const name = document.getElementById('nextFoodName');
        const value = document.getElementById('nextFoodValue');
        
        if (!icon || !name || !value) return;
        
        icon.className = 'food-icon ' + type;
        
        switch(type) {
            case 'special':
                icon.innerHTML = '<i class="fas fa-star"></i>';
                name.textContent = 'Special Food';
                value.textContent = '+50 pts';
                break;
            case 'treasure':
                icon.innerHTML = '<i class="fas fa-gem"></i>';
                name.textContent = 'Treasure';
                value.textContent = '+100 pts, +5 length';
                break;
            case 'speed':
                icon.innerHTML = '<i class="fas fa-forward"></i>';
                name.textContent = 'Speed Boost';
                value.textContent = 'Speed up!';
                break;
            case 'invincible':
                icon.innerHTML = '<i class="fas fa-shield"></i>';
                name.textContent = 'Invincibility';
                value.textContent = 'Ghost mode';
                break;
            case 'magnet':
                icon.innerHTML = '<i class="fas fa-magnet"></i>';
                name.textContent = 'Magnet';
                value.textContent = 'Attract food';
                break;
            default:
                icon.innerHTML = '<i class="fas fa-apple"></i>';
                name.textContent = 'Normal Food';
                value.textContent = '+10 pts';
        }
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.drawGrid();
        
        // Draw trail
        this.drawTrail();
        
        // Draw food
        this.drawFood();
        
        // Draw special food
        if (this.specialFood) {
            this.drawSpecialFood();
        }
        
        // Draw snake
        this.drawSnake();
        
        // Draw screen shake
        if (this.screenShake > 0) {
            this.ctx.save();
            this.ctx.translate(
                Math.random() * this.screenShake - this.screenShake/2,
                Math.random() * this.screenShake - this.screenShake/2
            );
            this.ctx.restore();
            this.screenShake--;
        }
        
        // Draw flash
        if (this.flashEffect > 0) {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${this.flashEffect / 100})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.flashEffect--;
        }
        
        // Update particles
        this.particles.update();
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(0, 255, 157, 0.1)';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
    }

    drawSnake() {
        this.snake.forEach((segment, index) => {
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            
            // Calculate gradient based on position
            const gradient = this.ctx.createRadialGradient(
                x + 5, y + 5, 0,
                x + 10, y + 10, this.gridSize
            );
            
            if (index === 0) {
                // Head
                gradient.addColorStop(0, '#00ff9d');
                gradient.addColorStop(1, '#00cc7a');
                
                // Draw segment
                this.ctx.fillStyle = gradient;
                this.ctx.shadowColor = '#00ff9d';
                this.ctx.shadowBlur = this.powerups.invincible.active ? 30 : 15;
                this.ctx.fillRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);
                
                // Draw eyes
                this.ctx.shadowBlur = 0;
                this.ctx.fillStyle = '#fff';
                this.ctx.beginPath();
                this.ctx.arc(x + 6, y + 6, 2, 0, Math.PI * 2);
                this.ctx.arc(x + 14, y + 6, 2, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.fillStyle = '#000';
                this.ctx.beginPath();
                this.ctx.arc(x + 7, y + 5, 1, 0, Math.PI * 2);
                this.ctx.arc(x + 15, y + 5, 1, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                // Body
                gradient.addColorStop(0, '#00cc7a');
                gradient.addColorStop(1, '#009955');
                
                // Draw segment
                this.ctx.fillStyle = gradient;
                this.ctx.shadowColor = '#00ff9d';
                this.ctx.shadowBlur = this.powerups.invincible.active ? 30 : 15;
                this.ctx.fillRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);
            }
            
            // Reset shadow
            this.ctx.shadowBlur = 0;
        });
    }

    drawTrail() {
        this.trail.forEach((pos, index) => {
            const opacity = 1 - (index / this.trailLength);
            this.ctx.fillStyle = `rgba(0, 255, 157, ${opacity * 0.3})`;
            this.ctx.fillRect(
                pos.x * this.gridSize,
                pos.y * this.gridSize,
                this.gridSize,
                this.gridSize
            );
        });
    }

    drawFood() {
        if (!this.food) return;
        
        const x = this.food.x * this.gridSize;
        const y = this.food.y * this.gridSize;
        
        // Glow effect
        this.ctx.shadowColor = '#00ff9d';
        this.ctx.shadowBlur = 20;
        
        // Draw apple
        this.ctx.fillStyle = '#ff3366';
        this.ctx.beginPath();
        this.ctx.arc(x + 10, y + 10, 8, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Leaf
        this.ctx.fillStyle = '#00ff9d';
        this.ctx.beginPath();
        this.ctx.ellipse(x + 15, y + 5, 3, 5, 0.2, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.shadowBlur = 0;
    }

    drawSpecialFood() {
        if (!this.specialFood) return;
        
        const x = this.specialFood.x * this.gridSize;
        const y = this.specialFood.y * this.gridSize;
        
        let color;
        let icon;
        
        switch(this.specialFood.type) {
            case 'special':
                color = '#ff00e5';
                icon = '⭐';
                break;
            case 'treasure':
                color = 'gold';
                icon = '💎';
                break;
            case 'speed':
                color = '#00ff9d';
                icon = '⚡';
                break;
            case 'invincible':
                color = '#ff00e5';
                icon = '🛡️';
                break;
            case 'magnet':
                color = '#7000ff';
                icon = '🧲';
                break;
            default:
                color = '#ffffff';
                icon = '❓';
        }
        
        // Glow effect
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 30;
        
        // Draw special food
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x + 10, y + 10, 10, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw icon
        this.ctx.font = '16px Arial';
        this.ctx.fillStyle = '#000';
        this.ctx.shadowBlur = 0;
        this.ctx.fillText(icon, x + 5, y + 17);
    }

    createParticleEffect(x, y, color, type) {
        for (let i = 0; i < 20; i++) {
            this.particles.createParticle(x, y, color, type);
        }
    }

    createComboEffect() {
        if (this.combo >= 3) {
            this.screenShake = 5;
            this.createParticleEffect(
                this.snake[0].x * this.gridSize + 10,
                this.snake[0].y * this.gridSize + 10,
                '#ff00e5',
                'sparkle'
            );
        }
    }

    createLevelUpEffect() {
        this.screenShake = 10;
        this.flashEffect = 30;
        
        for (let i = 0; i < 50; i++) {
            this.particles.createParticle(
                Math.random() * this.canvas.width,
                Math.random() * this.canvas.height,
                '#00ff9d',
                'sparkle'
            );
        }
    }

    createHighScoreEffect() {
        this.screenShake = 15;
        this.flashEffect = 50;
        
        for (let i = 0; i < 100; i++) {
            this.particles.createParticle(
                Math.random() * this.canvas.width,
                Math.random() * this.canvas.height,
                'gold',
                'treasure'
            );
        }
    }

    createWrapEffect(side) {
        this.screenShake = 3;
        this.createParticleEffect(
            this.canvas.width / 2,
            this.canvas.height / 2,
            '#00ff9d',
            'sparkle'
        );
    }

    checkAchievements() {
        const newAchievements = [];
        
        if (this.score >= 100 && !this.achievements.includes('100_points')) {
            newAchievements.push({ id: '100_points', title: '100 Points!', desc: 'Reached 100 points' });
        }
        
        if (this.snakeLength >= 10 && !this.achievements.includes('length_10')) {
            newAchievements.push({ id: 'length_10', title: 'Growing Strong', desc: 'Reached length 10' });
        }
        
        if (this.combo >= 5 && !this.achievements.includes('combo_5')) {
            newAchievements.push({ id: 'combo_5', title: 'Combo Master', desc: '5x combo achieved' });
        }
        
        if (this.powerupsCollected >= 10 && !this.achievements.includes('powerup_master')) {
            newAchievements.push({ id: 'powerup_master', title: 'Power-Up Collector', desc: 'Collected 10 power-ups' });
        }
        
        newAchievements.forEach(achievement => {
            this.achievements.push(achievement.id);
            this.showAchievement(achievement.title, achievement.desc);
        });
        
        localStorage.setItem('snakeAchievements', JSON.stringify(this.achievements));
    }

    showAchievement(title, desc) {
        const toast = document.getElementById('achievementToast');
        const titleEl = document.getElementById('achievementTitle');
        const descEl = document.getElementById('achievementDesc');
        
        if (toast && titleEl && descEl) {
            titleEl.textContent = title;
            descEl.textContent = desc;
            
            toast.classList.add('show');
            
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
    }

    updateStats() {
        const scoreEl = document.getElementById('score');
        const lengthEl = document.getElementById('length');
        const highScoreEl = document.getElementById('highScore');
        const levelEl = document.getElementById('level');
        const comboEl = document.getElementById('comboMultiplier');
        const foodsEl = document.getElementById('foodsEaten');
        const powerupsEl = document.getElementById('powerupsCollected');
        const timeEl = document.getElementById('survivalTime');
        
        if (scoreEl) scoreEl.textContent = this.score;
        if (lengthEl) lengthEl.textContent = this.snakeLength;
        if (highScoreEl) highScoreEl.textContent = this.highScore;
        if (levelEl) levelEl.textContent = this.level;
        if (comboEl) comboEl.textContent = this.combo + 'x';
        if (foodsEl) foodsEl.textContent = this.foodsEaten;
        if (powerupsEl) powerupsEl.textContent = this.powerupsCollected;
        
        if (timeEl) {
            const minutes = Math.floor(this.survivalTime / 60);
            const seconds = this.survivalTime % 60;
            timeEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    updateHighScore() {
        const highScoreEl = document.getElementById('highScore');
        if (highScoreEl) highScoreEl.textContent = this.highScore;
    }

    togglePause() {
        this.gamePaused = !this.gamePaused;
        const btn = document.getElementById('pauseBtn');
        if (btn) {
            btn.innerHTML = this.gamePaused ? '<i class="fas fa-play"></i>' : '<i class="fas fa-pause"></i>';
        }
    }

    restartGame() {
        // Clear intervals
        if (this.gameLoop) clearInterval(this.gameLoop);
        if (this.timerInterval) clearInterval(this.timerInterval);
        
        // Reset everything by reloading
        location.reload();
    }

    activateBoost() {
        if (this.powerups.speed.active) return;
        this.activatePowerup('speed');
    }

    activateSpecial() {
        // Special ability - clear area around snake
        const head = this.snake[0];
        const radius = 3;
        
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const x = head.x + dx;
                const y = head.y + dy;
                
                if (x >= 0 && x < this.tileCount && y >= 0 && y < this.tileCount) {
                    if (this.specialFood && this.specialFood.x === x && this.specialFood.y === y) {
                        this.eatFood(this.specialFood.type);
                        this.specialFood = null;
                    }
                }
            }
        }
        
        this.createParticleEffect(
            head.x * this.gridSize + 10,
            head.y * this.gridSize + 10,
            '#ff00e5',
            'explosion'
        );
    }

    gameOver() {
        this.gameActive = false;
        if (this.gameLoop) clearInterval(this.gameLoop);
        if (this.timerInterval) clearInterval(this.timerInterval);
        
        // Update final stats
        const finalScore = document.getElementById('finalScore');
        const finalLength = document.getElementById('finalLength');
        const finalFood = document.getElementById('finalFood');
        const finalTime = document.getElementById('finalTime');
        const modal = document.getElementById('gameoverModal');
        
        if (finalScore) finalScore.textContent = this.score;
        if (finalLength) finalLength.textContent = this.snakeLength;
        if (finalFood) finalFood.textContent = this.foodsEaten;
        
        if (finalTime) {
            const minutes = Math.floor(this.survivalTime / 60);
            const seconds = this.survivalTime % 60;
            finalTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        
        if (modal) modal.classList.add('show');
        
        // Explosion effect
        for (let i = 0; i < 200; i++) {
            this.particles.createParticle(
                Math.random() * this.canvas.width,
                Math.random() * this.canvas.height,
                '#ff3366',
                'explosion'
            );
        }
    }

    toggleSound() {
        // Implement sound toggle if needed
        console.log('Sound toggled');
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure everything is loaded
    setTimeout(() => {
        new NeonSerpent();
    }, 100);
});