import {C} from './invite.config';

/** Fixed music toggle. Hidden automatically if the track can't be loaded. */
export const createMusic = () => {
  const audio = new Audio();
  audio.loop = true;
  audio.preload = 'auto';
  audio.src = C.music;

  const btn = document.createElement('button');
  btn.className = 'music paused';
  btn.type = 'button';
  btn.setAttribute('aria-label', C.ui.musicPlay);
  btn.innerHTML = `<svg width="26" height="22" viewBox="0 0 26 22" aria-hidden="true">
    <g fill="#E9CF8A"><rect class="bar" x="2" y="4" width="3" height="16" rx="1.5"/><rect class="bar" x="8" y="1" width="3" height="19" rx="1.5"/>
    <rect class="bar" x="14" y="6" width="3" height="14" rx="1.5"/><rect class="bar" x="20" y="3" width="3" height="17" rx="1.5"/></g>
    <line class="mute" x1="2" y1="20" x2="24" y2="2" stroke="#F3EBDD" stroke-width="2" stroke-linecap="round"/></svg>`;
  btn.hidden = true;
  document.body.appendChild(btn);

  const sync = () => {
    btn.classList.toggle('paused', audio.paused);
    btn.setAttribute('aria-label', audio.paused ? C.ui.musicPlay : C.ui.musicPause);
  };
  audio.addEventListener('play', sync);
  audio.addEventListener('pause', sync);
  audio.addEventListener('error', () => {
    btn.remove();
  });

  btn.addEventListener('click', () => {
    if (audio.paused) audio.play().catch(() => undefined);
    else audio.pause();
  });

  return {
    /** Call inside the door tap so autoplay is allowed. */
    start: () => {
      if (!btn.isConnected) return;
      btn.hidden = false;
      audio.play().catch(() => sync());
    },
  };
};
