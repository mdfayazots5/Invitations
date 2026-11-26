import React from 'react';
import {interpolate} from 'remotion';
import {Touch} from '../../components/Touch';
import {D} from '../../data';
import {CLAMP, FONT, P, smallCaps} from '../../theme';
import {TOP} from '../layout';
import {useReveal} from '../useReveal';
import {useVideoFrame} from '../videoFrame';

const CARD = {left: 110, top: 470, width: 860};
const TAP = 1004;
// Centre of the "Joyfully accepts" pill, in section coordinates.
const PILL = {x: CARD.left + 60 + 175, y: CARD.top + 330};

export const Rsvp: React.FC = () => {
  const frame = useVideoFrame();
  const reveal = useReveal(TOP.rsvp);
  const fill = interpolate(frame, [TAP, TAP + 6], [0, 1], CLAMP);
  const field: React.CSSProperties = {
    textAlign: 'left',
    borderBottom: `1.5px solid ${P.goldLight}`,
    padding: '0 0 12px',
    fontFamily: FONT.serif,
    fontStyle: 'italic',
    fontSize: 34,
    color: P.muted,
    marginBottom: 34,
  };
  const pill = (active: number): React.CSSProperties => ({
    width: 350,
    height: 76,
    borderRadius: 999,
    border: `2px solid ${P.gold}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: FONT.serif,
    fontWeight: 600,
    fontSize: 30,
    color: P.brown,
    background: active ? `rgba(244,223,225,${active})` : P.ivory,
    boxShadow: active ? `0 0 0 ${active * 6}px rgba(231,184,190,0.35)` : 'none',
  });

  return (
    <div style={{position: 'absolute', inset: 0, background: P.page}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center'}}>
        <div style={reveal(0, 150, smallCaps)}>{D.labels.kindlyReply}</div>
        <div style={reveal(1, 200, {fontFamily: FONT.script, fontSize: 120, color: P.gold, lineHeight: 1.4})}>{D.labels.rsvp}</div>
      </div>
      <div
        style={reveal(2, CARD.top, {
          position: 'absolute',
          left: CARD.left,
          top: CARD.top,
          width: CARD.width,
          padding: '60px 60px 50px',
          borderRadius: 28,
          background: P.ivory,
          border: `1px solid ${P.gold}`,
          boxShadow: '0 24px 60px rgba(90,60,50,0.14)',
        })}
      >
        <div style={field}>{D.labels.yourName}</div>
        <div style={field}>{D.labels.guests}</div>
        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 10}}>
          <div style={pill(fill)}>{D.labels.accepts}</div>
          <div style={pill(0)}>{D.labels.declines}</div>
        </div>
        <div
          style={{
            marginTop: 44,
            height: 84,
            borderRadius: 999,
            background: 'linear-gradient(135deg, #A57D2C, #D9B65E 50%, #A57D2C)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...smallCaps,
            color: '#FFFFFF',
            textShadow: '0 1px 2px rgba(80,50,10,0.4)',
          }}
        >
          {D.labels.send}
        </div>
      </div>
      <div
        style={reveal(3, 1000, {
          position: 'absolute',
          left: 0,
          right: 0,
          top: 1000,
          textAlign: 'center',
          fontFamily: FONT.serif,
          fontStyle: 'italic',
          fontSize: 32,
          color: P.muted,
        })}
      >
        {D.labels.rsvpHint}
      </div>
      <Touch
        frame={frame}
        path={[
          {f: 994, x: PILL.x + 160, y: PILL.y + 260},
          {f: 1002, x: PILL.x, y: PILL.y},
          {f: 1010, x: PILL.x, y: PILL.y},
          {f: 1018, x: PILL.x + 180, y: PILL.y + 240},
        ]}
        taps={[TAP]}
      />
    </div>
  );
};
