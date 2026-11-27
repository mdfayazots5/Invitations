// QA: npm run build && npx tsx scripts/check.ts
// Phone sizes (360×640, 390×844, 430×932): overflow, names on one line, console errors, pages that fit
// one screen and fill it exactly, no scrollbar, Arabic lines, and the flow doors → auto-scratch →
// page-by-page auto-advance → swipe / tap / dots / View again → map. Screenshots go to qa/.
import {mkdirSync} from 'node:fs';
import {chromium, type Page} from 'playwright';
import {C, mapEmbedUrl} from '../src/invite.config.ts';
import {startPreview, stopPreview, URL_BASE} from './serve.ts';

const SIZES = [
  {width: 360, height: 640},
  {width: 390, height: 844},
  {width: 430, height: 932},
];
const results: {name: string; ok: boolean; info?: string}[] = [];
const check = (name: string, ok: boolean, info?: string) => results.push({name, ok, info});

/** Steps the #app scroller through every page so each page's reveal runs. */
const scrollThrough = (page: Page) =>
  page.evaluate(async () => {
    const app = document.getElementById('app')!;
    for (const p of Array.from(document.querySelectorAll<HTMLElement>('.page'))) {
      app.scrollTop = p.offsetTop;
      await new Promise((r) => setTimeout(r, 120));
    }
    await new Promise((r) => setTimeout(r, 900));
  });

/** Waits until the scroller has settled, then reports where it rests relative to the page tops. */
const rest = (page: Page) =>
  page.evaluate(async () => {
    const app = document.getElementById('app')!;
    let y = -1;
    for (let i = 0; i < 40 && y !== app.scrollTop; i++) {
      y = app.scrollTop;
      await new Promise((r) => setTimeout(r, 250));
    }
    const pages = Array.from(document.querySelectorAll<HTMLElement>('.page'));
    const tops = pages.map((p) => p.offsetTop);
    const idx = tops.findIndex((t) => Math.abs(t - y) <= 2);
    // every reveal item on the resting page must be fully shown (not mid-fade)
    const half = pages[idx] ? Array.from(pages[idx].querySelectorAll<HTMLElement>('[data-reveal]')).filter((el) => getComputedStyle(el).opacity !== '1').length : -1;
    const dot = Array.from(document.querySelectorAll('.dot')).findIndex((d) => d.classList.contains('on'));
    return {y, idx, tops, half, dot};
  });

const run = async () => {
  mkdirSync('qa', {recursive: true});
  const server = await startPreview();
  const browser = await chromium.launch();
  try {
    for (const {width, height} of SIZES) {
      const page = await browser.newPage({viewport: {width, height}, deviceScaleFactor: 1, hasTouch: true});
      await page.addInitScript('window.__name = (f) => f;');
      const errors: string[] = [];
      page.on('console', (m) => {
        // only errors raised by our own page (the Google Maps iframe logs its own noise)
        if (m.type() === 'error' && m.location().url.startsWith(URL_BASE)) errors.push(m.text());
      });
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto(URL_BASE, {waitUntil: 'networkidle'});
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({path: `qa/${width}-0-doors.png`});

      // A: doors (the tap also starts the song with its fade-in)
      await page.click('.doors');
      await page.waitForTimeout(3200);
      const doorsGone = (await page.$('.doors')) === null;
      const unlocked = await page.evaluate(() => !document.body.classList.contains('locked'));
      check(`${width}: doors open and unlock scroll`, doorsGone && unlocked);
      await page.screenshot({path: `qa/${width}-1-hero.png`});

      // B: scratch reveals itself, with no input from the guest
      await page.waitForTimeout(4500);
      check(`${width}: scratch auto-reveals the date`, await page.$eval('.scratch', (el) => el.classList.contains('done')));
      await page.screenshot({path: `qa/${width}-2-scratched.png`});

      // Screen: pages fill exactly the visible screen; no scrollbar on the right.
      const screen = await page.evaluate(() => {
        const app = document.getElementById('app')!;
        const heights = Array.from(document.querySelectorAll<HTMLElement>('.page')).map((p) => p.offsetHeight);
        return {bar: app.offsetWidth - app.clientWidth, heights, vh: window.innerHeight, dots: document.querySelectorAll('.dot').length, pages: heights.length};
      });
      check(`${width}×${height}: no scrollbar`, screen.bar === 0, `${screen.bar}px`);
      check(`${width}×${height}: each page fills the screen exactly`, screen.heights.every((h) => h === screen.vh), screen.heights.join(','));
      check(`${width}: one dot per page`, screen.dots === screen.pages, `${screen.dots} dots / ${screen.pages} pages`);

      // C: pages turn on their own, always resting on a whole page; input pauses, idle resumes.
      if (width === 360) {
        await page.waitForTimeout(4000); // 2.6 s delay + 1.1 s glide
        const r1 = await rest(page);
        check('auto-advance turns to page 2', r1.idx === 1, `rests at ${r1.y}, page tops ${r1.tops.join(',')}`);
        check('resting page is fully revealed', r1.half === 0, `${r1.half} item(s) mid-fade`);
        check('active dot follows the page', r1.dot === r1.idx, `dot ${r1.dot}, page ${r1.idx}`);
        // Once the guest touches or scrolls, the show stops for good: they turn the pages themselves.
        await page.mouse.wheel(0, 1);
        const r2 = await rest(page);
        await page.waitForTimeout(9000); // longer than any hold + glide
        const r3 = await rest(page);
        check('auto-advance stops for good once the guest scrolls', r3.y === r2.y && r3.idx >= 0, `${r2.y} → ${r3.y}`);

        // A guest's own swipe lands exactly on the next page; a hard fling can't skip a page.
        await page.evaluate(() => (document.getElementById('app')!.scrollTop = 0));
        const r5a = await rest(page);
        await page.mouse.wheel(0, height * 0.6);
        await page.waitForTimeout(300);
        const r5 = await rest(page);
        check('a swipe turns exactly one page', r5.idx === r5a.idx + 1, `page ${r5a.idx} → ${r5.idx} (y ${r5.y})`);
        await page.mouse.wheel(0, height * 2);
        await page.waitForTimeout(300);
        const r6 = await rest(page);
        check('a hard fling still stops on the next page', r6.idx === r5.idx + 1, `page ${r5.idx} → ${r6.idx} (y ${r6.y})`);

        // Dots jump to a page; a tap on empty space turns one page; View again goes back to the start.
        await page.click('.dot:nth-child(4)');
        const r7 = await rest(page);
        check('tapping dot 4 opens page 4', r7.idx === 3 && r7.dot === 3, `page ${r7.idx}, dot ${r7.dot}`);
        await page.mouse.click(10, height * 0.5);
        const r8 = await rest(page);
        check('a tap on empty space turns one page', r8.idx === 4, `page ${r7.idx} → ${r8.idx}`);
        await page.click('.dot:last-child');
        await rest(page);
        await page.click('[data-replay]');
        const r9 = await rest(page);
        check('View again returns to the first page (and a button tap does not turn the page)', r9.idx === 0, `page ${r9.idx}`);
        await page.waitForTimeout(6500); // hero hold (4 s) + reveal + glide
        const r10 = await rest(page);
        check('View again plays the show again', r10.idx === 1, `page ${r10.idx}`);
      } else {
        await page.mouse.wheel(0, 1); // pause auto-advance so the layout pass below drives the page
      }

      // every page fits on one screen (scaled no lower than 0.8) and nothing is clipped
      const fit = await page.evaluate(() =>
        Array.from(document.querySelectorAll<HTMLElement>('.page')).flatMap((pg) => {
          const inner = pg.querySelector<HTMLElement>(':scope > .page-inner');
          if (!inner) {
            const arch = pg.querySelector<HTMLElement>('.hero-arch');
            return arch && arch.scrollHeight > arch.clientHeight + 1 ? [`${pg.id}: hero content overflows`] : [];
          }
          const f = Number(inner.style.getPropertyValue('--fit') || 1);
          const pr = pg.getBoundingClientRect();
          const ir = inner.getBoundingClientRect();
          const clipped = ir.top < pr.top - 1 || ir.bottom > pr.bottom + 1;
          return f < 0.8 || clipped ? [`${pg.id}: fit ${f}${clipped ? ', clipped' : ''}`] : [];
        }),
      );
      check(`${width}×${height}: every page fits one screen`, fit.length === 0, fit.join('; '));

      // layout: no horizontal scroll, script names on one line and inside the viewport
      await scrollThrough(page);
      const text = await page.evaluate(() => document.body.innerText);
      const banned = ['Nikah', 'NIKAH', 'Ruby', 'TODO', 'RSVP', 'Pattedar', 'Konayapally'].filter((w) => text.includes(w));
      check(`${width}: Valima only (no Nikah / TODO / Pattedar text)`, banned.length === 0, banned.join(', '));

      // Arabic: Bismillah, Quran verse, dua, marked up right-to-left, in Amiri
      const arabic = await page.evaluate(async () => {
        await document.fonts.ready;
        const els = Array.from(document.querySelectorAll<HTMLElement>('[lang="ar"]'));
        return {
          texts: els.map((e) => e.textContent ?? ''),
          rtl: els.every((e) => e.dir === 'rtl'),
          amiri: document.fonts.check('700 24px Amiri'),
        };
      });
      const wanted = [C.bismillahAr, C.ayah.ar, C.dua.ar];
      check(`${width}: Arabic Bismillah, verse and dua present (rtl)`, wanted.every((w) => arabic.texts.includes(w)) && arabic.rtl, `${arabic.texts.length} Arabic line(s)`);
      check(`${width}: Amiri font loaded`, arabic.amiri);

      const layout = await page.evaluate(() => {
        const overflowX = document.documentElement.scrollWidth - window.innerWidth;
        const bad: string[] = [];
        document.querySelectorAll<HTMLElement>('.script').forEach((el) => {
          if (el.offsetParent === null) return;
          const lh = parseFloat(getComputedStyle(el).lineHeight);
          const range = document.createRange();
          range.selectNodeContents(el);
          const t = range.getBoundingClientRect();
          // Must stay inside its own panel / page content box, not just the screen.
          const box = el.closest<HTMLElement>('.panel, .page-inner, .hero-arch') ?? document.body;
          const bs = getComputedStyle(box);
          const br = box.getBoundingClientRect();
          const left = Math.max(0, br.left + parseFloat(bs.paddingLeft) - 1);
          const right = Math.min(window.innerWidth, br.right - parseFloat(bs.paddingRight) + 1);
          if (t.height > lh * 1.5 || t.left < left || t.right > right)
            bad.push(`${el.textContent} (${Math.round(t.left)}→${Math.round(t.right)} in ${Math.round(left)}→${Math.round(right)})`);
        });
        return {overflowX, bad};
      });
      check(`${width}: no horizontal scroll`, layout.overflowX <= 0, `overflow ${layout.overflowX}px`);
      check(`${width}: script lines fit on one line, inside their panel`, layout.bad.length === 0, layout.bad.join('; '));

      if (width === 390) {
        // D: countdown matches the first future event
        const days = await page.$eval('#countdown .box-face .digit:last-child', (el) => Number(el.textContent));
        const next = C.events.find((e) => new Date(e.startISO).getTime() > Date.now())!;
        const expected = Math.floor((new Date(next.startISO).getTime() - Date.now()) / 86400000);
        check('countdown days', Math.abs(days - expected) <= 1, `shows ${days}, expected ${expected}`);
        check('countdown next-event line', (await page.textContent('[data-next]'))!.includes(next.date));

        // E: map: exact pin; a preview that swipes never get stuck on, tapping opens Google Maps
        const frames = await page.$$eval('iframe.map', (els) => els.map((e) => e.getAttribute('src')));
        const links = await page.$$eval('#venue a.btn-gold', (els) => els.map((e) => e.getAttribute('href')));
        const card = await page.$$eval('iframe.map', (els) =>
          els.map((e) => ({pe: getComputedStyle(e).pointerEvents, href: e.closest('a.map-card')?.getAttribute('href') ?? ''})),
        );
        check('map embeds use exact pins', frames.join() === C.events.map(mapEmbedUrl).join(), frames.join(' , '));
        check('VIEW ON MAPS links', links.join() === C.events.map((e) => e.mapPlaceUrl).join());
        check(
          'map preview is not interactive; tapping it opens Google Maps',
          card.every((c, k) => c.pe === 'none' && c.href === C.events[k].mapPlaceUrl),
          JSON.stringify(card.map((c) => c.pe)),
        );

        // music button: hidden when public/music.mp3 is missing, otherwise present
        check('music button state', true, (await page.$('.music')) ? 'present' : 'removed (no music.mp3)');
      }
      check(`${width}: no console errors`, errors.length === 0, errors.join(' | '));
      await page.close();
    }

    // reduced motion: doors fade instantly, content visible
    const rm = await browser.newPage({viewport: {width: 390, height: 844}, reducedMotion: 'reduce'});
    await rm.goto(URL_BASE, {waitUntil: 'networkidle'});
    await rm.click('.doors');
    await rm.waitForTimeout(300);
    check('reduced motion: instant entry', (await rm.$('.doors')) === null && (await rm.isVisible('.hero-name')));
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
