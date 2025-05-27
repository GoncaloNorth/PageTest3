
let board = [];
let currentPlayer = 'red';
let selectedPiece = null;
let timer = 10;
let timerInterval;

// DOM elements
const boardElement = document.getElementById('board');
const timerElement = document.getElementById('timer');
const turnIndicatorElement = document.getElementById('turnIndicator');

// Initialize the game board
function initializeBoard() {
    board = Array(8).fill().map(() => Array(8).fill(null));
    
    // Place initial pieces
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if ((row + col) % 2 === 1) {
                if (row < 3) {
                    board[row][col] = 'black';
                } else if (row > 4) {
                    board[row][col] = 'red';
                }
            }
        }
    }
}

// Create the visual board
function createBoard() {
    boardElement.innerHTML = '';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const cell = document.createElement('div');
            cell.className = `cell ${(row + col) % 2 === 0 ? 'white' : 'black'}`;
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            if (board[row][col]) {
                const piece = createPiece(board[row][col], row, col);
                cell.appendChild(piece);
            }
            
            boardElement.appendChild(cell);
        }
    }
}

// Create a game piece
function createPiece(color, row, col) {
    const piece = document.createElement('div');
    piece.className = `piece ${color}`;
    piece.draggable = color === 'red'; // Only red pieces are draggable
    piece.dataset.row = row;
    piece.dataset.col = col;
    
    // Drag events only for red pieces
    if (color === 'red') {
        piece.addEventListener('dragstart', handleDragStart);
        piece.addEventListener('dragend', handleDragEnd);
    }
    
    return piece;
}

// Handle drag start
function handleDragStart(e) {
    if (currentPlayer === 'red') {
        selectedPiece = {
            element: e.target,
            row: parseInt(e.target.dataset.row),
            col: parseInt(e.target.dataset.col)
        };
        e.target.classList.add('dragging');
    } else {
        e.preventDefault();
    }
}

// Handle drag end
function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

// Add drop zone functionality
function setupDropZones() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.addEventListener('dragover', e => e.preventDefault());
        cell.addEventListener('drop', handleDrop);
    });
}

// Handle piece drop
function handleDrop(e) {
    e.preventDefault();
    if (currentPlayer !== 'red') return;
    
    const targetCell = e.target.closest('.cell');
    const targetRow = parseInt(targetCell.dataset.row);
    const targetCol = parseInt(targetCell.dataset.col);
    
    if (isValidMove(selectedPiece.row, selectedPiece.col, targetRow, targetCol)) {
        // Move the piece
        board[selectedPiece.row][selectedPiece.col] = null;
        board[targetRow][targetCol] = currentPlayer;
        
        // Check for captures
        if (Math.abs(targetRow - selectedPiece.row) === 2) {
            const capturedRow = (targetRow + selectedPiece.row) / 2;
            const capturedCol = (targetCol + selectedPiece.col) / 2;
            board[capturedRow][capturedCol] = null;
        }
        
        // Switch turns and trigger AI
        switchTurn();
        createBoard();
        setupDropZones();
        
        if (currentPlayer === 'black') {
            setTimeout(makeAIMove, 1000);
        }
    }
}

// AI move function
function makeAIMove() {
    const possibleMoves = [];
    
    // Find all possible moves for black pieces
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (board[row][col] === 'black') {
                // Check possible captures
                if (canCapture(row, col)) {
                    const captures = findCaptures(row, col);
                    possibleMoves.push(...captures.map(move => ({
                        fromRow: row,
                        fromCol: col,
                        toRow: move.row,
                        toCol: move.col,
                        isCapture: true
                    })));
                }
                // Check regular moves
                const moves = findRegularMoves(row, col);
                possibleMoves.push(...moves.map(move => ({
                    fromRow: row,
                    fromCol: col,
                    toRow: move.row,
                    toCol: move.col,
                    isCapture: false
                })));
            }
        }
    }
    
    // Prioritize captures
    const captures = possibleMoves.filter(move => move.isCapture);
    const moveToMake = captures.length > 0 
        ? captures[Math.floor(Math.random() * captures.length)]
        : possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    
    if (moveToMake) {
        // Make the move
        board[moveToMake.fromRow][moveToMake.fromCol] = null;
        board[moveToMake.toRow][moveToMake.toCol] = 'black';
        
        if (moveToMake.isCapture) {
            const capturedRow = (moveToMake.toRow + moveToMake.fromRow) / 2;
            const capturedCol = (moveToMake.toCol + moveToMake.fromCol) / 2;
            board[capturedRow][capturedCol] = null;
        }
        
        switchTurn();
        createBoard();
        setupDropZones();
    }
}

// Helper functions for AI
function canCapture(row, col) {
    const directions = [[2, 2], [2, -2], [-2, 2], [-2, -2]];
    return directions.some(([dRow, dCol]) => {
        const newRow = row + dRow;
        const newCol = col + dCol;
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const midRow = row + dRow/2;
            const midCol = col + dCol/2;
            return board[newRow][newCol] === null && 
                   board[midRow][midCol] === 'red';
        }
        return false;
    });
}

function findCaptures(row, col) {
    const captures = [];
    const directions = [[2, 2], [2, -2], [-2, 2], [-2, -2]];
    
    directions.forEach(([dRow, dCol]) => {
        const newRow = row + dRow;
        const newCol = col + dCol;
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const midRow = row + dRow/2;
            const midCol = col + dCol/2;
            if (board[newRow][newCol] === null && board[midRow][midCol] === 'red') {
                captures.push({ row: newRow, col: newCol });
            }
        }
    });
    
    return captures;
}

function findRegularMoves(row, col) {
    const moves = [];
    const directions = [[1, 1], [1, -1]]; // Black moves downward
    
    directions.forEach(([dRow, dCol]) => {
        const newRow = row + dRow;
        const newCol = col + dCol;
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            if (board[newRow][newCol] === null) {
                moves.push({ row: newRow, col: newCol });
            }
        }
    });
    
    return moves;
}

// Check if move is valid
function isValidMove(fromRow, fromCol, toRow, toCol) {
    if (board[toRow][toCol] !== null) return false;
    
    const rowDiff = toRow - fromRow;
    const colDiff = Math.abs(toCol - fromCol);
    
    // Normal move
    if (colDiff === 1) {
        if (currentPlayer === 'red' && rowDiff === -1) return true;
        if (currentPlayer === 'black' && rowDiff === 1) return true;
    }
    
    // Capture move
    if (colDiff === 2 && Math.abs(rowDiff) === 2) {
        const capturedRow = (toRow + fromRow) / 2;
        const capturedCol = (toCol + fromCol) / 2;
        const capturedPiece = board[capturedRow][capturedCol];
        
        return capturedPiece && capturedPiece !== currentPlayer;
    }
    
    return false;
}

// Switch turns and reset timer
function switchTurn() {
    currentPlayer = currentPlayer === 'red' ? 'black' : 'red';
    turnIndicatorElement.textContent = currentPlayer === 'red' ? 'Your Turn' : 'AI Thinking...';
    if (currentPlayer === 'red') {
        resetTimer();
    } else {
        clearInterval(timerInterval);
        timerElement.textContent = '---';
    }
}

// Timer functions
function startTimer() {
    timer = 10;
    updateTimerDisplay();
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timer -= 0.1;
        if (timer <= 0) {
            timer = 0;
            clearInterval(timerInterval);
            if (currentPlayer === 'red') {
                switchTurn();
                setTimeout(makeAIMove, 1000);
            }
        }
        updateTimerDisplay();
    }, 100);
}

function resetTimer() {
    startTimer();
}

function updateTimerDisplay() {
    timerElement.textContent = timer.toFixed(1);
    timerElement.classList.toggle('warning', timer <= 3);
}

// Initialize the game
function initGame() {
    initializeBoard();
    createBoard();
    setupDropZones();
    startTimer();
}

// Start the game
initGame(); 
