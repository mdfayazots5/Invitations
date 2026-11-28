/**
 * Quality tiers. `?q=low|mid|high` forces one; otherwise the world starts on `mid` and a 1-second frame-time probe
 * after the intro tap moves it to `high` (fast device) or `low` (struggling device).
 *  - low:  DPR 1, half the particles, no vignette
 *  - mid:  DPR ≤ 1.5
 *  - high: DPR ≤ 2, vignette (CSS overlay, no extra GPU pass)
 */
export type Tier = 'low' | 'mid' | 'high';

const forced = new URLSearchParams(location.search).get('q');
export const forcedTier: Tier | null = forced === 'low' || forced === 'mid' || forced === 'high' ? forced : null;

export const TIER = {
  low: {dpr: 1, particles: 0.5},
  mid: {dpr: 1.5, particles: 1},
  high: {dpr: 2, particles: 1},
} as const;

/** Average frame time (ms) over ~1 s → tier. */
export const tierFromProbe = (avgMs: number): Tier => (avgMs < 17.5 ? 'high' : avgMs > 26 ? 'low' : 'mid');
