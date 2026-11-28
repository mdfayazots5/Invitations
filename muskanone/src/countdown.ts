import {C} from './invite.config';

const nextEvent = (now: number) => C.events.find((e) => new Date(e.startISO).getTime() > now);

/** Fills the countdown boxes, flipping digits on change. */
export const startCountdown = (root: HTMLElement) => {
  const when = root.querySelector<HTMLElement>('[data-next]')!;
  const boxes = root.querySelector<HTMLElement>('.boxes')!;
  const faces = Array.from(root.querySelectorAll<HTMLElement>('.box-face'));
  const current: string[] = ['', '', '', ''];

  const set = (i: number, value: string) => {
    if (current[i] === value) return;
    const face = faces[i];
    const old = face.querySelector('.digit:not(.out)');
    const next = document.createElement('span');
    next.className = 'digit gold-text';
    next.textContent = value;
    if (old && current[i] !== '') {
      old.classList.add('out');
      next.classList.add('in');
      window.setTimeout(() => old.remove(), 460);
    } else old?.remove();
    face.appendChild(next);
    current[i] = value;
  };

  const update = () => {
    const now = Date.now();
    const ev = nextEvent(now);
    if (!ev) {
      boxes.hidden = true;
      when.textContent = '';
      root.querySelector<HTMLElement>('[data-done]')!.hidden = false;
      return false;
    }
    when.textContent = C.ui.countdownUntil.replace('{date}', ev.date).replace('{event}', ev.title);
    const s = Math.floor((new Date(ev.startISO).getTime() - now) / 1000);
    const vals = [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60];
    vals.forEach((v, i) => set(i, String(v).padStart(2, '0')));
    return true;
  };

  if (update()) {
    const id = window.setInterval(() => {
      if (!update()) window.clearInterval(id);
    }, 1000);
  }
};
