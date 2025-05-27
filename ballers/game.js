// Game state
let board = [];
let currentPlayer = 'red';
let selectedPiece = null;
let timer = 10;
let timerInterval;
let mustCapture = false;
let lastCapturingPiece = null;
let missedCapture = null;

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
        pieceElement.addEventListener('click', handlePieceClick);
    }
    
    return pieceElement;
}

// Show possible moves for a piece
function showPossibleMoves(row, col) {
    // Clear any existing move indicators
    clearMoveIndicators();
    
    const piece = board[row][col];
    if (!piece || piece.color !== currentPlayer) return;

    // Check if there are any mandatory captures
    const allCaptures = findAllCaptures(currentPlayer);
    
    if (allCaptures.length > 0) {
        // Only show captures for this piece if it has any
        const pieceCaptures = findPieceCaptures(row, col, currentPlayer);
        pieceCaptures.forEach(move => {
            const cell = document.querySelector(`[data-row="${move.row}"][data-col="${move.col}"]`);
            cell.classList.add('capture-move');
        });
    } else {
        // Show regular moves
        const moves = findRegularMoves(row, col);
        moves.forEach(move => {
            const cell = document.querySelector(`[data-row="${move.row}"][data-col="${move.col}"]`);
            cell.classList.add('possible-move');
        });
    }
}

// Clear move indicators
function clearMoveIndicators() {
    document.querySelectorAll('.possible-move, .capture-move').forEach(cell => {
        cell.classList.remove('possible-move', 'capture-move');
    });
}

// Handle piece click
function handlePieceClick(e) {
    if (currentPlayer === 'red') {
        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);
        
        // Check if there are mandatory captures
        const allCaptures = findAllCaptures('red');
        
        if (allCaptures.length > 0) {
            // Only show moves if this piece can capture
            const pieceCaptures = findPieceCaptures(row, col, 'red');
            if (pieceCaptures.length > 0) {
                showPossibleMoves(row, col);
            } else {
                clearMoveIndicators();
            }
        } else {
            showPossibleMoves(row, col);
        }
    }
}

// Find regular moves for a piece
function findRegularMoves(row, col) {
    const moves = [];
    const piece = board[row][col];
    if (!piece) return moves;

    // Define move directions based on piece type
    const directions = piece.isKing ? 
        [[1, 1], [1, -1], [-1, 1], [-1, -1]] : // King moves in all diagonal directions
        [[1, 1], [1, -1]]; // Regular black pieces move downward only

    // Check each possible direction
    directions.forEach(([dRow, dCol]) => {
        const newRow = row + dRow;
        const newCol = col + dCol;
        
        // Check if the move is within bounds and the target square is empty
        if (isValidPosition(newRow, newCol) && !board[newRow][newCol]) {
            moves.push({ row: newRow, col: newCol });
        }
    });

    return moves;
}

// Handle drag start with mandatory capture check
function handleDragStart(e) {
    if (currentPlayer === 'red') {
        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);
        
        // Check if there are mandatory captures
        const allCaptures = findAllCaptures('red');
        
        if (allCaptures.length > 0) {
            // Only allow dragging pieces that can capture
            const pieceCaptures = findPieceCaptures(row, col, 'red');
            if (pieceCaptures.length > 0) {
                selectedPiece = { element: e.target, row, col };
                e.target.classList.add('dragging');
                mustCapture = true;
                showPossibleMoves(row, col);
            } else {
                e.preventDefault();
            }
        } else {
            selectedPiece = { element: e.target, row, col };
            e.target.classList.add('dragging');
            mustCapture = false;
            showPossibleMoves(row, col);
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

    // Define capture directions based on piece type
    const directions = piece.isKing ? 
        [[2, 2], [2, -2], [-2, 2], [-2, -2]] : // King captures in all directions
        [[2, 2], [2, -2]]; // Regular black pieces capture downward only

    directions.forEach(([dRow, dCol]) => {
        const newRow = row + dRow;
        const newCol = col + dCol;
        
        // Check if the landing square is valid and empty
        if (isValidPosition(newRow, newCol) && !board[newRow][newCol]) {
            const midRow = row + dRow/2;
            const midCol = col + dCol/2;
            const capturedPiece = board[midRow][midCol];
            
            // Check if there's an opponent's piece to capture
            if (capturedPiece && capturedPiece.color !== color) {
                captures.push({ 
                    row: newRow, 
                    col: newCol, 
                    capturedRow: midRow, 
                    capturedCol: midCol 
                });
            }
        }
    });
    
    return captures;
}

// Check if position is within board boundaries
function isValidPosition(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
}

// Handle drag end
function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    clearMoveIndicators();
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
    if (currentPlayer !== 'red' || !selectedPiece) return;
    
    const targetCell = e.target.closest('.cell');
    const targetRow = parseInt(targetCell.dataset.row);
    const targetCol = parseInt(targetCell.dataset.col);
    
    if (isValidMove(selectedPiece.row, selectedPiece.col, targetRow, targetCol)) {
        const isCapture = Math.abs(targetRow - selectedPiece.row) === 2;
        const movingPiece = board[selectedPiece.row][selectedPiece.col];
        
        // Move the piece
        board[selectedPiece.row][selectedPiece.col] = null;
        
        // Check for king promotion
        if (targetRow === 0 && movingPiece.color === 'red') {
            movingPiece.isKing = true;
        }
        
        board[targetRow][targetCol] = movingPiece;
        
        // Handle capture
        if (isCapture) {
            const capturedRow = (targetRow + selectedPiece.row) / 2;
            const capturedCol = (targetCol + selectedPiece.col) / 2;
            board[capturedRow][capturedCol] = null;
        }
        
        // Always switch turns after a move
        switchTurn();
        createBoard();
        setupDropZones();
        
        if (currentPlayer === 'black') {
            setTimeout(makeAIMove, 500);
        }
    }
}

// Check if move is valid with updated rules
function isValidMove(fromRow, fromCol, toRow, toCol) {
    if (!board[fromRow][fromCol] || board[toRow][toCol]) return false;
    
    const piece = board[fromRow][fromCol];
    const rowDiff = toRow - fromRow;
    const colDiff = Math.abs(toCol - fromCol);
    
    // If captures are available, only allow capture moves
    if (mustCapture) {
        if (Math.abs(rowDiff) !== 2 || colDiff !== 2) return false;
        
        const midRow = (fromRow + toRow) / 2;
        const midCol = (fromCol + toCol) / 2;
        const capturedPiece = board[midRow][midCol];
        
        return capturedPiece && capturedPiece.color !== piece.color;
    }
    
    // Regular moves
    if (colDiff === 1 && Math.abs(rowDiff) === 1) {
        if (piece.isKing) {
            return true; // Kings can move in any diagonal direction
        }
        // Regular pieces can only move forward
        return (piece.color === 'red' && rowDiff < 0) ||
               (piece.color === 'black' && rowDiff > 0);
    }
    
    return false;
}

// Check for missed captures before AI move
function checkForMissedCaptures() {
    const allCaptures = findAllCaptures('red');
    if (allCaptures.length > 0) {
        // Store the piece that missed the capture
        const piece = allCaptures[0];
        missedCapture = {
            row: piece.row,
            col: piece.col
        };
        // AI will remove this piece in its next move
        return true;
    }
    return false;
}

// Make AI move
function makeAIMove() {
    // First check for mandatory captures
    let possibleMoves = [];
    
    // Find all pieces that can capture
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece?.color === 'black') {
                const captures = findPieceCaptures(row, col, 'black');
                captures.forEach(capture => {
                    possibleMoves.push({
                        fromRow: row,
                        fromCol: col,
                        toRow: capture.row,
                        toCol: capture.col,
                        isCapture: true,
                        capturedRow: capture.capturedRow,
                        capturedCol: capture.capturedCol
                    });
                });
            }
        }
    }
    
    // If no captures available, find regular moves
    if (possibleMoves.length === 0) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece?.color === 'black') {
                    const regularMoves = findRegularMoves(row, col);
                    regularMoves.forEach(move => {
                        possibleMoves.push({
                            fromRow: row,
                            fromCol: col,
                            toRow: move.row,
                            toCol: move.col,
                            isCapture: false
                        });
                    });
                }
            }
        }
    }
    
    // Debug log
    console.log('AI possible moves:', possibleMoves);
    
    if (possibleMoves.length > 0) {
        // Prioritize captures if available
        const captures = possibleMoves.filter(move => move.isCapture);
        const moveToMake = captures.length > 0 ? 
            captures[Math.floor(Math.random() * captures.length)] :
            possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            
        console.log('AI chosen move:', moveToMake);
        
        const piece = board[moveToMake.fromRow][moveToMake.fromCol];
        
        // Move the piece
        board[moveToMake.fromRow][moveToMake.fromCol] = null;
        
        // Check for king promotion
        if (moveToMake.toRow === 7) {
            piece.isKing = true;
        }
        
        board[moveToMake.toRow][moveToMake.toCol] = piece;
        
        // Handle capture
        if (moveToMake.isCapture) {
            board[moveToMake.capturedRow][moveToMake.capturedCol] = null;
        }
        
        // Always switch turns after a move
        switchTurn();
        createBoard();
        setupDropZones();
    } else {
        // If no moves are available, game might be over
        console.log('No moves available for AI');
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
