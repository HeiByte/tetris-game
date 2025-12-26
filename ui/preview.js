import { previewCanvas, ctxPreview, sizeBox } from "../script.js";

export function drawPreview(block) {
  const ctx = ctxPreview;
  const canvasW = previewCanvas.width;
  const canvasH = previewCanvas.height;

  ctx.fillStyle = "#3411b1d4";
  ctx.shadowColor = "#00f0ff"; 
  ctx.shadowBlur = 10;
  ctx.fillRect(0, 0, canvasW, canvasH);


  const shape = block.rotations ? block.rotations[block.rotationIndex] : block.shape;

 
  const blockW = shape[0].length * sizeBox;
  const blockH = shape.length * sizeBox;
  const offsetX = (canvasW - blockW) / 2;
  const offsetY = (canvasH - blockH) / 2;

  shape.forEach((row, y) => {
    row.forEach((val, x) => {
      if (val === 1) {
        ctx.fillStyle = block.color;
        ctx.fillRect(offsetX + x * sizeBox, offsetY + y * sizeBox, sizeBox, sizeBox);
        ctx.strokeStyle = "#ffffffff";
        ctx.shadowColor = "#00f0ff";
        ctx.shadowBlur = 10; 
        ctx.strokeRect(offsetX + x * sizeBox, offsetY + y * sizeBox, sizeBox, sizeBox);
      }
    });
  });
}
