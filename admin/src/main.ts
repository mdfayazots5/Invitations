import './styles.css';

/**
 * Invitations Admin: sign in, see every invitation, change its auto-scroll timings and music,
 * save as a draft (not live), then Deploy: one commit to GitHub → Netlify rebuilds that invitation → Live ✓.
 * All server work is in netlify/functions/admin.mts (/api/admin/*).
 */

type Page = {id: string; label: string; holdMs: number};
type Music = {enabled: boolean; file: string; title: string; volume: number; fadeInSec: number; startAtSec: number; loop: boolean};
type Settings = {
  autoAdvance: boolean;
  scratchDelayMs: number;
  startDelayMs: number;
  glideMs: number;
  defaultHoldMs: number;
  replayHeroHoldMs: number;
  pages: Page[];
  music: Music;
};
type Draft = {settings: Settings; savedAt: string; music?: {name: string; size: number; uploadedAt: string}};
type Status = {state: 'no-site' | 'draft' | 'deploying' | 'live' | 'unknown'; hasDraft: boolean; lastDeploy: {commit: string; at: string} | null; live: {commit: string; builtAt: string} | null};
type Invite = {
  folder: string;
  branch: string;
  name: string;
  audience: string;
  site: string | null;
  settings: Settings;
  draft: Draft | null;
  music: {size: number | null; url: string};
  status: Status;
};

const root = document.getElementById('root')!;
const esc = (s: unknown) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const sec = (ms: number) => `${(ms / 1000).toFixed(1).replace(/\.0$/, '')} s`;
const mb = (b: number | null | undefined) => (b == null ? '—' : b > 1e6 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`);
const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x));
const ago = (iso?: string) => {
  if (!iso) return '';
  const m = Math.round((Date.now() - Date.parse(iso)) / 60000);
  return m < 1 ? 'just now' : m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : new Date(iso).toLocaleDateString();
};

const api = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const r = await fetch(`/api/admin/${path}`, {credentials: 'same-origin', ...init});
  const body = r.headers.get('content-type')?.includes('json') ? await r.json() : {};
  if (r.status === 401 && path !== 'login') {
    showLogin('Your session ended. Please sign in again.');
    throw new Error('signed out');
  }
  if (!r.ok) throw new Error((body as {error?: string}).error ?? `Error ${r.status}`);
  return body as T;
};

const toast = (msg: string, kind: 'ok' | 'err' = 'ok') => {
  const t = document.createElement('div');
  t.className = `toast ${kind}`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('show'));
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 400);
  }, 3600);
};

const BADGE: Record<Status['state'], [string, string]> = {
  live: ['live', 'Live ✓'],
  deploying: ['deploying', 'Deploying…'],
  draft: ['draft', 'Changes saved – not deployed'],
  'no-site': ['nosite', 'No Netlify site yet'],
  unknown: ['unknown', 'Live (not checked yet)'],
};
const badge = (inv: Invite) => {
  const [cls, text] = inv.draft ? BADGE.draft : BADGE[inv.status.state];
  return `<span class="badge ${cls}">${text}</span>`;
};

// ───────────────────────── login ─────────────────────────

function showLogin(message = '') {
  root.innerHTML = `<main class="login">
    <form class="card login-card" autocomplete="on">
      <p class="brand">Invitations</p>
      <h1>Admin sign in</h1>
      <label>Username<input name="user" autocomplete="username" required /></label>
      <label>Password<input name="password" type="password" autocomplete="current-password" required /></label>
      <p class="err" role="alert">${esc(message)}</p>
      <button class="btn primary" type="submit">Sign in</button>
      <p class="hint">After 5 wrong tries the sign-in locks for 15 minutes.</p>
    </form>
  </main>`;
  const form = root.querySelector('form')!;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const btn = form.querySelector('button')!;
    btn.disabled = true;
    try {
      await api('login', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({user: fd.get('user'), password: fd.get('password')})});
      void showDashboard();
    } catch (err) {
      form.querySelector('.err')!.textContent = (err as Error).message;
      btn.disabled = false;
    }
  });
}

// ───────────────────────── dashboard ─────────────────────────

let invites: Invite[] = [];

const header = (back = false) => `<header class="top">
  <div>${back ? '<button class="link" data-back>← All invitations</button>' : '<p class="brand">Invitations</p>'}</div>
  <button class="link" data-logout>Sign out</button>
</header>`;

async function load() {
  const r = await api<{count: number; invites: Invite[]}>('invites');
  invites = r.invites;
  return r;
}

async function showDashboard() {
  root.innerHTML = `${header()}<main class="wrap"><p class="muted">Loading invitations…</p></main>`;
  wireHeader();
  let r: {count: number; invites: Invite[]};
  try {
    r = await load();
  } catch (e) {
    if ((e as Error).message !== 'signed out') root.querySelector('main')!.innerHTML = `<p class="err">${esc((e as Error).message)}</p>`;
    return;
  }
  const live = r.invites.filter((i) => i.site).length;
  const drafts = r.invites.filter((i) => i.draft).length;
  root.querySelector('main')!.innerHTML = `
    <section class="summary">
      <div class="stat"><b>${r.count}</b><span>invitations</span></div>
      <div class="stat"><b>${live}</b><span>live on Netlify</span></div>
      <div class="stat ${drafts ? 'warn' : ''}"><b>${drafts}</b><span>with changes not deployed</span></div>
    </section>
    <section class="grid">
      ${r.invites
        .map(
          (inv) => `<article class="card invite" data-open="${esc(inv.folder)}" tabindex="0">
        <div class="row"><h2>${esc(inv.name)}</h2>${badge(inv)}</div>
        <p class="muted">${esc(inv.audience)} · branch <code>${esc(inv.branch)}</code> · folder <code>${esc(inv.folder)}/</code></p>
        <p>${inv.site ? `<a href="${esc(inv.site)}" target="_blank" rel="noopener" data-stop>${esc(inv.site.replace(/^https?:\/\//, ''))}</a>` : '<span class="muted">No Netlify site yet</span>'}</p>
        <ul class="facts">
          <li>Auto-scroll: <b>${inv.settings.autoAdvance ? 'on' : 'off'}</b></li>
          <li>Pages timed: <b>${inv.settings.pages.length}</b></li>
          <li>Music: <b>${inv.settings.music.enabled ? esc(inv.settings.music.title) : 'off'}</b></li>
          <li>Last deploy: <b>${inv.status.lastDeploy ? ago(inv.status.lastDeploy.at) : '—'}</b></li>
        </ul>
        <button class="btn">Edit timings & music →</button>
      </article>`,
        )
        .join('')}
    </section>`;
  root.querySelectorAll<HTMLElement>('[data-open]').forEach((el) => {
    const open = (e: Event) => {
      if ((e.target as HTMLElement).closest('[data-stop]')) return;
      showEditor(el.dataset.open!);
    };
    el.addEventListener('click', open);
    el.addEventListener('keydown', (e) => e.key === 'Enter' && open(e));
  });
}

function wireHeader() {
  root.querySelector('[data-logout]')?.addEventListener('click', async () => {
    await api('logout', {method: 'POST'}).catch(() => undefined);
    showLogin();
  });
  root.querySelector('[data-back]')?.addEventListener('click', () => {
    if (dirty && !confirm('You have unsaved changes. Leave without saving?')) return;
    dirty = false;
    void showDashboard();
  });
}

// ───────────────────────── editor ─────────────────────────

let dirty = false;

/** Total length of one auto-play, start to last page (an estimate: page reveal ≈ 0.9 s, scratch ≈ 1.6 s). */
const showLength = (s: Settings) =>
  s.scratchDelayMs + 1600 + s.startDelayMs + s.pages.reduce((t, p) => t + p.holdMs + s.glideMs + 900, 0) + s.glideMs;

/** Human list of what will change when deployed. */
const diff = (live: Settings, next: Settings, newSong?: Draft['music']) => {
  const out: string[] = [];
  const ch = (label: string, a: string, b: string) => a !== b && out.push(`<li><b>${esc(label)}</b>: ${esc(a)} → <b>${esc(b)}</b></li>`);
  ch('Auto-scroll', live.autoAdvance ? 'on' : 'off', next.autoAdvance ? 'on' : 'off');
  ch('Date card scratches itself after', sec(live.scratchDelayMs), sec(next.scratchDelayMs));
  ch('Pages start turning after', sec(live.startDelayMs), sec(next.startDelayMs));
  ch('Page-turn speed', sec(live.glideMs), sec(next.glideMs));
  next.pages.forEach((p) => {
    const was = live.pages.find((q) => q.id === p.id);
    if (was) ch(`${p.label} page`, sec(was.holdMs), sec(p.holdMs));
  });
  const m0 = live.music;
  const m1 = next.music;
  ch('Music', m0.enabled ? 'on' : 'off', m1.enabled ? 'on' : 'off');
  ch('Song title', m0.title, m1.title);
  ch('Volume', `${Math.round(m0.volume * 100)}%`, `${Math.round(m1.volume * 100)}%`);
  ch('Fade-in', sec(m0.fadeInSec * 1000), sec(m1.fadeInSec * 1000));
  ch('Song starts at', sec(m0.startAtSec * 1000), sec(m1.startAtSec * 1000));
  ch('Repeat song', m0.loop ? 'yes' : 'no', m1.loop ? 'yes' : 'no');
  if (newSong) out.push(`<li><b>New song file</b>: ${esc(newSong.name)} (${mb(newSong.size)})</li>`);
  return out;
};

const slider = (key: string, label: string, ms: number, min: number, max: number, step: number, help = '') => `
  <div class="field">
    <label for="f-${key}">${esc(label)} <output id="o-${key}">${sec(ms)}</output></label>
    <input type="range" id="f-${key}" data-ms="${key}" min="${min}" max="${max}" step="${step}" value="${ms}" />
    ${help ? `<p class="help">${esc(help)}</p>` : ''}
  </div>`;

function showEditor(folder: string) {
  const inv = invites.find((i) => i.folder === folder)!;
  const live = inv.settings;
  let saved: Settings = clone(inv.draft?.settings ?? live);
  const edit: Settings = clone(saved);
  dirty = false;
  let preview: HTMLAudioElement | null = null;

  const render = () => {
    const s = edit;
    const changes = diff(live, saved, inv.draft?.music);
    root.innerHTML = `${header(true)}<main class="wrap editor">
      <div class="row head">
        <div><h1>${esc(inv.name)}</h1>
          <p class="muted">branch <code>${esc(inv.branch)}</code> · ${inv.site ? `<a href="${esc(inv.site)}" target="_blank" rel="noopener">${esc(inv.site.replace(/^https?:\/\//, ''))}</a>` : 'no Netlify site yet'}</p></div>
        ${badge(inv)}
      </div>

      <div class="banner ${inv.draft ? 'warn' : 'ok'}" id="banner">
        ${
          inv.draft
            ? `<b>Saved, not live yet.</b> Press <b>Deploy</b> to publish these changes to ${inv.site ? 'the live site' : 'GitHub (the site will use them once it exists)'}. Saved ${ago(inv.draft.savedAt)}.`
            : `<b>This is what's live.</b> Change anything below, press <b>Save</b>, then <b>Deploy</b>. Nothing changes on the live site until you deploy.`
        }
      </div>

      <section class="card">
        <div class="row"><h2>Auto-scroll</h2>
          <label class="switch"><input type="checkbox" id="f-auto" ${s.autoAdvance ? 'checked' : ''} /><span></span> Pages turn on their own</label></div>
        <p class="help">After the guest opens the invitation, the date card scratches itself, then the pages turn one by one. The guest's first touch always stops it.</p>
        ${slider('scratchDelayMs', 'Date card scratches itself after', s.scratchDelayMs, 0, 10000, 250, 'Time on the first page before the gold card reveals the dates.')}
        ${slider('startDelayMs', 'Pages start turning after the dates show', s.startDelayMs, 0, 10000, 250)}
        ${slider('glideMs', 'Page-turn speed (one page glide)', s.glideMs, 400, 3000, 100, 'Shorter = faster turn.')}
        <h3>Time on each page</h3>
        ${s.pages.map((p, i) => slider(`page-${i}`, p.label, p.holdMs, 1000, 20000, 250)).join('')}
        <p class="total">One full auto-play: about <b id="total">${sec(showLength(s))}</b></p>
      </section>

      <section class="card">
        <div class="row"><h2>Music</h2>
          <label class="switch"><input type="checkbox" id="f-menabled" ${s.music.enabled ? 'checked' : ''} /><span></span> Music on</label></div>
        <div class="tracks">
          <div class="track">
            <p class="tag">Now live</p>
            <p><b>${esc(live.music.title)}</b> · ${mb(inv.music.size)}</p>
            <audio controls preload="none" src="${esc(inv.music.url)}"></audio>
          </div>
          <div class="track ${inv.draft?.music ? 'new' : ''}">
            <p class="tag">${inv.draft?.music ? 'New song – after deploy' : 'Replace the song'}</p>
            ${
              inv.draft?.music
                ? `<p><b>${esc(inv.draft.music.name)}</b> · ${mb(inv.draft.music.size)}</p><audio controls preload="none" src="/api/admin/music?folder=${esc(folder)}"></audio>`
                : '<p class="help">MP3 only, up to 4 MB (about 4 minutes at 128 kbps).</p>'
            }
            <label class="btn file">Upload MP3<input type="file" accept="audio/mpeg,.mp3" id="f-file" hidden /></label>
          </div>
        </div>
        <div class="field"><label for="f-mtitle">Song name (shown here only)</label><input id="f-mtitle" value="${esc(s.music.title)}" maxlength="60" /></div>
        <div class="field">
          <label for="f-mvol">Volume <output id="o-mvol">${Math.round(s.music.volume * 100)}%</output></label>
          <input type="range" id="f-mvol" min="10" max="100" step="5" value="${Math.round(s.music.volume * 100)}" />
        </div>
        <div class="field">
          <label for="f-mfade">Fade in when the invitation opens <output id="o-mfade">${sec(s.music.fadeInSec * 1000)}</output></label>
          <input type="range" id="f-mfade" min="0" max="10" step="0.5" value="${s.music.fadeInSec}" />
        </div>
        <div class="field">
          <label for="f-mstart">Start the song at <output id="o-mstart">${sec(s.music.startAtSec * 1000)}</output></label>
          <input type="range" id="f-mstart" min="0" max="120" step="1" value="${s.music.startAtSec}" />
          <p class="help">Skips a quiet or long intro.</p>
        </div>
        <label class="switch"><input type="checkbox" id="f-mloop" ${s.music.loop ? 'checked' : ''} /><span></span> Repeat the song when it ends</label>
        <div class="row gap"><button class="btn" id="b-preview">▶ Preview with these settings</button><button class="btn" id="b-stop" hidden>■ Stop</button></div>
      </section>

      <section class="card changes">
        <h2>What changes when you deploy</h2>
        ${changes.length ? `<ul>${changes.join('')}</ul>` : '<p class="muted">Nothing yet: the saved settings are the same as live.</p>'}
      </section>

      <div class="actions">
        <span id="unsaved" class="unsaved" ${dirty ? '' : 'hidden'}>● Unsaved changes</span>
        ${inv.draft ? '<button class="btn" id="b-discard">Discard saved changes</button>' : ''}
        <button class="btn" id="b-save">Save</button>
        <button class="btn primary" id="b-deploy" ${inv.draft && !dirty ? '' : 'disabled'}>Deploy</button>
      </div>
    </main>`;
    wireHeader();
    wire();
  };

  const markDirty = () => {
    dirty = JSON.stringify(edit) !== JSON.stringify(saved);
    root.querySelector('#unsaved')!.toggleAttribute('hidden', !dirty);
    (root.querySelector('#b-deploy') as HTMLButtonElement).disabled = !inv.draft || dirty;
    root.querySelector('#total')!.textContent = sec(showLength(edit));
  };

  const wire = () => {
    root.querySelectorAll<HTMLInputElement>('[data-ms]').forEach((el) =>
      el.addEventListener('input', () => {
        const key = el.dataset.ms!;
        const v = Number(el.value);
        if (key.startsWith('page-')) edit.pages[Number(key.slice(5))].holdMs = v;
        else (edit as unknown as Record<string, number>)[key] = v;
        root.querySelector(`#o-${key}`)!.textContent = sec(v);
        markDirty();
      }),
    );
    const on = (id: string, ev: string, f: (el: HTMLInputElement) => void) => {
      const el = root.querySelector<HTMLInputElement>(id)!;
      el.addEventListener(ev, () => {
        f(el);
        markDirty();
      });
    };
    on('#f-auto', 'change', (el) => (edit.autoAdvance = el.checked));
    on('#f-menabled', 'change', (el) => (edit.music.enabled = el.checked));
    on('#f-mtitle', 'input', (el) => (edit.music.title = el.value.trim() || 'Song'));
    on('#f-mvol', 'input', (el) => {
      edit.music.volume = Number(el.value) / 100;
      root.querySelector('#o-mvol')!.textContent = `${el.value}%`;
      if (preview) preview.volume = edit.music.volume;
    });
    on('#f-mfade', 'input', (el) => {
      edit.music.fadeInSec = Number(el.value);
      root.querySelector('#o-mfade')!.textContent = sec(edit.music.fadeInSec * 1000);
    });
    on('#f-mstart', 'input', (el) => {
      edit.music.startAtSec = Number(el.value);
      root.querySelector('#o-mstart')!.textContent = sec(edit.music.startAtSec * 1000);
    });
    on('#f-mloop', 'change', (el) => (edit.music.loop = el.checked));

    // preview: the new song if uploaded, else the live one, from the start offset, fading in to the volume
    const stopBtn = root.querySelector<HTMLButtonElement>('#b-stop')!;
    root.querySelector('#b-preview')!.addEventListener('click', () => {
      preview?.pause();
      preview = new Audio(inv.draft?.music ? `/api/admin/music?folder=${folder}` : inv.music.url);
      preview.currentTime = edit.music.startAtSec;
      preview.volume = 0;
      void preview.play();
      const t0 = performance.now();
      const p = preview;
      const step = (t: number) => {
        const k = edit.music.fadeInSec ? Math.min(1, (t - t0) / (edit.music.fadeInSec * 1000)) : 1;
        p.volume = k * k * edit.music.volume;
        if (k < 1 && preview === p) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      stopBtn.hidden = false;
    });
    stopBtn.addEventListener('click', () => {
      preview?.pause();
      preview = null;
      stopBtn.hidden = true;
    });

    root.querySelector<HTMLInputElement>('#f-file')!.addEventListener('change', async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      if (file.size > 4 * 1024 * 1024) return toast('That song is larger than 4 MB. Export it at 128 kbps, or shorten it.', 'err');
      if (!/\.mp3$/i.test(file.name) && file.type !== 'audio/mpeg') return toast('Please choose an MP3 file.', 'err');
      if (dirty) await save(false);
      toast('Uploading the song…');
      try {
        const r = await api<{draft: Draft}>(`music?folder=${folder}&name=${encodeURIComponent(file.name)}`, {
          method: 'POST',
          headers: {'content-type': 'audio/mpeg'},
          body: file,
        });
        inv.draft = r.draft;
        if (edit.music.title === live.music.title) edit.music.title = file.name.replace(/\.mp3$/i, '').slice(0, 60);
        await save(false);
        toast('New song uploaded and saved. It goes live when you deploy.');
      } catch (err) {
        if ((err as Error).message !== 'signed out') toast((err as Error).message, 'err');
      }
    });

    root.querySelector('#b-save')!.addEventListener('click', () => void save(true));
    root.querySelector('#b-discard')?.addEventListener('click', async () => {
      if (!confirm('Discard the saved changes (and any uploaded song)? The live site is not affected.')) return;
      await api(`draft?folder=${folder}`, {method: 'DELETE'});
      inv.draft = null;
      saved = clone(live);
      Object.assign(edit, clone(live));
      dirty = false;
      toast('Saved changes discarded. Showing what is live.');
      render();
    });
    root.querySelector('#b-deploy')!.addEventListener('click', () => void deployFlow());
  };

  const save = async (announce: boolean) => {
    try {
      const r = await api<{draft: Draft}>(`draft?folder=${folder}`, {
        method: 'PUT',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({settings: edit}),
      });
      inv.draft = r.draft;
      saved = clone(edit);
      dirty = false;
      if (announce) toast('Saved. Not live yet: press Deploy to publish.');
      render();
    } catch (err) {
      if ((err as Error).message !== 'signed out') toast((err as Error).message, 'err');
    }
  };

  const deployFlow = async () => {
    const changes = diff(live, saved, inv.draft?.music);
    const dlg = document.createElement('dialog');
    dlg.className = 'card dialog';
    dlg.innerHTML = `<h2>Deploy to ${esc(inv.site ? inv.site.replace(/^https?:\/\//, '') : 'GitHub')}?</h2>
      ${changes.length ? `<ul>${changes.join('')}</ul>` : '<p>No setting changes (the saved draft equals live).</p>'}
      <p class="help">This saves the changes to GitHub on every branch. ${
        inv.site ? 'Netlify then rebuilds this invitation; it is usually live in 1–2 minutes. Other invitations are not touched.' : 'This invitation has no Netlify site yet, so nothing goes live until one is created.'
      }</p>
      <ol class="steps"><li data-step="1">Save to GitHub</li><li data-step="2">Netlify rebuilds the site</li><li data-step="3">Live</li></ol>
      <p class="err" role="alert"></p>
      <div class="row gap end"><button class="btn" data-cancel>Cancel</button><button class="btn primary" data-go>Deploy now</button></div>`;
    document.body.appendChild(dlg);
    dlg.showModal();
    const step = (n: number, state: 'run' | 'done' | 'fail') => dlg.querySelector(`[data-step="${n}"]`)!.setAttribute('class', state);
    dlg.querySelector('[data-cancel]')!.addEventListener('click', () => dlg.close());
    dlg.addEventListener('close', () => {
      dlg.remove();
      void showEditorRefresh(folder);
    });
    dlg.querySelector('[data-go]')!.addEventListener('click', async (ev) => {
      const go = ev.target as HTMLButtonElement;
      go.disabled = true;
      (dlg.querySelector('[data-cancel]') as HTMLButtonElement).textContent = 'Close';
      step(1, 'run');
      try {
        const r = await api<{commit: string; failedBranches?: string[]; dryRun?: boolean; files?: {path: string; size: number}[]}>(`deploy?folder=${folder}`, {
          method: 'POST',
        });
        if (r.dryRun) {
          // local test server: nothing is published
          step(1, 'done');
          dlg.querySelector('.err')!.textContent = `Test mode: nothing was published. It would commit ${(r.files ?? []).map((f) => `${f.path} (${mb(f.size)})`).join(', ')}.`;
          go.textContent = 'Test done';
          return;
        }
        step(1, 'done');
        if (r.failedBranches?.length) dlg.querySelector('.err')!.textContent = `Saved, but these branches could not be updated: ${r.failedBranches.join(', ')}.`;
        if (!inv.site) {
          step(2, 'done');
          step(3, 'done');
          go.textContent = 'Done';
          return;
        }
        step(2, 'run');
        const t0 = Date.now();
        const poll = async () => {
          const s = await api<Status>(`status?folder=${folder}`).catch(() => null);
          if (s?.live?.commit === r.commit) {
            step(2, 'done');
            step(3, 'done');
            go.textContent = 'Live ✓';
            toast('Live! The invitation now uses your changes.');
            return;
          }
          if (Date.now() - t0 > 6 * 60_000) {
            step(2, 'fail');
            dlg.querySelector('.err')!.textContent = 'Netlify has not published it after 6 minutes. Open the site in Netlify → Deploys to see why.';
            return;
          }
          setTimeout(poll, 8000);
        };
        void poll();
      } catch (err) {
        step(1, 'fail');
        dlg.querySelector('.err')!.textContent = (err as Error).message;
        go.disabled = false;
      }
    });
  };

  render();
}

async function showEditorRefresh(folder: string) {
  try {
    await load();
    showEditor(folder);
  } catch {
    /* signed out: the login is shown */
  }
}

// ───────────────────────── start ─────────────────────────
api('me')
  .then(() => showDashboard())
  .catch(() => showLogin());
