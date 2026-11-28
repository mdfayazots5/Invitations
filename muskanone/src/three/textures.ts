import {CanvasTexture, RepeatWrapping, SRGBColorSpace} from 'three';

/**
 * Natural surfaces, painted in code at load time (no image files): value-noise grass, a worn stone path with joints,
 * marble with soft veins, palm leaflets, leaves, rose petals and cloud puffs. Each is a small canvas, drawn once.
 */

/** Deterministic random, so every load (and the video) looks the same. */
const rng = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

const canvas = (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')!] as const;
};
const tex = (c: HTMLCanvasElement, repeat = false) => {
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 4;
  if (repeat) t.wrapS = t.wrapT = RepeatWrapping;
  return t;
};

/** Tileable value noise (wraps at the edges), 0…1. */
const noiseField = (size: number, cells: number, seed: number) => {
  const r = rng(seed);
  const grid = Array.from({length: cells * cells}, () => r());
  const at = (x: number, y: number) => grid[((y % cells) + cells) % cells * cells + (((x % cells) + cells) % cells)];
  const out = new Float32Array(size * size);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const fx = (x / size) * cells;
      const fy = (y / size) * cells;
      const ix = Math.floor(fx);
      const iy = Math.floor(fy);
      let tx = fx - ix;
      let ty = fy - iy;
      tx = tx * tx * (3 - 2 * tx);
      ty = ty * ty * (3 - 2 * ty);
      const a = at(ix, iy) + (at(ix + 1, iy) - at(ix, iy)) * tx;
      const b = at(ix, iy + 1) + (at(ix + 1, iy + 1) - at(ix, iy + 1)) * tx;
      out[y * size + x] = a + (b - a) * ty;
    }
  return out;
};

const fbm = (size: number, seed: number, octaves: [number, number][]) => {
  const out = new Float32Array(size * size);
  let total = 0;
  octaves.forEach(([cells, w], k) => {
    const n = noiseField(size, cells, seed + k * 101);
    for (let i = 0; i < out.length; i++) out[i] += n[i] * w;
    total += w;
  });
  for (let i = 0; i < out.length; i++) out[i] /= total;
  return out;
};

const mix = (a: number[], b: number[], t: number) => a.map((v, i) => v + (b[i] - v) * t);

/** Lawn: patchy greens with dry ochre patches and fine blade speckle. Tiles. */
export const grassTexture = (() => {
  const S = 256;
  const [c, g] = canvas(S, S);
  const big = fbm(S, 3, [
    [4, 1],
    [8, 0.6],
  ]);
  const fine = fbm(S, 9, [
    [32, 1],
    [64, 0.7],
  ]);
  const img = g.createImageData(S, S);
  const lush = [126, 160, 104];
  const deep = [92, 128, 80];
  const dry = [176, 170, 116];
  for (let i = 0; i < S * S; i++) {
    let col = mix(deep, lush, big[i]);
    col = mix(col, dry, Math.max(0, big[i] - 0.62) * 1.6);
    const f = 0.82 + fine[i] * 0.36;
    img.data.set([col[0] * f, col[1] * f, col[2] * f, 255], i * 4);
  }
  g.putImageData(img, 0, 0);
  return tex(c, true);
})();

/** Stone path: large pale flags with darker joints, soft wear and specks. Tiles. */
export const stoneTexture = (() => {
  const S = 256;
  const [c, g] = canvas(S, S);
  const n = fbm(S, 17, [
    [8, 1],
    [32, 0.5],
  ]);
  const img = g.createImageData(S, S);
  for (let i = 0; i < S * S; i++) {
    const v = 226 + (n[i] - 0.5) * 30;
    img.data.set([v + 8, v, v - 12, 255], i * 4);
  }
  g.putImageData(img, 0, 0);
  // joints: running bond of flags, 2 per width
  g.strokeStyle = 'rgba(150,128,104,0.55)';
  g.lineWidth = 2;
  for (let row = 0; row < 4; row++) {
    const y = (row * S) / 4;
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(S, y);
    g.stroke();
    const off = row % 2 ? S / 4 : 0;
    for (let x = off; x < S + 1; x += S / 2) {
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x, y + S / 4);
      g.stroke();
    }
  }
  return tex(c, true);
})();

/** Marble / terrace: warm white with faint cloudy veins. Tiles. */
export const marbleTexture = (() => {
  const S = 256;
  const [c, g] = canvas(S, S);
  const n = fbm(S, 29, [
    [4, 1],
    [16, 0.5],
    [48, 0.25],
  ]);
  const img = g.createImageData(S, S);
  for (let i = 0; i < S * S; i++) {
    const vein = Math.pow(1 - Math.abs(Math.sin(n[i] * 18)), 10) * 26;
    const v = 238 + (n[i] - 0.5) * 14 - vein;
    img.data.set([v + 4, v, v - 6, 255], i * 4);
  }
  g.putImageData(img, 0, 0);
  return tex(c, true);
})();

/** Palm frond: a central rib with drooping leaflets either side (alpha cut-out), base at the bottom. */
export const frondTexture = (() => {
  const W = 128;
  const H = 512;
  const [c, g] = canvas(W, H);
  const r = rng(41);
  g.strokeStyle = '#6E8A4C';
  g.lineWidth = 4;
  g.beginPath();
  g.moveTo(W / 2, H);
  g.lineTo(W / 2, 6);
  g.stroke();
  for (let y = H - 30; y > 14; y -= 6) {
    const len = (W / 2 - 6) * Math.sin(((H - y) / H) * Math.PI) * (0.85 + r() * 0.15);
    for (const side of [-1, 1]) {
      const shade = 90 + r() * 40;
      g.strokeStyle = `rgb(${shade - 20},${shade + 40},${shade - 30})`;
      g.lineWidth = 6;
      g.beginPath();
      g.moveTo(W / 2, y);
      g.quadraticCurveTo(W / 2 + side * len * 0.6, y - 6, W / 2 + side * len, y + 14 + r() * 8);
      g.stroke();
    }
  }
  return tex(c);
})();

/** A single leaf with a midrib, for bushes and hedges (alpha cut-out). */
export const leafTexture = (() => {
  const S = 64;
  const [c, g] = canvas(S, S);
  const grad = g.createLinearGradient(0, 0, S, S);
  grad.addColorStop(0, '#93B57E');
  grad.addColorStop(1, '#5E8A58');
  g.fillStyle = grad;
  g.beginPath();
  g.moveTo(S / 2, 2);
  g.quadraticCurveTo(S - 6, S / 2, S / 2, S - 2);
  g.quadraticCurveTo(6, S / 2, S / 2, 2);
  g.fill();
  g.strokeStyle = 'rgba(230,240,200,0.5)';
  g.lineWidth = 1.5;
  g.beginPath();
  g.moveTo(S / 2, 4);
  g.lineTo(S / 2, S - 4);
  g.stroke();
  return tex(c);
})();

/** A rose petal: rounded top, narrow base, soft gradient from the heart (alpha cut-out). */
export const petalTexture = (() => {
  const S = 64;
  const [c, g] = canvas(S, S);
  const grad = g.createRadialGradient(S / 2, S * 0.95, 2, S / 2, S * 0.5, S * 0.55);
  grad.addColorStop(0, 'rgba(225,205,200,1)');
  grad.addColorStop(0.6, 'rgba(255,255,255,1)');
  grad.addColorStop(1, 'rgba(250,246,244,1)');
  g.fillStyle = grad;
  g.beginPath();
  g.moveTo(S / 2, S - 1);
  g.bezierCurveTo(4, S * 0.7, 2, S * 0.18, S / 2, 4);
  g.bezierCurveTo(S - 2, S * 0.18, S - 4, S * 0.7, S / 2, S - 1);
  g.fill();
  // a faint edge line, so stacked petals read as layers
  g.strokeStyle = 'rgba(200,170,170,0.45)';
  g.lineWidth = 1.2;
  g.stroke();
  return tex(c);
})();

/** A soft cumulus puff (alpha), tinted per station by the sprite colour. */
export const cloudTexture = (() => {
  const W = 256;
  const H = 128;
  const [c, g] = canvas(W, H);
  const r = rng(77);
  for (let i = 0; i < 26; i++) {
    const x = 30 + r() * (W - 60);
    const y = 60 + (r() - 0.5) * 40 - Math.sin((x / W) * Math.PI) * 22;
    const rad = 18 + r() * 30 * Math.sin((x / W) * Math.PI);
    const grad = g.createRadialGradient(x, y, 0, x, y, rad);
    grad.addColorStop(0, 'rgba(255,255,255,0.5)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.beginPath();
    g.arc(x, y, rad, 0, Math.PI * 2);
    g.fill();
  }
  return tex(c);
})();

/** Ringed palm trunk bark (wraps around the tube: u = around, v = along). */
export const barkTexture = (() => {
  const [c, g] = canvas(64, 256);
  g.fillStyle = '#9C7E5E';
  g.fillRect(0, 0, 64, 256);
  for (let y = 0; y < 256; y += 10) {
    g.fillStyle = 'rgba(70,52,36,0.45)';
    g.fillRect(0, y, 64, 3);
    g.fillStyle = 'rgba(190,160,120,0.35)';
    g.fillRect(0, y + 3, 64, 2);
  }
  return tex(c, true);
})();
