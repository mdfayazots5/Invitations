export const WIDTH = 1080;
export const HEIGHT = 1920;
export const FPS = 30;
export const DURATION = 30 * FPS; // 900 frames

export const C = {
  blush: '#F4C9CF',
  blushDeep: '#E8A9B3',
  blushLight: '#FBE6E8',
  rose: '#C97B8A',
  ivory: '#FFF8EE',
  ivoryDeep: '#F3E6D2',
  paper: '#FFFBF5',
  gold: '#C9A24B',
  goldLight: '#E6C878',
  goldPale: '#F7EAC0',
  goldDeep: '#9C7A2E',
  ink: '#6B3743',
  inkSoft: '#8A5864',
  sage: '#A3B79D',
  sageDeep: '#768F72',
};

export const GOLD_GRADIENT =
  'linear-gradient(100deg, #8A6620 0%, #B38A34 22%, #D9B65E 38%, #EFD48A 46%, #CFA94F 56%, #A57D2C 74%, #8A6620 100%)';

export const CLAMP = {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
} as const;

export const BG_GRADIENT = `radial-gradient(ellipse 90% 70% at 50% 40%, ${C.paper} 0%, ${C.ivory} 40%, ${C.blushLight} 75%, ${C.blush} 100%)`;
