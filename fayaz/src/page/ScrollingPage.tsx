import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import {D} from '../data';
import {CLAMP, HEIGHT, P} from '../theme';
import {H, scrollAt, SectionId, TOP} from './layout';
import {CelebrationJourney} from './sections/CelebrationJourney';
import {Closing} from './sections/Closing';
import {Countdown} from './sections/Countdown';
import {EventCard} from './sections/EventCard';
import {Hero} from './sections/Hero';
import {InvitationCard} from './sections/InvitationCard';
import {LaceBand} from './sections/LaceBand';
import {Rsvp} from './sections/Rsvp';
import {SaveTheDate} from './sections/SaveTheDate';
import {PAGE_START, useVideoFrame} from './videoFrame';

const Section: React.FC<{id: SectionId; scroll: number; children: React.ReactNode}> = ({id, scroll, children}) => {
  // Skip sections well outside the viewport (cheaper renders; reveals are frame-based so nothing is lost).
  const top = TOP[id];
  const visible = top + H[id] > scroll - 400 && top < scroll + HEIGHT + 400;
  return (
    <div style={{position: 'absolute', left: 0, top, width: 1080, height: H[id], overflow: 'hidden'}}>
      {visible ? children : null}
    </div>
  );
};

/** One tall web page, scrolled by a keyframed translateY. */
export const ScrollingPage: React.FC<{renderReference: number}> = ({renderReference}) => {
  const frame = useVideoFrame();
  const scroll = scrollAt(frame);
  // Hero fades in from white with a blur-to-focus (135–165).
  const enter = interpolate(frame, [PAGE_START, PAGE_START + 30], [0, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});
  const [nikah, valima] = D.events;

  return (
    <AbsoluteFill style={{background: '#FFFFFF'}}>
      <AbsoluteFill
        style={{
          background: P.page,
          opacity: enter,
          filter: enter < 1 ? `blur(${(1 - enter) * 24}px)` : undefined,
          transform: `scale(${1.08 - 0.08 * enter})`,
          overflow: 'hidden',
        }}
      >
        <div style={{position: 'absolute', left: 0, top: 0, width: 1080, transform: `translateY(${-scroll}px)`}}>
          <Section id="hero" scroll={scroll}>
            <Hero />
          </Section>
          <Section id="lace" scroll={scroll}>
            <LaceBand />
          </Section>
          <Section id="saveTheDate" scroll={scroll}>
            <SaveTheDate />
          </Section>
          <Section id="invitation" scroll={scroll}>
            <InvitationCard />
          </Section>
          <Section id="journey" scroll={scroll}>
            <CelebrationJourney />
          </Section>
          <Section id="nikah" scroll={scroll}>
            <EventCard event={nikah} art="event-nikah.jpg" sectionTop={TOP.nikah} />
          </Section>
          <Section id="valima" scroll={scroll}>
            <EventCard event={valima} art="event-valima.jpg" sectionTop={TOP.valima} evening />
          </Section>
          <Section id="countdown" scroll={scroll}>
            <Countdown renderReference={renderReference} />
          </Section>
          <Section id="rsvp" scroll={scroll}>
            <Rsvp />
          </Section>
          <Section id="closing" scroll={scroll}>
            <Closing />
          </Section>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
