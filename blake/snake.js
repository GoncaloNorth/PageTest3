// Get the canvas elements and their contexts
const canvas1 = document.getElementById('gameCanvas1');
const canvas2 = document.getElementById('gameCanvas2');
const ctx1 = canvas1.getContext('2d');
const ctx2 = canvas2.getContext('2d');

// Game constants
const gridSize = 20;
const tileCount = 20;

// Initialize game state
let gameRunning = true;
let score1 = 0;
let score2 = 0;

// Snake 1 (WASD controls)
const snake1 = {
    x: Math.floor(tileCount / 4),
    y: Math.floor(tileCount / 2),
    dx: 1,
    dy: 0,
    cells: [{x: Math.floor(tileCount / 4), y: Math.floor(tileCount / 2)}],
    maxCells: 4
};

// Snake 2 (Arrow controls)
const snake2 = {
    x: Math.floor(3 * tileCount / 4),
    y: Math.floor(tileCount / 2),
    dx: -1,
    dy: 0,
    cells: [{x: Math.floor(3 * tileCount / 4), y: Math.floor(tileCount / 2)}],
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

// Event listeners for controls
document.addEventListener('keydown', function(e) {
    console.log('Key pressed:', e.key); // Debug log
    
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

// ... existing code ...

function drawGame() {
    console.log('Drawing game frame'); // Debug log
    
    if (!gameRunning) return;

    // Clear canvases with grid
    drawGrid(ctx1);
    drawGrid(ctx2);

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

    // Draw snakes
    ctx1.fillStyle = '#00ff00';
    snake1.cells.forEach(function(cell) {
        ctx1.fillRect(cell.x * gridSize, cell.y * gridSize, gridSize - 1, gridSize - 1);
    });

    ctx2.fillStyle = '#0000ff';
    snake2.cells.forEach(function(cell) {
        ctx2.fillRect(cell.x * gridSize, cell.y * gridSize, gridSize - 1, gridSize - 1);
    });

    // Draw food
    ctx1.fillStyle = '#ff0000';
    ctx1.fillRect(food1.x * gridSize, food1.y * gridSize, gridSize - 1, gridSize - 1);
    ctx2.fillStyle = '#ff0000';
    ctx2.fillRect(food2.x * gridSize, food2.y * gridSize, gridSize - 1, gridSize - 1);

    // Check collisions and update score
    checkCollisions();

    // Next frame
    requestAnimationFrame(drawGame);
}

function drawGrid(ctx) {
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, 0, canvas1.width, canvas1.height);
    
    ctx.strokeStyle = '#3a3a3a';
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas1.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas1.width, i * gridSize);
        ctx.stroke();
    }
}

function checkCollisions() {
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
}

// ... rest of the existing code ...

// Initialize the game
console.log('Game initializing...'); // Debug log
drawGame();
