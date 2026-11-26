import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {FloralCorner} from '../components/FloralCluster';
import {GoldText} from '../components/GoldText';
import {Divider, FadeInUp, FallingPetals, GoldFrame} from '../components/Ornaments';
import {SparkleBurst, Twinkles} from '../components/Sparkles';
import {FONTS} from '../fonts';
import {BG_GRADIENT, C, CLAMP, WIDTH} from '../theme';

export const S7Closing: React.FC = () => {
  const frame = useCurrentFrame();
  const write = interpolate(frame, [52, 88], [0, 1], {...CLAMP, easing: Easing.inOut(Easing.sin)});
  const div = interpolate(frame, [30, 50], [0, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});
  const breathe = 1 + Math.sin(frame / 18) * 0.008;

  return (
    <AbsoluteFill style={{background: BG_GRADIENT}}>
      <Twinkles seed="s7" count={30} />
      <GoldFrame start={0} duration={30} />
      <FloralCorner corner="tl" size={440} delay={0} />
      <FloralCorner corner="tr" size={360} delay={8} />
      <FloralCorner corner="bl" size={360} delay={12} />
      <FloralCorner corner="br" size={480} delay={4} />

      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '0 120px',
          transform: `scale(${breathe})`,
        }}
      >
        <FadeInUp delay={6}>
          <div style={{fontFamily: FONTS.serif, fontStyle: 'italic', fontSize: 70, color: C.ink, lineHeight: 1.3}}>
            Your presence and duas
          </div>
        </FadeInUp>
        <FadeInUp delay={16}>
          <div style={{fontFamily: FONTS.serif, fontStyle: 'italic', fontSize: 70, color: C.ink, lineHeight: 1.3}}>
            will be our greatest blessing
          </div>
        </FadeInUp>
        <Divider width={460} progress={div} style={{margin: '60px auto 60px'}} />
        <FadeInUp delay={40}>
          <div style={{fontFamily: FONTS.serif, fontSize: 38, letterSpacing: 9, color: C.inkSoft, fontWeight: 500}}>
            WITH BEST COMPLIMENTS FROM
          </div>
        </FadeInUp>
        <div style={{clipPath: `inset(-30% ${(1 - write) * 100}% -30% 0)`, marginTop: 10}}>
          <GoldText style={{fontFamily: FONTS.script, fontSize: 156, lineHeight: 1.35, padding: '0 30px', whiteSpace: 'nowrap'}}>
            Near &amp; Dear
          </GoldText>
        </div>
      </AbsoluteFill>

      <FallingPetals seed="s7p" count={18} start={0} />
      <SparkleBurst x={WIDTH / 2} y={1180} start={84} count={36} radius={560} duration={40} seed="end" />
    </AbsoluteFill>
  );
};
