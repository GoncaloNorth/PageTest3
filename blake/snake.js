// Get the canvas elements and their contexts
const canvas1 = document.getElementById('gameCanvas1');
const canvas2 = document.getElementById('gameCanvas2');
const ctx1 = canvas1.getContext('2d');
const ctx2 = canvas2.getContext('2d');

// Game constants
const gridSize = 20;
const tileCount = 20;
const gameSpeed = 150; // Controls snake speed (higher = slower)

// Initialize game state
let gameRunning = true;
let score1 = 0;
let score2 = 0;
let lastTime = 0;

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

function drawGame(currentTime) {
    if (!gameRunning) {
        requestAnimationFrame(drawGame);
        return;
    }

    // Control game speed
    if (currentTime - lastTime < gameSpeed) {
        requestAnimationFrame(drawGame);
        return;
    }
    lastTime = currentTime;

    // Clear canvases with grid
    drawGrid(ctx1);
    drawGrid(ctx2);

    // Move snakes
    moveSnake(snake1);
    moveSnake(snake2);

    // Draw everything
    drawSnake(ctx1, snake1, '#00ff00');
    drawSnake(ctx2, snake2, '#0000ff');
    drawFood();

    // Check collisions and update score
    checkCollisions();

    // Next frame
    requestAnimationFrame(drawGame);
}

function moveSnake(snake) {
    // Update position
    snake.x += snake.dx;
    snake.y += snake.dy;

    // Check wall collision
    if (snake.x < 0 || snake.x >= tileCount || snake.y < 0 || snake.y >= tileCount) {
        gameOver(snake === snake1 ? 2 : 1);
        return;
    }

    // Update snake cells
    snake.cells.unshift({x: snake.x, y: snake.y});
    if (snake.cells.length > snake.maxCells) {
        snake.cells.pop();
    }
}

function drawSnake(ctx, snake, color) {
    ctx.fillStyle = color;
    snake.cells.forEach(function(cell, index) {
        if (index === 0) {
            // Draw head slightly darker
            ctx.fillStyle = color.replace('ff', 'cc');
        } else {
            ctx.fillStyle = color;
        }
        ctx.fillRect(cell.x * gridSize, cell.y * gridSize, gridSize - 1, gridSize - 1);
    });
}

function drawFood() {
    ctx1.fillStyle = '#ff0000';
    ctx1.fillRect(food1.x * gridSize, food1.y * gridSize, gridSize - 1, gridSize - 1);
    ctx2.fillStyle = '#ff0000';
    ctx2.fillRect(food2.x * gridSize, food2.y * gridSize, gridSize - 1, gridSize - 1);
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
    // Check for self collision - Snake 1
    for (let i = 1; i < snake1.cells.length; i++) {
        if (snake1.x === snake1.cells[i].x && snake1.y === snake1.cells[i].y) {
            gameOver(2); // Player 2 wins
            return;
        }
    }

    // Check for self collision - Snake 2
    for (let i = 1; i < snake2.cells.length; i++) {
        if (snake2.x === snake2.cells[i].x && snake2.y === snake2.cells[i].y) {
            gameOver(1); // Player 1 wins
            return;
        }
    }

    // Check for food collision
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
}

function gameOver(winner) {
    gameRunning = false;
    
    // Draw game over screen on both canvases
    [ctx1, ctx2].forEach(ctx => {
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, canvas1.width, canvas1.height);
        
        // Winner text
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`Player ${winner} Won!`, canvas1.width/2, canvas1.height/2 - 40);

        // Create buttons
        const buttonY = canvas1.height/2 + 20;
        
        // Home button
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(canvas1.width/2 - 120, buttonY, 100, 40);
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText('Home', canvas1.width/2 - 70, buttonY + 25);
        
        // Rematch button
        ctx.fillStyle = '#2196F3';
        ctx.fillRect(canvas1.width/2 + 20, buttonY, 100, 40);
        ctx.fillStyle = 'white';
        ctx.fillText('Rematch', canvas1.width/2 + 70, buttonY + 25);
    });

    // Add click handlers for buttons
    function handleClick(e) {
        const rect = canvas1.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const buttonY = canvas1.height/2 + 20;

        if (y >= buttonY && y <= buttonY + 40) {
            if (x >= canvas1.width/2 - 120 && x <= canvas1.width/2 - 20) {
                // Home button clicked
                window.location.href = '/';
            } else if (x >= canvas1.width/2 + 20 && x <= canvas1.width/2 + 120) {
                // Rematch button clicked
                resetGame();
                canvas1.removeEventListener('click', handleClick);
                canvas2.removeEventListener('click', handleClick);
            }
        }
    }

    canvas1.addEventListener('click', handleClick);
    canvas2.addEventListener('click', handleClick);
}

function resetGame() {
    // Reset snake 1
    snake1.x = Math.floor(tileCount / 4);
    snake1.y = Math.floor(tileCount / 2);
    snake1.cells = [{x: snake1.x, y: snake1.y}];
    snake1.maxCells = 4;
    snake1.dx = 1;
    snake1.dy = 0;

    // Reset snake 2
    snake2.x = Math.floor(3 * tileCount / 4);
    snake2.y = Math.floor(tileCount / 2);
    snake2.cells = [{x: snake2.x, y: snake2.y}];
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
    lastTime = 0;
}

// Initialize the game
console.log('Game initializing...'); // Debug log
resetGame();
drawGame(0);
