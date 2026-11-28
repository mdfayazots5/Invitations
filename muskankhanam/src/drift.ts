/**
 * Auto-drift: after the dates are revealed, the page glides down on its own, section by section,
 * pausing on each for its `data-hold` (ms). A section taller than the screen is read in steps.
 * The first touch, wheel, key or drag stops it for good; from then on the guest scrolls freely.
 */
const GLIDE = 1500;
const STEP = 0.8; // of the screen height, for tall sections

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

type Stop = {y: number; hold: number; arrive?: () => Promise<void> | void};

export const createDrift = (sections: HTMLElement[]) => {
  let stopped = false;
  let running = false;
  /** Touches count only after the curtain has opened (the opening tap itself must not stop the drift). */
  let armed = false;
  const stop = () => {
    stopped = true;
  };
  for (const ev of ['wheel', 'touchstart', 'keydown', 'mousedown'] as const)
    addEventListener(ev, (e) => {
      if (armed && e.isTrusted && !(e.target instanceof Element && e.target.closest('.music'))) stop();
    }, {passive: true, capture: true});

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const glideTo = (to: number) =>
    new Promise<void>((done) => {
      const from = scrollY;
      const t0 = performance.now();
      const step = (now: number) => {
        if (stopped) return done();
        const p = Math.min(1, (now - t0) / GLIDE);
        scrollTo(0, from + (to - from) * ease(p));
        if (p < 1) requestAnimationFrame(step);
        else done();
      };
      requestAnimationFrame(step);
    });

  const stops = (): Stop[] => {
    const vh = innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    const out: Stop[] = [];
    for (const s of sections) {
      if (s.offsetParent === null) continue; // hidden (e.g. in the video)
      const top = s.offsetTop;
      const hold = Number(s.dataset.hold || 4000);
      const tall = s.offsetHeight > vh * 1.08;
      const steps = tall ? Math.ceil((s.offsetHeight - vh) / (vh * STEP)) : 0;
      const arrive = (s as HTMLElement & {arrive?: () => Promise<void>}).arrive;
      out.push({y: Math.min(top, max), hold: tall ? hold / (steps + 1) : hold, arrive});
      for (let k = 1; k <= steps; k++) out.push({y: Math.min(top + Math.min(k * vh * STEP, s.offsetHeight - vh), max), hold: hold / (steps + 1)});
    }
    return out;
  };

  return {
    arm: () => {
      armed = true;
    },
    /** Start gliding from the section after `fromIndex`. */
    start: async (fromIndex = 0) => {
      if (running || stopped) return;
      running = true;
      const list = stops();
      let i = list.findIndex((s) => s.y > scrollY + 4);
      if (i < 0) return;
      i = Math.max(i, fromIndex);
      for (; i < list.length && !stopped; i++) {
        await glideTo(list[i].y);
        if (stopped) break;
        await list[i].arrive?.();
        if (stopped) break;
        await sleep(list[i].hold);
      }
      running = false;
    },
    stop,
    get stopped() {
      return stopped;
    },
  };
};
