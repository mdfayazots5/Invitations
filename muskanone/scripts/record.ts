// Records the invite as a true-HD vertical MP4 (1080×1920), like a person opening it on a phone.
// npm run build && npm run record
//
// How it gets real HD: the site loads in a 432×768 frame (so it lays out exactly like a phone) on a
// 1080×1920 page scaled 2.5×. Chrome renders text and vectors at the full size, `?dpr=2.5` makes the
// canvases (3D sky, gold dust) draw at full resolution, and Chrome's screencast captures 1080×1920
// frames with their timestamps. Playwright's own recordVideo can't do this: it captures CSS pixels
// (432×768) and the result had to be upscaled, which looked soft.
//
// Smoothness: capturing 1080×1920 live is slower than 30 fps (about 19 fps on this laptop's GPU), so the
// page runs in slow motion while it's captured: its clock (rAF, performance.now, Date, timers) and its CSS
// animations run at SLOW speed, and the frames are retimed back to real speed. Result: a smooth 30 fps video.
//
// `?video` hides what only works by tapping (maps, buttons, music toggle, page dots, hints);
// `?noscroll` lets this script turn the pages to its own timeline.
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, rmSync, statSync, writeFileSync} from 'node:fs';
import {chromium, type Frame, type Page} from 'playwright';
import {startPreview, stopPreview, URL_BASE} from './serve.ts';

// ── per-site settings ─────────────────────────────────────────────────────────────────────────
const OUT = 'recordings/fayaz-nikah-valima-pastel.mp4';
/** Section id → hold (ms) after its glide (brief §4.3). Countdown, RSVP and venues are hidden in the video
 *  (frozen count / tap-only). About 50 s in all: under WhatsApp Status's 60 s. */
const TIMELINE: [string, number][] = [
  ['#invitation', 8000],
  ['#urdu', 7500],
  ['#nikah', 6500],
  ['#valima', 6500],
  ['#closing', 6000],
];
// ──────────────────────────────────────────────────────────────────────────────────────────────

const MUSIC = 'public/music.mp3';
const FRAMES = 'out/frames';
const PHONE = {width: 432, height: 768};
const SCALE = 2.5; // 432×768 → 1080×1920
const HD = {width: PHONE.width * SCALE, height: PHONE.height * SCALE};
const MAX_MB = 40; // WhatsApp sends files this size fine; quality first
const GLIDE = 1100;
/** Page clock speed while capturing: 0.3 with a GPU, 0.15 with software rendering (set after launch).
 *  Live capture of 1080×1920 runs at roughly 9–20 fps here, so 0.3 keeps every video at 30 fps or better. */
let SLOW = 0.3;

/** Runs in every frame before the page's scripts: slows the page clock to SLOW. */
const TIME_WARP = (k: number) => {
  const pn = performance.now.bind(performance);
  const p0 = pn();
  performance.now = () => p0 + (pn() - p0) * k;
  const dn = Date.now;
  const d0 = dn();
  Date.now = () => d0 + (dn() - d0) * k;
  const raf = window.requestAnimationFrame.bind(window);
  // Hand every frame the warped clock: with CSS animations slowed, Chrome's own rAF timestamps run on a
  // different base than performance.now(), and code comparing the two (the scratch bar) would never finish.
  window.requestAnimationFrame = (cb) => raf(() => cb(performance.now()));
  const st = window.setTimeout.bind(window);
  window.setTimeout = ((fn: TimerHandler, ms?: number, ...a: unknown[]) => st(fn, (ms ?? 0) / k, ...a)) as typeof window.setTimeout;
  const si = window.setInterval.bind(window);
  window.setInterval = ((fn: TimerHandler, ms?: number, ...a: unknown[]) => si(fn, (ms ?? 0) / k, ...a)) as typeof window.setInterval;
};

/** Host page: the site in a phone-sized frame scaled to 1080×1920, plus a fingertip for the tap. */
const host = (src: string) => `<!doctype html><html><head><style>
  html,body{margin:0;width:${HD.width}px;height:${HD.height}px;overflow:hidden;background:#000}
  iframe{border:0;width:${PHONE.width}px;height:${PHONE.height}px;transform:scale(${SCALE});transform-origin:0 0}
  #finger{position:fixed;left:0;top:0;width:170px;height:170px;margin:-85px 0 0 -85px;border-radius:50%;
    background:radial-gradient(circle,rgba(255,255,255,.7) 0%,rgba(255,255,255,.45) 50%,rgba(255,255,255,0) 72%);
    box-shadow:0 10px 40px rgba(0,0,0,.35);pointer-events:none;z-index:9;opacity:0;transition:opacity .25s,transform .12s}
  #finger.on{opacity:1}#finger.down{transform:scale(.85)}
  .ripple{position:fixed;width:170px;height:170px;margin:-85px 0 0 -85px;border-radius:50%;border:4px solid rgba(255,255,255,.9);
    pointer-events:none;z-index:8;animation:fr .6s ease-out forwards}
  @keyframes fr{to{transform:scale(2.4);opacity:0}}
</style></head><body><iframe src="${src}" allow="autoplay"></iframe><div id="finger"></div>
<script>
  const f = document.getElementById('finger');
  let idle = 0;
  const show = (e) => { f.style.left = e.clientX + 'px'; f.style.top = e.clientY + 'px'; f.classList.add('on');
    clearTimeout(idle); idle = setTimeout(() => f.classList.remove('on'), 700); };
  addEventListener('mousemove', show, true);
  addEventListener('mousedown', (e) => { show(e); f.classList.add('down'); const r = document.createElement('div');
    r.className = 'ripple'; r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px'; document.body.appendChild(r);
    setTimeout(() => r.remove(), 650); }, true);
  addEventListener('mouseup', () => f.classList.remove('down'), true);
</script></body></html>`;

/** Waits `ms` of *video* time (the page runs at SLOW speed while capturing). */
const wait = (page: Page, ms: number) => page.waitForTimeout(ms / SLOW);

/** Eased glide of the page scroller #app (easeInOutCubic) to a page top. */
const glideTo = (site: Frame, selector: string, ms = GLIDE) =>
  site.evaluate(
    ([sel, dur]) =>
      new Promise<void>((resolve) => {
        const app = document.getElementById('app')!;
        const target = Math.min(app.scrollHeight - app.clientHeight, document.querySelector<HTMLElement>(sel as string)!.offsetTop);
        const start = app.scrollTop;
        const t0 = performance.now();
        const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
        const step = (now: number) => {
          const t = Math.min(1, (now - t0) / (dur as number));
          app.scrollTop = start + (target - start) * ease(t);
          if (t < 1) requestAnimationFrame(step);
          else resolve();
        };
        requestAnimationFrame(step);
      }),
    [selector, ms] as const,
  );

const tap = async (page: Page, x: number, y: number, travel = 14) => {
  await page.mouse.move(x, y, {steps: travel});
  await page.mouse.down();
  await wait(page, 90);
  await page.mouse.up();
};

const run = async () => {
  rmSync(FRAMES, {recursive: true, force: true});
  mkdirSync(FRAMES, {recursive: true});
  mkdirSync('recordings', {recursive: true});
  const server = await startPreview();
  // SwiftShader WebGL so the 3D sky renders in headless Chromium.
  // Use the GPU when there is one (much faster); SwiftShader is the fallback.
  const browser = await chromium.launch({args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader']});
  const frames: {file: string; t: number}[] = [];
  let endT = 0;
  try {
    const context = await browser.newContext({viewport: HD, deviceScaleFactor: 1});
    const page = await context.newPage();
    // tsx/esbuild wraps named functions in __name(); provide it inside the pages for evaluated callbacks.
    await page.addInitScript('window.__name = (f) => f;');
    // Our eased glide drives every frame; CSS smooth scrolling or snapping would fight it.
    await page.addInitScript(() => {
      addEventListener('DOMContentLoaded', () => {
        document.documentElement.style.scrollBehavior = 'auto';
        const app = document.getElementById('app');
        if (app) app.style.scrollSnapType = 'none';
      });
    });
    // Serve the host page from the site's own origin, so the frame shares its process and the
    // animation-speed setting below applies to it.
    const hostUrl = `${URL_BASE}/__record-host`;
    await page.route(hostUrl, (r) => r.fulfill({contentType: 'text/html', body: host(`${URL_BASE}/?noscroll&video&dpr=${SCALE}`)}));
    await page.goto(hostUrl, {waitUntil: 'load'});
    const site = (await (await page.$('iframe'))!.contentFrame())!;
    const gl = await site.evaluate(() => {
      const c = document.createElement('canvas').getContext('webgl');
      const e = c?.getExtension('WEBGL_debug_renderer_info');
      return e ? String(c!.getParameter(e.UNMASKED_RENDERER_WEBGL)) : 'none';
    });
    if (/swiftshader/i.test(gl)) SLOW = 0.15;
    console.log(`renderer: ${gl.slice(0, 70)} · capture speed ${SLOW}×`);
    // Start the page over with its clock slowed (the warp must be in place before its scripts run).
    await page.addInitScript(TIME_WARP, SLOW);
    await page.reload({waitUntil: 'load'});
    const warped = (await (await page.$('iframe'))!.contentFrame())!;
    await warped.waitForLoadState('networkidle');
    await warped.evaluate(() => document.fonts.ready);
    await wait(page, 300);

    // Capture: every composited frame at 1080×1920, saved with its timestamp.
    const cdp = await context.newCDPSession(page);
    // CSS transitions and animations (doors, reveals, shimmer) slow down with the clock.
    await cdp.send('Animation.enable');
    await cdp.send('Animation.setPlaybackRate', {playbackRate: SLOW});
    cdp.on('Page.screencastFrame', (f) => {
      const file = `${FRAMES}/${String(frames.length).padStart(5, '0')}.jpg`;
      writeFileSync(file, Buffer.from(f.data, 'base64'));
      frames.push({file, t: f.metadata.timestamp ?? Date.now() / 1000});
      void cdp.send('Page.screencastFrameAck', {sessionId: f.sessionId}).catch(() => undefined);
    });
    await cdp.send('Page.startScreencast', {format: 'jpeg', quality: 92, maxWidth: HD.width, maxHeight: HD.height});

    // 0–1.4 s: idle on the doors, then tap them; opening + walk-through
    await page.mouse.move(HD.width * 0.7, HD.height * 0.95);
    await wait(page, 1400);
    await tap(page, HD.width / 2, HD.height * 0.5, 18);
    await wait(page, 3200);
    // hero hold while the gold bar scratches itself and the dates appear
    await warped.waitForSelector('.scratch.done', {timeout: 8000 / SLOW});
    await wait(page, 1500);

    // Page by page, like the site's own auto-advance: glide, then hold each page to read it.
    for (const [sel, hold] of TIMELINE) {
      await glideTo(warped, sel);
      await wait(page, hold);
    }
    endT = Date.now() / 1000;
    await cdp.send('Page.stopScreencast');
    await context.close();
  } finally {
    await browser.close();
    stopPreview(server);
  }
  if (frames.length < 10) throw new Error(`only ${frames.length} frames captured`);

  // Frames arrive only when something changes: give each one its real on-screen duration.
  const t0 = frames[0].t;
  const last = Math.max(endT, frames[frames.length - 1].t + 1 / 30 / SLOW);
  const lines = frames.flatMap((f, i) => {
    const next = i + 1 < frames.length ? frames[i + 1].t : last;
    return [`file '${f.file.split('/').pop()}'`, `duration ${Math.max(0.001, (next - f.t) * SLOW).toFixed(4)}`];
  });
  lines.push(`file '${frames[frames.length - 1].file.split('/').pop()}'`); // concat demuxer needs the last file twice
  writeFileSync(`${FRAMES}/list.txt`, lines.join('\n'));
  const dur = (last - t0) * SLOW; // video seconds

  const hasMusic = existsSync(MUSIC);
  const encode = (crf: number) => {
    const args = ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', `${FRAMES}/list.txt`];
    // Loop the song if the video runs past the 40 s track; it rises gently and fades out at the end.
    if (hasMusic) args.push('-stream_loop', '-1', '-i', MUSIC);
    args.push(
      '-vf', `fps=30,scale=${HD.width}:${HD.height}:flags=lanczos,format=yuv420p`,
      '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow', '-crf', String(crf), '-movflags', '+faststart',
    );
    if (hasMusic) {
      args.push(
        '-filter_complex',
        `[1:a]atrim=0:${dur.toFixed(2)},afade=t=in:d=2.5,afade=t=out:st=${(dur - 1.5).toFixed(2)}:d=1.5[a]`,
        '-map', '0:v', '-map', '[a]', '-c:a', 'aac', '-b:a', '192k', '-shortest',
      );
    } else args.push('-an');
    args.push('-t', dur.toFixed(2), OUT);
    execFileSync('ffmpeg', args, {stdio: 'inherit'});
  };

  let crf = 18;
  encode(crf);
  while (statSync(OUT).size / 1e6 > MAX_MB && crf < 26) {
    crf += 2;
    console.log(`> ${MAX_MB} MB, re-encoding at crf ${crf}`);
    encode(crf);
  }
  rmSync(FRAMES, {recursive: true, force: true});
  const probe = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height:format=duration', '-of', 'csv=p=0', OUT])
    .toString()
    .trim()
    .replace(/\s+/g, ' ');
  console.log(
    `\n${OUT}\n${probe} · ${(statSync(OUT).size / 1e6).toFixed(1)} MB · crf ${crf} · ${frames.length} frames (${(frames.length / dur).toFixed(0)} fps captured) · music: ${hasMusic ? 'yes' : 'none'}`,
  );
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
