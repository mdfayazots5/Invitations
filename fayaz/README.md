# Fayaz & Muskan: Nikah invitation

- **Video:** 30 s, 1080×1920, 30 fps, made with Remotion (`src/`).
- **Landing page:** `site/`. It has the video, a 📍 Get Directions button for each venue, Add to Calendar, Download, and Share on WhatsApp.

## Content
| Event  | When | Venue | Map |
|--------|------|-------|-----|
| Nikah  | Mon 14 Dec 2026 · 4 Rajab 1448 · 10:00 AM | Ruby Gardens, Sripur Road, Nagarkurnool | Ruby Gardens Function Hall (16.4786, 78.3060) |
| Valima | Tue 15 Dec 2026 · 5 Rajab-ul-Murajjab 1448 · Dinner 8:00 PM | Venkata Narasimha Gardens, Shad Nagar Road, Amangal | Venkata Narasimha Gardens And Function Hall (16.8444, 78.5197) |

The video reads from `src/invite.ts`. `site/index.html` repeats the same text by hand, so change both when you edit.
The calendar end times (Nikah 1:30 PM, Valima 11:00 PM) are estimates. Edit them in `site/invite.ics` if needed.

## Audio
Put the track at **`public/bismillah.mp3`**. The render cuts it at 30 s and fades it out over the last 1 s.
Without the file, the video renders silently.

## Commands (run inside `fayaz/`)
```bash
npm install
npm run studio    # preview and scrub the video
npm run render    # -> site/nikah-invite.mp4   (commit this file)
npm run poster    # -> site/poster.jpg
npm run preview   # serve site/ locally
```
After rendering, commit `site/` and push the `Fayaz` branch. The host redeploys.
