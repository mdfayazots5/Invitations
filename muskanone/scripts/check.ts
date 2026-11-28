// QA: npm run build && npm run check
// Phone sizes (360×640, 390×844, 430×932): no sideways scroll, no console errors, the flow
// curtain → hero → auto-scratch → auto-drift, every section in order, names on one line, Arabic/Urdu right-to-left
// in their fonts, text contrast (WCAG AA), the WhatsApp RSVP, the map links, and reduced motion. Screenshots go to qa/.
import {existsSync, mkdirSync, readdirSync, readFileSync} from 'node:fs';
import {chromium} from 'playwright';
import {C} from '../src/invite.config.ts';
import {startPreview, stopPreview, URL_BASE} from './serve.ts';

const SIZES = [
  {width: 360, height: 640},
  {width: 390, height: 844},
  {width: 430, height: 932},
];
const SECTIONS = ['hero', 'invitation', 'urdu', 'nikah', 'valima', 'countdown', 'rsvp', 'venues', 'closing'];
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
        if (m.type() === 'error' && m.location().url.startsWith(URL_BASE)) errors.push(m.text());
      });
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto(URL_BASE, {waitUntil: 'networkidle'});
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({path: `qa/${width}-0-curtain.png`});
      check(`${width}: curtain shows the ${C.monogram.join(' & ')} ring`, (await page.textContent('.mono-text'))?.replace(/\s/g, '') === `${C.monogram[0]}&${C.monogram[1]}`);
      check(`${width}: page is locked behind the curtain`, await page.evaluate(() => document.body.classList.contains('locked')));

      // Curtain: drapes slide apart (1.4 s) with a soft bloom; gone after 1.8 s
      await page.mouse.click(width / 2, height * 0.75);
      await page.waitForTimeout(700);
      await page.screenshot({path: `qa/${width}-0b-opening.png`});
      await page.waitForTimeout(1600);
      check(`${width}: curtain opens and unlocks scrolling`, (await page.$('.curtain')) === null && !(await page.evaluate(() => document.body.classList.contains('locked'))));
      await page.waitForTimeout(2400);
      await page.screenshot({path: `qa/${width}-1-hero.png`});

      const card = await page.$eval('.scratch', (e) => e.getBoundingClientRect().bottom);
      check(`${width}: scratch card on the first screen`, card <= height, `bottom ${Math.round(card)}`);
      // The card scratches itself, then the page drifts down on its own
      await page.waitForTimeout(8000);
      const drift = await page.evaluate(() => ({y: scrollY, done: document.querySelector('.scratch')!.classList.contains('done')}));
      check(`${width}: scratch card reveals the dates on its own`, drift.done);
      check(`${width}: revealed dates text`, (await page.textContent('.sr-date'))?.trim() === C.scratchReveal);
      check(`${width}: page drifts down on its own`, drift.y > 0, `scrollY ${drift.y}`);

      // The first scroll by the guest stops the drift for good
      await page.mouse.wheel(0, 120);
      await page.waitForTimeout(400);
      const y0 = await page.evaluate(() => scrollY);
      await page.waitForTimeout(5000);
      check(`${width}: guest scrolling stops the auto-drift`, (await page.evaluate(() => scrollY)) === y0);

      // Scroll through the whole page like a guest, so every reveal runs
      await page.evaluate(async () => {
        for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.5) {
          scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 150));
        }
      });
      await page.waitForTimeout(1500);
      for (const id of SECTIONS) {
        await page.evaluate((id) => document.getElementById(id)!.scrollIntoView(), id);
        await page.waitForTimeout(900);
        await page.screenshot({path: `qa/${width}-s-${id}.png`});
      }
      check(`${width}: all sections in order`, (await page.$$eval('#app > .sec', (els) => els.map((e) => e.id))).join() === SECTIONS.join());
      const hidden = await page.$$eval('[data-reveal], [data-hl]', (els) => els.filter((e) => getComputedStyle(e).opacity !== '1').length);
      check(`${width}: every revealed item is shown`, hidden === 0, `${hidden} still hidden`);
      check(`${width}: no sideways scroll`, (await page.evaluate(() => document.documentElement.scrollWidth)) <= width);
      const tall = await page.$$eval('#app > .sec', (els) => els.filter((e) => e.getBoundingClientRect().height > innerHeight + 2).map((e) => e.id));
      check(`${width}: every section fits one screen`, tall.length === 0, tall.join(', '));

      // Names and script titles stay on one line and inside the screen
      const wrapped = await page.$$eval('.name, .host, .ev-title, .regards, .title', (els) =>
        els
          .filter((e) => e.getBoundingClientRect().height > parseFloat(getComputedStyle(e).lineHeight) * 1.5 || e.scrollWidth > e.clientWidth + 1)
          .map((e) => e.textContent),
      );
      check(`${width}: names and titles on one line`, wrapped.length === 0, wrapped.join(', '));
      check(`${width}: host is ${C.host}`, (await page.textContent('#invitation .host'))?.trim() === C.host);

      const rtl = await page.$$eval('[lang="ar"], [lang="ur"]', (els) =>
        els.map((e) => ({lang: e.getAttribute('lang'), dir: e.getAttribute('dir'), font: getComputedStyle(e).fontFamily})),
      );
      check(
        `${width}: Arabic in Amiri, Urdu in Nastaliq, all right-to-left`,
        rtl.length > 0 && rtl.every((r) => r.dir === 'rtl' && r.font.includes(r.lang === 'ar' ? 'Amiri' : 'Nastaliq')),
      );

      // Readability: every visible text vs the worst-case background behind it
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
        const bgOf = (el: Element) => {
          if (el.closest('.send')) return hex('#e2b765');
          if (el.closest('.pill[aria-pressed="true"].yes')) return hex('#1e6e66');
          if (el.closest('.venue, .rsvp-card')) return hex('#f3ebe0');
          // cream veil over the painting: its darkest likely mix
          if (el.closest('.veil')) return hex('#e9e1d4');
          // plain sky: the darkest blue the text can sit on
          return hex('#a2cbea');
        };
        const fails: string[] = [];
        document.querySelectorAll<HTMLElement>('#app p, #app a, #app span, #app h2, #app label, #app button').forEach((el) => {
          if (!el.offsetParent || !el.textContent?.trim() || el.closest('.scratch, .boxes, .hero')) return;
          if (el.children.length && el.tagName !== 'BUTTON' && el.tagName !== 'A') return;
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
        // RSVP: accept is pre-selected; asks for a name, then opens WhatsApp (same tab) with the message
        let wa = '';
        await page.route('https://wa.me/**', (route) => {
          wa = route.request().url();
          return route.fulfill({status: 204});
        });
        check('RSVP: accept is pre-selected', (await page.getAttribute('[data-choice="yes"]', 'aria-pressed')) === 'true');
        await page.click('#rsvp .send');
        check('RSVP asks for a name first', (await page.textContent('.rsvp-err')) === C.ui.rsvpNeedName);
        await page.fill('#rsvp-name', 'Test Guest');
        await page.click('#rsvp .send');
        await page.waitForTimeout(800);
        const want = `https://wa.me/${C.rsvpWhatsApp}?text=${encodeURIComponent(C.ui.rsvpMsgYes.replace('{name}', 'Test Guest'))}`;
        check('RSVP opens WhatsApp to the family number with the message', decodeURIComponent(wa) === decodeURIComponent(want), wa);

        const links = await page.$$eval('.venue a.maps', (els) => els.map((e) => e.getAttribute('href')));
        check('OPEN IN MAPS links go to the exact places', links.join() === C.events.map((e) => e.mapPlaceUrl).join());

        await page.click('[data-replay]');
        await page.waitForTimeout(3500);
        check('View again returns to the top', (await page.evaluate(() => scrollY)) === 0);
      }
      check(`${width}: no console errors`, errors.length === 0, errors.join(' | '));
      await page.close();
    }

    // 3D world: it runs, draws within budget, and the 2D scenery is hidden under it
    const w3 = await browser.newPage({viewport: {width: 390, height: 844}});
    await w3.addInitScript('window.__name = (f) => f;');
    await w3.goto(`${URL_BASE}/?noscroll`, {waitUntil: 'networkidle'});
    await w3.waitForFunction(() => document.body.classList.contains('webgl'), null, {timeout: 15000}).catch(() => undefined);
    check('3D world runs (WebGL)', await w3.evaluate(() => document.body.classList.contains('webgl')));
    await w3.click('.curtain');
    await w3.waitForTimeout(3500);
    const info = await w3.evaluate(() => (window as unknown as {__world?: {info: () => {calls: number; triangles: number}}}).__world?.info());
    check('3D: under 80 draw calls and 150k triangles', !!info && info.calls < 80 && info.triangles < 150000, JSON.stringify(info));
    check('3D: 2D scenery hidden under the world', await w3.$eval('#hero > .bg', (e) => getComputedStyle(e).display === 'none'));
    await w3.screenshot({path: 'qa/3d-hero.png'});
    await w3.close();

    // No WebGL (?nowebgl): the 2D scenes and CSS drapes carry the page, and it all still works
    const fb = await browser.newPage({viewport: {width: 390, height: 844}});
    await fb.addInitScript('window.__name = (f) => f;');
    const fbErrors: string[] = [];
    fb.on('pageerror', (e) => fbErrors.push(e.message));
    await fb.goto(`${URL_BASE}/?nowebgl`, {waitUntil: 'networkidle'});
    await fb.waitForTimeout(800);
    check('fallback: no 3D canvas, 2D drapes shown', !(await fb.$('#world')) && (await fb.$eval('.drape.left', (e) => getComputedStyle(e).opacity)) === '1');
    await fb.click('.curtain');
    await fb.waitForTimeout(2400);
    check('fallback: 2D scenes visible', await fb.$eval('#hero > .bg', (e) => getComputedStyle(e).display !== 'none'));
    await fb.waitForTimeout(5000);
    check('fallback: scratch card still reveals', await fb.$eval('.scratch', (e) => e.classList.contains('done')));
    check('fallback: no errors', fbErrors.length === 0, fbErrors.join(' | '));
    await fb.screenshot({path: 'qa/fallback-hero.png'});
    await fb.close();

    // Reduced motion: the curtain opens at once and everything is visible
    const rm = await browser.newPage({viewport: {width: 390, height: 844}, reducedMotion: 'reduce'});
    await rm.addInitScript('window.__name = (f) => f;');
    await rm.goto(URL_BASE, {waitUntil: 'networkidle'});
    await rm.click('.curtain');
    await rm.waitForTimeout(400);
    check('reduced motion: instant entry, hero text visible', (await rm.$('.curtain')) === null && (await rm.$eval('.save', (e) => getComputedStyle(e).opacity)) === '1');
    await rm.close();
  } finally {
    await browser.close();
    stopPreview(server);
  }

  // No image art: every visual is code. Nothing in public/art/, and the build references no .webp or /art/ path.
  const built = readdirSync('dist/assets')
    .filter((f) => /\.(js|css)$/.test(f))
    .map((f) => readFileSync(`dist/assets/${f}`, 'utf8'))
    .join('\n') + readFileSync('dist/index.html', 'utf8');
  check('no image art: nothing in public/art/', !existsSync('public/art') || readdirSync('public/art').length === 0);
  check('no image art: build references no .webp or /art/', !/\.webp|\/art\//.test(built));

  for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.info ? `  — ${r.info}` : ''}`);
  const failed = results.filter((r) => !r.ok).length;
  console.log(failed ? `\n${failed} check(s) failed` : '\nAll checks passed');
  process.exit(failed ? 1 : 0);
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
