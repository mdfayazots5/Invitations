import './styles.css';
import {startCountdown} from './countdown';
import {mountDoors} from './doors';
import {startDust} from './dust';
import {startFireworks} from './fireworks';
import {C, mapEmbedUrl} from './invite.config';
import {createMusic} from './music';
import {divider, laceBackground, stringLights} from './ornaments';
import {startReveal} from './reveal';
import {startRsvp} from './rsvp';
import {createScratch} from './scratch';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const R = 'data-reveal';
const u = C.ui;

const heroHtml = () => {
  let h = 0;
  const line = (html: string) => html.replace('<p', `<p data-hero style="--h:${h++}"`).replace('<div', `<div data-hero style="--h:${h - 1}"`);
  return `<section class="hero" id="hero" aria-label="${esc(C.groomShort)} ${u.and} ${esc(C.brideShort)}">
    <div class="hero-arch">
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

const invitationHtml = () => `<section id="invitation">
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
</section>`;

const countdownHtml = () => `<section class="countdown" id="countdown">
  <canvas class="fireworks" aria-hidden="true"></canvas>
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
</section>`;

const rsvpHtml = () => `<section id="rsvp">
  <p class="caps gold" ${R}>${u.rsvpLabel}</p>
  <p class="script gold-text title-lg" ${R}>${u.rsvpTitle}</p>
  <p class="italic" ${R}>${esc(u.rsvpIntro.replace('{deadline}', C.rsvpDeadline))}</p>
  <form class="form" novalidate ${R}>
    <div class="field">
      <label class="caps" for="rsvp-name">${u.name}</label>
      <input class="input" id="rsvp-name" name="name" autocomplete="name" placeholder="${esc(u.namePlaceholder)}" />
      <span class="err" data-err="name" role="alert"></span>
    </div>
    <div class="field">
      <span class="caps" id="att-label">${u.attendance}</span>
      <div class="pills" role="group" aria-labelledby="att-label">
        <button type="button" class="pill" data-attend="yes" aria-pressed="false">${u.joyfully}</button>
        <button type="button" class="pill" data-attend="no" aria-pressed="false">${u.regrets}</button>
      </div>
      <span class="err" data-err="attendance" role="alert"></span>
    </div>
    <div class="field">
      <label class="caps" for="rsvp-guests">${u.guests}</label>
      <input class="input small" id="rsvp-guests" name="guests" type="number" inputmode="numeric" min="1" max="20" value="1" />
      <span class="err" data-err="guests" role="alert"></span>
    </div>
    <div class="field" data-events-field>
      <span class="caps" id="ev-label">${u.eventsLabel}</span>
      <div class="pills" role="group" aria-labelledby="ev-label">
        ${C.events.map((e) => `<button type="button" class="pill" data-event="${e.key}" data-label="${esc(e.title)}" aria-pressed="true">${esc(e.pill)}</button>`).join('')}
      </div>
      <span class="err" data-err="events" role="alert"></span>
    </div>
    <button type="submit" class="btn-gold">${u.send}</button>
  </form>
  <div class="thanks" hidden>
    <p class="script gold-text title-lg">${u.thanksTitle}</p>
    <p class="italic">${u.thanksLine}</p>
  </div>
  ${C.contacts
    .map(
      (c) => `<div class="contact" ${R}><span class="caps gold">${esc(c.name)}</span><span aria-hidden="true">☎</span>
        <a href="tel:${c.phone.replace(/[^\d+]/g, '')}">${esc(c.phone)}</a></div>`,
    )
    .join('')}
</section>`;

const venueHtml = () => `<section id="venue">
  ${stringLights()}
  <p class="caps gold" ${R} style="margin-top:22px">${u.venueLabel}</p>
  <div ${R}>${divider()}</div>
  ${C.events
    .map(
      (e) => `<div class="venue-block" id="venue-${e.key}">
      <p class="caps" ${R} style="font-size:15px">${esc(e.title.toUpperCase())}</p>
      <p class="script gold-text venue-name" ${R}>${esc(e.venue)}</p>
      <p class="italic" ${R}>${esc(e.address)}</p>
      <p class="muted" ${R} style="font-size:15px">${esc(`${e.day}, ${e.date} · ${e.time} · ${e.note}`)}</p>
      <iframe class="map" ${R} title="${esc(u.mapTitle.replace('{venue}', e.venue))}" loading="lazy"
        referrerpolicy="no-referrer-when-downgrade" src="${mapEmbedUrl(e)}"></iframe>
      <a class="btn-gold" ${R} href="${esc(e.mapPlaceUrl)}" target="_blank" rel="noopener">${u.viewOnMaps}</a>
    </div>`,
    )
    .join('')}
</section>`;

const footerHtml = () => `<footer>
  <div ${R}>${divider()}</div>
  <p class="script gold-text footer-names" ${R}>${esc(u.footerNames)}</p>
  <p class="italic muted" ${R}>${esc(C.footerLine)}</p>
</footer>`;

const ogCard = () => {
  document.body.classList.add('og', 'entered');
  document.body.classList.remove('locked');
  const card = document.createElement('div');
  card.className = 'og-card';
  card.style.backgroundImage = laceBackground();
  card.innerHTML = `<div class="og-inner">
    <p class="italic muted" style="font-size:24px">${esc(C.bismillahEn)}</p>
    ${divider()}
    <p class="script gold-text og-names">${esc(u.footerNames)}</p>
    <p class="caps gold" style="font-size:20px;margin-top:8px">${esc(C.heroLabel)} · 14 &amp; 15 DECEMBER 2026</p>
  </div>`;
  document.body.appendChild(card);
};

const boot = () => {
  if (new URLSearchParams(location.search).has('og')) {
    ogCard();
    return;
  }
  const app = document.getElementById('app')!;
  app.innerHTML = heroHtml() + invitationHtml() + countdownHtml() + rsvpHtml() + venueHtml() + footerHtml();
  app.querySelector<HTMLElement>('.hero')!.style.backgroundImage = laceBackground();
  // The scratch bar takes the slot's place (and its position in the hero stagger).
  const slot = app.querySelector<HTMLElement>('[data-scratch-slot]')!;
  const bar = createScratch();
  bar.setAttribute('data-hero', '');
  bar.style.setProperty('--h', slot.style.getPropertyValue('--h'));
  slot.replaceWith(bar);

  startReveal(app, reducedMotion);
  startCountdown(app.querySelector('#countdown')!);
  startRsvp(app.querySelector('#rsvp')!);
  if (!reducedMotion) {
    startDust(document.getElementById('dust') as HTMLCanvasElement);
    const cd = app.querySelector<HTMLElement>('#countdown')!;
    startFireworks(cd, cd.querySelector('canvas')!);
  }

  const music = createMusic();
  window.scrollTo(0, 0);
  mountDoors(document.getElementById('doors-root')!, () => music.start(), reducedMotion);
};

boot();
