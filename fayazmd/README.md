# Fayaz & Muskan: Valima invite (friends & relatives)

A black-and-gold, mobile-first invite **website** for the **Valima only** (Tuesday, 15 December 2026, 8 PM, Venkat Narsimha Garden, Amangal), plus an **MP4** recorded from it. The original brief is in [royal-doors-invite-prompt.md](royal-doors-invite-prompt.md). That brief covered the Nikah too; this site no longer does.

Live at https://mdfayazinvitation.netlify.app/

Guests tap the doors open. The gold bar then **scratches itself** to reveal the date, and the page **scrolls down slowly on its own**. It holds briefly at each section; any touch, scroll or key pauses it, and it resumes after 6 s idle. Guests see a live countdown with fireworks and can open the venue map. There is no RSVP form.

All page text lives in [src/invite.config.ts](src/invite.config.ts). Spelling is final: "Venkat Narsimha Garden", "Rajab-ul-Murajjab".
The map pin uses the exact Google Maps location (Venkata Narasimha Gardens 16.8444, 78.5197).

Tuning: scroll speed, hold and idle times are at the top of [src/autoscroll.ts](src/autoscroll.ts). The scratch/scroll start delays are in [src/main.ts](src/main.ts). Add `?noscroll` to the URL to turn the auto-scroll off (the recorder uses this).

## Music (optional)
Put the song at `public/music.mp3`. It starts when guests tap the doors, and the round button at the bottom-right pauses it.
Without the file, the button hides itself and the page still works. The recorder also mixes the song into the MP4 (1 s fade-in, 1.5 s fade-out).

## Commands (run inside `fayazmd/`)
```bash
npm install
npx playwright install chromium   # once, for the scripts below
npm run dev        # develop at http://localhost:5173
npm run build      # -> dist/
npm run check      # QA at 360/390/430/768 px: overflow, names on one line, console errors, no Nikah/TODO text,
                   # doors, auto-scratch, auto-scroll + pause on input, countdown, map pin (screenshots in qa/)
npm run og         # regenerate public/og-image.png (1200×630 link preview), then build again
npm run record     # record recordings/fayaz-muskan-invite.mp4 (1080×1920, H.264, ≤16 MB for WhatsApp)
```
`check`, `og` and `record` serve the current `dist/`, so run `npm run build` first.

## Deploy (branch `FayazMD`)
| Host | Settings |
|------|----------|
| Netlify | Branch `FayazMD`. The root `netlify.toml` sets base `fayazmd`, build `npm run build`, publish `dist`. |
| Cloudflare Pages | Branch `FayazMD` · root directory `fayazmd` · build `npm run build` · output `dist` |
| Render (Static Site) | Branch `FayazMD` · root directory `fayazmd` · build `npm install && npm run build` · publish `dist` |

`og:image` and `og:url` in `index.html` use the full `https://mdfayazinvitation.netlify.app/` address so WhatsApp shows the preview image. Change them if the site moves. WhatsApp caches link previews, so an old card can show for a while after a redeploy.
