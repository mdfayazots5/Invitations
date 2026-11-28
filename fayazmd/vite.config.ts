import {defineConfig, type Plugin} from 'vite';
import {C} from './src/invite.config.ts';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** Fills %TITLE% / %OG_DESCRIPTION% / %ARABIC_TEXT% in index.html from invite.config.ts, so all text lives in one place. */
const inviteMeta = (): Plugin => ({
  name: 'invite-meta',
  transformIndexHtml: (html) =>
    html
      .replace(/%TITLE%/g, esc(C.ui.title))
      .replace(/%OG_DESCRIPTION%/g, esc(C.ui.ogDescription))
      // Google Fonts "text=" subsetting: only the glyphs of our Arabic lines are downloaded.
      .replace(/%ARABIC_TEXT%/g, encodeURIComponent([...new Set(C.bismillahAr + C.ayah.ar + C.dua.ar)].join(''))),
});

export default defineConfig({
  plugins: [inviteMeta()],
  build: {target: 'es2020', assetsInlineLimit: 0},
  preview: {port: 4173, strictPort: true},
});
