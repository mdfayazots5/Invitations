/** Henna-paisley lace tile (96×96) as a CSS background value. */
export const laceBackground = (): string => {
  const paisley = (x: number, y: number, r: number, s = 1) =>
    `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})">
      <path d="M0,0 C11,-15 28,-9 25,6 C22,18 7,22 -1,32 C-6,20 -11,8 0,0 Z"/>
      <path d="M3,4 C9,-4 19,-1 17,8 C15,14 8,16 3,21"/>
      <circle cx="10" cy="3" r="2.4"/>
      <circle cx="-3" cy="36" r="1.2" fill="#E8E2D8"/>
    </g>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
    <g fill="none" stroke="#E8E2D8" stroke-opacity=".85" stroke-width="1">
      ${paisley(18, 14, 20)}${paisley(70, 52, 200)}${paisley(66, 8, 110, 0.7)}${paisley(22, 64, -70, 0.7)}
      <path d="M0,48 Q12,40 24,48 Q36,56 48,48 Q60,40 72,48 Q84,56 96,48" stroke-opacity=".45"/>
      <circle cx="48" cy="30" r="5"/><circle cx="48" cy="30" r="1.5" fill="#E8E2D8"/>
      <circle cx="0" cy="0" r="6"/><circle cx="96" cy="0" r="6"/><circle cx="0" cy="96" r="6"/><circle cx="96" cy="96" r="6"/>
      <circle cx="48" cy="84" r="3"/>
    </g>
    <g fill="#E8E2D8" fill-opacity=".8">
      <circle cx="40" cy="20" r="1"/><circle cx="56" cy="20" r="1"/><circle cx="8" cy="40" r="1"/><circle cx="88" cy="74" r="1"/>
      <circle cx="34" cy="88" r="1"/><circle cx="62" cy="88" r="1"/><circle cx="84" cy="28" r="1"/><circle cx="12" cy="80" r="1"/>
    </g>
  </svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};

/** Two sagging gold wires with twinkling bulbs. */
export const stringLights = (): string => {
  const wire = (y0: number, sag: number, n: number, phase: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      pts.push(`${(t * 480).toFixed(1)},${(y0 + sag * 4 * t * (1 - t)).toFixed(1)}`);
    }
    const bulbs = Array.from({length: n}, (_, i) => {
      const t = (i + 0.5 + phase) / n;
      const x = t * 480;
      const y = y0 + sag * 4 * t * (1 - t) + 4;
      const delay = (Math.random() * 2.4).toFixed(2);
      return `<g class="glow" style="--t:-${delay}s"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9" fill="url(#bulbGlow)"/>
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.4" fill="#FFE7A3"/></g>`;
    }).join('');
    return `<polyline points="${pts.join(' ')}" fill="none" stroke="#C9A24A" stroke-width=".9" stroke-opacity=".8"/>${bulbs}`;
  };
  return `<svg class="lights" viewBox="0 0 480 70" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <defs><radialGradient id="bulbGlow"><stop offset="0" stop-color="#FFE7A3" stop-opacity=".9"/><stop offset="1" stop-color="#FFE7A3" stop-opacity="0"/></radialGradient></defs>
    ${wire(6, 36, 16, 0)}${wire(14, 46, 14, 0.3)}
  </svg>`;
};

export const divider = () => '<div class="divider" aria-hidden="true">✦</div>';
