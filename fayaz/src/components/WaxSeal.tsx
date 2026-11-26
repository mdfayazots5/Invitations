import React from 'react';
import {D} from '../data';
import {FONT} from '../theme';
import {Art} from './Art';

// Irregular melted-wax outline
const SEAL_PATH = (() => {
  const pts: string[] = [];
  const n = 32;
  for (let i = 0; i <= n; i++) {
    const a = (Math.PI * 2 * i) / n;
    const r = 100 + Math.sin(i * 2.7) * 5 + Math.cos(i * 1.3) * 4;
    pts.push(`${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`);
  }
  return `M${pts.join(' L')} Z`;
})();

const DrawnSeal: React.FC<{size: number}> = ({size}) => (
  <div style={{position: 'relative', width: size, height: size}}>
    <svg width={size} height={size} viewBox="-115 -115 230 230" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <defs>
        <radialGradient id="waxOuter" cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#FCE9A8" />
          <stop offset="35%" stopColor="#E2BE5E" />
          <stop offset="75%" stopColor="#B88A2E" />
          <stop offset="100%" stopColor="#8A6420" />
        </radialGradient>
        <radialGradient id="waxInner" cx="60%" cy="65%" r="70%">
          <stop offset="0%" stopColor="#E9C977" />
          <stop offset="100%" stopColor="#B48A35" />
        </radialGradient>
      </defs>
      <path d={SEAL_PATH} fill="url(#waxOuter)" style={{filter: 'drop-shadow(0 8px 12px rgba(90,60,20,0.45))'}} />
      <circle r={74} fill="url(#waxInner)" stroke="#8E6A24" strokeOpacity={0.55} strokeWidth={3} />
      <circle r={66} fill="none" stroke="#FFF0BE" strokeOpacity={0.55} strokeWidth={1.5} strokeDasharray="2 5" />
    </svg>
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: FONT.script,
        fontSize: size * 0.26,
        color: '#7E5A1C',
        textShadow: '0 1px 0 rgba(255,240,190,0.7), 0 -1px 1px rgba(80,50,10,0.5)',
        paddingTop: size * 0.03,
      }}
    >
      {D.monogram}
    </div>
  </div>
);

/** Gold wax seal: public/art/seal.png if present, otherwise drawn. */
export const WaxSeal: React.FC<{size?: number}> = ({size = 300}) => (
  <div style={{width: size, height: size}}>
    <Art name="seal.png" style={{objectFit: 'contain'}} fallback={<DrawnSeal size={size} />} />
  </div>
);
