function showGame(gameName) {
    // Hide all games
    document.querySelectorAll('.game').forEach(game => {
        game.style.display = 'none';
    });

    // Show the selected game
    document.getElementById(gameName).style.display = 'block';

    // Trigger specific game initialization
    if (gameName === 'chess') {
        createChessBoard();
    } else if (gameName === 'tetris') {
        drawTetris();
    } else if (gameName === 'minesweeper') {
        createMinesweeper();
    }
}

// Chess Game
function createChessBoard() {
    const board = document.getElementById("chessBoard");
    board.innerHTML = ''; // Clear previous board

    // Create 8x8 grid
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            let cell = document.createElement('div');
            cell.style.backgroundColor = (row + col) % 2 === 0 ? 'white' : 'black';
            cell.addEventListener('click', () => {
                alert(`Cell clicked at row ${row + 1}, col ${col + 1}`);
            });
            board.appendChild(cell);
        }
    }
}

// Tetris Game Setup
const canvas = document.getElementById("tetrisCanvas");
const ctx = canvas.getContext("2d");

const blockSize = 20;
const rows = canvas.height / blockSize;
const cols = canvas.width / blockSize;

// A simple representation of the game state
let grid = [];

// Initialize the grid
for (let row = 0; row < rows; row++) {
    grid[row] = [];
    for (let col = 0; col < cols; col++) {
        grid[row][col] = 0; // 0 represents an empty cell
    }
}

// Draw the grid
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (grid[row][col] === 1) {
                ctx.fillStyle = 'blue';
                ctx.fillRect(col * blockSize, row * blockSize, blockSize, blockSize);
            }
            ctx.strokeStyle = 'black';
            ctx.strokeRect(col * blockSize, row * blockSize, blockSize, blockSize);
        }
    }
}

// Simple falling block (just a placeholder)
function drawFallingBlock() {
    // Block shape (2x2 square block)
    const shape = [[1, 1], [1, 1]];
    const x = Math.floor(cols / 2) - 1;
    const y = 0;

    // Draw the shape on the grid
    for (let i = 0; i < shape.length; i++) {
        for (let j = 0; j < shape[i].length; j++) {
            if (shape[i][j] === 1) {
                grid[y + i][x + j] = 1;
            }
        }
    }
}

// Control the block
document.addEventListener('keydown', (e) => {
    if (e.key === "ArrowLeft") {
        // Move left logic
    } else if (e.key === "ArrowRight") {
        // Move right logic
    } else if (e.key === "ArrowDown") {
        // Move down logic
    } else if (e.key === "ArrowUp") {
        // Rotate logic
    }
});

// Start the game
function drawTetris() {
    drawFallingBlock();
    drawGrid();
}

// Minesweeper Game Setup
function createMinesweeper() {
    const board = document.getElementById("minesweeperBoard");
    board.innerHTML = ''; // Clear previous board

    const rows = 5;
    const cols = 5;
    let numbers = Array(rows * cols).fill(0);

    // Create random numbers (this would be replaced by actual mines and logic later)
    for (let i = 0; i < numbers.length; i++) {
        numbers[i] = Math.floor(Math.random() * 8); // Random numbers 0-8
    }

    // Create grid
    let index = 0;
    for (let row = 0; row < rows; row++) {
        let rowElement = document.createElement('div');
        rowElement.style.display = 'flex';
        
        for (let col = 0; col < cols; col++) {
            let cell = document.createElement('div');
            cell.style.width = '40px';
            cell.style.height = '40px';
            cell.style.border = '1px solid #ccc';
            cell.style.textAlign = 'center';
            cell.style.lineHeight = '40px';
            cell.style.cursor = 'pointer';
            cell.innerText = '?'; // Placeholder for minesweeper cells
            cell.addEventListener('click', () => {
                cell.innerText = numbers[index]; // Reveal number when clicked
                index++;
            });
            rowElement.appendChild(cell);
        }
        board.appendChild(rowElement);
    }
}
