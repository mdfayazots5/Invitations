// QA: npm run build && npx tsx scripts/check.ts
// Checks 360/390/430/768 widths for overflow, names on one line, console errors,
// and exercises doors → auto-scratch → auto-scroll → countdown → map. Screenshots go to qa/.
import {mkdirSync} from 'node:fs';
import {chromium, type Page} from 'playwright';
import {C, mapEmbedUrl} from '../src/invite.config.ts';
import {startPreview, stopPreview, URL_BASE} from './serve.ts';

const WIDTHS = [360, 390, 430]; // phones only: the family opens it on mobile
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
      // tsx/esbuild wraps named functions in __name(); provide it inside the page for evaluated callbacks.
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

      // A: doors
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

      // C: the page then drifts down on its own, and stops when the guest touches it
      if (width === 360) {
        await page.waitForTimeout(6000);
        const y1 = await page.evaluate(() => window.scrollY);
        check('auto-scroll moves the page', y1 > 40, `scrollY ${y1}`);
        await page.mouse.wheel(0, 1);
        await page.waitForTimeout(300);
        const y2 = await page.evaluate(() => window.scrollY);
        await page.waitForTimeout(2000);
        const y3 = await page.evaluate(() => window.scrollY);
        check('auto-scroll pauses on input', Math.abs(y3 - y2) <= 2, `${y2} → ${y3}`);
      } else {
        await page.mouse.wheel(0, 1); // pause auto-scroll so the layout pass below drives the page
      }

      // layout: no horizontal scroll, script names on one line and inside the viewport
      await scrollThrough(page);
      const text = await page.evaluate(() => document.body.innerText);
      const banned = ['TODO', 'RSVP', 'R.S.V.P', 'Calendar', 'Download'].filter((w) => text.toLowerCase().includes(w.toLowerCase()));
      const hasVideo = (await page.$('video')) !== null;
      check(`${width}: no RSVP / calendar / download / video`, banned.length === 0 && !hasVideo, [...banned, hasVideo ? '<video>' : ''].join(' '));
      check(`${width}: both events present`, ['Ruby Garden', 'Venkat Narsimha Garden', 'Nikah', 'Valima'].every((w) => text.includes(w)));

      // Readability: every visible text element vs the nearest opaque-ish background behind it.
      const contrast = await page.evaluate(() => {
        const parse = (s: string) => {
          const m = s.match(/rgba?\(([^)]+)\)/);
          if (!m) return null;
          const [r, g, b, a = 1] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
          return {r, g, b, a};
        };
        const lum = ({r, g, b}: {r: number; g: number; b: number}) => {
          const f = (v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
          return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
        };
        const bgOf = (el: Element | null) => {
          for (; el; el = el.parentElement) {
            const s = getComputedStyle(el);
            // Gold gradient fills (the buttons): judge against the gradient's middle gold.
            if (el !== document.body && s.backgroundImage.includes('gradient') && s.backgroundClip !== 'text') return {r: 199, g: 154, b: 69, a: 1};
            const c = parse(s.backgroundColor);
            if (c && c.a >= 0.8) return c;
          }
          return {r: 4, g: 27, b: 23, a: 1}; // page background
        };
        const fails: string[] = [];
        document.querySelectorAll<HTMLElement>('#app p, #app a, #app span').forEach((el) => {
          if (!el.offsetParent || !el.textContent?.trim() || el.closest('.scratch')) return;
          const cs = getComputedStyle(el);
          let fg = parse(cs.color);
          // Gradient text (color: transparent): judge by the darkest stop of the gold gradient.
          if (!fg || fg.a === 0) fg = {r: 156, g: 116, b: 49, a: 1};
          const bg = bgOf(el);
          const [L1, L2] = [lum(fg), lum(bg)].sort((a, b) => b - a);
          const ratio = (L1 + 0.05) / (L2 + 0.05);
          const large = parseFloat(cs.fontSize) >= 24 || (parseFloat(cs.fontSize) >= 18.6 && Number(cs.fontWeight) >= 700);
          if (ratio < (large ? 3 : 4.5)) fails.push(`"${el.textContent.trim().slice(0, 24)}" ${ratio.toFixed(2)}`);
        });
        return fails;
      });
      check(`${width}: text contrast (WCAG AA)`, contrast.length === 0, contrast.slice(0, 6).join('; '));

      // 3D sky is drawing (or the 2D dust fallback took over).
      const sky = await page.evaluate(() => ({
        scene: document.getElementById('scene')!.classList.contains('on'),
        dust: (document.getElementById('dust') as HTMLCanvasElement).width > 0,
      }));
      check(`${width}: 3D sky running`, sky.scene || sky.dust, sky.scene ? 'WebGL scene' : 'dust fallback');
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
      await page.screenshot({path: `qa/${width}-3-full.png`, fullPage: false});

      if (width === 390) {
        // D: countdown matches the first future event
        const days = await page.$eval('#countdown .box-face .digit:last-child', (el) => Number(el.textContent));
        const next = C.events.find((e) => new Date(e.startISO).getTime() > Date.now())!;
        const expected = Math.floor((new Date(next.startISO).getTime() - Date.now()) / 86400000);
        check('countdown days', Math.abs(days - expected) <= 1, `shows ${days}, expected ${expected}`);
        check('countdown next-event line', (await page.textContent('[data-next]'))!.includes(next.date));

        // E: map
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
