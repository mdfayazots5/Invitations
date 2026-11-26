import React from 'react';
import {useCurrentFrame} from 'remotion';

/** Radial golden rays with a soft bloom, centred on (x, y). `progress` 0..1 drives size/opacity. */
export const LightBurst: React.FC<{x: number; y: number; progress: number; size?: number}> = ({
  x,
  y,
  progress,
  size = 2400,
}) => {
  const frame = useCurrentFrame();
  if (progress <= 0) return null;
  const s = 0.15 + progress * 0.85;
  const op = Math.min(1, progress * 2.2);
  return (
    <div
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        pointerEvents: 'none',
        transform: `scale(${s})`,
        opacity: op,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          transform: `rotate(${frame * 0.4}deg)`,
          background:
            'repeating-conic-gradient(from 0deg, rgba(255,233,170,0.55) 0deg 3deg, rgba(255,233,170,0) 5deg 14deg)',
          WebkitMaskImage: 'radial-gradient(circle, black 0%, rgba(0,0,0,0.6) 25%, transparent 62%)',
          maskImage: 'radial-gradient(circle, black 0%, rgba(0,0,0,0.6) 25%, transparent 62%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(255,252,235,1) 0%, rgba(255,236,180,0.85) 10%, rgba(240,205,120,0.35) 26%, rgba(240,205,120,0) 48%)',
        }}
      />
    </div>
  );
};
