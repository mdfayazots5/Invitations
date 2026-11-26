import React, {useMemo} from 'react';
import {Easing, interpolate, random, useCurrentFrame} from 'remotion';
import {C, CLAMP, HEIGHT, WIDTH} from '../theme';

/** Ornamental double gold border with corner flourishes, drawn on by `start`. */
export const GoldFrame: React.FC<{start?: number; duration?: number; inset?: number}> = ({
  start = 0,
  duration = 40,
  inset = 46,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [start, start + duration], [0, 1], {...CLAMP, easing: Easing.inOut(Easing.cubic)});
  const W = WIDTH;
  const H = HEIGHT;
  const corner = (
    <g>
      <path
        d="M0,70 C0,30 30,0 70,0 M18,92 C14,44 44,14 92,18 M30,30 m-9,0 a9,9 0 1,0 18,0 a9,9 0 1,0 -18,0"
        fill="none"
        stroke={C.gold}
        strokeWidth={2.5}
      />
      <path d="M95,0 L110,-8 L125,0 L110,8 Z" fill={C.gold} transform="translate(0 0)" />
      <path d="M0,95 L-8,110 L0,125 L8,110 Z" fill={C.gold} />
    </g>
  );
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      <rect
        x={inset}
        y={inset}
        width={W - inset * 2}
        height={H - inset * 2}
        fill="none"
        stroke={C.gold}
        strokeWidth={3}
        pathLength={1}
        strokeDasharray="1 1"
        strokeDashoffset={1 - p}
      />
      <rect
        x={inset + 16}
        y={inset + 16}
        width={W - (inset + 16) * 2}
        height={H - (inset + 16) * 2}
        fill="none"
        stroke={C.goldLight}
        strokeWidth={1.4}
        pathLength={1}
        strokeDasharray="1 1"
        strokeDashoffset={1 - p}
      />
      <g opacity={interpolate(p, [0.6, 1], [0, 1], CLAMP)}>
        <g transform={`translate(${inset + 30} ${inset + 30})`}>{corner}</g>
        <g transform={`translate(${W - inset - 30} ${inset + 30}) scale(-1 1)`}>{corner}</g>
        <g transform={`translate(${inset + 30} ${H - inset - 30}) scale(1 -1)`}>{corner}</g>
        <g transform={`translate(${W - inset - 30} ${H - inset - 30}) scale(-1 -1)`}>{corner}</g>
      </g>
    </svg>
  );
};

/** Small centred gold divider: line – diamond – line. */
export const Divider: React.FC<{width?: number; progress?: number; style?: React.CSSProperties}> = ({
  width = 420,
  progress = 1,
  style,
}) => {
  const half = (width / 2 - 26) * progress;
  return (
    <svg width={width} height={30} viewBox={`0 0 ${width} 30`} style={{display: 'block', margin: '0 auto', ...style}}>
      <line x1={width / 2 - 22 - half} y1={15} x2={width / 2 - 22} y2={15} stroke={C.gold} strokeWidth={2} />
      <line x1={width / 2 + 22} y1={15} x2={width / 2 + 22 + half} y2={15} stroke={C.gold} strokeWidth={2} />
      <g transform={`translate(${width / 2} 15) scale(${progress})`}>
        <path d="M0,-12 L12,0 L0,12 L-12,0 Z" fill="none" stroke={C.gold} strokeWidth={2} />
        <path d="M0,-5 L5,0 L0,5 L-5,0 Z" fill={C.gold} />
        <circle cx={-18} cy={0} r={2.5} fill={C.gold} />
        <circle cx={18} cy={0} r={2.5} fill={C.gold} />
      </g>
    </svg>
  );
};

/** Wrapper that fades and lifts its children in at `delay`. */
export const FadeInUp: React.FC<{
  delay: number;
  duration?: number;
  distance?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({delay, duration = 18, distance = 36, children, style}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [delay, delay + duration], [0, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});
  return (
    <div style={{opacity: p, transform: `translateY(${(1 - p) * distance}px)`, ...style}}>{children}</div>
  );
};

/** Blush petals drifting down. */
export const FallingPetals: React.FC<{count?: number; seed?: string; start?: number; speed?: number}> = ({
  count = 18,
  seed = 'pt',
  start = 0,
  speed = 1,
}) => {
  const frame = useCurrentFrame();
  const petals = useMemo(
    () =>
      Array.from({length: count}).map((_, i) => ({
        x: random(`${seed}x${i}`) * WIDTH,
        delay: random(`${seed}d${i}`) * 160,
        size: 18 + random(`${seed}s${i}`) * 22,
        fall: 4 + random(`${seed}f${i}`) * 4,
        sway: 30 + random(`${seed}w${i}`) * 60,
        spin: (random(`${seed}r${i}`) - 0.5) * 8,
        tone: [C.blushDeep, C.blush, '#F7D9DE', C.rose][i % 4],
      })),
    [count, seed],
  );
  const fade = interpolate(frame, [start, start + 15], [0, 1], CLAMP);
  return (
    <div style={{position: 'absolute', inset: 0, pointerEvents: 'none', opacity: fade}}>
      {petals.map((p, i) => {
        const t = (frame - start) * speed + p.delay;
        const y = -80 + ((t * p.fall) % (HEIGHT + 160));
        const x = p.x + Math.sin(t / 22 + i) * p.sway;
        return (
          <svg
            key={i}
            width={p.size}
            height={p.size * 1.3}
            viewBox="-10 -13 20 26"
            style={{
              position: 'absolute',
              left: x,
              top: y,
              transform: `rotate(${t * p.spin}deg) rotateX(${Math.sin(t / 15) * 60}deg)`,
              opacity: 0.85,
            }}
          >
            <path d="M0,-12 C8,-8 10,4 0,12 C-10,4 -8,-8 0,-12 Z" fill={p.tone} />
          </svg>
        );
      })}
    </div>
  );
};
