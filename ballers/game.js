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

// Find all possible capture sequences for a piece
function findCaptureSequences(row, col, color) {
    const sequences = new Set(); // Use Set to avoid duplicate end positions
    const piece = board[row][col];
    if (!piece || piece.color !== color) return [];

    function findSequence(currentRow, currentCol, sequence = [], capturedPieces = new Set()) {
        const captures = findPieceCaptures(currentRow, currentCol, color);
        
        // If no more captures are available, add this sequence if it captured at least one piece
        if (captures.length === 0) {
            if (sequence.length > 0) {
                sequences.add(JSON.stringify({
                    path: sequence,
                    row: currentRow,
                    col: currentCol,
                    capturedPieces: Array.from(capturedPieces)
                }));
            }
            return;
        }

        // Try each possible capture
        captures.forEach(capture => {
            const captureKey = `${capture.capturedRow},${capture.capturedCol}`;
            // Only proceed if we haven't captured this piece in this sequence
            if (!capturedPieces.has(captureKey)) {
                // Create new sets/arrays for this branch of captures
                const newCaptured = new Set(capturedPieces);
                newCaptured.add(captureKey);
                const newSequence = [...sequence, {
                    from: { row: currentRow, col: currentCol },
                    to: { row: capture.row, col: capture.col },
                    captured: { row: capture.capturedRow, col: capture.capturedCol }
                }];

                // Temporarily update board state
                const tempPiece = board[currentRow][currentCol];
                const tempCaptured = board[capture.capturedRow][capture.capturedCol];
                board[currentRow][currentCol] = null;
                board[capture.capturedRow][capture.capturedCol] = null;
                board[capture.row][capture.col] = tempPiece;

                // Recursively find more captures
                findSequence(capture.row, capture.col, newSequence, newCaptured);

                // Restore board state
                board[currentRow][currentCol] = tempPiece;
                board[capture.capturedRow][capture.capturedCol] = tempCaptured;
                board[capture.row][capture.col] = null;
            }
        });
    }

    findSequence(row, col);
    return Array.from(sequences).map(s => JSON.parse(s));
}

// Show possible moves for a piece
function showPossibleMoves(row, col) {
    clearMoveIndicators();
    
    const piece = board[row][col];
    if (!piece || piece.color !== currentPlayer) return;

    // Check for capture sequences
    const captureSequences = findCaptureSequences(row, col, currentPlayer);
    
    if (captureSequences.length > 0) {
        // Show all possible end positions for captures
        captureSequences.forEach(sequence => {
            const cell = document.querySelector(`[data-row="${sequence.row}"][data-col="${sequence.col}"]`);
            if (cell) {
                cell.classList.add('capture-move');
                
                // Add data attributes to store capture sequence information
                cell.dataset.captureSequence = JSON.stringify(sequence);
            }
        });
        
        // Debug log to show all possible sequences
        console.log('Available capture sequences:', captureSequences);
    } else {
        // If no captures, show regular moves
        const moves = findRegularMoves(row, col);
        moves.forEach(move => {
            const cell = document.querySelector(`[data-row="${move.row}"][data-col="${move.col}"]`);
            if (cell) cell.classList.add('possible-move');
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
        console.log('Available captures:', allCaptures); // Debug log
        
        if (allCaptures.length > 0) {
            // Check if this piece has any captures
            const hasCapture = allCaptures.some(capture => 
                capture.fromRow === row && capture.fromCol === col
            );
            
            if (hasCapture) {
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

    // Define move directions based on piece type and color
    let directions;
    if (piece.isKing) {
        directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]]; // Kings move in all directions
    } else if (piece.color === 'red') {
        directions = [[-1, 1], [-1, -1]]; // Red pieces move upward
    } else {
        directions = [[1, 1], [1, -1]]; // Black pieces move downward
    }

    directions.forEach(([dRow, dCol]) => {
        const newRow = row + dRow;
        const newCol = col + dCol;
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

// Find all captures for a color
function findAllCaptures(color) {
    const allCaptures = [];
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece?.color === color) {
                const pieceCaptures = findPieceCaptures(row, col, color);
                if (pieceCaptures.length > 0) {
                    allCaptures.push({
                        fromRow: row,
                        fromCol: col,
                        captures: pieceCaptures
                    });
                }
            }
        }
    }
    return allCaptures;
}

// Find captures for a specific piece
function findPieceCaptures(row, col, color) {
    const captures = [];
    const piece = board[row][col];
    if (!piece) return captures;

    // Define capture directions based on piece type and color
    let directions;
    if (piece.isKing) {
        directions = [[2, 2], [2, -2], [-2, 2], [-2, -2]]; // Kings can capture in all directions
    } else if (color === 'red') {
        directions = [[-2, 2], [-2, -2]]; // Red pieces capture upward
    } else {
        directions = [[2, 2], [2, -2]]; // Black pieces capture downward
    }

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
    
    // Get all possible moves including capture sequences
    const captureSequences = findCaptureSequences(selectedPiece.row, selectedPiece.col, currentPlayer);
    const regularMoves = findRegularMoves(selectedPiece.row, selectedPiece.col);
    
    // Find the specific capture sequence that leads to this position
    const validCapture = captureSequences.find(seq => seq.row === targetRow && seq.col === targetCol);
    const validRegularMove = captureSequences.length === 0 && 
        regularMoves.some(move => move.row === targetRow && move.col === targetCol);
    
    if (validCapture || validRegularMove) {
        const piece = board[selectedPiece.row][selectedPiece.col];
        
        if (validCapture) {
            // Execute the entire capture sequence
            validCapture.path.forEach(move => {
                // Remove the captured piece
                board[move.captured.row][move.captured.col] = null;
                
                // Move the piece to its new position
                board[move.from.row][move.from.col] = null;
                board[move.to.row][move.to.col] = piece;
            });
        } else {
            // Regular move
            board[selectedPiece.row][selectedPiece.col] = null;
            board[targetRow][targetCol] = piece;
        }
        
        // Check for king promotion
        if (targetRow === 0 && piece.color === 'red') {
            piece.isKing = true;
        }
        
        // Switch turns
        switchTurn();
        createBoard();
        setupDropZones();
        
        if (currentPlayer === 'black') {
            setTimeout(makeAIMove, 500);
        }
    }
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
    let bestMove = null;
    let maxCaptures = 0;
    
    // Check all pieces for their best capture sequences
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (board[row][col]?.color === 'black') {
                const sequences = findCaptureSequences(row, col, 'black');
                sequences.forEach(sequence => {
                    if (sequence.capturedPieces.length > maxCaptures) {
                        maxCaptures = sequence.capturedPieces.length;
                        bestMove = {
                            fromRow: row,
                            fromCol: col,
                            ...sequence
                        };
                    }
                });
            }
        }
    }
    
    // If no captures available, find regular moves
    if (!bestMove) {
        const regularMoves = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (board[row][col]?.color === 'black') {
                    const moves = findRegularMoves(row, col);
                    moves.forEach(move => {
                        regularMoves.push({
                            fromRow: row,
                            fromCol: col,
                            row: move.row,
                            col: move.col
                        });
                    });
                }
            }
        }
        if (regularMoves.length > 0) {
            bestMove = regularMoves[Math.floor(Math.random() * regularMoves.length)];
        }
    }
    
    if (bestMove) {
        const piece = board[bestMove.fromRow][bestMove.fromCol];
        
        // Execute captures if any
        if (bestMove.capturedPieces) {
            bestMove.capturedPieces.forEach(pos => {
                const [row, col] = pos.split(',').map(Number);
                board[row][col] = null;
            });
        }
        
        // Move piece to final position
        board[bestMove.fromRow][bestMove.fromCol] = null;
        
        // Check for king promotion
        if (bestMove.row === 7) {
            piece.isKing = true;
        }
        
        board[bestMove.row][bestMove.col] = piece;
        
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
