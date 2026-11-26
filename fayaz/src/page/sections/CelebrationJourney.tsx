import React from 'react';
import {Easing, interpolate, spring} from 'remotion';
import {D} from '../../data';
import {CLAMP, FONT, P, smallCaps} from '../../theme';
import {TOP} from '../layout';
import {useReveal} from '../useReveal';
import {useVideoFrame} from '../videoFrame';

const LINE_TOP = 430;
const LINE_BOTTOM = 1010;
const NODES = [560, 840];

export const CelebrationJourney: React.FC = () => {
  const frame = useVideoFrame();
  const reveal = useReveal(TOP.journey);
  const draw = interpolate(frame, [625, 665], [0, 1], {...CLAMP, easing: Easing.inOut(Easing.cubic)});

  return (
    <div style={{position: 'absolute', inset: 0, background: P.page}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center'}}>
        <div style={reveal(0, 150, smallCaps)}>{D.labels.journey}</div>
        <div style={reveal(1, 200, {fontFamily: FONT.script, fontSize: 110, color: P.gold, lineHeight: 1.4})}>
          {D.labels.journeyTitle}
        </div>
      </div>

      <svg width={1080} height={1100} style={{position: 'absolute', inset: 0}}>
        <line
          x1={540}
          y1={LINE_TOP}
          x2={540}
          y2={LINE_BOTTOM}
          stroke={P.gold}
          strokeWidth={3}
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1 - draw}
        />
      </svg>

      {D.journey.map((entry, i) => {
        const [name, ...rest] = entry.split(' · ');
        const popAt = 640 + i * 18;
        const pop = spring({frame: frame - popAt, fps: 30, config: {damping: 12, stiffness: 180}});
        const slide = interpolate(frame, [popAt + 2, popAt + 22], [0, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});
        const left = i % 2 === 0;
        return (
          <React.Fragment key={entry}>
            <div
              style={{
                position: 'absolute',
                left: 540 - 22,
                top: NODES[i] - 22,
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: P.ivory,
                border: `3px solid ${P.gold}`,
                boxShadow: `0 0 0 6px ${P.blush}`,
                transform: `scale(${pop})`,
              }}
            >
              <div style={{position: 'absolute', inset: 9, borderRadius: '50%', background: P.gold}} />
            </div>
            <div
              style={{
                position: 'absolute',
                top: NODES[i] - 110,
                width: 400,
                [left ? 'right' : 'left']: 540 + 50,
                textAlign: left ? 'right' : 'left',
                opacity: slide,
                transform: `translateX(${(1 - slide) * (left ? -120 : 120)}px)`,
              }}
            >
              <div style={{fontFamily: FONT.script, fontSize: 84, color: P.teal, lineHeight: 1.15}}>{name}</div>
              {rest.map((line) => (
                <div key={line} style={{fontFamily: FONT.serif, fontSize: 32, color: P.brown, lineHeight: 1.35, fontWeight: 500}}>
                  {line}
                </div>
              ))}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};
