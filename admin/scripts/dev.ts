// Local test server for the Admin site: serves admin/dist and routes /api/admin/* to the real Netlify function
// (netlify/functions/admin.mts) with in-memory storage. GitHub reads use your `gh` login.
//   npm run dev      → http://localhost:8788  (user: test / password: test)
// Deploys from here are DRY RUNS unless ADMIN_DEV_REAL_DEPLOY=1 is set, so testing never touches the live sites.
import {execSync} from 'node:child_process';
import {readFileSync, existsSync} from 'node:fs';
import {createServer} from 'node:http';
import {extname, join} from 'node:path';

process.env.ADMIN_DEV_MEMORY = '1';
// read invites.json and the settings files from this checkout (they may not be on GitHub yet)
process.env.ADMIN_DEV_LOCAL_REPO ??= join(import.meta.dirname, '..', '..');
process.env.ADMIN_USER ??= 'test';
process.env.ADMIN_PASSWORD ??= 'test';
process.env.SESSION_SECRET ??= 'local-dev-secret';
process.env.GITHUB_TOKEN ??= execSync('gh auth token').toString().trim();

const {default: handler} = await import('../../netlify/functions/admin.mts');
const DIST = join(import.meta.dirname, '..', 'dist');
const TYPES: Record<string, string> = {'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json'};
const PORT = Number(process.env.PORT ?? 8788);

createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
  if (url.pathname.startsWith('/api/admin')) {
    // keep local testing safe: deploys are dry runs unless explicitly allowed
    if (url.pathname.endsWith('/deploy') && !process.env.ADMIN_DEV_REAL_DEPLOY) url.searchParams.set('dryRun', '1');
    const chunks: Buffer[] = [];
    for await (const c of req) chunks.push(c as Buffer);
    const body = chunks.length ? Buffer.concat(chunks) : undefined;
    const r = await handler(
      new Request(url, {method: req.method, headers: req.headers as Record<string, string>, body: req.method === 'GET' || req.method === 'HEAD' ? undefined : body}),
      {ip: '127.0.0.1'} as never,
    );
    res.writeHead(r.status, Object.fromEntries(r.headers));
    res.end(Buffer.from(await r.arrayBuffer()));
    return;
  }
  const file = join(DIST, url.pathname === '/' ? 'index.html' : url.pathname);
  const path = existsSync(file) ? file : join(DIST, 'index.html');
  res.writeHead(200, {'content-type': TYPES[extname(path)] ?? 'application/octet-stream'});
  res.end(readFileSync(path));
}).listen(PORT, () => console.log(`Admin (local, dry-run deploys): http://localhost:${PORT}  user "${process.env.ADMIN_USER}"`));
