import {garland, lanterns, monogramRing} from './art';
import {C} from './invite.config';

/**
 * Opening screen (brief §4.2): cream silk drapes closed in the middle, a white-flower garland across the top,
 * two brass lanterns, and in the centre the Bismillah, the gold F & M ring and a pulsing "Tap to open".
 * Tap → the lanterns swing, both drapes slide apart (1.4 s, cubic-bezier(.65,0,.35,1)) onto the sky,
 * a soft white bloom (0.4 s) as they clear; 1.8 s in all. Resolves when the overlay is gone.
 * With public/art/curtain.webp present, each drape shows its half of the painting.
 * `onOpen` fires inside the tap (so the music is allowed to start).
 */
export const mountCurtain = (root: HTMLElement, onOpen: () => void, reducedMotion: boolean, painted: boolean): Promise<void> =>
  new Promise((resolve) => {
    const [a, b] = C.monogram;
    root.innerHTML = `<div class="curtain${painted ? ' painted' : ''}" role="button" tabindex="0" aria-label="${C.ui.curtainLabel}">
      <div class="drape left" aria-hidden="true"></div>
      <div class="drape right" aria-hidden="true"></div>
      ${painted ? '' : garland()}
      ${lanterns([
        [9, 40, 1],
        [79, 70, 0.9],
      ])}
      <div class="curtain-centre">
        <p class="bismillah-ar" lang="ar" dir="rtl">${C.bismillahAr}</p>
        ${monogramRing(a, b)}
        <p class="caps tap-hint">${C.ui.tapToEnter}</p>
      </div>
      <div class="bloom" aria-hidden="true"></div>
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
      el.classList.add('opening'); // lanterns swing, centre fades, drapes slide (1.4 s)
      window.setTimeout(() => {
        el.classList.add('bloom-on'); // soft white bloom as the drapes clear
        document.body.classList.add('entered');
      }, 1300);
      window.setTimeout(finish, 1800);
    };
    el.addEventListener('click', open);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
  });
