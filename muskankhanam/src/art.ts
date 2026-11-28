/**
 * Artwork. The painted scenes (curtain, palace hall, arch) are images in public/art/ (AI-generated, approved by the
 * family). What stays in code: the F & M crest,
 * the gold filigree band, the paper grain and small ornaments. Shared gradients live in a hidden <svg> (`artDefs`);
 * the background tiles are standalone SVG data-URLs because CSS backgrounds can't reach the page's gradients.
 */

const svgUrl = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg.replace(/\s{2,}/g, ' '))}")`;

// ───────────────────────────── shared symbols ─────────────────────────────

/** Hidden <svg> with every shared gradient and symbol. Insert once at the top of <body>. */
export const artDefs = () => `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
  <radialGradient id="g-glow"><stop offset="0" stop-color="#fff6d8" stop-opacity="1"/><stop offset=".25" stop-color="#ffd27a" stop-opacity=".75"/><stop offset="1" stop-color="#ff9a2e" stop-opacity="0"/></radialGradient>
  <linearGradient id="g-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8c6a2b"/><stop offset=".3" stop-color="#f3d58e"/><stop offset=".5" stop-color="#c79a45"/><stop offset=".72" stop-color="#fbe8b0"/><stop offset="1" stop-color="#9c7431"/></linearGradient>
</defs></svg>`;

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

// ───────────────────────────── jaali border band ─────────────────────────────

/** Embossed gold filigree band between sections (CSS background tile, 48×40), like the video's carved gold strip. */
export const jaaliBand = () => {
  const lace = `<path d="M24,6 C32,10 40,14 42,20 C40,26 32,30 24,34 C16,30 8,26 6,20 C8,14 16,10 24,6Z"/>
    <path d="M24,12 C29,15 33,17 34,20 C33,23 29,25 24,28 C19,25 15,23 14,20 C15,17 19,15 24,12Z"/>
    <path d="M0,6 C4,10 6,14 6,20 C6,26 4,30 0,34 M48,6 C44,10 42,14 42,20 C42,26 44,30 48,34"/>
    <path d="M24,6 C24,2 28,2 30,4 M24,6 C24,2 20,2 18,4 M24,34 C24,38 28,38 30,36 M24,34 C24,38 20,38 18,36"/>
    <path d="M17,20 H31 M24,15 V25"/>`;
  return svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="48" height="40" viewBox="0 0 48 40">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe7a8"/><stop offset=".45" stop-color="#e3a43e"/><stop offset=".75" stop-color="#b8741f"/><stop offset="1" stop-color="#ffd27a"/></linearGradient>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a0a06"/><stop offset=".5" stop-color="#5c1408"/><stop offset="1" stop-color="#3a0a06"/></linearGradient>
    </defs>
    <rect width="48" height="40" fill="url(#bg)"/>
    <g fill="none" stroke-linecap="round">
      <g stroke="#1a0402" stroke-width="2.6" transform="translate(.8 .9)">${lace}</g>
      <g stroke="url(#g)" stroke-width="2">${lace}</g>
      <g stroke="#fff4cf" stroke-width=".6" stroke-opacity=".7" transform="translate(-.4 -.5)">${lace}</g>
    </g>
    <circle cx="24" cy="20" r="2.4" fill="#ffe7a8"/><circle cx="24" cy="20" r="1" fill="#8a4a10"/>
    <rect width="48" height="3.5" fill="url(#g)"/><rect y="36.5" width="48" height="3.5" fill="url(#g)"/>
    <rect y="3.5" width="48" height=".8" fill="#1a0402" fill-opacity=".7"/><rect y="35.7" width="48" height=".8" fill="#1a0402" fill-opacity=".7"/>
  </svg>`);
};

/** Faint paper / marble grain for the pale sections (CSS background tile). */
export const paperGrain = () =>
  svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220">
    <filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .55  0 0 0 0 .35  0 0 0 0 .35  0 0 0 .09 0"/></filter>
    <filter id="m"><feTurbulence type="fractalNoise" baseFrequency=".012 .03" numOctaves="3" seed="4" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .8  0 0 0 0 .55  0 0 0 0 .55  0 0 0 .07 0"/></filter>
    <rect width="220" height="220" filter="url(#m)"/><rect width="220" height="220" filter="url(#n)"/>
  </svg>`);

/** Small gold ornament: line · diamond · line. */
export const ornament = (color = '#c9a24a') => `<svg class="ornament" viewBox="0 0 220 14" aria-hidden="true">
  <path d="M0,7 H96 M124,7 H220" stroke="${color}" stroke-width=".9" stroke-opacity=".8"/>
  <path d="M110,1 l6,6 l-6,6 l-6,-6z" fill="${color}"/><circle cx="96" cy="7" r="1.5" fill="${color}"/><circle cx="124" cy="7" r="1.5" fill="${color}"/>
</svg>`;
