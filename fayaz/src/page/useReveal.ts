import type React from 'react';
import {Easing, interpolate} from 'remotion';
import {CLAMP} from '../theme';
import {firstVisibleFrame} from './layout';
import {useVideoFrame} from './videoFrame';

/**
 * "Appear as you scroll". reveal(i, offsetY) fades and lifts an element in once its
 * page position (sectionTop + offsetY) enters the viewport, staggered 5 frames per child.
 * `minFrame` lets a section hold its reveal until a scripted beat.
 */
export const useReveal = (sectionTop: number, minFrame = 0) => {
  const frame = useVideoFrame();
  return (i: number, offsetY = 0, extra?: React.CSSProperties): React.CSSProperties => {
    const start = Math.max(minFrame, firstVisibleFrame(sectionTop + offsetY)) + i * 5;
    const p = interpolate(frame, [start, start + 18], [0, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});
    return {opacity: p, transform: `translateY(${(1 - p) * 40}px)`, ...extra};
  };
};
