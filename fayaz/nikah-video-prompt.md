# Remotion prompt: Fayaz & Muskan Nikah video invite (match the reference)

Paste everything below the line into Claude Code, in VS Code, from the root of your Remotion project.
Before you start, put the 8 images from "Art you must generate first" (bottom of this file) into `public/art/`, and the song into `public/bismillah.mp3`.

---

You are a senior motion designer and Remotion engineer. Rebuild my composition `Invite` from scratch. It must recreate the FLOW, MOTION and LOOK of a reference video. That reference is a phone screen recording of an interactive wedding-invitation website being opened and scrolled. My current version fails because it is a slideshow of separate cut/fade scenes on a flat pink background. **The new version must feel like ONE continuous web page that is opened from an envelope and then smoothly scrolled from top to bottom, with interactions (tap, scratch) happening on it.**

## Output spec
- 1080×1920, 30 fps, **36 s = 1080 frames**, H.264.
- Audio: `staticFile('bismillah.mp3')`, starting at 0. Use volume interpolation: fade in over 0–0.5 s and out over 34.5–36 s. Trim to 36 s.
- Fonts via `@remotion/google-fonts`: GreatVibes (script names and headings), CormorantGaramond 400/500/600 and italic (all body text), Amiri (Arabic Bismillah), NotoNastaliqUrdu (Urdu). Block rendering with `delayRender`/`continueRender` until `document.fonts.ready`. Nastaliq must never fall back to a default font.
- Palette: ivory `#FFFDF9`, page `#FBF6F2`, blush `#F4DFE1`, rose `#E7B8BE`, gold `#B88A3E`, light gold `#E3C27A`, teal ink `#1F5257`, brown text `#3D2A22`, muted `#7A6258`.
- Small caps labels: CormorantGaramond 600, 28px, letter-spacing 0.28em, uppercase, gold.

## Architecture (important)
1. `src/Invite.tsx` holds two layers:
   - `<EnvelopeIntro/>` covers frames 0–150 and sits on top.
   - `<ScrollingPage/>` covers frames 135–1080.
2. `ScrollingPage` renders ONE tall column, 1080 px wide, built from fixed-height sections. Use exactly these heights so scroll targets are deterministic:

| Section | Height (px) |
|---|---|
| Hero | 1920 |
| LaceBand | 60 |
| SaveTheDate | 1100 |
| InvitationCard | 1500 |
| CelebrationJourney | 1100 |
| EventNikah | 1250 |
| EventValima | 1250 |
| Countdown | 1000 |
| RSVP | 1100 |
| Closing | 1400 |

   The column is moved with `transform: translateY(-scrollY)`. scrollY comes from a keyframe table, interpolated with `Easing.bezier(0.65,0,0.35,1)`; it holds between moves (see Timeline).
3. Every section's children use a helper `useReveal(sectionTop)`. When an element enters the 1920px viewport it fades and rises: opacity 0→1 and translateY 40→0 over 18 frames, staggered 5 frames per child. This "appear as you scroll" behaviour is what makes it feel like a website.
4. Hero parallax: the hero background image moves at 0.6× scroll speed and the text at 1×.
5. Add a `<Touch/>` component that simulates the finger. It is a 90px soft white circle (rgba 255,255,255,0.55) with a blurred edge and a ripple ring on tap. Use it for the seal tap and the scratching. No hand photo.
6. Add an ambient layer across the whole video: 25 slow-falling blush petals and tiny gold sparkles. Use seeded random (`random('petal-'+i)`) so every render is identical.
7. Put all text in `src/data.ts` (below). Never hard-code strings in components.

## Timeline (frames at 30 fps)
**A. Envelope intro (0–150)**
- 0–30: A full-screen PORTRAIT envelope fills the frame edge to edge (`art/envelope.jpg`, an embossed ivory damask texture). The flap is a V shape from the top edge, with its point at 62% of the height. A gold wax seal (`art/seal.png`, 300px, monogram "F&M") sits on the V point. Pink peonies (`art/peony-cluster.png`) overlap the top-right and bottom-left corners and sway with a ±2° sine motion. A soft gold glow ring pulses around the seal (scale 1→1.25, opacity 0.6→0, 1 s loop).
- 30–45: The `<Touch/>` appears and taps the seal: ripple, and the seal scales 1→0.94→1.
- 45–95: The flap opens UPWARD. Use 3D `rotateX` 0→180° with perspective 1600px and transform-origin at the top. The inside of the flap is a slightly darker ivory. Gold glitter particles (40, seeded) spill from the seam and drift down.
- 95–130: Golden light rays emerge from behind the seal. Draw a conic-gradient star of 24 rays, scaled 0.2→2.5, rotating 0→20°, with a bright core growing behind it.
- 130–145: The screen washes to pure white (a white flash at 100% opacity).
- 135–165: The hero fades in from white, with blur 24px→0 and scale 1.08→1.0. This blur-to-focus reveal is key.

**B. Hero (frames 135–300, scrollY = 0)**
- Background: `art/hero.jpg`, a full-bleed painted watercolour scene. Sun rays top-left rotate ±6° slowly. Two cloud layers drift horizontally 20px.
- Three doves (`art/dove.png`) fly in from the right across the upper third. Each has a different speed and a 2-frame wing flap (scaleY 1↔0.7 every 4 frames) along a curved path. One dove crosses in front of the names.
- Text is WHITE with `text-shadow: 0 4px 24px rgba(40,60,90,.45)`. It is centred in the top 55% and revealed staggered from frame 165:
  1. Bismillah, Amiri 64px
  2. Small caps: "WITH THE BLESSINGS OF"
  3. CormorantGaramond 34px: "Late Mrs. & Mr. Abdul Khader Sahab Pattedar (Konayapally)"
  4. "Mohammed Fayaz", GreatVibes 150px
  5. "&", GreatVibes 90px
  6. "Muskan Khanam", GreatVibes 150px
  7. Urdu line, NotoNastaliqUrdu 46px
  8. Small caps: "CORDIALLY INVITE YOU TO THEIR NIKAH & VALIMA"
- At frame 240, add a bottom label "Scroll to enter the celebration" with a bouncing chevron ↓.

**C. Scroll and section beats.** Each scroll move takes 36–45 frames, eased. Make sure each section is fully revealed before the next move.

| Frames | Scroll target | What happens |
|---|---|---|
| 300–345 | SaveTheDate top − 120 | Scroll |
| 345–465 | hold | Scratch to reveal (see D) |
| 465–510 | InvitationCard top | Scroll |
| 510–585 | hold | Invitation card details reveal |
| 585–625 | CelebrationJourney top | Scroll |
| 625–690 | hold | Gold vertical line draws top→bottom (stroke-dashoffset); dots pop (scale 0→1.2→1); entries slide in from alternating sides |
| 690–730 | EventNikah top | Scroll |
| 730–790 | hold | Nikah card |
| 790–830 | EventValima top | Scroll |
| 830–880 | hold | Valima card |
| 880–915 | Countdown top | Scroll |
| 915–960 | hold | Dials tick |
| 960–995 | RSVP top | Scroll |
| 995–1020 | hold | RSVP |
| 1020–1050 | Closing top | Scroll |
| 1050–1080 | hold | Closing; fade to ivory in the last 10 frames |

**D. Save the Date / scratch (frames 345–465)**
- Heading: small caps "SAVE THE DATE", then "Scratch to Reveal" in GreatVibes 110px gold.
- Three 260px circles in a row. Each is an ivory disc with a light-gold double ring, covered by a metallic gold layer: radial gradient `#F6DC96 → #D1A24C → #A27325` plus speckles.
- The `<Touch/>` scratches circle 1 (frames 355–390), then 2 (390–425), then 3 (425–460). It moves in a zig-zag path. The gold is erased along the path with an SVG mask of a 70px-wide stroke, whose stroke-dashoffset animates with the touch, and sparkles pop at the touch point. When about 70% is scratched, the remaining gold fades out over 8 frames.
- What each circle reveals:
  - "14", with caption "MONDAY"
  - "DEC", with caption "DECEMBER"
  - "2026", with caption "4 RAJAB 1448"
- Revealed text: teal `#1F5257` CormorantGaramond 600, 96px; captions 24px muted.

**E. Invitation card**
- Background: `art/garden-arch.jpg`, a watercolour garden with a white arch and columns, under an ivory arched card (border radius 520px 520px 30px 30px, 1px gold border).
- Inside, top to bottom:
  - Small Bismillah
  - Small caps: "WITH JOY IN OUR HEARTS"
  - "Mrs. Late Abdul Rahmath Sahab", GreatVibes 84px teal
  - "solicits your gracious presence on the auspicious occasion of the Nikah & Valima of her son"
  - "Mohammed Fayaz", GreatVibes
  - "with"
  - "Muskan Khanam", GreatVibes
  - "daughter of Mrs. & Mr. Khamru Jama Khan Sahab"
  - Urdu line "آپ کی تشریف آوری باعث مسرت ہوگی"

**F. Celebration journey**
- Title: small caps "CELEBRATION JOURNEY", then "Our Wedding Events" in GreatVibes 110px.
- A vertical gold line runs down the centre with two nodes:
  - "Nikah · Monday 14 Dec · 10:00 AM · Ruby Garden, Nagarkurnool"
  - "Valima · Tuesday 15 Dec · 8:00 PM · Venkat Narsimha Garden, Amangal"

**G. Event cards (Nikah, then Valima)**
- Each card is 940px wide on ivory with a gold hairline border and a soft shadow.
- The top half is an illustration (`art/event-nikah.jpg` / `art/event-valima.jpg`: an arch, lanterns and flowers). Lanterns swing ±3°.
- Below the illustration:
  - Event name, GreatVibes 120px gold
  - Urdu name, Nastaliq teal
  - Two columns: DATE (with the Hijri date beneath) and TIME
  - VENUE label, then venue name and address
  - A pill button "VIEW MAP" with a gold outline

**H. Countdown**
- Small caps: "UNTIL WE SAY QUBOOL HAI"
- "Counting Down", GreatVibes 110px
- Four 220px ivory dials with gold rings: DAYS, HOURS, MINUTES, SECONDS.
- The values are computed from `RENDER_REFERENCE = new Date()` captured at render start, counting to 2026-12-14T10:00:00+05:30. SECONDS ticks down each 30 frames, and each change flips with a short translateY.
- A watercolour landscape strip (`art/hero.jpg` cropped) runs under the dials.

**I. RSVP**
- Small caps: "KINDLY REPLY", then "R.S.V.P." in GreatVibes 120px.
- An ivory card that looks like a form: fields "Your name" and "Guests", pills "Joyfully accepts" / "Regretfully declines", and a gold "Send RSVP" button.
- The `<Touch/>` taps "Joyfully accepts", so the pill fills blush. A line below: "Tap the invitation link to RSVP on WhatsApp".

**J. Closing**
- "Your presence and duas will be our greatest blessing", italic 52px
- Urdu "آپ کی تشریف آوری باعث مسرت ہوگی"
- Small caps: "WITH BEST COMPLIMENTS FROM"
- "Near & Dear", GreatVibes 130px gold
- Urdu "المنتظرین: عزیز و اقارب"
- Small "Insha Allah"
- Peony clusters in the bottom corners, petals falling.

## data.ts (exact text; do not change spelling)
```ts
export const D = {
  bismillah: 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ',
  blessings: 'Late Mrs. & Mr. Abdul Khader Sahab Pattedar (Konayapally)',
  host: 'Mrs. Late Abdul Rahmath Sahab',
  groom: 'Mohammed Fayaz', bride: 'Muskan Khanam',
  brideParents: 'Mrs. & Mr. Khamru Jama Khan Sahab',
  namesUrdu: 'محمد فیاض ہمراہ مسکان خانم',
  welcomeUrdu: 'آپ کی تشریف آوری باعث مسرت ہوگی',
  fromUrdu: 'المنتظرین: عزیز و اقارب',
  events: [
    { name:'Nikah', urdu:'نکاح مسنون', day:'Monday', date:'14th December 2026', hijri:'4 Rajab 1448 AH',
      time:'10:00 AM', note:'Lunch follows', venue:'Ruby Garden', address:'Sripur Road, Nagarkurnool' },
    { name:'Valima', urdu:'ولیمہ مسنونہ', day:'Tuesday', date:'15th December 2026', hijri:'5 Rajab-ul-Murajjab 1448 AH',
      time:'8:00 PM', note:'Dinner', venue:'Venkat Narsimha Garden', address:'Shad Nagar Road, Amangal' },
  ],
};
```

## Quality rules
- No hard cuts anywhere after the envelope. Everything moves by scrolling, fading or easing. Never use linear easing for scroll.
- Every animated value uses `interpolate` with `extrapolateLeft/Right: 'clamp'`, or `spring({damping: 200})` for pops.
- Text never touches the edges: keep 80px side padding.
- If any `public/art/*` file is missing, render a tasteful SVG/gradient fallback instead of crashing, and log a warning.
- Rendering must be deterministic: no `Math.random`, no `Date.now()` except the single `RENDER_REFERENCE`.
- After building, run `npx remotion studio` so I can preview. Then render with:
  `npx remotion render Invite out/nikah-invite.mp4 --codec=h264 --crf=16 --jpeg-quality=95`

---

## Art you must generate first (the biggest reason your video looks flat)
The reference's beauty comes from **painted watercolour illustrations**, which code alone can't produce. Generate these with any image generator (for example Canva's AI image tool), then save them into `public/art/`.

| File | Size | Prompt |
|---|---|---|
| `hero.jpg` | 1080×1920 | Soft watercolour painting, pastel blue sky with fluffy clouds and warm sun rays top-left, distant lavender mountains, calm lake, foreground elegant outdoor nikah stage: ivory drapes, arch covered in blush peonies and white roses, cream sofa, brass lanterns, petals on steps; dreamy, romantic, soft pastel, no people, no text, upper half mostly sky |
| `envelope.jpg` | 1080×1920 | Flat top-down ivory paper envelope texture with subtle embossed damask/floral pattern, portrait, V-shaped flap from top edge to 62% height, soft even light, no seal, no text |
| `seal.png` | transparent | Gold metallic wax seal, round with irregular melted edge, embossed elegant monogram "F&M", top-down, transparent background |
| `peony-cluster.png` | transparent | Watercolour cluster of blush-pink peonies and white roses with sage leaves, transparent background |
| `dove.png` | transparent | Single white dove flying, wings spread, side view, soft realistic painting, transparent background |
| `garden-arch.jpg` | 1080×1500 | Watercolour garden with white classical arch and columns, climbing pink roses, misty lake and hills behind, soft pastel, lots of empty pale space in centre, no text |
| `event-nikah.jpg` | 940×600 | Watercolour Islamic-style ivory arch with gold trim, hanging brass lanterns, peonies at the base, pale blue background, no text |
| `event-valima.jpg` | 940×600 | Same style as event-nikah but blush-pink background and evening glow from the lanterns, no text |
