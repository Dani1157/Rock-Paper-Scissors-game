// Memory Matrix Game State
let gameState = {
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    totalPairs: 8,
    moves: 0,
    score: 0,
    combo: 0,
    bestStreak: 0,
    time: 0,
    timer: null,
    gameActive: false,
    difficulty: 'easy',
    hintsRemaining: 3,
    soundEnabled: true,
    achievements: []
};

// DOM Elements
const elements = {
    board: document.getElementById('memoryBoard'),
    score: document.getElementById('score'),
    moves: document.getElementById('moves'),
    time: document.getElementById('time'),
    bestStreak: document.getElementById('bestStreak'),
    comboFill: document.getElementById('comboFill'),
    comboText: document.getElementById('comboText'),
    timerContainer: document.getElementById('timerContainer'),
    timerRing: document.getElementById('timerRing'),
    timerNumber: document.getElementById('timerNumber'),
    newGameBtn: document.getElementById('newGameBtn'),
    hintBtn: document.getElementById('hintBtn'),
    shuffleBtn: document.getElementById('shuffleBtn'),
    soundToggle: document.getElementById('soundToggle'),
    settingsBtn: document.getElementById('settingsBtn'),
    achievementPopup: document.getElementById('achievementPopup'),
    achievementMessage: document.getElementById('achievementMessage')
};

// Card icons (using Font Awesome)
const cardIcons = [
    'fa-dragon',
    'fa-crown',
    'fa-gem',
    'fa-star',
    'fa-moon',
    'fa-sun',
    'fa-tree',
    'fa-feather',
    'fa-fish',
    'fa-bolt',
    'fa-fire',
    'fa-leaf',
    'fa-cloud',
    'fa-heart',
    'fa-key',
    'fa-lock'
];

// Sound Effects
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (!elements.soundEnabled || !audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch(type) {
        case 'flip':
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            break;
        case 'match':
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            break;
        case 'win':
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);
            oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
            break;
        case 'hint':
            oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            break;
    }
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

// Initialize Game
function initGame() {
    loadFromStorage();
    addEventListeners();
    newGame();
}

// Load saved data
function loadFromStorage() {
    const saved = localStorage.getItem('memoryMatrix');
    if (saved) {
        const data = JSON.parse(saved);
        gameState.bestStreak = data.bestStreak || 0;
        gameState.achievements = data.achievements || [];
        updateStats();
    }
}

// Save data
function saveToStorage() {
    localStorage.setItem('memoryMatrix', JSON.stringify({
        bestStreak: gameState.bestStreak,
        achievements: gameState.achievements
    }));
}

// Add event listeners
function addEventListeners() {
    // Difficulty buttons
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            gameState.difficulty = btn.dataset.difficulty;
            newGame();
        });
    });

    // Game controls
    if (elements.newGameBtn) elements.newGameBtn.addEventListener('click', newGame);
    if (elements.hintBtn) elements.hintBtn.addEventListener('click', useHint);
    if (elements.shuffleBtn) elements.shuffleBtn.addEventListener('click', shuffleBoard);
    if (elements.soundToggle) elements.soundToggle.addEventListener('click', toggleSound);
    if (elements.settingsBtn) elements.settingsBtn.addEventListener('click', showSettings);
}

// New game
function newGame() {
    // Stop timer
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }

    // Reset game state
    gameState.matchedPairs = 0;
    gameState.moves = 0;
    gameState.score = 0;
    gameState.combo = 0;
    gameState.time = 0;
    gameState.flippedCards = [];
    gameState.gameActive = true;
    gameState.hintsRemaining = 3;

    // Set up based on difficulty
    setupDifficulty();

    // Create cards
    createCards();

    // Update UI
    updateStats();
    updateHintsButton();
    
    // Start timer
    startTimer();

    // Hide timer for easy/medium
    if (gameState.difficulty === 'easy' || gameState.difficulty === 'medium') {
        elements.timerContainer.style.display = 'none';
    } else {
        elements.timerContainer.style.display = 'block';
    }
}

// Setup difficulty
function setupDifficulty() {
    switch(gameState.difficulty) {
        case 'easy':
            gameState.totalPairs = 6;
            break;
        case 'medium':
            gameState.totalPairs = 8;
            break;
        case 'hard':
            gameState.totalPairs = 10;
            break;
        case 'expert':
            gameState.totalPairs = 12;
            break;
    }
}

// Create cards
function createCards() {
    // Create pairs
    const pairs = [];
    for (let i = 0; i < gameState.totalPairs; i++) {
        const icon = cardIcons[i % cardIcons.length];
        pairs.push({ id: i, icon, matched: false, flipped: false });
        pairs.push({ id: i, icon, matched: false, flipped: false });
    }

    // Shuffle
    gameState.cards = shuffleArray(pairs);

    // Render board
    renderBoard();
}

// Shuffle array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Render board
function renderBoard() {
    if (!elements.board) return;

    elements.board.innerHTML = '';
    
    // Set grid columns based on difficulty
    const columns = gameState.totalPairs <= 6 ? 3 : 
                   gameState.totalPairs <= 8 ? 4 : 
                   gameState.totalPairs <= 10 ? 5 : 6;
    elements.board.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;

    gameState.cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = `memory-card ${card.flipped ? 'flipped' : ''} ${card.matched ? 'matched' : ''}`;
        cardElement.dataset.index = index;
        
        cardElement.innerHTML = `
            <div class="card-front">
                <i class="fas ${card.icon}"></i>
            </div>
            <div class="card-back">
                <i class="fas fa-question"></i>
            </div>
        `;
        
        cardElement.addEventListener('click', () => handleCardClick(index));
        elements.board.appendChild(cardElement);
    });
}

// Handle card click
function handleCardClick(index) {
    if (!gameState.gameActive) return;
    
    const card = gameState.cards[index];
    
    // Check if card can be flipped
    if (card.matched || card.flipped) return;
    if (gameState.flippedCards.length >= 2) return;
    
    // Check difficulty restrictions
    if (!canFlip()) return;
    
    // Flip card
    flipCard(index);
    
    // Add to flipped cards
    gameState.flippedCards.push({ index, card });
    
    // Check for match if we have 2 cards
    if (gameState.flippedCards.length === 2) {
        checkMatch();
    }
}

// Check if card can be flipped based on difficulty
function canFlip() {
    switch(gameState.difficulty) {
        case 'expert':
            // In expert mode, cards flip back faster
            return true;
        default:
            return true;
    }
}

// Flip card
function flipCard(index) {
    gameState.cards[index].flipped = true;
    updateCardUI(index);
    playSound('flip');
}

// Unflip card
function unflipCard(index) {
    gameState.cards[index].flipped = false;
    updateCardUI(index);
}

// Update card UI
function updateCardUI(index) {
    const cardElement = document.querySelector(`[data-index="${index}"]`);
    if (cardElement) {
        const card = gameState.cards[index];
        cardElement.className = `memory-card ${card.flipped ? 'flipped' : ''} ${card.matched ? 'matched' : ''}`;
    }
}

// Check for match
function checkMatch() {
    gameState.moves++;
    updateStats();

    const [card1, card2] = gameState.flippedCards;
    
    if (card1.card.id === card2.card.id) {
        // Match found
        handleMatch(card1.index, card2.index);
    } else {
        // No match
        handleMismatch(card1.index, card2.index);
    }
}

// Handle match
function handleMatch(index1, index2) {
    gameState.cards[index1].matched = true;
    gameState.cards[index2].matched = true;
    gameState.matchedPairs++;
    
    // Update combo
    gameState.combo++;
    if (gameState.combo > gameState.bestStreak) {
        gameState.bestStreak = gameState.combo;
    }
    
    // Calculate score
    const baseScore = 100;
    const comboBonus = gameState.combo * 50;
    const timeBonus = Math.max(0, 30 - gameState.time) * 10;
    gameState.score += baseScore + comboBonus + timeBonus;
    
    // Update UI
    updateCardUI(index1);
    updateCardUI(index2);
    updateStats();
    updateCombo();
    
    playSound('match');
    
    // Clear flipped cards
    gameState.flippedCards = [];
    
    // Check for win
    if (gameState.matchedPairs === gameState.totalPairs) {
        handleWin();
    }
    
    // Check for achievements
    checkAchievements();
}

// Handle mismatch
function handleMismatch(index1, index2) {
    // Reset combo
    gameState.combo = 0;
    updateCombo();
    
    // Determine flip back delay based on difficulty
    let delay = 1000;
    switch(gameState.difficulty) {
        case 'easy':
            delay = 1500;
            break;
        case 'medium':
            delay = 1000;
            break;
        case 'hard':
            delay = 700;
            break;
        case 'expert':
            delay = 400;
            break;
    }
    
    // Flip cards back after delay
    setTimeout(() => {
        unflipCard(index1);
        unflipCard(index2);
        gameState.flippedCards = [];
    }, delay);
}

// Handle win
function handleWin() {
    gameState.gameActive = false;
    clearInterval(gameState.timer);
    
    // Bonus points for finishing
    const timeBonus = Math.max(0, 60 - gameState.time) * 100;
    const moveBonus = Math.max(0, 30 - gameState.moves) * 50;
    gameState.score += timeBonus + moveBonus + 1000;
    
    updateStats();
    playSound('win');
    
    // Show win message
    showAchievement('Perfect Match!', `Score: ${gameState.score}`);
    
    // Save best streak
    saveToStorage();
}

// Start timer
function startTimer() {
    gameState.timer = setInterval(() => {
        gameState.time++;
        updateStats();
        
        // Update timer ring for hard/expert
        if (gameState.difficulty === 'hard' || gameState.difficulty === 'expert') {
            updateTimerRing();
            
            // Time's up for expert mode
            if (gameState.difficulty === 'expert' && gameState.time >= 60) {
                gameOver('Time\'s Up!');
            }
        }
    }, 1000);
}

// Update timer ring
function updateTimerRing() {
    if (!elements.timerRing || !elements.timerNumber) return;
    
    const maxTime = gameState.difficulty === 'expert' ? 60 : 120;
    const percentage = Math.min(100, (gameState.time / maxTime) * 100);
    const angle = (percentage / 100) * 360;
    
    elements.timerRing.style.clipPath = `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.sin(angle * Math.PI / 180)}% ${50 - 50 * Math.cos(angle * Math.PI / 180)}%, 100% 100%, 0% 100%, 0% 0%, 50% 0%)`;
    elements.timerNumber.textContent = Math.max(0, maxTime - gameState.time);
}

// Game over
function gameOver(message) {
    gameState.gameActive = false;
    clearInterval(gameState.timer);
    showAchievement('Game Over', message);
}

// Use hint
function useHint() {
    if (gameState.hintsRemaining <= 0 || !gameState.gameActive) return;
    
    gameState.hintsRemaining--;
    updateHintsButton();
    playSound('hint');
    
    // Find unmatched cards
    const unmatched = gameState.cards
        .map((card, index) => ({ ...card, index }))
        .filter(card => !card.matched);
    
    // Find a pair
    for (let i = 0; i < unmatched.length; i++) {
        for (let j = i + 1; j < unmatched.length; j++) {
            if (unmatched[i].id === unmatched[j].id) {
                // Highlight the pair
                highlightPair(unmatched[i].index, unmatched[j].index);
                return;
            }
        }
    }
}

// Highlight pair
function highlightPair(index1, index2) {
    [index1, index2].forEach(index => {
        const element = document.querySelector(`[data-index="${index}"]`);
        if (element) {
            element.style.borderColor = 'var(--memory-warning)';
            element.style.boxShadow = '0 0 30px var(--memory-warning)';
            
            setTimeout(() => {
                element.style.borderColor = '';
                element.style.boxShadow = '';
            }, 2000);
        }
    });
}

// Shuffle board
function shuffleBoard() {
    if (!gameState.gameActive) return;
    
    // Flip back all cards
    gameState.cards.forEach((card, index) => {
        if (!card.matched) {
            card.flipped = false;
            updateCardUI(index);
        }
    });
    
    // Shuffle unmatched cards
    const unmatched = gameState.cards
        .map((card, index) => ({ ...card, index }))
        .filter(card => !card.matched);
    
    const unmatchedValues = unmatched.map(c => ({ id: c.id, icon: c.icon }));
    const shuffled = shuffleArray(unmatchedValues);
    
    unmatched.forEach((card, i) => {
        gameState.cards[card.index].id = shuffled[i].id;
        gameState.cards[card.index].icon = shuffled[i].icon;
    });
    
    // Re-render
    renderBoard();
    gameState.flippedCards = [];
    playSound('flip');
}

// Update stats
function updateStats() {
    if (elements.score) elements.score.textContent = gameState.score;
    if (elements.moves) elements.moves.textContent = gameState.moves;
    if (elements.bestStreak) elements.bestStreak.textContent = gameState.bestStreak;
    
    // Format time
    const minutes = Math.floor(gameState.time / 60);
    const seconds = gameState.time % 60;
    if (elements.time) elements.time.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Update combo
function updateCombo() {
    if (elements.comboFill) {
        const maxCombo = 10;
        const percentage = (gameState.combo / maxCombo) * 100;
        elements.comboFill.style.width = `${Math.min(100, percentage)}%`;
    }
    
    if (elements.comboText) {
        elements.comboText.textContent = `Combo: ${gameState.combo}x`;
        if (gameState.combo >= 3) {
            elements.comboText.style.animation = 'comboGlow 1s ease-in-out infinite';
        } else {
            elements.comboText.style.animation = '';
        }
    }
}

// Update hints button
function updateHintsButton() {
    if (elements.hintBtn) {
        elements.hintBtn.innerHTML = `<i class="fas fa-lightbulb"></i> Hint (${gameState.hintsRemaining})`;
        if (gameState.hintsRemaining <= 0) {
            elements.hintBtn.disabled = true;
        }
    }
}

// Show achievement
function showAchievement(title, message) {
    if (!elements.achievementPopup || !elements.achievementMessage) return;
    
    elements.achievementMessage.textContent = message;
    elements.achievementPopup.querySelector('h3').textContent = title;
    elements.achievementPopup.classList.add('show');
    
    setTimeout(() => {
        elements.achievementPopup.classList.remove('show');
    }, 3000);
}

// Check achievements
function checkAchievements() {
    const achievements = [];
    
    // First match
    if (gameState.matchedPairs === 1 && !gameState.achievements.includes('first_match')) {
        achievements.push('first_match');
        showAchievement('First Blood!', 'You made your first match!');
    }
    
    // Perfect game (no mismatches)
    if (gameState.moves === gameState.totalPairs && !gameState.achievements.includes('perfect')) {
        achievements.push('perfect');
        showAchievement('Perfect Game!', 'No mismatches!');
    }
    
    // Speed demon (under 30 seconds)
    if (gameState.time <= 30 && gameState.matchedPairs === gameState.totalPairs && !gameState.achievements.includes('speed')) {
        achievements.push('speed');
        showAchievement('Speed Demon!', 'Completed in under 30 seconds!');
    }
    
    // High combo
    if (gameState.combo >= 5 && !gameState.achievements.includes('combo_master')) {
        achievements.push('combo_master');
        showAchievement('Combo Master!', '5x combo achieved!');
    }
    
    // Add to achievements
    gameState.achievements.push(...achievements);
    saveToStorage();
}

// Toggle sound
function toggleSound() {
    gameState.soundEnabled = !gameState.soundEnabled;
    const icon = elements.soundToggle.querySelector('i');
    icon.className = gameState.soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
}

// Show settings
function showSettings() {
    // Create settings modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <h2><i class="fas fa-cog"></i> Settings</h2>
            <div style="margin: 2rem 0;">
                <label style="display: block; margin-bottom: 1rem;">
                    <input type="checkbox" id="soundSetting" ${gameState.soundEnabled ? 'checked' : ''}>
                    Enable Sound
                </label>
                <label style="display: block;">
                    <input type="checkbox" id="animationsSetting" checked>
                    Enable Animations
                </label>
            </div>
            <button class="modal-close" onclick="this.closest('.modal').remove()">Close</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle sound toggle
    const soundCheckbox = document.getElementById('soundSetting');
    if (soundCheckbox) {
        soundCheckbox.addEventListener('change', (e) => {
            gameState.soundEnabled = e.target.checked;
            toggleSound();
        });
    }
}

// Initialize game
document.addEventListener('DOMContentLoaded', initGame);