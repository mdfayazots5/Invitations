// Stores phone autotest results (shared/autotest) in this site's Netlify Blobs store "autotest".
//   POST /api/autotest?run=<runId>&file=<name>   body = the file          (open: the phone uploads)
//   GET  /api/autotest                           → list of runs and files (needs x-autotest-key)
//   GET  /api/autotest?run=<id>&file=<name>      → that file              (needs x-autotest-key)
//   DELETE /api/autotest?run=<id>                → delete the run         (needs x-autotest-key)
// Downloaded by `node scripts/pull-autotest.mjs`.
import {getStore} from '@netlify/blobs';
import type {Config, Context} from '@netlify/functions';

const RUN = /^[a-z0-9]+-\d{8}-\d{6}-[a-z0-9]{4}$/;
const FILE = /^(report\.json|shot-\d{2}-[\w.-]{1,80}\.jpg)$/;
const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Reading needs the key in the gitignored .autotest-key. The repo is public, so only its SHA-256 is here.
 * An AUTOTEST_KEY env var on the Netlify site, if set, works too.
 */
const KEY_SHA256 = '226739af0698d2c1cf233e0cc33456026a04e5e82339d6a8288eaa72880e391b';
const sha256 = async (s: string) =>
  [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))].map((b) => b.toString(16).padStart(2, '0')).join('');
const keyOk = async (given: string | null) => {
  if (!given) return false;
  const env = Netlify.env.get('AUTOTEST_KEY');
  return (env && given === env) || (await sha256(given)) === KEY_SHA256;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {status, headers: {'content-type': 'application/json', 'cache-control': 'no-store'}});

export default async (req: Request, _ctx: Context) => {
  const url = new URL(req.url);
  const run = url.searchParams.get('run') ?? '';
  const file = url.searchParams.get('file') ?? '';
  const store = getStore({name: 'autotest', consistency: 'strong'});

  if (req.method === 'POST') {
    if (!RUN.test(run) || !FILE.test(file)) return json({error: 'bad run or file name'}, 400);
    const body = await req.arrayBuffer();
    if (body.byteLength === 0 || body.byteLength > MAX_BYTES) return json({error: 'empty or too large'}, 413);
    await store.set(`${run}/${file}`, body, {metadata: {type: req.headers.get('content-type') ?? '', at: new Date().toISOString()}});
    return json({ok: true});
  }

  if (!(await keyOk(req.headers.get('x-autotest-key')))) return json({error: 'forbidden'}, 403);

  if (req.method === 'DELETE') {
    if (!RUN.test(run)) return json({error: 'bad run'}, 400);
    const {blobs} = await store.list({prefix: `${run}/`});
    await Promise.all(blobs.map((b) => store.delete(b.key)));
    return json({deleted: blobs.length});
  }

  if (req.method === 'GET') {
    if (run && file) {
      if (!RUN.test(run) || !FILE.test(file)) return json({error: 'bad run or file name'}, 400);
      const data = await store.getWithMetadata(`${run}/${file}`, {type: 'arrayBuffer'});
      if (!data) return json({error: 'not found'}, 404);
      return new Response(data.data, {headers: {'content-type': String(data.metadata.type || 'application/octet-stream'), 'cache-control': 'no-store'}});
    }
    const {blobs} = await store.list();
    const runs: Record<string, string[]> = {};
    for (const b of blobs) {
      const [r, f] = b.key.split('/');
      (runs[r] ??= []).push(f);
    }
    return json({runs});
  }
  return json({error: 'method not allowed'}, 405);
};

export const config: Config = {path: '/api/autotest'};
