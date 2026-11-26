import React, {useId} from 'react';
import {C} from '../theme';

type Tone = 'blush' | 'ivory' | 'rose';

const TONES: Record<Tone, {base: string; mid: string; tip: string; heart: string}> = {
  blush: {base: '#D98C9C', mid: '#EDB3BE', tip: '#FBE3E7', heart: '#C8707F'},
  ivory: {base: '#E9CDB8', mid: '#F6E6D8', tip: '#FFFBF5', heart: '#DDB79D'},
  rose: {base: '#C46B7E', mid: '#E29AA9', tip: '#F7D3DA', heart: '#A9536A'},
};

// A petal pointing up (negative y), base at origin, with a soft notch at the tip.
const petalPath = (l: number, w: number) =>
  `M0,0 C${-w * 0.95},${-l * 0.22} ${-w * 0.8},${-l * 0.95} ${-w * 0.22},${-l} ` +
  `C${-w * 0.08},${-l * 0.9} ${w * 0.08},${-l * 0.9} ${w * 0.22},${-l} ` +
  `C${w * 0.8},${-l * 0.95} ${w * 0.95},${-l * 0.22} 0,0 Z`;

const LAYERS = [
  {n: 9, l: 96, w: 62, off: 0},
  {n: 8, l: 80, w: 54, off: 22},
  {n: 7, l: 63, w: 44, off: 8},
  {n: 6, l: 46, w: 34, off: 30},
  {n: 5, l: 29, w: 24, off: 12},
];

export const Peony: React.FC<{
  x: number;
  y: number;
  size: number; // approx. radius in px
  bloom: number; // 0..1
  rotate?: number;
  tone?: Tone;
}> = ({x, y, size, bloom, rotate = 0, tone = 'blush'}) => {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const t = TONES[tone];
  const b = Math.max(0, Math.min(1, bloom));
  if (b <= 0) return null;
  const s = size / 100;

  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate + (1 - b) * -40}) scale(${s})`}>
      <defs>
        <linearGradient id={`pg${id}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={t.base} />
          <stop offset="55%" stopColor={t.mid} />
          <stop offset="100%" stopColor={t.tip} />
        </linearGradient>
        <radialGradient id={`ph${id}`}>
          <stop offset="0%" stopColor={C.goldPale} />
          <stop offset="60%" stopColor={C.goldLight} />
          <stop offset="100%" stopColor={t.heart} stopOpacity={0} />
        </radialGradient>
      </defs>
      {LAYERS.map((layer, li) => {
        // Outer layers open first, inner layers follow.
        const lp = Math.max(0, Math.min(1, b * 1.6 - li * 0.15));
        const sc = 0.35 + 0.65 * lp;
        return (
          <g key={li} transform={`scale(${sc})`} opacity={Math.min(1, lp * 1.5)}>
            {Array.from({length: layer.n}).map((_, i) => {
              const a = (360 / layer.n) * i + layer.off;
              const jitter = ((i * 37 + li * 11) % 9) / 9; // deterministic variance
              return (
                <path
                  key={i}
                  d={petalPath(layer.l * (0.92 + jitter * 0.12), layer.w)}
                  transform={`rotate(${a + jitter * 6})`}
                  fill={`url(#pg${id})`}
                  stroke={t.base}
                  strokeOpacity={0.35}
                  strokeWidth={1.2}
                />
              );
            })}
          </g>
        );
      })}
      <circle r={16 * b} fill={`url(#ph${id})`} opacity={0.9} />
      {Array.from({length: 10}).map((_, i) => {
        const a = (Math.PI * 2 * i) / 10;
        return (
          <circle
            key={i}
            cx={Math.cos(a) * 9 * b}
            cy={Math.sin(a) * 9 * b}
            r={2.2}
            fill={C.gold}
            opacity={b}
          />
        );
      })}
    </g>
  );
};

export const Leaf: React.FC<{
  x: number;
  y: number;
  size: number;
  rotate: number;
  grow: number;
  color?: string;
}> = ({x, y, size, rotate, grow, color = C.sage}) => {
  const g = Math.max(0, Math.min(1, grow));
  if (g <= 0) return null;
  const s = (size / 100) * g;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${s})`}>
      <path
        d="M0,0 C26,-24 30,-74 0,-110 C-30,-74 -26,-24 0,0 Z"
        fill={color}
        stroke={C.sageDeep}
        strokeOpacity={0.5}
        strokeWidth={1.5}
      />
      <path d="M0,-4 L0,-100" stroke={C.sageDeep} strokeOpacity={0.6} strokeWidth={2} />
    </g>
  );
};
