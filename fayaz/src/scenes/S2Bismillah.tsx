import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {FloralCorner} from '../components/FloralCluster';
import {GoldText} from '../components/GoldText';
import {Divider, FadeInUp, GoldFrame} from '../components/Ornaments';
import {Twinkles} from '../components/Sparkles';
import {FONTS} from '../fonts';
import {BG_GRADIENT, C, CLAMP} from '../theme';

export const S2Bismillah: React.FC = () => {
  const frame = useCurrentFrame();
  const wipe = interpolate(frame, [12, 62], [0, 1], {...CLAMP, easing: Easing.inOut(Easing.quad)});
  const divider = interpolate(frame, [50, 75], [0, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});
  const zoom = interpolate(frame, [0, 162], [1.04, 1], CLAMP);

  return (
    <AbsoluteFill style={{background: BG_GRADIENT}}>
      <Twinkles seed="s2" count={20} />
      <GoldFrame start={0} duration={40} />
      <FloralCorner corner="tr" size={380} delay={6} />
      <FloralCorner corner="bl" size={380} delay={12} />

      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '0 110px',
          transform: `scale(${zoom})`,
        }}
      >
        <div
          style={{
            // Reveal right-to-left, the direction the Arabic is read.
            clipPath: `inset(-20% 0 -20% ${(1 - wipe) * 100}%)`,
            direction: 'rtl',
            unicodeBidi: 'isolate',
          }}
        >
          <GoldText style={{fontFamily: FONTS.arabic, fontSize: 104, lineHeight: 1.9, fontWeight: 700}}>
            بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
          </GoldText>
        </div>

        <Divider width={460} progress={divider} style={{margin: '30px auto 56px'}} />

        <FadeInUp delay={62}>
          <div style={{fontFamily: FONTS.serif, fontStyle: 'italic', fontSize: 54, color: C.inkSoft}}>
            With the blessings of
          </div>
        </FadeInUp>
        <FadeInUp delay={76}>
          <div
            style={{
              fontFamily: FONTS.serif,
              fontSize: 58,
              fontWeight: 500,
              color: C.ink,
              marginTop: 34,
              lineHeight: 1.25,
            }}
          >
            Late Mrs. &amp; Mr.
          </div>
        </FadeInUp>
        <FadeInUp delay={86}>
          <div
            style={{
              fontFamily: FONTS.serif,
              fontSize: 72,
              fontWeight: 600,
              color: C.ink,
              lineHeight: 1.2,
              marginTop: 6,
            }}
          >
            Abdul Khader Sahab
            <br />
            Pattedar
          </div>
        </FadeInUp>
        <FadeInUp delay={100}>
          <GoldText
            style={{
              fontFamily: FONTS.serif,
              fontStyle: 'italic',
              fontWeight: 600,
              fontSize: 54,
              marginTop: 22,
              letterSpacing: 2,
            }}
          >
            (Konayapally)
          </GoldText>
        </FadeInUp>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
