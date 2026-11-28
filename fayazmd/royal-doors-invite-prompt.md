# Royal Doors Invite (black & gold): build prompt for Claude Code

**For:** friends & colleagues of Mohammed Fayaz
**Reference:** "POV: your fiancé gives you this invitation", a 24 s phone recording of a black-and-gold wedding *website*.
**What you get:**

1. **A live invite website.** You share its link on WhatsApp. Guests tap the doors open, scratch to reveal the date, see a live countdown, send an RSVP and open the map.
2. **An MP4 video** of that same website being opened and scrolled, recorded automatically, for WhatsApp Status and Instagram. Because it records the real page, it matches the flow exactly.

---

## How to use this file

1. Create an empty folder `fayaz-invite`, open it in VS Code, and start Claude Code.
2. Put your song at `public/music.mp3`. Optional; if the file is missing the page still works.
3. Paste **PROMPT 1** and let it build. Check the page with `npm run dev` and fix anything using the checklist at the end.
4. Paste **PROMPT 2** to record the MP4.
5. Deploy: run `npm run build`, then drag the `dist` folder onto **app.netlify.com/drop**. You get a free link such as `fayaz-muskan.netlify.app`.

Fill in the two `TODO` values in `invite.config.ts` first: your WhatsApp number and the RSVP deadline.

---

## PROMPT 1: Build the website

````
You are a senior front-end engineer and luxury wedding-stationery designer.
Build a single-page, mobile-first wedding invitation website that recreates the
"Royal Doors" black-and-gold invite described below: its flow, motion and look,
with MY content.
Stack: Vite + vanilla TypeScript + plain CSS (no framework, no UI library).
Everything is drawn with HTML/CSS/SVG/Canvas. Use NO stock images, so the build
is self-contained.
Output: a production build in /dist that works offline except for Google Fonts
and the map embeds.

## 0. Content: create src/invite.config.ts and read ALL text from it
export const C = {
  bismillahEn: 'In the name of Allah, the Most Beneficent, the Most Merciful',
  groomShort: 'Fayaz', brideShort: 'Muskan',
  groomFull: 'Mohammed Fayaz', brideFull: 'Muskan Khanam',
  blessings: 'With the blessings of Late Mrs. & Mr. Abdul Khader Sahab Pattedar (Konayapally)',
  host: 'MRS. LATE ABDUL RAHMATH SAHAB',
  hostLine: 'Requests the honour of your presence on the occasion of the Nikah & Valima of her son',
  brideParents: '(D/o Mrs. & Mr. Khamru Jama Khan Sahab)',
  quote: 'With joyful hearts and gratitude, we invite you to celebrate love, unity, and the beginning of a beautiful journey together.',
  heroLabel: 'NIKAH & VALIMA',
  scratchReveal: '14th & 15th December 2026',
  scratchSub: 'Monday & Tuesday',
  events: [
    { key:'nikah',  title:'Nikah',  day:'Monday',  date:'14th December 2026', hijri:'4 Rajab 1448 AH',
      time:'10:00 AM', note:'Lunch follows', venue:'Ruby Garden', address:'Sripur Road, Nagarkurnool',
      startISO:'2026-12-14T10:00:00+05:30', mapQuery:'Ruby Garden, Sripur Road, Nagarkurnool, Telangana' },
    { key:'valima', title:'Valima', day:'Tuesday', date:'15th December 2026', hijri:'5 Rajab-ul-Murajjab 1448 AH',
      time:'8:00 PM', note:'Dinner', venue:'Venkat Narsimha Garden', address:'Shad Nagar Road, Amangal',
      startISO:'2026-12-15T20:00:00+05:30', mapQuery:'Venkat Narsimha Garden, Shadnagar Road, Amangal, Telangana' },
  ],
  rsvpDeadline: 'TODO e.g. 7th December 2026',
  whatsappNumber: 'TODO 91XXXXXXXXXX',          // digits only, with country code
  contacts: [ { name:'FAYAZ', phone:'TODO +91 XXXXX XXXXX' } ],
  footerLine: 'With gratitude · 14 & 15 December 2026',
  music: '/music.mp3',
};
Spelling is final: "Ruby Garden", "Venkat Narsimha Garden", "Rajab-ul-Murajjab".
Never change it.

## 1. Visual system
- Background: near-black #0B0B0D, with a very subtle radial lift
  (#17140F at top centre). Text: ivory #F3EBDD. Muted text: #B9AE9C.
- Gold: metallic gradient text and lines,
  linear-gradient(100deg,#8C6A2B 0%,#E9CF8A 28%,#C79A45 50%,#F6E3A6 70%,#9C7431 100%),
  applied with background-clip:text. Solid gold for hairlines: #C9A24A.
- Fonts (Google Fonts):
  - "Pinyon Script" for the names and script headings (gold gradient).
  - "Cormorant Garamond" (400/500/600 and italic) for body and italic lines.
  - "Cinzel" 500 for small-caps labels (13–14px, letter-spacing .32em).
- Ornament divider: a short hairline, a ✦ diamond, a short hairline (gold, 70px each side).
- Lace: draw an SVG white/silver henna-paisley lace pattern (stroke #E8E2D8,
  opacity .85, many small paisleys, dots and scallops). Use it as the top and
  bottom borders of the hero, cut into an ARCH shape so the centre stays black.
- String lights: a section divider made of 2 sagging catenary curves of thin gold
  wire, each with 14–18 tiny glowing bulbs (radial-gradient #FFE7A3 → transparent,
  with a gentle twinkle animation, each delay random).
- Gold dust: a fixed full-screen <canvas> behind everything. 60 tiny gold particles
  drift upward slowly, flicker, and wrap around. Off under prefers-reduced-motion.
- Music button: a fixed circle at bottom-right (56px), dark glass with a gold ring
  and an animated sound-wave icon. It toggles play/pause; when paused it shows a muted icon.
- Max content width 480px, centred. On desktop, the rest is black with a soft vignette.

## 2. Flow (top to bottom, exactly this order)

### Screen A: Royal Doors (full viewport, fixed overlay)
- Centre: tall arched double doors, about 78vh, drawn in SVG gold line-art.
  - Outer arch frame with a double line.
  - Two door leaves. Each has a jali lattice: a grid of small quatrefoil/diamond
    cells, a circular rosette medallion near the top of the leaf, and a glowing
    round door knob near the centre seam.
  - A thin threshold line at the bottom.
- Under the doors: "✦ TAP TO ENTER ✦" (Cinzel, gold, pulsing opacity .5↔1, 2 s).
- A soft gold halo breathes behind the doors (scale 1↔1.04).
- On tap/click/Enter:
  1. Start the music (catch autoplay errors silently).
  2. Doors open in 3D: perspective 1400px. The left leaf rotates Y 0→-105° around
     its left edge, and the right leaf 0→105° around its right edge. 1.2 s,
     cubic-bezier(.7,0,.2,1). Gold light floods out from the gap as it widens.
  3. While opening, warm bulbs (12) light up one by one along the arch frame
     (60 ms stagger).
  4. 0.4 s after the doors finish, the camera "walks through": the whole door scene
     scales 1→3.2 and fades to 0 over 0.9 s. At the same moment the page beneath
     fades in from scale .96 to 1. Then remove the overlay from the DOM.
- Lock body scroll until the doors are entered.

### Section B: Hero (100svh)
- Black arch-shaped centre framed by the lace at top and bottom.
- Content, centred, each line fading up in sequence (120 ms stagger) after entry:
  1. bismillahEn: italic 16px, ivory/muted, 2 lines.
  2. Divider ✦.
  3. groomShort: Pinyon Script, clamp(64px,19vw,96px), gold gradient. A slow
     shimmer sweep moves across the gold every 5 s.
  4. "&": Cormorant italic, muted.
  5. brideShort: same style as groomShort.
  6. "— Insha Allah —": italic.
  7. heroLabel: Cinzel small caps.
  8. SCRATCH BAR: a 260×58px gold-foil bar with a brushed-metal gradient, a fine
     inner border, and the label "✦ SCRATCH TO REVEAL ✦" (dark text).
     - Implement with <canvas> over the hidden text scratchReveal (Pinyon Script
       30px gold). Pointer/touch drag erases with globalCompositeOperation
       'destination-out' and a 26px brush.
     - Emit gold sparkle particles at the finger.
     - At 55% cleared, fade out the rest and pop the date (scale .9→1).
     - Keyboard and accessibility fallback: pressing Enter/Space on the bar reveals it.
  9. scratchSub: muted italic.
- Bottom: a small "scroll" chevron bobbing.

### Section C: The Invitation
- String lights divider at the top.
- "THE INVITATION" label, then a divider.
- host: Cinzel 18px, ivory, uppercase, centred, 2 lines.
- hostLine: italic.
- groomFull: Pinyon Script 56px gold.
- "with": italic.
- brideFull: Pinyon Script 56px gold.
- brideParents: small italic muted.
- blessings: small italic muted.
- quote: italic 18px, in curly quotes.

### Section D: Countdown ("Until We Celebrate")
- "COUNTING THE MOMENTS" label, then "Until We Celebrate" in Pinyon Script 52px.
- Below: the date and time of the next event, e.g. "Monday, 14th December 2026 · 10:00 AM".
- FIREWORKS: when this section enters the viewport (IntersectionObserver), launch
  5 bursts on a canvas over the section.
  - Each burst: 70 particles, gold #F6E3A6 / white / champagne, radial velocity,
    gravity .04, friction .985, fading trails.
  - Each burst blooms into a soft glowing flower shape.
  - Re-fire every 7 s while visible. Off under reduced motion.
- 4 square boxes (66px, 1px gold border, inner hairline) for DAYS, HOURS, MINUTES,
  SECONDS, with labels under them in Cinzel 10px.
  - Count down to the first event in the future (Nikah, then Valima).
  - Digits flip: the old one slides up and the new one slides in.
  - After both events: show "Alhamdulillah" and hide the boxes.
- String lights divider at the bottom.

### Section E: RSVP ("Kindly Respond")
- "RSVP" label, then "Kindly Respond" in Pinyon Script 52px.
- "Your presence is the greatest gift. Please confirm by {rsvpDeadline}." (italic).
- Form (labels in Cinzel 11px):
  - NAME: an outlined field with a 1px gold-30% border, placeholder "Your full name".
  - ATTENDANCE: two pill toggles, "JOYFULLY" and "REGRETS". The selected pill is a
    solid gold gradient with dark text.
  - GUESTS: a number box, 1–20.
  - EVENTS: two checkable pills, "NIKAH · 14 DEC" and "VALIMA · 15 DEC" (hidden when REGRETS).
  - A full-width gold gradient button "SEND RSVP" with a press shimmer.
- On submit:
  - Validate. Show inline errors in soft red #E8A0A0.
  - Build a WhatsApp message: "Assalamu Alaikum! RSVP for Fayaz & Muskan's wedding
    / Name / Reply / Guests / Events".
  - Open https://wa.me/{whatsappNumber}?text=... in a new tab.
  - Show a thank-you state: script "Shukriya!" and the line "We can't wait to celebrate with you."
- Under the form, a contact card for each item in contacts: gold outline box, name
  label, ☎ icon and the phone as a tel: link.

### Section F: The Venue (one block per event)
- String lights, then the "THE VENUE" label.
- Per event:
  - Event title in Cinzel ("NIKAH" / "VALIMA").
  - venue in Pinyon Script 46px gold.
  - address italic.
  - "date · time · note" small.
  - An embedded Google Map: iframe
    src="https://maps.google.com/maps?q={encodeURIComponent(mapQuery)}&z=15&output=embed",
    320px tall, rounded 10px, 1px gold border, loading="lazy".
  - Gold button "📍 VIEW ON MAPS", linking to
    https://www.google.com/maps/search/?api=1&query={mapQuery}.

### Section G: Footer
- Divider.
- "Fayaz & Muskan" in Pinyon Script 44px gold.
- footerLine, italic muted.
- 100px bottom padding (so the music button never covers text).

## 3. Motion rules
- Every section element reveals on scroll with fade and rise (opacity 0→1,
  translateY 24→0, 700 ms, stagger 90 ms) via IntersectionObserver
  (threshold .2, once).
- Smooth native scrolling. No scroll-jacking.
- All animation is GPU-friendly (transform/opacity only); canvases use
  requestAnimationFrame and pause when the tab is hidden.
- prefers-reduced-motion: no doors animation (instant fade), no fireworks, no dust,
  and instant reveals.

## 4. Quality bar
- Test at 360, 390, 430 and 768 px widths: no horizontal scroll, no overlapping
  text, and the names always fit on one line each.
- Lighthouse mobile: Performance ≥ 85, Accessibility ≥ 95.
- Proper <title>"Fayaz & Muskan · Nikah & Valima"</title>, plus an Open Graph title,
  description and a 1200×630 og-image (generate one from the hero at build time or
  include a static PNG drawn with canvas), so the WhatsApp link preview looks premium.
- Semantic HTML and aria-labels on the doors, scratch bar, music button and pills.
- No console errors. No external JS libraries.
- When finished: run the dev server, open it at 390×844, and describe any visual
  problem you notice and fix it.
````

---

## PROMPT 2: Record the MP4 (after Prompt 1 works)

````
Add a script `scripts/record.ts` (run with `npx tsx scripts/record.ts`) that uses
Playwright (chromium) to record the invite website as a vertical video, exactly
like a person opening it on a phone.

- Start `vite preview` on port 4173, then open it in a 1080×1920 viewport
  (deviceScaleFactor 1, isMobile true, hasTouch true) with recordVideo
  size 1080×1920.
- Show a fake finger: inject a 70px soft white translucent circle that follows
  the scripted pointer and shows a ripple on each tap, so viewers see the touches.
- Scripted timeline (total about 30 s):
  - 0.0–2.5 s: idle on the doors (dust and pulsing "TAP TO ENTER").
  - 2.5 s: tap the centre of the doors, then wait 3.2 s for the opening and walk-through.
  - 6.0 s: hold on the hero for 1.5 s.
  - 7.5–10 s: scratch the gold bar. Use a zig-zag pointer drag of 10 strokes
    across the bar (mouse.down, many mouse.move steps, mouse.up) until the date
    is revealed. Hold 1 s.
  - Then scroll down smoothly with an eased custom function
    (window.scrollTo in small rAF steps, easeInOutCubic), 1.2 s per move.
    Stop and hold at each section for:
    - Invitation: 3 s
    - Countdown: 4 s (fireworks must be visible)
    - RSVP: 4 s, during which you type "Your Name" into NAME at human speed,
      tap JOYFULLY, set guests to 2, and DO NOT submit
    - Nikah venue with map: 2.5 s
    - Valima venue: 2.5 s
    - Footer: 2 s
- Save the raw .webm. Then use ffmpeg (via child_process) to:
  1. Convert to H.264 MP4, 30 fps, crf 17, yuv420p, 1080×1920.
  2. Mix in public/music.mp3 from 0 s with a 1 s fade-in and a 1.5 s fade-out at
     the end, trimmed to the video length.
  3. Write the result to out/fayaz-muskan-invite.mp4.
- Print the output path and its duration when done.
````

---

## Final checklist (check before sharing)

- [ ] Names: **Mohammed Fayaz**, **Muskan Khanam**; parents' names exactly as on the printed card.
- [ ] Nikah: **Monday 14 Dec 2026, 10:00 AM**, Ruby Garden, Sripur Road, Nagarkurnool.
- [ ] Valima: **Tuesday 15 Dec 2026, 8:00 PM**, Venkat Narsimha Garden, Shad Nagar Road, Amangal.
- [ ] Both **VIEW ON MAPS** buttons open the right place. Test on your phone.
- [ ] The RSVP opens WhatsApp with your number and a filled message.
- [ ] The countdown shows the right days left.
- [ ] Music starts after tapping the doors, and the button pauses it.
- [ ] The WhatsApp link preview shows the image and title.
- [ ] The MP4 plays on WhatsApp and is under 16 MB. If not, re-run with crf 20.
