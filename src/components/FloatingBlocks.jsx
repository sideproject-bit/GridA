import React, { useRef, useEffect } from "react";

const COUNT = 17;
const REPEL_RADIUS = 120;
const REPEL_STRENGTH = 0.55;
const MAX_SPEED = 3.5;

function makeBlocks(w, h, colors) {
  return Array.from({ length: COUNT }, (_, i) => ({
    x: Math.random() * w,
    y: Math.random() * h,
    bw: 36 + Math.random() * 120,
    bh: 28 + Math.random() * 95,
    vx: (Math.random() < 0.5 ? 1 : -1) * (0.18 + Math.random() * 0.32),
    vy: (Math.random() < 0.5 ? 1 : -1) * (0.18 + Math.random() * 0.32),
    baseVx: 0,
    baseVy: 0,
    color: colors[i % colors.length],
    alpha: 0.14 + Math.random() * 0.17,
    angle: (Math.random() - 0.5) * 0.38,
  }));
}

export default function FloatingBlocks({ pal, theme }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({ blocks: null, w: 0, h: 0, raf: null, mx: -9999, my: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const s = stateRef.current;

    const colors =
      theme === "mondrian"
        ? ["#C7382E", "#E3B22E", "#F2EDE1"]
        : ["#ffffff", pal.ink];

    s.blocks = null;

    const init = (w, h) => {
      canvas.width = w;
      canvas.height = h;
      s.w = w;
      s.h = h;
      s.blocks = makeBlocks(w, h, colors);
      s.blocks.forEach(b => { b.baseVx = b.vx; b.baseVy = b.vy; });
    };

    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width && height) init(width, height);
    });
    ro.observe(canvas.parentElement);

    const { width, height } = canvas.getBoundingClientRect();
    if (width && height) init(width, height);

    // Track mouse relative to canvas
    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      s.mx = e.clientX - rect.left;
      s.my = e.clientY - rect.top;
    };
    const onMouseLeave = () => { s.mx = -9999; s.my = -9999; };

    canvas.parentElement.addEventListener("mousemove", onMouseMove);
    canvas.parentElement.addEventListener("mouseleave", onMouseLeave);

    const draw = () => {
      const { w, h, blocks, mx, my } = stateRef.current;
      if (!blocks || !w || !h) { s.raf = requestAnimationFrame(draw); return; }

      ctx.clearRect(0, 0, w, h);

      for (const b of blocks) {
        // Repel from cursor
        const dx = b.x - mx;
        const dy = b.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < REPEL_RADIUS && dist > 0) {
          const force = (1 - dist / REPEL_RADIUS) * REPEL_STRENGTH;
          b.vx += (dx / dist) * force;
          b.vy += (dy / dist) * force;
        } else {
          // Ease back toward base speed
          b.vx += (b.baseVx - b.vx) * 0.04;
          b.vy += (b.baseVy - b.vy) * 0.04;
        }

        // Clamp speed
        const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        if (speed > MAX_SPEED) {
          b.vx = (b.vx / speed) * MAX_SPEED;
          b.vy = (b.vy / speed) * MAX_SPEED;
        }

        b.x += b.vx;
        b.y += b.vy;

        const hw = b.bw / 2, hh = b.bh / 2;
        if (b.x - hw < 0)  { b.x = hw;     b.vx =  Math.abs(b.vx); b.baseVx =  Math.abs(b.baseVx); }
        if (b.y - hh < 0)  { b.y = hh;     b.vy =  Math.abs(b.vy); b.baseVy =  Math.abs(b.baseVy); }
        if (b.x + hw > w)  { b.x = w - hw; b.vx = -Math.abs(b.vx); b.baseVx = -Math.abs(b.baseVx); }
        if (b.y + hh > h)  { b.y = h - hh; b.vy = -Math.abs(b.vy); b.baseVy = -Math.abs(b.baseVy); }

        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.angle);
        ctx.globalAlpha = b.alpha;
        ctx.fillStyle = b.color;
        ctx.fillRect(-hw, -hh, b.bw, b.bh);
        ctx.restore();
      }

      s.raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(s.raf);
      ro.disconnect();
      canvas.parentElement?.removeEventListener("mousemove", onMouseMove);
      canvas.parentElement?.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [theme, pal.accent, pal.accent3]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}
