import {
  spawnBloks,
  createBox,
  createBlok,
  canvas,
  ctx,
  sizeBox,
  boardCols,
} from "../script.js";
import { drawGrid } from "../ui/board.js";
import { drawPreview } from "../ui/preview.js";

/* ================= BOARD ================= */

export class Board {
  constructor(cols, rows) {
    this.cols = cols;
    this.rows = rows;
    this.grid = Array.from({ length: rows }, () => Array(cols).fill(0));
  }

  saveBlok(blok) {
    let outOfBounds = false;

    blok.shape.forEach((row, i) => {
      row.forEach((val, j) => {
        if (val === 1) {
          const x = blok.x + j;
          const y = blok.y + i;

          if (y >= 0 && y < this.rows && x >= 0 && x < this.cols) {
            this.grid[y][x] = 1;
          }

          // FIX: lebih aman
          if (y < 0) {
            outOfBounds = true;
          }
        }
      });
    });

    return outOfBounds;
  }

  isCollision(blok, offsetX, offsetY) {
    for (let i = 0; i < blok.shape.length; i++) {
      for (let j = 0; j < blok.shape[i].length; j++) {
        if (blok.shape[i][j] === 1) {
          const x = blok.x + j + offsetX;
          const y = blok.y + i + offsetY;

          if (
            x < 0 ||
            x >= this.cols ||
            y >= this.rows ||
            (y >= 0 && this.grid[y][x] === 1)
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }

  clearLines() {
    let clearedLines = 0;

    for (let y = this.rows - 1; y >= 0; y--) {
      if (this.grid[y].every(cell => cell === 1)) {
        this.grid.splice(y, 1);
        this.grid.unshift(Array(this.cols).fill(0));
        clearedLines++;
        y++; // cek ulang baris yang sama
      }
    }

    return clearedLines;
  }

  isGameOver() {
    return this.grid[0].some(cell => cell !== 0);
  }
}

/* ================= GAME ================= */

export class Game {
  constructor(board, currentBlock, nextBlock, gameOver = false) {
    this.board = board;
    this.currentBlock = currentBlock;
    this.nextBlock = nextBlock;
    this.gameOver = gameOver;

    this.score = 0;
    this.lines = 0;
    this.state = "idle"; // idle | playing | gameover
  }

  moveBlock(offsetX, offsetY) {
    if (!this.board.isCollision(this.currentBlock, offsetX, offsetY)) {
      this.currentBlock.x += offsetX;
      this.currentBlock.y += offsetY;
    }
  }

  updateScore(linesCleared) {
    const scoreTable = [0, 100, 300, 500, 800];
    this.score += scoreTable[linesCleared] || 0;
    this.lines += linesCleared;
  }

  update() {
    if (this.gameOver || this.state !== "playing") return;

    if (this.board.isCollision(this.currentBlock, 0, 1)) {
      const outOfBounds = this.board.saveBlok(this.currentBlock);

      const cleared = this.board.clearLines();
      if (cleared > 0) {
        this.updateScore(cleared);
      }

      this.currentBlock = this.nextBlock;
      this.nextBlock = spawnBloks(boardCols);

      if (outOfBounds || this.board.isGameOver()) {
        this.gameOver = true;
        this.state = "gameover";
        console.log("GAME OVER");
      }
    } else {
      this.currentBlock.y += 1;
    }
  }

  draw() {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx, canvas.width, canvas.height, sizeBox);

    // draw board
    this.board.grid.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === 1) {
          createBox(ctx, x, y, 1, 1, "#3411b1d4");
        }
      });
    });

    // draw current block
    createBlok(
      ctx,
      this.currentBlock.shape,
      this.currentBlock.color,
      this.currentBlock.x,
      this.currentBlock.y
    );

    // draw next block
    drawPreview(this.nextBlock);
  }

  reset() {
    this.board.grid = Array.from({ length: this.board.rows }, () =>
      Array(this.board.cols).fill(0)
    );

    this.currentBlock = spawnBloks(this.board.cols);
    this.nextBlock = spawnBloks(this.board.cols);

    this.score = 0;
    this.lines = 0;
    this.gameOver = false;
    this.state = "playing";
  }
}

/* ============ ROTATE BLOCK ============ */

export function rotateBlock(block) {
  const N = block.length;
  const result = Array.from({ length: N }, () => Array(N).fill(0));

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      result[j][N - 1 - i] = block[i][j];
    }
  }

  return result;
}
