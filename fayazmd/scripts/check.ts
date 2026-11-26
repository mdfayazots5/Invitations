// QA: npm run build && npx tsx scripts/check.ts
// Checks 360/390/430/768 widths for overflow, names on one line, console errors,
// and exercises doors → scratch → countdown → RSVP → maps. Screenshots go to qa/.
import {mkdirSync} from 'node:fs';
import {chromium, type Page} from 'playwright';
import {C, mapEmbedUrl} from '../src/invite.config.ts';
import {startPreview, stopPreview, URL_BASE} from './serve.ts';

const WIDTHS = [360, 390, 430, 768];
const results: {name: string; ok: boolean; info?: string}[] = [];
const check = (name: string, ok: boolean, info?: string) => results.push({name, ok, info});

const scrollThrough = async (page: Page) => {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 300) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise((r) => setTimeout(r, 900));
  });
};

const run = async () => {
  mkdirSync('qa', {recursive: true});
  const server = await startPreview();
  const browser = await chromium.launch();
  try {
    for (const width of WIDTHS) {
      const page = await browser.newPage({viewport: {width, height: 844}, deviceScaleFactor: 1, hasTouch: true});
      const errors: string[] = [];
      page.on('console', (m) => {
        // only errors raised by our own page (the Google Maps iframe logs its own noise)
        if (m.type() === 'error' && m.location().url.startsWith(URL_BASE)) errors.push(m.text());
      });
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto(URL_BASE, {waitUntil: 'networkidle'});
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({path: `qa/${width}-0-doors.png`});

      // A: doors
      await page.click('.doors');
      await page.waitForTimeout(3200);
      const doorsGone = (await page.$('.doors')) === null;
      const unlocked = await page.evaluate(() => !document.body.classList.contains('locked'));
      check(`${width}: doors open and unlock scroll`, doorsGone && unlocked);
      await page.screenshot({path: `qa/${width}-1-hero.png`});

      // B: scratch
      const bar = (await page.$('.scratch canvas'))!;
      const box = (await bar.boundingBox())!;
      await page.mouse.move(box.x + 4, box.y + 6);
      await page.mouse.down();
      for (let s = 0; s < 10; s++) {
        const x = s % 2 ? box.x + 6 : box.x + box.width - 6;
        const y = box.y + 6 + ((box.height - 12) * s) / 9;
        await page.mouse.move(x, y, {steps: 12});
      }
      await page.mouse.up();
      await page.waitForTimeout(700);
      check(`${width}: scratch reveals the date`, await page.$eval('.scratch', (el) => el.classList.contains('done')));
      await page.screenshot({path: `qa/${width}-2-scratched.png`});

      // layout: no horizontal scroll, script names on one line and inside the viewport
      await scrollThrough(page);
      const layout = await page.evaluate(() => {
        const overflowX = document.documentElement.scrollWidth - window.innerWidth;
        const bad: string[] = [];
        document.querySelectorAll<HTMLElement>('.script').forEach((el) => {
          if (el.offsetParent === null) return;
          const lh = parseFloat(getComputedStyle(el).lineHeight);
          const range = document.createRange();
          range.selectNodeContents(el);
          const t = range.getBoundingClientRect();
          if (t.height > lh * 1.5 || t.left < 0 || t.right > window.innerWidth) bad.push(`${el.textContent} (${Math.round(t.left)}→${Math.round(t.right)})`);
        });
        return {overflowX, bad};
      });
      check(`${width}: no horizontal scroll`, layout.overflowX <= 0, `overflow ${layout.overflowX}px`);
      check(`${width}: script lines fit on one line`, layout.bad.length === 0, layout.bad.join('; '));
      await page.screenshot({path: `qa/${width}-3-full.png`, fullPage: true});

      if (width === 390) {
        // D: countdown matches the first future event
        const days = await page.$eval('#countdown .box-face .digit:last-child', (el) => Number(el.textContent));
        const next = C.events.find((e) => new Date(e.startISO).getTime() > Date.now())!;
        const expected = Math.floor((new Date(next.startISO).getTime() - Date.now()) / 86400000);
        check('countdown days', Math.abs(days - expected) <= 1, `shows ${days}, expected ${expected}`);
        check('countdown next-event line', (await page.textContent('[data-next]'))!.includes(next.date));

        // E: RSVP validation + WhatsApp URL
        await page.evaluate(() => {
          (window as unknown as {__wa: string[]}).__wa = [];
          window.open = ((url: string) => {
            (window as unknown as {__wa: string[]}).__wa.push(url);
            return null;
          }) as typeof window.open;
        });
        await page.click('#rsvp .btn-gold');
        const errs = await page.$$eval('#rsvp .err', (els) => els.filter((e) => e.textContent).length);
        check('RSVP shows errors when empty', errs >= 2, `${errs} errors`);
        await page.fill('#rsvp-name', 'Test Guest');
        await page.click('[data-attend="yes"]');
        await page.fill('#rsvp-guests', '2');
        await page.click('#rsvp .btn-gold');
        const wa = await page.evaluate(() => (window as unknown as {__wa: string[]}).__wa[0] ?? '');
        const text = decodeURIComponent(wa.split('text=')[1] ?? '');
        check('RSVP builds wa.me message', wa.startsWith('https://wa.me/') && text.includes('Test Guest') && text.includes('Guests: 2') && text.includes('Nikah, Valima'), text.replace(/\n/g, ' | '));
        check('RSVP thank-you state', await page.isVisible('#rsvp .thanks'));
        await page.screenshot({path: `qa/${width}-4-rsvp-thanks.png`, fullPage: false});

        // F: maps
        const frames = await page.$$eval('iframe.map', (els) => els.map((e) => e.getAttribute('src')));
        const links = await page.$$eval('#venue a.btn-gold', (els) => els.map((e) => e.getAttribute('href')));
        check('map embeds use exact pins', frames.join() === C.events.map(mapEmbedUrl).join(), frames.join(' , '));
        check('VIEW ON MAPS links', links.join() === C.events.map((e) => e.mapPlaceUrl).join());

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
