# Fayaz & Muskan: pastel-sky storybook invite (Nikah & Valima), branch `Muskanone`

A mobile-first invite **website** from the groom's family (Mrs. Late Abdul Rahmath Sahab) for the Nikah & Valima of Mohammed Fayaz with Muskan Khanam.
Built from [DESIGN-BRIEF.md](DESIGN-BRIEF.md), which Claude chat wrote from a reference video and the printed card using [NEW-INVITE-KIT.md](../NEW-INVITE-KIT.md).
The look is a soft illustrated "storybook": powder-blue to peach sky, cream drapes, brass lanterns, teal names, gold-brown details, crimson event titles.

- **Nikah**: Monday, 14 December 2026, 10:00 AM, Ruby Garden, Sripur Road, Nagarkurnool (lunch follows)
- **Valima**: Tuesday, 15 December 2026, 8:00 PM, Venkat Narsimha Garden, Shad Nagar Road, Amangal (dinner)

## What guests see
1. **Curtain.** Cream silk drapes, a white-flower garland, two brass lanterns, the Bismillah, a gold **F & M** ring and "TAP TO OPEN". The tap starts the song; the drapes slide apart onto the sky with a soft white bloom.
2. **Save the Date.** Bismillah, NIKAH & VALIMA, both names, and a gold scratch card that reveals "14 · 15 December 2026". It scratches itself after 3 s.
3. **Invitation** (English) and 4. **Urdu invitation**, under hanging crescents and stars.
5. **Nikah** with falling petals, and 6. **Valima** with candle glow and gold sparkles.
7. **Countdown** under swaying lanterns, 8. **RSVP** to WhatsApp (+91 95158 24929), 9. **Venues** with "Open in Maps".
10. **Closing**: "Warm Regards", With Best Compliments From Near & Dear, and "View again".

The page moves on its own after the dates are revealed, holding each section (7–9 s). The guest's first touch stops it.

## Painted art (optional, drop-in)
Until the images exist, every background is drawn in code (`src/art.ts`). To use the generated paintings:
1. Generate them with the prompts in [DESIGN-BRIEF.md](DESIGN-BRIEF.md) §5.
2. Save them as `public/art/curtain.webp`, `hero.webp`, `names.webp`, `nikah.webp`, `valima.webp`, `closing.webp` (1080×1920). Or hand PNG/JPG files to Claude Code to convert.
3. Rebuild. `vite.config.ts` sees which files exist and uses them; missing ones keep the code-drawn scene.

Song: `public/music.mp3` (Suno prompt in the brief, §4.6). Without it, the music button stays hidden.

## Where things are
| What | File |
|---|---|
| Every line of text, names, dates, venues, map pins, WhatsApp number, site address | [src/invite.config.ts](src/invite.config.ts) |
| Section layout | [src/main.ts](src/main.ts) |
| Lanterns, charms, garland, divider, monogram ring, stand-in scenes | [src/art.ts](src/art.ts) |
| Petals, sparkles, leaves | [src/ambient.ts](src/ambient.ts) |
| Colours, fonts, motion | [src/styles.css](src/styles.css) |
| Curtain opening | [src/curtain.ts](src/curtain.ts) |
| Auto-move (glide 1.0 s; hold per section = `data-hold` in main.ts) | [src/drift.ts](src/drift.ts) |

⚠ All Urdu and Arabic was transcribed from the card photo: have a fluent reader check it on the site before sharing.
The Nikah Hijri date (4 Rajab 1448 AH) isn't printed on the card; it was taken from the family's other invites.

## Commands (run inside `muskanone/`)
```bash
npm install
npm run dev        # local preview
npm run build      # production build in dist/
npm run check      # QA on 3 phone sizes (screenshots in qa/)
npm run og         # link-preview image public/og-image.png (then build again)
npm run record     # MP4 for WhatsApp Status (needs ffmpeg and music.mp3)
```

## Deploy (branch `Muskanone`)
No Netlify site yet. Create one from this repo with **Branch to deploy** `Muskanone` and an empty base directory; the root `netlify.toml` (`[context.Muskanone]`) builds this folder.
If the site isn't called `muskanone`, change `SITE_URL` in `src/invite.config.ts` (used by the link preview).
Phone test: open `<site>/?test` and tap 🧪.
