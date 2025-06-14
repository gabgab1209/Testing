function showGame(name) {
  document.querySelectorAll('.game').forEach(g => g.style.display = 'none');
  document.getElementById(name).style.display = 'block';

  if (name === 'chess') initChess();
  if (name === 'tetris') initTetris();
  if (name === 'minesweeper') initMinesweeper();
  if (name === 'flappy') initFlappy();
  if (name == 'snake') initSnake();
  if (name == 'game2048') init2048();
}

// ----------- CHESS WITH AI -----------
let chessGame = new Chess();
let selectedSquare = null;

function initChess() {
  selectedSquare = null;
  const mode = document.getElementById('chessMode')?.value;
  if ((mode === 'ai-white' && chessGame.turn() === 'w') || (mode === 'ai-black' && chessGame.turn() === 'b')) {
    makeAIMove();
  }
  renderChess();
}

function renderChess() {
  const board = document.getElementById('chessBoard');
  const status = document.getElementById('chessStatus');
  board.innerHTML = '';

  chessGame.board().forEach((row, r) => {
    row.forEach((cell, c) => {
      const div = document.createElement('div');
      if (cell) {
        const img = document.createElement('img');
        img.src = `img/${cell.color}${cell.type}.svg`;
        div.appendChild(img);
      }
      div.onclick = () => handleChessClick(r, c);
      div.style.backgroundColor = (r + c) % 2 ? '#769656' : '#EEEED2';
      board.appendChild(div);
    });
  });

  let msg = chessGame.turn() === 'w' ? 'White to move' : 'Black to move';
  if (chessGame.in_check()) msg += ' – Check!';
  if (chessGame.in_checkmate()) msg = `Checkmate! ${chessGame.turn() === 'w' ? 'Black' : 'White'} wins.`;
  if (chessGame.in_draw()) msg = 'Draw!';
  status.textContent = msg;
}

function handleChessClick(r, c) {
  if (chessGame.game_over()) return;
  const file = String.fromCharCode(97 + c);
  const rank = 8 - r;
  const square = file + rank;
  const mode = document.getElementById('chessMode')?.value;

  if (!selectedSquare) {
    const moves = chessGame.moves({ square });
    if (moves.length) selectedSquare = square;
  } else {
    const move = chessGame.move({ from: selectedSquare, to: square, promotion: 'q' });
    selectedSquare = null;
    if (move) {
      renderChess();
      if ((mode === 'ai-white' && chessGame.turn() === 'w') || (mode === 'ai-black' && chessGame.turn() === 'b')) {
        setTimeout(makeAIMove, 300);
      }
    } else {
      renderChess(); // illegal
    }
  }
}

function makeAIMove() {
  if (chessGame.game_over()) return;
  const moves = chessGame.moves();
  const move = moves[Math.floor(Math.random() * moves.length)];
  chessGame.move(move);
  renderChess();
  const mode = document.getElementById('chessMode')?.value;
  if ((mode === 'ai-white' && chessGame.turn() === 'w') || (mode === 'ai-black' && chessGame.turn() === 'b')) {
    setTimeout(makeAIMove, 300);
  }
}
function restartChess() {
  chessGame = new Chess();
  initChess();
}

// ----------- TETRIS -----------
let board, currentPiece, tetrisTimer;

function initTetris() {
  const canvas = document.getElementById('tetrisCanvas');
  const ctx = canvas.getContext('2d');
  const w = 10, h = 20, size = 20;
  board = Array.from({ length: h }, () => Array(w).fill(0));
  currentPiece = newPiece();
  let score = 0;
  document.getElementById('tetrisScore').textContent = score;
  document.getElementById('tetrisGameOver').textContent = '';

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    board.forEach((row, y) => row.forEach((v, x) => {
      if (v) {
        ctx.fillStyle = 'blue';
        ctx.fillRect(x * size, y * size, size, size);
      }
    }));
    currentPiece.shape.forEach((r, dy) => r.forEach((v, dx) => {
      if (v) {
        ctx.fillStyle = 'red';
        ctx.fillRect((currentPiece.x + dx) * size, (currentPiece.y + dy) * size, size, size);
      }
    }));
  }

  function collide() {
    return currentPiece.shape.some((r, dy) => r.some((v, dx) => {
      const x = currentPiece.x + dx;
      const y = currentPiece.y + dy;
      return v && (y >= h || x < 0 || x >= w || board[y][x]);
    }));
  }

  function merge() {
    currentPiece.shape.forEach((r, dy) => r.forEach((v, dx) => {
      if (v) board[currentPiece.y + dy][currentPiece.x + dx] = 1;
    }));
  }

  function clearLines() {
    board = board.filter(row => !row.every(v => v));
    const cleared = h - board.length;
    for (let i = 0; i < cleared; i++) board.unshift(Array(w).fill(0));
    score += cleared * 100;
    document.getElementById('tetrisScore').textContent = score;
  }

  function tick() {
    currentPiece.y++;
    if (collide()) {
      currentPiece.y--;
      merge();
      clearLines();
      currentPiece = newPiece();
      if (collide()) {
        document.getElementById('tetrisGameOver').textContent = 'Game Over';
        clearInterval(tetrisTimer);
        return;
      }
    }
    draw();
  }

  window.moveLeft = () => { currentPiece.x--; if (collide()) currentPiece.x++; draw(); };
  window.moveRight = () => { currentPiece.x++; if (collide()) currentPiece.x--; draw(); };
  window.softDrop = () => { currentPiece.y++; if (collide()) currentPiece.y--; draw(); };
  window.hardDrop = () => { while (!collide()) currentPiece.y++; currentPiece.y--; draw(); };
  window.rotate = () => {
    const rotated = currentPiece.shape[0].map((_, i) => currentPiece.shape.map(row => row[i]).reverse());
    const old = currentPiece.shape;
    currentPiece.shape = rotated;
    if (collide()) currentPiece.shape = old;
    draw();
  };

  clearInterval(tetrisTimer);
  tetrisTimer = setInterval(tick, 500);
  draw();
}

function newPiece() {
  const shapes = [
    [[1, 1, 1, 1]],
    [[1, 1], [1, 1]],
    [[0, 1, 0], [1, 1, 1]],
    [[1, 1, 0], [0, 1, 1]],
    [[0, 1, 1], [1, 1, 0]]
  ];
  return { x: 3, y: 0, shape: shapes[Math.floor(Math.random() * shapes.length)] };
}
// ----------- MINESWEEPER -----------
function initMinesweeper() {
  const board = document.getElementById('minesweeperBoard');
  const status = document.getElementById('minesweeperStatus');
  board.innerHTML = '';

  const size = 8;
  const mineCount = 10;
  const cells = Array(size * size).fill().map((_, i) => ({
    i,
    revealed: false,
    flagged: false,
    mine: false,
    el: null
  }));

  while (cells.filter(c => c.mine).length < mineCount) {
    const idx = Math.floor(Math.random() * cells.length);
    cells[idx].mine = true;
  }

  function getNeighbors(i) {
    const x = i % size;
    const y = Math.floor(i / size);
    const dirs = [-1, 1, -size, size, -size-1, -size+1, size-1, size+1];
    return dirs.map(d => cells[i + d]).filter(c => c);
  }

  function reveal(cell) {
    if (cell.revealed || cell.flagged) return;
    if (cell.mine) {
      cell.el.textContent = '💣';
      status.textContent = 'Game Over';
      cells.forEach(c => c.el.onclick = null);
      return;
    }
    const near = getNeighbors(cell.i);
    const count = near.filter(c => c.mine).length;
    cell.revealed = true;
    cell.el.style.backgroundColor = '#ccc';
    cell.el.textContent = count ? count : '';
    if (count === 0) near.forEach(reveal);
    checkWin();
  }

  function checkWin() {
    const flaggedCorrect = cells.filter(c => c.mine && c.flagged).length === mineCount;
    const noWrongFlags = cells.every(c => !c.flagged || c.mine);
    if (flaggedCorrect && noWrongFlags) {
      status.textContent = 'You Win!';
    }
  }

  cells.forEach(cell => {
    const div = document.createElement('div');
    cell.el = div;
    div.onclick = () => reveal(cell);
    div.oncontextmenu = e => {
      e.preventDefault();
      if (cell.revealed) return;
      cell.flagged = !cell.flagged;
      div.textContent = cell.flagged ? '🚩' : '';
      checkWin();
    };
    board.appendChild(div);
  });
}
// ----------- FLAPPY BIRD -----------
let flappyY, velocity, gravity, pipes, score, flappyCanvas, flappyCtx, flappyTimer;

function initFlappy() {
  flappyCanvas = document.getElementById('flappyCanvas');
  flappyCtx = flappyCanvas.getContext('2d');
  flappyCanvas.onclick = () => velocity = -6;
  resetFlappy();
  clearInterval(flappyTimer);
  flappyTimer = setInterval(updateFlappy, 40);
}

function resetFlappy() {
  flappyY = 150;
  velocity = 0;
  gravity = 0.6;
  pipes = [];
  score = 0;
  document.getElementById('flappyScore').textContent = score;
  for (let i = 0; i < 3; i++) {
    pipes.push({ x: 300 + i * 200, gap: 100 + Math.random() * 100 });
  }
}

function updateFlappy() {
  velocity += gravity;
  flappyY += velocity;

  pipes.forEach(pipe => pipe.x -= 3);

  if (pipes[0].x < -50) {
    pipes.shift();
    pipes.push({ x: 400, gap: 100 + Math.random() * 100 });
    score++;
    document.getElementById('flappyScore').textContent = score;
  }

  // Collision check
  if (flappyY < 0 || flappyY > flappyCanvas.height) {
    resetFlappy();
  }
  for (const pipe of pipes) {
    if (
      pipe.x < 40 && pipe.x + 50 > 20 &&
      (flappyY < pipe.gap - 60 || flappyY > pipe.gap + 60)
    ) {
      resetFlappy();
    }
  }

  drawFlappy();
}

function drawFlappy() {
  flappyCtx.clearRect(0, 0, flappyCanvas.width, flappyCanvas.height);

  // Bird
  flappyCtx.fillStyle = 'yellow';
  flappyCtx.beginPath();
  flappyCtx.arc(30, flappyY, 10, 0, Math.PI * 2);
  flappyCtx.fill();

  // Pipes
  flappyCtx.fillStyle = 'green';
  for (const pipe of pipes) {
    flappyCtx.fillRect(pipe.x, 0, 30, pipe.gap - 60);
    flappyCtx.fillRect(pipe.x, pipe.gap + 60, 30, 400);
  }
}
// ----------- SNAKE -----------
let snake, food, dx, dy, snakeScore, snakeCanvas, snakeCtx, snakeTimer;

function initSnake() {
  snakeCanvas = document.getElementById('snakeCanvas');
  snakeCtx = snakeCanvas.getContext('2d');
  snake = [{ x: 5, y: 5 }];
  dx = 1;
  dy = 0;
  snakeScore = 0;
  food = spawnFood();
  document.getElementById('snakeScore').textContent = snakeScore;
  clearInterval(snakeTimer);
  snakeTimer = setInterval(updateSnake, 150);
  document.onkeydown = snakeKeyControl;
}

function snakeKeyControl(e) {
  const k = e.key;
  if (k === 'ArrowUp' && dy === 0) { dx = 0; dy = -1; }
  if (k === 'ArrowDown' && dy === 0) { dx = 0; dy = 1; }
  if (k === 'ArrowLeft' && dx === 0) { dx = -1; dy = 0; }
  if (k === 'ArrowRight' && dx === 0) { dx = 1; dy = 0; }
}
function setSnakeDir(x, y) {
  if ((x && dx === 0) || (y && dy === 0)) {
    dx = x;
    dy = y;
  }
}


function spawnFood() {
  return {
    x: Math.floor(Math.random() * 12),
    y: Math.floor(Math.random() * 12)
  };
}

function updateSnake() {
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  // Game over
  if (
    head.x < 0 || head.y < 0 ||
    head.x >= 12 || head.y >= 12 ||
    snake.some(p => p.x === head.x && p.y === head.y)
  ) {
    return initSnake();
  }

  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    snakeScore++;
    food = spawnFood();
    document.getElementById('snakeScore').textContent = snakeScore;
  } else {
    snake.pop();
  }

  drawSnake();
}

function drawSnake() {
  const size = 20;
  snakeCtx.clearRect(0, 0, snakeCanvas.width, snakeCanvas.height);
  snakeCtx.fillStyle = 'lime';
  snake.forEach(p => {
    snakeCtx.fillRect(p.x * size, p.y * size, size, size);
  });
  snakeCtx.fillStyle = 'red';
  snakeCtx.fillRect(food.x * size, food.y * size, size, size);
}
// ----------- 2048 -----------
let board2048, score2048 = 0;

function init2048() {
  board2048 = Array(4).fill().map(() => Array(4).fill(0));
  score2048 = 0;
  add2048(); add2048();
  draw2048();
  document.onkeydown = handle2048Key;
}

function add2048() {
  let empty = [];
  board2048.forEach((row, y) => row.forEach((v, x) => {
    if (v === 0) empty.push({ x, y });
  }));
  if (empty.length === 0) return;
  const { x, y } = empty[Math.floor(Math.random() * empty.length)];
  board2048[y][x] = Math.random() < 0.9 ? 2 : 4;
}

function draw2048() {
  const grid = document.getElementById('grid2048');
  grid.innerHTML = '';
  board2048.forEach(row => {
    row.forEach(val => {
      const div = document.createElement('div');
      div.textContent = val || '';
      grid.appendChild(div);
    });
  });
  document.getElementById('score2048').textContent = score2048;
}

function handle2048Key(e) {
  const dir = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0] }[e.key];
  if (!dir) return;

  let moved = false;
  let combined = Array(4).fill().map(() => Array(4).fill(false));

  for (let _ = 0; _ < 4; _++) {
    for (let y = (dir[0] === 1 ? 2 : 1); y >= 0 && y < 4; y += dir[0] || 1) {
      for (let x = (dir[1] === 1 ? 2 : 1); x >= 0 && x < 4; x += dir[1] || 1) {
        const ny = y + dir[0], nx = x + dir[1];
        if (ny < 0 || ny >= 4 || nx < 0 || nx >= 4) continue;
        if (board2048[ny][nx] === 0 && board2048[y][x]) {
          board2048[ny][nx] = board2048[y][x];
          board2048[y][x] = 0;
          moved = true;
        } else if (
          board2048[ny][nx] === board2048[y][x] &&
          board2048[y][x] !== 0 &&
          !combined[ny][nx]
        ) {
          board2048[ny][nx] *= 2;
          board2048[y][x] = 0;
          score2048 += board2048[ny][nx];
          combined[ny][nx] = true;
          moved = true;
        }
      }
    }
  }
  if (moved) {
    add2048();
    draw2048();
  }
}
let touchStartX, touchStartY;

document.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, false);

document.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;

  if (Math.abs(dx) > Math.abs(dy)) {
    handle2048Key({ key: dx > 0 ? 'ArrowRight' : 'ArrowLeft' });
  } else {
    handle2048Key({ key: dy > 0 ? 'ArrowDown' : 'ArrowUp' });
  }
}, false);

