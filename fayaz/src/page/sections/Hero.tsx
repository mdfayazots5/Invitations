import React from 'react';
import {Easing, interpolate} from 'remotion';
import {Art} from '../../components/Art';
import {Dove} from '../../components/Dove';
import {D} from '../../data';
import {CLAMP, FONT, SIDE_PAD, smallCaps, urduStyle, WIDTH} from '../../theme';
import {scrollAt} from '../layout';
import {useVideoFrame} from '../videoFrame';
import {HeroBackdrop} from './HeroBackdrop';

const SHADOW = '0 4px 24px rgba(40,60,90,.45)';
const TEXT_START = 165;

type Flight = {start: number; speed: number; y0: number; y1: number; scale: number; front?: boolean};
const DOVES: Flight[] = [
  {start: 150, speed: 1, y0: 260, y1: 140, scale: 0.9},
  {start: 175, speed: 0.8, y0: 640, y1: 470, scale: 1.15, front: true}, // crosses in front of the names
  {start: 205, speed: 1.2, y0: 420, y1: 230, scale: 0.7},
];

const FlyingDove: React.FC<Flight & {frame: number}> = ({frame, start, speed, y0, y1, scale}) => {
  const t = ((frame - start) * speed) / 130;
  if (t < 0 || t > 1) return null;
  const x = WIDTH + 80 - (WIDTH + 400) * t;
  const y = y0 + (y1 - y0) * t - Math.sin(t * Math.PI) * 80;
  const flapUp = Math.floor((frame - start) / 4) % 2 === 0;
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `scale(${-scale}, ${scale})`}}>
      <Art
        name="dove.png"
        style={{width: 220, height: 165, objectFit: 'contain', transform: `scaleY(${flapUp ? 1 : 0.7})`}}
        fallback={<Dove flap={flapUp ? 0 : Math.PI * 0.75} />}
      />
    </div>
  );
};

export const Hero: React.FC = () => {
  const frame = useVideoFrame();
  const scroll = scrollAt(frame);
  const r = (i: number): React.CSSProperties => {
    const s = TEXT_START + i * 8;
    const p = interpolate(frame, [s, s + 18], [0, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});
    return {opacity: p, transform: `translateY(${(1 - p) * 40}px)`};
  };
  const hint = interpolate(frame, [240, 255], [0, 1], CLAMP) * interpolate(scroll, [0, 200], [1, 0], CLAMP);
  const bounce = Math.abs(Math.sin(frame / 8)) * 14;
  const white: React.CSSProperties = {color: '#FFFFFF', textShadow: SHADOW};
  const name: React.CSSProperties = {...white, fontFamily: FONT.script, fontSize: 132, lineHeight: 1.15, whiteSpace: 'nowrap'};

  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
      {/* parallax: background travels at 0.6× the scroll speed */}
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${scroll * 0.4}px)`}}>
        <Art name="hero.jpg" fallback={<HeroBackdrop frame={frame} />} />
      </div>

      {DOVES.filter((d) => !d.front).map((d, i) => (
        <FlyingDove key={i} frame={frame} {...d} />
      ))}

      <div
        style={{
          position: 'absolute',
          left: SIDE_PAD,
          right: SIDE_PAD,
          top: 120,
          height: 1920 * 0.55,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <div style={{...r(0), ...white, fontFamily: FONT.arabic, fontSize: 64, lineHeight: 1.8, direction: 'rtl'}}>{D.bismillah}</div>
        <div style={{...r(1), ...smallCaps, color: '#FFFFFF', textShadow: SHADOW, marginTop: 6}}>{D.labels.withBlessings}</div>
        <div style={{...r(2), ...white, fontFamily: FONT.serif, fontWeight: 500, fontSize: 34, lineHeight: 1.35, marginTop: 10}}>
          {D.blessings}
        </div>
        <div style={{...r(3), ...name, marginTop: 34}}>{D.groom}</div>
        <div style={{...r(4), ...white, fontFamily: FONT.script, fontSize: 90, lineHeight: 0.9}}>{D.amp}</div>
        <div style={{...r(5), ...name}}>{D.bride}</div>
        <div style={{...r(6), ...urduStyle, ...white, fontSize: 46, marginTop: 4}}>{D.namesUrdu}</div>
        <div style={{...r(7), ...smallCaps, color: '#FFFFFF', textShadow: SHADOW, fontSize: 24, marginTop: 6}}>
          {D.labels.cordially}
        </div>
      </div>

      {DOVES.filter((d) => d.front).map((d, i) => (
        <FlyingDove key={i} frame={frame} {...d} />
      ))}

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 90,
          textAlign: 'center',
          opacity: hint,
          ...white,
          fontFamily: FONT.serif,
          fontStyle: 'italic',
          fontSize: 36,
        }}
      >
        {D.labels.scrollHint}
        <svg width={44} height={28} viewBox="0 0 44 28" style={{display: 'block', margin: '12px auto 0', transform: `translateY(${bounce}px)`, filter: 'drop-shadow(0 2px 6px rgba(40,60,90,.45))'}}>
          <path d="M4,6 L22,22 L40,6" fill="none" stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
};
