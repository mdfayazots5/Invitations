/**
 * Phone autotest for any invite site.
 *
 * Shown only when the site's `TEST_MODE` is true AND the link has `?test`.
 * Tapping 🧪 reloads the page as `?test&autotest=<runId>` and then, without any touch:
 *   1. taps the doors/curtain and lets the site's own show (scratch card, auto-scroll) play,
 *      measuring every frame and taking a screenshot each time a new section fills the screen;
 *   2. scrolls top→bottom at a steady speed (smoothness), then visits each section for a
 *      screenshot and layout checks;
 *   3. uploads report.json + screenshots to /api/autotest (netlify/functions/autotest.mts),
 *      and says "Done testing".
 * `node scripts/pull-autotest.mjs` (repo root) downloads every run.
 */

export type TesterOptions = {
  /** Folder name, e.g. "fayaz". */
  site: string;
  /** Taps the site's doors / curtain. */
  enter: () => void;
  /** Deployed commit (Netlify COMMIT_REF), for the report. */
  commit?: string;
};

type Level = 'log' | 'info' | 'warn' | 'error' | 'debug';
type LogEntry = {t: number; level: Level | 'exception' | 'rejection' | 'resource'; msg: string};
type Shot = {file: string; section: string; phase: string; t: number; ms: number; blob: Blob | null; error?: string};
type FrameStats = {
  frames: number;
  seconds: number;
  avgFps: number;
  p95FrameMs: number;
  worstFrameMs: number;
  droppedPct: number;
  freezes: number;
};

const UI_ID = '__autotest';
const t0 = performance.now();
const now = () => Math.round(performance.now() - t0);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const round = (n: number, d = 1) => Math.round(n * 10 ** d) / 10 ** d;

// ───────────────────────── collectors (start on mount) ─────────────────────────

const logs: LogEntry[] = [];
const timeline: {t: number; event: string}[] = [];
const perf = {fcp: 0, lcp: 0, cls: 0, longTasks: [] as {t: number; ms: number}[]};
const mark = (event: string) => timeline.push({t: now(), event});

const str = (a: unknown): string => {
  if (a instanceof Error) return `${a.name}: ${a.message}${a.stack ? `\n${a.stack.split('\n').slice(1, 4).join('\n')}` : ''}`;
  if (typeof a === 'string') return a;
  try {
    return JSON.stringify(a);
  } catch {
    return String(a);
  }
};
const pushLog = (level: LogEntry['level'], msg: string) => {
  if (logs.length < 800) logs.push({t: now(), level, msg: msg.slice(0, 2000)});
};

const startCollectors = () => {
  for (const level of ['log', 'info', 'warn', 'error', 'debug'] as Level[]) {
    const orig = console[level].bind(console);
    console[level] = (...args: unknown[]) => {
      pushLog(level, args.map(str).join(' '));
      orig(...args);
    };
  }
  addEventListener(
    'error',
    (e) => {
      const el = e.target as Element | null;
      if (el && el !== (window as unknown) && 'tagName' in el) {
        const src = (el as HTMLImageElement).src || (el as HTMLLinkElement).href || '';
        pushLog('resource', `${el.tagName.toLowerCase()} failed to load: ${src}`);
      } else pushLog('exception', `${(e as ErrorEvent).message} @ ${(e as ErrorEvent).filename}:${(e as ErrorEvent).lineno}`);
    },
    true,
  );
  addEventListener('unhandledrejection', (e) => pushLog('rejection', str(e.reason)));
  document.addEventListener('visibilitychange', () => mark(`page ${document.visibilityState}`));

  const observe = (type: string, cb: (list: PerformanceObserverEntryList) => void) => {
    try {
      new PerformanceObserver(cb).observe({type, buffered: true});
    } catch {
      /* not supported on this browser */
    }
  };
  observe('paint', (l) => l.getEntries().forEach((e) => e.name === 'first-contentful-paint' && (perf.fcp = Math.round(e.startTime))));
  observe('largest-contentful-paint', (l) => l.getEntries().forEach((e) => (perf.lcp = Math.round(e.startTime))));
  observe('layout-shift', (l) =>
    l.getEntries().forEach((e) => {
      const ls = e as PerformanceEntry & {value: number; hadRecentInput: boolean};
      if (!ls.hadRecentInput) perf.cls += ls.value;
    }),
  );
  observe('longtask', (l) =>
    l.getEntries().forEach((e) => perf.longTasks.length < 300 && perf.longTasks.push({t: Math.round(e.startTime), ms: Math.round(e.duration)})),
  );
};

// ───────────────────────── frame sampler ─────────────────────────

/** Frame deltas grouped by "phase / section". Paused while a screenshot is being taken. */
const frames = new Map<string, number[]>();
let bucket = 'load';
let paused = false;
let lastFrame = 0;
const sample = (ts: number) => {
  if (!paused && lastFrame && document.visibilityState === 'visible') {
    const d = ts - lastFrame;
    if (d < 1000) {
      let arr = frames.get(bucket);
      if (!arr) frames.set(bucket, (arr = []));
      arr.push(d);
    }
  }
  lastFrame = paused ? 0 : ts;
  requestAnimationFrame(sample);
};

const median = (a: number[]) => {
  const s = [...a].sort((x, y) => x - y);
  return s[Math.floor(s.length / 2)] || 16.7;
};
/** The screen's own frame interval (60/90/120 Hz), estimated from the fastest steady frames. */
let budget = 16.7;
const statsOf = (d: number[]): FrameStats | null => {
  if (d.length < 5) return null;
  const sorted = [...d].sort((x, y) => x - y);
  const total = d.reduce((s, x) => s + x, 0);
  const expected = total / budget;
  const missed = d.reduce((s, x) => s + Math.max(0, Math.round(x / budget) - 1), 0);
  return {
    frames: d.length,
    seconds: round(total / 1000),
    avgFps: round((d.length / total) * 1000),
    p95FrameMs: round(sorted[Math.floor(sorted.length * 0.95)]),
    worstFrameMs: round(sorted[sorted.length - 1]),
    droppedPct: round((missed / Math.max(1, expected)) * 100),
    freezes: d.filter((x) => x > 100).length,
  };
};

// ───────────────────────── page helpers ─────────────────────────

const scrollerOf = (): HTMLElement => {
  const app = document.getElementById('app');
  if (app && app.scrollHeight > app.clientHeight + 40 && /(auto|scroll)/.test(getComputedStyle(app).overflowY)) return app;
  return (document.scrollingElement as HTMLElement) || document.documentElement;
};
const sectionsOf = (): HTMLElement[] =>
  Array.from(document.querySelectorAll<HTMLElement>('section[id], footer[id]')).filter(
    (s) => !s.parentElement?.closest('section[id], footer[id]') && s.offsetParent !== null,
  );
const currentSection = () => {
  const cy = innerHeight / 2;
  const s = sectionsOf().find((el) => {
    const r = el.getBoundingClientRect();
    return r.top <= cy && r.bottom >= cy;
  });
  return s?.id || 'none';
};
const topOf = (sc: HTMLElement, el: HTMLElement) =>
  sc === document.scrollingElement || sc === document.documentElement ? el.getBoundingClientRect().top + scrollY : el.offsetTop;

const webgl = () => {
  try {
    const gl = document.createElement('canvas').getContext('webgl');
    if (!gl) return 'none';
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    return ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : String(gl.getParameter(gl.RENDERER));
  } catch {
    return 'error';
  }
};

const deviceInfo = () => {
  const n = navigator as Navigator & {deviceMemory?: number; connection?: {effectiveType?: string; downlink?: number; saveData?: boolean}};
  return {
    userAgent: navigator.userAgent,
    viewport: `${innerWidth}x${innerHeight}`,
    screen: `${screen.width}x${screen.height}`,
    devicePixelRatio: devicePixelRatio,
    deviceMemoryGB: n.deviceMemory ?? null,
    cpuCores: navigator.hardwareConcurrency ?? null,
    network: n.connection ? `${n.connection.effectiveType ?? '?'} ${n.connection.downlink ?? '?'}Mbps${n.connection.saveData ? ' save-data' : ''}` : null,
    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    language: navigator.language,
    gpu: webgl(),
    screenHz: Math.round(1000 / budget),
  };
};

const loadTimings = () => {
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  const res = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  return {
    ttfbMs: nav ? Math.round(nav.responseStart) : null,
    domContentLoadedMs: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
    loadMs: nav ? Math.round(nav.loadEventEnd) : null,
    firstContentfulPaintMs: perf.fcp || null,
    largestContentfulPaintMs: perf.lcp || null,
    cumulativeLayoutShift: round(perf.cls, 3),
    resources: res.length,
    transferKB: Math.round(res.reduce((s, r) => s + (r.transferSize || 0), 0) / 1024),
    slowest: [...res]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 8)
      .map((r) => ({url: r.name.slice(0, 160), ms: Math.round(r.duration), kb: Math.round((r.transferSize || 0) / 1024)})),
    fonts: document.fonts
      ? {
          status: document.fonts.status,
          failed: Array.from(document.fonts as unknown as Iterable<FontFace>)
            .filter((f) => f.status === 'error')
            .map((f) => f.family),
        }
      : null,
  };
};

/** Layout problems inside one section, while it is on screen. */
const checkSection = (s: HTMLElement) => {
  const issues: string[] = [];
  const W = innerWidth;
  const label = (el: Element) => {
    const cls = typeof el.className === 'string' && el.className ? `.${el.className.trim().split(/\s+/).join('.')}` : '';
    const text = (el.textContent || '').trim().slice(0, 40);
    return `${el.tagName.toLowerCase()}${cls}${text ? ` "${text}"` : ''}`;
  };
  const textEls = s.querySelectorAll<HTMLElement>('p, h1, h2, h3, h4, a, button, li, span');
  let off = 0;
  let spill = 0;
  textEls.forEach((el) => {
    if (!el.textContent?.trim() || el.closest('[aria-hidden="true"]')) return;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    if ((r.right > W + 1 || r.left < -1) && off < 8) {
      off++;
      issues.push(`off-screen sideways (${Math.round(r.left)}..${Math.round(r.right)} of ${W}px): ${label(el)}`);
    }
    if (el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).display !== 'inline' && spill < 8) {
      spill++;
      issues.push(`text wider than its box (${el.scrollWidth} > ${el.clientWidth}px): ${label(el)}`);
    }
  });
  s.querySelectorAll('img').forEach((img) => {
    if (img.complete && img.naturalWidth === 0) issues.push(`broken image: ${img.src}`);
  });
  const r = s.getBoundingClientRect();
  // Not a bug by itself (some designs scroll through tall sections in steps): reported as a note.
  if (r.height > innerHeight * 1.08) issues.push(`note: section taller than the screen (${Math.round(r.height)} > ${innerHeight}px)`);
  return issues;
};

const pageChecks = (sc: HTMLElement) => {
  const issues: string[] = [];
  const de = document.documentElement;
  if (de.scrollWidth > innerWidth + 1) issues.push(`page scrolls sideways (${de.scrollWidth} > ${innerWidth}px)`);
  if (sc !== de && sc.scrollWidth > sc.clientWidth + 1) issues.push(`scroller is wider than the screen (${sc.scrollWidth} > ${sc.clientWidth}px)`);
  return issues;
};

// ───────────────────────── screenshots ─────────────────────────

type Shooter = typeof import('modern-screenshot');
let shooter: Promise<Shooter> | null = null;
const shots: Shot[] = [];

/**
 * @font-face CSS for the screenshots. The library can't read cross-origin stylesheets (Google Fonts),
 * so without this the script names fall back to another font and look cut off. Fetched once.
 */
let fontCss: Promise<string> | null = null;
const loadFontCss = () =>
  (fontCss ??= (async () => {
    const parts: string[] = [];
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        for (const rule of Array.from(sheet.cssRules)) if (rule instanceof CSSFontFaceRule) parts.push(rule.cssText);
      } catch {
        // Cross-origin sheet: fetch its text instead (Google Fonts allows CORS).
        if (sheet.href)
          try {
            parts.push(await (await fetch(sheet.href)).text());
          } catch (e) {
            pushLog('warn', `[autotest] font CSS not loaded for screenshots: ${sheet.href} ${str(e)}`);
          }
      }
    }
    // Google's CSS has one block per script subset (/* latin */, /* cyrillic */ …): keep the ones these invites use.
    const css = parts
      .join('\n')
      .replace(/\/\*\s*(cyrillic|cyrillic-ext|greek|greek-ext|vietnamese|math|symbols)\s*\*\/\s*@font-face\s*\{[^}]*\}/g, '');
    // Inline every font file as a data URL, so the screenshot (an SVG image) can draw it.
    const urls = [...new Set([...css.matchAll(/url\((['"]?)([^'")]+)\1\)/g)].map((m) => m[2]))];
    const inlined = new Map<string, string>();
    await Promise.all(
      urls.map(async (u) => {
        try {
          const blob = await (await fetch(new URL(u, location.href))).blob();
          inlined.set(u, await toDataUrl(blob));
        } catch (e) {
          pushLog('warn', `[autotest] font file not loaded for screenshots: ${u} ${str(e)}`);
        }
      }),
    );
    return css.replace(/url\((['"]?)([^'")]+)\1\)/g, (m, _q, u: string) => (inlined.get(u) ? `url("${inlined.get(u)}")` : m));
  })());

const snap = async (section: string, phase: string): Promise<void> => {
  shooter ??= import('modern-screenshot');
  const file = `shot-${String(shots.length + 1).padStart(2, '0')}-${phase}-${section}.jpg`.replace(/[^\w.-]/g, '_');
  const start = performance.now();
  paused = true;
  const shot: Shot = {file, section, phase, t: now(), ms: 0, blob: null};
  try {
    const {domToBlob} = await shooter;
    const cssText = await loadFontCss();
    shot.blob = await domToBlob(document.documentElement, {
      font: cssText ? {cssText} : undefined,
      width: innerWidth,
      height: innerHeight,
      scale: Math.min(devicePixelRatio || 1, 1.5),
      type: 'image/jpeg',
      quality: 0.72,
      timeout: 8000,
      filter: (n) => !(n instanceof Element && n.id.startsWith(UI_ID)),
      features: {restoreScrollPosition: true, copyScrollbar: false},
      // No scrollbar strip on the right of pages that scroll the window.
      style: {overflow: 'hidden'},
      onCloneNode: (cloned) => {
        // body with overflow-x:hidden is a scroll box too: hide its scrollbar in the copy.
        const body = (cloned as Element).querySelector?.('body');
        if (body) body.style.overflow = 'hidden';
      },
    });
  } catch (e) {
    shot.error = str(e);
    pushLog('warn', `[autotest] screenshot failed (${file}): ${shot.error}`);
  }
  shot.ms = Math.round(performance.now() - start);
  shots.push(shot);
  paused = false;
};

// ───────────────────────── UI ─────────────────────────

const css = `
#${UI_ID}-btn{position:fixed;left:10px;bottom:10px;z-index:2147483647;font:600 13px system-ui,sans-serif;
  background:#111;color:#fff;border:1px solid #fff6;border-radius:999px;padding:8px 13px;opacity:.85}
#${UI_ID}-chip{position:fixed;left:8px;top:8px;z-index:2147483647;pointer-events:none;font:600 11px system-ui,sans-serif;
  background:#000b;color:#fff;border-radius:8px;padding:5px 8px;max-width:70vw}
#${UI_ID}-done{position:fixed;inset:0;z-index:2147483647;background:#000c;display:flex;align-items:center;justify-content:center;
  font:14px/1.45 system-ui,sans-serif;color:#111}
#${UI_ID}-done .card{text-align:left;letter-spacing:normal;text-transform:none;background:#fff;border-radius:14px;padding:20px;width:min(92vw,380px);max-height:86vh;overflow:auto}
#${UI_ID}-done h2{margin:0 0 6px;font-size:20px}
#${UI_ID}-done code{background:#eee;padding:1px 5px;border-radius:4px;word-break:break-all}
#${UI_ID}-done ul{padding-left:18px;margin:8px 0}
#${UI_ID}-done button{font:600 14px system-ui,sans-serif;border:0;border-radius:9px;padding:10px 14px;margin:10px 8px 0 0;background:#111;color:#fff}
#${UI_ID}-done button.light{background:#e7e7e7;color:#111}`;

const el = <K extends keyof HTMLElementTagNameMap>(tag: K, id: string, html = '') => {
  const e = document.createElement(tag);
  e.id = id;
  e.innerHTML = html;
  document.body.appendChild(e);
  return e;
};
let chip: HTMLElement | null = null;
const status = (text: string) => {
  chip ??= el('div', `${UI_ID}-chip`);
  chip.textContent = `🧪 ${text}`;
};

// ───────────────────────── the run ─────────────────────────

const newRunId = (site: string) => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${site}-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}-${Math.random().toString(36).slice(2, 6)}`;
};

/** Phase 1: the site's own show, start to finish, as a guest would see it. */
const naturalFlow = async (opts: TesterOptions) => {
  bucket = 'intro';
  await sleep(1200);
  await snap('doors', 'intro');
  mark('tap doors');
  opts.enter();
  await sleep(1500);
  await snap('opening', 'intro');

  const started = performance.now();
  // The scroller is looked up on every tick: before the doors open the page isn't scrollable yet.
  let sc = scrollerOf();
  let lastTop = sc.scrollTop;
  let lastMove = performance.now();
  let moved = false;
  let shown = '';
  let lastShot = 0;
  let bottomSince = 0;
  for (;;) {
    await sleep(250);
    const t = performance.now();
    const sec = currentSection();
    bucket = `show/${sec}`;
    sc = scrollerOf();
    const top = sc.scrollTop;
    if (Math.abs(top - lastTop) > 1) {
      lastMove = t;
      moved = true;
      lastTop = top;
    }
    const elapsed = Math.round((t - started) / 1000);
    status(`Playing the invite · ${sec} · ${elapsed}s · please don't touch`);
    if (sec !== shown && t - lastShot > 3000 && t - lastMove > 900) {
      shown = sec;
      lastShot = t;
      mark(`show reached ${sec}`);
      await snap(sec, 'show');
    }
    const atBottom = moved && sc.scrollHeight > sc.clientHeight + 40 && top >= sc.scrollHeight - sc.clientHeight - 2;
    bottomSince = atBottom ? bottomSince || t : 0;
    if (bottomSince && t - bottomSince > 4000) return mark('show ended at the bottom');
    if (moved && t - lastMove > 25000) return mark('show stopped moving for 25 s');
    if (!moved && t - started > 30000) return mark('auto-scroll never started (30 s)'), pushLog('warn', '[autotest] auto-scroll never started');
    if (t - started > 180000) return mark('show timed out (180 s)');
  }
};

/** Phase 2a: steady scroll top→bottom, then back up, to measure smoothness alone. */
const steadyScroll = async (sc: HTMLElement) => {
  const snapType = sc.style.scrollSnapType;
  sc.style.scrollSnapType = 'none';
  const go = (from: number, to: number, pxPerSec: number, name: string) =>
    new Promise<void>((done) => {
      bucket = name;
      const start = performance.now();
      const dur = (Math.abs(to - from) / pxPerSec) * 1000;
      const step = (ts: number) => {
        const p = Math.min(1, (ts - start) / dur);
        sc.scrollTop = from + (to - from) * p;
        if (p < 1) requestAnimationFrame(step);
        else done();
      };
      requestAnimationFrame(step);
    });
  status('Steady scroll down…');
  sc.scrollTop = 0;
  await sleep(800);
  const max = sc.scrollHeight - sc.clientHeight;
  await go(0, max, 700, 'steady/down');
  await sleep(500);
  status('Fast scroll up…');
  await go(max, 0, 2200, 'steady/up-fast');
  await sleep(500);
  sc.style.scrollSnapType = snapType;
};

/** Phase 2b: every section on screen, settled: screenshot + layout checks. */
const visitSections = async (sc: HTMLElement) => {
  const result: Record<string, string[]> = {};
  const list = sectionsOf();
  for (const [k, s] of list.entries()) {
    status(`Checking section ${k + 1}/${list.length} · ${s.id}`);
    bucket = `visit/${s.id}`;
    const snapType = sc.style.scrollSnapType;
    sc.style.scrollSnapType = 'none';
    sc.scrollTop = Math.min(topOf(sc, s), sc.scrollHeight - sc.clientHeight);
    sc.style.scrollSnapType = snapType;
    await sleep(1800);
    result[s.id] = checkSection(s);
    await snap(s.id, 'visit');
  }
  return result;
};

const upload = async (runId: string, file: string, body: Blob) => {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const r = await fetch(`/api/autotest?run=${encodeURIComponent(runId)}&file=${encodeURIComponent(file)}`, {
        method: 'POST',
        headers: {'content-type': body.type || 'application/octet-stream'},
        body,
      });
      if (r.ok) return true;
      pushLog('warn', `[autotest] upload ${file}: HTTP ${r.status}`);
    } catch (e) {
      pushLog('warn', `[autotest] upload ${file}: ${str(e)}`);
    }
    await sleep(800 * attempt);
  }
  return false;
};

const toDataUrl = (b: Blob) =>
  new Promise<string>((res) => {
    const fr = new FileReader();
    fr.onload = () => res(String(fr.result));
    fr.onerror = () => res('');
    fr.readAsDataURL(b);
  });

const run = async (opts: TesterOptions, runId: string) => {
  try {
    await (navigator as Navigator & {wakeLock?: {request: (t: 'screen') => Promise<unknown>}}).wakeLock?.request('screen');
  } catch {
    /* the screen may dim on long runs */
  }
  mark('run start');
  status('Starting test…');
  await sleep(400);
  budget = 16.7;
  await naturalFlow(opts);
  // Fastest steady frame interval seen during the show = this screen's refresh rate.
  const all = [...frames.values()].flat().filter((d) => d > 4);
  if (all.length > 30) budget = Math.max(6, Math.min(34, median(all.filter((d) => d < median(all) * 1.25))));

  await steadyScroll(scrollerOf());
  const sectionIssues = await visitSections(scrollerOf());
  mark('run end');

  const smoothness: Record<string, FrameStats | null> = {};
  for (const [k, d] of frames) smoothness[k] = statsOf(d);
  const phase = (prefix: string) => statsOf([...frames.entries()].filter(([k]) => k.startsWith(prefix)).flatMap(([, d]) => d));
  const errors = logs.filter((l) => ['error', 'exception', 'rejection', 'resource'].includes(l.level));
  const allIssues = [...pageChecks(scrollerOf()), ...Object.entries(sectionIssues).flatMap(([s, list]) => list.map((i) => `${s}: ${i}`))].filter(
    (i) => !i.includes('note: '),
  );

  const report = {
    site: opts.site,
    runId,
    finishedAt: new Date().toISOString(),
    url: location.href,
    commit: opts.commit ?? null,
    device: deviceInfo(),
    load: loadTimings(),
    summary: {
      errors: errors.length,
      warnings: logs.filter((l) => l.level === 'warn').length,
      layoutIssues: allIssues.length,
      show: phase('show/'),
      steadyDown: smoothness['steady/down'] ?? null,
      fastUp: smoothness['steady/up-fast'] ?? null,
      longTasks: perf.longTasks.length,
      screenshots: shots.filter((s) => s.blob).length,
      screenshotFailures: shots.filter((s) => !s.blob).length,
    },
    layout: {page: pageChecks(scrollerOf()), sections: sectionIssues},
    smoothness,
    longTasks: perf.longTasks,
    timeline,
    logs,
    screenshots: shots.map(({blob: _b, ...s}) => ({...s, kb: _b ? Math.round(_b.size / 1024) : 0})),
  };

  // Upload: screenshots first, report.json last (its arrival means the run is complete).
  let ok = 0;
  const withImages = shots.filter((s) => s.blob);
  for (const [k, s] of withImages.entries()) {
    status(`Uploading ${k + 1}/${withImages.length + 1}…`);
    if (await upload(runId, s.file, s.blob!)) ok++;
  }
  status('Uploading report…');
  const reportOk = await upload(runId, 'report.json', new Blob([JSON.stringify(report, null, 2)], {type: 'application/json'}));
  chip?.remove();
  showDone(report, reportOk, ok, withImages.length);
};

const showDone = (report: {runId: string; summary: Record<string, unknown>; layout: {page: string[]; sections: Record<string, string[]>}}, reportOk: boolean, shotsOk: number, shotsAll: number) => {
  const s = report.summary as {errors: number; warnings: number; layoutIssues: number; show: FrameStats | null; steadyDown: FrameStats | null};
  const fps = (f: FrameStats | null) => (f ? `${f.avgFps} fps, ${f.droppedPct}% dropped` : 'n/a');
  const box = el(
    'div',
    `${UI_ID}-done`,
    `<div class="card">
      <h2>✅ Done testing</h2>
      <p>Run <code>${report.runId}</code></p>
      <ul>
        <li>Errors: <b>${s.errors}</b> · warnings: ${s.warnings}</li>
        <li>Layout issues: <b>${s.layoutIssues}</b></li>
        <li>Show: ${fps(s.show)}</li>
        <li>Steady scroll: ${fps(s.steadyDown)}</li>
        <li>Upload: ${reportOk ? `✅ saved (${shotsOk}/${shotsAll} screenshots)` : '❌ failed, use Download report'}</li>
      </ul>
      <p><b>Now tell Claude: “done testing”.</b></p>
      <button type="button" data-dl class="light">Download report</button>
      <button type="button" data-again class="light">Test again</button>
      <button type="button" data-close>Close</button>
    </div>`,
  );
  box.querySelector('[data-close]')!.addEventListener('click', () => {
    const u = new URL(location.href);
    u.searchParams.delete('autotest');
    location.replace(u.toString());
  });
  box.querySelector('[data-again]')!.addEventListener('click', () => startRun((report as unknown as {site: string}).site));
  box.querySelector('[data-dl]')!.addEventListener('click', async () => {
    const images: Record<string, string> = {};
    for (const sh of shots) if (sh.blob) images[sh.file] = await toDataUrl(sh.blob);
    const blob = new Blob([JSON.stringify({...report, images}, null, 1)], {type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${report.runId}.json`;
    a.click();
  });
};

const startRun = (site: string) => {
  const u = new URL(location.href);
  u.searchParams.set('test', '');
  u.searchParams.set('autotest', newRunId(site));
  location.replace(u.toString().replace('test=&', 'test&').replace(/test=$/, 'test'));
};

let mounted = false;
export const mountTester = (opts: TesterOptions) => {
  if (mounted) return;
  mounted = true;
  startCollectors();
  requestAnimationFrame(sample);
  const style = document.createElement('style');
  style.id = `${UI_ID}-style`;
  style.textContent = css;
  document.head.appendChild(style);

  const runId = new URLSearchParams(location.search).get('autotest');
  if (runId && /^[\w-]{6,80}$/.test(runId)) {
    // Start once the page has loaded (fonts and art in), like a guest would.
    const go = () => void run(opts, runId).catch((e) => {
      pushLog('error', `[autotest] crashed: ${str(e)}`);
      status(`Test crashed: ${str(e).slice(0, 120)}`);
    });
    if (document.readyState === 'complete') go();
    else addEventListener('load', go, {once: true});
    return;
  }
  const btn = el('button', `${UI_ID}-btn`, '🧪 Test');
  btn.setAttribute('type', 'button');
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    startRun(opts.site);
  });
};
