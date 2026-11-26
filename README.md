# Invitations

One repo, one **branch per person**. Each branch holds only that person's folder, so deploying a branch never publishes anyone else's invitation.

| Branch   | Folder     | What it is                                  |
|----------|------------|---------------------------------------------|
| `main`   | none       | This README only. A clean base for new branches. |
| `Fayaz`  | `fayaz/`   | Nikah invite: Mohammed Fayaz & Muskan Khanam (family, Remotion video + page) |
| `FayazMD` | `fayazmd/` | Royal Doors invite for Fayaz's friends & colleagues (Vite website + recorded MP4) |
| `Muskan` | `muskan/`  | (next)                                      |
| `Rakesh` | `rakesh/`  | (next)                                      |

Inside each person's folder:
- `src/` is the Remotion video source, and `src/invite.ts` holds that person's names, dates and venues.
- `site/` is the **deployed** landing page: `index.html`, the rendered `.mp4`, `poster.jpg` and `invite.ics`.

## Start an invitation for a new person
```bash
git checkout main
git checkout -b Muskan
git checkout Fayaz -- fayaz        # copy Fayaz's as a template
git mv fayaz muskan
# edit muskan/src/invite.ts, the scenes, and muskan/site/index.html
# change base = "fayaz" to "muskan" in netlify.toml (copy it from Fayaz the same way)
cd muskan && npm install && npm run render && npm run poster
git add -A && git commit -m "Muskan invitation" && git push -u origin Muskan
```
Never merge one person's branch into another, or into `main`.

## Deploy (choose the person's branch)
No build step runs on the host. It serves the committed `site/` folder.

| Host | Settings |
|------|----------|
| **Netlify** | Import repo, set **Branch to deploy** to `Fayaz`. `netlify.toml` already sets base `fayaz` and publish `site`. |
| **Cloudflare Pages** | Production branch `Fayaz` · Framework *None* · Build command *(empty)* · Root directory `fayaz` · Output directory `site` |
| **Render** (Static Site) | Branch `Fayaz` · Build command *(empty)* · Publish directory `fayaz/site` |

Every push to that branch redeploys that person's page only.

**`FayazMD` is different:** it is a Vite site, so the host runs a build. Netlify reads the branch's `netlify.toml` (base `fayazmd`, build `npm run build`, publish `dist`). On Cloudflare Pages use root `fayazmd`, build `npm run build`, output `dist`. On Render use root `fayazmd`, build `npm install && npm run build`, publish `dist`. See `fayazmd/README.md`.
