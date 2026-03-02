// Tic Tac Toe Game State
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
let playerScore = 0;
let botScore = 0;
let gamesPlayed = 0;
let powerUps = {
    doubleMove: false,
    block: false,
    undo: false
};
let lastMove = null;
let moveHistory = [];

// DOM Elements
const elements = {
    board: document.getElementById('board'),
    gamesPlayed: document.getElementById('gamesPlayed'),
    resetBtn: document.getElementById('resetGame'),
    soundToggle: document.getElementById('soundToggle')
};

// Winning combinations
const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
];

// Sound Effects
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (!audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch(type) {
        case 'place':
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            break;
        case 'win':
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.3);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
            break;
        case 'lose':
            oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.3);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
            break;
    }
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

// Initialize Game
function initGame() {
    createBoard();
    addEventListeners();
    updateGamesPlayed();
}

// Create the game board
function createBoard() {
    if (!elements.board) return;
    
    elements.board.innerHTML = '';
    
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.className = 'ttt-cell';
        cell.dataset.index = i;
        cell.addEventListener('click', () => handleCellClick(i));
        elements.board.appendChild(cell);
    }
}

// Add event listeners
function addEventListeners() {
    if (elements.resetBtn) {
        elements.resetBtn.addEventListener('click', resetGame);
    }
    
    if (elements.soundToggle) {
        elements.soundToggle.addEventListener('click', toggleSound);
    }
    
    // Power-up listeners
    document.querySelectorAll('.powerup-item').forEach((item, index) => {
        item.addEventListener('click', () => {
            const powerUps = ['doubleMove', 'block', 'undo'];
            activatePowerUp(powerUps[index]);
        });
    });
}

// Handle cell click
function handleCellClick(index) {
    if (!gameActive || currentPlayer !== 'X' || board[index] !== '') return;
    
    // Check if cell is blocked by power-up
    if (powerUps.block && Math.random() < 0.3) {
        showMessage('Bot blocked your move!');
        return;
    }
    
    // Make move
    makeMove(index, 'X');
    
    // Check for double move power-up
    if (powerUps.doubleMove && gameActive) {
        powerUps.doubleMove = false;
        setTimeout(() => {
            if (gameActive) {
                showMessage('Double move activated!');
            }
        }, 500);
    } else {
        // Bot's turn
        setTimeout(() => botMove(), 500);
    }
}

// Make a move
function makeMove(index, player) {
    if (!gameActive || board[index] !== '') return false;
    
    // Update board
    board[index] = player;
    lastMove = { index, player };
    moveHistory.push({ index, player });
    
    // Update UI
    const cell = document.querySelector(`[data-index="${index}"]`);
    if (cell) {
        cell.textContent = player;
        cell.classList.add(player.toLowerCase());
        
        // Add animation
        cell.style.animation = 'winPulse 0.3s ease-out';
        setTimeout(() => {
            cell.style.animation = '';
        }, 300);
    }
    
    playSound('place');
    
    // Check win condition
    const winCondition = checkWin(player);
    if (winCondition) {
        handleWin(winCondition, player);
    } else if (isBoardFull()) {
        handleTie();
    } else {
        currentPlayer = player === 'X' ? 'O' : 'X';
    }
    
    return true;
}

// Bot move with AI
function botMove() {
    if (!gameActive || currentPlayer !== 'O') return;
    
    // Add thinking delay
    setTimeout(() => {
        if (!gameActive) return;
        
        let moveIndex;
        
        // Check if bot can win
        moveIndex = getWinningMove('O');
        if (moveIndex === -1) {
            // Check if need to block player
            moveIndex = getWinningMove('X');
        }
        
        if (moveIndex === -1) {
            // Try to take center
            if (board[4] === '') {
                moveIndex = 4;
            } else {
                // Take random corner
                const corners = [0, 2, 6, 8].filter(i => board[i] === '');
                if (corners.length > 0) {
                    moveIndex = corners[Math.floor(Math.random() * corners.length)];
                } else {
                    // Take any available cell
                    const available = board.reduce((acc, cell, idx) => {
                        if (cell === '') acc.push(idx);
                        return acc;
                    }, []);
                    moveIndex = available[Math.floor(Math.random() * available.length)];
                }
            }
        }
        
        if (moveIndex !== undefined && moveIndex !== -1) {
            makeMove(moveIndex, 'O');
        }
    }, 600);
}

// Get winning move for a player
function getWinningMove(player) {
    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        
        if (board[a] === player && board[b] === player && board[c] === '') return c;
        if (board[a] === player && board[c] === player && board[b] === '') return b;
        if (board[b] === player && board[c] === player && board[a] === '') return a;
    }
    
    return -1;
}

// Check win condition
function checkWin(player) {
    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        if (board[a] === player && board[b] === player && board[c] === player) {
            return condition;
        }
    }
    return null;
}

// Handle win
function handleWin(winCondition, player) {
    gameActive = false;
    
    // Highlight winning cells
    winCondition.forEach(index => {
        const cell = document.querySelector(`[data-index="${index}"]`);
        if (cell) {
            cell.style.background = 'rgba(0, 255, 0, 0.2)';
            cell.style.boxShadow = '0 0 30px #00ff00';
        }
    });
    
    // Update score
    if (player === 'X') {
        playerScore++;
        showMessage('VICTORY! ✨');
        playSound('win');
    } else {
        botScore++;
        showMessage('DEFEAT! 💀');
        playSound('lose');
    }
    
    gamesPlayed++;
    updateGamesPlayed();
    
    // Create celebration effect
    if (player === 'X') {
        createConfetti();
    }
}

// Handle tie
function handleTie() {
    gameActive = false;
    showMessage("DRAW! 🤝");
    playSound('place');
    gamesPlayed++;
    updateGamesPlayed();
    
    // Highlight all cells
    document.querySelectorAll('.ttt-cell').forEach(cell => {
        cell.style.background = 'rgba(255, 255, 0, 0.1)';
    });
}

// Check if board is full
function isBoardFull() {
    return board.every(cell => cell !== '');
}

// Reset game
function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    lastMove = null;
    moveHistory = [];
    
    // Reset UI
    document.querySelectorAll('.ttt-cell').forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o');
        cell.style.background = '';
        cell.style.boxShadow = '';
    });
    
    showMessage('New Game!');
}

// Show message
function showMessage(text) {
    const resultDisplay = document.querySelector('.result-text');
    if (resultDisplay) {
        resultDisplay.textContent = text;
        resultDisplay.classList.add('active');
        
        setTimeout(() => {
            resultDisplay.classList.remove('active');
        }, 2000);
    } else {
        // Create temporary message if result display doesn't exist
        const msg = document.createElement('div');
        msg.className = 'result-text';
        msg.textContent = text;
        msg.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 1000;
            animation: fadeInOut 2s forwards;
        `;
        
        document.body.appendChild(msg);
        
        setTimeout(() => {
            msg.remove();
        }, 2000);
    }
}

// Update games played display
function updateGamesPlayed() {
    if (elements.gamesPlayed) {
        elements.gamesPlayed.textContent = gamesPlayed;
    }
}

// Power-ups
function activatePowerUp(type) {
    if (!gameActive) return;
    
    switch(type) {
        case 'doubleMove':
            powerUps.doubleMove = true;
            showMessage('Double Move Ready! ⚡');
            break;
            
        case 'block':
            powerUps.block = true;
            showMessage('Block Activated! 🛡️');
            setTimeout(() => {
                powerUps.block = false;
            }, 10000); // Lasts 10 seconds
            break;
            
        case 'undo':
            if (moveHistory.length > 0) {
                // Undo last player move
                const lastPlayerMove = [...moveHistory].reverse().find(m => m.player === 'X');
                if (lastPlayerMove) {
                    board[lastPlayerMove.index] = '';
                    const cell = document.querySelector(`[data-index="${lastPlayerMove.index}"]`);
                    if (cell) {
                        cell.textContent = '';
                        cell.classList.remove('x');
                    }
                    
                    // Remove from history
                    moveHistory = moveHistory.filter(m => m.index !== lastPlayerMove.index);
                    
                    // Also undo bot's last move if it exists
                    const lastBotMove = [...moveHistory].reverse().find(m => m.player === 'O');
                    if (lastBotMove) {
                        board[lastBotMove.index] = '';
                        const botCell = document.querySelector(`[data-index="${lastBotMove.index}"]`);
                        if (botCell) {
                            botCell.textContent = '';
                            botCell.classList.remove('o');
                        }
                        moveHistory = moveHistory.filter(m => m.index !== lastBotMove.index);
                    }
                    
                    showMessage('Move Undone! ↩️');
                }
            }
            break;
    }
    
    // Visual feedback
    const powerUpElement = event.currentTarget;
    powerUpElement.style.transform = 'scale(1.1)';
    setTimeout(() => {
        powerUpElement.style.transform = '';
    }, 200);
}

// Confetti effect
function createConfetti() {
    const colors = ['#00f3ff', '#ff36b0', '#b537f2', '#ffd700', '#00ff88'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            top: -10px;
            left: ${Math.random() * 100}vw;
            width: ${Math.random() * 8 + 4}px;
            height: ${Math.random() * 8 + 4}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            transform: rotate(${Math.random() * 360}deg);
            z-index: 1000;
            pointer-events: none;
            animation: confettiFall ${Math.random() * 3 + 2}s linear forwards;
        `;
        
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            confetti.remove();
        }, 5000);
    }
}

// Add confetti animation
const style = document.createElement('style');
style.textContent = `
    @keyframes confettiFall {
        to {
            transform: translateY(100vh) rotate(${Math.random() * 720}deg);
            opacity: 0;
        }
    }
    
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
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

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);