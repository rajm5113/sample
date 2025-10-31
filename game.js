// Game Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game State
let gameState = 'playing'; // playing, gameOver, levelComplete
let score = 0;
let lives = 3;
let currentLevel = 1;
let keys = {};

// Player Object
const player = {
    x: 50,
    y: 400,
    width: 30,
    height: 40,
    velocityX: 0,
    velocityY: 0,
    speed: 5,
    jumpPower: 12,
    onGround: false,
    color: '#E52521'
};

// Game Physics
const gravity = 0.5;
const friction = 0.8;

// Arrays for game objects
let platforms = [];
let coins = [];
let enemies = [];

// Level Definitions
const levels = [
    {
        platforms: [
            { x: 0, y: 550, width: 800, height: 50 }, // Ground
            { x: 150, y: 450, width: 100, height: 20 },
            { x: 300, y: 350, width: 100, height: 20 },
            { x: 450, y: 250, width: 100, height: 20 },
            { x: 600, y: 350, width: 100, height: 20 },
            { x: 650, y: 150, width: 150, height: 20 }
        ],
        coins: [
            { x: 175, y: 410, collected: false },
            { x: 325, y: 310, collected: false },
            { x: 475, y: 210, collected: false },
            { x: 625, y: 310, collected: false },
            { x: 700, y: 110, collected: false }
        ],
        enemies: [
            { x: 300, y: 500, width: 30, height: 30, velocityX: 2, direction: 1, patrolStart: 200, patrolEnd: 400 },
            { x: 450, y: 200, width: 30, height: 30, velocityX: 2, direction: 1, patrolStart: 450, patrolEnd: 550 }
        ]
    },
    {
        platforms: [
            { x: 0, y: 550, width: 200, height: 50 },
            { x: 250, y: 550, width: 550, height: 50 },
            { x: 100, y: 450, width: 80, height: 20 },
            { x: 220, y: 350, width: 80, height: 20 },
            { x: 340, y: 250, width: 80, height: 20 },
            { x: 460, y: 150, width: 80, height: 20 },
            { x: 580, y: 250, width: 80, height: 20 },
            { x: 700, y: 350, width: 80, height: 20 }
        ],
        coins: [
            { x: 125, y: 410, collected: false },
            { x: 245, y: 310, collected: false },
            { x: 365, y: 210, collected: false },
            { x: 485, y: 110, collected: false },
            { x: 605, y: 210, collected: false },
            { x: 725, y: 310, collected: false }
        ],
        enemies: [
            { x: 250, y: 500, width: 30, height: 30, velocityX: 2, direction: 1, patrolStart: 250, patrolEnd: 450 },
            { x: 500, y: 500, width: 30, height: 30, velocityX: 2, direction: 1, patrolStart: 500, patrolEnd: 700 },
            { x: 340, y: 200, width: 30, height: 30, velocityX: 2, direction: 1, patrolStart: 340, patrolEnd: 420 }
        ]
    },
    {
        platforms: [
            { x: 0, y: 550, width: 100, height: 50 },
            { x: 150, y: 480, width: 60, height: 20 },
            { x: 250, y: 410, width: 60, height: 20 },
            { x: 350, y: 340, width: 60, height: 20 },
            { x: 450, y: 270, width: 60, height: 20 },
            { x: 550, y: 200, width: 60, height: 20 },
            { x: 650, y: 270, width: 60, height: 20 },
            { x: 700, y: 550, width: 100, height: 50 }
        ],
        coins: [
            { x: 175, y: 440, collected: false },
            { x: 275, y: 370, collected: false },
            { x: 375, y: 300, collected: false },
            { x: 475, y: 230, collected: false },
            { x: 575, y: 160, collected: false },
            { x: 675, y: 230, collected: false },
            { x: 735, y: 510, collected: false }
        ],
        enemies: [
            { x: 150, y: 430, width: 30, height: 30, velocityX: 1.5, direction: 1, patrolStart: 150, patrolEnd: 210 },
            { x: 350, y: 290, width: 30, height: 30, velocityX: 1.5, direction: 1, patrolStart: 350, patrolEnd: 410 },
            { x: 550, y: 150, width: 30, height: 30, velocityX: 1.5, direction: 1, patrolStart: 550, patrolEnd: 610 },
            { x: 700, y: 500, width: 30, height: 30, velocityX: 2, direction: 1, patrolStart: 700, patrolEnd: 800 }
        ]
    }
];

// Event Listeners
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    if (e.key === 'r' || e.key === 'R') {
        restartGame();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

document.getElementById('restartBtn').addEventListener('click', restartGame);
document.getElementById('nextLevelBtn').addEventListener('click', nextLevel);

// Initialize Level
function loadLevel(levelNum) {
    const level = levels[levelNum - 1];
    platforms = JSON.parse(JSON.stringify(level.platforms));
    coins = JSON.parse(JSON.stringify(level.coins));
    enemies = JSON.parse(JSON.stringify(level.enemies));

    player.x = 50;
    player.y = 400;
    player.velocityX = 0;
    player.velocityY = 0;
}

// Player Movement
function updatePlayer() {
    if (gameState !== 'playing') return;

    // Horizontal movement
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        player.velocityX = -player.speed;
    } else if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        player.velocityX = player.speed;
    } else {
        player.velocityX *= friction;
    }

    // Jump
    if ((keys[' '] || keys['ArrowUp'] || keys['w'] || keys['W']) && player.onGround) {
        player.velocityY = -player.jumpPower;
        player.onGround = false;
    }

    // Apply gravity
    player.velocityY += gravity;

    // Update position
    player.x += player.velocityX;
    player.y += player.velocityY;

    // Boundary check
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    // Check if player falls off
    if (player.y > canvas.height) {
        loseLife();
    }
}

// Collision Detection
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Platform Collision
function checkPlatformCollision() {
    player.onGround = false;

    platforms.forEach(platform => {
        if (checkCollision(player, platform)) {
            // Landing on top of platform
            if (player.velocityY > 0 &&
                player.y + player.height - player.velocityY <= platform.y) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.onGround = true;
            }
            // Hitting platform from below
            else if (player.velocityY < 0 &&
                     player.y - player.velocityY >= platform.y + platform.height) {
                player.y = platform.y + platform.height;
                player.velocityY = 0;
            }
            // Side collision
            else {
                if (player.x < platform.x) {
                    player.x = platform.x - player.width;
                } else {
                    player.x = platform.x + platform.width;
                }
                player.velocityX = 0;
            }
        }
    });
}

// Coin Collection
function checkCoinCollection() {
    coins.forEach(coin => {
        if (!coin.collected) {
            const coinRect = { x: coin.x - 10, y: coin.y - 10, width: 20, height: 20 };
            if (checkCollision(player, coinRect)) {
                coin.collected = true;
                score += 100;
                updateScore();
                checkLevelComplete();
            }
        }
    });
}

// Enemy Collision and Movement
function updateEnemies() {
    enemies.forEach(enemy => {
        // Move enemy
        enemy.x += enemy.velocityX * enemy.direction;

        // Patrol behavior
        if (enemy.x <= enemy.patrolStart || enemy.x >= enemy.patrolEnd) {
            enemy.direction *= -1;
        }

        // Check collision with player
        if (checkCollision(player, enemy)) {
            // If player is falling on enemy
            if (player.velocityY > 0 && player.y + player.height - player.velocityY <= enemy.y + 10) {
                // Defeat enemy
                const index = enemies.indexOf(enemy);
                enemies.splice(index, 1);
                score += 50;
                updateScore();
                player.velocityY = -8; // Bounce
            } else {
                // Player gets hurt
                loseLife();
            }
        }
    });
}

// Check if level is complete
function checkLevelComplete() {
    const allCoinsCollected = coins.every(coin => coin.collected);
    if (allCoinsCollected) {
        gameState = 'levelComplete';
        document.getElementById('levelScore').textContent = score;
        document.getElementById('levelComplete').classList.remove('hidden');
    }
}

// Lose Life
function loseLife() {
    lives--;
    updateLives();

    if (lives <= 0) {
        gameOver();
    } else {
        resetPlayerPosition();
    }
}

// Reset player position
function resetPlayerPosition() {
    player.x = 50;
    player.y = 400;
    player.velocityX = 0;
    player.velocityY = 0;
}

// Game Over
function gameOver() {
    gameState = 'gameOver';
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').classList.remove('hidden');
}

// Next Level
function nextLevel() {
    document.getElementById('levelComplete').classList.add('hidden');
    currentLevel++;

    if (currentLevel > levels.length) {
        // Game completed
        alert('Congratulations! You completed all levels!');
        restartGame();
    } else {
        loadLevel(currentLevel);
        updateLevel();
        gameState = 'playing';
    }
}

// Restart Game
function restartGame() {
    document.getElementById('gameOver').classList.add('hidden');
    document.getElementById('levelComplete').classList.add('hidden');

    score = 0;
    lives = 3;
    currentLevel = 1;
    gameState = 'playing';

    loadLevel(currentLevel);
    updateScore();
    updateLives();
    updateLevel();
}

// Update UI
function updateScore() {
    document.getElementById('score').textContent = score;
}

function updateLives() {
    document.getElementById('lives').textContent = lives;
}

function updateLevel() {
    document.getElementById('level').textContent = currentLevel;
}

// Drawing Functions
function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw simple face
    ctx.fillStyle = 'white';
    ctx.fillRect(player.x + 7, player.y + 8, 6, 6); // Left eye
    ctx.fillRect(player.x + 17, player.y + 8, 6, 6); // Right eye

    ctx.fillStyle = 'black';
    ctx.fillRect(player.x + 9, player.y + 10, 2, 2); // Left pupil
    ctx.fillRect(player.x + 19, player.y + 10, 2, 2); // Right pupil
}

function drawPlatforms() {
    platforms.forEach(platform => {
        // Platform base
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

        // Platform top (grass-like)
        ctx.fillStyle = '#228B22';
        ctx.fillRect(platform.x, platform.y, platform.width, 5);

        // Platform border
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
    });
}

function drawCoins() {
    coins.forEach(coin => {
        if (!coin.collected) {
            // Gold coin
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(coin.x, coin.y, 10, 0, Math.PI * 2);
            ctx.fill();

            // Coin border
            ctx.strokeStyle = '#DAA520';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Coin detail
            ctx.fillStyle = '#DAA520';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('$', coin.x, coin.y);
        }
    });
}

function drawEnemies() {
    enemies.forEach(enemy => {
        // Enemy body
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

        // Eyes
        ctx.fillStyle = 'white';
        ctx.fillRect(enemy.x + 5, enemy.y + 8, 6, 6);
        ctx.fillRect(enemy.x + 19, enemy.y + 8, 6, 6);

        ctx.fillStyle = 'black';
        ctx.fillRect(enemy.x + 7, enemy.y + 10, 2, 2);
        ctx.fillRect(enemy.x + 21, enemy.y + 10, 2, 2);

        // Evil eyebrows
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(enemy.x + 5, enemy.y + 7);
        ctx.lineTo(enemy.x + 11, enemy.y + 5);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(enemy.x + 25, enemy.y + 7);
        ctx.lineTo(enemy.x + 19, enemy.y + 5);
        ctx.stroke();
    });
}

function drawBackground() {
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    drawCloud(100, 80);
    drawCloud(300, 50);
    drawCloud(500, 90);
    drawCloud(700, 60);
}

function drawCloud(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.arc(x + 25, y, 25, 0, Math.PI * 2);
    ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
    ctx.fill();
}

// Main Game Loop
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw
    drawBackground();
    drawPlatforms();
    drawCoins();
    drawEnemies();
    drawPlayer();

    // Update
    if (gameState === 'playing') {
        updatePlayer();
        checkPlatformCollision();
        checkCoinCollection();
        updateEnemies();
    }

    requestAnimationFrame(gameLoop);
}

// Initialize Game
loadLevel(currentLevel);
updateScore();
updateLives();
updateLevel();
gameLoop();
