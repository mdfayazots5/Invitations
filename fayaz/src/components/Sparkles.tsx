import React from 'react';
import {interpolate, random, useCurrentFrame} from 'remotion';
import {C, CLAMP} from '../theme';

const Star: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="-10 -10 20 20" style={{overflow: 'visible'}}>
    <path
      d="M0,-10 C1,-2 2,-1 10,0 C2,1 1,2 0,10 C-1,2 -2,1 -10,0 C-2,-1 -1,-2 0,-10 Z"
      fill={color}
    />
  </svg>
);

/** Twinkling gold stars scattered over an area. */
export const Twinkles: React.FC<{
  count?: number;
  seed?: string;
  width?: number;
  height?: number;
  top?: number;
  left?: number;
  maxSize?: number;
  start?: number;
}> = ({count = 24, seed = 'tw', width = 1080, height = 1920, top = 0, left = 0, maxSize = 26, start = 0}) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [start, start + 20], [0, 1], CLAMP);
  return (
    <div style={{position: 'absolute', left, top, width, height, pointerEvents: 'none'}}>
      {Array.from({length: count}).map((_, i) => {
        const x = random(`${seed}x${i}`) * width;
        const y = random(`${seed}y${i}`) * height;
        const size = 8 + random(`${seed}s${i}`) * maxSize;
        const speed = 0.08 + random(`${seed}v${i}`) * 0.1;
        const phase = random(`${seed}p${i}`) * Math.PI * 2;
        const tw = Math.max(0, Math.sin(frame * speed + phase));
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - size / 2,
              top: y - size / 2,
              opacity: tw * fadeIn,
              transform: `scale(${0.5 + tw * 0.5}) rotate(${frame * 2}deg)`,
              filter: `drop-shadow(0 0 6px ${C.goldLight})`,
            }}
          >
            <Star size={size} color={i % 3 === 0 ? '#FFF4D0' : C.goldLight} />
          </div>
        );
      })}
    </div>
  );
};

/** Gold particles exploding outward from a point. */
export const SparkleBurst: React.FC<{
  x: number;
  y: number;
  start: number;
  count?: number;
  radius?: number;
  duration?: number;
  seed?: string;
  spreadY?: number; // < 1 flattens, direction bias upward when bias set
  upward?: boolean;
}> = ({x, y, start, count = 40, radius = 520, duration = 45, seed = 'sb', upward = false}) => {
  const frame = useCurrentFrame();
  const t = (frame - start) / duration;
  if (t < 0 || t > 1.2) return null;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none'}}>
      {Array.from({length: count}).map((_, i) => {
        let a = random(`${seed}a${i}`) * Math.PI * 2;
        if (upward) a = -Math.PI / 2 + (random(`${seed}a${i}`) - 0.5) * Math.PI * 1.1;
        const dist = radius * (0.3 + random(`${seed}d${i}`) * 0.7);
        const e = 1 - Math.pow(1 - Math.min(1, t), 3);
        const px = x + Math.cos(a) * dist * e;
        const py = y + Math.sin(a) * dist * e + t * t * 120; // gentle gravity
        const size = 10 + random(`${seed}s${i}`) * 22;
        const op = interpolate(t, [0, 0.1, 0.7, 1.1], [0, 1, 0.9, 0], CLAMP);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: px - size / 2,
              top: py - size / 2,
              opacity: op,
              transform: `rotate(${(frame - start) * 6 + i * 20}deg)`,
              filter: `drop-shadow(0 0 8px ${C.goldLight})`,
            }}
          >
            <Star size={size} color={i % 2 ? '#FFF2C6' : C.goldLight} />
          </div>
        );
      })}
    </div>
  );
};
