import {CatmullRomCurve3, Color, Vector3} from 'three';

/**
 * The journey: one camera pose per page section ("station"), in section order.
 * The world runs along −z; every set keeps the centre corridor clear (|x| < 3) except where the camera
 * walks through an opening on purpose (the drapes, the middle arch, the floral arch).
 * Subjects sit in the lower half of the frame: the camera looks slightly up, so the top 40–45 % is clean sky.
 */
export type Palette = {
  top: string;
  mid: string;
  horizon: string;
  /** Sun glow colour and its height above the horizon (−1…1, 0 = on the horizon). */
  sun: string;
  sunY: number;
  /** Hemisphere light: sky and ground colours, intensity. */
  hemiSky: string;
  hemiGround: string;
  hemi: number;
  /** Directional sun light colour and intensity. */
  light: string;
  lightI: number;
  /** Fog distances (the fog colour is the horizon colour). */
  fogNear: number;
  fogFar: number;
  stars: number;
  clouds: number;
};

export type Station = {name: string; cam: [number, number, number]; look: [number, number, number]; palette: Palette};

const afternoon: Palette = {
  top: '#88B8E8',
  mid: '#B2D7EC',
  horizon: '#FFD8CD',
  sun: '#FFF1DC',
  sunY: 0.18,
  hemiSky: '#DDEBF7',
  hemiGround: '#F2D9C6',
  hemi: 1.6,
  light: '#FFE9D2',
  lightI: 1.6,
  fogNear: 18,
  fogFar: 70,
  stars: 0,
  clouds: 0.7,
};

export const STATIONS: Station[] = [
  {
    name: 'intro',
    cam: [0, 4.6, 9.4],
    look: [0, 4.6, 0],
    palette: {...afternoon, top: '#F1E2CE', mid: '#F6EBDD', horizon: '#FBE9D6', hemiSky: '#FFF3E2', hemi: 2, lightI: 1.2, fogNear: 30, fogFar: 90},
  },
  {name: 'hero', cam: [0, 2.0, -10], look: [0, 7.6, -46], palette: {...afternoon, fogNear: 14, fogFar: 46}},
  {
    name: 'invitation',
    cam: [0.6, 2.2, -34],
    look: [0, 9.5, -74],
    palette: {...afternoon, top: '#9CC6EC', mid: '#B2D7EC', horizon: '#F8DBD4', sunY: 0.15, fogFar: 64},
  },
  {
    name: 'urdu',
    cam: [-0.6, 2.4, -41],
    look: [0, 10, -76],
    palette: {...afternoon, top: '#A4C9EA', mid: '#C2DAEA', horizon: '#F8DBD4', sunY: 0.12, fogFar: 64},
  },
  {
    name: 'nikah',
    cam: [0, 2.6, -96],
    look: [0, 7.8, -130],
    palette: {
      ...afternoon,
      top: '#8FB3DC',
      mid: '#F4C9C0',
      horizon: '#FFC9A8',
      sun: '#FFE0B8',
      sunY: 0.05,
      hemiGround: '#F0C9B2',
      light: '#FFD2A8',
      lightI: 1.8,
      fogFar: 90,
      clouds: 0.9,
    },
  },
  {
    name: 'valima',
    cam: [0, 2.3, -184],
    look: [0, 5.4, -230],
    palette: {
      top: '#2F4A7A',
      mid: '#8A7FB0',
      horizon: '#F6B59A',
      sun: '#FFC59A',
      sunY: -0.02,
      hemiSky: '#8C95C4',
      hemiGround: '#E7B49C',
      hemi: 1.3,
      light: '#FFB98A',
      lightI: 1.1,
      fogNear: 16,
      fogFar: 66,
      stars: 0.25,
      clouds: 0.5,
    },
  },
  {
    name: 'countdown',
    cam: [0, 22, -222],
    look: [0, 27, -262],
    palette: {
      top: '#22355F',
      mid: '#4E5F93',
      horizon: '#C98FA0',
      sun: '#E9A58F',
      sunY: -0.08,
      hemiSky: '#6C77A8',
      hemiGround: '#B98A98',
      hemi: 1.2,
      light: '#FFC69A',
      lightI: 0.8,
      fogNear: 20,
      fogFar: 80,
      stars: 1,
      clouds: 0.35,
    },
  },
  {
    name: 'rsvp',
    cam: [1.2, 24, -234],
    look: [0, 28.5, -272],
    palette: {
      top: '#2A3D68',
      mid: '#5A6A9C',
      horizon: '#D79AA2',
      sun: '#E9A58F',
      sunY: -0.08,
      hemiSky: '#6C77A8',
      hemiGround: '#B98A98',
      hemi: 1.15,
      light: '#FFC69A',
      lightI: 0.75,
      fogNear: 20,
      fogFar: 80,
      stars: 0.85,
      clouds: 0.35,
    },
  },
  {
    name: 'venues',
    cam: [-1.2, 25.5, -246],
    look: [0, 29.5, -284],
    palette: {
      top: '#2C416D',
      mid: '#6271A0',
      horizon: '#DCA2A2',
      sun: '#F0B08E',
      sunY: -0.06,
      hemiSky: '#7480B0',
      hemiGround: '#C3949C',
      hemi: 1.2,
      light: '#FFC69A',
      lightI: 0.8,
      fogNear: 20,
      fogFar: 80,
      stars: 0.7,
      clouds: 0.4,
    },
  },
  {
    name: 'closing',
    cam: [0, 4.2, -300],
    look: [0, 12.5, -346],
    palette: {
      top: '#7FA6D6',
      mid: '#F7C9A0',
      horizon: '#FFD59A',
      sun: '#FFE7B0',
      sunY: 0.06,
      hemiSky: '#E8D8C8',
      hemiGround: '#F3CFA6',
      hemi: 1.6,
      light: '#FFD9A0',
      lightI: 2,
      fogNear: 30,
      fogFar: 120,
      stars: 0,
      clouds: 0.8,
    },
  },
];

export const camPath = new CatmullRomCurve3(
  STATIONS.map((s) => new Vector3(...s.cam)),
  false,
  'centripetal',
);
export const lookPath = new CatmullRomCurve3(
  STATIONS.map((s) => new Vector3(...s.look)),
  false,
  'centripetal',
);

/** Palette at progress p (0…STATIONS.length − 1), every field blended between the two nearest stations. */
const colorKeys = ['top', 'mid', 'horizon', 'sun', 'hemiSky', 'hemiGround', 'light'] as const;
const numKeys = ['sunY', 'hemi', 'lightI', 'fogNear', 'fogFar', 'stars', 'clouds'] as const;
export type MixedPalette = Record<(typeof colorKeys)[number], Color> & Record<(typeof numKeys)[number], number>;

const ca = new Color();
const cb = new Color();
export const paletteAt = (p: number, out: MixedPalette): MixedPalette => {
  const i = Math.max(0, Math.min(STATIONS.length - 2, Math.floor(p)));
  const f = Math.max(0, Math.min(1, p - i));
  const s = f * f * (3 - 2 * f);
  const A = STATIONS[i].palette;
  const B = STATIONS[i + 1].palette;
  for (const k of colorKeys) out[k].copy(ca.set(A[k])).lerp(cb.set(B[k]), s);
  for (const k of numKeys) out[k] = A[k] + (B[k] - A[k]) * s;
  return out;
};
export const newPalette = (): MixedPalette =>
  ({
    ...Object.fromEntries(colorKeys.map((k) => [k, new Color()])),
    ...Object.fromEntries(numKeys.map((k) => [k, 0])),
  }) as MixedPalette;
