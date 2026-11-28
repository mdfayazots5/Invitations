import './styles.css';
import {artDefs, charms, garland, lanterns, lotusDivider, monogramRing, scene, type SceneName} from './art';
import {startAmbient} from './ambient';
import {startCountdown} from './countdown';
import {mountCurtain} from './curtain';
import {createDrift} from './drift';
import {C, TEST_MODE, type InviteEvent} from './invite.config';
import type {World} from './three/world';
import {createMusic} from './music';
import {startReveal} from './reveal';
import {wireRsvp} from './rsvp';
import {createScratch} from './scratch';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ?test: the phone tester (shared/autotest), only when TEST_MODE is on in invite.config.ts. Loaded as its own file.
if (TEST_MODE && /[?&](test|autotest)\b/.test(location.search))
  void import('../../shared/autotest').then((m) =>
    m.mountTester({site: 'muskanone', commit: __COMMIT__, enter: () => document.querySelector<HTMLElement>('.curtain')?.click()}),
  );
const params = new URLSearchParams(location.search);
// ?video: the recorded MP4. Hides what only works by tapping, and the live countdown (it would freeze).
if (params.has('video')) document.body.classList.add('video');
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const R = 'data-reveal';
const u = C.ui;

/** After the curtain opens: time to take in the hero before the card scratches itself (brief: 3 s). */
const SCRATCH_DELAY = 3000;
/** After the dates show: time to read them before the page starts to move. */
const DATES_HOLD = 2600;

/** Code-drawn 2D scene: the fallback when WebGL isn't available (the 3D world in src/three/ draws over it). */
const bg = (name: SceneName) => `<div class="bg" aria-hidden="true">${scene(name)}</div>`;
const sky = () => `<div class="bg sky" aria-hidden="true"></div>`;
const ambient = (kind: 'petals' | 'sparkles' | 'leaves') => `<canvas class="ambient" data-ambient="${kind}" aria-hidden="true"></canvas>`;

// ───────────────────────────── sections (brief §4.3) ─────────────────────────────

/** Hero lines come in one after another once the curtain has opened (CSS: body.entered .hl). */
let h = 0;
const hl = (html: string) => html.replace(/^<(\w+)/, `<$1 data-hl style="--h:${h++}"`);

const heroHtml = () => `<section id="hero" class="sec hero" data-hold="7000" aria-label="${esc(u.title)}">
  ${bg('hero')}
  ${garland()}
  ${lanterns([
    [5, 20, 0.95],
    [84, 46, 0.85],
  ])}
  ${ambient('leaves')}
  <div class="txt">
    ${hl(`<p class="bismillah-ar" lang="ar" dir="rtl">${C.bismillahAr}</p>`)}
    ${hl(`<p class="caps label">${esc(C.heroLabel)}</p>`)}
    ${hl(`<p class="script save">${esc(C.saveTheDate)}</p>`)}
    ${hl(`<p class="script name hero-name">${esc(C.firstFull)}</p>`)}
    ${hl(`<p class="amp">&amp;</p>`)}
    ${hl(`<p class="script name hero-name">${esc(C.secondFull)}</p>`)}
    ${hl(`<div class="scratch-wrap"><div data-scratch-slot></div></div>`)}
  </div>
</section>`;

const invitationHtml = () => `<section id="invitation" class="sec" data-hold="9000">
  ${bg('names')}
  ${charms()}
  <div class="txt veil">
    <p class="caps small gold" ${R}>${esc(C.blessingsLabel)}</p>
    <p class="blessings" ${R}>${esc(C.blessings)}</p>
    <div ${R}>${lotusDivider()}</div>
    <p class="script host" ${R}>${esc(C.host)}</p>
    <p class="italic host-line" ${R}>${esc(C.hostLine)}</p>
    <p class="script name" ${R}>${esc(C.firstFull)}</p>
    <p class="italic with" ${R}>${esc(C.with)}</p>
    <p class="script name" ${R}>${esc(C.secondFull)}</p>
    <p class="italic gold parents" ${R}>${esc(C.secondParents)}</p>
  </div>
</section>`;

const urduHtml = () => `<section id="urdu" class="sec" data-hold="9000">
  ${bg('names')}
  ${charms()}
  <div class="txt veil strong">
    <p class="urdu small-urdu" ${R} lang="ur" dir="rtl">${C.urdu.blessings}</p>
    <div ${R}>${lotusDivider()}</div>
    <p class="urdu u-name" ${R} lang="ur" dir="rtl">${C.urdu.first}</p>
    <p class="urdu u-with" ${R} lang="ur" dir="rtl">${C.urdu.with}</p>
    <p class="urdu u-name" ${R} lang="ur" dir="rtl">${C.urdu.second}</p>
    <p class="urdu small-urdu" ${R} lang="ur" dir="rtl">${C.urdu.secondParents}</p>
    <p class="urdu u-occasion" ${R} lang="ur" dir="rtl">${C.urdu.occasion}</p>
    <p class="urdu small-urdu" ${R} lang="ur" dir="rtl">${C.urdu.welcome}</p>
    <p class="urdu small-urdu" ${R} lang="ur" dir="rtl">${C.urdu.hostLabel}: ${C.urdu.host}</p>
  </div>
</section>`;

const eventHtml = (e: InviteEvent, kind: 'petals' | 'sparkles') => `<section id="${e.key}" class="sec event" data-hold="7000">
  ${bg(e.key)}
  ${e.key === 'valima' ? '<div class="candles" aria-hidden="true"><i></i><i></i><i></i><i></i></div>' : ''}
  ${ambient(kind)}
  <div class="txt veil">
    <p class="ev-title" ${R}>${esc(e.title)}</p>
    <p class="urdu ev-urdu" ${R} lang="ur" dir="rtl">${e.urdu}</p>
    <div ${R}>${lotusDivider()}</div>
    <p class="ev-date" ${R}>${esc(`${e.day}, ${e.date}`)}</p>
    <p class="italic gold ev-hijri" ${R}>${esc(e.hijri)}</p>
    <p class="ev-time" ${R}>${esc(`${e.time} · ${e.note}`)}</p>
    <p class="ev-venue-label" ${R}>${esc(u.venueLabel)}</p>
    <p class="ev-venue" ${R}>${esc(e.venue)}</p>
    <p class="italic ev-address" ${R}>${esc(e.address)}</p>
  </div>
</section>`;

const countdownHtml = () => `<section id="countdown" class="sec plain" data-hold="6000">
  ${sky()}
  ${lanterns([
    [8, 30, 0.9],
    [30, 90, 0.75],
    [62, 60, 0.8],
    [84, 20, 0.95],
  ])}
  <div class="txt veil strong">
    <p class="caps small gold" ${R}>✦ ${u.countdownKicker} ✦</p>
    ${u.countdownTitle
      .split('|')
      .map((t, i) => `<${i ? 'p' : 'h2'} class="script title" ${R}>${esc(t)}</${i ? 'p' : 'h2'}>`)
      .join('')}
    <div class="boxes" ${R} role="timer" aria-live="off">
      ${u.units.map((unit) => `<div class="box"><div class="box-face"><span class="digit"></span></div><span class="caps unit">${unit}</span></div>`).join('')}
    </div>
    <p class="italic until" ${R} data-next></p>
    <p class="script title" data-done hidden>${esc(u.alhamdulillah)}</p>
  </div>
</section>`;

const rsvpHtml = () => `<section id="rsvp" class="sec plain" data-hold="5000">
  ${sky()}
  <div class="txt veil strong">
    <p class="caps small gold" ${R}>✦ ${u.rsvpKicker} ✦</p>
    <h2 class="script title" ${R}>${esc(u.rsvpTitle)}</h2>
    <div ${R}>${lotusDivider()}</div>
    <form class="rsvp-card" ${R} novalidate>
      <label class="caps small" for="rsvp-name">${u.rsvpName}</label>
      <input id="rsvp-name" name="name" type="text" autocomplete="name" placeholder="${esc(u.rsvpNamePh)}" maxlength="60" />
      <div class="choices">
        <button type="button" class="pill yes" data-choice="yes" aria-pressed="true">${esc(u.rsvpYes)}</button>
        <button type="button" class="pill no" data-choice="no" aria-pressed="false">${esc(u.rsvpNo)}</button>
      </div>
      <p class="rsvp-err" role="alert"></p>
      <button type="submit" class="send caps">${u.rsvpSend}</button>
    </form>
  </div>
</section>`;

const venueCard = (e: InviteEvent) => `<article class="venue" ${R}>
  <p class="caps small gold">${esc(e.title.toUpperCase())}</p>
  <p class="venue-name">${esc(e.venue)}</p>
  <p class="italic">${esc(e.address)}</p>
  <p class="venue-when">${esc(`${e.day}, ${e.date} · ${e.time}`)}</p>
  <a class="maps caps" href="${esc(e.mapPlaceUrl)}" target="_blank" rel="noopener">📍 ${u.openMaps}</a>
</article>`;

const venuesHtml = () => `<section id="venues" class="sec plain" data-hold="6000">
  ${sky()}
  <div class="txt veil strong">
    <p class="caps small gold" ${R}>✦ ${u.venuesKicker} ✦</p>
    <h2 class="script title" ${R}>${esc(u.venuesTitle)}</h2>
    ${C.events.map(venueCard).join('')}
  </div>
</section>`;

const closingHtml = () => `<footer id="closing" class="sec" data-hold="7000">
  ${bg('closing')}
  ${lanterns([
    [4, 10, 0.8],
    [20, 60, 0.7],
    [40, 24, 0.75],
    [58, 80, 0.7],
    [76, 34, 0.8],
    [90, 70, 0.7],
  ])}
  <div class="txt veil">
    <p class="script regards" ${R}>${esc(C.warmRegards)}</p>
    <div ${R}>${lotusDivider()}</div>
    <p class="caps small gold" ${R}>${esc(C.compliments)}</p>
    <p class="script near" ${R}>${esc(C.nearDear)}</p>
    <p class="urdu small-urdu" ${R} lang="ur" dir="rtl">${C.urdu.nearDear}</p>
    <p class="caps small names-line" ${R}>${esc(C.firstShort)} &amp; ${esc(C.secondShort)} · 14 &amp; 15 December 2026</p>
    <button type="button" class="replay caps" ${R} data-replay>${u.viewAgain}</button>
  </div>
</footer>`;

/** 1200×630 link-preview card (`?og`), rendered by scripts/og-image.ts. */
const ogCard = () => {
  document.body.classList.add('og', 'entered');
  document.body.classList.remove('locked');
  document.body.insertAdjacentHTML(
    'beforeend',
    `<div class="og-card">${sky()}${garland()}${lanterns([
      [6, 30, 1.1],
      [88, 50, 1],
    ])}
      <div class="og-inner">
        ${monogramRing(C.monogram[0], C.monogram[1])}
        <div class="og-text">
          <p class="caps label">${esc(C.heroLabel)}</p>
          <p class="script name">${esc(C.firstFull)}</p>
          <p class="script og-and">&amp; ${esc(C.secondFull)}</p>
          <p class="caps og-when">14 &amp; 15 DECEMBER 2026 · NAGARKURNOOL &amp; AMANGAL</p>
        </div>
      </div></div>`,
  );
};

// ───────────────────────────── boot ─────────────────────────────

// ───────────────────────────── 3D world ─────────────────────────────

/**
 * Starts the 3D world (lazy-loaded after first paint). Resolves to null when WebGL isn't available
 * (or with ?nowebgl): the page then keeps its 2D scenes and CSS drapes.
 */
const startWorld = async (): Promise<World | null> => {
  if (params.has('nowebgl')) return null;
  const canvas = document.createElement('canvas');
  canvas.id = 'world';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  try {
    const {createWorld} = await import('./three/world');
    const world = createWorld(canvas, {
      reducedMotion,
      onLost: () => {
        document.body.classList.remove('webgl');
        canvas.remove();
      },
    });
    if (!world) throw new Error('no WebGL');
    document.body.classList.add('webgl');
    (window as unknown as {__world: World}).__world = world;
    return world;
  } catch {
    canvas.remove();
    return null;
  }
};

/** Station progress from the scroll position: station 1 = the hero section, plus the fraction to the next section. */
const scrollProgress = (sections: HTMLElement[]) => {
  const y = scrollY;
  const max = document.documentElement.scrollHeight - innerHeight;
  for (let i = sections.length - 1; i >= 0; i--) {
    const top = Math.min(sections[i].offsetTop, max);
    if (y >= top - 1) {
      const next = i + 1 < sections.length ? Math.min(sections[i + 1].offsetTop, max) : top;
      return 1 + i + (next > top ? Math.min(1, (y - top) / (next - top)) : 0);
    }
  }
  return 1;
};

const boot = () => {
  document.body.insertAdjacentHTML('afterbegin', artDefs());
  if (params.has('og')) {
    ogCard();
    void startWorld().then((w) => {
      if (!w) return;
      // WebGL: the 3D courtyard (station 1) alone, no UI. Without WebGL the 2D card stays.
      document.body.classList.add('og-3d');
      w.openDrapes();
      w.jump(1);
      // a few frames later the courtyard is drawn: scripts/og-image.ts waits for this flag
      window.setTimeout(() => ((window as unknown as {__ogReady: boolean}).__ogReady = true), 600);
    });
    return;
  }
  const app = document.getElementById('app')!;
  app.innerHTML =
    heroHtml() +
    invitationHtml() +
    urduHtml() +
    eventHtml(C.events[0], 'petals') +
    eventHtml(C.events[1], 'sparkles') +
    countdownHtml() +
    rsvpHtml() +
    venuesHtml() +
    closingHtml();

  const sections = Array.from(app.querySelectorAll<HTMLElement>('.sec'));
  const drift = createDrift(sections);

  // Ken Burns: each background pushes in 3 % while its section is on screen.
  const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('live', e.isIntersecting)), {threshold: 0.35});
  sections.forEach((s) => io.observe(s));

  // Scratch card: the guest scratches it, or it scratches itself after a few seconds.
  let revealed!: () => void;
  const onReveal = new Promise<void>((r) => (revealed = r));
  const scratch = createScratch(() => revealed());
  app.querySelector('[data-scratch-slot]')!.replaceWith(scratch.el);
  // Used by scripts/record.ts, which drives the page itself (?noscroll).
  (window as unknown as {__invite: object}).__invite = {scratch: scratch.auto};

  startReveal(app, reducedMotion);
  startCountdown(app.querySelector('#countdown')!);
  app.querySelectorAll<HTMLCanvasElement>('[data-ambient]').forEach((c) =>
    startAmbient(c, c.dataset.ambient as 'petals' | 'sparkles' | 'leaves', reducedMotion),
  );
  wireRsvp(app.querySelector('#rsvp')!);
  app.querySelector('[data-replay]')!.addEventListener('click', () => scrollTo({top: 0, behavior: reducedMotion ? 'auto' : 'smooth'}));

  // The 3D world loads after the first paint; the intro HTML (2D drapes) shows at once.
  let world: World | null = null;
  let entered = false;
  const follow = () => {
    if (world && entered) world.setTarget(scrollProgress(sections));
  };
  addEventListener('scroll', follow, {passive: true});
  requestAnimationFrame(() =>
    window.setTimeout(
      () =>
        void startWorld().then((w) => {
          world = w;
          if (w && entered) {
            // tapped before the world was ready: start straight at the current section
            w.openDrapes();
            w.jump(scrollProgress(sections));
          }
        }),
      50,
    ),
  );

  const music = createMusic();
  history.scrollRestoration = 'manual';
  scrollTo(0, 0);
  const onOpen = () => {
    music.start();
    entered = true;
    if (world) {
      world.openDrapes();
      // the camera starts its push once the drapes are mostly open (they take 1.4 s)
      window.setTimeout(follow, 1000);
    }
  };
  mountCurtain(document.getElementById('curtain-root')!, onOpen, reducedMotion).then(() => {
    drift.arm();
    if (reducedMotion || params.has('noscroll')) return;
    window.setTimeout(() => {
      if (!drift.stopped) scratch.auto();
    }, SCRATCH_DELAY);
    void onReveal.then(() => window.setTimeout(() => void drift.start(), DATES_HOLD));
  });
};

boot();
