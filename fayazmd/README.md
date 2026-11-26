# Fayaz & Muskan: Royal Doors invite (friends & colleagues)

A black-and-gold, mobile-first invite **website**, plus an **MP4** recorded from it. The full brief is in [royal-doors-invite-prompt.md](royal-doors-invite-prompt.md).

Guests tap the doors open, scratch to reveal the dates, see a live countdown with fireworks, send an RSVP on WhatsApp and open the venue maps.

## Before sharing: fill the TODOs
In [src/invite.config.ts](src/invite.config.ts):
- `rsvpDeadline`, for example `7th December 2026`
- `whatsappNumber`: digits only, with country code, for example `919876543210`. RSVPs arrive here.
- `contacts[].phone`: shown on the RSVP section as a tap-to-call link

All page text lives in that file. Spelling is final: "Ruby Garden", "Venkat Narsimha Garden", "Rajab-ul-Murajjab".
The map pins use the exact Google Maps locations (Ruby Gardens Function Hall 16.4786, 78.3060 · Venkata Narasimha Gardens 16.8444, 78.5197).

## Music (optional)
Put the song at `public/music.mp3`. It starts when guests tap the doors, and the round button at the bottom-right pauses it.
Without the file, the button hides itself and the page still works. The recorder also mixes the song into the MP4 (1 s fade-in, 1.5 s fade-out).

## Commands (run inside `fayazmd/`)
```bash
npm install
npx playwright install chromium   # once, for the scripts below
npm run dev        # develop at http://localhost:5173
npm run build      # -> dist/
npm run check      # QA at 360/390/430/768 px: overflow, names on one line, console errors,
                   # doors, scratch, countdown, RSVP → wa.me, map pins (screenshots in qa/)
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

After the first deploy, change `og:image` in `index.html` to the full URL (for example `https://your-site/og-image.png`) so WhatsApp shows the preview image reliably.
