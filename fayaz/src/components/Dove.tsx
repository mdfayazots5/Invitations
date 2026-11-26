import React, {useId} from 'react';
import {C} from '../theme';

/**
 * A white dove facing right. `flap` is a phase in radians; the wings beat with cos(flap).
 * Position/scale are applied by the parent.
 */
export const Dove: React.FC<{flap: number; width?: number}> = ({flap, width = 220}) => {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const beat = Math.cos(flap); // 1 = wings up, -1 = wings down
  const nearScale = 0.25 + 0.75 * beat; // flips below the body on the downstroke
  const farScale = 0.15 + 0.6 * beat;

  return (
    <svg
      width={width}
      height={width * 0.75}
      viewBox="-10 -70 220 165"
      style={{overflow: 'visible', filter: 'drop-shadow(0 6px 8px rgba(120,80,60,0.18))'}}
    >
      <defs>
        <linearGradient id={`db${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#EFE6DA" />
        </linearGradient>
        <linearGradient id={`dw${id}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F1E8DC" />
        </linearGradient>
      </defs>
      {/* far wing */}
      <g transform={`translate(92 48) scale(1 ${farScale}) translate(-92 -48)`}>
        <path
          d="M100,48 C92,12 80,-22 52,-44 C70,-8 70,18 76,46 Z"
          fill="#E9DED0"
          stroke={C.goldLight}
          strokeWidth={1}
          strokeOpacity={0.6}
        />
      </g>
      {/* body */}
      <path
        d="M22,60 C42,42 82,38 112,45 C132,30 152,28 166,38 C172,42 177,45 190,46 C180,52 171,52 163,55 C150,71 120,83 82,81 C62,92 36,99 6,98 C22,89 34,81 40,75 C30,72 24,67 22,60 Z"
        fill={`url(#db${id})`}
        stroke={C.goldLight}
        strokeWidth={1.2}
        strokeOpacity={0.7}
      />
      <circle cx={168} cy={42} r={2.4} fill={C.ink} />
      <path d="M186,45 L194,46.5 L186,49 Z" fill={C.gold} />
      {/* near wing */}
      <g transform={`translate(88 50) scale(1 ${nearScale}) translate(-88 -50)`}>
        <path
          d="M104,50 C96,10 76,-30 34,-62 C46,-34 48,-18 46,-6 C54,-4 58,8 56,18 C64,20 68,34 68,48 Z"
          fill={`url(#dw${id})`}
          stroke={C.goldLight}
          strokeWidth={1.2}
          strokeOpacity={0.8}
        />
        <path
          d="M90,40 C80,14 66,-14 44,-40"
          stroke={C.goldLight}
          strokeOpacity={0.5}
          strokeWidth={1}
          fill="none"
        />
      </g>
    </svg>
  );
};
