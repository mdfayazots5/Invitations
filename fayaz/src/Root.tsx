import React from 'react';
import {Composition} from 'remotion';
import {NikahInvite} from './NikahInvite';
import {DURATION, FPS, HEIGHT, WIDTH} from './theme';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="NikahInvite"
    component={NikahInvite}
    durationInFrames={DURATION}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
