# Fayaz & Muskan: Valima invite (friends & relatives)

A black-and-gold, mobile-first invite **website** for the **Valima only** (Tuesday, 15 December 2026, 8 PM, Venkat Narsimha Garden, Amangal), plus an **MP4** recorded from it. The original brief is in [royal-doors-invite-prompt.md](royal-doors-invite-prompt.md). That brief covered the Nikah too; this site no longer does.

Live at https://mdfayazinvitation.netlify.app/

Guests tap the doors open and the song **fades in** from silence over 2.5 s. The gold bar then **scratches itself** to reveal the date.

The site moves **page by page**: Hero · Quran verse · Invitation · Countdown · Venue · Closing.
- Each page fills exactly one screen and snaps, so a resting screen is always one complete card, never half of two sections. The pages live in a fixed full-screen scroller (`#app`). That way the phone's browser bar never collapses and pushes the next page into view, and there is no scrollbar.
- On their own, the pages turn after a reading-time hold. As soon as the guest touches, swipes or scrolls, this stops for good and they turn the pages themselves. "↺ View again" plays the show again from the start.
- A swipe turns exactly one page, even a hard fling. So does a tap on empty space or a mouse-wheel gesture. Gold dots on the right show the page, and tapping one jumps there. "↺ View again" on the last page goes back to the start.
- The map is a preview: swiping over it still turns the page, and tapping it opens Google Maps.
- On small phones (360×640), a tall page is scaled down slightly instead of being cut off.
- There is no RSVP form.

**Arabic**: the Bismillah on the first page, Surah Ar-Rum 30:21 on its own page, and the Prophet's ﷺ dua for the couple on the last page, each with its English meaning. They're set in Amiri, and only the characters used are downloaded. Have someone fluent read the Arabic on the live site before sharing.

All page text lives in [src/invite.config.ts](src/invite.config.ts). Spelling is final: "Venkat Narsimha Garden", "Rajab-ul-Murajjab".
The map pin uses the exact Google Maps location (Venkata Narasimha Gardens 16.8444, 78.5197).

Tuning:
- Glide, hold and fit settings are at the top of [src/pages.ts](src/pages.ts). Each page's hold time is its `data-hold` in [src/main.ts](src/main.ts).
- The song fade-in time is at the top of [src/music.ts](src/music.ts).
- Add `?noscroll` to the URL to turn the auto-advance off (the recorder uses this).

## Music (optional)
Put the song at `public/music.mp3`. It fades in when guests tap the doors, and the round button at the top-right pauses it.
It plays even when an iPhone is on silent: the page asks for the "playback" audio session on iOS 17+, and older iPhones play it without the fade. It pauses when the guest switches apps and fades back in when they return.
Without the file, the button hides itself and the page still works. The recorder also mixes the song into the MP4 (2.5 s fade-in, 1.5 s fade-out).

## Commands (run inside `fayazmd/`)
```bash
npm install
npx playwright install chromium   # once, for the scripts below
npm run dev        # develop at http://localhost:5173
npm run build      # -> dist/
npm run check      # QA at 360×640, 390×844, 430×932: overflow, names on one line, console errors, no Nikah/TODO text,
                   # doors, auto-scratch, auto-advance, swipe/tap/dots/View again, pages fill + fit the screen,
                   # no scrollbar, Arabic lines + Amiri, map preview (qa/)
npm run og         # regenerate public/og-image.png (1200×630 link preview), then build again
npm run record     # record recordings/fayaz-muskan-invite.mp4 (1080×1920, H.264, ≤16 MB for WhatsApp)
```
`check`, `og` and `record` serve the current `dist/` on port 4173, so run `npm run build` first. They stop if the port is already taken, so they never test a stale build.

## Deploy (branch `FayazMD`)
| Host | Settings |
|------|----------|
| Netlify | Branch `FayazMD`. The root `netlify.toml` sets base `fayazmd`, build `npm run build`, publish `dist`. |
| Cloudflare Pages | Branch `FayazMD` · root directory `fayazmd` · build `npm run build` · output `dist` |
| Render (Static Site) | Branch `FayazMD` · root directory `fayazmd` · build `npm install && npm run build` · publish `dist` |

`og:image` and `og:url` in `index.html` use the full `https://mdfayazinvitation.netlify.app/` address so WhatsApp shows the preview image. Change them if the site moves. WhatsApp caches link previews, so an old card can show for a while after a redeploy.
