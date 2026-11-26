import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Dove} from '../components/Dove';
import {FloralCorner, Garland} from '../components/FloralCluster';
import {GoldText} from '../components/GoldText';
import {Divider, FadeInUp, FallingPetals} from '../components/Ornaments';
import {Peony, Leaf} from '../components/Peony';
import {Twinkles} from '../components/Sparkles';
import {FONTS} from '../fonts';
import {BG_GRADIENT, C, CLAMP, WIDTH} from '../theme';

// Mihrab-style arch framing the couple's names, standing on the stage.
const ARCH =
  'M140,1520 L140,820 C140,590 380,470 540,360 C700,470 940,590 940,820 L940,1520';
const ARCH_INNER =
  'M168,1520 L168,826 C168,612 398,500 540,396 C682,500 912,612 912,826 L912,1520';

type Flight = {start: number; y0: number; y1: number; dir: 1 | -1; scale: number; speed: number};
const FLIGHTS: Flight[] = [
  {start: 6, y0: 520, y1: 260, dir: 1, scale: 1, speed: 1},
  {start: 20, y0: 640, y1: 420, dir: 1, scale: 0.75, speed: 1.15},
  {start: 40, y0: 380, y1: 180, dir: -1, scale: 0.85, speed: 1.05},
  {start: 70, y0: 600, y1: 330, dir: -1, scale: 0.65, speed: 1.25},
];

const FlyingDove: React.FC<Flight> = ({start, y0, y1, dir, scale, speed}) => {
  const frame = useCurrentFrame();
  const t = (frame - start) / (130 / speed);
  if (t < 0 || t > 1) return null;
  const xFrom = dir === 1 ? -260 : WIDTH + 60;
  const xTo = dir === 1 ? WIDTH + 60 : -260;
  const x = xFrom + (xTo - xFrom) * t;
  const y = y0 + (y1 - y0) * t + Math.sin(t * Math.PI * 3) * 30;
  const flap = (frame - start) * 0.55 * speed;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `scale(${dir * scale}, ${scale}) rotate(${-8 + Math.cos(flap) * 4}deg)`,
      }}
    >
      <Dove flap={flap} />
    </div>
  );
};

export const S3Names: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const archDraw = interpolate(frame, [0, 50], [0, 1], {...CLAMP, easing: Easing.inOut(Easing.cubic)});
  const stage = interpolate(frame, [4, 30], [0, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});
  const name1 = interpolate(frame, [26, 68], [0, 1], {...CLAMP, easing: Easing.inOut(Easing.sin)});
  const amp = spring({frame: frame - 64, fps, config: {damping: 10}});
  const name2 = interpolate(frame, [76, 118], [0, 1], {...CLAMP, easing: Easing.inOut(Easing.sin)});
  const urdu = interpolate(frame, [112, 146], [0, 1], {...CLAMP, easing: Easing.inOut(Easing.quad)});
  const apexBloom = interpolate(frame, [30, 70], [0, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});
  const drift = interpolate(frame, [0, 192], [0, -20]);

  const nameStyle: React.CSSProperties = {
    fontFamily: FONTS.script,
    fontSize: 104,
    lineHeight: 1.35,
    padding: '0 30px',
    whiteSpace: 'nowrap',
  };

  return (
    <AbsoluteFill style={{background: BG_GRADIENT}}>
      <Twinkles seed="s3" count={22} />

      {/* stage: arch + platform */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id="archGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFDF7" stopOpacity={0.95} />
            <stop offset="100%" stopColor={C.ivory} stopOpacity={0.6} />
          </linearGradient>
          <linearGradient id="step" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFBF3" />
            <stop offset="100%" stopColor={C.ivoryDeep} />
          </linearGradient>
        </defs>
        <path d={`${ARCH} Z`} fill="url(#archGlow)" opacity={archDraw} />
        <path d={ARCH} fill="none" stroke={C.gold} strokeWidth={5} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - archDraw} />
        <path d={ARCH_INNER} fill="none" stroke={C.goldLight} strokeWidth={2} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - archDraw} />
        <g opacity={stage} transform={`translate(0 ${(1 - stage) * 40})`}>
          <rect x={60} y={1520} width={960} height={70} rx={6} fill="url(#step)" stroke={C.gold} strokeWidth={3} />
          <rect x={20} y={1590} width={1040} height={80} rx={6} fill="url(#step)" stroke={C.gold} strokeWidth={3} />
          <line x1={80} y1={1540} x2={1000} y2={1540} stroke={C.goldLight} strokeWidth={1.5} />
          <line x1={40} y1={1612} x2={1040} y2={1612} stroke={C.goldLight} strokeWidth={1.5} />
        </g>
        {/* apex flowers */}
        <Leaf x={500} y={370} size={70} rotate={-70} grow={apexBloom} />
        <Leaf x={580} y={370} size={70} rotate={70} grow={apexBloom} />
        <Peony x={540} y={360} size={62} bloom={apexBloom} tone="blush" />
        <Peony x={478} y={392} size={36} bloom={apexBloom} tone="ivory" rotate={30} />
        <Peony x={602} y={392} size={36} bloom={apexBloom} tone="ivory" rotate={-30} />
      </svg>

      <FloralCorner corner="bl" size={460} delay={10} />
      <FloralCorner corner="br" size={460} delay={14} />
      <Garland width={1080} y={1680} count={11} delay={20} size={50} />

      {/* names */}
      <AbsoluteFill style={{alignItems: 'center', top: 640 + drift, textAlign: 'center'}}>
        <FadeInUp delay={14}>
          <div style={{fontFamily: FONTS.serif, fontSize: 34, letterSpacing: 10, color: C.inkSoft}}>
            THE NIKAH OF
          </div>
        </FadeInUp>
        <div style={{clipPath: `inset(-30% ${(1 - name1) * 100}% -30% 0)`, marginTop: 16}}>
          <GoldText style={nameStyle}>Mohammed Fayaz</GoldText>
        </div>
        <div
          style={{
            fontFamily: FONTS.script,
            fontSize: 96,
            color: C.rose,
            lineHeight: 0.9,
            transform: `scale(${amp})`,
            opacity: Math.min(1, amp),
          }}
        >
          &amp;
        </div>
        <div style={{clipPath: `inset(-30% ${(1 - name2) * 100}% -30% 0)`}}>
          <GoldText style={nameStyle}>Muskan Khanam</GoldText>
        </div>
        <Divider width={380} progress={urdu} style={{margin: '18px auto 6px'}} />
        <div
          style={{
            direction: 'rtl',
            unicodeBidi: 'isolate',
            clipPath: `inset(-40% 0 -40% ${(1 - urdu) * 100}%)`,
            fontFamily: FONTS.urdu,
            fontSize: 60,
            lineHeight: 2.3,
            color: C.ink,
          }}
        >
          محمد فیاض ہمراہ مسکان خانم
        </div>
      </AbsoluteFill>

      <FallingPetals seed="s3p" count={16} start={10} />
      {FLIGHTS.map((f, i) => (
        <FlyingDove key={i} {...f} />
      ))}
    </AbsoluteFill>
  );
};
