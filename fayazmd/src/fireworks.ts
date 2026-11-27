import {glowSprite} from './glow';

type Particle ={x: number; y: number; vx: number; vy: number; life: number; color: string; size: number};

// No pure white: with additive blending it bloomed into a blob over the title text.
const COLORS = ['#F6E3A6', '#E9D3A1', '#F3E2C0', '#E9CF8A'];

/** Golden flower-shaped bursts on a canvas over `section`, fired when it is in view. */
export const startFireworks = (section: HTMLElement, canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const parts: Particle[] = [];
  let w = 0;
  let h = 0;
  let raf = 0;
  let visible = false;
  let timer = 0;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = section.clientWidth;
    h = section.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  /** Bottom edge (section coordinates) of the countdown text: title, date line and dials. */
  const textBottom = () => {
    const s = section.getBoundingClientRect().top;
    return Math.max(0, ...Array.from(section.querySelectorAll<HTMLElement>('[data-reveal]')).map((el) => el.getBoundingClientRect().bottom - s));
  };

  // A burst travels about SPREAD × base px before it fades (speed damped by 0.985 over ~90 frames).
  const SPREAD = 50;

  const burst = () => {
    // The text spans the full width on phones, so burst only in the band below the dials:
    // gravity then pulls the sparks down into the string lights, away from the text.
    // The canvas mask fades them out before the section's bottom edge.
    const top = textBottom() + 12;
    const x = w * (0.08 + Math.random() * 0.84);
    const y = top + 40 + Math.random() * 30;
    const radius = Math.min(90, y - top, x, w - x);
    if (radius < 30 || y > h) return;
    const base = (radius / SPREAD) * (0.85 + Math.random() * 0.15);
    const petals = 5 + Math.floor(Math.random() * 3);
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    for (let i = 0; i < 70; i++) {
      const a = (i / 70) * Math.PI * 2;
      // flower shape: speed modulated by |cos(petals·a/2)|
      const sp = base * (0.55 + 0.45 * Math.abs(Math.cos((petals * a) / 2))) * (0.92 + Math.random() * 0.16);
      parts.push({x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, color, size: 1 + Math.random() * 1.1});
    }
  };

  const show = () => {
    for (let i = 0; i < 5; i++) window.setTimeout(burst, i * 380);
    if (!raf) raf = requestAnimationFrame(tick);
  };

  const tick = () => {
    // fading trails while keeping the canvas transparent
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.vx *= 0.985;
      p.vy = p.vy * 0.985 + 0.04;
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.011;
      if (p.life <= 0) {
        parts.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = Math.max(0, p.life) * 0.75;
      const r = p.size * 4; // glow radius
      ctx.drawImage(glowSprite(p.color), p.x - r, p.y - r, r * 2, r * 2);
    }
    ctx.globalAlpha = 1;
    if (parts.length || visible) {
      raf = requestAnimationFrame(tick);
    } else {
      ctx.clearRect(0, 0, w, h);
      raf = 0;
    }
  };

  resize();
  window.addEventListener('resize', resize);
  new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      window.clearInterval(timer);
      if (visible) {
        show();
        timer = window.setInterval(show, 7000);
      }
    },
    {threshold: 0.35},
  ).observe(section);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else if (visible && !raf) raf = requestAnimationFrame(tick);
  });
};
