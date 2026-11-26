import React from 'react';
import {FloralCorner} from '../../components/FloralCluster';
import {Divider} from '../../components/Ornaments';
import {D} from '../../data';
import {FONT, P, smallCaps, urduStyle} from '../../theme';
import {firstVisibleFrame, TOP} from '../layout';
import {useReveal} from '../useReveal';
import {PAGE_START} from '../videoFrame';

export const Closing: React.FC = () => {
  const reveal = useReveal(TOP.closing);
  // FloralCorner animates off the local Sequence frame; start its bloom when the closing scrolls in.
  const bloomAt = firstVisibleFrame(TOP.closing + 900) - PAGE_START;

  return (
    <div style={{position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${P.page} 0%, ${P.blush} 100%)`}}>
      <div
        style={{
          position: 'absolute',
          left: 80,
          right: 80,
          top: 140,
          textAlign: 'center',
        }}
      >
        <div style={reveal(0, 160, {fontFamily: FONT.serif, fontStyle: 'italic', fontSize: 52, color: P.brown, lineHeight: 1.35})}>
          {D.labels.presence}
        </div>
        <div style={reveal(1, 300, {...urduStyle, fontSize: 42, color: P.teal, marginTop: 10})}>{D.welcomeUrdu}</div>
        <div style={reveal(2, 380)}>
          <Divider width={420} style={{margin: '24px auto 34px'}} />
        </div>
        <div style={reveal(3, 440, smallCaps)}>{D.labels.compliments}</div>
        <div style={reveal(4, 500, {fontFamily: FONT.script, fontSize: 130, color: P.gold, lineHeight: 1.35, whiteSpace: 'nowrap'})}>
          {D.labels.nearDear}
        </div>
        <div style={reveal(5, 640, {...urduStyle, fontSize: 44, color: P.teal})}>{D.fromUrdu}</div>
        <div style={reveal(6, 720, {fontFamily: FONT.serif, fontStyle: 'italic', fontSize: 34, color: P.muted, marginTop: 6})}>
          {D.labels.inshaAllah}
        </div>
      </div>
      <FloralCorner corner="bl" size={480} delay={bloomAt} />
      <FloralCorner corner="br" size={480} delay={bloomAt + 6} />
    </div>
  );
};
