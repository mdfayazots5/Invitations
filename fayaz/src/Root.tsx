import React from 'react';
import {Composition} from 'remotion';
import {Invite, InviteProps} from './Invite';
import {DURATION, FPS, HEIGHT, WIDTH} from './theme';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Invite"
    component={Invite}
    durationInFrames={DURATION}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
    defaultProps={{renderReference: 0} satisfies InviteProps}
    // Captured ONCE per render and shared with every render tab, so the countdown is consistent.
    calculateMetadata={({props}) => ({props: {...props, renderReference: Date.now()}})}
  />
);
