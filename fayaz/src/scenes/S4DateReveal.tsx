import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {GoldText} from '../components/GoldText';
import {Divider, FadeInUp, GoldFrame} from '../components/Ornaments';
import {ScratchCircle} from '../components/ScratchCircle';
import {Twinkles} from '../components/Sparkles';
import {FloralCorner} from '../components/FloralCluster';
import {FONTS} from '../fonts';
import {BG_GRADIENT, C, CLAMP} from '../theme';

const D = 262;

const Dot: React.FC<{show: number}> = ({show}) => (
  <div
    style={{
      width: 14,
      height: 14,
      borderRadius: '50%',
      background: C.gold,
      margin: '0 18px',
      opacity: show,
      transform: `scale(${show})`,
    }}
  />
);

export const S4DateReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const valStyle: React.CSSProperties = {fontFamily: FONTS.serif, fontWeight: 600, color: C.ink, lineHeight: 1};
  return (
    <AbsoluteFill style={{background: BG_GRADIENT}}>
      <Twinkles seed="s4" count={22} />
      <GoldFrame start={0} duration={1} />
      <FloralCorner corner="tl" size={340} delay={0} duration={25} />
      <FloralCorner corner="br" size={340} delay={4} duration={25} />

      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
        <FadeInUp delay={2}>
          <GoldText style={{fontFamily: FONTS.script, fontSize: 130, lineHeight: 1.3, padding: '0 30px'}}>Save the Date</GoldText>
        </FadeInUp>
        <Divider width={420} progress={interpolate(frame, [8, 28], [0, 1], CLAMP)} style={{margin: '10px auto 70px'}} />
        <div style={{display: 'flex', alignItems: 'center'}}>
          <ScratchCircle diameter={D} start={14}>
            <div style={{...valStyle, fontSize: 130}}>14</div>
          </ScratchCircle>
          <Dot show={interpolate(frame, [38, 46], [0, 1], CLAMP)} />
          <ScratchCircle diameter={D} start={34}>
            <div style={{...valStyle, fontSize: 84, letterSpacing: 6, paddingLeft: 6}}>DEC</div>
          </ScratchCircle>
          <Dot show={interpolate(frame, [58, 66], [0, 1], CLAMP)} />
          <ScratchCircle diameter={D} start={54}>
            <div style={{...valStyle, fontSize: 84, letterSpacing: 2}}>2026</div>
          </ScratchCircle>
        </div>
        <FadeInUp delay={80} distance={20}>
          <div
            style={{
              fontFamily: FONTS.serif,
              fontStyle: 'italic',
              fontSize: 48,
              color: C.inkSoft,
              marginTop: 70,
            }}
          >
            Monday
          </div>
        </FadeInUp>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
