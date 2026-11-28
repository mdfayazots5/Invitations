import {C} from './invite.config';
import {SETTINGS} from './settings';

const M = SETTINGS.music;

const FADE_IN = M.fadeInSec; // s: first start, on the tap (Admin: fade-in)
const FADE_RESUME = 0.6; // s: when the guest presses play again

/**
 * Fixed music toggle. Hidden automatically if the track can't be loaded.
 * The song never starts at full volume: it rises from silence over FADE_IN seconds.
 * iPhone Safari ignores `audio.volume`, so the fade runs through a Web Audio gain node;
 * where Web Audio is missing, it steps `audio.volume` instead.
 *
 * iPhone silent switch: Web Audio is muted by the ringer switch unless the page asks for the
 * "playback" audio session (Safari 17+). On older iPhones without that API we skip Web Audio and
 * play the plain <audio> element, which ignores the switch: hearing the song matters more than the fade.
 * The song pauses when the guest leaves the page (switches app, takes a call) and fades back in on return.
 */
type AudioSessionNav = Navigator & {audioSession?: {type: string}};
const nav = navigator as AudioSessionNav;
if (nav.audioSession) {
  try {
    nav.audioSession.type = 'playback';
  } catch {
    /* not allowed here: fine */
  }
}
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
/** Web Audio is safe unless this is an older iPhone that can't opt out of the silent switch. */
const canUseWebAudio = !isIOS || !!nav.audioSession;

export const createMusic = () => {
  // Admin: music off → no download, no button
  if (!M.enabled) return {start: () => undefined};
  const audio = new Audio();
  // With a start offset, loop by hand so every repeat starts at the offset too.
  audio.loop = M.loop && M.startAtSec <= 0;
  audio.preload = 'auto';
  audio.src = `/${M.file}`;
  if (M.startAtSec > 0) {
    audio.addEventListener('loadedmetadata', () => (audio.currentTime = M.startAtSec), {once: true});
    if (M.loop)
      audio.addEventListener('ended', () => {
        audio.currentTime = M.startAtSec;
        void audio.play();
      });
  }

  const btn = document.createElement('button');
  btn.className = 'music paused';
  btn.type = 'button';
  btn.setAttribute('aria-label', C.ui.musicPlay);
  btn.innerHTML = `<svg width="26" height="22" viewBox="0 0 26 22" aria-hidden="true">
    <g fill="#E9CF8A"><rect class="bar" x="2" y="4" width="3" height="16" rx="1.5"/><rect class="bar" x="8" y="1" width="3" height="19" rx="1.5"/>
    <rect class="bar" x="14" y="6" width="3" height="14" rx="1.5"/><rect class="bar" x="20" y="3" width="3" height="17" rx="1.5"/></g>
    <line class="mute" x1="2" y1="20" x2="24" y2="2" stroke="#F3EBDD" stroke-width="2" stroke-linecap="round"/></svg>`;
  btn.hidden = true;
  document.body.appendChild(btn);

  const sync = () => {
    btn.classList.toggle('paused', audio.paused);
    btn.setAttribute('aria-label', audio.paused ? C.ui.musicPlay : C.ui.musicPause);
  };
  audio.addEventListener('play', sync);
  audio.addEventListener('pause', sync);
  audio.addEventListener('error', () => {
    btn.remove();
  });

  // Built lazily inside the first tap (browsers only allow audio to start from a gesture).
  let ctx: AudioContext | null = null;
  let gain: GainNode | null = null;
  const setupGraph = () => {
    if (ctx || !canUseWebAudio) return;
    const AC = window.AudioContext ?? (window as unknown as {webkitAudioContext?: typeof AudioContext}).webkitAudioContext;
    if (!AC) return;
    try {
      ctx = new AC();
      gain = ctx.createGain();
      gain.gain.value = 0;
      ctx.createMediaElementSource(audio).connect(gain).connect(ctx.destination);
    } catch {
      ctx = null;
      gain = null;
    }
  };

  let rampRaf = 0;
  const fadeIn = (seconds: number) => {
    if (ctx && gain) {
      void ctx.resume();
      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(0.0001, now);
      // Exponential rise sounds even to the ear (a linear one jumps loud at the start).
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, M.volume), now + seconds);
      return;
    }
    cancelAnimationFrame(rampRaf);
    audio.volume = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / (seconds * 1000));
      audio.volume = k * k * M.volume; // ease-in, up to the Admin volume
      if (k < 1) rampRaf = requestAnimationFrame(step);
    };
    rampRaf = requestAnimationFrame(step);
  };

  const play = (seconds: number) => {
    setupGraph();
    fadeIn(seconds);
    audio.play().catch(() => sync());
  };

  btn.addEventListener('click', () => {
    if (audio.paused) play(FADE_RESUME);
    else audio.pause();
  });

  // Leaving the page (other app, phone call, screen off) pauses; coming back fades in again,
  // but only if it was playing before.
  let resumeOnReturn = false;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      resumeOnReturn = !audio.paused;
      audio.pause();
    } else if (resumeOnReturn) {
      resumeOnReturn = false;
      play(FADE_RESUME);
    }
  });

  return {
    /** Call inside the door tap so autoplay is allowed. */
    start: () => {
      if (!btn.isConnected) return;
      btn.hidden = false;
      play(FADE_IN);
    },
  };
};
