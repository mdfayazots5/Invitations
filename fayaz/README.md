# Fayaz & Muskan: Nikah invitation

- **Video:** composition `Invite`, 36 s (1080 frames), 1080×1920, 30 fps. The full brief is in [nikah-video-prompt.md](nikah-video-prompt.md). An envelope opens, then one long "web page" scrolls from the hero through Save the Date (scratch to reveal), the invitation card, the wedding events, the Nikah and Valima cards, a countdown, RSVP and the closing.
- **Landing page:** `site/`. It has the video, a 📍 Get Directions button for each venue, Add to Calendar, Download, and Share on WhatsApp.

## Content
All video text lives in **`src/data.ts`**. `site/index.html` repeats it by hand, so update both.

| Event  | When | Venue | Map pin |
|--------|------|-------|---------|
| Nikah  | Mon 14 Dec 2026 · 4 Rajab 1448 AH · 10:00 AM (Lunch follows) | Ruby Garden, Sripur Road, Nagarkurnool | Ruby Gardens Function Hall (16.4786, 78.3060) |
| Valima | Tue 15 Dec 2026 · 5 Rajab-ul-Murajjab 1448 AH · 8:00 PM (Dinner) | Venkat Narsimha Garden, Shad Nagar Road, Amangal | Venkata Narasimha Gardens And Function Hall (16.8444, 78.5197) |

## Assets (optional, drop in and re-render)
| File | Used for | Without it |
|------|----------|------------|
| `public/bismillah.mp3` | soundtrack, faded in over 0.5 s and out over the last 1.5 s | silent video |
| `public/art/hero.jpg` (1080×1920) | hero background and countdown strip | drawn pastel landscape and stage |
| `public/art/envelope.jpg` (1080×1920) | envelope paper | drawn damask texture |
| `public/art/seal.png` | wax seal | drawn gold "F&M" seal |
| `public/art/peony-cluster.png` | envelope corners | drawn peonies |
| `public/art/dove.png` | hero doves | drawn doves |
| `public/art/garden-arch.jpg` (1080×1500) | invitation card background | drawn arch and roses |
| `public/art/event-nikah.jpg`, `event-valima.jpg` (940×600) | event card illustrations | drawn arch and lanterns |

Generation prompts for each image are at the bottom of `nikah-video-prompt.md`. A missing file never breaks the render. It logs a warning and uses the drawn version.

The countdown is calculated at the moment you render, so re-render closer to the date to refresh it.

## Commands (run inside `fayaz/`)
```bash
npm install
npm run studio    # preview and scrub the video
npm run render    # -> site/nikah-invite.mp4   (commit this file)
npm run poster    # -> site/poster.jpg
npm run preview   # serve site/ locally
```
After rendering, commit `site/` and push the `Fayaz` branch. The host redeploys.
