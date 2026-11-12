import { useEffect, useRef } from "react";
import { heartPath } from "@/lib/love/art";
import { cssColor } from "@/lib/love/codec";
import type { Star, SnowTint } from "@/lib/love/types";

function fit(canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = Math.max(1, Math.floor(rect.width * dpr));
  const h = Math.max(1, Math.floor(rect.height * dpr));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w: rect.width, h: rect.height };
}

export function HeartField({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hearts = Array.from({ length: 26 }, () => ({
      x: Math.random(),
      y: Math.random(),
      s: 8 + Math.random() * 16,
      v: 0.15 + Math.random() * 0.35,
      p: Math.random() * Math.PI * 2,
      a: 0.25 + Math.random() * 0.55,
    }));
    let frame = 0;
    const loop = (t: number) => {
      const box = fit(canvas);
      if (!box) return;
      const rose = cssColor("--color-primary", "#e07a86");
      const gold = cssColor("--color-gold", "#e8c4a0");
      box.ctx.clearRect(0, 0, box.w, box.h);
      hearts.forEach((h, i) => {
        if (!reduce) {
          h.y -= h.v / 180;
          h.x += Math.sin(t / 900 + h.p) * 0.0008;
          if (h.y < -0.05) h.y = 1.05;
        }
        box.ctx.globalAlpha = h.a;
        box.ctx.fillStyle = i % 3 === 0 ? gold : rose;
        heartPath(box.ctx, h.x * box.w, h.y * box.h, h.s);
        box.ctx.fill();
      });
      box.ctx.globalAlpha = 1;
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);
  return <canvas ref={ref} className={className} aria-hidden />;
}

export function Fireworks({ burst }: { burst: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const particles = useRef<{ x: number; y: number; vx: number; vy: number; life: number; color: string }[]>([]);
  useEffect(() => {
    if (!burst) return;
    const canvas = ref.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const rose = cssColor("--color-primary", "#e07a86");
    const gold = cssColor("--color-gold", "#e8c4a0");
    const cream = cssColor("--color-fg", "#f7efe8");
    const colors = [rose, gold, cream];
    for (let n = 0; n < 3; n += 1) {
      const ox = rect.width * (0.3 + n * 0.2);
      const oy = rect.height * (0.25 + (n % 2) * 0.1);
      for (let i = 0; i < 40; i += 1) {
        const a = (i / 40) * Math.PI * 2;
        const sp = 1.4 + Math.random() * 2.4;
        particles.current.push({
          x: ox,
          y: oy,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: 1,
          color: colors[i % colors.length] ?? rose,
        });
      }
    }
  }, [burst]);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let frame = 0;
    const loop = () => {
      const box = fit(canvas);
      if (!box) return;
      box.ctx.clearRect(0, 0, box.w, box.h);
      particles.current = particles.current.filter((p) => p.life > 0.02);
      for (const p of particles.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.02;
        p.life *= 0.985;
        box.ctx.globalAlpha = p.life;
        box.ctx.fillStyle = p.color;
        box.ctx.beginPath();
        box.ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
        box.ctx.fill();
      }
      box.ctx.globalAlpha = 1;
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);
  return <canvas ref={ref} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden />;
}

export function TreeCanvas({ level, blossoms }: { level: number; blossoms: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const box = fit(canvas);
    if (!box) return;
    const rose = cssColor("--color-primary", "#e07a86");
    const gold = cssColor("--color-gold", "#e8c4a0");
    const cream = cssColor("--color-fg", "#f7efe8");
    box.ctx.clearRect(0, 0, box.w, box.h);
    const branch = (x: number, y: number, len: number, ang: number, depth: number) => {
      if (depth <= 0 || len < 4) return;
      const x2 = x + Math.cos(ang) * len;
      const y2 = y + Math.sin(ang) * len;
      box.ctx.strokeStyle = depth > 2 ? gold : cream;
      box.ctx.lineWidth = Math.max(1, depth * 0.7);
      box.ctx.beginPath();
      box.ctx.moveTo(x, y);
      box.ctx.lineTo(x2, y2);
      box.ctx.stroke();
      if (depth < 3 && blossoms > 0) {
        box.ctx.fillStyle = rose;
        box.ctx.globalAlpha = 0.85;
        box.ctx.beginPath();
        box.ctx.arc(x2, y2, 3 + (depth === 1 ? 2 : 0), 0, Math.PI * 2);
        box.ctx.fill();
        box.ctx.globalAlpha = 1;
      }
      const spread = 0.42 + level * 0.01;
      branch(x2, y2, len * 0.72, ang - spread, depth - 1);
      branch(x2, y2, len * 0.72, ang + spread, depth - 1);
    };
    const depth = Math.min(8, 3 + level);
    branch(box.w / 2, box.h - 16, 54 + level * 6, -Math.PI / 2, depth);
  }, [level, blossoms]);
  return <canvas ref={ref} className="h-80 w-full rounded-3xl bg-bg" />;
}

export function SkyCanvas({
  stars,
  onPick,
}: {
  stars: Star[];
  onPick: (id: string) => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let frame = 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const loop = (t: number) => {
      const box = fit(canvas);
      if (!box) return;
      const rose = cssColor("--color-primary", "#e07a86");
      const gold = cssColor("--color-gold", "#e8c4a0");
      const cream = cssColor("--color-fg", "#f7efe8");
      box.ctx.fillStyle = cssColor("--color-bg", "#140e10");
      box.ctx.fillRect(0, 0, box.w, box.h);
      for (let i = 0; i < 50; i += 1) {
        const x = ((i * 97) % 100) / 100 * box.w;
        const y = ((i * 53) % 100) / 100 * box.h;
        box.ctx.globalAlpha = 0.25;
        box.ctx.fillStyle = cream;
        box.ctx.fillRect(x, y, 1.4, 1.4);
      }
      const found = stars.filter((s) => s.found);
      box.ctx.globalAlpha = 0.8;
      box.ctx.strokeStyle = gold;
      box.ctx.lineWidth = 1;
      box.ctx.beginPath();
      found.forEach((s, i) => {
        const x = s.x * box.w;
        const y = s.y * box.h;
        if (i === 0) box.ctx.moveTo(x, y);
        else box.ctx.lineTo(x, y);
      });
      box.ctx.stroke();
      stars.forEach((s) => {
        const tw = reduce ? 1 : 0.75 + Math.sin(t / 400 + s.x * 8) * 0.25;
        box.ctx.globalAlpha = s.found ? 1 : 0.45 * tw + 0.4;
        box.ctx.fillStyle = s.found ? gold : cream;
        box.ctx.beginPath();
        box.ctx.arc(s.x * box.w, s.y * box.h, s.found ? 6 : 3.5, 0, Math.PI * 2);
        box.ctx.fill();
        if (!s.found) {
          box.ctx.strokeStyle = rose;
          box.ctx.stroke();
        }
      });
      box.ctx.globalAlpha = 1;
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [stars]);
  return (
    <canvas
      ref={ref}
      className="h-96 w-full rounded-3xl"
      onClick={(event) => {
        const canvas = ref.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        let best: Star | null = null;
        let dist = 0.08;
        for (const star of stars) {
          const d = Math.hypot(star.x - x, star.y - y);
          if (d < dist) {
            dist = d;
            best = star;
          }
        }
        if (best) onPick(best.id);
      }}
    />
  );
}

export function SnowGlobe({
  tint,
  label,
  photo,
}: {
  tint: SnowTint;
  label: string;
  photo?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const wind = useRef(0);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const flakes = Array.from({ length: 70 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 1.2 + Math.random() * 2.4,
      s: 0.35 + Math.random() * 0.8,
      heart: Math.random() > 0.72,
    }));
    let frame = 0;
    const onMove = (event: DeviceMotionEvent) => {
      const ax = event.accelerationIncludingGravity?.x ?? 0;
      wind.current = Math.max(-2, Math.min(2, ax / 4));
    };
    window.addEventListener("devicemotion", onMove);
    const loop = () => {
      const box = fit(canvas);
      if (!box) return;
      const rose = cssColor("--color-primary", "#e07a86");
      const gold = cssColor("--color-gold", "#e8c4a0");
      const cream = cssColor("--color-fg", "#f7efe8");
      const color = tint === "gold" ? gold : tint === "cream" ? cream : rose;
      box.ctx.clearRect(0, 0, box.w, box.h);
      const cx = box.w / 2;
      const cy = box.h / 2 - 8;
      const rad = Math.min(box.w, box.h) * 0.42;
      box.ctx.save();
      box.ctx.beginPath();
      box.ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      box.ctx.clip();
      box.ctx.fillStyle = cssColor("--color-ink", "#1a1214");
      box.ctx.fillRect(0, 0, box.w, box.h);
      flakes.forEach((f) => {
        f.y += f.s / 180;
        f.x += wind.current * 0.002 + Math.sin(f.y * 12) * 0.001;
        if (f.y > 1.05) f.y = -0.05;
        const x = f.x * box.w;
        const y = f.y * box.h;
        box.ctx.fillStyle = color;
        box.ctx.globalAlpha = 0.85;
        if (f.heart) {
          heartPath(box.ctx, x, y, f.r * 2);
          box.ctx.fill();
        } else {
          box.ctx.beginPath();
          box.ctx.arc(x, y, f.r, 0, Math.PI * 2);
          box.ctx.fill();
        }
      });
      box.ctx.globalAlpha = 1;
      box.ctx.restore();
      box.ctx.strokeStyle = gold;
      box.ctx.lineWidth = 3;
      box.ctx.beginPath();
      box.ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      box.ctx.stroke();
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("devicemotion", onMove);
    };
  }, [tint]);
  return (
    <div
      className="relative h-96"
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        wind.current = ((event.clientX - rect.left) / rect.width - 0.5) * 3;
      }}
    >
      <canvas ref={ref} className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute left-1/2 top-[42%] grid w-28 -translate-x-1/2 -translate-y-1/2 place-items-center overflow-hidden rounded-full border border-gold bg-surface text-center">
        {photo ? (
          <img src={photo} alt="" className="h-28 w-28 object-cover" />
        ) : (
          <p className="px-3 py-8 font-display text-lg text-fg">{label}</p>
        )}
      </div>
    </div>
  );
}
