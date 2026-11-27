# Fayaz & Muskan: family invite (Nikah & Valima)

A mobile-first invite **website** for family and relatives, plus an **MP4** recorded from it for WhatsApp.
Live at https://fayazinvitation.netlify.app/

- **Nikah**: Monday, 14 December 2026, 10:00 AM, Ruby Garden, Sripur Road, Nagarkurnool (lunch follows)
- **Valima**: Tuesday, 15 December 2026, 8:00 PM, Venkat Narsimha Garden, Shad Nagar Road, Amangal (dinner)

## What guests see
1. Emerald-and-gold arched doors. They tap them open and the song starts. The round button at the bottom-right pauses it.
2. The gold bar **scratches itself** to reveal the dates.
3. The page then **scrolls slowly on its own** through the invitation, both event cards, the countdown, both venue maps and the closing. It pauses at each section. Any touch, scroll or key stops it, and it resumes after 6 s idle.
4. Behind everything, a **3D night sky** ([src/scene3d.ts](src/scene3d.ts), Three.js) shows hanging gold lanterns, a crescent moon, stars, falling rose and gold petals, and bokeh. The camera glides down through it as the page scrolls.

There is no RSVP, calendar, download or video on the page.

## Design notes
- Readability first: every block of text sits on a frosted emerald panel, so the moving sky never mixes into the words. `npm run check` audits text contrast against WCAG AA.
- 3D budget for mid-range phones: the scene loads after the doors open, DPR is capped at 1.5, and object counts scale with the device. It pauses when the tab is hidden and drops petals and resolution if frames get slow. Without WebGL it falls back to 2D gold dust; with "reduce motion" on, it shows a still frame.

All page text lives in [src/invite.config.ts](src/invite.config.ts). Spelling is final: "Ruby Garden", "Venkat Narsimha Garden", "Rajab-ul-Murajjab", "Mrs. Late Abdul Rahmath Sahab".

## Commands (run inside `fayaz/`)
```bash
npm install
npx playwright install chromium   # once, for the scripts below
npm run dev        # develop at http://localhost:5173
npm run build      # -> dist/
npm run check      # QA at 360/390/430 px: doors, auto-scratch, auto-scroll, both events, maps,
                   # no RSVP/calendar/video, text contrast, 3D sky running (screenshots in qa/)
npm run og         # regenerate public/og-image.png (WhatsApp link preview), then build again
npm run record     # record recordings/fayaz-muskan-nikah-valima.mp4 (1080×1920, song looped, ≤16 MB)
```
`check`, `og` and `record` serve the current `dist/` on port 4173, so run `npm run build` first.
Add `?noscroll` to the URL to turn off the auto-scroll (the recorder uses it).

## Deploy (branch `Fayaz`)
Netlify reads the root `netlify.toml`: base `fayaz`, build `npm run build`, publish `dist`.
`og:image` and `og:url` use the full `https://fayazinvitation.netlify.app/` address. WhatsApp caches previews, so an old card can show for a while after a redeploy.
The MP4 lives in `recordings/`. It is not deployed; share it directly on WhatsApp.
