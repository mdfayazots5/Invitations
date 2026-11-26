import React from 'react';
import {AbsoluteFill, Audio, getStaticFiles, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import './fonts';
import {Ambient} from './components/Ambient';
import {EnvelopeIntro} from './intro/EnvelopeIntro';
import {ScrollingPage} from './page/ScrollingPage';
import {PAGE_START} from './page/videoFrame';
import {CLAMP, DURATION, P} from './theme';

export type InviteProps = {renderReference: number};

const AUDIO = 'bismillah.mp3';

export const Invite: React.FC<InviteProps> = ({renderReference}) => {
  const frame = useCurrentFrame();
  const hasAudio = getStaticFiles().some((f) => f.name === AUDIO);
  const endFade = interpolate(frame, [DURATION - 10, DURATION - 1], [0, 1], CLAMP);

  return (
    <AbsoluteFill style={{background: '#FFFFFF'}}>
      <Sequence from={PAGE_START} name="ScrollingPage">
        <ScrollingPage renderReference={renderReference} />
      </Sequence>
      <Sequence from={0} durationInFrames={150} name="EnvelopeIntro">
        <EnvelopeIntro />
      </Sequence>
      <Ambient />
      <AbsoluteFill style={{background: P.ivory, opacity: endFade}} />
      {hasAudio ? (
        <Audio
          src={staticFile(AUDIO)}
          trimAfter={DURATION}
          volume={(f) =>
            interpolate(f, [0, 15], [0, 1], CLAMP) * interpolate(f, [DURATION - 45, DURATION], [1, 0], CLAMP)
          }
        />
      ) : null}
    </AbsoluteFill>
  );
};
