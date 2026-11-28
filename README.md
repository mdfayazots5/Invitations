# Invitations

One repo. **Every branch holds every folder**, and all branches are kept identical, so they never conflict.
Each Netlify site deploys one branch, and the branch decides which folder gets built (see `netlify.toml`).

| Branch         | Folder          | Netlify site                          | What it is |
|----------------|-----------------|---------------------------------------|------------|
| `Fayaz`        | `fayaz/`        | https://fayazinvitation.netlify.app/   | Family invite, Nikah & Valima: Mohammed Fayaz & Muskan Khanam (emerald & gold, 3D sky) |
| `FayazMD`      | `fayazmd/`      | https://mdfayazinvitation.netlify.app/ | Valima invite for Fayaz's friends & colleagues |
| `Muskan`       | `muskan/`       | https://muskaninvitation.netlify.app/  | Bride's family invite, Nikah & Valima (rose & gold, 3D sky) |
| `MuskanKhanam` | `muskankhanam/` | not created yet (code expects `muskankhanam.netlify.app`) | Bride's family invite, redesign: red curtain & palace hall |
| `main`         | all             | none                                  | Where you work. Pushed to every branch above. |

Each folder is its own Vite site:
- `src/invite.config.ts` holds that person's names, dates, venues and every line of page text.
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

## Add a new person
**From a reference video:** give [NEW-INVITE-KIT.md](NEW-INVITE-KIT.md) and the video to Claude in the chat app. It returns a design brief plus prompts for the images and song. Bring the brief, images and song to Claude Code and say "Build a new invite from this brief". It does the steps below for you.

By hand:
1. On `main`, copy a folder as a template: `cp -r fayaz rakesh` (skip `node_modules/`), then edit `rakesh/src/invite.config.ts`.
2. Add a `[context.Rakesh]` block to `netlify.toml` and a `Rakesh) folder=rakesh ;;` line to `scripts/netlify-ignore.sh`.
3. Add `main:Rakesh` to `scripts/push-all.sh`, commit, and run it.
4. Create a Netlify site from this repo with branch `Rakesh`.

## Old one-folder branches
Before this layout, each branch held only its own folder. Those versions are kept as the tags `archive/Fayaz`, `archive/FayazMD`, `archive/Muskan` and `archive/MuskanKhanam`.
