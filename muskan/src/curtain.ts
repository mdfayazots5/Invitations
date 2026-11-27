import {crest} from './art';
import {C} from './invite.config';

/**
 * Opening screen: the painted red velvet stage curtain (public/art/curtain.webp) with the glowing gold F & M crest
 * in its spotlight. Tap → a gold line → an amber beam → a full-screen cream/amber flash → the palace hall. Resolves when the overlay is gone.
 * `onOpen` fires inside the tap (so the music is allowed to start).
 */
export const mountCurtain = (root: HTMLElement, onOpen: () => void, reducedMotion: boolean): Promise<void> =>
  new Promise((resolve) => {
    const [a, b] = C.monogram;
    root.innerHTML = `<div class="curtain" role="button" tabindex="0" aria-label="${C.ui.doorsLabel}">
      <div class="curtain-art" aria-hidden="true"></div>
      <div class="beams" aria-hidden="true"><i></i><i></i><i></i></div>
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
      // As in the video: the curtain stays put. 0 s a gold line appears down the middle and the crest fades;
      // 0.6 s it widens into an amber beam; 1.7 s a full-screen flash, cream then deep amber, for ~2.5 s;
      // the hall starts its zoom under the flash and shows as the flash fades.
      el.classList.add('opening');
      window.setTimeout(() => el.classList.add('beam'), 600);
      window.setTimeout(() => {
        el.classList.add('open');
        window.setTimeout(() => document.body.classList.add('entered'), 1900);
        window.setTimeout(finish, 3300);
      }, 1700);
    };
    el.addEventListener('click', open);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
  });
