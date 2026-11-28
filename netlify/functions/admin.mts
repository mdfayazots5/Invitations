// Admin API for the Admin site (admin/), served at /api/admin/*.
// Only works where ADMIN_USER, ADMIN_PASSWORD and SESSION_SECRET are set (the Admin Netlify site);
// every other site gets 404, so the invite sites never expose it.
// GITHUB_TOKEN is optional: without it the admin reads the public repo and saves drafts, but Deploy is off.
//
//   POST   /api/admin/login            {user, password}   → session cookie (8 h); 5 wrong tries → locked 15 min
//   POST   /api/admin/logout
//   GET    /api/admin/me
//   GET    /api/admin/invites                              → registry + live settings + draft + status per invite
//   PUT    /api/admin/draft?folder=x   {settings}          → save a draft (not live)
//   DELETE /api/admin/draft?folder=x                       → discard the draft (and any uploaded music)
//   POST   /api/admin/music?folder=x   body = MP3 (≤ 4 MB) → new music, kept with the draft
//   GET    /api/admin/music?folder=x                       → the uploaded (not yet live) MP3, for preview
//   POST   /api/admin/deploy?folder=x[&dryRun=1]           → one commit to main + every branch; Netlify rebuilds that site
//   GET    /api/admin/status?folder=x                      → compares the live site's version.json with the last deploy
import {getStore} from '@netlify/blobs';
import type {Config, Context} from '@netlify/functions';

type Settings = Record<string, unknown> & {music: {file: string; title: string; enabled: boolean}};
type Invite = {folder: string; branch: string; name: string; audience: string; site: string | null};
type Registry = {repo: string; invites: Invite[]; extraBranches: string[]};
type Draft = {settings: Settings; savedAt: string; music?: {name: string; size: number; uploadedAt: string}};
type Deploy = {commit: string; at: string; files: string[]};

const env = (k: string) => (typeof Netlify !== 'undefined' ? Netlify.env.get(k) : process.env[k]) ?? '';
const MAX_MUSIC = 4 * 1024 * 1024;
const SESSION_HOURS = 8;
const MAX_TRIES = 5;
const LOCK_MIN = 15;
const FOLDER = /^[a-z0-9-]{1,40}$/;

// ───────────────────────── storage (Netlify Blobs; in-memory for the local dev server) ─────────────────────────
type KV = {
  get: (k: string) => Promise<string | null>;
  getBytes: (k: string) => Promise<ArrayBuffer | null>;
  set: (k: string, v: string | ArrayBuffer) => Promise<void>;
  del: (k: string) => Promise<void>;
};
const memory = new Map<string, string | ArrayBuffer>();
const kv = (): KV => {
  if (process.env.ADMIN_DEV_MEMORY)
    return {
      get: async (k) => (typeof memory.get(k) === 'string' ? (memory.get(k) as string) : null),
      getBytes: async (k) => (memory.get(k) instanceof ArrayBuffer ? (memory.get(k) as ArrayBuffer) : null),
      set: async (k, v) => void memory.set(k, v),
      del: async (k) => void memory.delete(k),
    };
  const s = getStore({name: 'admin', consistency: 'strong'});
  return {
    get: (k) => s.get(k, {type: 'text'}),
    getBytes: (k) => s.get(k, {type: 'arrayBuffer'}),
    set: async (k, v) => void (await s.set(k, v)),
    del: (k) => s.delete(k),
  };
};

// ───────────────────────── helpers ─────────────────────────
const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {status, headers: {'content-type': 'application/json', 'cache-control': 'no-store', ...headers}});
const fail = (status: number, error: string) => json({error}, status);

const enc = new TextEncoder();
const hmac = async (msg: string) => {
  const key = await crypto.subtle.importKey('raw', enc.encode(env('SESSION_SECRET')), {name: 'HMAC', hash: 'SHA-256'}, false, ['sign']);
  return [...new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(msg)))].map((b) => b.toString(16).padStart(2, '0')).join('');
};
/** Constant-time string compare. */
const same = (a: string, b: string) => {
  let d = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) d |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return d === 0;
};
const cookie = (req: Request, name: string) => (req.headers.get('cookie') ?? '').split(/;\s*/).find((c) => c.startsWith(`${name}=`))?.slice(name.length + 1) ?? '';
const secure = (req: Request) => (new URL(req.url).protocol === 'https:' ? '; Secure' : '');
const signedIn = async (req: Request) => {
  const [exp, sig] = cookie(req, 'adm').split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return same(sig, await hmac(`${env('ADMIN_USER')}|${exp}`));
};

// ───────────────────────── GitHub ─────────────────────────
const gh = async (path: string, init: RequestInit = {}) => {
  const r = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${env('GITHUB_TOKEN')}`,
      accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28',
      'user-agent': 'invitations-admin',
      ...(init.body ? {'content-type': 'application/json'} : {}),
    },
  });
  if (!r.ok) throw new Error(`GitHub ${init.method ?? 'GET'} ${path}: ${r.status} ${(await r.text()).slice(0, 200)}`);
  return r.json();
};
const repoOf = () => env('GITHUB_REPO') || 'mdfayazots5/Invitations';
const hasToken = () => !!env('GITHUB_TOKEN');
/** Local dev server only: read repo files from this checkout instead of GitHub. */
const localRepo = () => process.env.ADMIN_DEV_LOCAL_REPO ?? '';
const readFile = async (path: string, ref = 'main') => {
  if (localRepo()) {
    const {readFileSync} = await import('node:fs');
    const text = readFileSync(`${localRepo()}/${path}`, 'utf8');
    return {text, size: text.length};
  }
  if (!hasToken()) {
    // no token: the repo is public, read the raw file (no API rate limit)
    const r = await fetch(`https://raw.githubusercontent.com/${repoOf()}/${ref}/${path}`, {headers: {'cache-control': 'no-cache'}});
    if (!r.ok) throw new Error(`Could not read ${path} from GitHub (${r.status}).`);
    const text = await r.text();
    return {text, size: text.length};
  }
  const f = await gh(`/repos/${repoOf()}/contents/${path}?ref=${ref}`);
  return {text: Buffer.from(f.content, 'base64').toString('utf8'), size: f.size as number};
};
const fileSize = async (path: string) => {
  if (localRepo()) {
    const {statSync} = await import('node:fs');
    try {
      return statSync(`${localRepo()}/${path}`).size;
    } catch {
      return null;
    }
  }
  if (!hasToken()) {
    const r = await fetch(`https://raw.githubusercontent.com/${repoOf()}/main/${path}`, {method: 'HEAD'}).catch(() => null);
    const len = r?.ok ? Number(r.headers.get('content-length')) : NaN;
    return Number.isFinite(len) ? len : null;
  }
  try {
    return ((await gh(`/repos/${repoOf()}/contents/${path}?ref=main`)) as {size: number}).size;
  } catch {
    return null;
  }
};
const registry = async (): Promise<Registry> => JSON.parse((await readFile('invites.json')).text);

// ───────────────────────── live status ─────────────────────────
const liveVersion = async (site: string | null) => {
  if (!site) return null;
  try {
    const r = await fetch(new URL('version.json', site).toString() + `?t=${Date.now()}`, {headers: {'cache-control': 'no-cache'}});
    if (!r.ok) return null;
    return (await r.json()) as {commit: string; builtAt: string};
  } catch {
    return null;
  }
};
const statusOf = async (inv: Invite, store: KV) => {
  const draft = await store.get(`draft/${inv.folder}`);
  const last: Deploy | null = JSON.parse((await store.get(`deploy/${inv.folder}`)) ?? 'null');
  const live = await liveVersion(inv.site);
  let state: 'no-site' | 'draft' | 'deploying' | 'live' | 'unknown' = 'unknown';
  if (!inv.site) state = 'no-site';
  else if (last && live?.commit === last.commit) state = 'live';
  else if (last && live?.commit !== last.commit) {
    // GitHub committed; Netlify hasn't published it yet (or it failed: after 10 min, show unknown)
    state = Date.now() - Date.parse(last.at) < 10 * 60_000 ? 'deploying' : 'unknown';
  } else if (live) state = 'live';
  return {state, hasDraft: !!draft, lastDeploy: last, live};
};

// ───────────────────────── deploy: one commit to main, then every branch fast-forwards to it ─────────────────────────
const deploy = async (inv: Invite, reg: Registry, store: KV, dryRun: boolean) => {
  const draft: Draft | null = JSON.parse((await store.get(`draft/${inv.folder}`)) ?? 'null');
  if (!draft) throw new Error('Nothing to deploy: save your changes first.');
  const repo = repoOf();
  const files: {path: string; content: string; encoding: 'utf-8' | 'base64'; size: number}[] = [];
  const settings = {...draft.settings};
  if (draft.music) {
    const bytes = await store.getBytes(`music/${inv.folder}`);
    if (!bytes) throw new Error('The uploaded music is missing: upload it again.');
    settings.music = {...settings.music, file: 'music.mp3'};
    files.push({path: `${inv.folder}/public/music.mp3`, content: Buffer.from(bytes).toString('base64'), encoding: 'base64', size: bytes.byteLength});
  }
  const text = JSON.stringify(settings, null, 2) + '\n';
  files.push({path: `${inv.folder}/invite.settings.json`, content: text, encoding: 'utf-8', size: text.length});
  const branches = [...new Set([...reg.invites.map((i) => i.branch), ...reg.extraBranches])];
  if (dryRun) return {dryRun: true, files: files.map(({path, size}) => ({path, size})), branches};
  if (!hasToken())
    throw new Error("Deploy is off: add GITHUB_TOKEN in the Admin site's Netlify environment variables, then redeploy the Admin site. Your changes are saved.");

  const head = await gh(`/repos/${repo}/git/ref/heads/main`);
  const parent = head.object.sha as string;
  const base = await gh(`/repos/${repo}/git/commits/${parent}`);
  const tree = [];
  for (const f of files) {
    const blob = await gh(`/repos/${repo}/git/blobs`, {method: 'POST', body: JSON.stringify({content: f.content, encoding: f.encoding})});
    tree.push({path: f.path, mode: '100644', type: 'blob', sha: blob.sha});
  }
  const newTree = await gh(`/repos/${repo}/git/trees`, {method: 'POST', body: JSON.stringify({base_tree: base.tree.sha, tree})});
  const what = [draft.music ? 'music' : '', 'timings'].filter(Boolean).join(' & ');
  const commit = await gh(`/repos/${repo}/git/commits`, {
    method: 'POST',
    body: JSON.stringify({message: `Admin: ${inv.folder} ${what}`, tree: newTree.sha, parents: [parent]}),
  });
  // Every branch holds every folder and stays identical: fast-forward them all (no force).
  const failed: string[] = [];
  for (const b of branches) {
    try {
      await gh(`/repos/${repo}/git/refs/heads/${b}`, {method: 'PATCH', body: JSON.stringify({sha: commit.sha, force: false})});
    } catch {
      failed.push(b);
    }
  }
  const rec: Deploy = {commit: commit.sha, at: new Date().toISOString(), files: files.map((f) => f.path)};
  await store.set(`deploy/${inv.folder}`, JSON.stringify(rec));
  await store.del(`draft/${inv.folder}`);
  await store.del(`music/${inv.folder}`);
  return {...rec, branches, failedBranches: failed};
};

// ───────────────────────── router ─────────────────────────
export default async (req: Request, ctx: Context) => {
  if (!env('ADMIN_USER') || !env('ADMIN_PASSWORD') || !env('SESSION_SECRET')) return new Response('Not found', {status: 404});
  const url = new URL(req.url);
  const route = url.pathname.replace(/^\/api\/admin\/?/, '');
  const store = kv();

  if (route === 'login' && req.method === 'POST') {
    const ip = (ctx?.ip ?? req.headers.get('x-forwarded-for') ?? 'local').replace(/[^\w.:-]/g, '');
    const lockKey = `lock/${ip}`;
    const lock: {fails: number; until: number} = JSON.parse((await store.get(lockKey)) ?? '{"fails":0,"until":0}');
    if (lock.until > Date.now()) return fail(429, `Too many wrong tries. Try again in ${Math.ceil((lock.until - Date.now()) / 60000)} min.`);
    const {user = '', password = ''} = (await req.json().catch(() => ({}))) as {user?: string; password?: string};
    if (!(same(String(user), env('ADMIN_USER')) && same(String(password), env('ADMIN_PASSWORD')))) {
      lock.fails = (lock.until && lock.until <= Date.now() ? 0 : lock.fails) + 1;
      lock.until = lock.fails >= MAX_TRIES ? Date.now() + LOCK_MIN * 60000 : 0;
      if (lock.until) lock.fails = 0;
      await store.set(lockKey, JSON.stringify(lock));
      const left = MAX_TRIES - lock.fails;
      return fail(401, lock.until ? `Locked for ${LOCK_MIN} minutes after ${MAX_TRIES} wrong tries.` : `Wrong username or password (${left} ${left === 1 ? 'try' : 'tries'} left).`);
    }
    await store.del(lockKey);
    const exp = Date.now() + SESSION_HOURS * 3600_000;
    return json({ok: true}, 200, {
      'set-cookie': `adm=${exp}.${await hmac(`${env('ADMIN_USER')}|${exp}`)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_HOURS * 3600}${secure(req)}`,
    });
  }
  if (route === 'logout') return json({ok: true}, 200, {'set-cookie': `adm=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure(req)}`});
  if (!(await signedIn(req))) return fail(401, 'Please sign in.');
  if (route === 'me') return json({user: env('ADMIN_USER'), canDeploy: hasToken()});

  try {
    const reg = await registry();
    if (route === 'invites' && req.method === 'GET') {
      const list = await Promise.all(
        reg.invites.map(async (inv) => {
          const settings = JSON.parse((await readFile(`${inv.folder}/invite.settings.json`)).text);
          const draft: Draft | null = JSON.parse((await store.get(`draft/${inv.folder}`)) ?? 'null');
          const musicSize = await fileSize(`${inv.folder}/public/${settings.music.file}`);
          return {
            ...inv,
            settings,
            draft,
            music: {size: musicSize, url: `https://raw.githubusercontent.com/${repoOf()}/main/${inv.folder}/public/${settings.music.file}`},
            status: await statusOf(inv, store),
          };
        }),
      );
      return json({count: list.length, invites: list});
    }
    const folder = url.searchParams.get('folder') ?? '';
    const inv = reg.invites.find((i) => i.folder === folder);
    if (!FOLDER.test(folder) || !inv) return fail(400, 'Unknown invitation.');

    if (route === 'draft' && req.method === 'PUT') {
      const body = (await req.json()) as {settings?: Settings};
      if (!body.settings || typeof body.settings !== 'object' || !body.settings.music) return fail(400, 'Bad settings.');
      const prev: Draft | null = JSON.parse((await store.get(`draft/${folder}`)) ?? 'null');
      const draft: Draft = {settings: body.settings, savedAt: new Date().toISOString(), music: prev?.music};
      await store.set(`draft/${folder}`, JSON.stringify(draft));
      return json({ok: true, draft});
    }
    if (route === 'draft' && req.method === 'DELETE') {
      await store.del(`draft/${folder}`);
      await store.del(`music/${folder}`);
      return json({ok: true});
    }
    if (route === 'music' && req.method === 'POST') {
      const bytes = await req.arrayBuffer();
      if (bytes.byteLength === 0) return fail(400, 'Empty file.');
      if (bytes.byteLength > MAX_MUSIC) return fail(413, 'The song is larger than 4 MB: export it at 128 kbps or shorten it.');
      const head = new Uint8Array(bytes.slice(0, 3));
      const isMp3 = (head[0] === 0x49 && head[1] === 0x44 && head[2] === 0x33) || (head[0] === 0xff && (head[1] & 0xe0) === 0xe0);
      if (!isMp3) return fail(415, 'That file is not an MP3.');
      const name = (url.searchParams.get('name') ?? 'song.mp3').slice(0, 80);
      await store.set(`music/${folder}`, bytes);
      const prev: Draft | null = JSON.parse((await store.get(`draft/${folder}`)) ?? 'null');
      const settings = prev?.settings ?? JSON.parse((await readFile(`${folder}/invite.settings.json`)).text);
      const draft: Draft = {settings, savedAt: new Date().toISOString(), music: {name, size: bytes.byteLength, uploadedAt: new Date().toISOString()}};
      await store.set(`draft/${folder}`, JSON.stringify(draft));
      return json({ok: true, draft});
    }
    if (route === 'music' && req.method === 'GET') {
      const bytes = await store.getBytes(`music/${folder}`);
      if (!bytes) return fail(404, 'No uploaded music.');
      return new Response(bytes, {headers: {'content-type': 'audio/mpeg', 'cache-control': 'no-store'}});
    }
    if (route === 'deploy' && req.method === 'POST') return json(await deploy(inv, reg, store, url.searchParams.has('dryRun')));
    if (route === 'status' && req.method === 'GET') return json(await statusOf(inv, store));
    return fail(404, 'Unknown action.');
  } catch (e) {
    return fail(502, (e as Error).message);
  }
};

export const config: Config = {path: ['/api/admin', '/api/admin/*']};
