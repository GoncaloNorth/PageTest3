
// Get the canvas elements and their contexts
const canvas1 = document.getElementById('gameCanvas1');
const canvas2 = document.getElementById('gameCanvas2');
const ctx1 = canvas1.getContext('2d');
const ctx2 = canvas2.getContext('2d');

// Game constants
const gridSize = 20;
const tileCount = 20;

// Snake 1 (WASD controls)
const snake1 = {
    x: Math.floor(tileCount / 4),
    y: Math.floor(tileCount / 2),
    dx: 1,
    dy: 0,
    cells: [],
    maxCells: 4
};

// Snake 2 (Arrow controls)
const snake2 = {
    x: Math.floor(3 * tileCount / 4),
    y: Math.floor(tileCount / 2),
    dx: -1,
    dy: 0,
    cells: [],
    maxCells: 4
};

// Food objects
const food1 = {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount)
};

const food2 = {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount)
};

// Scores
let score1 = 0;
let score2 = 0;

// Game states
let gameRunning = true;

// Event listeners for controls
document.addEventListener('keydown', function(e) {
    // Snake 1 (WASD)
    if (e.key === 'w' && snake1.dy === 0) {
        snake1.dy = -1;
        snake1.dx = 0;
    }
    else if (e.key === 's' && snake1.dy === 0) {
        snake1.dy = 1;
        snake1.dx = 0;
    }
    else if (e.key === 'a' && snake1.dx === 0) {
        snake1.dy = 0;
        snake1.dx = -1;
    }
    else if (e.key === 'd' && snake1.dx === 0) {
        snake1.dy = 0;
        snake1.dx = 1;
    }

    // Snake 2 (Arrow keys)
    if (e.key === 'ArrowUp' && snake2.dy === 0) {
        snake2.dy = -1;
        snake2.dx = 0;
    }
    else if (e.key === 'ArrowDown' && snake2.dy === 0) {
        snake2.dy = 1;
        snake2.dx = 0;
    }
    else if (e.key === 'ArrowLeft' && snake2.dx === 0) {
        snake2.dy = 0;
        snake2.dx = -1;
    }
    else if (e.key === 'ArrowRight' && snake2.dx === 0) {
        snake2.dy = 0;
        snake2.dx = 1;
    }
});

function getRandomFood(snake) {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        // Check if the new food position overlaps with the snake
        var overlap = false;
        for (let cell of snake.cells) {
            if (cell.x === newFood.x && cell.y === newFood.y) {
                overlap = true;
                break;
            }
        }
    } while (overlap);
    return newFood;
}

function drawGame() {
    if (!gameRunning) return;

    // Move snakes
    snake1.x += snake1.dx;
    snake1.y += snake1.dy;
    snake2.x += snake2.dx;
    snake2.y += snake2.dy;

    // Wrap around
    snake1.x = (snake1.x + tileCount) % tileCount;
    snake1.y = (snake1.y + tileCount) % tileCount;
    snake2.x = (snake2.x + tileCount) % tileCount;
    snake2.y = (snake2.y + tileCount) % tileCount;

    // Remember snake positions
    snake1.cells.unshift({x: snake1.x, y: snake1.y});
    snake2.cells.unshift({x: snake2.x, y: snake2.y});

    // Remove tail
    if (snake1.cells.length > snake1.maxCells) snake1.cells.pop();
    if (snake2.cells.length > snake2.maxCells) snake2.cells.pop();

    // Check for collisions with food
    if (snake1.x === food1.x && snake1.y === food1.y) {
        snake1.maxCells++;
        score1++;
        document.getElementById('score1').textContent = score1;
        Object.assign(food1, getRandomFood(snake1));
    }

    if (snake2.x === food2.x && snake2.y === food2.y) {
        snake2.maxCells++;
        score2++;
        document.getElementById('score2').textContent = score2;
        Object.assign(food2, getRandomFood(snake2));
    }

    // Check for collisions with self
    for (let i = 1; i < snake1.cells.length; i++) {
        if (snake1.x === snake1.cells[i].x && snake1.y === snake1.cells[i].y) {
            gameOver(1);
            return;
        }
    }

    for (let i = 1; i < snake2.cells.length; i++) {
        if (snake2.x === snake2.cells[i].x && snake2.y === snake2.cells[i].y) {
            gameOver(2);
            return;
        }
    }

    // Draw everything
    // Clear canvases
    ctx1.fillStyle = '#1a1a1a';
    ctx1.fillRect(0, 0, canvas1.width, canvas1.height);
    ctx2.fillStyle = '#1a1a1a';
    ctx2.fillRect(0, 0, canvas2.width, canvas2.height);

    // Draw snake 1
    ctx1.fillStyle = '#00ff00';
    snake1.cells.forEach(function(cell, index) {
        ctx1.fillRect(cell.x * gridSize, cell.y * gridSize, gridSize - 1, gridSize - 1);
    });

    // Draw snake 2
    ctx2.fillStyle = '#0000ff';
    snake2.cells.forEach(function(cell, index) {
        ctx2.fillRect(cell.x * gridSize, cell.y * gridSize, gridSize - 1, gridSize - 1);
    });

    // Draw food
    ctx1.fillStyle = '#ff0000';
    ctx1.fillRect(food1.x * gridSize, food1.y * gridSize, gridSize - 1, gridSize - 1);
    ctx2.fillStyle = '#ff0000';
    ctx2.fillRect(food2.x * gridSize, food2.y * gridSize, gridSize - 1, gridSize - 1);

    // Next frame
    requestAnimationFrame(drawGame);
}

function gameOver(player) {
    gameRunning = false;
    const ctx = player === 1 ? ctx1 : ctx2;
    const canvas = player === 1 ? canvas1 : canvas2;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Game Over!', canvas.width/2, canvas.height/2);
    
    // Add restart button
    setTimeout(() => {
        if (confirm(`Player ${player} lost! Play again?`)) {
            resetGame();
        }
    }, 100);
}

function resetGame() {
    // Reset snake 1
    snake1.x = Math.floor(tileCount / 4);
    snake1.y = Math.floor(tileCount / 2);
    snake1.cells = [];
    snake1.maxCells = 4;
    snake1.dx = 1;
    snake1.dy = 0;

    // Reset snake 2
    snake2.x = Math.floor(3 * tileCount / 4);
    snake2.y = Math.floor(tileCount / 2);
    snake2.cells = [];
    snake2.maxCells = 4;
    snake2.dx = -1;
    snake2.dy = 0;

    // Reset scores
    score1 = 0;
    score2 = 0;
    document.getElementById('score1').textContent = '0';
    document.getElementById('score2').textContent = '0';

    // Reset food
    Object.assign(food1, getRandomFood(snake1));
    Object.assign(food2, getRandomFood(snake2));

    // Reset game state
    gameRunning = true;

    // Start game
    drawGame();
}

// Start the game
drawGame(); 


