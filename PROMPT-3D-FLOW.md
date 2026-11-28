# Prompt for Claude Code: build the invite's visuals as one 3D world (no image files)

Paste everything below the line into Claude Code, in the repo where the design brief is already being built.

---

You are a senior creative front-end engineer (WebGL / Three.js, mobile performance). You are working on the invite you are already building from `DESIGN-BRIEF-fayaz-pastel.md`.

## Change of plan
**There will be no generated images.** Ignore section 5 of the brief (`curtain.webp`, `hero.webp`, `names.webp`, `nikah.webp`, `valima.webp`, `closing.webp`). Build every background as **real-time 3D in code**, as **one continuous 3D world** that the camera travels through, synced to the page sections. Everything else in the brief stays as written: text and content, palette, fonts, section order and hold times, text blur-fade, scratch card, countdown, RSVP, maps, music, `?video`, `?test` and `npm run check`.

Follow the patterns the repo already uses for 3D (the `fayaz` / `muskan` 3D skies): read those first and reuse their renderer setup, resize handling, quality tiers and `?video` time hooks instead of inventing new ones.

## The idea: one journey, not separate pictures
One Three.js scene. One camera moves along a `CatmullRomCurve3` path. Each page section owns a stretch of the path (a "station"). When the page snaps to a section, the camera glides to that station over the same 1.0 s ease-in-out as the page snap, then drifts slowly while the section is held (a ~3 % dolly-in plus a slight orbit of ±2°). Going back reverses the path. It should feel like walking through a pastel sunset garden into a wedding.

Time of day is driven by one `progress` value (0→1 across the journey). Sky, fog and light colours lerp between the stations' palettes, so the light shifts from afternoon blue to sunset peach to dusk, then back to a warm golden sunset at the end.

### Stations (in section order)
| # | Section | What the camera sees | Sky / light |
|---|---|---|---|
| 0 | Intro (before the tap) | Close on closed cream silk drapes filling the screen, a white flower garland swag across the top, two brass lanterns hanging in front. HTML on top: Bismillah, monogram ring, "Tap to open". | Warm interior light |
| 1 | Hero + scratch card | The drapes part (cloth animation) and the camera pushes through into a courtyard: palms, a row of hanging lanterns, a distant white domed palace on the horizon | Powder blue #88B8E8 → peach #FFD8CD |
| 2–3 | Invitation (English, then Urdu) | A colonnade of three tall blush-cream pointed (Mughal) arches with painted lotus sprays; lanterns and small gold crescents/stars hanging on strings | Blue #B2D7EC → blush #F8DBD4 |
| 4 | Nikah | A round arch of white flowers by a calm lake, mountains and pines behind, pink petals drifting | Sunset peach, low sun |
| 5 | Valima | A petal-strewn path lined with candles and lanterns leading to a lit floral mandap with aqua drapes; carved white arches on each side | Dusk: deep blue top, warm lights |
| 6 | Countdown | The camera rises above the mandap into the open sky. Many lanterns float and sway; gold sparkles | Dusk → first stars |
| 7–8 | RSVP, Venues | Gentle hold in the sky; the lanterns parallax slowly behind the UI cards | Dusk, slightly dimmed (UI must read) |
| 9 | Closing | The camera descends towards a white marble mosque (domes, four minarets) at golden sunset; lanterns hang in the foreground top | Golden sunset |

Keep the top 40–45 % of the frame (where the text sits) as **clean sky** at every station: frame the camera so the subjects sit in the lower half. Under the text block, add a soft cream veil (rgba(255,250,244,.0→.55) gradient) only if contrast checks fail.

### People
No figures. Faceless 3D people built from primitives look like toys and cheapen the design. The architecture, flowers and light carry the story. If a couple feels missing, add at most one **back-view silhouette** of a couple (a flat dark shape cut out of a plane, softly backlit) at the Valima path and the mosque, and make it removable with one flag: `SHOW_COUPLE = false` by default.

## How to build each element (procedural only: no GLTF, no image textures, no external assets)
- **Sky:** a big inverted sphere with a gradient ShaderMaterial (3 colour stops + sun glow + a soft cloud band from 2-octave noise), with uniforms lerped by `progress`. Stars fade in after the Valima station.
- **Fog:** `THREE.Fog` with its colour tied to the sky horizon colour, for depth and cheap atmosphere.
- **Drapes:** two subdivided planes (40×60 segments). A vertex shader gives sine folds plus a gentle sway; on the tap, animate the x-gathering towards each side (1.4 s, cubic-bezier(.65,0,.35,1)). Ivory #F6EBDD with fake sheen (fresnel term).
- **Lanterns:** one lantern built from Lathe + Cylinder geometry (brass, MeshStandardMaterial metalness .8 / roughness .35), shown with `InstancedMesh` (keep the count low, ≤ 40). The glow is an additive sprite whose texture is drawn on a canvas at runtime (radial gradient), not a bloom pass. Sway ±3°, 4 s period, random phase per instance. Chains are thin cylinders.
- **Arches:** a pointed Mughal arch `Shape` (two arcs meeting at a point) → `ExtrudeGeometry` with a small bevel. Lotus sprays are a canvas-drawn texture made at runtime (allowed, because it is generated in code) applied as a decal plane.
- **Flowers (garlands, floral arch, path edges):** `InstancedMesh` of a low-poly rose (a few twisted petal planes) and small white blossoms, placed along curves with jitter. Mix white #FFFFFF, blush #F8DBD4 and pink #E8A0B0.
- **Palms, pines, mountains:** palms are a trunk (curved tube) plus instanced frond planes; pines are stacked cones; mountains are a displaced plane on the horizon in desaturated blue-green, faded by fog.
- **Lake:** a plane with a simple shader: a gradient reflection of the sky colours plus moving ripple lines (no reflection render target).
- **Mandap:** four slim pillars, a dome or canopy, aqua (#9ED8D6) cloth panels as cloth planes, warm point-light look done with emissive materials and glow sprites (max 2 real lights in the whole scene).
- **Mosque / palace:** domes are `LatheGeometry` from an onion profile; minarets are stacked cylinders with small domes; the body is boxes with arch cut-outs suggested by darker inset planes. White marble: MeshStandardMaterial #F4EFE8, roughness .6, with warm rim light from the sun direction.
- **Particles:** petals (Nikah, ≤ 60) and gold sparkles (Valima / countdown, ≤ 80) as `Points` with a custom shader (size attenuation, rotation, fall on a sine drift), wrapped around the camera so they never run out.
- **Lighting:** one HemisphereLight (sky/ground lerped by `progress`) and one DirectionalLight as the sun. No real-time shadows; use baked-looking contact shadows (a dark radial-gradient plane under objects).
- **Look:** soft, painterly and warm, matching the brief's palette. Use `ACESFilmicToneMapping`, exposure ~1.0, `SRGBColorSpace`. Optional cheap vignette and grain in one final full-screen pass, only on the high tier.

## Performance budget (phones are the target)
- Hard target: **60 fps on a mid-range Android (e.g. a Redmi Note), never below 30**.
- `renderer.setPixelRatio(Math.min(devicePixelRatio, tier === 'high' ? 2 : 1.5))`, `antialias` on the high tier only, `powerPreference: 'high-performance'`.
- Below 80 draw calls; below 150k triangles in view; instance everything that repeats.
- Quality tiers (`low` / `mid` / `high`) picked from a 1-second frame-time probe after the intro tap, plus `?q=low|mid|high` to force one. The low tier halves particles, drops the final pass and uses DPR 1.
- Build only the stations near the camera (current ±1); dispose geometries and materials of far stations, or keep them all if total memory stays under ~120 MB.
- Pause the render loop when the tab is hidden or the page isn't visible.
- Lazy-load Three.js after the first paint so the intro HTML appears instantly. Keep the gzipped JS for the 3D part under ~250 KB (import only the Three.js modules you use).
- `prefers-reduced-motion`: no camera drift, no particles, crossfade between stations.
- WebGL unavailable or context lost: fall back to the brief's CSS sky gradients per section, so the text, scratch card and RSVP still work.

## Integration with what's already built
- Put the 3D in `src/three/` (`world.ts`, `stations.ts`, `sky.ts`, `lanterns.ts`, `flowers.ts`, `architecture.ts`, `particles.ts`, `quality.ts`). The section controller calls `world.goTo(stationIndex)` on every snap. The world never touches the DOM text.
- The canvas is `position: fixed; inset: 0; z-index: 0`. All sections are transparent overlays above it.
- `?video` mode: drive all animation from the recorder's deterministic clock (no `performance.now()` inside the scene), so the MP4 is smooth and repeatable.
- `public/og-image.png`: render it from the scene. Add a script or `?og` mode that frames station 1 at 1200×630 with no UI and saves a PNG. No generated pictures.
- Keep `npm run check` green and extend it to fail if any `public/art/*.webp` is referenced (there should be none).

## Working order
1. Read the brief, the current state of this invite's folder, and the existing 3D code in `fayaz` / `muskan`. Write a 10-line plan in chat before coding.
2. Build the sky + camera path + station switching with placeholder boxes, and wire it to the section snaps. Check on a 390 px phone viewport.
3. Add the drapes and the intro tap → open.
4. Build stations one at a time, in order. After each one, take a phone-size screenshot (`?test`) and compare it with the brief's description of that scene.
5. Particles, then quality tiers, then the fallbacks.
6. `?video` recording, `og-image`, `npm run check`, a real-phone test. Report the fps measured per tier.

## Done means
- No image files under `public/art/`. Every visual is code.
- The camera journey is continuous and smooth across all 10 sections, forwards and backwards.
- Text areas stay readable on every station (contrast ≥ 4.5:1 for body text).
- 60 fps on the mid tier on a mid-range Android, with no jank on snaps.
- The fallback works with WebGL disabled.
- The MP4 is recorded, og-image rendered, QA passes, and it's pushed to every branch as the README describes.

Ask me only if something blocks you (the folder name, WhatsApp number and map links are still TODO in the brief; leave them as `TODO` and carry on).
