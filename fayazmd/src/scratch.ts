import {C} from './invite.config';

const BRUSH = 26;
const REVEAL_AT = 0.55;

/** Gold-foil scratch bar over the hidden date. Returns the element to insert. */
export const createScratch = (): HTMLElement => {
  const el = document.createElement('div');
  el.className = 'scratch';
  el.tabIndex = 0;
  el.setAttribute('role', 'button');
  el.setAttribute('aria-label', C.ui.scratchAria);
  el.innerHTML = `<span class="scratch-reveal script gold-text" aria-live="polite">${C.scratchReveal}</span><canvas aria-hidden="true"></canvas>`;
  const canvas = el.querySelector('canvas')!;
  const ctx = canvas.getContext('2d', {willReadFrequently: true})!;
  let done = false;
  let w = 0;
  let h = 0;

  const paint = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    w = el.clientWidth;
    h = el.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    // brushed metal
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#8C6A2B');
    g.addColorStop(0.28, '#E9CF8A');
    g.addColorStop(0.5, '#C79A45');
    g.addColorStop(0.7, '#F6E3A6');
    g.addColorStop(1, '#9C7431');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 1.5) {
      ctx.fillStyle = `rgba(${Math.random() < 0.5 ? '255,248,220' : '90,64,20'},${(Math.random() * 0.12).toFixed(3)})`;
      ctx.fillRect(0, y, w, 1);
    }
    // fine inner border
    ctx.strokeStyle = 'rgba(80,56,16,0.55)';
    ctx.lineWidth = 1;
    ctx.strokeRect(4.5, 4.5, w - 9, h - 9);
    ctx.strokeStyle = 'rgba(255,244,210,0.6)';
    ctx.strokeRect(6.5, 6.5, w - 13, h - 13);
    // label
    ctx.fillStyle = '#2E2108';
    ctx.font = '500 12px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = '3px';
    ctx.fillText(`✦ ${C.ui.scratchLabel} ✦`, w / 2, h / 2 + 1);
  };

  const reveal = () => {
    if (done) return;
    done = true;
    el.classList.add('done');
    el.setAttribute('aria-label', C.scratchReveal);
  };

  const cleared = () => {
    const {data} = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let clear = 0;
    let total = 0;
    for (let i = 3; i < data.length; i += 4 * 16) {
      total++;
      if (data[i] < 40) clear++;
    }
    return clear / total;
  };

  const spark = (x: number, y: number) => {
    for (let i = 0; i < 2; i++) {
      const s = document.createElement('span');
      s.className = 'spark';
      s.style.left = `${x - 3}px`;
      s.style.top = `${y - 3}px`;
      s.style.setProperty('--sx', `${(Math.random() - 0.5) * 60}px`);
      s.style.setProperty('--sy', `${-10 - Math.random() * 40}px`);
      s.addEventListener('animationend', () => s.remove());
      el.appendChild(s);
    }
  };

  let last: {x: number; y: number} | null = null;
  let moves = 0;
  const erase = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = BRUSH;
    ctx.beginPath();
    ctx.moveTo(last?.x ?? x, last?.y ?? y);
    ctx.lineTo(x, y);
    ctx.stroke();
    last = {x, y};
    if (++moves % 3 === 0) spark(x, y);
    if (moves % 8 === 0 && cleared() >= REVEAL_AT) reveal();
  };

  canvas.addEventListener('pointerdown', (e) => {
    if (done) return;
    canvas.setPointerCapture(e.pointerId);
    last = null;
    erase(e);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!done && e.buttons) erase(e);
  });
  canvas.addEventListener('pointerup', () => {
    last = null;
    if (!done && cleared() >= REVEAL_AT) reveal();
  });
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      reveal();
    }
  });

  // Paint once fonts are ready (the label uses Cinzel) and when the bar is attached.
  requestAnimationFrame(() => document.fonts.ready.then(paint));
  return el;
};
