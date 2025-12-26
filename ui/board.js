export function drawGrid(ctx, width, height, boxSize) {
  ctx.strokeStyle = "#ffffffff";
  ctx.lineWidth = 1;

  ctx.shadowColor = "#00f0ff"; 
  ctx.shadowBlur = 10;

  for (let x = 0; x <= width; x += boxSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = 0; y <= height; y += boxSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  ctx.shadowBlur = 0;
}
