# New Invite Kit: from any video and any person's details to a design brief

Use this file **every time** you want a new invite. Each time can be different:

| Case | You give the chat Claude | What changes |
|---|---|---|
| **A. New design + new person** | a reference video + the person's details | new look, new content |
| **B. Existing design + new person** | the name of an existing design (or an old video / old brief) + the person's details | same look, new content |
| **C. New design for someone who already has an invite** | a reference video + "same details as `<folder>`" | new look, same content |
| **D. Change an existing invite** | the folder name + what to change (and a video if it's about the look) | only what you list |

**How to use it**
1. Open a **new** chat with Claude (claude.ai or the app). Use a new chat each time, so nothing from an earlier person carries over.
2. Attach **this file**. For cases A and C, also attach the **video**. If the video can't be attached, attach 8–15 screenshots taken every 2–3 s, in order.
3. Paste the **person's details** as plain text, in any form: names, families, dates, times, venues, map links, WhatsApp number, anything special.
4. Send: **"Follow NEW-INVITE-KIT.md part 1. Case A"** (or B, C, D).
5. You get back a **design brief**. Generate the images and the song with its prompts and name the files exactly as its asset table says. Then bring the brief and the files to Claude Code in this repo and say **"Build a new invite from this brief."**

The existing designs you can name in case B are listed in part 3.

---

## Part 1: instructions for Claude (the chat that reads this file)

You are a wedding-stationery art director and front-end designer. Return **one Markdown document** that fills in the **template in part 2**, keeping its headings and order. A developer (Claude Code) will build the site from your document alone, without seeing the video, so be precise.

**Per case:**
- **Case A (new video, new person):** fill in every section of the template. Section 4 comes from the video; sections 2–3 come only from the person's details.
- **Case B (existing design, new person):** in section 1, set *Base design* to the named design (or describe the old video/brief you were given). Fill sections 2–3 from the details. In section 4, write only what should differ from the base design (often nothing). In section 5, list only new images (often none). Even when the design is reused, the monogram, names and colours that spell names must be the new person's.
- **Case C (new video, same person):** fill section 4 from the video. Section 2–3 content says "same as `<folder>`", except for anything the user says to change.
- **Case D (change an existing invite):** set *Base design* to that folder. Fill in only what changes, and write "unchanged" everywhere else.

**Rules:**
1. **Content comes only from the details you're given in this chat.** Never reuse names, dates, venues or numbers from the examples in this file, or from an earlier chat. Write `TODO` for anything missing. Never invent a phone number, date, venue, Hijri date or map link.
2. **Describe the video, don't copy it.** Capture its flow, layout, motion and mood. Leave out brand names, logos, watermarks, app screens and real people.
3. **Be exact.** Colours as hex. Timings in seconds (e.g. "0.0–2.4 s"). Fonts as the nearest **Google Fonts** family (script, body, labels). Sizes relative to a 390 px-wide phone.
4. **Arabic and Urdu:** write them out and mark each with "⚠ fluent reader to check". Include the Bismillah, a Quran verse or a dua only if the details ask for them, or if the base design has them and nobody said to remove them.
5. **Images:** every image prompt is for a **text-free** picture with no real faces. All writing is added by the website. Say where the empty space must be for the text on top.
6. **Fit the build** (part 3). If the video does something that can't work that way, say so and suggest the closest version.
7. End with **"Open questions"**: anything missing or unclear.

---

## Part 2: the template to fill

```markdown
# Design brief: <invite name>

## 1. Case, person & site
- Case: <A / B / C / D>
- Base design: <none (new) / fayaz / fayazmd / muskan / muskankhanam / another folder / "old video: …">
- Folder name / branch name: <one lowercase word> / <Capitalised, e.g. Ayesha>
- Netlify site name wanted: <e.g. ayeshainvitation> (→ https://<name>.netlify.app/)
- Invite is from: <groom's family / bride's family / the couple / friends>
- Audience: <family / friends & colleagues / both>
- Occasion label: <e.g. NIKAH & VALIMA / WALIMA / ENGAGEMENT / MEHNDI>
- Languages on the page: <English / English + Urdu / + Arabic>

## 2. Content (every word on the page)
- Which name comes first: <…>
- First person, short / full name: <…> / <…>
- Second person, short / full name: <…> / <…>
- Names in Urdu: <…> ⚠ check
- Monogram letters: <X & Y>
- "Save the date" line (if any): <…>
- Hosts: <…>
- Host line: <e.g. request the pleasure of your company at the … of their son/daughter>
- Parents line for the other person: <e.g. son/daughter of …>
- Blessings label / names (or "none"): <…> / <…>
- Opening line: <…>
- Bismillah: <yes/no> · Quran verse: <reference + Arabic + English, or no> · Dua for the couple: <yes/no>
- Urdu welcome line: <… or none> ⚠ check
- Scratch-card reveal text / sub-line: <…> / <…>
- Countdown title before / after the event: <…> / <…>
- Closing lines: <…>
- RSVP: WhatsApp number <digits with country code, or TODO> · deadline <date or none> · accept message <…> · decline message <…>
- Link preview (WhatsApp card) title / description: <…> / <…>
- Never show: <…>

## 3. Events (one block per event)
### <Event title>
- Title / Urdu title: <…> / <…> ⚠ check
- Day, date: <…>, <…>
- Hijri date: <… or TODO>
- Time: <…> · note: <e.g. lunch / dinner follows>
- One-line description: <…>
- Venue / address: <…> / <…>
- Start (ISO with time zone): <YYYY-MM-DDTHH:MM:00+05:30>
- Google Maps link: <… or TODO> (lat,lng if known: <…>)

## 4. Design (from the video, or "same as base design" plus differences)
### 4.1 Scene by scene
| Time (s) | On screen | Motion / transition | Text shown |
|---|---|---|---|

### 4.2 Intro (before the tap)
- Type: <doors / curtain / envelope / box / other>
- Looks like / how it opens (order, durations, easing, light or flashes):

### 4.3 Sections in order
| # | Section | Layout & content | Seconds held | Special effect |
|---|---|---|---|---|

(Usual sections: hero + scratch card, invitation, verse, events, countdown, RSVP, venues + maps, dua / closing. Add, drop or reorder to match.)

### 4.4 Look
- Palette (hex and what each colour is used for):
- Gold/metal treatment: <flat / gradient (give the stops) / glow>
- Fonts (Google Fonts): script <…>, body <…>, labels <…>
- Motifs & ornaments:
- Textures & lighting:

### 4.5 Motion
- Page movement: <snaps / slow drift / parallax>, glide <s>, easing
- How text enters: <…>
- Ambient effects (density, speed): <…>
- Taps: <scratch card, RSVP, map, music button, …>

### 4.6 Music
- Mood / instruments / tempo: <…> · length <40–60 s> · peak at <…>
- Song prompt (Suno or similar): <…>

## 5. Art assets to generate (only new ones)
| File | Used for | Size | Keep plain for text | Prompt | Must not contain |
|---|---|---|---|---|---|
| public/art/<name>.webp | … | 1080×1920 | … | … | text, letters, people, watermark |
| public/og-image.png | WhatsApp preview | 1200×630 | centre | … | text |

## 6. Anything special
- <…>

## Open questions
- <…>
```

---

## Part 3: how these sites are built

- **One folder per person, one branch per person, one Netlify site per branch.** Every branch holds every folder (see `README.md`).
- **Existing designs** (usable as *Base design*):

| Folder | Look | Intro | Notes |
|---|---|---|---|
| `fayaz` | emerald & gold, 3D starry sky with lanterns | gold doors | page-by-page, Arabic verse & dua |
| `fayazmd` | black & gold, white lace | royal doors | friends & colleagues, Valima only |
| `muskan` | rose & gold, 3D sky | doors | bride's family version |
| `muskankhanam` | red velvet, painted palace hall & Mughal arch, blush sections with lattice bands | red curtain | built from a reference video, with generated art |

- **Stack:** Vite + TypeScript + plain CSS. Phone-first (360–430 px wide); works on desktop too.
- **All text in one file:** `src/invite.config.ts`. Sections 2–3 of the brief map straight onto it.
- **Flow:**
  1. The guest taps the intro, which starts the music (phones only allow sound after a tap).
  2. The hero and scratch card appear; the card scratches itself after a few seconds.
  3. The page moves through the sections on its own, pausing on each.
  4. The guest's first touch gives them control.
- **Art:** `public/art/*.webp` (~100–300 KB each), `public/music.mp3`, `public/og-image.png`. Small ornaments, borders, sparkles and fireworks are drawn in code.
- **Built in automatically:** `?video` MP4 recording for WhatsApp Status, `?test` 🧪 phone tester, `npm run check` QA, live countdown, WhatsApp RSVP, Google Maps.

### What to bring to Claude Code
1. The **design brief**.
2. The **images**, named as in the asset table (PNG/JPG is fine; they get converted).
3. **music.mp3**, if there's a song.
4. The **Netlify site name**. You create the empty site on the new branch, or ask Claude Code for the steps.
5. Optional: the video or screenshots, for side-by-side checks.

Claude Code then:
- creates the folder and branch, or edits the existing folder in case D;
- adds the branch to `netlify.toml`, `scripts/netlify-ignore.sh` and `scripts/push-all.sh`;
- builds from the brief;
- runs QA and a phone test;
- records the MP4 and makes the link preview;
- pushes to every branch.

### Example of a finished case A (design only; the names and details are NOT for reuse)
`muskankhanam`, from a "royal wedding website" phone video:
- **Intro:** red velvet curtain with a gold monogram crest. The tap opens a gold line → amber beam → cream flash (2.5 s).
- **Hero:** a candle-lit palace hall with a slow zoom, "Save the Date", the names, and a gold scratch card.
- **Invitation:** text inside a painted Mughal arch between rose walls.
- **The rest:** events timeline on blush; countdown on black with gold fireworks; WhatsApp RSVP; venue maps; closing dua.
- **Palette and fonts:** maroon #5A0B14, crimson #8E0E1C, blush #FBEFE8, rose ink #A83A5C, gold #E2B765. Pinyon Script and Monsieur La Doulaise / Cormorant Garamond / Cinzel; Amiri (Arabic), Noto Nastaliq Urdu.
- **Art:** `curtain.webp`, `hall.webp`, `arch.webp` (1080×1920, text areas left plain).
