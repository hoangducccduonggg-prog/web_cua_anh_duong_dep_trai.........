import { cssColor } from "./codec";

function palette() {
  return {
    bg: cssColor("--color-bg", "#140e10"),
    rose: cssColor("--color-primary", "#e07a86"),
    gold: cssColor("--color-gold", "#e8c4a0"),
    cream: cssColor("--color-fg", "#f7efe8"),
    ink: cssColor("--color-ink", "#1a1214"),
  };
}

export function paintPoster(kind: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = 720;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const { bg, rose, gold, cream, ink } = palette();
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 720, 900);
  ctx.strokeStyle = gold;
  ctx.lineWidth = 2;
  ctx.strokeRect(36, 36, 648, 828);

  if (kind === 0) {
    ctx.fillStyle = rose;
    ctx.beginPath();
    ctx.arc(300, 380, 140, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = gold;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.arc(420, 400, 120, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  } else if (kind === 1) {
    ctx.fillStyle = cream;
    ctx.beginPath();
    ctx.arc(360, 340, 90, Math.PI * 0.15, Math.PI * 1.15, true);
    ctx.fill();
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.arc(390, 330, 72, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 18; i += 1) {
      ctx.fillStyle = i % 2 ? gold : rose;
      ctx.fillRect(80 + (i % 6) * 96, 520 + Math.floor(i / 6) * 28, 70, 6);
    }
  } else {
    ctx.strokeStyle = rose;
    ctx.lineWidth = 8;
    for (let i = 1; i <= 5; i += 1) {
      heartPath(ctx, 360, 400, 40 + i * 28);
      ctx.stroke();
    }
  }

  ctx.fillStyle = cream;
  ctx.font = "600 46px Fraunces, serif";
  const label = ["Ngày đầu", "Đêm mưa", "27 · 06"][kind] ?? "Kỷ niệm";
  ctx.fillText(label, 64, 800);
  ctx.fillStyle = gold;
  ctx.font = "500 18px 'Be Vietnam Pro', sans-serif";
  ctx.fillText("Ảnh mẫu · có thể xóa", 64, 836);
  ctx.fillStyle = ink;
  return canvas.toDataURL("image/jpeg", 0.82);
}

export function heartPath(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.35);
  ctx.bezierCurveTo(x - s * 0.7, y - s * 0.35, x - s * 0.35, y - s * 0.95, x, y - s * 0.35);
  ctx.bezierCurveTo(x + s * 0.35, y - s * 0.95, x + s * 0.7, y - s * 0.35, x, y + s * 0.35);
}

export function paintSymbol(kind: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = 320;
  canvas.height = 320;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const { bg, rose, gold, cream } = palette();
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 320, 320);
  ctx.strokeStyle = gold;
  ctx.strokeRect(16, 16, 288, 288);
  ctx.fillStyle = kind % 2 ? rose : gold;
  ctx.strokeStyle = cream;
  ctx.lineWidth = 6;
  const cx = 160;
  const cy = 160;
  if (kind % 4 === 0) {
    heartPath(ctx, cx, cy + 10, 70);
    ctx.fill();
  } else if (kind % 4 === 1) {
    ctx.beginPath();
    ctx.arc(cx, cy, 58, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 22, cy - 8, 46, 0, Math.PI * 2);
    ctx.fillStyle = bg;
    ctx.fill();
  } else if (kind % 4 === 2) {
    ctx.beginPath();
    for (let i = 0; i < 5; i += 1) {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
      const cmd = i === 0 ? "moveTo" : "lineTo";
      ctx[cmd](cx + Math.cos(a) * 70, cy + Math.sin(a) * 70);
    }
    ctx.closePath();
    ctx.stroke();
  } else {
    ctx.fillRect(cx - 16, cy - 70, 32, 140);
    ctx.fillRect(cx - 70, cy - 16, 140, 32);
  }
  return canvas.toDataURL("image/jpeg", 0.8);
}
