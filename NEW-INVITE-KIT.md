# New Invite Kit: turn a reference video into a design brief

**How to use this file**
1. Open a new chat with Claude (claude.ai or the app).
2. Attach **this file** and the **reference video** (a wedding-invite website being opened and scrolled on a phone). If the app can't take the video, attach 8–15 screenshots taken every 2–3 seconds instead, in order.
3. Paste the person's details (names, dates, venues, map links, phone number) as plain text, in any form.
4. Send: **"Follow NEW-INVITE-KIT.md part A."**
5. Generate the images and the song with the prompts it gives you, name the files exactly as in its asset table, and bring the brief and the files to Claude Code in this repo.

---

## Part A: instructions for Claude (the chat that reads this file)

You are a wedding-stationery art director and front-end designer. You'll receive:
- a reference video (or screenshots) of a wedding-invite **website** on a phone;
- the details of the person this new invite is for.

Your job: study the reference closely, then return **one Markdown document** that fills in the **template in part B**. Keep the same headings and order, and fill every field. A developer (Claude Code) will build a new site from your document alone, without seeing the video, so describe what you see precisely enough to rebuild it.

Rules:
1. **Describe, don't copy.** Capture the flow, layout, motion and mood. Leave out any brand names, logos, watermarks, app UI or real people from the video.
2. **Be exact.** Give colours as hex codes. Give timings in seconds (e.g. "0.0–2.4 s"). For fonts, name the nearest **Google Fonts** family (script, body, labels). Give sizes relative to a 390 px-wide phone screen.
3. **Content comes from the details, not the video.** Use the person's real names, dates and venues. Write `TODO` for anything missing; never invent a phone number, date, venue or map link.
4. **Arabic and Urdu:** write them out, then add "⚠ have a fluent reader check". Muslim invites usually carry the Bismillah, a Quran verse (often Ar-Rum 30:21) and the Prophet's ﷺ dua for the couple; include them only if the person wants them.
5. **Images:** every image prompt is for a **text-free** picture. All writing is added by the website, because generated text comes out garbled. No real faces. Say where the empty space must be for the text that goes on top.
6. **Fit the build** (part C): one phone-width page made of full-screen sections, opened by a tap-to-enter intro, which then scrolls itself section by section. If the reference does something that can't work this way, say so and suggest the closest version.
7. End with a short **"Open questions"** list for anything you were unsure about.

---

## Part B: the template to fill

```markdown
# Design brief: <person> invite

## 1. Person & site
- Folder / branch name: <one lowercase word, e.g. ayesha>  / <Branch, e.g. Ayesha>
- Netlify site name wanted: <e.g. ayeshainvitation> (→ https://<name>.netlify.app/)
- Invite is from: <groom's family / bride's family / couple / friends>
- Audience: <family / friends & colleagues / both>
- Occasion label: <e.g. NIKAH & VALIMA, WALIMA, ENGAGEMENT, MEHNDI>
- Language: <English only / English + Urdu / + Arabic verses>

## 2. Content (every word on the page)
- Name order on this card: <first name shown first, e.g. groom first>
- First person — short / full: <Fayaz> / <Mohammed Fayaz>
- Second person — short / full: <Muskan> / <Muskan Khanam>
- Names in Urdu: <…>  ⚠ check
- Monogram letters: <F & M>
- "Save the date" line (if any): <…>
- Hosts: <e.g. Mrs. & Mr. … Sahab>
- Host line: <e.g. solicit your gracious presence on the auspicious occasion of the Nikah & Valima of their daughter>
- Parents line for the other person: <e.g. son of …>
- Blessings label / names (or "none"): <With the blessings of> / <…>
- Opening line: <e.g. With joy in our hearts>
- Bismillah: <yes/no> · Quran verse: <ref + Arabic + English, or no> · Dua for the couple: <yes/no>
- Urdu welcome line: <e.g. آپ کی تشریف آوری باعث مسرت ہوگی> ⚠ check
- Scratch-card reveal text: <e.g. 14 & 15 · 12 · 2026> / sub-line: <Monday & Tuesday>
- Countdown title (before / after): <…> / <Alhamdulillah>
- Closing lines: <e.g. Your presence and duas will be our greatest blessing · With best compliments from · Near & Dear>
- RSVP: WhatsApp number <digits with country code, or TODO> · deadline <date or none> · message when accepting / declining: <…>
- Link-preview title and description (WhatsApp card): <…> / <…>
- Things NOT to show: <e.g. a family title the family asked to leave out>

## 3. Events (one block per event)
### <Nikah>
- Title / Urdu title: <Nikah> / <نکاح مسنون> ⚠ check
- Day, date: <Monday>, <14th December 2026>
- Hijri date: <4 Rajab 1448 AH>
- Time: <10:00 AM> · note: <Lunch follows>
- One-line description: <…>
- Venue / address: <Ruby Garden> / <Sripur Road, Nagarkurnool>
- Start (ISO): <2026-12-14T10:00:00+05:30>
- Google Maps link: <https://maps.app.goo.gl/… or TODO> (lat,lng if known: <…>)

## 4. Reference video analysis
### 4.1 Scene by scene
| Time (s) | On screen | Motion / transition | Text shown |
|---|---|---|---|
| 0.0–2.5 | … | … | … |

### 4.2 Intro (before the tap)
- Type: <doors / curtain / envelope / box / other>
- What it looks like, and exactly how it opens (order, durations, easing, flashes or light):

### 4.3 Sections in order
| # | Section | Layout & what's in it | Seconds held on it | Special effect |
|---|---|---|---|---|
| 1 | Hero / save the date | … | … | scratch card? |

(Usual sections: hero + scratch card, invitation text, verse, events, countdown, RSVP, venues + maps, dua / closing. Add, drop or reorder to match the reference.)

### 4.4 Look
- Palette (hex, and what each colour is used for): <#…  background>, <#…  gold text>, …
- Gold or metal treatment: <flat / gradient (give the stops) / glow>
- Fonts (Google Fonts): script <…>, body <…>, small labels <…> (spacing, caps)
- Motifs & ornaments: <arches, lattice bands, roses, lanterns, paisley lace…>
- Textures and lighting: <velvet, paper grain, candle glow, bokeh…>

### 4.5 Motion
- Page movement: <section snaps / slow drift / parallax>, glide length <s>, easing
- How text enters: <fade-up, stagger N ms, blur-in…>
- Ambient effects: <petals, gold dust, sparkles, fireworks, 3D sky…> (density, speed)
- Taps: <scratch card, RSVP buttons, map, music button>

### 4.6 Music
- Mood / instruments / tempo: <…>
- Length: <40–60 s> · where it peaks: <…>
- Song-generation prompt (Suno or similar), instrumental, no vocals unless wanted: <…>

## 5. Art assets (images you will generate)
| File | Used for | Size | Text area to keep plain | Prompt | Must not contain |
|---|---|---|---|---|---|
| public/art/hero.webp | full-screen hero background | 1080×1920 (9:16) | centre 60% | <ready-to-paste prompt> | text, letters, people, watermark |
| public/og-image.png | WhatsApp link preview | 1200×630 | centre | <…> | text |

(Typical set: intro background (curtain/doors), hero background, an arch or frame with an empty centre, 1–2 section backgrounds, a repeating border band. Prefer few, strong images; small ornaments are drawn in code.)

## 6. Anything special
- <extra sections, a photo gallery, family requests, guest-name personalisation…>

## Open questions
- <…>
```

---

## Part C: how these sites are built (so the brief fits)

- **One folder per person, one branch per person, one Netlify site per branch.** Every branch holds every folder (see `README.md`). Existing invites to compare against: `fayaz/` (emerald & gold, 3D sky), `fayazmd/` (black & gold, royal doors), `muskan/` (rose & gold), `muskankhanam/` (red curtain, painted palace hall and arch, built from a reference video).
- **Stack:** Vite + TypeScript + plain CSS, no framework. Built for phones 360–430 px wide; it still works on desktop.
- **All text in one file:** `src/invite.config.ts` (names, events, map pins, WhatsApp number, every label). Sections 2–3 of the brief map straight onto it.
- **Flow:**
  1. The guest taps the intro, which also starts the music (phones only allow sound after a tap).
  2. The hero and scratch card appear. The card scratches itself after a few seconds.
  3. The page glides through the sections on its own, pausing on each for its hold time.
  4. The guest's first touch hands control to them.
- **Art:** `public/art/*.webp` (generated images, ~100–300 KB each after compression). Ornaments, borders, sparkles and fireworks are drawn in code. `public/music.mp3`. `public/og-image.png` for the WhatsApp preview.
- **Built in automatically:** `?video` (records the MP4 for WhatsApp Status), `?test` (🧪 phone tester), `npm run check` (layout/contrast/flow QA), live countdown, WhatsApp RSVP, Google Maps.

### What to bring to Claude Code
1. The filled **design brief** (part B), pasted or saved as a file.
2. The **images**, named exactly as in the asset table (PNG/JPG is fine; they get converted to WebP).
3. **music.mp3**, if you have the song.
4. The **Netlify site name** you want. You create the empty site and connect it to this repo on the new branch, or ask Claude Code for the steps.
5. Optional: the reference video or screenshots, for side-by-side checks.

Then say: **"Build a new invite from this brief."** Claude Code will:
- create the folder and branch;
- add the branch to `netlify.toml`, `scripts/netlify-ignore.sh` and `scripts/push-all.sh`;
- build the site from the brief;
- run the QA check and a phone test;
- record the MP4 and make the link preview;
- push to every branch.

### Example (muskankhanam, in short)
Reference: a "royal wedding website" phone video.
- **Intro:** red velvet curtain with a gold F & M crest. The tap opens a gold line → amber beam → cream flash (2.5 s).
- **Hero:** a candle-lit palace hall with a slow zoom, "Save the Date", the names, a gold scratch card on the stairs.
- **Invitation:** text inside a painted Mughal arch between rose walls.
- **The rest:** events timeline on blush; countdown on black with gold fireworks; WhatsApp RSVP; venue maps; closing dua.
- **Palette and fonts:** maroon #5A0B14, crimson #8E0E1C, blush #FBEFE8, rose ink #A83A5C, gold #E2B765; Pinyon Script and Monsieur La Doulaise / Cormorant Garamond / Cinzel; Amiri (Arabic), Noto Nastaliq Urdu.
- **Art:** `curtain.webp`, `hall.webp`, `arch.webp` (1080×1920, text areas left plain).
