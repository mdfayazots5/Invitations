/**
 * Page-by-page invite inside a fixed full-screen scroller (`#app`).
 *
 * Why a fixed scroller instead of scrolling the document: on phones the browser bar collapses while
 * the document scrolls, the screen grows, and a strip of the next page peeks in. A fixed box is
 * always exactly the visible screen, so every resting view is one complete page.
 *
 * - Pages snap (CSS scroll-snap). Wheel/trackpad: one gesture = one page.
 * - Tap on empty space = next page. Dots on the right show (and jump to) the page.
 * - Auto-advance holds each page (`data-hold`, ms), then glides on. As soon as the guest touches,
 *   swipes, scrolls or taps a dot, it stops for good: from then on they turn the pages themselves.
 * - "View again" on the last page glides back to the start and plays the show again.
 * - Pages taller than the screen are scaled down a little (never below MIN_FIT), not clipped.
 */
const MIN_FIT = 0.8;
const MARGIN = 14; // px kept clear above and below a page's content
const GLIDE = 1100; // ms per page-to-page glide
const HERO_HOLD = 4000; // ms on the first page when "View again" restarts the show
const REVEAL = 900; // ms for a page's whole-page reveal to finish (see reveal.ts)
const DEFAULT_HOLD = 4500;
const TAP_MOVE = 10; // px: more movement than this is a swipe, not a tap
const TAP_TIME = 300; // ms

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export type Pager = ReturnType<typeof createPager>;

export const createPager = (app: HTMLElement) => {
  const pages = Array.from(app.querySelectorAll<HTMLElement>('.page'));
  const listeners = new Set<() => void>(); // "the guest did something" (stops auto-advance)
  const touched = () => listeners.forEach((f) => f());
  const locked = () => document.body.classList.contains('locked');

  // ── fit tall pages on small phones ──
  const fit = () => {
    const avail = app.clientHeight - MARGIN * 2;
    for (const page of pages) {
      const inner = page.querySelector<HTMLElement>(':scope > .page-inner');
      if (!inner) continue;
      inner.style.setProperty('--fit', '1');
      const h = inner.offsetHeight; // layout height ignores the transform
      inner.style.setProperty('--fit', (h > avail ? Math.max(MIN_FIT, avail / h) : 1).toFixed(3));
    }
  };
  fit();
  document.fonts?.ready.then(fit);
  let fitTimer = 0;
  window.addEventListener('resize', () => {
    window.clearTimeout(fitTimer);
    fitTimer = window.setTimeout(fit, 120);
  });

  // ── where are we, and gliding between pages ──
  const current = () => {
    let best = 0;
    let d = Infinity;
    pages.forEach((p, k) => {
      const dd = Math.abs(p.offsetTop - app.scrollTop);
      if (dd < d) {
        d = dd;
        best = k;
      }
    });
    return best;
  };

  let raf = 0;
  let gliding = false;
  let glideId = 0;
  /** Eased glide to page k. CSS snap is off during the glide (it would yank back every frame). */
  const goTo = (k: number, done: () => void = () => undefined): number => {
    const to = pages[Math.max(0, Math.min(pages.length - 1, k))].offsetTop;
    cancelAnimationFrame(raf);
    gliding = true;
    const id = ++glideId;
    app.style.scrollSnapType = 'none';
    const from = app.scrollTop;
    const t0 = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / GLIDE);
      app.scrollTop = from + (to - from) * ease(t);
      if (t < 1) raf = requestAnimationFrame(step);
      else {
        gliding = false;
        app.style.scrollSnapType = '';
        done();
      }
    };
    raf = requestAnimationFrame(step);
    return id;
  };
  /** Cancels the glide with this id only (a newer glide, e.g. from a tap, is left alone). */
  const cancel = (id: number) => {
    if (!gliding || id !== glideId) return;
    cancelAnimationFrame(raf);
    gliding = false;
    app.style.scrollSnapType = '';
  };

  // ── mouse wheel / trackpad: one gesture = one page (desktop wheels ignore scroll-snap-stop) ──
  let acc = 0;
  let wheelQuiet = 0;
  let wheelLocked = false;
  window.addEventListener(
    'wheel',
    (e) => {
      if (locked() || e.ctrlKey) return; // doors still closed / pinch-zoom
      e.preventDefault();
      touched();
      window.clearTimeout(wheelQuiet);
      wheelQuiet = window.setTimeout(() => {
        wheelLocked = false;
        acc = 0;
      }, 220); // a gesture ends after 220 ms without events (trackpads keep sending inertia)
      if (wheelLocked) return;
      acc += e.deltaY;
      if (Math.abs(acc) < 30) return;
      wheelLocked = true;
      const i = current();
      const j = Math.max(0, Math.min(pages.length - 1, i + Math.sign(acc)));
      if (j !== i) goTo(j);
    },
    {passive: false},
  );

  // ── touch / keys count as input too ──
  (['touchstart', 'pointerdown', 'keydown'] as const).forEach((t) => window.addEventListener(t, () => !locked() && touched(), {passive: true}));
  // A tap inside a map iframe doesn't reach this document, but it takes focus (window blur).
  window.addEventListener('blur', () => !locked() && touched());

  // ── tap on empty space = next page ──
  const INTERACTIVE = 'a, button, input, iframe, .scratch, .map-card, .dots, .music';
  let down: {x: number; y: number; t: number} | null = null;
  app.addEventListener('pointerdown', (e) => {
    down = e.isPrimary ? {x: e.clientX, y: e.clientY, t: performance.now()} : null;
  });
  app.addEventListener('pointerup', (e) => {
    const d = down;
    down = null;
    if (!d || locked() || (e.target as Element).closest(INTERACTIVE)) return;
    if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > TAP_MOVE || performance.now() - d.t > TAP_TIME) return;
    const i = current();
    if (i < pages.length - 1) goTo(i + 1);
  });

  // ── dots on the right ──
  const dots = document.createElement('nav');
  dots.className = 'dots';
  dots.setAttribute('aria-label', 'Pages');
  dots.innerHTML = pages
    .map((_, k) => `<button type="button" class="dot" aria-label="Page ${k + 1} of ${pages.length}"></button>`)
    .join('');
  document.body.appendChild(dots);
  const dotEls = Array.from(dots.querySelectorAll<HTMLButtonElement>('.dot'));
  dotEls.forEach((b, k) =>
    b.addEventListener('click', () => {
      touched();
      goTo(k);
    }),
  );
  // One-time hint on page 2 for guests who don't know they can swipe.
  const hint = document.createElement('p');
  hint.className = 'swipe-hint caps';
  hint.textContent = 'Tap or swipe ↑';
  document.body.appendChild(hint);
  let hinted = false;
  let shown = -1;
  const onScroll = () => {
    const i = current();
    if (i === shown) return;
    shown = i;
    dotEls.forEach((b, k) => b.classList.toggle('on', k === i));
    dotEls.forEach((b, k) => (k === i ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current')));
    if (i === 1 && !hinted) {
      hinted = true;
      hint.classList.add('show');
      window.setTimeout(() => hint.classList.remove('show'), 3000);
    }
  };
  let scrollRaf = 0;
  app.addEventListener(
    'scroll',
    () => {
      cancelAnimationFrame(scrollRaf);
      scrollRaf = requestAnimationFrame(onScroll);
    },
    {passive: true},
  );
  onScroll();

  // ── auto-advance: a show that runs until the guest takes over ──
  let autoOn = false;
  let tookOver = false; // the guest touched / scrolled: from then on they turn the pages themselves
  let timer = 0;
  let myGlide = -1;
  const holdOf = (p: HTMLElement) => Number(p.dataset.hold) || DEFAULT_HOLD;
  const schedule = (ms: number) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(next, ms);
  };
  function next() {
    if (!autoOn) return;
    const i = current();
    if (i >= pages.length - 1) return; // rest on the last page (View again restarts)
    myGlide = goTo(i + 1, () => {
      if (autoOn && i + 1 < pages.length - 1) schedule(REVEAL + holdOf(pages[i + 1]));
    });
  }
  listeners.add(() => {
    // Any touch, swipe, wheel, key or dot: the guest is in control now. Stop for good.
    tookOver = true;
    autoOn = false;
    window.clearTimeout(timer);
    cancel(myGlide); // hand the scroll back; snap settles it on a whole page
  });

  return {
    pages,
    current,
    goTo,
    /** Turn pages on their own, unless the guest has already started scrolling themselves. */
    startAuto: () => {
      if (tookOver) return;
      autoOn = true;
      next();
    },
    /** "View again": back to the first page and play the show again from the start. */
    replay: () => {
      touched(); // stops anything in flight
      goTo(0, () => {
        autoOn = true;
        schedule(REVEAL + HERO_HOLD);
      });
    },
  };
};
