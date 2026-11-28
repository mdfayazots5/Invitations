import './styles.css';
import {holdOf, SETTINGS} from './settings';
import {startCountdown} from './countdown';
import {mountDoors} from './doors';
import {startDust} from './dust';
import {C, TEST_MODE, mapEmbedUrl} from './invite.config';
import {createMusic} from './music';
import {divider, laceBackground, stringLights} from './ornaments';
import {createPager} from './pages';
import {startReveal} from './reveal';
import {createScratch} from './scratch';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ?test: the phone tester (shared/autotest), only when TEST_MODE is on in invite.config.ts. Loaded as its own file.
if (TEST_MODE && /[?&](test|autotest)\b/.test(location.search))
  void import('../../shared/autotest').then((m) =>
    m.mountTester({site: 'fayazmd', commit: __COMMIT__, enter: () => document.querySelector<HTMLElement>('#doors-root .doors')?.click()}),
  );
// ?video: the recorded MP4. Hides what only works by tapping (map, buttons, music toggle, page dots, hints).
if (new URLSearchParams(location.search).has('video')) document.body.classList.add('video');
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const R = 'data-reveal';
const u = C.ui;
const valima = C.events[0];

/** Hero stagger: last line lands ~0.6 s + 9 × 120 ms + 0.8 s after the doors finish. */
const AUTO_SCRATCH_DELAY = SETTINGS.scratchDelayMs;
/** Time to enjoy the revealed date before the page starts to drift. */
const AUTO_SCROLL_DELAY = SETTINGS.startDelayMs;

const heroHtml = () => {
  let h = 0;
  const line = (html: string) => html.replace('<p', `<p data-hero style="--h:${h++}"`).replace('<div', `<div data-hero style="--h:${h - 1}"`);
  return `<section class="hero page" id="hero" aria-label="${esc(C.groomShort)} ${u.and} ${esc(C.brideShort)}">
    <div class="hero-arch">
      ${line(`<p class="bismillah-ar gold-text" lang="ar" dir="rtl">${C.bismillahAr}</p>`)}
      ${line(`<p class="bismillah italic muted">${esc(C.bismillahEn)}</p>`)}
      ${line(`<div>${divider()}</div>`)}
      ${line(`<p class="script gold-text hero-name">${esc(C.groomShort)}</p>`)}
      ${line(`<p class="hero-amp italic muted">${u.and}</p>`)}
      ${line(`<p class="script gold-text hero-name">${esc(C.brideShort)}</p>`)}
      ${line(`<p class="italic" style="margin-top:6px">${esc(u.inshaAllah)}</p>`)}
      ${line(`<p class="caps gold" style="margin-top:14px">${esc(C.heroLabel)}</p>`)}
      ${line(`<div data-scratch-slot></div>`)}
      ${line(`<p class="italic muted">${esc(C.scratchSub)}</p>`)}
      <div class="scroll-cue caps" aria-hidden="true">${u.scroll}
        <svg width="18" height="10" viewBox="0 0 18 10"><path d="M1,1 L9,9 L17,1" fill="none" stroke="#C9A24A" stroke-width="1.5"/></svg>
      </div>
    </div>
  </section>`;
};

/** Quran verse page (Ar-Rum 30:21): Arabic, then its meaning. */
const ayahHtml = () => `<section id="ayah" class="page" data-hold="${holdOf('ayah', 7000)}"><div class="page-inner">
  <p class="caps gold" ${R}>${esc(C.ayah.ref)}</p>
  <div ${R}>${divider()}</div>
  <p class="ayah-ar gold-text" ${R} lang="ar" dir="rtl">${C.ayah.ar}</p>
  <div ${R}>${divider()}</div>
  <p class="ayah-en italic" ${R}>“${esc(C.ayah.en)}”</p>
</div></section>`;

const invitationHtml = () => `<section id="invitation" class="page" data-hold="${holdOf('invitation', 7000)}"><div class="page-inner">
  ${stringLights()}
  <p class="caps gold" ${R} style="margin-top:22px">${u.invitationLabel}</p>
  <div ${R}>${divider()}</div>
  <p class="host" ${R}>${esc(C.host)}</p>
  <p class="italic" ${R} style="margin-top:12px">${esc(C.hostLine)}</p>
  <p class="script gold-text name-lg" ${R} style="margin-top:10px">${esc(C.groomFull)}</p>
  <p class="italic" ${R}>${u.with}</p>
  <p class="script gold-text name-lg" ${R}>${esc(C.brideFull)}</p>
  <p class="italic muted" ${R} style="font-size:16px">${esc(C.brideParents)}</p>
  <p class="italic muted" ${R} style="font-size:16px;margin-top:16px">${esc(C.blessings)}</p>
  <p class="quote italic" ${R}>“${esc(C.quote)}”</p>
</div></section>`;

const countdownHtml = () => `<section class="countdown page" id="countdown" data-hold="${holdOf('countdown', 4500)}">
  <div class="page-inner">
  <p class="caps gold" ${R}>${u.countdownLabel}</p>
  <p class="script gold-text title-lg" ${R}>${u.countdownTitle}</p>
  <p class="italic muted" ${R} data-next></p>
  <div class="boxes" ${R} role="timer" aria-live="off">
    ${u.units
      .map((unit) => `<div class="box"><div class="box-face"><span class="digit gold-text"></span></div><span class="caps muted">${unit}</span></div>`)
      .join('')}
  </div>
  <p class="script gold-text title-lg" data-done hidden>${u.alhamdulillah}</p>
  <div style="margin-top:36px">${stringLights()}</div>
  </div>
</section>`;

const venueHtml = (e = valima) => `<section id="venue" class="page" data-hold="${holdOf('venue', 5000)}"><div class="page-inner">
  <p class="caps gold" ${R}>${u.venueLabel}</p>
  <div ${R}>${divider()}</div>
  <div class="venue-block" id="venue-${e.key}">
    <p class="caps" ${R} style="font-size:15px">${esc(e.title.toUpperCase())}</p>
    <p class="script gold-text venue-name" ${R}>${esc(e.venue)}</p>
    <p class="italic" ${R}>${esc(e.address)}</p>
    <p class="venue-when" ${R}>${esc(`${e.day}, ${e.date}`)}<br />${esc(`${e.time} · ${e.note}`)}</p>
    <p class="italic muted" ${R} style="font-size:15px">${esc(e.hijri)}</p>
    <a class="map-card" ${R} href="${esc(e.mapPlaceUrl)}" target="_blank" rel="noopener" aria-label="Open ${esc(e.venue)} in Google Maps">
      <iframe class="map" tabindex="-1" title="${esc(u.mapTitle.replace('{venue}', e.venue))}" loading="lazy"
        referrerpolicy="no-referrer-when-downgrade" src="${mapEmbedUrl(e)}"></iframe>
    </a>
    <a class="btn-gold" ${R} href="${esc(e.mapPlaceUrl)}" target="_blank" rel="noopener">${u.viewOnMaps}</a>
  </div>
</div></section>`;

const footerHtml = () => `<footer class="page" id="closing"><div class="page-inner">
  ${stringLights()}
  <p class="dua-ar gold-text" ${R} lang="ar" dir="rtl" style="margin-top:18px">${C.dua.ar}</p>
  <p class="dua-en italic" ${R}>${esc(C.dua.en)}</p>
  <p class="dua-ref muted" ${R}>(${esc(C.dua.ref)})</p>
  <div ${R} style="margin-top:12px">${divider()}</div>
  <p class="script gold-text footer-names" ${R}>${esc(u.footerNames)}</p>
  <p class="italic muted" ${R}>${esc(C.footerLine)}</p>
  <button type="button" class="replay caps" ${R} data-replay>↺ View again</button>
</div></footer>`;

const ogCard = () => {
  document.body.classList.add('og', 'entered');
  document.body.classList.remove('locked');
  const card = document.createElement('div');
  card.className = 'og-card';
  card.style.backgroundImage = laceBackground();
  card.innerHTML = `<div class="og-inner">
    <p class="italic muted og-bismillah">${esc(C.bismillahEn)}</p>
    ${divider()}
    <p class="script gold-text og-names">${esc(C.groomShort)}</p>
    <p class="italic muted og-amp">${u.and}</p>
    <p class="script gold-text og-names">${esc(C.brideShort)}</p>
    <p class="caps gold og-when">${esc(C.heroLabel)} · 15 DEC 2026</p>
  </div>`;
  document.body.appendChild(card);
};

const boot = () => {
  if (new URLSearchParams(location.search).has('og')) {
    ogCard();
    return;
  }
  const app = document.getElementById('app')!;
  app.innerHTML = heroHtml() + ayahHtml() + invitationHtml() + countdownHtml() + venueHtml() + footerHtml();
  app.querySelector<HTMLElement>('.hero')!.style.backgroundImage = laceBackground();
  const pager = createPager(app);
  app.querySelector('[data-replay]')!.addEventListener('click', () => pager.replay());

  // Once the date is revealed (by the guest or automatically), turn the pages on their own.
  let scrolling = false;
  const beginAutoScroll = () => {
    // ?noscroll: used by scripts/record.ts, which times its own page turns to the 40 s music cut.
    if (scrolling || reducedMotion || new URLSearchParams(location.search).has('noscroll')) return;
    scrolling = true;
    window.setTimeout(() => (SETTINGS.autoAdvance && pager.startAuto()), AUTO_SCROLL_DELAY);
  };

  // The scratch bar takes the slot's place (and its position in the hero stagger).
  const slot = app.querySelector<HTMLElement>('[data-scratch-slot]')!;
  const scratch = createScratch(beginAutoScroll);
  scratch.el.setAttribute('data-hero', '');
  scratch.el.style.setProperty('--h', slot.style.getPropertyValue('--h'));
  slot.replaceWith(scratch.el);

  startReveal(app, reducedMotion);
  startCountdown(app.querySelector('#countdown')!);
  if (!reducedMotion) {
    startDust(document.getElementById('dust') as HTMLCanvasElement);
  }

  const music = createMusic();
  app.scrollTop = 0;
  mountDoors(document.getElementById('doors-root')!, () => music.start(), reducedMotion).then(() =>
    window.setTimeout(scratch.auto, reducedMotion ? 0 : AUTO_SCRATCH_DELAY),
  );
};

boot();
