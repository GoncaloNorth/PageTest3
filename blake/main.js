
const canvas1 = document.getElementById('player1Canvas');
const canvas2 = document.getElementById('player2Canvas');
const ctx1 = canvas1.getContext('2d');
const ctx2 = canvas2.getContext('2d');

// Larger canvas and finer grid for smoother feel
const canvasSize = 600;
const segmentSize = 10; // smaller step size for more visual precision
const moveInterval = 80;

let lastUpdate = Date.now();
let countdown = 3;
let countdownActive = true;
let countdownStartTime = Date.now();

function createSnakeGame(ctx, controls, initialDirection) {
  return {
    segments: [],
    dir: { x: initialDirection.x, y: initialDirection.y },
    nextDir: { x: initialDirection.x, y: initialDirection.y },
    food: spawnFood(),
    score: 0,
    gameOver: false,
    controls,
    init() {
      this.segments = [{ x: 10 * segmentSize, y: 10 * segmentSize }];
    },
    reset() {
      this.dir = { x: initialDirection.x, y: initialDirection.y };
      this.nextDir = { x: initialDirection.x, y: initialDirection.y };
      this.score = 0;
      this.gameOver = false;
      this.food = spawnFood();
      this.init();
    },
    update() {
      if (this.gameOver || countdownActive) return;

      if ((this.nextDir.x !== -this.dir.x || this.dir.x === 0) &&
          (this.nextDir.y !== -this.dir.y || this.dir.y === 0)) {
        this.dir = { ...this.nextDir };
      }

      const head = {
        x: this.segments[0].x + this.dir.x * segmentSize,
        y: this.segments[0].y + this.dir.y * segmentSize
      };

      if (head.x < 0 || head.x >= canvasSize || head.y < 0 || head.y >= canvasSize) {
        this.gameOver = true;
        return;
      }

      for (let part of this.segments) {
        if (head.x === part.x && head.y === part.y) {
          this.gameOver = true;
          return;
        }
      }

      this.segments.unshift(head);

      if (head.x === this.food.x && head.y === this.food.y) {
        this.score++;
        this.food = spawnFood();
      } else {
        this.segments.pop();
      }
    },
    draw(ctx) {
      ctx.clearRect(0, 0, canvasSize, canvasSize);
      ctx.fillStyle = "#4caf50";
      for (let part of this.segments) {
        ctx.fillRect(part.x, part.y, segmentSize, segmentSize);
      }
      ctx.fillStyle = "#e53935";
      ctx.fillRect(this.food.x, this.food.y, segmentSize, segmentSize);
      ctx.fillStyle = "#000";
      ctx.font = "16px sans-serif";
      ctx.fillText("Score: " + this.score, 10, canvasSize - 10);
      if (this.gameOver) {
        ctx.font = "20px sans-serif";
        ctx.fillText("Game Over", canvasSize / 2 - 60, canvasSize / 2);
      }
      if (countdownActive) {
        ctx.font = "40px sans-serif";
        ctx.fillText(countdown.toString(), canvasSize / 2 - 10, canvasSize / 2 - 40);
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
}

function spawnFood() {
  const gridCount = canvasSize / segmentSize;
  return {
    x: Math.floor(Math.random() * gridCount) * segmentSize,
    y: Math.floor(Math.random() * gridCount) * segmentSize
  };
}

const player1 = createSnakeGame(ctx1, {
  up: "KeyW", down: "KeyS", left: "KeyA", right: "KeyD"
}, { x: 1, y: 0 });

const player2 = createSnakeGame(ctx2, {
  up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight"
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
  if (countdown <= 0) countdownActive = false;
}

function gameLoop() {
  const now = Date.now();
  if (countdownActive) updateCountdown();
  if (now - lastUpdate >= moveInterval && !countdownActive) {
    player1.update();
    player2.update();
    lastUpdate = now;
  }
  player1.draw(ctx1);
  player2.draw(ctx2);
  requestAnimationFrame(gameLoop);
}

player1.init();
player2.init();
gameLoop();
