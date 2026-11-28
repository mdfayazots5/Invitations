import {defineConfig, type Plugin} from 'vite';
import {C, SITE_URL} from './src/invite.config.ts';

const glyphs = (text: string) => encodeURIComponent([...new Set(text)].join(''));
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** Fills %TITLE% / %OG_DESCRIPTION% / %SITE_URL% in index.html from invite.config.ts, so all text lives in one place. */
const inviteMeta = (): Plugin => ({
  name: 'invite-meta',
  transformIndexHtml: (html) =>
    html
      .replace(/%TITLE%/g, esc(C.ui.title))
      // Absolute URLs: WhatsApp and other crawlers often ignore relative og:image paths.
      .replace(/%SITE_URL%/g, esc(SITE_URL))
      .replace(/%OG_DESCRIPTION%/g, esc(C.ui.ogDescription))
      // Google Fonts "text=" subsetting: only the glyphs we actually show are downloaded.
      .replace(/%ARABIC_TEXT%/g, glyphs(C.bismillahAr + C.ayah.ar + C.dua.ar))
      .replace(/%URDU_TEXT%/g, glyphs(C.namesUrdu + C.welcomeUrdu + C.fromUrdu + C.events.map((e) => e.urdu).join(''))),
});

export default defineConfig({
  plugins: [inviteMeta()],
  build: {target: 'es2020', assetsInlineLimit: 0},
  preview: {port: 4173, strictPort: true},
  // The phone tester lives in ../shared (one copy for every invite).
  server: {fs: {allow: ['..']}},
  define: {__COMMIT__: JSON.stringify(process.env.COMMIT_REF ?? 'local')},
});
