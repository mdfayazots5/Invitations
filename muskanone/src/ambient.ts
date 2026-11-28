import {pixelRatio} from './dpr';
import {glowSprite} from './glow';

/**
 * Light particle effects on a section's canvas, drawn only while that section is on screen:
 *  - petals: pink petals falling slowly (Nikah), 12 at once, 6–9 s per fall
 *  - sparkles: gold specks floating up (Valima), 8 at once
 *  - leaves: a few green leaves drifting (hero), 3 at once
 */
type Kind = 'petals' | 'sparkles' | 'leaves';
type P = {x: number; y: number; vx: number; vy: number; r: number; a: number; va: number; life: number};

const COUNT: Record<Kind, number> = {petals: 12, sparkles: 8, leaves: 3};

export const startAmbient = (canvas: HTMLCanvasElement, kind: Kind, reducedMotion: boolean) => {
  if (reducedMotion) return;
  const ctx = canvas.getContext('2d')!;
  let w = 0;
  let h = 0;
  const size = () => {
    const dpr = Math.min(pixelRatio(), 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const spawn = (p?: P, anywhere = false): P => {
    const o = p ?? ({} as P);
    o.x = Math.random() * w;
    o.r = kind === 'sparkles' ? 6 + Math.random() * 8 : kind === 'leaves' ? 9 + Math.random() * 5 : 5 + Math.random() * 4;
    o.a = Math.random() * Math.PI * 2;
    o.va = (Math.random() - 0.5) * 0.03;
    o.life = 0;
    if (kind === 'sparkles') {
      o.y = anywhere ? Math.random() * h : h + 10;
      o.vx = (Math.random() - 0.5) * 0.15;
      o.vy = -(0.25 + Math.random() * 0.3);
    } else {
      o.y = anywhere ? Math.random() * h : -20;
      o.vx = 0.15 + Math.random() * 0.25;
      // petals: 6–9 s to fall the screen; leaves a bit slower
      o.vy = h / ((kind === 'leaves' ? 9 : 6 + Math.random() * 3) * 60);
    }
    return o;
  };
  const draw = (p: P) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.a);
    if (kind === 'petals') {
      ctx.fillStyle = 'rgba(243,169,182,.85)';
      ctx.beginPath();
      ctx.ellipse(0, 0, p.r, p.r * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.35)';
      ctx.beginPath();
      ctx.ellipse(-p.r * 0.25, -p.r * 0.1, p.r * 0.45, p.r * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (kind === 'leaves') {
      ctx.fillStyle = 'rgba(126,163,120,.8)';
      ctx.beginPath();
      ctx.moveTo(-p.r, 0);
      ctx.quadraticCurveTo(0, -p.r * 0.6, p.r, 0);
      ctx.quadraticCurveTo(0, p.r * 0.6, -p.r, 0);
      ctx.fill();
    } else {
      const tw = 0.55 + 0.45 * Math.sin(p.life / 18);
      ctx.globalAlpha = tw;
      const s = p.r * 2;
      ctx.drawImage(glowSprite('#F3D48A'), -s / 2, -s / 2, s, s);
    }
    ctx.restore();
  };

  let parts: P[] = [];
  let raf = 0;
  let on = false;
  const frame = () => {
    ctx.clearRect(0, 0, w, h);
    for (const p of parts) {
      p.life++;
      p.x += p.vx + (kind === 'sparkles' ? 0 : Math.sin(p.life / 40) * 0.35);
      p.y += p.vy;
      p.a += p.va;
      if (p.y > h + 30 || p.y < -30 || p.x > w + 30) spawn(p);
      draw(p);
    }
    if (on) raf = requestAnimationFrame(frame);
  };
  const io = new IntersectionObserver(
    ([e]) => {
      on = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (on) {
        if (!w) {
          size();
          parts = Array.from({length: COUNT[kind]}, () => spawn(undefined, true));
        }
        raf = requestAnimationFrame(frame);
      }
    },
    {threshold: 0.05},
  );
  io.observe(canvas);
  addEventListener('resize', () => {
    if (w) size();
  });
};
