// PROMPT 2: record the invite website as a vertical 1080×1920 MP4, like a person opening it on a phone.
// npm run build && npx tsx scripts/record.ts
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, rmSync, statSync} from 'node:fs';
import {chromium, type Page} from 'playwright';
import {startPreview, stopPreview, URL_BASE} from './serve.ts';

const OUT = 'recordings/fayaz-muskan-invite.mp4';
const MUSIC = 'public/music.mp3';
const RAW_DIR = 'out/raw';
// A 432×768 CSS viewport keeps the phone layout. Playwright records the video at CSS-pixel size
// (a larger `size` only pads the frame with grey), so we record 432×768 and ffmpeg scales it to 1080×1920.
const VIEW = {width: 432, height: 768};
const MAX_MB = 16;

/** Fake fingertip: 70px translucent circle that follows the pointer, ripples on press, fades when idle. */
const FINGER = () => {
  const style = document.createElement('style');
  style.textContent = `
    #finger{position:fixed;left:0;top:0;width:70px;height:70px;margin:-35px 0 0 -35px;border-radius:50%;
      background:radial-gradient(circle,rgba(255,255,255,.7) 0%,rgba(255,255,255,.45) 50%,rgba(255,255,255,0) 72%);
      box-shadow:0 4px 18px rgba(0,0,0,.35);pointer-events:none;z-index:2147483647;opacity:0;transition:opacity .25s,transform .12s}
    #finger.on{opacity:1}#finger.down{transform:scale(.85)}
    .finger-ripple{position:fixed;width:70px;height:70px;margin:-35px 0 0 -35px;border-radius:50%;border:2px solid rgba(255,255,255,.9);
      pointer-events:none;z-index:2147483646;animation:fr .6s ease-out forwards}
    @keyframes fr{to{transform:scale(2.4);opacity:0}}`;
  document.documentElement.appendChild(style);
  const f = document.createElement('div');
  f.id = 'finger';
  let idle = 0;
  const show = (e: MouseEvent) => {
    if (!f.isConnected) document.body.appendChild(f);
    f.style.left = `${e.clientX}px`;
    f.style.top = `${e.clientY}px`;
    f.classList.add('on');
    clearTimeout(idle);
    idle = window.setTimeout(() => f.classList.remove('on'), 700);
  };
  addEventListener('mousemove', show, true);
  addEventListener(
    'mousedown',
    (e) => {
      show(e);
      f.classList.add('down');
      const r = document.createElement('div');
      r.className = 'finger-ripple';
      r.style.left = `${e.clientX}px`;
      r.style.top = `${e.clientY}px`;
      document.body.appendChild(r);
      setTimeout(() => r.remove(), 650);
    },
    true,
  );
  addEventListener('mouseup', () => f.classList.remove('down'), true);
};

const wait = (page: Page, ms: number) => page.waitForTimeout(ms);

/** Smooth eased scroll (easeInOutCubic) using rAF steps. */
const scrollTo = (page: Page, selector: string, offset = 0, ms = 1200) =>
  page.evaluate(
    ([sel, off, dur]) =>
      new Promise<void>((resolve) => {
        const el = sel === 'bottom' ? null : document.querySelector<HTMLElement>(sel as string);
        const max = document.documentElement.scrollHeight - innerHeight;
        const target = Math.min(max, el ? el.getBoundingClientRect().top + scrollY + (off as number) : max);
        const start = scrollY;
        const t0 = performance.now();
        const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
        const step = (now: number) => {
          const t = Math.min(1, (now - t0) / (dur as number));
          window.scrollTo(0, start + (target - start) * ease(t));
          if (t < 1) requestAnimationFrame(step);
          else resolve();
        };
        requestAnimationFrame(step);
      }),
    [selector, offset, ms] as const,
  );

const tap = async (page: Page, x: number, y: number, travel = 14) => {
  await page.mouse.move(x, y, {steps: travel});
  await page.mouse.down();
  await wait(page, 90);
  await page.mouse.up();
};

const run = async () => {
  rmSync(RAW_DIR, {recursive: true, force: true});
  mkdirSync(RAW_DIR, {recursive: true});
  mkdirSync('recordings', {recursive: true});
  const server = await startPreview();
  const browser = await chromium.launch();
  let rawPath = '';
  let trimStart = 0;
  try {
    const context = await browser.newContext({
      viewport: VIEW,
      deviceScaleFactor: 2.5,
      isMobile: true,
      hasTouch: true,
      recordVideo: {dir: RAW_DIR, size: VIEW},
    });
    const t0 = Date.now();
    const page = await context.newPage();
    // tsx/esbuild wraps named functions in __name(); provide it inside the page for evaluated callbacks.
    await page.addInitScript('window.__name = (f) => f;');
    await page.addInitScript(FINGER);
    // Our eased rAF scroll drives every frame; CSS smooth-scrolling would fight it and overshoot.
    await page.addInitScript(() => {
      addEventListener('DOMContentLoaded', () => (document.documentElement.style.scrollBehavior = 'auto'));
    });
    await page.goto(`${URL_BASE}/?noscroll`, {waitUntil: 'networkidle'});
    await page.evaluate(() => document.fonts.ready);
    await wait(page, 300);
    trimStart = (Date.now() - t0) / 1000; // drop the blank page-load frames

    // 0–2.5 s: idle on the doors
    await page.mouse.move(VIEW.width * 0.7, VIEW.height * 0.95);
    await wait(page, 1700);
    // 2.5 s: tap the doors, then the opening + walk-through
    await tap(page, VIEW.width / 2, VIEW.height * 0.5, 18);
    await wait(page, 3200);
    // hero hold while the gold bar scratches itself and the date appears
    await page.waitForSelector('.scratch.done', {timeout: 8000});
    await wait(page, 1800);

    // slow, reading-pace scrolls (like the page's own auto-scroll, compressed to fit the music)
    await scrollTo(page, '#invitation', 10, 2200);
    await wait(page, 2400);
    await scrollTo(page, '#invitation .quote', -360, 2200);
    await wait(page, 2400);
    await scrollTo(page, '#countdown', -10, 2200);
    await wait(page, 4000);
    await scrollTo(page, '#venue', -10, 2200);
    await wait(page, 2400);
    await scrollTo(page, '#venue .map', -160, 2000);
    await wait(page, 3000);
    await scrollTo(page, 'bottom', 0, 2000);
    await wait(page, 2400);

    const video = page.video()!;
    await context.close();
    rawPath = await video.path();
  } finally {
    await browser.close();
    stopPreview(server);
  }

  const hasMusic = existsSync(MUSIC);
  const encode = (crf: number) => {
    const dur = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', rawPath]).toString()) - trimStart;
    const args = ['-y', '-v', 'error', '-ss', trimStart.toFixed(2), '-i', rawPath];
    if (hasMusic) args.push('-i', MUSIC);
    args.push('-vf', 'scale=1080:1920:flags=lanczos,fps=30', '-c:v', 'libx264', '-crf', String(crf), '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart');
    if (hasMusic) {
      args.push(
        '-filter_complex',
        `[1:a]atrim=0:${dur.toFixed(2)},afade=t=in:d=1,afade=t=out:st=${(dur - 1.5).toFixed(2)}:d=1.5[a]`,
        '-map', '0:v', '-map', '[a]', '-c:a', 'aac', '-b:a', '160k', '-shortest',
      );
    } else args.push('-an');
    args.push(OUT);
    execFileSync('ffmpeg', args, {stdio: 'inherit'});
  };

  let crf = 17;
  encode(crf);
  while (statSync(OUT).size / 1e6 > MAX_MB && crf < 29) {
    crf += 3;
    console.log(`> ${MAX_MB} MB, re-encoding at crf ${crf}`);
    encode(crf);
  }
  const duration = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', OUT]).toString().trim();
  console.log(`\n${OUT}\nduration ${Number(duration).toFixed(1)} s · ${(statSync(OUT).size / 1e6).toFixed(1)} MB · crf ${crf} · music: ${hasMusic ? 'yes' : 'none (public/music.mp3 missing)'}`);
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
