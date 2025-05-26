
const canvas1 = document.getElementById('player1Canvas');
const canvas2 = document.getElementById('player2Canvas');
const ctx1 = canvas1.getContext('2d');
const ctx2 = canvas2.getContext('2d');

const canvasSize = 300;
const snakeSpeed = 2; // pixels per frame
const segmentSize = 20;
const initialLength = 5;

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
          x: 100 - i * segmentSize,
          y: 100
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
      if (this.gameOver) return;

      // Apply direction change
      if (
        (this.nextDir.x !== -this.dir.x || this.dir.x === 0) &&
        (this.nextDir.y !== -this.dir.y || this.dir.y === 0)
      ) {
        this.dir = { ...this.nextDir };
      }

      const head = { ...this.segments[0] };
      head.x += this.dir.x * snakeSpeed;
      head.y += this.dir.y * snakeSpeed;

      // Game over if out of bounds
      if (head.x < 0 || head.x >= canvasSize || head.y < 0 || head.y >= canvasSize) {
        this.gameOver = true;
        return;
      }

      // Move body
      this.segments.pop();
      this.segments.unshift(head);

      // Collision with self
      for (let i = 1; i < this.segments.length; i++) {
        const part = this.segments[i];
        if (Math.abs(part.x - head.x) < segmentSize / 2 && Math.abs(part.y - head.y) < segmentSize / 2) {
          this.gameOver = true;
        }
      }

      // Eat food
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

      // Snake
      ctx.fillStyle = "#4caf50";
      for (const part of this.segments) {
        ctx.fillRect(part.x, part.y, segmentSize, segmentSize);
      }

      // Food
      ctx.fillStyle = "#e53935";
      ctx.fillRect(this.food.x, this.food.y, segmentSize, segmentSize);

      // Score / Game Over
      ctx.fillStyle = "#000";
      ctx.font = "16px sans-serif";
      ctx.fillText("Score: " + this.score, 10, 290);
      if (this.gameOver) {
        ctx.font = "20px sans-serif";
        ctx.fillText("Game Over", 80, 150);
      }
    },
    keyHandler(e) {
      if (this.gameOver) return;
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
    player1.reset();
    player2.reset();
  }
});

function gameLoop() {
  player1.update();
  player2.update();
  player1.draw(ctx1);
  player2.draw(ctx2);
  requestAnimationFrame(gameLoop);
}

gameLoop();


