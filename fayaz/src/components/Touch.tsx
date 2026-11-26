import React from 'react';
import {interpolate} from 'remotion';
import {CLAMP} from '../theme';

export type TouchKey = {f: number; x: number; y: number};

/** Position of the finger on a keyframed path (linear between keys, clamped). */
export const touchPos = (frame: number, path: TouchKey[]) => {
  const fs = path.map((k) => k.f);
  return {
    x: interpolate(frame, fs, path.map((k) => k.x), CLAMP),
    y: interpolate(frame, fs, path.map((k) => k.y), CLAMP),
  };
};

/**
 * Simulated fingertip: a soft white disc that fades in/out around its path,
 * presses down on taps and emits a ripple ring.
 */
export const Touch: React.FC<{frame: number; path: TouchKey[]; taps?: number[]; size?: number}> = ({
  frame,
  path,
  taps = [],
  size = 90,
}) => {
  const first = path[0].f;
  const last = path[path.length - 1].f;
  const vis = interpolate(frame, [first - 6, first, last, last + 8], [0, 1, 1, 0], CLAMP);
  if (vis <= 0) return null;
  const {x, y} = touchPos(frame, path);
  const press = taps.reduce((acc, t) => Math.max(acc, interpolate(frame, [t - 3, t, t + 5], [0, 1, 0], CLAMP)), 0);

  return (
    <div style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none', zIndex: 50}}>
      {taps.map((t) => {
        const r = interpolate(frame, [t, t + 18], [0, 1], CLAMP);
        if (r <= 0 || r >= 1) return null;
        const d = size * (1 + r * 1.8);
        return (
          <div
            key={t}
            style={{
              position: 'absolute',
              left: x - d / 2,
              top: y - d / 2,
              width: d,
              height: d,
              borderRadius: '50%',
              border: '3px solid rgba(255,255,255,0.9)',
              opacity: (1 - r) * vis,
              boxShadow: '0 0 12px rgba(255,255,255,0.6)',
            }}
          />
        );
      })}
      <div
        style={{
          position: 'absolute',
          left: x - size / 2,
          top: y - size / 2,
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.55) 45%, rgba(255,255,255,0) 72%)',
          boxShadow: '0 6px 20px rgba(60,40,30,0.18)',
          filter: 'blur(1.5px)',
          opacity: vis,
          transform: `scale(${1 - press * 0.15})`,
        }}
      />
    </div>
  );
};
