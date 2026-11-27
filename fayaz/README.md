# Fayaz & Muskan: family invite (Nikah & Valima)

A mobile-first invite **website** for family and relatives, plus an **MP4** recorded from it for WhatsApp.
Live at https://fayazinvitation.netlify.app/

- **Nikah**: Monday, 14 December 2026, 10:00 AM, Ruby Garden, Sripur Road, Nagarkurnool (lunch follows)
- **Valima**: Tuesday, 15 December 2026, 8:00 PM, Venkat Narsimha Garden, Shad Nagar Road, Amangal (dinner)

## What guests see
1. Emerald-and-gold arched doors. They tap them open and the song **fades in** from silence over 2.5 s. The round button at the top-right pauses it.
   - It plays even when an iPhone is on silent: the page asks for the "playback" audio session on iOS 17+, and older iPhones play it without the fade.
   - It pauses when the guest switches apps and fades back in when they return.
2. The gold bar **scratches itself** to reveal the dates.
3. The site moves **page by page**: Hero · Quran verse · Invitation · Nikah · Valima · Countdown · Nikah venue · Valima venue · Dua · Closing.
   - Each page fills exactly one screen and snaps, inside a fixed full-screen scroller, so a resting screen is always one whole card and there is no scrollbar.
   - The pages turn on their own after a reading-time hold. As soon as the guest touches, swipes or scrolls, this stops for good and they turn the pages themselves.
   - A swipe, a tap on empty space or a mouse-wheel gesture turns exactly one page. Gold dots on the right show the page, and tapping one jumps there. "↺ View again" on the last page plays the show again.
   - The maps are previews: swiping over them still turns the page, and tapping opens Google Maps.
4. Behind everything, a **3D night sky** ([src/scene3d.ts](src/scene3d.ts), Three.js) shows hanging gold lanterns, a crescent moon, stars, falling rose and gold petals, and bokeh. The camera glides down through it as the page scrolls.

There is no RSVP, calendar, download or video on the page.

**Arabic**: the Bismillah on the first page, Surah Ar-Rum 30:21 on its own page, and the Prophet's ﷺ dua for the couple (with "Your presence and duas…") on the page before the closing. Each comes with its English meaning. They're set in Amiri, with the Urdu lines in Noto Nastaliq. Both fonts are subset at build time to just the characters used, which saves several hundred KB on mobile data. Have someone fluent read the Arabic on the live site before sharing.

## Design notes
- Readability first: every block of text sits on a frosted emerald panel, so the moving sky never mixes into the words. `npm run check` audits text contrast against WCAG AA.
- 3D budget for mid-range phones: the scene loads after the doors open, DPR is capped at 1.5, and object counts scale with the device. It pauses when the tab is hidden and drops petals and resolution if frames get slow. Without WebGL it falls back to 2D gold dust; with "reduce motion" on, it shows a still frame.

All page text lives in [src/invite.config.ts](src/invite.config.ts). Spelling is final: "Ruby Garden", "Venkat Narsimha Garden", "Rajab-ul-Murajjab", "Mrs. Late Abdul Rahmath Sahab". The family asked not to show "Pattedar" or "(Konayapally)".
Tuning: glide, hold and fit settings are at the top of [src/pages.ts](src/pages.ts), and each page's hold time is its `data-hold` in [src/main.ts](src/main.ts).

## Commands (run inside `fayaz/`)
```bash
npm install
npx playwright install chromium   # once, for the scripts below
npm run dev        # develop at http://localhost:5173
npm run build      # -> dist/
npm run check      # QA at 360×640, 390×844, 430×932: doors, auto-scratch, auto-advance (and stopping once the
                   # guest scrolls), swipe/tap/dots/View again, pages fill + fit the screen, no scrollbar,
                   # both events, Arabic + Amiri, maps, no RSVP/calendar/video, text contrast, 3D sky (qa/)
npm run og         # regenerate public/og-image.png (WhatsApp link preview), then build again
npm run record     # record recordings/fayaz-muskan-nikah-valima.mp4 (1080×1920, song looped, ≤16 MB)
```
`check`, `og` and `record` serve the current `dist/` on port 4173, so run `npm run build` first. They stop if the port is already taken, so they never test a stale build.
Add `?noscroll` to the URL to turn off the auto-advance (the recorder uses it).

## Deploy (branch `Fayaz`)
Netlify reads the root `netlify.toml`: base `fayaz`, build `npm run build`, publish `dist`.
`og:image` and `og:url` use the full `https://fayazinvitation.netlify.app/` address. WhatsApp caches previews, so an old card can show for a while after a redeploy.
The MP4 lives in `recordings/`. It is not deployed; share it directly on WhatsApp.
