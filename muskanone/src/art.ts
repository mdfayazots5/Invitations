/**
 * Everything drawn in code (SVG): brass lanterns, crescents & stars on strings, the white-flower garland,
 * the gold lotus divider, the monogram ring, and a pastel "stand-in" scene for each painted background
 * (public/art/*.webp) that hasn't been generated yet. Watercolour feel: soft gradients, no hard outlines.
 */
import type {ArtName} from './invite.config';

const GOLD = `<linearGradient id="g-gold" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#8C5A23"/><stop offset=".45" stop-color="#E2B765"/><stop offset="1" stop-color="#A8743A"/></linearGradient>`;

/** Shared gradients, injected once at the top of <body>. */
export const artDefs = () => `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
  ${GOLD}
  <linearGradient id="g-brass" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#7A4E1E"/><stop offset=".35" stop-color="#D9A94F"/><stop offset=".55" stop-color="#F3D48A"/><stop offset="1" stop-color="#8A5A24"/></linearGradient>
  <radialGradient id="g-flame" cx=".5" cy=".55" r=".5">
    <stop offset="0" stop-color="#FFF6D6"/><stop offset=".45" stop-color="#FFD27A" stop-opacity=".9"/><stop offset="1" stop-color="#FFB347" stop-opacity="0"/></radialGradient>
</defs></svg>`;

/** A brass Moroccan lantern (46×120) with a warm glow inside. The chain is a CSS line above it. */
export const lantern = () => `<svg class="lantern-svg" viewBox="0 0 46 120" aria-hidden="true">
  <circle cx="23" cy="66" r="30" fill="url(#g-flame)" opacity=".55"/>
  <path d="M23 2 l5 9 h-10z" fill="url(#g-brass)"/>
  <path d="M12 11 h22 l4 12 h-30z" fill="url(#g-brass)"/>
  <path d="M10 23 h26 c4 14 6 30 2 52 h-30 c-4 -22 -2 -38 2 -52z" fill="#FFE7A8" opacity=".55"/>
  <path d="M10 23 h26 c4 14 6 30 2 52 h-30 c-4 -22 -2 -38 2 -52z" fill="none" stroke="url(#g-brass)" stroke-width="2.4"/>
  <path d="M23 23 v52 M16 24 c-3 16 -3 34 0 50 M30 24 c3 16 3 34 0 50" stroke="url(#g-brass)" stroke-width="1.4" fill="none" opacity=".9"/>
  <ellipse cx="23" cy="54" rx="5" ry="9" fill="#FFF3C9"/>
  <path d="M8 75 h30 l-4 9 h-22z" fill="url(#g-brass)"/>
  <path d="M15 84 h16 l-8 14z" fill="url(#g-brass)"/>
  <circle cx="23" cy="102" r="2.6" fill="#C9933F"/>
</svg>`;

/** Lanterns hanging from the top edge: `spec` = [left %, chain length px, size scale]. */
export const lanterns = (spec: [number, number, number][]) =>
  `<div class="lanterns" aria-hidden="true">${spec
    .map(
      ([x, chain, s], i) =>
        `<div class="lantern" style="left:${x}%;--chain:${chain}px;--s:${s};--delay:${(-i * 1.3).toFixed(1)}s"><i class="chain"></i>${lantern()}</div>`,
    )
    .join('')}</div>`;

/** Small gold crescents and stars hanging on thin strings. */
export const charms = () =>
  `<div class="charms" aria-hidden="true">${[
    [12, 70, 'moon'],
    [27, 120, 'star'],
    [41, 52, 'star'],
    [61, 96, 'moon'],
    [76, 58, 'star'],
    [89, 110, 'star'],
  ]
    .map(
      ([x, len, kind], i) => `<div class="charm" style="left:${x}%;--chain:${len}px;--delay:${(-i * 0.9).toFixed(1)}s"><i class="chain"></i>
      <svg viewBox="0 0 24 24">${
        kind === 'moon'
          ? '<path d="M15 3a9 9 0 1 0 6 15 7.5 7.5 0 1 1 -6 -15z" fill="url(#g-gold)"/>'
          : '<path d="M12 2l2.4 6.6 7 .3-5.5 4.3 2 6.8-5.9-4-5.9 4 2-6.8-5.5-4.3 7-.3z" fill="url(#g-gold)"/>'
      }</svg></div>`,
    )
    .join('')}</div>`;

/** A swag of white jasmine/rose flowers with leaves and fairy lights, across the top edge. */
export const garland = () => {
  const pts: string[] = [];
  const lights: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const x = t * 400;
    // two swags meeting in the middle
    const y = 14 + Math.sin((t * 2 % 1) * Math.PI) * 34;
    const r = 5 + ((i * 7) % 4);
    pts.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="#FFFDF8"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(r / 3).toFixed(1)}" fill="#F2D9A8"/>`);
    if (i % 3 === 0)
      pts.unshift(`<ellipse cx="${(x + 6).toFixed(1)}" cy="${(y + 6).toFixed(1)}" rx="7" ry="3" fill="#8DAE85" transform="rotate(${(i * 37) % 60 - 30} ${x} ${y})"/>`);
    if (i % 2 === 1) lights.push(`<circle class="fairy" cx="${x.toFixed(1)}" cy="${(y + 14).toFixed(1)}" r="1.8" fill="#FFF1B8" style="--i:${i % 5}"/>`);
  }
  return `<svg class="garland" viewBox="0 0 400 70" preserveAspectRatio="none" aria-hidden="true">${pts.join('')}${lights.join('')}</svg>`;
};

/** Thin gold divider with a lotus in the centre. */
export const lotusDivider = () => `<svg class="divider" viewBox="0 0 220 26" aria-hidden="true">
  <!-- solid colour: a gradient stroke on a perfectly flat line has no height to spread over and doesn't render -->
  <path d="M8 16 H86 M134 16 H212" stroke="#A8743A" stroke-width="1.2"/>
  <circle cx="8" cy="16" r="1.8" fill="#A8743A"/><circle cx="212" cy="16" r="1.8" fill="#A8743A"/>
  <path d="M110 4 c6 6 6 12 0 18 c-6 -6 -6 -12 0 -18z" fill="url(#g-gold)"/>
  <path d="M110 22 c-4 -8 -12 -10 -18 -8 c4 6 10 9 18 8z M110 22 c4 -8 12 -10 18 -8 c-4 6 -10 9 -18 8z" fill="url(#g-gold)" opacity=".85"/>
  <path d="M110 23 c-8 0 -16 -2 -22 -6 M110 23 c8 0 16 -2 22 -6" stroke="#A8743A" stroke-width=".8" fill="none"/>
</svg>`;

/** Gold ring with the monogram (the ring is SVG; the letters are HTML so they use the script font). */
export const monogramRing = (a: string, b: string) => `<div class="mono">
  <svg viewBox="0 0 120 120" aria-hidden="true">
    <circle cx="60" cy="60" r="54" fill="rgba(255,250,240,.55)" stroke="url(#g-gold)" stroke-width="2.5"/>
    <circle cx="60" cy="60" r="48" fill="none" stroke="url(#g-gold)" stroke-width=".8" stroke-dasharray="2 4"/>
  </svg>
  <span class="mono-text">${a}<span class="mono-amp">&amp;</span>${b}</span>
</div>`;

// ───────────────────────── stand-in scenes (until the painted art exists) ─────────────────────────

const SKY = (id: string) => `<linearGradient id="sky-${id}" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#88B8E8"/><stop offset=".38" stop-color="#B2D7EC"/><stop offset=".72" stop-color="#FFD8CD"/><stop offset="1" stop-color="#F8DBD4"/></linearGradient>
  <radialGradient id="sun-${id}" cx=".5" cy=".7" r=".5"><stop offset="0" stop-color="#FFF4E0" stop-opacity=".9"/><stop offset="1" stop-color="#FFE3D2" stop-opacity="0"/></radialGradient>
  <filter id="soft-${id}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="14"/></filter>
  <filter id="paint-${id}"><feGaussianBlur stdDeviation="1.4"/></filter>`;

const clouds = (id: string) => `<g filter="url(#soft-${id})" fill="#FFFFFF" opacity=".55">
  <ellipse cx="200" cy="420" rx="220" ry="40"/><ellipse cx="820" cy="300" rx="260" ry="46"/><ellipse cx="560" cy="620" rx="300" ry="38"/>
  <ellipse cx="120" cy="900" rx="200" ry="30"/><ellipse cx="960" cy="860" rx="220" ry="34"/></g>`;

const dome = (x: number, y: number, w: number, fill = '#FFFDF8') =>
  `<path d="M${x - w / 2} ${y} c0 ${-w * 0.75} ${w} ${-w * 0.75} ${w} 0z" fill="${fill}"/><path d="M${x} ${y - w * 0.62} v${-w * 0.2}" stroke="#D9B26A" stroke-width="${Math.max(2, w / 40)}"/><circle cx="${x}" cy="${y - w * 0.84}" r="${Math.max(3, w / 30)}" fill="#D9B26A"/>`;
const minaret = (x: number, base: number, h: number, w: number, fill = '#FFFDF8') =>
  `<rect x="${x - w / 2}" y="${base - h}" width="${w}" height="${h}" fill="${fill}"/><path d="M${x - w * 0.8} ${base - h} h${w * 1.6} l${-w * 0.8} ${-w * 1.4}z" fill="${fill}"/><rect x="${x - w * 0.75}" y="${base - h * 0.55}" width="${w * 1.5}" height="${w * 0.25}" fill="#EBDCC5"/>`;

const palm = (x: number, base: number, h: number, flip = 1) => {
  const top = base - h;
  const leaves = [-70, -35, -5, 25, 60, 95, 130]
    .map((a) => `<path d="M${x} ${top} q${Math.cos((a * Math.PI) / 180) * 90 * flip} ${Math.sin((a * Math.PI) / 180) * 40 - 30} ${Math.cos((a * Math.PI) / 180) * 170 * flip} ${Math.sin((a * Math.PI) / 180) * 120 + 40}" stroke="#6F9A78" stroke-width="16" stroke-linecap="round" fill="none" opacity=".85"/>`)
    .join('');
  return `<path d="M${x} ${base} q${-14 * flip} ${-h / 2} 0 ${-h}" stroke="#A88A6A" stroke-width="16" fill="none"/>${leaves}`;
};

const flowers = (cx: number, cy: number, n: number, spread: number, colors = ['#FFFFFF', '#F7C9C9', '#F3A9B6']) => {
  let s = '';
  for (let i = 0; i < n; i++) {
    const a = (i * 137.5 * Math.PI) / 180;
    const r = spread * Math.sqrt((i + 1) / n);
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r * 0.6;
    s += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${7 + (i % 4) * 2}" fill="${colors[i % colors.length]}"/>`;
    if (i % 3 === 0) s += `<ellipse cx="${(x + 9).toFixed(0)}" cy="${(y + 5).toFixed(0)}" rx="10" ry="4" fill="#8DAE85" transform="rotate(${(i * 41) % 90 - 45} ${x.toFixed(0)} ${y.toFixed(0)})"/>`;
  }
  return s;
};

const SCENES: Record<Exclude<ArtName, 'curtain'>, (id: string) => string> = {
  /** Distant white domed palace, palms each side, a cream terrace. */
  hero: (id) => `${clouds(id)}
    <g opacity=".85" filter="url(#paint-${id})">
      <rect x="300" y="1330" width="480" height="140" fill="#FFFDF8"/>
      ${dome(540, 1330, 230)}${dome(400, 1340, 90)}${dome(680, 1340, 90)}
      ${minaret(250, 1470, 330, 28)}${minaret(830, 1470, 330, 28)}
      <path d="M360 1470 v-70 a30 30 0 0 1 60 0 v70z M510 1470 v-90 a30 30 0 0 1 60 0 v90z M660 1470 v-70 a30 30 0 0 1 60 0 v70z" fill="#F0D9C6"/>
    </g>
    <path d="M0 1520 q540 -90 1080 0 v400 h-1080z" fill="#EAD7C3"/>
    <path d="M0 1600 q540 -60 1080 0 v320 h-1080z" fill="#F3E6D6"/>
    ${palm(90, 1640, 520)}${palm(990, 1640, 520, -1)}
    <g>${flowers(150, 1640, 26, 120)}${flowers(930, 1640, 26, 120)}</g>`,

  /** Three tall blush arches with lotus sprays. */
  names: (id) => `${clouds(id)}
    <g filter="url(#paint-${id})">
      ${[180, 540, 900]
        .map((x, i) => {
          const w = i === 1 ? 300 : 240;
          const top = i === 1 ? 980 : 1080;
          return `<path d="M${x - w / 2} 1920 V${top + w / 2} a${w / 2} ${w / 2} 0 0 1 ${w} 0 V1920z" fill="#F6E1DA" stroke="#EBCFC4" stroke-width="10"/>
            <path d="M${x - w / 2 + 28} 1920 V${top + w / 2 + 10} a${w / 2 - 28} ${w / 2 - 28} 0 0 1 ${w - 56} 0 V1920z" fill="#FBEEE8"/>
            ${flowers(x, top + w * 0.9, 18, w * 0.32, ['#F3A9B6', '#F7C9C9', '#FFFFFF', '#E88FA3'])}`;
        })
        .join('')}
    </g>
    <path d="M0 1780 q540 -50 1080 0 v140 h-1080z" fill="#EDD5C9"/>`,

  /** A round arch of white flowers by a calm lake, mountains and pines behind. */
  nikah: (id) => `${clouds(id)}
    <path d="M0 1240 l200 -230 l170 160 l210 -280 l250 300 l140 -120 l110 110 v260 h-1080z" fill="#B9C7DE" opacity=".8"/>
    <path d="M0 1300 l160 -140 l200 120 l230 -160 l260 190 l230 -110 v200 h-1080z" fill="#9FB5C9" opacity=".8"/>
    <g fill="#6E9580" opacity=".9">${[60, 140, 230, 860, 950, 1030].map((x, i) => `<path d="M${x} ${1330 - (i % 2) * 30} l40 -150 l40 150z"/>`).join('')}</g>
    <rect x="0" y="1330" width="1080" height="260" fill="#BFD9E6"/>
    <path d="M0 1360 h1080 M80 1420 h300 M640 1450 h360" stroke="#FFFFFF" stroke-width="5" opacity=".5"/>
    <path d="M0 1580 q540 -60 1080 0 v340 h-1080z" fill="#CFE0C4"/>
    <g>${(() => {
      let s = '';
      for (let i = 0; i <= 30; i++) {
        const a = Math.PI + (i / 30) * Math.PI;
        s += flowers(540 + Math.cos(a) * 300, 1560 + Math.sin(a) * 380, 3, 22);
      }
      return s;
    })()}</g>
    <path d="M240 1600 v-40 M840 1600 v-40" stroke="#8DAE85" stroke-width="14"/>`,

  /** A petal path to a lit floral mandap with aqua drapes, carved white arches each side. */
  valima: (id) => `${clouds(id)}
    <path d="M0 1250 q270 -120 540 -40 q270 -90 540 30 v300 h-1080z" fill="#B7D3B2" opacity=".9"/>
    <g filter="url(#paint-${id})">
      <rect x="360" y="1120" width="360" height="330" fill="#FFF8EE"/>
      <path d="M340 1130 q200 -170 400 0z" fill="#FFFDF8"/>
      <path d="M380 1140 q30 160 0 300 h40 q-20 -150 0 -300z M700 1140 q-30 160 0 300 h-40 q20 -150 0 -300z" fill="#9ED8D2" opacity=".9"/>
      <ellipse cx="540" cy="1290" rx="120" ry="90" fill="#FFE2A6" opacity=".55" filter="url(#soft-${id})"/>
      ${flowers(540, 1110, 30, 150)}
    </g>
    ${[120, 960]
      .map((x) => `<path d="M${x - 90} 1700 V1250 a90 90 0 0 1 180 0 V1700z" fill="#FFFDF8"/><path d="M${x - 60} 1700 V1270 a60 60 0 0 1 120 0 V1700z" fill="#F4E7DA"/>`)
      .join('')}
    <path d="M440 1450 L120 1920 H960 L640 1450z" fill="#F3E1D2"/>
    <g>${Array.from({length: 40}, (_, i) => `<ellipse cx="${(540 + ((i * 97) % 300 - 150) * (1 + i / 30)).toFixed(0)}" cy="${1470 + i * 11}" rx="7" ry="4" fill="${i % 2 ? '#F3A9B6' : '#F7C9C9'}"/>`).join('')}</g>
    <g>${[0, 1, 2, 3, 4].map((k) => `<circle cx="${430 - k * 70}" cy="${1500 + k * 90}" r="10" fill="#FFE7A8"/><circle cx="${650 + k * 70}" cy="${1500 + k * 90}" r="10" fill="#FFE7A8"/>`).join('')}</g>`,

  /** A white marble mosque at sunset. */
  closing: (id) => `${clouds(id)}
    <rect x="0" y="0" width="1080" height="1920" fill="url(#sun-${id})"/>
    <g filter="url(#paint-${id})">
      <rect x="250" y="1300" width="580" height="260" fill="#FFFDF8"/>
      ${dome(540, 1300, 300)}${dome(370, 1310, 110)}${dome(710, 1310, 110)}
      ${minaret(190, 1560, 520, 34)}${minaret(890, 1560, 520, 34)}
      <path d="M470 1560 v-120 a70 70 0 0 1 140 0 v120z" fill="#EEDCC8"/>
      <path d="M310 1560 v-80 a35 35 0 0 1 70 0 v80z M700 1560 v-80 a35 35 0 0 1 70 0 v80z" fill="#EEDCC8"/>
    </g>
    <path d="M0 1560 h1080 v360 h-1080z" fill="#F1E2D2"/>
    <rect x="440" y="1560" width="200" height="360" fill="#BFD9E6" opacity=".6"/>`,
};

/** Full-screen stand-in for a painted background: pastel sky + a simple scene in the lower half. */
export const scene = (name: Exclude<ArtName, 'curtain'>) => {
  const id = name;
  return `<svg class="scene" viewBox="0 0 1080 1920" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <defs>${SKY(id)}</defs>
    <rect width="1080" height="1920" fill="url(#sky-${id})"/>
    <rect width="1080" height="1920" fill="url(#sun-${id})"/>
    ${SCENES[name](id)}
  </svg>`;
};
