/**
 * All artwork is drawn in code (SVG + CSS): no photos, so the page stays light on mobile data.
 *
 * Shared pieces (roses, leaves, chandelier, candle glow, gradients) are defined once as <symbol>s in a
 * hidden <svg> (`artDefs`) and reused with <use>. Background tiles (jaali band, rose walls) are standalone
 * SVG data-URLs because CSS backgrounds can't reach the page's symbols.
 */

const svgUrl = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg.replace(/\s{2,}/g, ' '))}")`;

/** Small deterministic random, so the artwork is identical on every load (and in the video). */
export const rng = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

// ───────────────────────────── shared symbols ─────────────────────────────

const rosePaths = (g: string, dark: string, light: string) => {
  const petals = Array.from({length: 6}, (_, i) => {
    const a = i * 60 + 15;
    return `<ellipse cx="0" cy="-9" rx="9.5" ry="9" transform="rotate(${a})" fill="url(#${g})" stroke="${dark}" stroke-opacity=".45" stroke-width=".8"/>`;
  }).join('');
  return `${petals}
  <circle r="12.5" fill="url(#${g})" stroke="${dark}" stroke-opacity=".4" stroke-width=".8"/>
  <path d="M-11,-3 C-9,-11 2,-14 8,-9" fill="none" stroke="${light}" stroke-opacity=".6" stroke-width="1.3"/>
  <path d="M0,0 m-2,0 a2,2 0 1,1 4,0 a4,4 0 1,1 -8,0 a6,6 0 1,1 12,0 a8,8 0 1,1 -16,1"
    fill="none" stroke="${dark}" stroke-opacity=".7" stroke-width="1.3" stroke-linecap="round"/>
  <path d="M-3,-4 a5,5 0 0,1 7,1" fill="none" stroke="${light}" stroke-opacity=".75" stroke-width="1"/>`;
};

/** Hidden <svg> with every shared gradient and symbol. Insert once at the top of <body>. */
export const artDefs = () => `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
  <radialGradient id="g-rose-red" cx=".42" cy=".4" r=".65"><stop offset="0" stop-color="#f0465c"/><stop offset=".55" stop-color="#b3132c"/><stop offset="1" stop-color="#4f0612"/></radialGradient>
  <radialGradient id="g-rose-pink" cx=".42" cy=".4" r=".65"><stop offset="0" stop-color="#ffe0e2"/><stop offset=".55" stop-color="#eba3ad"/><stop offset="1" stop-color="#a85663"/></radialGradient>
  <radialGradient id="g-rose-wine" cx=".42" cy=".4" r=".65"><stop offset="0" stop-color="#c2324a"/><stop offset=".55" stop-color="#7a0c22"/><stop offset="1" stop-color="#33040c"/></radialGradient>
  <linearGradient id="g-leaf" x1="0" x2="1"><stop offset="0" stop-color="#1f3a17"/><stop offset=".6" stop-color="#4b6b2a"/><stop offset="1" stop-color="#2a4519"/></linearGradient>
  <radialGradient id="g-glow"><stop offset="0" stop-color="#fff6d8" stop-opacity="1"/><stop offset=".25" stop-color="#ffd27a" stop-opacity=".75"/><stop offset="1" stop-color="#ff9a2e" stop-opacity="0"/></radialGradient>
  <linearGradient id="g-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8c6a2b"/><stop offset=".3" stop-color="#f3d58e"/><stop offset=".5" stop-color="#c79a45"/><stop offset=".72" stop-color="#fbe8b0"/><stop offset="1" stop-color="#9c7431"/></linearGradient>
  <linearGradient id="g-pillar" x1="0" x2="1"><stop offset="0" stop-color="#c98a3c"/><stop offset=".35" stop-color="#fff0cf"/><stop offset=".6" stop-color="#f1c77d"/><stop offset="1" stop-color="#b87732"/></linearGradient>

  <symbol id="rose-red" viewBox="-18 -18 36 36" overflow="visible">${rosePaths('g-rose-red', '#3d030c', '#ff9aa8')}</symbol>
  <symbol id="rose-pink" viewBox="-18 -18 36 36" overflow="visible">${rosePaths('g-rose-pink', '#8a3c4a', '#fff4f2')}</symbol>
  <symbol id="rose-wine" viewBox="-18 -18 36 36" overflow="visible">${rosePaths('g-rose-wine', '#22020a', '#e36b80')}</symbol>
  <symbol id="leaf" viewBox="0 -8 26 16" overflow="visible">
    <path d="M0,0 C6,-8 18,-9 26,0 C18,9 6,8 0,0Z" fill="url(#g-leaf)"/><path d="M1,0 H23" stroke="#6e8f3c" stroke-width=".7" stroke-opacity=".7"/>
  </symbol>
  <symbol id="glow" viewBox="-10 -10 20 20" overflow="visible"><circle r="10" fill="url(#g-glow)"/></symbol>
  <symbol id="chandelier" viewBox="-70 -10 140 130" overflow="visible">${chandelier()}</symbol>
</defs></svg>`;

/** A three-tier crystal chandelier with candle glows. Drawn around (0,0) = the hook. */
function chandelier() {
  const r = rng(7);
  const tier = (y: number, rx: number, n: number) => {
    let s = `<ellipse cx="0" cy="${y}" rx="${rx}" ry="${rx * 0.22}" fill="none" stroke="url(#g-gold)" stroke-width="2"/>`;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const x = Math.cos(a) * rx;
      const yy = y + Math.sin(a) * rx * 0.22;
      // candle + flame glow
      s += `<rect x="${x - 1.3}" y="${yy - 9}" width="2.6" height="8" fill="#fff4dc"/>
        <circle cx="${x}" cy="${yy - 11}" r="7" fill="url(#g-glow)"/><circle cx="${x}" cy="${yy - 11}" r="1.6" fill="#fffbe9"/>`;
      // crystal drops
      const len = 8 + r() * 10;
      s += `<line x1="${x}" y1="${yy + 1}" x2="${x}" y2="${yy + len}" stroke="#fff3d0" stroke-opacity=".7" stroke-width=".6"/>
        <path d="M${x},${yy + len} l2,3 l-2,4 l-2,-4z" fill="#fffaf0" fill-opacity=".9"/>`;
    }
    return s;
  };
  const swags = Array.from({length: 9}, (_, i) => {
    const x0 = -46 + i * 11.5;
    return `<path d="M${x0},64 q5.75,9 11.5,0" fill="none" stroke="#fff3d0" stroke-opacity=".75" stroke-width=".7"/>`;
  }).join('');
  return `<circle cx="0" cy="55" r="62" fill="url(#g-glow)" opacity=".55"/>
    <line x1="0" y1="-10" x2="0" y2="22" stroke="url(#g-gold)" stroke-width="1.6"/>
    <circle cx="0" cy="24" r="4" fill="url(#g-gold)"/>
    <path d="M0,26 C-4,50 4,70 0,96" stroke="url(#g-gold)" stroke-width="3" fill="none"/>
    ${tier(38, 22, 6)}${tier(62, 46, 10)}${swags}${tier(84, 30, 8)}
    <path d="M0,96 l5,8 l-5,12 l-5,-12z" fill="#fffaf0" opacity=".9"/>`;
}

/** A cluster of roses and leaves at (x,y), for scattering along edges. */
export const roseCluster = (x: number, y: number, size: number, seed: number, palette = ['rose-red', 'rose-wine', 'rose-pink']) => {
  const r = rng(seed);
  let s = '';
  for (let i = 0; i < 4; i++) {
    const a = r() * Math.PI * 2;
    s += `<use href="#leaf" x="0" y="-8" width="${size * 0.9}" height="${size * 0.55}"
      transform="translate(${x + Math.cos(a) * size * 0.45} ${y + Math.sin(a) * size * 0.35}) rotate(${(a * 180) / Math.PI})"/>`;
  }
  const n = 3 + Math.floor(r() * 2);
  for (let i = 0; i < n; i++) {
    const d = size * (0.12 + r() * 0.35);
    const a = r() * Math.PI * 2;
    const k = size * (0.55 + r() * 0.35);
    const id = palette[Math.floor(r() * palette.length)];
    s += `<use href="#${id}" x="${x + Math.cos(a) * d - k / 2}" y="${y + Math.sin(a) * d - k / 2}" width="${k}" height="${k}"/>`;
  }
  return s;
};

// ───────────────────────────── curtain ─────────────────────────────

/** Ornate gold crest with two script letters on a glowing gold centre (the curtain's centrepiece). viewBox 240×240. */
export const crest = (a: string, b: string) => {
  const curl = (sx: number) => `<g transform="translate(120 120) scale(${sx} 1)">
    <path d="M58,-6 C78,-26 102,-18 100,2 C98,16 82,18 78,6 C76,-2 86,-6 88,0" />
    <path d="M58,8 C82,22 100,40 88,60 C80,72 64,64 70,54 C74,48 80,52 78,56" />
    <path d="M52,-28 C62,-52 86,-56 92,-40 C96,-30 86,-24 82,-32" />
    <path d="M40,48 C46,70 30,90 12,86" /><path d="M44,-46 C40,-70 22,-84 6,-80" />
    <path d="M62,-2 C86,-4 104,-20 112,-36 M66,14 C92,18 108,30 114,48" stroke-width="1.2"/>
    <path d="M30,62 C38,82 56,94 72,90 C80,88 80,78 72,78 M28,-64 C36,-84 54,-96 70,-92 C78,-90 78,-80 70,-80" stroke-width="1.6"/>
    <circle cx="100" cy="2" r="3" fill="url(#g-gold)"/><circle cx="92" cy="-40" r="2.4" fill="url(#g-gold)"/>
    <circle cx="112" cy="-36" r="2" fill="url(#g-gold)"/><circle cx="114" cy="48" r="2" fill="url(#g-gold)"/>
    <path d="M70,24 q12,-3 17,9 q-12,3 -17,-9z M66,-22 q12,0 16,-12 q-12,0 -16,12z M18,80 q4,12 -6,18 q-4,-12 6,-18z M14,-78 q6,-10 -4,-18 q-6,10 4,18z" fill="url(#g-gold)"/>
  </g>`;
  const beads = Array.from({length: 28}, (_, i) => {
    const t = (i / 28) * Math.PI * 2;
    return `<circle cx="${(120 + Math.cos(t) * 60).toFixed(1)}" cy="${(120 + Math.sin(t) * 60).toFixed(1)}" r="1.8" fill="url(#g-gold)"/>`;
  }).join('');
  return `<svg class="crest" viewBox="0 0 240 240" aria-hidden="true">
    <defs><radialGradient id="g-crest-core" cx=".5" cy=".45" r=".6"><stop offset="0" stop-color="#ffe7a6"/><stop offset=".45" stop-color="#ffb43a"/><stop offset="1" stop-color="#b8560c"/></radialGradient></defs>
    <circle cx="120" cy="120" r="118" fill="url(#g-glow)"/>
    <g fill="none" stroke="url(#g-gold)" stroke-width="3" stroke-linecap="round">${curl(1)}${curl(-1)}
      <circle cx="120" cy="120" r="56" stroke-width="3.4"/><circle cx="120" cy="120" r="65" stroke-width="1.4"/>
      <path d="M120,54 l8,-12 l-8,-14 l-8,14z M120,186 l8,12 l-8,14 l-8,-14z" fill="url(#g-gold)"/>
      <path d="M96,40 q24,-24 48,0" stroke-width="2"/>
    </g>
    ${beads}
    <circle cx="120" cy="120" r="53" fill="url(#g-crest-core)"/>
    <circle cx="120" cy="120" r="47" fill="none" stroke="#fff1c4" stroke-opacity=".6" stroke-dasharray="2 3"/>
    <text x="103" y="128" text-anchor="middle" class="crest-l">${a}</text>
    <text x="120" y="131" text-anchor="middle" class="crest-amp">&amp;</text>
    <text x="138" y="146" text-anchor="middle" class="crest-l">${b}</text>
  </svg>`;
};

// ───────────────────────────── invitation arch ─────────────────────────────

/** Top cap of the Mughal arch frame (cusped). viewBox 300×190; the body continues it below in CSS. */
export const archCap = () => {
  // cusped (multi-foil) arch line from left spring (0,190) to the apex (150,0) and back
  const SPRING = 120;
  const cusps = (w: number, h: number, inset: number) => {
    const l = inset;
    const rgt = 300 - inset;
    const pts: [number, number][] = [];
    const N = 7;
    const K = 0.62; // < 1 keeps a pointed apex
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const x = l + (150 - l) * (1 - Math.cos((t * Math.PI) / 2));
      const yy = SPRING - (SPRING - h) * (Math.sin((t * Math.PI * K) / 2) / Math.sin((Math.PI * K) / 2));
      pts.push([x, yy]);
    }
    const right = pts.map(([x, yy]) => [300 - x, yy] as [number, number]).reverse();
    const all = [...pts, ...right.slice(1)];
    let d = `M${l},190 L${all[0][0]},${all[0][1]}`;
    for (let i = 1; i < all.length; i++) {
      const [x0, y0] = all[i - 1];
      const [x1, y1] = all[i];
      // small inward lobe between points (the cusps), none at the apex
      const mx = (x0 + x1) / 2;
      const my = (y0 + y1) / 2;
      const nx = -(y1 - y0);
      const ny = x1 - x0;
      const len = Math.hypot(nx, ny) || 1;
      const k = i === N || i === N + 1 ? 0 : w;
      d += ` Q${(mx + (nx / len) * k).toFixed(1)},${(my + (ny / len) * k).toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}`;
    }
    return `${d} L${rgt},190`;
  };
  // roses climbing the outer edge of the arch (left side, mirrored on the right)
  let climb = '';
  const K = 0.62;
  for (let i = 0; i < 9; i++) {
    const t = i / 11;
    const x = 150 * (1 - Math.cos((t * Math.PI) / 2));
    const yy = SPRING - (SPRING - 4) * (Math.sin((t * Math.PI * K) / 2) / Math.sin((Math.PI * K) / 2));
    const size = 30 - i * 1.8;
    climb += roseCluster(x + 2, yy + 4, size, 300 + i) + roseCluster(300 - x - 2, yy + 4, size, 400 + i);
  }
  climb += roseCluster(4, 160, 32, 501) + roseCluster(296, 160, 32, 502) + roseCluster(4, 186, 30, 503) + roseCluster(296, 186, 30, 504);
  return `<svg class="arch-cap" viewBox="0 0 300 190" aria-hidden="true" overflow="visible">
    <defs><radialGradient id="g-parch" cx=".5" cy=".9" r=".85"><stop offset="0" stop-color="#fff4d2"/><stop offset=".45" stop-color="#fbd68c"/><stop offset=".8" stop-color="#f0a948"/><stop offset="1" stop-color="#d9812c"/></radialGradient></defs>
    <path d="${cusps(-7, 4, 0)} V190Z" fill="url(#g-gold)"/>
    <path d="${cusps(-6, 8, 4)}" fill="none" stroke="#7a4a12" stroke-width="3" stroke-dasharray="1.2 3"/>
    <path d="${cusps(-6, 12, 8)} V190Z" fill="url(#g-parch)"/>
    <path d="${cusps(-6, 12, 8)}" fill="none" stroke="#a46f2a" stroke-width="1.4"/>
    <path d="${cusps(-5, 20, 15)}" fill="none" stroke="#b98336" stroke-width="1" stroke-dasharray="1.5 3"/>
    <path d="${cusps(-4, 30, 24)}" fill="none" stroke="#c98d3e" stroke-opacity=".55" stroke-width=".8"/>
    <path d="M150,-14 l5,8 l-5,10 l-5,-10z" fill="url(#g-gold)"/>
    <use href="#chandelier" x="112" y="34" width="76" height="72"/>
    ${climb}
  </svg>`;
};

/** A hanging Moroccan lantern with a warm glow. viewBox 60×120. */
export const lantern = () => `<svg class="lantern" viewBox="0 0 60 120" aria-hidden="true" overflow="visible">
  <circle cx="30" cy="74" r="40" fill="url(#g-glow)" opacity=".8"/>
  <path d="M30,0 V20" stroke="url(#g-gold)" stroke-width="1.5"/>
  <path d="M22,20 h16 l-3,8 h-10z" fill="url(#g-gold)"/>
  <path d="M25,28 C8,44 8,92 20,106 H40 C52,92 52,44 35,28Z" fill="#ffcf6e" fill-opacity=".55" stroke="url(#g-gold)" stroke-width="2"/>
  <path d="M30,30 V104 M20,40 C14,60 14,84 22,104 M40,40 C46,60 46,84 38,104" stroke="#a46f2a" stroke-width="1.2" fill="none"/>
  <ellipse cx="30" cy="70" rx="7" ry="11" fill="#fff6d8"/>
  <path d="M18,106 h24 l-4,8 h-16z" fill="url(#g-gold)"/><circle cx="30" cy="118" r="2.5" fill="url(#g-gold)"/>
</svg>`;

/** Repeating column of roses + leaves (CSS background tile, 80×150). Red, wine and blush only. */
export const roseWall = (seed: number) => {
  const r = rng(seed);
  const rose = (x: number, y: number, k: number, c0: string, c1: string, c2: string) => {
    const petals = Array.from({length: 6}, (_, i) =>
      `<ellipse cx="0" cy="-9" rx="9.5" ry="9" transform="rotate(${i * 60 + 15})" fill="${c1}" stroke="${c2}" stroke-opacity=".5" stroke-width=".8"/>`).join('');
    return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${k.toFixed(2)})">${petals}
      <circle r="12.5" fill="${c0}" stroke="${c2}" stroke-opacity=".4"/>
      <path d="M0,0 m-2,0 a2,2 0 1,1 4,0 a4,4 0 1,1 -8,0 a6,6 0 1,1 12,0 a8,8 0 1,1 -16,1" fill="none" stroke="${c2}" stroke-opacity=".65" stroke-width="1.3"/></g>`;
  };
  const leaf = (x: number, y: number, a: number) =>
    `<path transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${a.toFixed(0)})" d="M0,0 C6,-8 18,-9 26,0 C18,9 6,8 0,0Z" fill="${r() < 0.5 ? '#2c4a1c' : '#3d5e26'}"/>`;
  const cols = [
    ['#d8293f', '#a3122a', '#3d030c'],
    ['#f6c6cc', '#e597a2', '#8a3c4a'],
    ['#a51a33', '#6e0a1f', '#22020a'],
    ['#d8293f', '#b3132c', '#4f0612'],
  ];
  let s = '';
  for (let i = 0; i < 14; i++) s += leaf(r() * 80, r() * 150, r() * 360);
  for (let i = 0; i < 8; i++) {
    const c = cols[Math.floor(r() * cols.length)];
    s += rose(6 + r() * 68, (i * 150) / 8 + r() * 12, 0.5 + r() * 0.4, c[0], c[1], c[2]);
  }
  for (let i = 0; i < 5; i++) s += `<circle cx="${(r() * 80).toFixed(1)}" cy="${(r() * 150).toFixed(1)}" r="1.4" fill="#fff1c2"/>`;
  return svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="80" height="150" viewBox="0 0 80 150">${s}</svg>`);
};

// ───────────────────────────── jaali border band ─────────────────────────────

/** Gold lattice band between sections (CSS background tile, 44×36). */
export const jaaliBand = () =>
  svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="44" height="36" viewBox="0 0 44 36">
    <defs><linearGradient id="j" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a5762c"/><stop offset=".45" stop-color="#ffe29a"/><stop offset="1" stop-color="#b3832f"/></linearGradient></defs>
    <rect width="44" height="36" fill="#5a0b14"/>
    <rect y="0" width="44" height="3" fill="url(#j)"/><rect y="33" width="44" height="3" fill="url(#j)"/>
    <g fill="none" stroke="url(#j)" stroke-width="1.8">
      <path d="M22,5 L39,18 L22,31 L5,18Z"/><path d="M0,5 L5,9 M0,31 L5,27 M44,5 L39,9 M44,31 L39,27"/>
      <path d="M22,11 C26,14 26,22 22,25 C18,22 18,14 22,11Z"/><path d="M14,18 C17,14 27,14 30,18 C27,22 17,22 14,18Z"/>
    </g>
    <circle cx="22" cy="18" r="2" fill="#ffe29a"/><circle cx="0" cy="18" r="2.4" fill="url(#j)"/><circle cx="44" cy="18" r="2.4" fill="url(#j)"/>
  </svg>`);

/** Small gold ornament: line · diamond · line. */
export const ornament = (color = '#c9a24a') => `<svg class="ornament" viewBox="0 0 220 14" aria-hidden="true">
  <path d="M0,7 H96 M124,7 H220" stroke="${color}" stroke-width=".9" stroke-opacity=".8"/>
  <path d="M110,1 l6,6 l-6,6 l-6,-6z" fill="${color}"/><circle cx="96" cy="7" r="1.5" fill="${color}"/><circle cx="124" cy="7" r="1.5" fill="${color}"/>
</svg>`;
