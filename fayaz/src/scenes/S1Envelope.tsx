import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {FloralCorner} from '../components/FloralCluster';
import {GoldText} from '../components/GoldText';
import {LightBurst} from '../components/LightBurst';
import {SparkleBurst, Twinkles} from '../components/Sparkles';
import {FONTS} from '../fonts';
import {BG_GRADIENT, C, CLAMP, WIDTH} from '../theme';

const W = 860;
const H = 560;
const LEFT = (WIDTH - W) / 2;
const TOP = 760;
const FLAP_H = H * 0.58;

// Irregular wax-seal outline
const sealPath = (() => {
  const pts: string[] = [];
  const n = 28;
  for (let i = 0; i <= n; i++) {
    const a = (Math.PI * 2 * i) / n;
    const r = 100 + Math.sin(i * 2.7) * 5 + Math.cos(i * 1.3) * 4;
    pts.push(`${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`);
  }
  return `M${pts.join(' L')} Z`;
})();

const WaxSeal: React.FC<{glow: number}> = ({glow}) => (
  <div style={{position: 'relative', width: 230, height: 230}}>
    <svg width={230} height={230} viewBox="-115 -115 230 230" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <defs>
        <radialGradient id="wax" cx="38%" cy="32%" r="75%">
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
      <path d={sealPath} fill="url(#wax)" style={{filter: `drop-shadow(0 6px 10px rgba(90,60,20,0.45)) drop-shadow(0 0 ${glow * 30}px rgba(255,220,140,${glow}))`}} />
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
        fontFamily: FONTS.script,
        fontSize: 60,
        color: '#7E5A1C',
        textShadow: '0 1px 0 rgba(255,240,190,0.7), 0 -1px 1px rgba(80,50,10,0.5)',
        paddingTop: 6,
      }}
    >
      F&amp;M
    </div>
  </div>
);

export const S1Envelope: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const enter = spring({frame, fps, config: {damping: 16, mass: 0.9}});
  const sealIn = spring({frame: frame - 12, fps, config: {damping: 9, stiffness: 120}});
  const glow = interpolate(frame, [30, 42, 54], [0, 0.9, 0.3], CLAMP);
  const crack = interpolate(frame, [52, 66], [0, 1], {...CLAMP, easing: Easing.in(Easing.quad)});
  const flap = interpolate(frame, [58, 88], [0, 180], {...CLAMP, easing: Easing.inOut(Easing.cubic)});
  const burst = interpolate(frame, [80, 118], [0, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});
  const cardRise = interpolate(frame, [84, 124], [0, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});
  const wash = interpolate(frame, [108, 132], [0, 0.85], CLAMP);
  const flapOpen = flap > 90;

  const flapLayer = (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: W,
        height: FLAP_H,
        transformOrigin: '50% 0%',
        transform: `perspective(1800px) rotateX(${flap}deg)`,
        zIndex: flapOpen ? 1 : 5,
      }}
    >
      <svg width={W} height={FLAP_H} viewBox={`0 0 ${W} ${FLAP_H}`} style={{overflow: 'visible'}}>
        <defs>
          <linearGradient id="flapFront" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FBF1E2" />
            <stop offset="100%" stopColor="#FFFBF4" />
          </linearGradient>
          <linearGradient id="flapLining" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.blush} />
            <stop offset="100%" stopColor={C.blushLight} />
          </linearGradient>
        </defs>
        <path
          d={`M0,0 L${W},0 L${W / 2 + 30},${FLAP_H - 14} Q${W / 2},${FLAP_H + 6} ${W / 2 - 30},${FLAP_H - 14} Z`}
          fill={flapOpen ? 'url(#flapLining)' : 'url(#flapFront)'}
          stroke={flapOpen ? C.gold : '#E6D6BE'}
          strokeWidth={flapOpen ? 3 : 2}
          style={{filter: flapOpen ? 'none' : 'drop-shadow(0 6px 8px rgba(140,100,70,0.22))'}}
        />
        <path
          d={`M26,10 L${W - 26},10 L${W / 2 + 24},${FLAP_H - 30} Q${W / 2},${FLAP_H - 14} ${W / 2 - 24},${FLAP_H - 30} Z`}
          fill="none"
          stroke={C.goldLight}
          strokeWidth={1.5}
          strokeOpacity={0.8}
        />
      </svg>
    </div>
  );

  return (
    <AbsoluteFill style={{background: BG_GRADIENT}}>
      <Twinkles seed="s1" count={16} start={0} />
      <FloralCorner corner="tl" size={520} delay={4} />
      <FloralCorner corner="br" size={520} delay={10} />
      <FloralCorner corner="tr" size={360} delay={16} />
      <FloralCorner corner="bl" size={360} delay={20} />

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 470,
          textAlign: 'center',
          opacity: interpolate(frame, [14, 34, 70, 90], [0, 1, 1, 0], CLAMP),
          fontFamily: FONTS.serif,
          fontStyle: 'italic',
          fontSize: 50,
          letterSpacing: 4,
          color: C.inkSoft,
        }}
      >
        You are invited
      </div>

      <LightBurst x={WIDTH / 2} y={TOP + 20} progress={burst} />

      {/* Envelope */}
      <div
        style={{
          position: 'absolute',
          left: LEFT,
          top: TOP,
          width: W,
          height: H,
          transform: `translateY(${(1 - enter) * 120}px) scale(${0.88 + 0.12 * enter})`,
          opacity: enter,
        }}
      >
        {/* inside / back */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, ${C.ivoryDeep}, #EBDCC5)`,
            borderRadius: 10,
            boxShadow: '0 30px 60px rgba(150,90,80,0.28), 0 8px 18px rgba(150,90,80,0.18)',
            zIndex: 0,
          }}
        />
        {flapOpen ? flapLayer : null}

        {/* card inside */}
        <div
          style={{
            position: 'absolute',
            left: 40,
            right: 40,
            top: 26,
            height: H - 60,
            zIndex: 2,
            transform: `translateY(${-cardRise * 300}px)`,
            background: `linear-gradient(180deg, ${C.paper}, ${C.ivory})`,
            borderRadius: 6,
            boxShadow: `inset 0 0 0 10px ${C.paper}, inset 0 0 0 12px ${C.gold}, inset 0 0 0 18px ${C.paper}, inset 0 0 0 19px ${C.goldLight}, 0 -6px 20px rgba(150,110,60,0.15)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: 40,
          }}
        >
          <div style={{fontFamily: FONTS.serif, fontSize: 30, letterSpacing: 10, color: C.inkSoft}}>
            THE NIKAH OF
          </div>
          <GoldText style={{fontFamily: FONTS.script, fontSize: 96, lineHeight: 1.3}}>Fayaz &amp; Muskan</GoldText>
        </div>

        {/* front pocket */}
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, zIndex: 3}}>
          <defs>
            <linearGradient id="pocketL" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#F7ECDB" />
              <stop offset="100%" stopColor="#FFF9EF" />
            </linearGradient>
            <linearGradient id="pocketR" x1="1" y1="0" x2="0" y2="0">
              <stop offset="0%" stopColor="#F4E7D3" />
              <stop offset="100%" stopColor="#FFF8EC" />
            </linearGradient>
            <linearGradient id="pocketB" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#F6EAD7" />
              <stop offset="100%" stopColor="#FFFCF6" />
            </linearGradient>
          </defs>
          <path d={`M0,0 L${W / 2 - 20},${H * 0.55} L0,${H} Z`} fill="url(#pocketL)" />
          <path d={`M${W},0 L${W / 2 + 20},${H * 0.55} L${W},${H} Z`} fill="url(#pocketR)" />
          <path
            d={`M0,${H} L${W / 2 - 40},${H * 0.5} Q${W / 2},${H * 0.44} ${W / 2 + 40},${H * 0.5} L${W},${H} Z`}
            fill="url(#pocketB)"
            stroke="#E7D7BF"
            strokeWidth={2}
          />
          <path
            d={`M30,${H - 14} L${W / 2 - 34},${H * 0.53} Q${W / 2},${H * 0.48} ${W / 2 + 34},${H * 0.53} L${W - 30},${H - 14}`}
            fill="none"
            stroke={C.goldLight}
            strokeWidth={1.5}
          />
        </svg>

        {!flapOpen ? flapLayer : null}

        {/* wax seal (cracks into two halves) */}
        {crack < 1 ? (
          <div
            style={{
              position: 'absolute',
              left: W / 2 - 115,
              top: FLAP_H - 130,
              width: 230,
              height: 230,
              zIndex: 6,
              transform: `scale(${sealIn * (1 + glow * 0.05)})`,
              opacity: 1 - crack,
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                clipPath: 'inset(0 50% 0 0)',
                transform: `translate(${-crack * 60}px, ${crack * 40}px) rotate(${-crack * 25}deg)`,
              }}
            >
              <WaxSeal glow={glow} />
            </div>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                clipPath: 'inset(0 0 0 50%)',
                transform: `translate(${crack * 60}px, ${crack * 40}px) rotate(${crack * 25}deg)`,
              }}
            >
              <WaxSeal glow={glow} />
            </div>
          </div>
        ) : null}
      </div>

      <SparkleBurst x={WIDTH / 2} y={TOP + 10} start={82} count={46} radius={700} duration={50} upward seed="env" />
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 42%, #FFFDF6 0%, ${C.ivory} 60%)`, opacity: wash}} />
    </AbsoluteFill>
  );
};
