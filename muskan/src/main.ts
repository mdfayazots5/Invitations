import './styles.css';
import {archCap, artDefs, crest, jaaliBand, ornament, palaceHall, roseWall} from './art';
import {startCountdown} from './countdown';
import {mountCurtain} from './curtain';
import {createDrift} from './drift';
import {startFireworks} from './fireworks';
import {C, mapEmbedUrl, type InviteEvent} from './invite.config';
import {createMusic} from './music';
import {startReveal} from './reveal';
import {wireRsvp} from './rsvp';
import {createScratch} from './scratch';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const params = new URLSearchParams(location.search);
// ?video: the recorded MP4. Hides what only works by tapping, and the live countdown (it would freeze).
if (params.has('video')) document.body.classList.add('video');
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const R = 'data-reveal';
const u = C.ui;

/** After the curtain opens: time to take in the hall before the page starts to drift. */
const HERO_HOLD = 4200;

const band = () => `<div class="band" aria-hidden="true"></div>`;
const pad2 = (n: number) => String(n).padStart(2, '0');

// ───────────────────────────── sections ─────────────────────────────

const heroHtml = () => `<section id="hero" class="sec hero" aria-label="${esc(u.title)}">
  <div class="hero-art">${palaceHall()}</div>
  <div class="hero-text">
    <p class="script save" data-hero style="--h:0"><span class="save-1">${esc(C.saveTheDate[0])}</span><span class="save-2">${esc(C.saveTheDate[1])}</span></p>
    <p class="caps hero-names" data-hero style="--h:1">${esc(C.firstShort)}<span class="amp">&amp;</span>${esc(C.secondShort)}</p>
    <p class="urdu hero-urdu" data-hero style="--h:2" lang="ur" dir="rtl">${C.namesUrdu}</p>
    <p class="caps hero-label" data-hero style="--h:3">${esc(C.heroLabel)}</p>
  </div>
</section>`;

const dateHtml = () => `<section id="date" class="sec date" data-hold="2600">
  ${band()}
  <div class="date-inner">
    <p class="caps kicker" ${R}>✦ ${esc(C.heroLabel)} ✦</p>
    <div data-scratch-slot ${R}></div>
    <p class="italic date-sub" ${R}>${esc(C.scratchSub)}</p>
  </div>
  ${band()}
</section>`;

const inviteHtml = () => `<section id="invitation" class="sec invite" data-hold="11000">
  <div class="wall wall-l" data-wall="21"></div>
  <div class="wall wall-r" data-wall="43"></div>
  <div class="invite-lights" aria-hidden="true">
    <svg viewBox="0 0 400 120" preserveAspectRatio="xMidYMin meet"><use href="#chandelier" x="20" y="0" width="90" height="90"/>
    <use href="#chandelier" x="290" y="0" width="90" height="90"/></svg>
  </div>
  <div class="arch">
    ${archCap()}
    <div class="arch-body">
      <p class="bismillah-ar" ${R} lang="ar" dir="rtl">${C.bismillahAr}</p>
      <p class="italic small" ${R}>${esc(C.bismillahEn)}</p>
      <div ${R}>${ornament('#a46f2a')}</div>
      <p class="ayah-ar" ${R} lang="ar" dir="rtl">${C.ayah.ar}</p>
      <p class="italic ayah-en" ${R}>“${esc(C.ayah.en)}”</p>
      <p class="caps tiny" ${R}>${esc(C.ayah.ref)}</p>
      <div ${R}>${ornament('#a46f2a')}</div>
      <p class="caps lead" ${R}>${esc(C.withJoy)}</p>
      <p class="host" ${R}>${esc(C.host)}</p>
      <p class="caps lead" ${R}>${esc(C.hostLine)}</p>
      <p class="script name" ${R}>${esc(C.firstFull)}</p>
      <p class="script and" ${R}>&amp;</p>
      <p class="script name" ${R}>${esc(C.secondFull)}</p>
      <p class="parents" ${R}>${esc(C.secondParents)}</p>
      ${
        C.blessings
          ? `<p class="caps lead" ${R} style="margin-top:14px">${esc(C.blessingsLabel)}</p><p class="host" ${R}>${esc(C.blessings)}</p>`
          : ''
      }
      <p class="urdu invite-urdu" ${R} lang="ur" dir="rtl">${C.welcomeUrdu}</p>
    </div>
  </div>
</section>`;

const eventItem = (e: InviteEvent, i: number) => `<li class="ev" ${R}>
  <span class="ev-dot" aria-hidden="true"></span>
  <p class="caps ev-no">✦ ${u.eventNo} ${pad2(i + 1)}</p>
  <p class="script ev-title">${esc(e.title)} <span class="urdu ev-urdu" lang="ur" dir="rtl">${e.urdu}</span></p>
  <p class="ev-when">${esc(`${e.day}, ${e.date} · ${e.time}`)}</p>
  <p class="ev-hijri">${esc(e.hijri)}</p>
  <p class="caps ev-venue">${esc(e.venue)} · ${esc(e.address)}</p>
  <p class="italic ev-blurb">${esc(e.blurb)} · ${esc(e.note)}</p>
</li>`;

const eventsHtml = () => `<section id="events" class="sec light events" data-hold="9000">
  ${band()}
  <div class="light-inner">
    <p class="caps kicker" ${R}>✦ ${u.eventsLabel} ✦</p>
    <h2 class="script title" ${R}>${u.eventsTitle}</h2>
    <div ${R}>${ornament('#c98b8f')}</div>
    <ol class="timeline">${C.events.map(eventItem).join('')}</ol>
  </div>
</section>`;

const countdownHtml = () => `<section id="countdown" class="sec count" data-hold="5000">
  ${band()}
  <canvas class="fireworks" aria-hidden="true"></canvas>
  <div class="count-inner">
    <p class="caps kicker" ${R}>✦ ${u.countdownKicker} ✦</p>
    <h2 class="script glow-title" ${R}>Counting<br />Down</h2>
    <div class="boxes" ${R} role="timer" aria-live="off">
      ${u.units.map((unit) => `<div class="box"><div class="box-face"><span class="digit"></span></div><span class="caps">${unit}</span></div>`).join('')}
    </div>
    <p class="italic count-until" ${R} data-next></p>
    <p class="script glow-title" data-done hidden>${u.alhamdulillah}</p>
  </div>
</section>`;

const rsvpHtml = () => `<section id="rsvp" class="sec rsvp" data-hold="4000">
  ${band()}
  <div class="rsvp-inner">
    <h2 class="script glow-title" ${R}>${u.rsvpTitle}</h2>
    <div ${R}>${ornament('#e2b765')}</div>
    <form class="rsvp-card" ${R} novalidate>
      <label class="caps" for="rsvp-name">${u.rsvpName}</label>
      <input id="rsvp-name" name="name" type="text" autocomplete="name" placeholder="${esc(u.rsvpNamePh)}" maxlength="60" />
      <p class="caps">${u.rsvpJoin}</p>
      <div class="choices">
        <button type="button" data-choice="yes" aria-pressed="false">${u.rsvpYes}</button>
        <button type="button" data-choice="no" aria-pressed="false">${u.rsvpNo}</button>
      </div>
      <p class="rsvp-err" role="alert"></p>
      <button type="submit" class="btn-gold caps">✦ ${u.rsvpSend} ✦</button>
    </form>
  </div>
</section>`;

const venueCard = (e: InviteEvent) => `<article class="venue" ${R}>
  <div class="map-wrap">
    <iframe class="map" title="${esc(u.mapTitle.replace('{venue}', e.venue))}" loading="lazy"
      referrerpolicy="no-referrer-when-downgrade" src="${mapEmbedUrl(e)}"></iframe>
  </div>
  <p class="caps ev-no">✦ ${esc(e.title.toUpperCase())} ✦</p>
  <p class="script venue-name">${esc(e.venue)}</p>
  <p class="ev-when">${esc(`${e.day}, ${e.date} · ${e.time}`)}</p>
  <p class="italic">${esc(e.address)}</p>
  <a class="btn-outline caps" href="${esc(e.mapPlaceUrl)}" target="_blank" rel="noopener">📍 ${u.openMaps}</a>
</article>`;

const venuesHtml = () => `<section id="venues" class="sec light venues" data-hold="8000">
  ${band()}
  <div class="light-inner">
    <p class="caps kicker" ${R}>✦ ${u.venueKicker} ✦</p>
    <h2 class="script title" ${R}>${u.venueTitle}</h2>
    <div ${R}>${ornament('#c98b8f')}</div>
    ${C.events.map(venueCard).join('')}
  </div>
</section>`;

const closingHtml = () => `<footer id="closing" class="sec closing" data-hold="7000">
  ${band()}
  <div class="closing-inner">
    <p class="star" ${R}>✦</p>
    <p class="dua-ar" ${R} lang="ar" dir="rtl">${C.dua.ar}</p>
    <p class="italic dua-en" ${R}>${esc(C.dua.en)} <span class="muted">(${esc(C.dua.ref)})</span></p>
    <p class="script presence" ${R}>${esc(C.presence)}</p>
    <div ${R}>${ornament('#e2b765')}</div>
    <p class="caps small-caps" ${R}>${esc(C.compliments)}</p>
    <p class="script from" ${R}>${esc(C.nearDear)}</p>
    <p class="urdu" ${R} lang="ur" dir="rtl">${C.fromUrdu}</p>
    <p class="caps names-caps" ${R}>${esc(C.firstShort)} &amp; ${esc(C.secondShort)}</p>
    <p class="script footer-names" ${R}>${esc(u.footerNames)}</p>
    <p class="caps tiny" ${R}>${esc(u.footerLine)} · ${esc(C.inshaAllahClose)}</p>
    <button type="button" class="replay caps" ${R} data-replay>↺ View again</button>
  </div>
</footer>`;

/** 1200×630 link-preview card (`?og`), rendered by scripts/og-image.ts. */
const ogCard = () => {
  document.body.classList.add('og', 'entered');
  document.body.classList.remove('locked');
  document.body.insertAdjacentHTML(
    'beforeend',
    `<div class="og-card">${band()}<div class="og-inner">
      <div class="og-crest">${crest(C.monogram[0], C.monogram[1])}</div>
      <div class="og-text">
        <p class="script og-save">${esc(C.saveTheDate.join(' '))}</p>
        <p class="caps og-names">${esc(C.firstShort)} &amp; ${esc(C.secondShort)}</p>
        <p class="caps og-when">NIKAH 14 · VALIMA 15 DECEMBER 2026</p>
      </div></div>${band()}</div>`,
  );
};

// ───────────────────────────── boot ─────────────────────────────

const boot = () => {
  document.body.insertAdjacentHTML('afterbegin', artDefs());
  document.documentElement.style.setProperty('--jaali', jaaliBand());
  if (params.has('og')) {
    ogCard();
    return;
  }
  const app = document.getElementById('app')!;
  app.innerHTML = heroHtml() + dateHtml() + inviteHtml() + eventsHtml() + countdownHtml() + rsvpHtml() + venuesHtml() + closingHtml();

  app.querySelectorAll<HTMLElement>('[data-wall]').forEach((w) => (w.style.backgroundImage = roseWall(Number(w.dataset.wall))));
  const sections = Array.from(app.querySelectorAll<HTMLElement>('.sec'));
  const drift = createDrift(sections);

  // Scratch card: the guest scratches it, or the drift scratches it on arrival.
  let revealed!: () => void;
  const onReveal = new Promise<void>((r) => (revealed = r));
  const scratch = createScratch(() => revealed());
  app.querySelector('[data-scratch-slot]')!.replaceWith(scratch.el);
  scratch.el.setAttribute(R, '');
  (app.querySelector('#date') as HTMLElement & {arrive?: () => Promise<void>}).arrive = async () => {
    window.setTimeout(scratch.auto, 700);
    await onReveal;
  };
  // Used by scripts/record.ts, which drives the page itself (?noscroll).
  (window as unknown as {__invite: object}).__invite = {scratch: scratch.auto};

  startReveal(app, reducedMotion);
  startCountdown(app.querySelector('#countdown')!);
  startFireworks(app.querySelector<HTMLCanvasElement>('.fireworks')!, reducedMotion);
  wireRsvp(app.querySelector('#rsvp')!);
  app.querySelector('[data-replay]')!.addEventListener('click', () => scrollTo({top: 0, behavior: reducedMotion ? 'auto' : 'smooth'}));

  const music = createMusic();
  history.scrollRestoration = 'manual';
  scrollTo(0, 0);
  mountCurtain(document.getElementById('curtain-root')!, () => music.start(), reducedMotion).then(() => {
    drift.arm();
    if (reducedMotion || params.has('noscroll')) return;
    window.setTimeout(() => void drift.start(), HERO_HOLD);
  });
};

boot();
