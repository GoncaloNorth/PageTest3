let board = [];
let currentPlayer = 'red';
let selectedPiece = null;
let timer = 10;
let timerInterval;
let mustCapture = false;
let lastCapturingPiece = null;

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
                    board[row][col] = { color: 'black', isKing: false };
                } else if (row > 4) {
                    board[row][col] = { color: 'red', isKing: false };
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
function createPiece(piece, row, col) {
    const pieceElement = document.createElement('div');
    pieceElement.className = `piece ${piece.color}${piece.isKing ? ' king' : ''}`;
    pieceElement.draggable = piece.color === 'red';
    pieceElement.dataset.row = row;
    pieceElement.dataset.col = col;
    
    if (piece.color === 'red') {
        pieceElement.addEventListener('dragstart', handleDragStart);
        pieceElement.addEventListener('dragend', handleDragEnd);
    }
    
    return pieceElement;
}

// Handle drag start
function handleDragStart(e) {
    if (currentPlayer === 'red') {
        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);
        
        // Check if there are mandatory captures
        const hasCaptures = findAllCaptures('red').length > 0;
        
        if (hasCaptures) {
            // If this piece can capture, allow drag
            const pieceCaptures = findPieceCaptures(row, col, 'red');
            if (pieceCaptures.length > 0) {
                selectedPiece = { element: e.target, row, col };
                e.target.classList.add('dragging');
            } else {
                e.preventDefault();
                alert('You must capture when possible!');
            }
        } else if (lastCapturingPiece && lastCapturingPiece.row === row && lastCapturingPiece.col === col) {
            // Allow continued captures
            const pieceCaptures = findPieceCaptures(row, col, 'red');
            if (pieceCaptures.length > 0) {
                selectedPiece = { element: e.target, row, col };
                e.target.classList.add('dragging');
            } else {
                switchTurn();
                createBoard();
                setupDropZones();
                e.preventDefault();
            }
        } else if (!hasCaptures && !lastCapturingPiece) {
            selectedPiece = { element: e.target, row, col };
            e.target.classList.add('dragging');
        } else {
            e.preventDefault();
        }
    } else {
        e.preventDefault();
    }
}

// Find all possible captures for a color
function findAllCaptures(color) {
    const captures = [];
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (board[row][col]?.color === color) {
                const pieceCaptures = findPieceCaptures(row, col, color);
                captures.push(...pieceCaptures);
            }
        }
    }
    return captures;
}

// Find captures for a specific piece
function findPieceCaptures(row, col, color) {
    const captures = [];
    const piece = board[row][col];
    if (!piece) return captures;

    const directions = piece.isKing ? 
        [[2, 2], [2, -2], [-2, 2], [-2, -2]] : // King moves
        (color === 'red' ? [[-2, 2], [-2, -2]] : [[2, 2], [2, -2]]); // Regular moves

    directions.forEach(([dRow, dCol]) => {
        const newRow = row + dRow;
        const newCol = col + dCol;
        if (isValidPosition(newRow, newCol) && !board[newRow][newCol]) {
            const midRow = row + dRow/2;
            const midCol = col + dCol/2;
            const capturedPiece = board[midRow][midCol];
            if (capturedPiece && capturedPiece.color !== color) {
                captures.push({ row: newRow, col: newCol, capturedRow: midRow, capturedCol: midCol });
            }
        }
    });
    
    return captures;
}

// Check if position is within board
function isValidPosition(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
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
        const isCapture = Math.abs(targetRow - selectedPiece.row) === 2;
        
        // Move the piece
        const movingPiece = board[selectedPiece.row][selectedPiece.col];
        board[selectedPiece.row][selectedPiece.col] = null;
        
        // Check for king promotion
        if (targetRow === 0 && movingPiece.color === 'red') {
            movingPiece.isKing = true;
        }
        
        board[targetRow][targetCol] = movingPiece;
        
        if (isCapture) {
            const capturedRow = (targetRow + selectedPiece.row) / 2;
            const capturedCol = (targetCol + selectedPiece.col) / 2;
            board[capturedRow][capturedCol] = null;
            
            // Check for additional captures
            const additionalCaptures = findPieceCaptures(targetRow, targetCol, 'red');
            if (additionalCaptures.length > 0) {
                lastCapturingPiece = { row: targetRow, col: targetCol };
                createBoard();
                setupDropZones();
                return;
            }
        }
        
        lastCapturingPiece = null;
        switchTurn();
        createBoard();
        setupDropZones();
        
        if (currentPlayer === 'black') {
            setTimeout(makeAIMove, 1000);
        }
    }
}

// Check if move is valid
function isValidMove(fromRow, fromCol, toRow, toCol) {
    if (!board[fromRow][fromCol] || board[toRow][toCol]) return false;
    
    const piece = board[fromRow][fromCol];
    const rowDiff = toRow - fromRow;
    const colDiff = Math.abs(toCol - fromCol);
    
    // Check for mandatory captures
    const hasCaptures = findAllCaptures('red').length > 0;
    
    // If there are captures available, only allow capture moves
    if (hasCaptures) {
        if (Math.abs(rowDiff) !== 2 || colDiff !== 2) return false;
        
        const midRow = (fromRow + toRow) / 2;
        const midCol = (fromCol + toCol) / 2;
        const capturedPiece = board[midRow][midCol];
        
        return capturedPiece && capturedPiece.color !== piece.color;
    }
    
    // Regular moves
    if (colDiff === 1) {
        if (piece.isKing) {
            return Math.abs(rowDiff) === 1;
        }
        return (piece.color === 'red' && rowDiff === -1) ||
               (piece.color === 'black' && rowDiff === 1);
    }
    
    return false;
}

// AI move function
function makeAIMove() {
    // First, check for mandatory captures
    let possibleMoves = findAllCaptures('black');
    
    // If no captures, find regular moves
    if (possibleMoves.length === 0) {
        possibleMoves = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (board[row][col]?.color === 'black') {
                    const piece = board[row][col];
                    const directions = piece.isKing ? 
                        [[1, 1], [1, -1], [-1, 1], [-1, -1]] :
                        [[1, 1], [1, -1]];
                    
                    directions.forEach(([dRow, dCol]) => {
                        const newRow = row + dRow;
                        const newCol = col + dCol;
                        if (isValidPosition(newRow, newCol) && !board[newRow][newCol]) {
                            possibleMoves.push({
                                fromRow: row,
                                fromCol: col,
                                toRow: newRow,
                                toCol: newCol
                            });
                        }
                    });
                }
            }
        }
    }
    
    if (possibleMoves.length > 0) {
        const move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        const piece = board[move.fromRow][move.fromCol];
        
        // Move the piece
        board[move.fromRow][move.fromCol] = null;
        
        // Check for king promotion
        if (move.toRow === 7) {
            piece.isKing = true;
        }
        
        board[move.toRow][move.toCol] = piece;
        
        // Handle capture
        if (Math.abs(move.toRow - move.fromRow) === 2) {
            const capturedRow = (move.toRow + move.fromRow) / 2;
            const capturedCol = (move.toCol + move.fromCol) / 2;
            board[capturedRow][capturedCol] = null;
            
            // Check for additional captures
            const additionalCaptures = findPieceCaptures(move.toRow, move.toCol, 'black');
            if (additionalCaptures.length > 0) {
                // AI will always take additional captures
                setTimeout(() => makeAIMove(), 500);
                createBoard();
                return;
            }
        }
        
        switchTurn();
        createBoard();
        setupDropZones();
    }
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


