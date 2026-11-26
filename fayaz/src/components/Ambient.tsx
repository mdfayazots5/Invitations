import React from 'react';
import {random, useCurrentFrame} from 'remotion';
import {C, HEIGHT, WIDTH} from '../theme';

const PETALS = Array.from({length: 25}, (_, i) => ({
  x: random('petal-x' + i) * WIDTH,
  phase: random('petal-' + i) * (HEIGHT + 200),
  size: 16 + random('petal-s' + i) * 20,
  fall: 1.6 + random('petal-f' + i) * 1.8,
  sway: 25 + random('petal-w' + i) * 50,
  spin: (random('petal-r' + i) - 0.5) * 6,
  tone: [C.blushDeep, C.blush, '#F7D9DE', C.rose][i % 4],
}));

const SPARKS = Array.from({length: 30}, (_, i) => ({
  x: random('spark-x' + i) * WIDTH,
  y: random('spark-y' + i) * HEIGHT,
  size: 3 + random('spark-s' + i) * 5,
  speed: 0.06 + random('spark-v' + i) * 0.08,
  phase: random('spark-p' + i) * Math.PI * 2,
}));

/** Slow-falling blush petals and tiny gold sparkles across the whole video (deterministic). */
export const Ambient: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 40}}>
      {SPARKS.map((s, i) => {
        const tw = Math.max(0, Math.sin(frame * s.speed + s.phase));
        return (
          <div
            key={`s${i}`}
            style={{
              position: 'absolute',
              left: s.x,
              top: s.y,
              width: s.size,
              height: s.size,
              borderRadius: '50%',
              background: '#FFF1C4',
              boxShadow: `0 0 ${s.size * 2}px ${C.goldLight}`,
              opacity: tw * 0.85,
            }}
          />
        );
      })}
      {PETALS.map((p, i) => {
        const t = frame + p.phase / p.fall;
        const y = -60 + ((t * p.fall) % (HEIGHT + 120));
        const x = p.x + Math.sin(t / 26 + i) * p.sway;
        return (
          <svg
            key={`p${i}`}
            width={p.size}
            height={p.size * 1.3}
            viewBox="-10 -13 20 26"
            style={{
              position: 'absolute',
              left: x,
              top: y,
              opacity: 0.8,
              transform: `rotate(${t * p.spin}deg) rotateX(${Math.sin(t / 15) * 60}deg)`,
            }}
          >
            <path d="M0,-12 C8,-8 10,4 0,12 C-10,4 -8,-8 0,-12 Z" fill={p.tone} />
          </svg>
        );
      })}
    </div>
  );
};
