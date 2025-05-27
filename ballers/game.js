let board = [];
let currentPlayer = 'red';
let selectedPiece = null;
let timer = 5;
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
    piece.draggable = color === currentPlayer;
    piece.dataset.row = row;
    piece.dataset.col = col;
    
    // Drag events
    piece.addEventListener('dragstart', handleDragStart);
    piece.addEventListener('dragend', handleDragEnd);
    
    return piece;
}

// Handle drag start
function handleDragStart(e) {
    if (e.target.classList.contains(currentPlayer)) {
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
        
        // Switch turns
        switchTurn();
        createBoard();
        setupDropZones();
    }
}

// Check if move is valid
function isValidMove(fromRow, fromCol, toRow, toCol) {
    // Basic movement rules
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
    turnIndicatorElement.textContent = `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s Turn`;
    resetTimer();
}

// Timer functions
function startTimer() {
    timer = 5;
    updateTimerDisplay();
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timer--;
        updateTimerDisplay();
        if (timer <= 0) {
            switchTurn();
        }
    }, 1000);
}

function resetTimer() {
    startTimer();
}

function updateTimerDisplay() {
    timerElement.textContent = timer;
    timerElement.classList.toggle('warning', timer <= 2);
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
