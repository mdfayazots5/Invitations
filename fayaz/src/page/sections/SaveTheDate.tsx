import React, {useId} from 'react';
import {interpolate, random} from 'remotion';
import {Touch, TouchKey} from '../../components/Touch';
import {D} from '../../data';
import {CLAMP, FONT, P, smallCaps} from '../../theme';
import {TOP} from '../layout';
import {useReveal} from '../useReveal';
import {useVideoFrame} from '../videoFrame';

const DISC = 260;
const GAP = 50;
const ROW_Y = 560; // disc top within the section
const ROW_X = (1080 - (DISC * 3 + GAP * 2)) / 2;
const WINDOWS: [number, number][] = [
  [355, 390],
  [390, 425],
  [425, 460],
];

// Zig-zag scratch path inside a disc (equal-length segments, so linear time == linear length).
const ZIG: [number, number][] = (() => {
  const rows = 5;
  const pts: [number, number][] = [];
  for (let i = 0; i <= rows; i++) {
    const y = DISC * 0.1 + (DISC * 0.8 * i) / rows;
    pts.push([i % 2 === 0 ? DISC * 0.08 : DISC * 0.92, y]);
  }
  return pts;
})();
const ZIG_D = `M${ZIG.map((p) => p.join(',')).join(' L')}`;

const discLeft = (i: number) => ROW_X + i * (DISC + GAP);

const ScratchDisc: React.FC<{i: number; frame: number}> = ({i, frame}) => {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [s, e] = WINDOWS[i];
  const p = interpolate(frame, [s, e], [0, 1], CLAMP);
  // When ~70% is scratched, the remaining foil fades out over 8 frames.
  const t70 = s + (e - s) * 0.7;
  const foil = interpolate(frame, [t70, t70 + 8], [1, 0], CLAMP);
  const reveal = interpolate(frame, [t70, t70 + 10], [0, 1], CLAMP);
  const item = D.scratch[i];

  return (
    <div style={{position: 'absolute', left: discLeft(i), top: ROW_Y, width: DISC}}>
      <div
        style={{
          position: 'relative',
          width: DISC,
          height: DISC,
          borderRadius: '50%',
          background: `radial-gradient(circle at 50% 40%, #FFFFFF 0%, ${P.ivory} 60%, ${P.page} 100%)`,
          boxShadow: `inset 0 0 0 6px ${P.ivory}, inset 0 0 0 8px ${P.goldLight}, inset 0 0 0 14px ${P.ivory}, inset 0 0 0 15px ${P.goldLight}, 0 14px 30px rgba(120,80,60,0.18)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            fontFamily: FONT.serif,
            fontWeight: 600,
            fontSize: 96,
            color: P.teal,
            lineHeight: 1,
            transform: `scale(${0.9 + 0.1 * reveal})`,
          }}
        >
          {item.value}
        </div>
        {foil > 0 ? (
          <svg width={DISC} height={DISC} style={{position: 'absolute', inset: 0, opacity: foil}}>
            <defs>
              <radialGradient id={`g${id}`} cx="38%" cy="32%" r="78%">
                <stop offset="0%" stopColor="#F6DC96" />
                <stop offset="55%" stopColor="#D1A24C" />
                <stop offset="100%" stopColor="#A27325" />
              </radialGradient>
              <mask id={`m${id}`}>
                <rect width={DISC} height={DISC} fill="white" />
                <path
                  d={ZIG_D}
                  pathLength={1}
                  fill="none"
                  stroke="black"
                  strokeWidth={70}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="1 1"
                  strokeDashoffset={1 - p}
                />
              </mask>
            </defs>
            <g mask={`url(#m${id})`}>
              <circle cx={DISC / 2} cy={DISC / 2} r={DISC / 2} fill={`url(#g${id})`} />
              {Array.from({length: 70}).map((_, k) => {
                const a = random(`sp${i}a${k}`) * Math.PI * 2;
                const rr = Math.sqrt(random(`sp${i}r${k}`)) * (DISC / 2 - 6);
                return (
                  <circle
                    key={k}
                    cx={DISC / 2 + Math.cos(a) * rr}
                    cy={DISC / 2 + Math.sin(a) * rr}
                    r={0.8 + random(`sp${i}s${k}`) * 1.6}
                    fill={k % 3 ? '#FFF3CC' : '#8A5E1C'}
                    opacity={0.55}
                  />
                );
              })}
              <circle cx={DISC / 2} cy={DISC / 2} r={DISC / 2 - 12} fill="none" stroke="#FFF1C4" strokeOpacity={0.6} strokeWidth={2} strokeDasharray="3 7" />
            </g>
          </svg>
        ) : null}
      </div>
      <div style={{...smallCaps, color: P.muted, fontSize: 24, letterSpacing: '0.2em', marginTop: 22, textAlign: 'center', whiteSpace: 'nowrap', opacity: reveal}}>
        {item.caption}
      </div>
    </div>
  );
};

/** Touch path that follows each disc's zig-zag during its window. */
const TOUCH_PATH: TouchKey[] = WINDOWS.flatMap(([s, e], i) =>
  ZIG.map(([x, y], k) => ({
    f: s + ((e - s) * 0.92 * k) / (ZIG.length - 1),
    x: discLeft(i) + x,
    y: ROW_Y + y,
  })),
);

const TouchSparkles: React.FC<{frame: number}> = ({frame}) => {
  const active = WINDOWS.some(([s, e]) => frame >= s && frame <= e);
  if (!active) return null;
  return (
    <>
      {Array.from({length: 8}).map((_, k) => {
        const age = k * 2;
        const f = frame - age;
        const idx = TOUCH_PATH.findIndex((tk) => tk.f > f);
        const a = TOUCH_PATH[Math.max(0, idx - 1)];
        const b = TOUCH_PATH[Math.max(0, idx)] ?? a;
        const mix = b.f === a.f ? 0 : (f - a.f) / (b.f - a.f);
        const x = a.x + (b.x - a.x) * Math.min(1, Math.max(0, mix));
        const y = a.y + (b.y - a.y) * Math.min(1, Math.max(0, mix));
        const dx = (random(`ts${frame}${k}x`) - 0.5) * 60;
        const dy = (random(`ts${frame}${k}y`) - 0.5) * 60 - age * 3;
        const sz = 6 + random(`ts${k}`) * 8;
        return (
          <div
            key={k}
            style={{
              position: 'absolute',
              left: x + dx - sz / 2,
              top: y + dy - sz / 2,
              width: sz,
              height: sz,
              borderRadius: '50%',
              background: '#FFF4CF',
              boxShadow: '0 0 10px #F2CF79',
              opacity: 1 - k / 8,
            }}
          />
        );
      })}
    </>
  );
};

export const SaveTheDate: React.FC = () => {
  const frame = useVideoFrame();
  const reveal = useReveal(TOP.saveTheDate);
  return (
    <div style={{position: 'absolute', inset: 0, background: P.page}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center'}}>
        <div style={reveal(0, 230, smallCaps)}>{D.labels.saveTheDate}</div>
        <div style={reveal(1, 200, {fontFamily: FONT.script, fontSize: 110, color: P.gold, lineHeight: 1.4})}>
          {D.labels.scratch}
        </div>
      </div>
      <div style={reveal(2, ROW_Y, {position: 'absolute', inset: 0})}>
        {[0, 1, 2].map((i) => (
          <ScratchDisc key={i} i={i} frame={frame} />
        ))}
      </div>
      <TouchSparkles frame={frame} />
      <Touch frame={frame} path={TOUCH_PATH} taps={WINDOWS.map(([s]) => s + 1)} />
    </div>
  );
};
