import {defineConfig, type Plugin} from 'vite';
import {C} from './src/invite.config.ts';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** Fills %TITLE% / %OG_DESCRIPTION% / %ARABIC_TEXT% in index.html from invite.config.ts, so all text lives in one place. */
/** dist/version.json: the deployed commit, so the Admin site can tell when a change is live. */
const versionFile = (): Plugin => ({
  name: 'version-file',
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName: 'version.json',
      source: JSON.stringify({commit: process.env.COMMIT_REF ?? 'local', builtAt: new Date().toISOString()}),
    });
  },
});

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
  plugins: [inviteMeta(), versionFile()],
  build: {target: 'es2020', assetsInlineLimit: 0},
  preview: {port: 4173, strictPort: true},
  // The phone tester lives in ../shared (one copy for every invite).
  server: {fs: {allow: ['..']}},
  define: {__COMMIT__: JSON.stringify(process.env.COMMIT_REF ?? 'local')},
});
