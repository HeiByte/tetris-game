import {
  boxT,
  boxI,
  boxL,
  boxR,
  boxS,
  boxZ,
  boxO,
} from "./ui/tetrisComponent.js";
import { drawGrid } from "./ui/board.js";
import { Board, Game, rotateBlock } from "./logic/main.js";

/* ================= CANVAS ================= */

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

export const previewCanvas = document.getElementById("preview");
export const ctxPreview = previewCanvas.getContext("2d");

/* ================= UI ================= */

const scoreEl = document.getElementById("score");
const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");

/* ================= GRID ================= */

const sizeBox = 19;
const boardCols = 15;
const boardRows = 25;

canvas.width = boardCols * sizeBox;
canvas.height = boardRows * sizeBox;

export { canvas, ctx, sizeBox, boardCols, boardRows };

ctx.fillRect(0, 0, canvas.width, canvas.height);
drawGrid(ctx, canvas.width, canvas.height, sizeBox);

/* ================= DRAW BLOCK ================= */

export function createBox(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.shadowBlur = 9;
  ctx.fillRect(x * sizeBox, y * sizeBox, w * sizeBox, h * sizeBox);
  ctx.shadowBlur = 0;
}

export function createBlok(ctx, box, color, offsetX = 0, offsetY = 0) {
  box.forEach((row, i) => {
    row.forEach((val, j) => {
      if (val === 1) {
        createBox(ctx, offsetX + j, offsetY + i, 1, 1, color);
      }
    });
  });
}

/* ================= SPAWN BLOCK ================= */

function generateRotations(shape, rotationCount = 4) {
  const rotations = [shape];
  let current = shape;

  for (let i = 1; i < rotationCount; i++) {
    current = rotateBlock(current);
    rotations.push(current);
  }

  return rotations;
}

export function spawnBloks(boardCols) {
  const bloks = [
    { shape: boxI, color: "red", rot: 2 },
    { shape: boxL, color: "blue", rot: 4 },
    { shape: boxR, color: "cyan", rot: 4 },
    { shape: boxS, color: "yellow", rot: 2 },
    { shape: boxT, color: "orange", rot: 4 },
    { shape: boxZ, color: "green", rot: 2 },
    { shape: boxO, color: "#a4058cff", rot: 1 },
  ];

  const randomBlok = Math.floor(Math.random() * bloks.length);
  const newBlok = bloks[randomBlok];

  const rotations =
    newBlok.rot > 1
      ? generateRotations(newBlok.shape, newBlok.rot)
      : [newBlok.shape];

  const startX = Math.floor(boardCols / 2 - rotations[0][0].length / 2);
  const startY = -3;

  return {
    rotations,
    shape: rotations[0],
    color: newBlok.color,
    x: startX,
    y: startY,
    rotationIndex: 0,
    maxRotations: rotations.length,
  };
}

/* ================= GAME ================= */

let game;
let lastTime = 0;
let dropCounter = 0;
const dropInterval = 500;

window.onload = () => {
  const board = new Board(boardCols, boardRows);
  const currentBlock = spawnBloks(boardCols);
  const nextBlock = spawnBloks(boardCols);

  game = new Game(board, currentBlock, nextBlock);

  startBtn.addEventListener("click", () => {
    game.reset();
    startScreen.style.display = "none";
  });

  document.addEventListener("keydown", handleInput);
  initMobileControls();

  gameLoop();
};

/* ================= KEYBOARD INPUT ================= */

function handleInput(e) {
  if (game.state !== "playing") return;

  if (e.key === "ArrowLeft") game.moveBlock(-1, 0);
  if (e.key === "ArrowRight") game.moveBlock(1, 0);
  if (e.key === "ArrowUp") rotateCurrent();

  if (e.key === "ArrowDown") {
    if (!game.board.isCollision(game.currentBlock, 0, 1)) {
      game.currentBlock.y++;
    }
  }

  if (e.code === "Space") hardDrop();
}

/* ================= SHARED ACTION ================= */

function rotateCurrent() {
  if (game.currentBlock.maxRotations <= 1) return;

  const nextIndex =
    (game.currentBlock.rotationIndex + 1) %
    game.currentBlock.maxRotations;

  const nextShape = game.currentBlock.rotations[nextIndex];

  if (
    !game.board.isCollision(
      { ...game.currentBlock, shape: nextShape },
      0,
      0
    )
  ) {
    game.currentBlock.shape = nextShape;
    game.currentBlock.rotationIndex = nextIndex;
  }
}

function hardDrop() {
  while (!game.board.isCollision(game.currentBlock, 0, 1)) {
    game.currentBlock.y++;
  }
  game.update();
}

/* ================= MOBILE CONTROL ================= */

function initMobileControls() {
  /* TAP HANDLER
     tap 1x  = rotate
     tap 2x  = hard drop
  */
  let tapTimer = null;
  let tapCount = 0;

  canvas.addEventListener("pointerdown", () => {
    if (game.state !== "playing") return;

    tapCount++;

    if (tapCount === 1) {
      tapTimer = setTimeout(() => {
        rotateCurrent(); // tap tunggal
        tapCount = 0;
      }, 220);
    } else if (tapCount === 2) {
      clearTimeout(tapTimer);
      hardDrop(); // double tap
      tapCount = 0;
    }
  });

  /* TILT = MOVE LEFT / RIGHT */
  let lastTiltMove = 0;
  window.addEventListener("deviceorientation", (e) => {
    if (game.state !== "playing") return;
    if (e.gamma === null) return;

    const now = Date.now();
    if (now - lastTiltMove < 120) return;

    if (e.gamma > 10) {
      game.moveBlock(1, 0);
      lastTiltMove = now;
    } else if (e.gamma < -10) {
      game.moveBlock(-1, 0);
      lastTiltMove = now;
    }
  });
}

/* ================= GAME LOOP ================= */

function gameLoop(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;

  if (game.state === "playing") {
    if (dropCounter > dropInterval) {
      game.update();
      dropCounter = 0;
    }

    game.draw();
    scoreEl.textContent = `Score: ${game.score}`;
  }

  if (game.state === "gameover") {
    startScreen.style.display = "flex";
    startScreen.querySelector("h1").textContent = "GAME OVER";
  }

  requestAnimationFrame(gameLoop);
}
