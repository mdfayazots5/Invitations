import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, useCurrentFrame} from 'remotion';
import {Art} from '../components/Art';
import {Damask} from '../components/Damask';
import {FloralCorner} from '../components/FloralCluster';
import {Touch} from '../components/Touch';
import {WaxSeal} from '../components/WaxSeal';
import {CLAMP, HEIGHT, WIDTH} from '../theme';

const W = WIDTH;
const VY = Math.round(HEIGHT * 0.62); // flap point (1190)
const SEAL = 300;
const RAY_CENTER = {x: W / 2, y: 880};

const GLITTER = Array.from({length: 40}, (_, i) => {
  const t = random('gl-t' + i);
  const left = random('gl-side' + i) < 0.5;
  return {
    // start on the seam (the V edges)
    x: left ? t * (W / 2) : W - t * (W / 2),
    y: t * VY,
    delay: 48 + random('gl-d' + i) * 40,
    drift: (random('gl-x' + i) - 0.5) * 120,
    fall: 180 + random('gl-f' + i) * 420,
    size: 5 + random('gl-s' + i) * 9,
  };
});

const Peonies: React.FC<{corner: 'tr' | 'bl'; frame: number}> = ({corner, frame}) => (
  <div
    style={{
      position: 'absolute',
      [corner === 'tr' ? 'top' : 'bottom']: -40,
      [corner === 'tr' ? 'right' : 'left']: -40,
      width: 560,
      height: 560,
      transform: `rotate(${Math.sin(frame / 22 + (corner === 'tr' ? 0 : 2)) * 2}deg)`,
      transformOrigin: corner === 'tr' ? '100% 0%' : '0% 100%',
      zIndex: 8,
    }}
  >
    <Art
      name="peony-cluster.png"
      style={{objectFit: 'contain', transform: corner === 'bl' ? 'rotate(180deg)' : undefined}}
      fallback={<FloralCorner corner={corner} size={560} delay={0} duration={1} sway={false} />}
    />
  </div>
);

export const EnvelopeIntro: React.FC = () => {
  const frame = useCurrentFrame();

  const sealSquash = interpolate(frame, [34, 37, 42], [1, 0.94, 1], CLAMP);
  const glowT = (frame % 30) / 30;
  const flap = interpolate(frame, [45, 95], [0, 180], {...CLAMP, easing: Easing.inOut(Easing.cubic)});
  const flapOpen = flap > 90;
  const rays = interpolate(frame, [95, 130], [0, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});
  const flash = interpolate(frame, [130, 140], [0, 1], CLAMP);
  const out = interpolate(frame, [142, 150], [1, 0], CLAMP);

  const flapEl = (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: W,
        height: VY + SEAL / 2,
        transformOrigin: '50% 0%',
        transform: `perspective(1600px) rotateX(${flap}deg)`,
        zIndex: flapOpen ? 1 : 6,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          height: VY,
          clipPath: `polygon(0 0, 100% 0, 50% 100%)`,
          filter: flapOpen ? 'none' : 'drop-shadow(0 10px 14px rgba(120,90,60,0.25))',
        }}
      >
        {flapOpen ? (
          <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #E9DCC6, #F2E8D8)'}} />
        ) : (
          <Art name="envelope.jpg" fallback={<Damask width={W} height={VY} base="#FBF4E8" />} />
        )}
      </div>
      {/* flap edge highlight */}
      <svg width={W} height={VY} style={{position: 'absolute', inset: 0}}>
        <path d={`M0,0 L${W / 2},${VY} L${W},0`} fill="none" stroke="#D9C4A0" strokeWidth={3} opacity={flapOpen ? 0.3 : 0.9} />
      </svg>
      {/* seal rides on the flap point */}
      {!flapOpen ? (
        <div
          style={{
            position: 'absolute',
            left: W / 2 - SEAL / 2,
            top: VY - SEAL / 2,
            width: SEAL,
            height: SEAL,
            transform: `scale(${sealSquash})`,
          }}
        >
          {frame < 45 ? (
            <div
              style={{
                position: 'absolute',
                inset: -10,
                borderRadius: '50%',
                border: '6px solid rgba(240,205,120,0.9)',
                boxShadow: '0 0 30px rgba(240,205,120,0.8)',
                transform: `scale(${1 + glowT * 0.25})`,
                opacity: 0.6 * (1 - glowT),
              }}
            />
          ) : null}
          <WaxSeal size={SEAL} />
        </div>
      ) : null}
    </div>
  );

  return (
    <AbsoluteFill style={{opacity: out, overflow: 'hidden'}}>
      {/* inside of the envelope */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #F6EEDF 0%, #E8DAC2 100%)'}} />

      {/* golden light rays from behind the seal */}
      {rays > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: RAY_CENTER.x - 900,
            top: RAY_CENTER.y - 900,
            width: 1800,
            height: 1800,
            transform: `scale(${0.2 + rays * 2.3}) rotate(${rays * 20}deg)`,
            zIndex: 2,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background:
                'repeating-conic-gradient(from 0deg, rgba(255,226,150,0.75) 0deg 4deg, rgba(255,226,150,0) 7.5deg 15deg)',
              WebkitMaskImage: 'radial-gradient(circle, black 0%, rgba(0,0,0,0.5) 30%, transparent 65%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              transform: `scale(${0.3 + rays * 0.7})`,
              background:
                'radial-gradient(circle, #FFFFFF 0%, rgba(255,246,214,0.95) 12%, rgba(250,220,150,0.5) 28%, rgba(250,220,150,0) 50%)',
            }}
          />
        </div>
      ) : null}

      {flapOpen ? flapEl : null}

      {/* pocket: left, right, bottom panels */}
      <div style={{position: 'absolute', inset: 0, zIndex: 4}}>
        {[
          {clip: `polygon(0 0, ${((W / 2 + 20) / W) * 100}% ${(VY - 40) / 19.2}%, 0 100%)`, shade: 'linear-gradient(90deg, rgba(0,0,0,0) 60%, rgba(120,90,60,0.08))'},
          {clip: `polygon(100% 0, ${((W / 2 - 20) / W) * 100}% ${(VY - 40) / 19.2}%, 100% 100%)`, shade: 'linear-gradient(270deg, rgba(0,0,0,0) 60%, rgba(120,90,60,0.08))'},
          {clip: `polygon(0 100%, 50% ${(VY - 150) / 19.2}%, 100% 100%)`, shade: 'linear-gradient(0deg, rgba(0,0,0,0) 70%, rgba(120,90,60,0.1))'},
        ].map((p, i) => (
          <div key={i} style={{position: 'absolute', inset: 0, clipPath: p.clip, filter: 'drop-shadow(0 -4px 8px rgba(0,0,0,0.1))'}}>
            <Art name="envelope.jpg" fallback={<Damask width={W} height={HEIGHT} base={i === 2 ? '#FCF6EC' : '#F9F1E3'} />} />
            <div style={{position: 'absolute', inset: 0, background: p.shade}} />
          </div>
        ))}
        <svg width={W} height={HEIGHT} style={{position: 'absolute', inset: 0}}>
          <path d={`M0,${HEIGHT} L${W / 2},${VY - 150} L${W},${HEIGHT}`} fill="none" stroke="#D9C4A0" strokeWidth={2.5} />
        </svg>
      </div>

      {!flapOpen ? flapEl : null}

      {/* glitter spilling from the seam */}
      <div style={{position: 'absolute', inset: 0, zIndex: 7}}>
        {GLITTER.map((g, i) => {
          const t = interpolate(frame, [g.delay, g.delay + 45], [0, 1], CLAMP);
          if (t <= 0 || t >= 1) return null;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: g.x + g.drift * t,
                top: g.y + g.fall * t * t,
                width: g.size,
                height: g.size,
                borderRadius: '50%',
                background: i % 3 ? '#F3D688' : '#FFF6D8',
                boxShadow: '0 0 10px rgba(240,200,110,0.9)',
                opacity: interpolate(t, [0, 0.15, 0.8, 1], [0, 1, 1, 0]),
              }}
            />
          );
        })}
      </div>

      <Peonies corner="tr" frame={frame} />
      <Peonies corner="bl" frame={frame} />

      <Touch
        frame={frame}
        path={[
          {f: 24, x: 780, y: 1560},
          {f: 34, x: W / 2 + 10, y: VY + 12},
          {f: 40, x: W / 2 + 10, y: VY + 12},
          {f: 52, x: 820, y: 1500},
        ]}
        taps={[35]}
      />

      <AbsoluteFill style={{background: '#FFFFFF', opacity: flash, zIndex: 60}} />
    </AbsoluteFill>
  );
};
