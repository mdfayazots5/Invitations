# Invitations

One repo. **Every branch holds every folder**, and all branches are kept identical, so they never conflict.
Each Netlify site deploys one branch, and the branch decides which folder gets built (see `netlify.toml`).

| Branch         | Folder          | Netlify site                          | What it is |
|----------------|-----------------|---------------------------------------|------------|
| `Fayaz`        | `fayaz/`        | https://fayazinvitation.netlify.app/   | Family invite, Nikah & Valima: Mohammed Fayaz & Muskan Khanam (emerald & gold, 3D sky) |
| `FayazMD`      | `fayazmd/`      | https://mdfayazinvitation.netlify.app/ | Valima invite for Fayaz's friends & colleagues |
| `Muskan`       | `muskan/`       | https://muskaninvitation.netlify.app/  | Bride's family invite, Nikah & Valima (rose & gold, 3D sky) |
| `MuskanKhanam` | `muskankhanam/` | not created yet (code expects `muskankhanam.netlify.app`) | Bride's family invite, redesign: red curtain & palace hall |
| `Muskanone`    | `muskanone/`    | not created yet (code expects `muskanone.netlify.app`) | Groom's family invite, pastel-sky storybook (built from `muskanone/DESIGN-BRIEF.md`) |
| `Admin`        | `admin/`        | your admin site (create it: see below) | Password-protected admin: auto-scroll timings and music for every invite |
| `main`         | all             | none                                  | Where you work. Pushed to every branch above. |

Each folder is its own Vite site:
- `src/invite.config.ts` holds that person's names, dates, venues and every line of page text.
- `invite.settings.json` holds the **auto-scroll timings and music** (edited from the Admin site). Read at build time: a change goes live after a deploy.
- `scripts/` holds QA (`check`), the link-preview image (`og`) and the MP4 recorder (`record`).
- `recordings/` holds the MP4 to share on WhatsApp. It is not deployed.

## Everyday workflow
```bash
git checkout main
# edit files inside ONE person's folder, e.g. muskankhanam/
cd muskankhanam && npm install && npm run build && npm run check && cd ..
git add -A && git commit -m "MuskanKhanam: ..."
bash scripts/push-all.sh     # pushes main to main, Fayaz, FayazMD, Muskan, MuskanKhanam
```
Every branch gets the same commit. Only the site whose folder changed rebuilds: `scripts/netlify-ignore.sh` skips the others.

## How Netlify picks the folder
`netlify.toml` has one `[context.<Branch>]` block per branch, for example:
```toml
[context.Muskan]
  command = "cd muskan && npm ci && npm run build"
  publish = "muskan/dist"
```
In each site's Netlify settings, set **Branch to deploy** to the person's branch and leave **Base directory empty**.

## Testing on your phone (🧪 Test button)
Every invite has a built-in tester (`shared/autotest/`). It is on when `TEST_MODE = true` in that folder's `src/invite.config.ts`, and even then it shows **only on a link with `?test`**, so guests never see it.

1. On your phone, open e.g. `https://fayazinvitation.netlify.app/?test` and tap **🧪 Test** (bottom left).
2. Don't touch the screen. It opens the doors, plays the whole invite, scrolls it again at a steady speed, and visits every section. It takes screenshots and records logs, errors, load times and smoothness (fps, dropped frames). This takes about 2 minutes.
3. When it shows **✅ Done testing**, the results are already uploaded to that site. Tell Claude "done testing".
4. Claude runs `node scripts/pull-autotest.mjs` (`--clear` also removes them from the site). Each run lands in `test-runs/<site>/<runId>/` (`report.json` + screenshots; not committed).

If the upload fails, **Download report** on the Done card saves everything (with the screenshots inside) as one file.
The upload endpoint is `netlify/functions/autotest.mts` (Netlify Blobs). Reading the results needs the key in `.autotest-key` (gitignored); the function only holds its SHA-256 hash, because this repo is public.

## Admin site (timings & music for every invitation)
The `admin/` folder is a small password-protected website. It shows **how many invitations** there are and the state of each:
**Live ✓**, **Changes saved – not deployed**, **Deploying…** or **No Netlify site yet**.

For each invitation you can change:
- **Auto-scroll:** on/off; how long before the date card scratches itself; when the pages start turning; the page-turn speed; and the **seconds on each page**. The total length of one auto-play is shown as you move the sliders.
- **Music:** on/off; **upload a new MP3** (up to 4 MB) and preview it before it goes live; volume; fade-in; start the song at a given second; repeat on/off. "Now live" and "New song – after deploy" are shown side by side.

**Save** keeps your changes as a draft. Nothing changes for guests until you press **Deploy**. It shows the list of exact changes, saves them to GitHub on every branch (one commit), and Netlify rebuilds only that invitation. The admin then waits for the site's `version.json` to show the new commit and says **Live ✓** (usually 1–2 minutes).

### Set up the Admin Netlify site (once)
1. **GitHub token:** github.com → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate. Repository access: **only** `Invitations`. Permissions → Repository → **Contents: Read and write**. Copy the token.
2. **Netlify:** Add new site → Import from GitHub → `Invitations` → **Branch to deploy: `Admin`**. Leave **Base directory empty** (the root `netlify.toml` builds `admin/`).
3. Site configuration → **Environment variables** → add:
   - `ADMIN_USER` = `fayazmd`
   - `ADMIN_PASSWORD` = your password
   - `GITHUB_TOKEN` = the token from step 1 (optional to start: without it you can sign in, change and save everything, but **Deploy** stays off)
   - `SESSION_SECRET` = any long random text (signs the sign-in cookie)
4. Deploys → **Trigger deploy**. Open the site and sign in.

The credentials and token live only in Netlify, never in this public repo. After 5 wrong passwords, the sign-in locks for 15 minutes.
The admin API (`netlify/functions/admin.mts`) answers **404** on any site without these variables, so the invitation sites don't expose it.
To test locally: `cd admin && npm install && npm run dev` → http://localhost:8788 (user `test` / `test`). Deploys there are **dry runs**.

## Add a new person
**From a reference video:** give [NEW-INVITE-KIT.md](NEW-INVITE-KIT.md) and the video to Claude in the chat app. It returns a design brief plus prompts for the images and song. Bring the brief, images and song to Claude Code and say "Build a new invite from this brief". It does the steps below for you.

By hand:
1. On `main`, copy a folder as a template: `cp -r fayaz rakesh` (skip `node_modules/`), then edit `rakesh/src/invite.config.ts`.
2. Add a `[context.Rakesh]` block to `netlify.toml`, a `Rakesh) folder=rakesh ;;` line to `scripts/netlify-ignore.sh`, and an entry in `invites.json` (so the Admin site lists it).
3. Add `main:Rakesh` to `scripts/push-all.sh`, commit, and run it.
4. Create a Netlify site from this repo with branch `Rakesh`.

## Old one-folder branches
Before this layout, each branch held only its own folder. Those versions are kept as the tags `archive/Fayaz`, `archive/FayazMD`, `archive/Muskan` and `archive/MuskanKhanam`.
