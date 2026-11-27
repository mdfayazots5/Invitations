import {pixelRatio} from './dpr';
import {glowSprite} from './glow';

type P = {x: number; y: number; vx: number; vy: number; life: number; max: number; sprite: HTMLCanvasElement; size: number};

const COLORS = ['#FFD36E', '#FFB347', '#FFF1C2', '#F6C25B', '#FF9A5A'];

/**
 * Gold fireworks behind the countdown. Draws only while its section is on screen and the tab is visible.
 * Uses pre-rendered glow sprites (cheap) instead of canvas shadows.
 */
export const startFireworks = (canvas: HTMLCanvasElement, reducedMotion: boolean) => {
  const ctx = canvas.getContext('2d')!;
  const sprites = COLORS.map(glowSprite);
  let w = 0;
  let h = 0;
  const size = () => {
    const dpr = Math.min(pixelRatio(), 2.5);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  size();
  addEventListener('resize', size);

  const ps: P[] = [];
  const burst = (x: number, y: number) => {
    const sprite = sprites[Math.floor(Math.random() * sprites.length)];
    const n = 46;
    const speed = 1.4 + Math.random() * 1.2;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.1;
      const v = speed * (0.75 + Math.random() * 0.35);
      ps.push({x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0, max: 60 + Math.random() * 30, sprite, size: 7 + Math.random() * 5});
    }
  };

  if (reducedMotion) {
    // a still frame: a few frozen bursts
    for (let k = 0; k < 3; k++) {
      const x = w * (0.2 + 0.3 * k);
      const y = h * (0.18 + 0.1 * (k % 2));
      for (let i = 0; i < 30; i++) {
        const a = (i / 30) * Math.PI * 2;
        ctx.drawImage(sprites[k], x + Math.cos(a) * 40 - 4, y + Math.sin(a) * 40 - 4, 8, 8);
      }
    }
    return;
  }

  let visible = false;
  new IntersectionObserver(([e]) => {
    const was = visible;
    visible = e.isIntersecting;
    if (visible && !was) {
      last = performance.now();
      requestAnimationFrame(frame);
    }
  }).observe(canvas);

  let last = 0;
  let next = 0;
  const frame = (now: number) => {
    if (!visible || document.hidden) return;
    const dt = Math.min(2.5, (now - last) / 16.7);
    last = now;
    if (now > next) {
      burst(w * (0.15 + Math.random() * 0.7), h * (0.08 + Math.random() * 0.35));
      next = now + 650 + Math.random() * 700;
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = ps.length - 1; i >= 0; i--) {
      const p = ps[i];
      p.life += dt;
      p.vy += 0.025 * dt;
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      const k = 1 - p.life / p.max;
      if (k <= 0) {
        ps.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = k;
      const s = p.size * (0.5 + k * 0.5);
      ctx.drawImage(p.sprite, p.x - s / 2, p.y - s / 2, s, s);
      // short trail
      ctx.globalAlpha = k * 0.35;
      ctx.drawImage(p.sprite, p.x - p.vx * 3 - s / 4, p.y - p.vy * 3 - s / 4, s / 2, s / 2);
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  };
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && visible) {
      last = performance.now();
      requestAnimationFrame(frame);
    }
  });
};
