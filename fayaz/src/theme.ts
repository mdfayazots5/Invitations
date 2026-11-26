import type React from 'react';
import {Easing} from 'remotion';

export const WIDTH = 1080;
export const HEIGHT = 1920;
export const FPS = 30;
export const DURATION = 36 * FPS; // 1080 frames

// Palette from nikah-video-prompt.md
export const P = {
  ivory: '#FFFDF9',
  page: '#FBF6F2',
  blush: '#F4DFE1',
  rose: '#E7B8BE',
  gold: '#B88A3E',
  goldLight: '#E3C27A',
  teal: '#1F5257',
  brown: '#3D2A22',
  muted: '#7A6258',
};

// Legacy colour names still used by the reusable SVG components (peony, dove, sparkles…)
export const C = {
  blush: '#F4C9CF',
  blushDeep: '#E8A9B3',
  blushLight: '#FBE6E8',
  rose: '#C97B8A',
  ivory: P.ivory,
  ivoryDeep: '#F3E6D2',
  paper: '#FFFBF5',
  gold: P.gold,
  goldLight: P.goldLight,
  goldPale: '#F7EAC0',
  goldDeep: '#8E6526',
  ink: P.brown,
  inkSoft: P.muted,
  sage: '#A3B79D',
  sageDeep: '#768F72',
};

export const GOLD_GRADIENT =
  'linear-gradient(100deg, #8A6620 0%, #B38A34 22%, #D9B65E 38%, #EFD48A 46%, #CFA94F 56%, #A57D2C 74%, #8A6620 100%)';

export const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const SCROLL_EASE = Easing.bezier(0.65, 0, 0.35, 1);

export const SIDE_PAD = 80;

export const FONT = {
  script: '"Great Vibes"',
  serif: '"Cormorant Garamond"',
  arabic: '"Amiri"',
  // No generic fallback on purpose: Nastaliq must never silently fall back.
  urdu: '"Noto Nastaliq Urdu"',
};

export const smallCaps: React.CSSProperties = {
  fontFamily: FONT.serif,
  fontWeight: 600,
  fontSize: 28,
  letterSpacing: '0.28em',
  textTransform: 'uppercase',
  color: P.gold,
};

export const urduStyle: React.CSSProperties = {
  fontFamily: FONT.urdu,
  direction: 'rtl',
  unicodeBidi: 'isolate',
  lineHeight: 2.2,
};
