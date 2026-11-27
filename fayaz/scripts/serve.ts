import {spawn, spawnSync, type ChildProcess} from 'node:child_process';

export const URL_BASE = 'http://localhost:4173';

/** Starts `vite preview` on :4173 (expects a fresh `npm run build`) and waits until it answers. */
export const startPreview = async (): Promise<ChildProcess> => {
  // A preview left running by an interrupted run would make us test an old (or another site's) build.
  try {
    await fetch(URL_BASE);
    throw new Error('Port 4173 is already in use (a stale `vite preview`?). Stop it, then run again.');
  } catch (e) {
    if (e instanceof Error && e.message.startsWith('Port 4173')) throw e;
  }
  const proc = spawn('npx', ['vite', 'preview', '--port', '4173', '--strictPort'], {
    shell: true,
    stdio: 'ignore',
  });
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(URL_BASE);
      if (r.ok) return proc;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  proc.kill();
  throw new Error('vite preview did not start on :4173');
};

export const stopPreview = (proc: ChildProcess) => {
  if (process.platform === 'win32' && proc.pid) {
    // Synchronous: the scripts call process.exit() right after this, which could cut off an async taskkill
    // and leave vite preview holding port 4173.
    spawnSync('taskkill', ['/pid', String(proc.pid), '/T', '/F'], {stdio: 'ignore'});
  } else proc.kill();
};
