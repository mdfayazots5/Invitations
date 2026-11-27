import {crest, curtainValance, roseBed} from './art';
import {C} from './invite.config';

/**
 * Opening screen: a red velvet stage curtain with a glowing gold F & M crest.
 * Tap → a line of gold light splits the curtain, the halves sweep aside, a warm flash fills the screen,
 * and the palace hall zooms in behind it. Resolves when the overlay is gone.
 * `onOpen` fires inside the tap (so the music is allowed to start).
 */
export const mountCurtain = (root: HTMLElement, onOpen: () => void, reducedMotion: boolean): Promise<void> =>
  new Promise((resolve) => {
    const [a, b] = C.monogram;
    root.innerHTML = `<div class="curtain" role="button" tabindex="0" aria-label="${C.ui.doorsLabel}">
      <div class="drape drape-l"></div><div class="drape drape-r"></div>
      <div class="beams" aria-hidden="true"><i></i><i></i><i></i></div>
      ${curtainValance()}
      ${roseBed()}
      <div class="curtain-centre">${crest(a, b)}<p class="caps tap-hint">${C.ui.tapToEnter}</p></div>
      <div class="split" aria-hidden="true"></div>
      <div class="flash" aria-hidden="true"></div>
    </div>`;
    const el = root.querySelector<HTMLElement>('.curtain')!;
    el.focus({preventScroll: true});
    let opened = false;

    const finish = () => {
      root.remove();
      resolve();
    };
    const open = () => {
      if (opened) return;
      opened = true;
      onOpen();
      document.body.classList.remove('locked');
      if (reducedMotion) {
        document.body.classList.add('entered');
        finish();
        return;
      }
      // 0 → split line grows (0.5 s) → curtain sweeps aside + flash (1.4 s) → hall zooms in under the flash
      el.classList.add('opening');
      window.setTimeout(() => {
        el.classList.add('open');
        window.setTimeout(() => document.body.classList.add('entered'), 700);
        window.setTimeout(finish, 2300);
      }, 550);
    };
    el.addEventListener('click', open);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
  });
