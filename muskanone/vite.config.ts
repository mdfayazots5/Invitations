import {existsSync} from 'node:fs';
import {defineConfig, type Plugin} from 'vite';
import {ART, C, SITE_URL} from './src/invite.config.ts';

const glyphs = (text: string) => encodeURIComponent([...new Set(text)].join(''));
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** Every string in the config, to subset the Arabic/Urdu fonts to exactly the characters shown. */
const allText = (v: unknown): string => (typeof v === 'string' ? v : v && typeof v === 'object' ? Object.values(v).map(allText).join('') : '');
const arabicScript = (s: string) => s.replace(/[^؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿‌‍ ()۰-۹:]/g, '');

/** Painted backgrounds that exist in public/art/ (the rest use the code-drawn stand-ins). */
const ARTS = ART.filter((n) => existsSync(`public/art/${n}.webp`));

/** Fills %TITLE% / %OG_DESCRIPTION% / %SITE_URL% / %PRELOAD% in index.html from invite.config.ts. */
const inviteMeta = (): Plugin => ({
  name: 'invite-meta',
  transformIndexHtml: (html) =>
    html
      .replace(/%TITLE%/g, esc(C.ui.title))
      // Absolute URLs: WhatsApp and other crawlers often ignore relative og:image paths.
      .replace(/%SITE_URL%/g, esc(SITE_URL))
      .replace(/%OG_DESCRIPTION%/g, esc(C.ui.ogDescription))
      .replace(
        '%PRELOAD%',
        (['curtain', 'hero'] as const)
          .filter((n) => ARTS.includes(n))
          .map((n, i) => `<link rel="preload" as="image" href="/art/${n}.webp"${i ? '' : ' fetchpriority="high"'} />`)
          .join('\n    '),
      )
      // Google Fonts "text=" subsetting: only the glyphs we actually show are downloaded.
      .replace(/%ARABIC_TEXT%/g, glyphs(arabicScript(C.bismillahAr)))
      .replace(/%URDU_TEXT%/g, glyphs(arabicScript(allText(C)))),
});

export default defineConfig({
  plugins: [inviteMeta()],
  build: {target: 'es2020', assetsInlineLimit: 0},
  preview: {port: 4173, strictPort: true},
  // The phone tester lives in ../shared (one copy for every invite).
  server: {fs: {allow: ['..']}},
  define: {
    __COMMIT__: JSON.stringify(process.env.COMMIT_REF ?? 'local'),
    __ART__: JSON.stringify(ARTS),
  },
});
