import {isForcedDpr, pixelRatio} from './dpr';
import {glowSprite} from './glow';

/** Fixed full-screen canvas: 60 gold particles drifting upward, flickering, wrapping around. */
export const startDust = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  let w = 0;
  let h = 0;
  const dpr = Math.min(pixelRatio(), isForcedDpr ? 3 : 2);
  const resize = () => {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);

  const parts = Array.from({length: 60}, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: 0.6 + Math.random() * 1.6,
    vy: 0.12 + Math.random() * 0.35,
    vx: (Math.random() - 0.5) * 0.15,
    phase: Math.random() * Math.PI * 2,
    speed: 0.02 + Math.random() * 0.04,
  }));

  const sprite = glowSprite('#E9CF8A');
  let raf = 0;
  const tick = () => {
    ctx.clearRect(0, 0, w, h);
    for (const p of parts) {
      p.y -= p.vy;
      p.x += p.vx;
      p.phase += p.speed;
      if (p.y < -4) {
        p.y = h + 4;
        p.x = Math.random() * w;
      }
      if (p.x < -4) p.x = w + 4;
      if (p.x > w + 4) p.x = -4;
      ctx.globalAlpha = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(p.phase));
      const r = p.r * 3.5;
      ctx.drawImage(sprite, p.x - r, p.y - r, r * 2, r * 2);
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(raf);
    if (!document.hidden) raf = requestAnimationFrame(tick);
  });
};
