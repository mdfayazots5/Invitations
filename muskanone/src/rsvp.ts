import {C} from './invite.config';

/** RSVP form → opens WhatsApp with a ready message to the family's number. No server involved. */
export const wireRsvp = (root: HTMLElement) => {
  const form = root.querySelector<HTMLFormElement>('form')!;
  const name = form.querySelector<HTMLInputElement>('input[name=name]')!;
  const err = form.querySelector<HTMLElement>('.rsvp-err')!;
  let choice: 'yes' | 'no' | '' = 'yes'; // Joyfully Accept is pre-selected, as in the video
  form.querySelectorAll<HTMLButtonElement>('[data-choice]').forEach((b) =>
    b.addEventListener('click', () => {
      choice = b.dataset.choice as 'yes' | 'no';
      form.querySelectorAll('[data-choice]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      err.textContent = '';
    }),
  );
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const who = name.value.trim().replace(/\s+/g, ' ');
    if (!who) {
      err.textContent = C.ui.rsvpNeedName;
      name.focus();
      return;
    }
    if (!choice) {
      err.textContent = C.ui.rsvpNeedChoice;
      return;
    }
    err.textContent = '';
    const text = (choice === 'yes' ? C.ui.rsvpMsgYes : C.ui.rsvpMsgNo).replace('{name}', who);
    // Same tab, not window.open: WhatsApp's own in-app browser blocks new windows.
    location.href = `https://wa.me/${C.rsvpWhatsApp}?text=${encodeURIComponent(text)}`;
  });
};
