import React from 'react';
import {Art} from '../../components/Art';
import {Leaf, Peony} from '../../components/Peony';
import {D} from '../../data';
import {FONT, P, smallCaps, urduStyle} from '../../theme';
import {TOP} from '../layout';
import {useReveal} from '../useReveal';

const CARD = {left: 90, top: 110, width: 900, height: 1300};

/** Fallback for art/garden-arch.jpg: a misty garden with a white classical arch and roses. */
const GardenBackdrop: React.FC = () => {
  const tones = ['blush', 'ivory', 'rose'] as const;
  return (
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #DCE7EF 0%, #EEF0EE 35%, #F7EEE8 70%, #F4E6DF 100%)'}}>
      <svg width={1080} height={1500} style={{position: 'absolute', inset: 0}}>
        <path d="M0,980 C200,900 360,930 540,960 C720,900 900,910 1080,950 L1080,1500 L0,1500 Z" fill="#CFD9CF" opacity={0.6} />
        <path d="M0,1060 C260,1000 520,1040 760,1020 C900,1010 1000,1030 1080,1040 L1080,1500 L0,1500 Z" fill="#B9C9B6" opacity={0.55} />
        {/* columns */}
        {[30, 990].map((x) => (
          <g key={x}>
            <rect x={x} y={260} width={60} height={1240} fill="#FFFFFF" opacity={0.9} />
            <rect x={x - 12} y={240} width={84} height={30} fill="#FFFFFF" />
            <line x1={x + 20} y1={280} x2={x + 20} y2={1500} stroke="#E8E2DA" strokeWidth={3} />
            <line x1={x + 40} y1={280} x2={x + 40} y2={1500} stroke="#E8E2DA" strokeWidth={3} />
          </g>
        ))}
        <path d="M60,250 C60,40 300,-40 540,-40 C780,-40 1020,40 1020,250" fill="none" stroke="#FFFFFF" strokeWidth={40} />
        {/* climbing roses */}
        {Array.from({length: 22}).map((_, i) => {
          const side = i % 2 === 0 ? 60 : 1020;
          const y = 300 + Math.floor(i / 2) * 110;
          return (
            <g key={i}>
              <Leaf x={side + (i % 2 ? -26 : 26)} y={y + 18} size={40} rotate={i % 2 ? -120 : 120} grow={1} />
              <Peony x={side + (i % 4 < 2 ? 10 : -10)} y={y} size={30 + (i % 3) * 8} bloom={1} tone={tones[i % 3]} rotate={i * 40} />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export const InvitationCard: React.FC = () => {
  const reveal = useReveal(TOP.invitation, 505);
  const y = (i: number) => CARD.top + 120 + i * 60; // approximate page offset per line for reveal timing
  const script = (size: number, color: string): React.CSSProperties => ({
    fontFamily: FONT.script,
    fontSize: size,
    color,
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
  });
  const body: React.CSSProperties = {fontFamily: FONT.serif, fontStyle: 'italic', fontSize: 34, color: P.brown, lineHeight: 1.4};

  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
      <Art name="garden-arch.jpg" fallback={<GardenBackdrop />} />
      <div
        style={{
          position: 'absolute',
          ...CARD,
          borderRadius: '520px 520px 30px 30px',
          background: `linear-gradient(180deg, ${P.ivory} 0%, ${P.page} 100%)`,
          border: `1px solid ${P.gold}`,
          boxShadow: `inset 0 0 0 12px ${P.ivory}, inset 0 0 0 13px ${P.goldLight}, 0 30px 70px rgba(80,60,50,0.18)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '160px 80px 60px',
        }}
      >
        <div style={reveal(0, y(0), {fontFamily: FONT.arabic, fontSize: 44, color: P.gold, direction: 'rtl', lineHeight: 1.8})}>
          {D.bismillah}
        </div>
        <div style={reveal(2, y(1), {...smallCaps, fontSize: 24, marginTop: 10})}>{D.labels.withJoy}</div>
        <div style={reveal(4, y(2), {...script(62, P.teal), marginTop: 18})}>{D.host}</div>
        <div style={reveal(6, y(3), {...body, marginTop: 10})}>{D.labels.solicits}</div>
        <div style={reveal(8, y(4), {...script(104, P.gold), marginTop: 22})}>{D.groom}</div>
        <div style={reveal(10, y(5), {...body, fontSize: 36})}>{D.labels.with}</div>
        <div style={reveal(12, y(6), script(104, P.gold))}>{D.bride}</div>
        <div style={reveal(14, y(7), {...body, fontSize: 32, marginTop: 6})}>
          {D.labels.daughterOf} {D.brideParents}
        </div>
        <div style={reveal(16, y(8), {...urduStyle, fontSize: 42, color: P.teal, marginTop: 16})}>{D.welcomeUrdu}</div>
      </div>
    </div>
  );
};
