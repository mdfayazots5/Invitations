import React, {useId} from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {C, CLAMP} from '../theme';
import {SparkleBurst} from './Sparkles';

/**
 * A gold-foil disc that gets "scratched" away along a zig-zag path, revealing children.
 */
export const ScratchCircle: React.FC<{
  diameter: number;
  start: number;
  duration?: number;
  children: React.ReactNode;
}> = ({diameter: D, start, duration = 26, children}) => {
  const frame = useCurrentFrame();
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const p = interpolate(frame, [start, start + duration], [0, 1], CLAMP);
  const leftover = interpolate(frame, [start + duration - 4, start + duration + 6], [1, 0], CLAMP);
  const reveal = interpolate(frame, [start + duration - 6, start + duration + 8], [0, 1], CLAMP);
  const enter = interpolate(frame, [0, 14], [0, 1], CLAMP);

  // zig-zag across the disc, top to bottom
  const rows = 7;
  const pts: string[] = [];
  for (let i = 0; i <= rows; i++) {
    const y = D * 0.06 + (D * 0.88 * i) / rows;
    pts.push(`${i % 2 === 0 ? D * 0.02 : D * 0.98},${y}`);
  }
  const zig = `M${pts.join(' L')}`;

  return (
    <div
      style={{
        position: 'relative',
        width: D,
        height: D,
        transform: `scale(${0.6 + 0.4 * enter})`,
        opacity: enter,
      }}
    >
      {/* revealed face */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: `radial-gradient(circle at 50% 40%, ${C.paper} 0%, ${C.ivory} 55%, ${C.blushLight} 100%)`,
          boxShadow: `inset 0 0 0 5px ${C.goldLight}, inset 0 0 0 9px ${C.paper}, inset 0 0 0 11px ${C.gold}, 0 12px 30px rgba(160,100,90,0.25)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{transform: `scale(${0.85 + 0.15 * reveal})`}}>{children}</div>
      </div>
      {/* foil */}
      <svg
        width={D}
        height={D}
        viewBox={`0 0 ${D} ${D}`}
        style={{position: 'absolute', inset: 0, opacity: leftover}}
      >
        <defs>
          <radialGradient id={`f${id}`} cx="35%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#FFF3C8" />
            <stop offset="35%" stopColor={C.goldLight} />
            <stop offset="75%" stopColor={C.gold} />
            <stop offset="100%" stopColor={C.goldDeep} />
          </radialGradient>
          <pattern id={`t${id}`} width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <rect width="10" height="10" fill="transparent" />
            <line x1="0" y1="0" x2="0" y2="10" stroke="#FFF6D8" strokeOpacity={0.25} strokeWidth={2} />
          </pattern>
          <mask id={`m${id}`}>
            <rect width={D} height={D} fill="white" />
            <path
              d={zig}
              pathLength={1}
              fill="none"
              stroke="black"
              strokeWidth={D * 0.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="1 1"
              strokeDashoffset={1 - p}
            />
          </mask>
        </defs>
        <g mask={`url(#m${id})`}>
          <circle cx={D / 2} cy={D / 2} r={D / 2} fill={`url(#f${id})`} />
          <circle cx={D / 2} cy={D / 2} r={D / 2} fill={`url(#t${id})`} />
          <circle
            cx={D / 2}
            cy={D / 2}
            r={D / 2 - 14}
            fill="none"
            stroke="#FFF4CF"
            strokeOpacity={0.6}
            strokeWidth={2}
            strokeDasharray="4 8"
          />
        </g>
      </svg>
      <SparkleBurst x={D / 2} y={D / 2} start={start + duration - 2} count={14} radius={D * 0.9} duration={28} seed={`sc${id}`} />
    </div>
  );
};
