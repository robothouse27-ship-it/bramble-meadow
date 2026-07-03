import { useEffect, useRef } from "react";
import {
  drawSparkle,
  makeAmbient,
  makeBurst,
  stepAmbient,
  stepBurst,
  type Particle,
} from "./particles";

interface ParticleFieldProps {
  burstTrigger: number; // increment to fire a burst
  burstOrigin?: { x: number; y: number };
  burstCount?: number;
}

export function ParticleField({ burstTrigger, burstOrigin, burstCount = 44 }: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ambientRef = useRef<Particle[]>([]);
  const burstsRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    ambientRef.current = makeAmbient(window.innerWidth, window.innerHeight, 22);

    let last = performance.now();
    let raf = 0;

    function frame(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ambientRef.current.forEach((p) => {
        stepAmbient(p, dt, canvas.width, canvas.height);
        const shimmer = 0.75 + 0.25 * Math.sin(p.twinkle);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.hue;
        ctx.globalAlpha = shimmer;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      burstsRef.current = burstsRef.current.filter((p) => p.life < p.maxLife);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      burstsRef.current.forEach((p) => {
        stepBurst(p, dt);
        const fade = 1 - p.life / p.maxLife;
        const shimmer = p.shape === "star" ? 0.6 + 0.4 * Math.sin(p.twinkle) : 1;
        ctx.globalAlpha = Math.max(fade * shimmer, 0);
        ctx.fillStyle = p.hue;
        if (p.shape === "star") {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          drawSparkle(ctx, p.r);
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.restore();
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  useEffect(() => {
    if (burstTrigger === 0) return;
    const origin = burstOrigin ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    burstsRef.current.push(...makeBurst(origin.x, origin.y, burstCount));
  }, [burstTrigger, burstOrigin, burstCount]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 5,
      }}
    />
  );
}
