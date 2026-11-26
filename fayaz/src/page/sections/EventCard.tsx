import React from 'react';
import {Art} from '../../components/Art';
import {Leaf, Peony} from '../../components/Peony';
import {D, EventInfo} from '../../data';
import {FONT, P, smallCaps, urduStyle} from '../../theme';
import {useReveal} from '../useReveal';
import {useVideoFrame} from '../videoFrame';

const CARD_W = 940;
const ILLU_H = 480;

/** Fallback illustration: Islamic arch with gold trim, swinging lanterns, peonies at the base. */
const ArchIllustration: React.FC<{evening: boolean; frame: number}> = ({evening, frame}) => {
  const bg = evening
    ? 'linear-gradient(180deg, #F2CED3 0%, #F7DCDC 55%, #FBE9E2 100%)'
    : 'linear-gradient(180deg, #CFE0EE 0%, #E3ECF3 55%, #F5F1EC 100%)';
  const tones = ['blush', 'ivory', 'rose'] as const;
  const arch = 'M250,480 L250,250 C250,140 380,70 470,30 C560,70 690,140 690,250 L690,480';
  return (
    <div style={{position: 'absolute', inset: 0, background: bg}}>
      {evening ? (
        <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 35%, rgba(255,214,150,0.55) 0%, rgba(255,214,150,0) 60%)'}} />
      ) : null}
      <svg width={CARD_W} height={ILLU_H} style={{position: 'absolute', inset: 0}}>
        <path d={`${arch} Z`} fill="#FFFDF8" opacity={0.92} />
        <path d={arch} fill="none" stroke={P.gold} strokeWidth={6} />
        <path d="M272,480 L272,256 C272,158 392,94 470,58 C548,94 668,158 668,256 L668,480" fill="none" stroke={P.goldLight} strokeWidth={2} />
        {/* hanging lanterns */}
        {[150, 470, 790].map((x, i) => {
          const len = i === 1 ? 150 : 110;
          const swing = Math.sin(frame / 18 + i * 1.7) * 3;
          return (
            <g key={x} transform={`translate(${x} 0) rotate(${swing})`}>
              <line x1={0} y1={0} x2={0} y2={len} stroke={P.gold} strokeWidth={2} />
              <circle cx={0} cy={len + 40} r={evening ? 70 : 45} fill="#FFE2A0" opacity={evening ? 0.4 : 0.2} />
              <path d={`M-24,${len + 10} L24,${len + 10} L30,${len + 62} L-30,${len + 62} Z`} fill={evening ? '#FFD98A' : '#F8E2A8'} stroke={P.gold} strokeWidth={2.5} />
              <path d={`M-14,${len} L14,${len} L24,${len + 10} L-24,${len + 10} Z`} fill={P.gold} />
              <path d={`M-30,${len + 62} L30,${len + 62} L0,${len + 84} Z`} fill={P.gold} />
              <line x1={0} y1={len + 14} x2={0} y2={len + 58} stroke={P.gold} strokeWidth={1.5} />
            </g>
          );
        })}
        {/* peonies along the base */}
        {Array.from({length: 9}).map((_, i) => {
          const x = 30 + i * 110;
          return (
            <g key={i}>
              <Leaf x={x - 30} y={ILLU_H - 10} size={50} rotate={-75} grow={1} />
              <Leaf x={x + 30} y={ILLU_H - 10} size={50} rotate={75} grow={1} />
              <Peony x={x} y={ILLU_H - 30 + (i % 2) * 16} size={i % 2 ? 44 : 56} bloom={1} tone={tones[i % 3]} rotate={i * 37} />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export const EventCard: React.FC<{event: EventInfo; art: string; sectionTop: number; evening?: boolean}> = ({
  event,
  art,
  sectionTop,
  evening = false,
}) => {
  const frame = useVideoFrame();
  const reveal = useReveal(sectionTop, 0);
  const label: React.CSSProperties = {...smallCaps, fontSize: 24};
  const value: React.CSSProperties = {fontFamily: FONT.serif, fontWeight: 600, fontSize: 40, color: P.brown, lineHeight: 1.3};
  const sub: React.CSSProperties = {fontFamily: FONT.serif, fontStyle: 'italic', fontSize: 28, color: P.muted, lineHeight: 1.3};

  return (
    <div style={{position: 'absolute', inset: 0, background: P.page}}>
      <div
        style={{
          position: 'absolute',
          left: (1080 - CARD_W) / 2,
          top: 35,
          width: CARD_W,
          height: 1180,
          borderRadius: 26,
          overflow: 'hidden',
          background: P.ivory,
          border: `1px solid ${P.gold}`,
          boxShadow: '0 24px 60px rgba(90,60,50,0.16)',
          ...reveal(0, 100),
        }}
      >
        <div style={{position: 'relative', height: ILLU_H, overflow: 'hidden'}}>
          <Art name={art} fallback={<ArchIllustration evening={evening} frame={frame} />} />
        </div>
        <div style={{textAlign: 'center', padding: '24px 70px 0'}}>
          <div style={reveal(2, 560, {fontFamily: FONT.script, fontSize: 120, color: P.gold, lineHeight: 1.1})}>{event.name}</div>
          <div style={reveal(3, 640, {...urduStyle, fontSize: 44, color: P.teal, lineHeight: 1.9})}>{event.urdu}</div>
          <div style={reveal(4, 720, {display: 'flex', justifyContent: 'center', gap: 60, marginTop: 18})}>
            <div style={{flex: 1, borderRight: `1px solid ${P.goldLight}`, paddingRight: 30}}>
              <div style={label}>{D.labels.date}</div>
              <div style={value}>
                {event.day}, {event.date}
              </div>
              <div style={sub}>{event.hijri}</div>
            </div>
            <div style={{width: 230}}>
              <div style={label}>{D.labels.time}</div>
              <div style={value}>{event.time}</div>
              <div style={sub}>{event.note}</div>
            </div>
          </div>
          <div style={reveal(5, 880, {marginTop: 34})}>
            <div style={label}>{D.labels.venue}</div>
            <div style={{...value, fontSize: 46}}>{event.venue}</div>
            <div style={sub}>{event.address}</div>
          </div>
          <div style={reveal(6, 1000, {marginTop: 30})}>
            <div
              style={{
                display: 'inline-block',
                padding: '14px 46px',
                borderRadius: 999,
                border: `2px solid ${P.gold}`,
                ...smallCaps,
                fontSize: 24,
              }}
            >
              {D.labels.viewMap}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
