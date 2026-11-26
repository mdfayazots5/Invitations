import {interpolate} from 'remotion';
import {CLAMP, DURATION, HEIGHT, SCROLL_EASE} from '../theme';

// Section heights (px) from the spec. Order matters.
export const SECTIONS = [
  ['hero', 1920],
  ['lace', 60],
  ['saveTheDate', 1100],
  ['invitation', 1500],
  ['journey', 1100],
  ['nikah', 1250],
  ['valima', 1250],
  ['countdown', 1000],
  ['rsvp', 1100],
  ['closing', 1400],
] as const;

export type SectionId = (typeof SECTIONS)[number][0];

export const TOP = {} as Record<SectionId, number>;
export const H = {} as Record<SectionId, number>;
let acc = 0;
for (const [id, h] of SECTIONS) {
  TOP[id] = acc;
  H[id] = h;
  acc += h;
}
export const PAGE_HEIGHT = acc; // 11680
const MAX_SCROLL = PAGE_HEIGHT - HEIGHT;

// Scroll moves: [startFrame, endFrame, target]. Between moves the page holds still.
// Frames are absolute video frames (the page appears at 135).
const MOVES: [number, number, number][] = [
  [300, 345, TOP.saveTheDate - 120],
  [465, 510, TOP.invitation],
  [585, 625, TOP.journey],
  [690, 730, TOP.nikah],
  [790, 830, TOP.valima],
  [880, 915, TOP.countdown],
  [960, 995, TOP.rsvp],
  [1020, 1050, Math.min(TOP.closing, MAX_SCROLL)], // clamp so the viewport never shows empty page
];

export const scrollAt = (frame: number): number => {
  let y = 0;
  for (const [a, b, target] of MOVES) {
    if (frame <= a) return y;
    if (frame < b) return interpolate(frame, [a, b], [y, target], {...CLAMP, easing: SCROLL_EASE});
    y = target;
  }
  return y;
};

// When does a page-Y position first enter the viewport? Precomputed once.
const SCROLL_TABLE = Array.from({length: DURATION + 1}, (_, f) => scrollAt(f));
export const firstVisibleFrame = (pageY: number, viewportFraction = 0.88): number => {
  for (let f = 0; f < SCROLL_TABLE.length; f++) {
    if (pageY < SCROLL_TABLE[f] + HEIGHT * viewportFraction) return f;
  }
  return DURATION;
};
