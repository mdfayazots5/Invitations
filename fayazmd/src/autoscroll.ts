/**
 * Slow, hands-free scroll through the invite.
 * - Drifts down at SPEED px/s, holding HOLD ms when each stop reaches the top of the screen.
 * - Any touch, wheel, key or tap into the map pauses it; it resumes after IDLE ms without input.
 * - Ends for good at the bottom of the page.
 */
const SPEED = 42; // px per second
const HOLD = 2600; // ms pause at each stop
const IDLE = 6000; // ms of no input before resuming
const STOP_OFFSET = 36; // px from the top of the viewport where a stop "arrives"

export const startAutoScroll = (stops: HTMLElement[]) => {
  const root = document.documentElement;
  const prevBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto'; // CSS smooth scrolling would fight per-frame scrollTo

  let pos = window.scrollY;
  let holdUntil = 0;
  let next = 0;
  let last = 0;
  let raf = 0;
  let ended = false;

  const atBottom = () => window.scrollY + window.innerHeight >= root.scrollHeight - 2;

  const end = () => {
    ended = true;
    cancelAnimationFrame(raf);
    root.style.scrollBehavior = prevBehavior;
    inputs.forEach((t) => window.removeEventListener(t, onInput));
    window.removeEventListener('blur', onInput);
  };

  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    const dt = Math.min(50, last ? now - last : 16); // clamp after tab switches / jank
    last = now;
    if (now < holdUntil) {
      pos = window.scrollY; // the guest may have scrolled while we waited
      return;
    }
    // Skip stops already above us (e.g. the guest scrolled past them).
    while (next < stops.length && stops[next].getBoundingClientRect().top < STOP_OFFSET - 4) next++;
    if (next < stops.length && stops[next].getBoundingClientRect().top <= STOP_OFFSET) {
      next++;
      holdUntil = now + HOLD;
      return;
    }
    if (atBottom()) {
      end();
      return;
    }
    pos += (SPEED * dt) / 1000;
    window.scrollTo(0, pos);
  };

  const onInput = () => {
    if (ended) return;
    holdUntil = performance.now() + IDLE;
  };
  // A tap inside the map iframe doesn't reach this document, but it takes focus (window blur).
  const inputs = ['wheel', 'touchstart', 'pointerdown', 'keydown'] as const;
  inputs.forEach((t) => window.addEventListener(t, onInput, {passive: true}));
  window.addEventListener('blur', onInput);

  raf = requestAnimationFrame(tick);
  return {stop: end};
};
