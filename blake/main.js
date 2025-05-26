const canvas1 = document.getElementById('player1Canvas');
const canvas2 = document.getElementById('player2Canvas');
const ctx1 = canvas1.getContext('2d');
const ctx2 = canvas2.getContext('2d');

const canvasSize = 300;
const snakeSpeed = 2;
const segmentSize = 20;
const initialLength = 2;
let countdown = 3;
let countdownActive = true;
let countdownStartTime = Date.now();

function createSnakeGame(ctx, controls, initialDirection) {
  const snake = {
    segments: [],
    dir: { x: initialDirection.x, y: initialDirection.y },
    nextDir: { x: initialDirection.x, y: initialDirection.y },
    food: {
      x: Math.floor(Math.random() * (canvasSize / segmentSize)) * segmentSize,
      y: Math.floor(Math.random() * (canvasSize / segmentSize)) * segmentSize
    },
    score: 0,
    gameOver: false,
    controls: controls,
    init() {
      this.segments = [];
      for (let i = 0; i < initialLength; i++) {
        this.segments.push({
          x: 100 - i * segmentSize * this.dir.x,
          y: 100 - i * segmentSize * this.dir.y
        });
      }
    },
    reset() {
      this.dir = { x: initialDirection.x, y: initialDirection.y };
      this.nextDir = { x: initialDirection.x, y: initialDirection.y };
      this.score = 0;
      this.gameOver = false;
      this.food = {
        x: Math.floor(Math.random() * (canvasSize / segmentSize)) * segmentSize,
        y: Math.floor(Math.random() * (canvasSize / segmentSize)) * segmentSize
      };
      this.init();
    },
    update() {
      if (this.gameOver || countdownActive) return;

      if (
        (this.nextDir.x !== -this.dir.x || this.dir.x === 0) &&
        (this.nextDir.y !== -this.dir.y || this.dir.y === 0)
      ) {
        this.dir = { ...this.nextDir };
      }

      const head = { ...this.segments[0] };
      head.x += this.dir.x * snakeSpeed;
      head.y += this.dir.y * snakeSpeed;

      if (head.x < 0 || head.x >= canvasSize || head.y < 0 || head.y >= canvasSize) {
        this.gameOver = true;
        return;
      }

      this.segments.pop();
      this.segments.unshift(head);

      for (let i = 1; i < this.segments.length; i++) {
        const part = this.segments[i];
        if (Math.abs(part.x - head.x) < segmentSize / 2 &&
            Math.abs(part.y - head.y) < segmentSize / 2) {
          this.gameOver = true;
        }
      }

      if (
        Math.abs(head.x - this.food.x) < segmentSize &&
        Math.abs(head.y - this.food.y) < segmentSize
      ) {
        this.score++;
        this.segments.push({ ...this.segments[this.segments.length - 1] });
        this.food = {
          x: Math.floor(Math.random() * (canvasSize / segmentSize)) * segmentSize,
          y: Math.floor(Math.random() * (canvasSize / segmentSize)) * segmentSize
        };
      }
    },
    draw(ctx) {
      ctx.clearRect(0, 0, canvasSize, canvasSize);

      ctx.fillStyle = "#4caf50";
      for (const part of this.segments) {
        ctx.fillRect(part.x, part.y, segmentSize, segmentSize);
      }

      ctx.fillStyle = "#e53935";
      ctx.fillRect(this.food.x, this.food.y, segmentSize, segmentSize);

      ctx.fillStyle = "#000";
      ctx.font = "16px sans-serif";
      ctx.fillText("Score: " + this.score, 10, 290);
      if (this.gameOver) {
        ctx.font = "20px sans-serif";
        ctx.fillText("Game Over", 80, 150);
      }

      if (countdownActive) {
        ctx.font = "40px sans-serif";
        ctx.fillText(countdown.toString(), 120, 150);
      }
    },
    keyHandler(e) {
      if (this.gameOver || countdownActive) return;
      if (e.code === this.controls.up) this.nextDir = { x: 0, y: -1 };
      else if (e.code === this.controls.down) this.nextDir = { x: 0, y: 1 };
      else if (e.code === this.controls.left) this.nextDir = { x: -1, y: 0 };
      else if (e.code === this.controls.right) this.nextDir = { x: 1, y: 0 };
    }
  };

  snake.init();
  return snake;
}

const player1 = createSnakeGame(ctx1, {
  up: "KeyW",
  down: "KeyS",
  left: "KeyA",
  right: "KeyD"
}, { x: 1, y: 0 });

const player2 = createSnakeGame(ctx2, {
  up: "ArrowUp",
  down: "ArrowDown",
  left: "ArrowLeft",
  right: "ArrowRight"
}, { x: 1, y: 0 });

document.addEventListener("keydown", (e) => {
  player1.keyHandler(e);
  player2.keyHandler(e);
  if (player1.gameOver && player2.gameOver && e.code === "Space") {
    countdown = 3;
    countdownActive = true;
    countdownStartTime = Date.now();
    player1.reset();
    player2.reset();
  }
});

function updateCountdown() {
  const elapsed = Math.floor((Date.now() - countdownStartTime) / 1000);
  countdown = 3 - elapsed;
  if (countdown <= 0) {
    countdownActive = false;
  }
}

function gameLoop() {
  if (countdownActive) updateCountdown();

  player1.update();
  player2.update();
  player1.draw(ctx1);
  player2.draw(ctx2);
  requestAnimationFrame(gameLoop);
}

gameLoop();
