import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONTS} from '../fonts';
import {BG_GRADIENT, C, CLAMP} from '../theme';
import {FloralCorner} from './FloralCluster';
import {GoldText} from './GoldText';
import {Divider, FadeInUp} from './Ornaments';
import {Twinkles} from './Sparkles';

export type EventDetails = {
  title: string;
  day: string;
  date: string;
  hijri: string;
  time: string;
  venue: string;
  address: string;
};

const CARD = {left: 80, top: 330, width: 920, height: 1260};

/** Ivory card with gold frame listing one event (Nikah / Valima). */
export const EventCard: React.FC<{details: EventDetails; mirrored?: boolean; seed: string}> = ({
  details,
  mirrored = false,
  seed,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame, fps, config: {damping: 15, mass: 0.8}});
  const div1 = interpolate(frame, [18, 38], [0, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});
  const div2 = interpolate(frame, [44, 64], [0, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});
  const d = details;

  return (
    <AbsoluteFill style={{background: BG_GRADIENT}}>
      <Twinkles seed={seed} count={18} />
      <div
        style={{
          position: 'absolute',
          ...CARD,
          borderRadius: 18,
          background: `linear-gradient(180deg, ${C.paper} 0%, ${C.ivory} 100%)`,
          boxShadow: `inset 0 0 0 14px ${C.paper}, inset 0 0 0 17px ${C.gold}, inset 0 0 0 25px ${C.paper}, inset 0 0 0 26.5px ${C.goldLight}, 0 30px 70px rgba(160,95,90,0.25)`,
          transform: `translateY(${(1 - pop) * 80}px) scale(${0.94 + 0.06 * pop})`,
          opacity: pop,
          overflow: 'hidden',
        }}
      >
        <FloralCorner corner={mirrored ? 'tr' : 'tl'} size={330} delay={6} />
        <FloralCorner corner={mirrored ? 'bl' : 'br'} size={330} delay={12} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <FadeInUp delay={6}>
            <GoldText style={{fontFamily: FONTS.script, fontSize: 176, lineHeight: 1.25, padding: '0 30px'}}>
              {d.title}
            </GoldText>
          </FadeInUp>
          <Divider width={460} progress={div1} style={{margin: '0 auto 40px'}} />
          <FadeInUp delay={22}>
            <div style={{fontFamily: FONTS.serif, fontSize: 40, letterSpacing: 12, color: C.inkSoft, fontWeight: 500}}>
              {d.day.toUpperCase()}
            </div>
          </FadeInUp>
          <FadeInUp delay={28}>
            <div style={{fontFamily: FONTS.serif, fontSize: 70, fontWeight: 600, color: C.ink, marginTop: 8}}>
              {d.date}
            </div>
          </FadeInUp>
          <FadeInUp delay={34}>
            <div style={{fontFamily: FONTS.serif, fontStyle: 'italic', fontSize: 48, color: C.rose, marginTop: 4}}>
              {d.hijri}
            </div>
          </FadeInUp>
          <FadeInUp delay={40}>
            <div style={{fontFamily: FONTS.serif, fontSize: 62, fontWeight: 600, color: C.ink, marginTop: 30, letterSpacing: 2}}>
              {d.time}
            </div>
          </FadeInUp>
          <Divider width={300} progress={div2} style={{margin: '36px auto 30px'}} />
          <FadeInUp delay={52}>
            <GoldText style={{fontFamily: FONTS.serif, fontSize: d.venue.length > 20 ? 62 : 72, fontWeight: 700, letterSpacing: 1, padding: "0 60px"}}>
              {d.venue}
            </GoldText>
          </FadeInUp>
          <FadeInUp delay={60}>
            <div style={{fontFamily: FONTS.serif, fontStyle: 'italic', fontSize: 48, color: C.inkSoft, marginTop: 8}}>
              {d.address}
            </div>
          </FadeInUp>
        </div>
      </div>
    </AbsoluteFill>
  );
};
