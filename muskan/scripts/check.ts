// QA: npm run build && npm run check
// Phone sizes (360×640, 390×844, 430×932): no sideways scroll, no console errors, the flow
// curtain → palace hall → auto-drift → auto-scratch, every section present, names on one line, Arabic in Amiri,
// text contrast (WCAG AA), the WhatsApp RSVP, the maps, and reduced motion. Screenshots go to qa/.
import {mkdirSync} from 'node:fs';
import {chromium} from 'playwright';
import {C, mapEmbedUrl} from '../src/invite.config.ts';
import {startPreview, stopPreview, URL_BASE} from './serve.ts';

const SIZES = [
  {width: 360, height: 640},
  {width: 390, height: 844},
  {width: 430, height: 932},
];
const SECTIONS = ['hero', 'date', 'invitation', 'events', 'countdown', 'rsvp', 'venues', 'closing'];
const results: {name: string; ok: boolean; info?: string}[] = [];
const check = (name: string, ok: boolean, info?: string) => results.push({name, ok, info});

const run = async () => {
  mkdirSync('qa', {recursive: true});
  const server = await startPreview();
  // CHROME_PATH: use an already-installed Chromium instead of Playwright's download.
  const browser = await chromium.launch({executablePath: process.env.CHROME_PATH || undefined});
  try {
    for (const {width, height} of SIZES) {
      const page = await browser.newPage({viewport: {width, height}, deviceScaleFactor: 1, hasTouch: true});
      // tsx adds __name() calls to functions passed to page.evaluate; give the page a no-op one.
      await page.addInitScript('window.__name = (f) => f;');
      const errors: string[] = [];
      page.on('console', (m) => {
        // only errors from our own page (the Google Maps iframe logs its own noise)
        if (m.type() === 'error' && m.location().url.startsWith(URL_BASE)) errors.push(m.text());
      });
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto(URL_BASE, {waitUntil: 'networkidle'});
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({path: `qa/${width}-0-curtain.png`});
      check(`${width}: curtain shows the ${C.monogram.join(' & ')} crest`, (await page.textContent('.crest'))?.replace(/\s/g, '') === `${C.monogram[0]}&${C.monogram[1]}`);
      check(`${width}: page is locked behind the curtain`, await page.evaluate(() => document.body.classList.contains('locked')));

      // Curtain opens (the tap also starts the song) and the hall comes in
      await page.mouse.click(width / 2, height * 0.7);
      await page.waitForTimeout(3200);
      check(`${width}: curtain opens and unlocks scrolling`, (await page.$('.curtain')) === null && !(await page.evaluate(() => document.body.classList.contains('locked'))));
      await page.screenshot({path: `qa/${width}-1-hall.png`});

      // Auto-drift glides to the scratch card and scratches it by itself
      await page.waitForTimeout(9000);
      const drift = await page.evaluate(() => ({y: scrollY, done: document.querySelector('.scratch')!.classList.contains('done')}));
      check(`${width}: page drifts down on its own`, drift.y > 0, `scrollY ${drift.y}`);
      check(`${width}: scratch card reveals the dates on its own`, drift.done);
      check(`${width}: revealed dates text`, (await page.textContent('.scratch-reveal'))?.trim() === C.scratchReveal);

      // The first scroll by the guest stops the drift for good
      await page.mouse.wheel(0, 120);
      await page.waitForTimeout(400);
      const y0 = await page.evaluate(() => scrollY);
      await page.waitForTimeout(6000);
      check(`${width}: guest scrolling stops the auto-drift`, (await page.evaluate(() => scrollY)) === y0);

      // Scroll through the whole page like a guest, so every reveal runs
      await page.evaluate(async () => {
        for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.5) {
          scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 150));
        }
      });
      await page.waitForTimeout(1200);
      // A screenshot of each section
      for (const id of SECTIONS) {
        await page.evaluate((id) => document.getElementById(id)!.scrollIntoView(), id);
        await page.waitForTimeout(1100);
        await page.screenshot({path: `qa/${width}-s-${id}.png`});
      }
      check(`${width}: all sections in order`, (await page.$$eval('#app > .sec', (els) => els.map((e) => e.id))).join() === SECTIONS.join());
      const hidden = await page.$$eval('[data-reveal]', (els) => els.filter((e) => getComputedStyle(e).opacity !== '1').length);
      check(`${width}: every revealed item is shown`, hidden === 0, `${hidden} still hidden`);
      check(`${width}: no sideways scroll`, (await page.evaluate(() => document.documentElement.scrollWidth)) <= width);

      // Names and script titles stay on one line
      const wrapped = await page.$$eval('.arch-body .name, .ev-title, .footer-names', (els) =>
        els.filter((e) => e.getBoundingClientRect().height > parseFloat(getComputedStyle(e).lineHeight) * 1.5).map((e) => e.textContent),
      );
      check(`${width}: names and titles on one line`, wrapped.length === 0, wrapped.join(', '));
      const archFits = await page.$$eval('.arch-body .name', (els) => els.every((e) => e.scrollWidth <= e.parentElement!.clientWidth));
      check(`${width}: names fit inside the arch`, archFits);
      check(`${width}: hosts are ${C.host}`, (await page.textContent('#invitation .host'))?.trim() === C.host);

      // Arabic: Bismillah, Quran verse, dua — right-to-left, in Amiri
      const arabic = await page.$$eval('[lang="ar"]', (els) => els.map((e) => ({dir: e.getAttribute('dir'), font: getComputedStyle(e).fontFamily})));
      check(`${width}: Arabic lines (3) are RTL in Amiri`, arabic.length === 3 && arabic.every((a) => a.dir === 'rtl' && a.font.includes('Amiri')));

      // Readability: every visible text vs the background of its part of the page
      const contrast = await page.evaluate(() => {
        const parse = (s: string) => {
          const m = s.match(/rgba?\(([^)]+)\)/);
          if (!m) return null;
          const [r, g, b, a = 1] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
          return {r, g, b, a};
        };
        const hex = (h: string) => ({r: parseInt(h.slice(1, 3), 16), g: parseInt(h.slice(3, 5), 16), b: parseInt(h.slice(5, 7), 16), a: 1});
        const lum = ({r, g, b}: {r: number; g: number; b: number}) => {
          const f = (v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
          return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
        };
        // The lightest part of each background the text can sit on (the worst case for light text,
        // and close enough for dark text on light backgrounds).
        const bgOf = (el: Element) => {
          if (el.closest('.btn-gold')) return hex('#e9b84e');
          if (el.closest('.arch-body')) return hex('#f4cd85');
          if (el.closest('.venue')) return hex('#fcf6f2');
          if (el.closest('.choices button[aria-pressed="true"]')) return hex('#c0182f');
          const sec = el.closest('.sec')?.id;
          return hex(
            {date: '#7a1220', events: '#fbefe8', venues: '#fbefe8', countdown: '#1c0d06', rsvp: '#7a1020', closing: '#b3172b', invitation: '#7a3410'}[sec ?? ''] ??
              '#3a040c',
          );
        };
        const fails: string[] = [];
        document.querySelectorAll<HTMLElement>('#app p, #app a, #app span, #app h2, #app label, #app button').forEach((el) => {
          // the hall's text sits on painted art with its own glow: judged by eye
          if (!el.offsetParent || !el.textContent?.trim() || el.closest('.scratch, .hero, .boxes')) return;
          if (el.children.length && el.tagName !== 'BUTTON') return;
          const cs = getComputedStyle(el);
          const fg = parse(cs.color);
          if (!fg || fg.a === 0) return;
          const [L1, L2] = [lum(fg), lum(bgOf(el))].sort((a, b) => b - a);
          const ratio = (L1 + 0.05) / (L2 + 0.05);
          const large = parseFloat(cs.fontSize) >= 24 || (parseFloat(cs.fontSize) >= 18.6 && Number(cs.fontWeight) >= 700);
          if (ratio < (large ? 3 : 4.5)) fails.push(`"${el.textContent.trim().slice(0, 24)}" ${ratio.toFixed(2)}`);
        });
        return fails;
      });
      check(`${width}: text contrast (WCAG AA)`, contrast.length === 0, contrast.slice(0, 6).join('; '));

      if (width === 390) {
        // RSVP: asks for a name and a choice, then opens WhatsApp with the message
        await page.evaluate(() => {
          (window as unknown as {__opened: string[]}).__opened = [];
          window.open = ((u: string) => {
            (window as unknown as {__opened: string[]}).__opened.push(u);
            return null;
          }) as typeof window.open;
        });
        await page.click('#rsvp .btn-gold');
        check('RSVP asks for a name first', (await page.textContent('.rsvp-err')) === C.ui.rsvpNeedName);
        await page.fill('#rsvp-name', 'Test Guest');
        await page.click('#rsvp .btn-gold');
        check('RSVP asks for Accept / Decline', (await page.textContent('.rsvp-err')) === C.ui.rsvpNeedChoice);
        await page.click('[data-choice="yes"]');
        await page.click('#rsvp .btn-gold');
        const opened = await page.evaluate(() => (window as unknown as {__opened: string[]}).__opened);
        const want = `https://wa.me/${C.rsvpWhatsApp}?text=${encodeURIComponent(C.ui.rsvpMsgYes.replace('{name}', 'Test Guest'))}`;
        check('RSVP opens WhatsApp to the family number with the message', opened[0] === want, opened[0]);

        // Maps: exact pins, and the buttons open the Google Maps place pages
        const frames = await page.$$eval('iframe.map', (els) => els.map((e) => e.getAttribute('src')));
        const links = await page.$$eval('.venue a.btn-outline', (els) => els.map((e) => e.getAttribute('href')));
        check('map embeds use the exact pins', frames.join() === C.events.map(mapEmbedUrl).join());
        check('OPEN IN GOOGLE MAPS links', links.join() === C.events.map((e) => e.mapPlaceUrl).join());

        // View again: back to the top
        await page.click('[data-replay]');
        await page.waitForTimeout(2500);
        check('View again returns to the top', (await page.evaluate(() => scrollY)) === 0);
      }
      check(`${width}: no console errors`, errors.length === 0, errors.join(' | '));
      await page.close();
    }

    // Reduced motion: the curtain opens at once and everything is visible
    const rm = await browser.newPage({viewport: {width: 390, height: 844}, reducedMotion: 'reduce'});
    await rm.addInitScript('window.__name = (f) => f;');
    await rm.goto(URL_BASE, {waitUntil: 'networkidle'});
    await rm.click('.curtain');
    await rm.waitForTimeout(300);
    check('reduced motion: instant entry, hall text visible', (await rm.$('.curtain')) === null && (await rm.$eval('.save', (e) => getComputedStyle(e).opacity)) === '1');
    await rm.close();
  } finally {
    await browser.close();
    stopPreview(server);
  }

  for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.info ? `  — ${r.info}` : ''}`);
  const failed = results.filter((r) => !r.ok).length;
  console.log(failed ? `\n${failed} check(s) failed` : '\nAll checks passed');
  process.exit(failed ? 1 : 0);
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
