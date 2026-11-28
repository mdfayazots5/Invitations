// Renders public/og-image.png (1200×630) for WhatsApp/social link previews.
// npm run build && npx tsx scripts/og-image.ts && npm run build
import {chromium} from 'playwright';
import {startPreview, stopPreview, URL_BASE} from './serve.ts';

const run = async () => {
  const server = await startPreview();
  // CHROME_PATH: use an already-installed Chromium instead of Playwright's download.
  // GPU flags: the preview is rendered from the 3D world (station 1, the courtyard), not from an image file.
  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || undefined,
    args: ['--use-gl=angle', '--enable-gpu', '--ignore-gpu-blocklist'],
  });
  try {
    const page = await browser.newPage({viewport: {width: 1200, height: 630}, reducedMotion: 'reduce'});
    await page.goto(`${URL_BASE}/?og`, {waitUntil: 'networkidle'});
    await page.evaluate(() => document.fonts.ready);
    // With WebGL the page sets __ogReady once the courtyard is drawn; without it, the 2D card shows at once.
    await page.waitForFunction(() => (window as unknown as {__ogReady?: boolean}).__ogReady, null, {timeout: 15000}).catch(() => undefined);
    await page.waitForTimeout(300);
    await page.screenshot({path: 'public/og-image.png'});
    console.log('Wrote public/og-image.png');
  } finally {
    await browser.close();
    stopPreview(server);
  }
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
