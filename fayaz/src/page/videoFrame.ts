import {useCurrentFrame} from 'remotion';

// The page lives in <Sequence from={PAGE_START}>, so useCurrentFrame() is relative.
// Everything on the page is choreographed in absolute video frames, so convert once here.
export const PAGE_START = 135;
export const useVideoFrame = () => useCurrentFrame() + PAGE_START;
