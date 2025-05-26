
const canvas1 = document.getElementById('player1Canvas');
const canvas2 = document.getElementById('player2Canvas');
const ctx1 = canvas1.getContext('2d');
const ctx2 = canvas2.getContext('2d');

const gridSize = 20;
const tileCount = 15;
const moveInterval = 150;

let lastUpdate = Date.now();
let countdown = 3;
let countdownActive = true;
let countdownStartTime = Date.now();

function createGame(ctx, controls, initialDirection) {
  return {
    snake: [{ x: 7, y: 7 }],
    dx: initialDirection.dx,
    dy: initialDirection.dy,
    food: { x: Math.floor(Math.random() * tileCount), y: Math.floor(Math.random() * tileCount) },
    score: 0,
    gameOver: false,
    controls: controls,
    keyHandler(e) {
      if (this.gameOver || countdownActive) return;
      if (e.code === this.controls.up && this.dy !== 1) {
        this.dx = 0;
        this.dy = -1;
      } else if (e.code === this.controls.down && this.dy !== -1) {
        this.dx = 0;
        this.dy = 1;
      } else if (e.code === this.controls.left && this.dx !== 1) {
        this.dx = -1;
        this.dy = 0;
      } else if (e.code === this.controls.right && this.dx !== -1) {
        this.dx = 1;
        this.dy = 0;
      }
    },
    update() {
      if (this.gameOver || countdownActive) return;

      const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };

      if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        this.gameOver = true;
        return;
      }

      for (let part of this.snake) {
        if (part.x === head.x && part.y === head.y) {
          this.gameOver = true;
          return;
        }
      }

      this.snake.unshift(head);

      if (head.x === this.food.x && head.y === this.food.y) {
        this.score++;
        this.food = {
          x: Math.floor(Math.random() * tileCount),
          y: Math.floor(Math.random() * tileCount)
        };
      } else {
        this.snake.pop();
      }
    },
    draw(ctx) {
      ctx.clearRect(0, 0, canvas1.width, canvas1.height);

      ctx.fillStyle = "#4caf50";
      for (let part of this.snake) {
        ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize, gridSize);
      }

      ctx.fillStyle = "#e53935";
      ctx.fillRect(this.food.x * gridSize, this.food.y * gridSize, gridSize, gridSize);

      ctx.fillStyle = "#000";
      ctx.font = "16px sans-serif";
      ctx.fillText("Score: " + this.score, 10, 290);

      if (this.gameOver) {
        ctx.fillStyle = "#000";
        ctx.font = "20px sans-serif";
        ctx.fillText("Game Over", 80, 150);
      }

      if (countdownActive) {
        ctx.fillStyle = "#000";
        ctx.font = "40px sans-serif";
        ctx.fillText(countdown.toString(), 130, 150);
      }
    },
    reset(initialDirection) {
      this.snake = [{ x: 7, y: 7 }];
      this.dx = initialDirection.dx;
      this.dy = initialDirection.dy;
      this.food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
      };
      this.score = 0;
      this.gameOver = false;
    }
  };
}

const player1 = createGame(ctx1, {
  up: "KeyW",
  down: "KeyS",
  left: "KeyA",
  right: "KeyD"
}, { dx: 1, dy: 0 });

const player2 = createGame(ctx2, {
  up: "ArrowUp",
  down: "ArrowDown",
  left: "ArrowLeft",
  right: "ArrowRight"
}, { dx: 1, dy: 0 });

document.addEventListener("keydown", (e) => {
  player1.keyHandler(e);
  player2.keyHandler(e);
  if (player1.gameOver && player2.gameOver && e.code === "Space") {
    countdown = 3;
    countdownActive = true;
    countdownStartTime = Date.now();
    player1.reset({ dx: 1, dy: 0 });
    player2.reset({ dx: 1, dy: 0 });
    lastUpdate = Date.now();
  }
});

function updateCountdown() {
  const elapsed = Math.floor((Date.now() - countdownStartTime) / 1000);
  countdown = 3 - elapsed;
  if (countdown <= 0) {
    countdownActive = false;
    lastUpdate = Date.now();
  }
}

function gameLoop() {
  const now = Date.now();
  const delta = now - lastUpdate;

  if (countdownActive) updateCountdown();

  if (delta >= moveInterval && !countdownActive) {
    player1.update();
    player2.update();
    lastUpdate = now;
  }

  player1.draw(ctx1);
  player2.draw(ctx2);

  requestAnimationFrame(gameLoop);
}

gameLoop();


