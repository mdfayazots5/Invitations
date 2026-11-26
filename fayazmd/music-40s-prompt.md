# Music: Bismillah (Kailash Kher), 40-second cut, for the Royal Doors invite

## The chosen 40 seconds
- **Source:** `Bismillah_Kailsh_Kher_Tere_Naam_Se_Shuru_Hua_Best_Ever_Song.mp3` (6:23 long, 117 BPM)
- **Cut:** **0:50.4 → 1:30.4** (40.0 s)
- **Why this part:**
  - It starts in the breath-gap at 0:50.4, the quietest moment before the vocal line begins at about 0:50.8, so the line is heard from its first word and no longer starts mid-phrase at "shuru hua".
  - It covers the build and the first chorus (about 1:03) plus its repeat (about 1:20).
- **Fades:** a 0.4 s fade-in (the cut falls in a silence, so there's no click), and a 3 s fade-out ending exactly at 40 s.
- **Loudness:** normalised to −14 LUFS, the standard level for Instagram and WhatsApp, so it isn't too quiet or distorted.
- **Alternatives** if you want a different feel:
  - **0:00–0:40:** the soft opening. It's slower and calmer, but has silent dips around 0:06, 0:17 and 0:37.
  - **3:40–4:20:** the same chorus later in the song, with the fuller final energy.

A ready-cut file `music.mp3` is also attached. Put it straight in `public/music.mp3` and skip Step 1.

---

## PROMPT: paste into Claude Code (VS Code)

````
I put the full song at assets/bismillah-full.mp3.

1. Create public/music.mp3 as a 40-second cut of it using ffmpeg (install ffmpeg-static
   as a devDependency if ffmpeg is not on PATH). Add an npm script "music" that runs:
   ffmpeg -y -ss 50.4 -t 40 -i assets/bismillah-full.mp3 \
     -af "afade=t=in:st=0:d=0.4,afade=t=out:st=37:d=3,loudnorm=I=-14:TP=-1.5:LRA=11" \
     -ar 44100 -b:a 192k public/music.mp3
   Run it and confirm the output duration is 40 s (ffprobe).

2. Website (Royal Doors invite):
   - Load /music.mp3 into a single <audio id="bgm" preload="auto"> element.
   - Start it ONLY inside the "Tap to enter" door click handler (browsers block
     autoplay). Ramp the volume 0→0.8 over 1.5 s with requestAnimationFrame.
   - Loop it, with a 1 s cross-fade at the loop point: when currentTime > 38.5,
     fade to 0; at 0, restart and fade back in. This avoids a hard jump.
   - The music button (bottom-right) toggles play/pause, with an animated equaliser
     icon while playing and a muted icon while paused. Remember the choice in
     sessionStorage.
   - Pause when the tab is hidden (visibilitychange) and resume when it is visible
     again, if the guest had it playing.

3. Recording script (scripts/record.ts), make the video exactly 40 s:
   0.0–2.5    idle on the doors
   2.5        tap the doors; the music starts in the video at this moment
   2.5–6.0    doors open + walk-through
   6.0–7.5    hold on the hero
   7.5–10.5   scratch the gold bar, reveal the date, hold 1 s
   10.5–11.7  scroll to Invitation;  hold until 15.5
   15.5–16.7  scroll to Countdown;   hold until 21.5 (fireworks visible)
   21.5–22.7  scroll to RSVP;        type name, tap JOYFULLY, guests = 2; hold until 28.0
   28.0–29.2  scroll to Nikah venue + map;  hold until 32.0
   32.0–33.2  scroll to Valima venue + map; hold until 35.5
   35.5–36.7  scroll to footer;      hold until 40.0
   Mix the audio in ffmpeg so the song starts at 2.5 s (the door tap) with
   -itsoffset 2.5 (or adelay=2500|2500), then trim the output with -t 40 so the
   2.5 s fade-out is cut short. Instead, apply a fresh 1.5 s fade-out ending at 40.0 s
   (afade=t=out:st=38.5:d=1.5) so the video ends cleanly.
   Output: out/fayaz-muskan-invite.mp4 (H.264, 1080×1920, 30 fps, crf 17,
   AAC 192k, -movflags +faststart). Print the duration; it must be 40.0 s.
````

---

## Note
This is a commercial Coke Studio track.
- **WhatsApp** (link or MP4): fine for sharing with friends and family.
- **Instagram:** if you post the MP4, the audio may be muted or flagged. Post the video without music and add "Bismillah" from Instagram's own music picker instead.
