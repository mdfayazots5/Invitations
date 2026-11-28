import S from '../invite.settings.json';

/**
 * Timings and music for this invite, from ../invite.settings.json.
 * The Admin site edits that file and deploys it; values are read at build time, so a change goes live after a deploy.
 */
export type InviteSettings = {
  autoAdvance: boolean;
  scratchDelayMs: number;
  startDelayMs: number;
  glideMs: number;
  defaultHoldMs: number;
  replayHeroHoldMs: number;
  pages: {id: string; label: string; holdMs: number}[];
  music: {enabled: boolean; file: string; title: string; volume: number; fadeInSec: number; startAtSec: number; loop: boolean};
};

export const SETTINGS = S as InviteSettings;

/** Seconds a page is held during the auto-advance (from the settings; `fallback` if the page isn't listed). */
export const holdOf = (id: string, fallback: number) => SETTINGS.pages.find((p) => p.id === id)?.holdMs ?? fallback;
