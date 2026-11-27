# Invitations

One repo, one **branch per person**. Each branch holds only that person's folder, so deploying a branch never publishes anyone else's invitation.

| Branch    | Folder     | What it is                                  |
|-----------|------------|---------------------------------------------|
| `main`    | none       | This README only. A clean base for new branches. |
| `Fayaz`   | `fayaz/`   | Family invite, Nikah & Valima: Mohammed Fayaz & Muskan Khanam (Vite website with 3D sky + recorded MP4) |
| `FayazMD` | `fayazmd/` | Valima-only invite for Fayaz's friends & relatives (Vite website + recorded MP4) |
| `Muskan`  | `muskan/`  | Bride's family invite, Nikah & Valima: Muskan Khanam & Mohammed Fayaz (rose & gold, 3D sky + recorded MP4) |
| `Rakesh`  | `rakesh/`  | (next)                                      |

Inside each person's folder (Vite site):
- `src/invite.config.ts` holds that person's names, dates, venues and every line of page text.
- `scripts/` holds QA (`check`), the link-preview image (`og`) and the MP4 recorder (`record`).
- `recordings/` holds the MP4 to share on WhatsApp. It is not deployed.

## Start an invitation for a new person
```bash
git checkout main
git checkout -b Muskan
git checkout Fayaz -- fayaz netlify.toml   # copy Fayaz's as a template
git mv fayaz muskan
# edit muskan/src/invite.config.ts; change base = "fayaz" to "muskan" in netlify.toml
cd muskan && npm install && npm run build && npm run check && npm run og && npm run build
git add -A && git commit -m "Muskan invitation" && git push -u origin Muskan
```
Never merge one person's branch into another, or into `main`.

## Deploy (choose the person's branch)
The host runs a build: `netlify.toml` sets base `<folder>`, build `npm run build`, publish `dist`.

| Host | Settings |
|------|----------|
| **Netlify** | Import repo, set **Branch to deploy** to `Fayaz`. `netlify.toml` does the rest. |
| **Cloudflare Pages** | Production branch `Fayaz` · Root directory `fayaz` · Build `npm run build` · Output `dist` |
| **Render** (Static Site) | Branch `Fayaz` · Root directory `fayaz` · Build `npm install && npm run build` · Publish `dist` |

Every push to that branch redeploys that person's page only.
