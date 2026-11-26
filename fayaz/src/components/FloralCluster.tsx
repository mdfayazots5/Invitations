import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {CLAMP} from '../theme';
import {Leaf, Peony} from './Peony';

type Corner = 'tl' | 'tr' | 'bl' | 'br';

const ease = Easing.out(Easing.cubic);

/**
 * A cluster of peonies and leaves that blooms into a corner of its parent.
 * Drawn for the top-left corner and mirrored for the others.
 */
export const FloralCorner: React.FC<{
  corner: Corner;
  size?: number;
  delay?: number;
  duration?: number;
  sway?: boolean;
}> = ({corner, size = 560, delay = 0, duration = 40, sway = true}) => {
  const frame = useCurrentFrame();
  const p = (d: number) =>
    interpolate(frame, [delay + d, delay + d + duration], [0, 1], {...CLAMP, easing: ease});
  const flipX = corner === 'tr' || corner === 'br';
  const flipY = corner === 'bl' || corner === 'br';
  const swayDeg = sway ? Math.sin((frame + delay * 3) / 40) * 1.2 : 0;

  return (
    <div
      style={{
        position: 'absolute',
        width: size,
        height: size,
        [flipY ? 'bottom' : 'top']: 0,
        [flipX ? 'right' : 'left']: 0,
        transform: `scale(${flipX ? -1 : 1}, ${flipY ? -1 : 1}) rotate(${swayDeg}deg)`,
        transformOrigin: 'center',
        pointerEvents: 'none',
        filter: 'drop-shadow(0 8px 14px rgba(150, 80, 90, 0.18))',
      }}
    >
      <svg viewBox="0 0 600 600" width={size} height={size} style={{overflow: 'visible'}}>
        <Leaf x={260} y={170} size={120} rotate={70} grow={p(0)} />
        <Leaf x={170} y={250} size={115} rotate={160} grow={p(2)} />
        <Leaf x={420} y={90} size={90} rotate={95} grow={p(6)} />
        <Leaf x={90} y={420} size={90} rotate={175} grow={p(6)} />
        <Leaf x={330} y={260} size={80} rotate={130} grow={p(10)} />
        <Leaf x={40} y={180} size={70} rotate={-40} grow={p(8)} />
        <Peony x={150} y={150} size={150} bloom={p(0)} tone="blush" rotate={10} />
        <Peony x={360} y={95} size={98} bloom={p(6)} tone="ivory" rotate={-20} />
        <Peony x={95} y={370} size={104} bloom={p(9)} tone="rose" rotate={30} />
        <Peony x={300} y={290} size={68} bloom={p(14)} tone="blush" rotate={50} />
        <Peony x={500} y={40} size={42} bloom={p(18)} tone="rose" rotate={5} />
        <Peony x={40} y={520} size={44} bloom={p(20)} tone="ivory" rotate={15} />
      </svg>
    </div>
  );
};

/** A horizontal garland of small peonies, e.g. along the front of the stage. */
export const Garland: React.FC<{
  width: number;
  y: number;
  count?: number;
  delay?: number;
  size?: number;
}> = ({width, y, count = 9, delay = 0, size = 46}) => {
  const frame = useCurrentFrame();
  const tones = ['blush', 'ivory', 'rose'] as const;
  return (
    <svg
      width={width}
      height={size * 3}
      viewBox={`0 0 ${width} ${size * 3}`}
      style={{position: 'absolute', left: 0, top: y - size * 1.5, overflow: 'visible'}}
    >
      {Array.from({length: count}).map((_, i) => {
        const x = (width / (count - 1)) * i;
        const d = delay + Math.abs(i - (count - 1) / 2) * 4;
        const b = interpolate(frame, [d, d + 30], [0, 1], {...CLAMP, easing: ease});
        return (
          <g key={i}>
            <Leaf x={x - size * 0.6} y={size * 1.6} size={size * 0.8} rotate={-110} grow={b} />
            <Leaf x={x + size * 0.6} y={size * 1.6} size={size * 0.8} rotate={110} grow={b} />
            <Peony
              x={x}
              y={size * 1.5 + (i % 2 ? 6 : -6)}
              size={size * (i % 2 ? 0.85 : 1)}
              bloom={b}
              tone={tones[i % 3]}
              rotate={i * 23}
            />
          </g>
        );
      })}
    </svg>
  );
};
