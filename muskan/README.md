# Muskan & Fayaz: the bride's family invite (Nikah & Valima), branch `MuskanKhanam`

A mobile-first invite **website** from the bride's family, Mrs. & Mr. Khamru Jama Khan Sahab, for the Nikah & Valima of their daughter Muskan Khanam with Mohammed Fayaz.
This branch is a redesign of branch `Muskan` (same text, dates and venues), styled after a reference "royal wedding website" video: red stage curtain, golden palace hall, Mughal arch, blush and crimson sections with gold lattice borders.
All artwork is drawn in code (SVG and CSS): there are no photos, so the whole page is about 20 KB of code plus fonts and the song.

- **Nikah**: Monday, 14 December 2026, 10:00 AM, Ruby Garden, Sripur Road, Nagarkurnool (lunch follows)
- **Valima**: Tuesday, 15 December 2026, 8:00 PM, Venkat Narsimha Garden, Shad Nagar Road, Amangal (dinner)

## What guests see
1. **Curtain.** A red velvet stage curtain with a spotlight, a row of roses and a glowing gold **F & M** crest. "TAP TO OPEN".
   The tap starts the song (fading in over 2.5 s). A gold line splits the curtain, widens into an amber beam, and a full-screen cream-to-amber flash (about 2.5 s) gives way to the hall.
2. **Save the Date.** A candle-lit palace hall (chandeliers, pillars, a staircase lined with roses) that slowly zooms in. "Save the Date", MUSKAN & FAYAZ, the names in Urdu, NIKAH & VALIMA.
   A gold **scratch card** on the stairs reveals "14 & 15 · 12 · 2026, Monday & Tuesday". It scratches itself after a few seconds if the guest doesn't.
3. **Invitation.** A glowing Mughal arch with roses climbing its edges, between walls of roses and hanging lanterns: the Bismillah, Surah Ar-Rum 30:21 (Arabic and English), the hosts, both names, and the Urdu welcome line.
4. **Wedding Events.** A timeline: Nikah and Valima, each with day, date, time, Hijri date, venue and a short line.
5. **Countdown.** "Counting Down" on black with gold sparkler fireworks; days, hours, minutes and seconds to the Nikah (then to the Valima; "Alhamdulillah" after both).
6. **Kindly RSVP.** Name, Joyfully Accept (pre-selected) or Regretfully Decline, and "Send Blessings", which opens **WhatsApp** to +91 95158 24929 with a ready message. No server is involved.
7. **Venues.** A live Google map for each venue, and "Open in Google Maps".
8. **Closing.** "Your presence and duas will be our greatest blessing" in large gold script, the names and dates, then the Prophet's ﷺ dua for the couple, "With best compliments from Near & Dear" and "View again".

The page **drifts down on its own** after the dates are revealed, pausing on each section. The guest's first touch, scroll or key press stops it for good, and they scroll freely from then on.
The music button (bottom-right) pauses the song. The song pauses when the guest switches apps and fades back in when they return, and it plays even with an iPhone on silent (iOS 17+).

Have someone fluent read the Arabic and Urdu on the live site before sharing.

## Where things are
| What | File |
|---|---|
| Every line of text, names, dates, venues, map pins, the F & M monogram, the WhatsApp number, the site address | [src/invite.config.ts](src/invite.config.ts) |
| Section layout | [src/main.ts](src/main.ts) |
| Artwork: curtain, crest, palace hall, arch, roses, chandeliers, lanterns, lattice band | [src/art.ts](src/art.ts) |
| Colours, fonts, sizes, animation timing | [src/styles.css](src/styles.css) |
| Curtain opening and its timing | [src/curtain.ts](src/curtain.ts) |
| Auto-drift (glide time, pause per section = each section's `data-hold` in main.ts) | [src/drift.ts](src/drift.ts) |
| Scratch card, countdown, fireworks, RSVP, music | `src/scratch.ts`, `src/countdown.ts`, `src/fireworks.ts`, `src/rsvp.ts`, `src/music.ts` |

Spelling is final: "Ruby Garden", "Venkat Narsimha Garden", "Rajab-ul-Murajjab", "Mrs. Late Abdul Rahmath Sahab". The family asked not to show "Pattedar" or "(Konayapally)". The blessings line is empty; set `blessings` in the config to show Muskan's elders.

## Commands (run inside `muskan/`)
```bash
npm install
npx playwright install chromium   # once, for the scripts below
npm run dev        # develop at http://localhost:5173
npm run build      # -> dist/
npm run check      # QA at 360×640, 390×844, 430×932: curtain + flash, scratch card on the hall, auto-drift and
                   # stopping on the guest's scroll, every section, names on one line, Arabic in Amiri,
                   # text contrast (WCAG AA), WhatsApp RSVP, map pins, View again, reduced motion (screenshots in qa/)
npm run og         # regenerate public/og-image.png (WhatsApp link preview), then build again
```
`check` and `og` serve the current `dist/` on port 4173, so run `npm run build` first. They stop if the port is already taken, so they never test a stale build.
With Chromium already installed elsewhere, point them at it: `CHROME_PATH=/path/to/chrome npm run check`.
Add `?noscroll` to the URL to turn off the auto-drift.

The MP4 recorder (`npm run record`) is not yet updated for this design.

## Deploy (branch `MuskanKhanam`)
This branch goes to its **own Netlify site**; the original `muskaninvitation.netlify.app` (branch `Muskan`) is not affected.
Netlify reads the root `netlify.toml`: base `muskan`, build `npm run build`, publish `dist`.
Set `SITE_URL` in [src/invite.config.ts](src/invite.config.ts) to the new site's address: the link preview (`og:image`, `og:url`) is built from it.
WhatsApp caches previews, so an old card can show for a while after a redeploy.
