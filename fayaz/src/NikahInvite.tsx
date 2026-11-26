import React from 'react';
import {AbsoluteFill, Audio, getStaticFiles, interpolate, staticFile} from 'remotion';
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import './fonts';
import {S1Envelope} from './scenes/S1Envelope';
import {S2Bismillah} from './scenes/S2Bismillah';
import {S3Names} from './scenes/S3Names';
import {S4DateReveal} from './scenes/S4DateReveal';
import {S5Nikah} from './scenes/S5Nikah';
import {S6Valima} from './scenes/S6Valima';
import {S7Closing} from './scenes/S7Closing';
import {BG_GRADIENT, CLAMP, DURATION, FPS} from './theme';

// Each scene runs from its spec start until XFADE frames past its spec end, so the
// cross-fade into the next scene begins exactly on the spec boundary. Sum = 900 + 6*XFADE.
const XFADE = 12;
const SCENES: {sec: [number, number]; C: React.FC}[] = [
  {sec: [0, 4], C: S1Envelope},
  {sec: [4, 9], C: S2Bismillah},
  {sec: [9, 15], C: S3Names},
  {sec: [15, 18], C: S4DateReveal},
  {sec: [18, 22], C: S5Nikah},
  {sec: [22, 26], C: S6Valima},
  {sec: [26, 30], C: S7Closing},
];

const AUDIO_FILE = 'bismillah.mp3';

export const NikahInvite: React.FC = () => {
  const hasAudio = getStaticFiles().some((f) => f.name === AUDIO_FILE);

  return (
    <AbsoluteFill style={{background: BG_GRADIENT}}>
      <TransitionSeries>
        {SCENES.map(({sec, C: Scene}, i) => {
          const last = i === SCENES.length - 1;
          const frames = (sec[1] - sec[0]) * FPS + (last ? 0 : XFADE);
          return (
            <React.Fragment key={i}>
              <TransitionSeries.Sequence durationInFrames={frames}>
                <Scene />
              </TransitionSeries.Sequence>
              {last ? null : (
                <TransitionSeries.Transition
                  presentation={fade()}
                  timing={linearTiming({durationInFrames: XFADE})}
                />
              )}
            </React.Fragment>
          );
        })}
      </TransitionSeries>

      {hasAudio ? (
        <Audio
          src={staticFile(AUDIO_FILE)}
          trimAfter={DURATION}
          volume={(f) => interpolate(f, [DURATION - FPS, DURATION], [1, 0], CLAMP)}
        />
      ) : null}
    </AbsoluteFill>
  );
};
