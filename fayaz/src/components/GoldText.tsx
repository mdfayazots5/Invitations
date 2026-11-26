import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GOLD_GRADIENT} from '../theme';

/** Text filled with a gold gradient and a slow shimmer sweep. */
export const GoldText: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
  shimmerSpeed?: number;
}> = ({children, style, shimmerSpeed = 1}) => {
  const frame = useCurrentFrame();
  const pos = ((frame * 0.8 * shimmerSpeed) % 200) - 50; // sweep across, then wrap
  return (
    <span
      style={{
        display: 'inline-block',
        backgroundImage: GOLD_GRADIENT,
        backgroundSize: '250% 100%',
        backgroundPosition: `${100 - pos}% 50%`,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        WebkitTextFillColor: 'transparent',
        filter: 'drop-shadow(0 2px 2px rgba(120, 85, 20, 0.25))',
        ...style,
      }}
    >
      {children}
    </span>
  );
};
