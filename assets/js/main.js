// Main hub interactions
document.addEventListener('DOMContentLoaded', () => {
    // Animate stats counter
    animateStats();
    
    // Add hover effects to game cards
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
    
    // Random player count updates
    setInterval(() => {
        updatePlayerCounts();
    }, 30000);
});

function animateStats() {
    const statValues = document.querySelectorAll('.stat-value');
    statValues.forEach(stat => {
        const target = parseInt(stat.textContent.replace(/[^0-9]/g, ''));
        let current = 0;
        
        const interval = setInterval(() => {
            if (current < target) {
                current += Math.ceil(target / 50);
                if (current > target) current = target;
                stat.textContent = current.toLocaleString() + (stat.textContent.includes('K') ? 'K' : '');
            } else {
                clearInterval(interval);
            }
        }, 50);
    });
}

function updatePlayerCounts() {
    const playerCounts = document.querySelectorAll('.players-online');
    playerCounts.forEach(count => {
        const current = parseInt(count.textContent.replace(/[^0-9]/g, ''));
        const change = Math.floor(Math.random() * 200) - 100;
        const newCount = Math.max(500, current + change);
        count.innerHTML = `<i class="fas fa-users"></i> ${(newCount/1000).toFixed(1)}k playing`;
    });
}