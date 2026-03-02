// Game State
let playerScore = 0;
let botScore = 0;
let playerChoice = '';
let botChoice = '';
let gameActive = true;
let powerUps = {
    doublePoints: false,
    shield: false,
    hint: false
};
let tournamentMode = false;
let tournamentWins = 0;

// DOM Elements
const elements = {
    playerDisplay: document.getElementById('playersDisplay'),
    botDisplay: document.getElementById('botDisplay'),
    resultDisplay: document.getElementById('resultDisplay'),
    playerScore: document.getElementById('playerScoreDisplay'),
    botScore: document.getElementById('botScoreDisplay'),
    playerChoiceCard: document.getElementById('playerChoiceDisplay'),
    botChoiceCard: document.getElementById('botChoiceDisplay'),
    resultGlow: document.getElementById('resultGlow'),
    playerScoreFill: document.getElementById('playerScoreFill'),
    botScoreFill: document.getElementById('botScoreFill'),
    rockBtn: document.getElementById('rockButton'),
    paperBtn: document.getElementById('paperButton'),
    scissorsBtn: document.getElementById('scissorsButton'),
    resetBtn: document.getElementById('resetGame'),
    tournamentBtn: document.getElementById('tournamentMode'),
    soundToggle: document.getElementById('soundToggle'),
    settingsBtn: document.getElementById('settingsBtn'),
    powerUps: {
        double: document.getElementById('doublePoints'),
        shield: document.getElementById('shield'),
        hint: document.getElementById('hint')
    }
};

// Choices mapping with icons
const choices = [
    { name: 'rock', icon: 'fa-hand-fist', beats: 'scissors' },
    { name: 'paper', icon: 'fa-hand-peace', beats: 'rock' },
    { name: 'scissors', icon: 'fa-hand-scissors', beats: 'paper' }
];

// Sound Effects (using Web Audio API)
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (!audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch(type) {
        case 'win':
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            break;
        case 'lose':
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            break;
        case 'click':
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
            break;
    }
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

// Initialize Game
function initGame() {
    playerScore = 0;
    botScore = 0;
    updateScores();
    
    // Add event listeners
    elements.rockBtn.addEventListener('click', () => handleChoice('rock'));
    elements.paperBtn.addEventListener('click', () => handleChoice('paper'));
    elements.scissorsBtn.addEventListener('click', () => handleChoice('scissors'));
    
    if (elements.resetBtn) {
        elements.resetBtn.addEventListener('click', resetGame);
    }
    
    if (elements.tournamentBtn) {
        elements.tournamentBtn.addEventListener('click', startTournament);
    }
    
    // Power-up listeners
    if (elements.powerUps.double) {
        elements.powerUps.double.addEventListener('click', () => activatePowerUp('doublePoints'));
    }
    if (elements.powerUps.shield) {
        elements.powerUps.shield.addEventListener('click', () => activatePowerUp('shield'));
    }
    if (elements.powerUps.hint) {
        elements.powerUps.hint.addEventListener('click', () => activatePowerUp('hint'));
    }
    
    // Sound toggle
    if (elements.soundToggle) {
        elements.soundToggle.addEventListener('click', toggleSound);
    }
}

// Handle player choice
function handleChoice(choice) {
    if (!gameActive) return;
    
    playSound('click');
    
    // Animate button
    const btn = document.getElementById(choice + 'Button');
    btn.style.transform = 'scale(0.9)';
    setTimeout(() => {
        btn.style.transform = '';
    }, 200);
    
    // Check for hint power-up
    if (powerUps.hint) {
        showHint();
        powerUps.hint = false;
        elements.powerUps.hint.classList.remove('active');
    }
    
    playerChoice = choice;
    botChoice = getBotChoice();
    
    displayChoices();
    const result = determineWinner();
    updateResult(result);
    
    // Tournament mode logic
    if (tournamentMode && result === 'win') {
        tournamentWins++;
        if (tournamentWins >= 3) {
            winTournament();
        }
    }
}

// Get bot choice with difficulty
function getBotChoice() {
    // Add some AI behavior
    const random = Math.random();
    
    // 30% chance to counter player's last move if they have a pattern
    if (random < 0.3 && playerChoice) {
        // Try to counter what would beat player's last choice
        if (playerChoice === 'rock') return 'paper';
        if (playerChoice === 'paper') return 'scissors';
        if (playerChoice === 'scissors') return 'rock';
    }
    
    // Otherwise random
    const choices = ['rock', 'paper', 'scissors'];
    return choices[Math.floor(Math.random() * choices.length)];
}

// Display choices with animations
function displayChoices() {
    const playerCard = elements.playerChoiceCard;
    const botCard = elements.botChoiceCard;
    
    // Clear previous content
    playerCard.innerHTML = '';
    botCard.innerHTML = '';
    
    // Add animated icons
    const playerIcon = createChoiceElement(playerChoice);
    const botIcon = createChoiceElement(botChoice);
    
    playerCard.appendChild(playerIcon);
    botCard.appendChild(botIcon);
    
    // Add labels
    const playerLabel = document.createElement('div');
    playerLabel.className = 'choice-label';
    playerLabel.textContent = 'Your Choice';
    playerCard.appendChild(playerLabel);
    
    const botLabel = document.createElement('div');
    botLabel.className = 'choice-label';
    botLabel.textContent = 'Bot Choice';
    botCard.appendChild(botLabel);
    
    // Add active class for animation
    playerCard.classList.add('active');
    botCard.classList.add('active');
    
    setTimeout(() => {
        playerCard.classList.remove('active');
        botCard.classList.remove('active');
    }, 300);
}

function createChoiceElement(choice) {
    const container = document.createElement('div');
    container.className = 'choice-placeholder';
    
    const icon = document.createElement('i');
    icon.className = `fas ${getIconForChoice(choice)} chosen-icon`;
    icon.style.animation = 'winPulse 0.5s ease-out';
    
    container.appendChild(icon);
    return container;
}

function getIconForChoice(choice) {
    const icons = {
        rock: 'fa-hand-fist',
        paper: 'fa-hand-peace',
        scissors: 'fa-hand-scissors'
    };
    return icons[choice] || 'fa-question';
}

// Determine winner
function determineWinner() {
    if (playerChoice === botChoice) return 'tie';
    
    if (
        (playerChoice === 'rock' && botChoice === 'scissors') ||
        (playerChoice === 'paper' && botChoice === 'rock') ||
        (playerChoice === 'scissors' && botChoice === 'paper')
    ) {
        return 'win';
    }
    
    return 'lose';
}

// Update result display and scores
function updateResult(result) {
    const resultElement = elements.resultDisplay;
    const glowElement = elements.resultGlow;
    
    // Remove previous classes
    resultElement.classList.remove('win', 'lose', 'tie');
    
    switch(result) {
        case 'win':
            resultElement.textContent = 'VICTORY!';
            resultElement.classList.add('win');
            playSound('win');
            
            // Check for double points power-up
            if (powerUps.doublePoints) {
                playerScore += 2;
                powerUps.doublePoints = false;
                elements.powerUps.double.classList.remove('active');
            } else {
                playerScore++;
            }
            break;
            
        case 'lose':
            resultElement.textContent = 'DEFEAT!';
            resultElement.classList.add('lose');
            playSound('lose');
            
            // Check for shield power-up
            if (powerUps.shield) {
                // Shield absorbs the loss
                powerUps.shield = false;
                elements.powerUps.shield.classList.remove('active');
                resultElement.textContent = 'SHIELDED!';
                resultElement.classList.remove('lose');
                resultElement.classList.add('win');
            } else {
                botScore++;
            }
            break;
            
        case 'tie':
            resultElement.textContent = 'DRAW!';
            resultElement.classList.add('tie');
            playSound('click');
            break;
    }
    
    // Activate glow
    glowElement.classList.add('active');
    setTimeout(() => {
        glowElement.classList.remove('active');
    }, 500);
    
    updateScores();
}

// Update score displays
function updateScores() {
    if (elements.playerScore) {
        elements.playerScore.textContent = playerScore;
    }
    if (elements.botScore) {
        elements.botScore.textContent = botScore;
    }
    
    // Update score bars
    if (elements.playerScoreFill) {
        const total = playerScore + botScore;
        if (total > 0) {
            elements.playerScoreFill.style.width = (playerScore / total * 100) + '%';
            elements.botScoreFill.style.width = (botScore / total * 100) + '%';
        }
    }
    
    // Check for game over
    if (playerScore >= 10 || botScore >= 10) {
        gameOver();
    }
}

// Game over
function gameOver() {
    gameActive = false;
    
    const winner = playerScore >= 10 ? 'PLAYER' : 'BOT';
    elements.resultDisplay.textContent = `${winner} WINS THE MATCH!`;
    elements.resultDisplay.style.fontSize = '2rem';
    
    // Create confetti effect
    createConfetti();
}

// Reset game
function resetGame() {
    playerScore = 0;
    botScore = 0;
    gameActive = true;
    tournamentMode = false;
    tournamentWins = 0;
    powerUps = {
        doublePoints: false,
        shield: false,
        hint: false
    };
    
    updateScores();
    
    // Reset displays
    elements.resultDisplay.textContent = 'READY';
    elements.resultDisplay.classList.remove('win', 'lose', 'tie');
    elements.resultDisplay.style.fontSize = '';
    
    // Reset choice displays
    elements.playerChoiceCard.innerHTML = '<div class="choice-placeholder"><i class="fas fa-question"></i></div><div class="choice-label">Your Choice</div>';
    elements.botChoiceCard.innerHTML = '<div class="choice-placeholder"><i class="fas fa-question"></i></div><div class="choice-label">Bot Choice</div>';
    
    // Reset power-ups
    Object.keys(powerUps).forEach(key => {
        if (elements.powerUps[key]) {
            elements.powerUps[key].classList.remove('active');
        }
    });
}

// Tournament mode
function startTournament() {
    tournamentMode = true;
    tournamentWins = 0;
    
    // Show tournament modal
    const modal = document.getElementById('tournamentModal');
    if (modal) {
        modal.classList.add('active');
        
        // Auto close after 3 seconds
        setTimeout(() => {
            modal.classList.remove('active');
        }, 3000);
    }
}

function winTournament() {
    tournamentMode = false;
    elements.resultDisplay.textContent = 'TOURNAMENT CHAMPION!';
    elements.resultDisplay.classList.add('win');
    createConfetti();
    
    // Bonus points
    playerScore += 5;
    updateScores();
}

// Power-ups
function activatePowerUp(type) {
    const powerUp = elements.powerUps[type];
    
    if (powerUps[type]) {
        // Deactivate if already active
        powerUps[type] = false;
        powerUp.classList.remove('active');
    } else {
        // Activate
        powerUps[type] = true;
        powerUp.classList.add('active');
        
        // Auto deactivate after 30 seconds
        setTimeout(() => {
            powerUps[type] = false;
            powerUp.classList.remove('active');
        }, 30000);
    }
}

function showHint() {
    // Predict bot's next move
    const botNext = getBotChoice();
    const hint = `Bot will choose ${botNext.toUpperCase()}`;
    
    // Create hint popup
    const hintElement = document.createElement('div');
    hintElement.className = 'hint-popup';
    hintElement.textContent = hint;
    hintElement.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--dark-bg);
        border: 2px solid var(--primary-neon);
        padding: 1rem;
        border-radius: 10px;
        color: var(--primary-neon);
        font-family: 'Orbitron', sans-serif;
        z-index: 1000;
        animation: fadeIn 0.3s, fadeOut 0.3s 1.7s forwards;
    `;
    
    document.body.appendChild(hintElement);
    
    setTimeout(() => {
        hintElement.remove();
    }, 2000);
}

// Confetti effect
function createConfetti() {
    const colors = ['#00f3ff', '#ff36b0', '#b537f2', '#ffd700', '#00ff88'];
    
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            top: -10px;
            left: ${Math.random() * 100}vw;
            width: ${Math.random() * 10 + 5}px;
            height: ${Math.random() * 10 + 5}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            transform: rotate(${Math.random() * 360}deg);
            z-index: 1000;
            pointer-events: none;
            animation: confetti ${Math.random() * 3 + 2}s linear forwards;
        `;
        
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            confetti.remove();
        }, 5000);
    }
}

// Add confetti animation to stylesheet
const style = document.createElement('style');
style.textContent = `
    @keyframes confetti {
        to {
            transform: translateY(100vh) rotate(${Math.random() * 720}deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Sound toggle
let soundEnabled = true;
function toggleSound() {
    soundEnabled = !soundEnabled;
    const icon = elements.soundToggle.querySelector('i');
    icon.className = soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);