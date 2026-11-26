type Particle = {x: number; y: number; vx: number; vy: number; life: number; color: string; size: number};

const COLORS = ['#F6E3A6', '#FFFFFF', '#E9D3A1', '#F3E2C0', '#E9CF8A'];

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

  const burst = () => {
    const cx = w * (0.18 + Math.random() * 0.64);
    const cy = h * (0.1 + Math.random() * 0.3);
    const petals = 5 + Math.floor(Math.random() * 3);
    const base = 2.2 + Math.random() * 1.2;
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    for (let i = 0; i < 70; i++) {
      const a = (i / 70) * Math.PI * 2;
      // flower shape: speed modulated by |cos(petals·a/2)|
      const sp = base * (0.55 + 0.45 * Math.abs(Math.cos((petals * a) / 2))) * (0.92 + Math.random() * 0.16);
      parts.push({x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, color: i % 4 ? color : '#FFFFFF', size: 1.2 + Math.random() * 1.3});
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
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
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
