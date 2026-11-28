# Fayaz & Muskan: pastel-sky storybook invite (Nikah & Valima), branch `Muskanone`

A mobile-first invite **website** from the groom's family (Mrs. Late Abdul Rahmath Sahab) for the Nikah & Valima of Mohammed Fayaz with Muskan Khanam.
Built from [DESIGN-BRIEF.md](DESIGN-BRIEF.md), which Claude chat wrote from a reference video and the printed card using [NEW-INVITE-KIT.md](../NEW-INVITE-KIT.md).
The look is a soft "storybook" in real-time 3D: powder-blue to peach sky, ivory drapes, brass lanterns, teal names, gold-brown details, crimson event titles.

- **Nikah**: Monday, 14 December 2026, 10:00 AM, Ruby Garden, Sripur Road, Nagarkurnool (lunch follows)
- **Valima**: Tuesday, 15 December 2026, 8:00 PM, Venkat Narsimha Garden, Shad Nagar Road, Amangal (dinner)

## What guests see
1. **Curtain.** Cream silk drapes, a white-flower garland, two brass lanterns, the Bismillah, a gold **F & M** ring and "TAP TO OPEN". The tap starts the song; the drapes slide apart onto the sky with a soft white bloom.
2. **Save the Date.** Bismillah, NIKAH & VALIMA, both names, and a gold scratch card that reveals "14 · 15 December 2026". It scratches itself after 3 s.
3. **Invitation** (English) and 4. **Urdu invitation**, under hanging crescents and stars.
5. **Nikah** with falling petals, and 6. **Valima** with candle glow and gold sparkles.
7. **Countdown** under swaying lanterns, 8. **RSVP** to WhatsApp (+91 95158 24929), 9. **Venues** with a map preview of each pin and "Open in Maps".
10. **Closing**: "Warm Regards", With Best Compliments From Near & Dear, and "View again".

The site moves **page by page**, as on the muskan site: each section fills exactly one screen and snaps, inside a fixed full-screen scroller. After the dates are revealed the pages turn on their own, holding each one (5–9 s). As soon as the guest touches, swipes or scrolls, that stops for good and they turn the pages themselves. A swipe, a tap on empty space or one mouse-wheel gesture turns one page; the dots on the right show (and jump to) the page; "View again" plays the show again. The 3D camera follows the pages, so every page shows its own scene.
The song (the same one as the family's other invites) fades in on the tap; the round button at the top-left pauses it.

## The 3D world (no image files)
Every background is real-time 3D (Three.js), built in code as one continuous world: [PROMPT-3D-FLOW.md](PROMPT-3D-FLOW.md).
One camera travels a path through 10 "stations", one per section: the ivory drapes, a courtyard with palms and lanterns before a distant palace, a colonnade of Mughal arches with lotus sprays, a floral arch by a lake with mountains, a candle-lit petal path to the mandap, the dusk sky with floating lanterns, and a white mosque at golden sunset.
The sky shifts from afternoon blue to sunset to dusk and back to golden sunset as the page moves.

- Loaded after the first paint (its own ~145 KB gzipped file), so the intro shows at once.
- Quality tiers `low` / `mid` / `high` picked from a 1 s frame-time probe after the tap; `?q=low|mid|high` forces one.
- Fallback: without WebGL (or with `?nowebgl`) the 2D code-drawn scenes and CSS drapes carry the page.
- `SHOW_COUPLE` in `src/three/world.ts` adds a back-view silhouette of the couple (off by default).

Song: `public/music.mp3` (Suno prompt in the brief, §4.6). Without it, the music button stays hidden.

## Where things are
| What | File |
|---|---|
| Every line of text, names, dates, venues, map pins, WhatsApp number, site address | [src/invite.config.ts](src/invite.config.ts) |
| Section layout | [src/main.ts](src/main.ts) |
| 3D world: stations & sky palettes, sky, lanterns, flowers, architecture, particles, quality tiers | [src/three/](src/three/) |
| 2D fallback scenes, lanterns, garland, divider, monogram ring | [src/art.ts](src/art.ts) |
| Petals, sparkles, leaves | [src/ambient.ts](src/ambient.ts) |
| Colours, fonts, motion | [src/styles.css](src/styles.css) |
| Curtain opening | [src/curtain.ts](src/curtain.ts) |
| Pages: snapping, auto-advance, dots, swipe/tap/wheel (hold per page = `data-hold` in main.ts) | [src/pages.ts](src/pages.ts) |

⚠ All Urdu and Arabic was transcribed from the card photo: have a fluent reader check it on the site before sharing.
The Nikah Hijri date (4 Rajab 1448 AH) isn't printed on the card; it was taken from the family's other invites.

## Commands (run inside `muskanone/`)
```bash
npm install
npm run dev        # local preview
npm run build      # production build in dist/
npm run check      # QA on 3 phone sizes (screenshots in qa/)
npm run og         # link-preview image public/og-image.png, rendered from the 3D courtyard (then build again)
npm run record     # MP4 for WhatsApp Status (needs ffmpeg and music.mp3)
```

## Deploy (branch `Muskanone`)
No Netlify site yet. Create one from this repo with **Branch to deploy** `Muskanone` and an empty base directory; the root `netlify.toml` (`[context.Muskanone]`) builds this folder.
If the site isn't called `muskanone`, change `SITE_URL` in `src/invite.config.ts` (used by the link preview).
Phone test: open `<site>/?test` and tap 🧪.
