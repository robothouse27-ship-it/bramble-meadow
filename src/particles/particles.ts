export type ParticleShape = "dot" | "star";

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  maxLife: number;
  hue: string;
  shape: ParticleShape;
  rot: number;
  vr: number;
  twinkle: number; // phase offset for opacity shimmer
}

export function makeAmbient(width: number, height: number, count: number): Particle[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 8,
    vy: -6 - Math.random() * 10,
    r: 1.5 + Math.random() * 2,
    life: 0,
    maxLife: Infinity,
    hue: Math.random() > 0.5 ? "rgba(255, 214, 130, 0.5)" : "rgba(255, 255, 255, 0.4)",
    shape: "dot",
    rot: 0,
    vr: 0,
    twinkle: Math.random() * Math.PI * 2,
  }));
}

const SPARKLE_COLORS = ["#ffe38a", "#ffd479", "#fff3c4", "#f7b955"];

export function makeBurst(x: number, y: number, count: number): Particle[] {
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 40 + Math.random() * 130;
    const star = Math.random() > 0.35;
    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 30, // slight upward bias
      r: star ? 4 + Math.random() * 6 : 2 + Math.random() * 3,
      life: 0,
      maxLife: 0.9 + Math.random() * 0.7,
      hue: SPARKLE_COLORS[(Math.random() * SPARKLE_COLORS.length) | 0],
      shape: star ? "star" : "dot",
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 8,
      twinkle: Math.random() * Math.PI * 2,
    };
  });
}

export function stepAmbient(p: Particle, dt: number, width: number, height: number) {
  p.x += p.vx * dt;
  p.y += p.vy * dt;
  p.twinkle += dt * 3;
  if (p.y < -10) {
    p.y = height + 10;
    p.x = Math.random() * width;
  }
  if (p.x < -10) p.x = width + 10;
  if (p.x > width + 10) p.x = -10;
}

export function stepBurst(p: Particle, dt: number) {
  p.x += p.vx * dt;
  p.y += p.vy * dt;
  p.vx *= 1 - 1.2 * dt; // drag
  p.vy += 150 * dt; // gravity
  p.rot += p.vr * dt;
  p.twinkle += dt * 12;
  p.life += dt;
}

/** Draw a 4-point sparkle/twinkle at the current transform origin. */
export function drawSparkle(ctx: CanvasRenderingContext2D, r: number) {
  const thin = r * 0.28;
  ctx.beginPath();
  // vertical spindle
  ctx.moveTo(0, -r);
  ctx.quadraticCurveTo(thin * 0.5, -thin * 0.5, thin, 0);
  ctx.quadraticCurveTo(thin * 0.5, thin * 0.5, 0, r);
  ctx.quadraticCurveTo(-thin * 0.5, thin * 0.5, -thin, 0);
  ctx.quadraticCurveTo(-thin * 0.5, -thin * 0.5, 0, -r);
  // horizontal spindle
  ctx.moveTo(-r, 0);
  ctx.quadraticCurveTo(-thin * 0.5, -thin * 0.5, 0, -thin);
  ctx.quadraticCurveTo(thin * 0.5, -thin * 0.5, r, 0);
  ctx.quadraticCurveTo(thin * 0.5, thin * 0.5, 0, thin);
  ctx.quadraticCurveTo(-thin * 0.5, thin * 0.5, -r, 0);
  ctx.fill();
}
