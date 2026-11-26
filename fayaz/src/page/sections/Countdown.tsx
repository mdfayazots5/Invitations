import React from 'react';
import {interpolate} from 'remotion';
import {Art} from '../../components/Art';
import {D} from '../../data';
import {CLAMP, FONT, P, smallCaps} from '../../theme';
import {TOP} from '../layout';
import {useReveal} from '../useReveal';
import {useVideoFrame} from '../videoFrame';

const DIAL = 212;
const TARGET = new Date(D.countdownTarget).getTime();

const HillsStrip: React.FC = () => (
  <svg width={1080} height={300} viewBox="0 0 1080 300" style={{display: 'block'}}>
    <defs>
      <linearGradient id="cdSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={P.page} />
        <stop offset="100%" stopColor="#E6EEF3" />
      </linearGradient>
    </defs>
    <rect width="1080" height="300" fill="url(#cdSky)" />
    <path d="M0,170 C180,90 320,120 460,150 C620,80 780,90 900,140 C980,120 1040,125 1080,135 L1080,300 L0,300 Z" fill="#C9BDD8" opacity={0.8} />
    <path d="M0,210 C220,160 400,190 600,200 C800,170 940,180 1080,190 L1080,300 L0,300 Z" fill="#B7C8B4" opacity={0.85} />
    <rect y="250" width="1080" height="50" fill="#D7E4EC" />
  </svg>
);

/** Remaining time from the render moment (passed in once from calculateMetadata). */
const remaining = (renderReference: number, frame: number) => {
  const ms = Math.max(0, TARGET - renderReference - (frame / 30) * 1000);
  const s = Math.floor(ms / 1000);
  return [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60];
};

export const Countdown: React.FC<{renderReference: number}> = ({renderReference}) => {
  const frame = useVideoFrame();
  const reveal = useReveal(TOP.countdown);
  const values = remaining(renderReference, frame);
  const prev = remaining(renderReference, frame - 6);

  return (
    <div style={{position: 'absolute', inset: 0, background: P.page}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center'}}>
        <div style={reveal(0, 120, smallCaps)}>{D.labels.untilQubool}</div>
        <div style={reveal(1, 170, {fontFamily: FONT.script, fontSize: 110, color: P.gold, lineHeight: 1.4})}>
          {D.labels.countingDown}
        </div>
      </div>
      <div style={reveal(2, 420, {position: 'absolute', top: 420, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 20})}>
        {values.map((v, i) => {
          const changed = v !== prev[i];
          // flip: the new value drops in over 6 frames after each change
          const sinceTick = changed ? frame % 30 : 6;
          const flip = interpolate(sinceTick, [0, 6], [-26, 0], CLAMP);
          const flipOpacity = interpolate(sinceTick, [0, 6], [0.2, 1], CLAMP);
          return (
            <div
              key={i}
              style={{
                width: DIAL,
                height: DIAL,
                borderRadius: '50%',
                background: `radial-gradient(circle at 50% 40%, #FFFFFF 0%, ${P.ivory} 70%)`,
                boxShadow: `inset 0 0 0 5px ${P.ivory}, inset 0 0 0 7px ${P.gold}, inset 0 0 0 12px ${P.ivory}, inset 0 0 0 13px ${P.goldLight}, 0 12px 26px rgba(90,60,50,0.14)`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  fontFamily: FONT.serif,
                  fontWeight: 600,
                  fontSize: 80,
                  color: P.teal,
                  lineHeight: 1,
                  transform: `translateY(${flip}px)`,
                  opacity: flipOpacity,
                }}
              >
                {String(v).padStart(2, '0')}
              </div>
              <div style={{...smallCaps, fontSize: 18, letterSpacing: '0.2em', color: P.muted, marginTop: 8}}>
                {D.labels.dials[i]}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 300, overflow: 'hidden'}}>
        <Art name="hero.jpg" style={{objectPosition: '50% 75%'}} fallback={<HillsStrip />} />
      </div>
    </div>
  );
};
