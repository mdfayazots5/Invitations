import './styles.css';
import {startCountdown} from './countdown';
import {mountDoors} from './doors';
import {startDust} from './dust';
import {C, TEST_MODE, mapEmbedUrl, type InviteEvent} from './invite.config';
import {createMusic} from './music';
import {divider, laceBackground, stringLights} from './ornaments';
import {createPager} from './pages';
import {startReveal} from './reveal';
import {createScratch} from './scratch';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ?test: the phone tester (shared/autotest), only when TEST_MODE is on in invite.config.ts. Loaded as its own file.
if (TEST_MODE && /[?&](test|autotest)\b/.test(location.search))
  void import('../../shared/autotest').then((m) =>
    m.mountTester({site: 'muskan', commit: __COMMIT__, enter: () => document.querySelector<HTMLElement>('#doors-root .doors')?.click()}),
  );
const params = new URLSearchParams(location.search);
// ?video: the recorded MP4. Hides what only works by tapping (maps, buttons, music toggle, page dots, hints).
if (params.has('video')) document.body.classList.add('video');
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const R = 'data-reveal';
const u = C.ui;

/** Hero stagger: last line lands ~0.6 s + 11 × 120 ms + 0.8 s after the doors finish. */
const AUTO_SCRATCH_DELAY = 2500;
/** Time to enjoy the revealed dates before the page starts to drift. */
const AUTO_SCROLL_DELAY = 2600;

/** Eight-pointed star (Rub el Hizb) used as the event-card crest. */
const star8 = () => `<svg class="event-star" viewBox="0 0 40 40" aria-hidden="true">
  <g fill="none" stroke="#E2C27A" stroke-width="1.3">
    <rect x="9" y="9" width="22" height="22"/><rect x="9" y="9" width="22" height="22" transform="rotate(45 20 20)"/>
    <circle cx="20" cy="20" r="4.5"/></g></svg>`;

const heroHtml = () => {
  let h = 0;
  const line = (html: string) => html.replace('<p', `<p data-hero style="--h:${h++}"`).replace('<div', `<div data-hero style="--h:${h - 1}"`);
  return `<section class="hero page" id="hero" aria-label="${esc(C.firstShort)} ${u.and} ${esc(C.secondShort)}">
    <div class="hero-arch">
      ${line(`<p class="bismillah-ar gold-text" lang="ar" dir="rtl">${C.bismillahAr}</p>`)}
      ${line(`<p class="italic muted" style="font-size:15px;max-width:280px">${esc(C.bismillahEn)}</p>`)}
      ${line(`<div>${divider()}</div>`)}
      ${line(`<p class="script gold-text hero-name">${esc(C.firstShort)}</p>`)}
      ${line(`<p class="hero-amp italic muted">${u.and}</p>`)}
      ${line(`<p class="script gold-text hero-name">${esc(C.secondShort)}</p>`)}
      ${line(`<p class="urdu" lang="ur" dir="rtl">${C.namesUrdu}</p>`)}
      ${line(`<p class="italic">${esc(u.inshaAllah)}</p>`)}
      ${line(`<p class="caps gold" style="margin-top:10px">${esc(C.heroLabel)}</p>`)}
      ${line(`<div data-scratch-slot></div>`)}
      ${line(`<p class="italic muted">${esc(C.scratchSub)}</p>`)}
      <div class="scroll-cue caps" aria-hidden="true">${u.scroll}
        <svg width="18" height="10" viewBox="0 0 18 10"><path d="M1,1 L9,9 L17,1" fill="none" stroke="#C9A24A" stroke-width="1.5"/></svg>
      </div>
    </div>
  </section>`;
};

/** Quran verse page (Ar-Rum 30:21): Arabic, then its meaning. */
const ayahHtml = () => `<section id="ayah" class="page" data-hold="7000"><div class="page-inner">
  <div class="panel">
    <p class="caps gold" ${R}>${esc(C.ayah.ref)}</p>
    <div ${R}>${divider()}</div>
    <p class="ayah-ar gold-text" ${R} lang="ar" dir="rtl">${C.ayah.ar}</p>
    <div ${R}>${divider()}</div>
    <p class="ayah-en italic" ${R}>“${esc(C.ayah.en)}”</p>
  </div>
</div></section>`;

const invitationHtml = () => `<section id="invitation" class="page" data-hold="7500"><div class="page-inner">
  <div class="panel">
    <p class="caps gold" ${R}>${u.invitationLabel}</p>
    <div ${R}>${divider()}</div>
    <p class="small-caps" ${R}>${esc(C.withJoy)}</p>
    <p class="host-name" ${R}>${esc(C.host)}</p>
    <p class="italic" ${R} style="margin-top:10px">${esc(C.hostLine)}</p>
    <p class="script gold-text name-lg" ${R} style="margin-top:8px">${esc(C.firstFull)}</p>
    <p class="italic" ${R}>${u.with}</p>
    <p class="script gold-text name-lg" ${R}>${esc(C.secondFull)}</p>
    <p class="italic muted" ${R} style="font-size:16px">${esc(C.secondParents)}</p>
    ${
      C.blessings
        ? `<div ${R}>${divider()}</div>
    <p class="small-caps" ${R}>${esc(C.blessingsLabel)}</p>
    <p ${R} style="font-size:19px;font-weight:600;margin-top:6px">${esc(C.blessings)}</p>`
        : `<div ${R}>${divider()}</div>`
    }
    <p class="urdu gold" ${R} style="margin-top:12px">${C.welcomeUrdu}</p>
  </div>
</div></section>`;

/** One page per event: Nikah, then Valima. The section label sits on the first one. */
const eventPage = (e: InviteEvent, first: boolean) => `<section id="events-${e.key}" class="page" data-hold="5000"><div class="page-inner">
  ${first ? `${stringLights()}<p class="caps gold label-pill" ${R}>${u.eventsLabel}</p>` : ''}
  <article class="panel event" id="event-${e.key}">
    ${star8()}
    <p class="script gold-text event-title" ${R} style="margin-top:22px">${esc(e.title)}</p>
    <p class="urdu gold" ${R} lang="ur" dir="rtl">${e.urdu}</p>
    <p class="event-day" ${R}>${esc(e.day.toUpperCase())}</p>
    <p class="event-date" ${R}>${esc(e.date)}</p>
    <p class="event-hijri" ${R}>${esc(e.hijri)}</p>
    <p class="event-time" ${R}>${esc(`${e.time} · ${e.note}`)}</p>
    <div ${R}>${divider()}</div>
    <p class="event-venue" ${R}>${esc(e.venue)}</p>
    <p class="event-address" ${R}>${esc(e.address)}</p>
  </article>
</div></section>`;

const countdownHtml = () => {
  const beforeNikah = Date.now() < new Date(C.events[0].startISO).getTime();
  return `<section class="countdown page" id="countdown" data-hold="4500"><div class="page-inner">
  <div class="panel">
    <p class="caps gold" ${R}>${u.countdownLabel}</p>
    ${(beforeNikah ? u.countdownTitle : u.countdownTitleAfter)
      .split('|')
      .map((t) => `<p class="script gold-text title-lg" ${R}>${esc(t)}</p>`)
      .join('')}
    <p class="italic muted" ${R} data-next></p>
    <div class="boxes" ${R} role="timer" aria-live="off">
      ${u.units
        .map((unit) => `<div class="box"><div class="box-face"><span class="digit gold-text"></span></div><span class="caps muted">${unit}</span></div>`)
        .join('')}
    </div>
    <p class="script gold-text title-lg" data-done hidden>${u.alhamdulillah}</p>
  </div>
  <div style="margin-top:26px">${stringLights()}</div>
</div></section>`;
};

/** One page per venue, with a map preview: swipes turn pages, a tap opens Google Maps. */
const venuePage = (e: InviteEvent, first: boolean) => `<section id="venue-${e.key}" class="page" data-hold="4500"><div class="page-inner">
  <div class="panel">
    ${first ? `<p class="caps gold" ${R}>${u.venueLabel}</p><div ${R}>${divider()}</div>` : ''}
    <p class="caps" ${R} style="font-size:14px">${esc(e.title.toUpperCase())} · ${esc(e.day.toUpperCase())}</p>
    <p class="script gold-text venue-name" ${R}>${esc(e.venue)}</p>
    <p class="italic" ${R}>${esc(e.address)}</p>
    <a class="map-card" ${R} href="${esc(e.mapPlaceUrl)}" target="_blank" rel="noopener" aria-label="Open ${esc(e.venue)} in Google Maps">
      <iframe class="map" tabindex="-1" title="${esc(u.mapTitle.replace('{venue}', e.venue))}" loading="lazy"
        referrerpolicy="no-referrer-when-downgrade" src="${mapEmbedUrl(e)}"></iframe>
    </a>
    <a class="btn-gold" ${R} href="${esc(e.mapPlaceUrl)}" target="_blank" rel="noopener">📍 ${u.viewOnMaps}</a>
  </div>
</div></section>`;

/** The Prophet's ﷺ dua for the couple, with the family's own line about duas. */
const duaHtml = () => `<section id="dua" class="page" data-hold="6000"><div class="page-inner">
  <div class="panel">
    <p class="dua-ar gold-text" ${R} lang="ar" dir="rtl">${C.dua.ar}</p>
    <p class="dua-en italic" ${R}>${esc(C.dua.en)}</p>
    <p class="dua-ref muted" ${R}>(${esc(C.dua.ref)})</p>
    <div ${R}>${divider()}</div>
    <p class="quote italic" ${R} style="margin-top:0">“${esc(C.presence)}”</p>
  </div>
</div></section>`;

const footerHtml = () => `<footer class="page" id="closing"><div class="page-inner">
  <div class="panel">
    <p class="small-caps" ${R}>${esc(C.compliments)}</p>
    <p class="script gold-text from" ${R}>${esc(C.nearDear)}</p>
    <p class="urdu" ${R} lang="ur" dir="rtl">${C.fromUrdu}</p>
    <p class="caps gold" ${R} style="margin-top:10px">${esc(C.inshaAllahClose)}</p>
    <div ${R}>${divider()}</div>
    <p class="script gold-text footer-names" ${R}>${esc(u.footerNames)}</p>
    <p class="italic muted" ${R}>${esc(u.footerLine)}</p>
    <button type="button" class="replay caps" ${R} data-replay>↺ View again</button>
  </div>
</div></footer>`;

const ogCard = () => {
  document.body.classList.add('og', 'entered');
  document.body.classList.remove('locked');
  const card = document.createElement('div');
  card.className = 'og-card';
  card.style.backgroundImage = laceBackground();
  card.innerHTML = `<div class="og-inner">
    <p class="bismillah-ar gold-text og-bismillah" lang="ar" dir="rtl">${C.bismillahAr}</p>
    ${divider()}
    <p class="script gold-text og-names">${esc(C.firstShort)}</p>
    <p class="italic muted og-amp">${u.and}</p>
    <p class="script gold-text og-names">${esc(C.secondShort)}</p>
    <p class="caps gold og-when">NIKAH 14 · VALIMA 15 DEC 2026</p>
  </div>`;
  document.body.appendChild(card);
};

/** 3D sky (Three.js, loaded in the background); the 2D gold dust is the fallback. */
const loadScene = () => import('./scene3d');

const boot = () => {
  if (params.has('og')) {
    ogCard();
    return;
  }
  const app = document.getElementById('app')!;
  app.innerHTML =
    heroHtml() +
    ayahHtml() +
    invitationHtml() +
    C.events.map((e, k) => eventPage(e, k === 0)).join('') +
    countdownHtml() +
    C.events.map((e, k) => venuePage(e, k === 0)).join('') +
    duaHtml() +
    footerHtml();
  const pager = createPager(app);
  app.querySelector('[data-replay]')!.addEventListener('click', () => pager.replay());

  // Once the dates are revealed (by the guest or automatically), turn the pages on their own.
  let scrolling = false;
  const beginAutoScroll = () => {
    // ?noscroll: used by scripts/record.ts, which times its own page turns to the song.
    if (scrolling || reducedMotion || params.has('noscroll')) return;
    scrolling = true;
    window.setTimeout(() => pager.startAuto(), AUTO_SCROLL_DELAY);
  };

  // The scratch bar takes the slot's place (and its position in the hero stagger).
  const slot = app.querySelector<HTMLElement>('[data-scratch-slot]')!;
  const scratch = createScratch(beginAutoScroll);
  scratch.el.setAttribute('data-hero', '');
  scratch.el.style.setProperty('--h', slot.style.getPropertyValue('--h'));
  slot.replaceWith(scratch.el);

  startReveal(app, reducedMotion);
  startCountdown(app.querySelector('#countdown')!);

  // Start downloading the 3D module now; it starts drawing when the doors open.
  const scene = loadScene();
  const startSky = () =>
    scene
      .then((m) => m.startScene(document.getElementById('scene') as HTMLCanvasElement, reducedMotion))
      .catch(() => false)
      .then((ok) => {
        if (!ok && !reducedMotion) startDust(document.getElementById('dust') as HTMLCanvasElement);
      });

  const music = createMusic();
  app.scrollTop = 0;
  mountDoors(
    document.getElementById('doors-root')!,
    () => {
      music.start();
      startSky();
    },
    reducedMotion,
  ).then(() => window.setTimeout(scratch.auto, reducedMotion ? 0 : AUTO_SCRATCH_DELAY));
};

boot();
