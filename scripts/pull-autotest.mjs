#!/usr/bin/env node
// Downloads every phone autotest run (shared/autotest) from each live site into test-runs/<site>/<runId>/.
//   node scripts/pull-autotest.mjs            download new runs, print a summary of each
//   node scripts/pull-autotest.mjs --clear    also delete the downloaded runs from the sites
// The key comes from AUTOTEST_KEY or the gitignored file .autotest-key (its SHA-256 is in netlify/functions/autotest.mts).
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITES = {
  fayaz: 'https://fayazinvitation.netlify.app',
  fayazmd: 'https://mdfayazinvitation.netlify.app',
  muskan: 'https://muskaninvitation.netlify.app',
  // muskankhanam: 'https://muskankhanam.netlify.app', // once its Netlify site exists
};
const clear = process.argv.includes('--clear');
const keyFile = join(ROOT, '.autotest-key');
const KEY = process.env.AUTOTEST_KEY || (existsSync(keyFile) ? readFileSync(keyFile, 'utf8').trim() : '');
if (!KEY) {
  console.error('No key: set AUTOTEST_KEY or create .autotest-key');
  process.exit(1);
}
const headers = {'x-autotest-key': KEY};

const fmtFps = (f) => (f ? `${f.avgFps} fps, p95 ${f.p95FrameMs} ms, ${f.droppedPct}% dropped, ${f.freezes} freezes` : 'n/a');

let total = 0;
for (const [site, base] of Object.entries(SITES)) {
  let runs;
  try {
    const r = await fetch(`${base}/api/autotest`, {headers});
    if (!r.ok) {
      console.log(`${site}: ${r.status} ${await r.text()}`);
      continue;
    }
    ({runs} = await r.json());
  } catch (e) {
    console.log(`${site}: ${e.message}`);
    continue;
  }
  const ids = Object.keys(runs).sort();
  console.log(`\n${site}: ${ids.length} run(s) on the site`);
  for (const id of ids) {
    const dir = join(ROOT, 'test-runs', site, id);
    mkdirSync(dir, {recursive: true});
    for (const file of runs[id]) {
      const out = join(dir, file);
      if (existsSync(out)) continue;
      const r = await fetch(`${base}/api/autotest?run=${encodeURIComponent(id)}&file=${encodeURIComponent(file)}`, {headers});
      if (r.ok) writeFileSync(out, Buffer.from(await r.arrayBuffer()));
      else console.log(`  ${id}/${file}: ${r.status}`);
    }
    total++;
    const reportPath = join(dir, 'report.json');
    if (!existsSync(reportPath)) {
      console.log(`  ${id}: no report.json yet (run unfinished or upload failed) · ${runs[id].length} file(s)`);
      continue;
    }
    const rep = JSON.parse(readFileSync(reportPath, 'utf8'));
    const s = rep.summary;
    console.log(`  ${id}  →  test-runs/${site}/${id}/`);
    console.log(`    device: ${rep.device.viewport} @${rep.device.devicePixelRatio}x · ${rep.device.screenHz} Hz · ${rep.device.userAgent.slice(0, 90)}`);
    console.log(`    load: FCP ${rep.load.firstContentfulPaintMs} ms · LCP ${rep.load.largestContentfulPaintMs} ms · CLS ${rep.load.cumulativeLayoutShift} · ${rep.load.transferKB} KB`);
    console.log(`    errors ${s.errors} · warnings ${s.warnings} · layout issues ${s.layoutIssues} · long tasks ${s.longTasks} · screenshots ${s.screenshots} (${s.screenshotFailures} failed)`);
    console.log(`    show:   ${fmtFps(s.show)}`);
    console.log(`    steady: ${fmtFps(s.steadyDown)}`);
    console.log(`    fastUp: ${fmtFps(s.fastUp)}`);
    if (clear) {
      const r = await fetch(`${base}/api/autotest?run=${encodeURIComponent(id)}`, {method: 'DELETE', headers});
      console.log(`    cleared from site: ${r.ok ? 'yes' : r.status}`);
    }
  }
}
console.log(`\n${total} run(s) in test-runs/`);
