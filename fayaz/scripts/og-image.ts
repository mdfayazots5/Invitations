// Renders public/og-image.png (1200×630) for WhatsApp/social link previews.
// npm run build && npx tsx scripts/og-image.ts && npm run build
import {chromium} from 'playwright';
import {startPreview, stopPreview, URL_BASE} from './serve.ts';

const run = async () => {
  const server = await startPreview();
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({viewport: {width: 1200, height: 630}, reducedMotion: 'reduce'});
    await page.goto(`${URL_BASE}/?og`, {waitUntil: 'networkidle'});
    await page.evaluate(() => document.fonts.ready);
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
