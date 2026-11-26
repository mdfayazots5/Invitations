import {C} from './invite.config';

/** Builds the WhatsApp RSVP URL (exported for tests). */
export const buildWhatsAppUrl = (name: string, joyful: boolean, guests: number, events: string[]) => {
  const u = C.ui;
  const lines = [
    u.waHeader,
    `${u.waName}: ${name}`,
    `${u.waReply}: ${joyful ? u.waJoyfully : u.waRegrets}`,
    `${u.waGuests}: ${joyful ? guests : 0}`,
    `${u.waEvents}: ${joyful && events.length ? events.join(', ') : '-'}`,
  ];
  const number = C.whatsappNumber.replace(/\D/g, '');
  if (C.whatsappNumber.includes('TODO')) console.warn('[invite] whatsappNumber is still a TODO placeholder in invite.config.ts');
  return `https://wa.me/${number}?text=${encodeURIComponent(lines.join('\n'))}`;
};

export const startRsvp = (root: HTMLElement) => {
  const form = root.querySelector<HTMLFormElement>('form')!;
  const nameEl = form.querySelector<HTMLInputElement>('#rsvp-name')!;
  const guestsEl = form.querySelector<HTMLInputElement>('#rsvp-guests')!;
  const attend = Array.from(form.querySelectorAll<HTMLButtonElement>('[data-attend]'));
  const eventPills = Array.from(form.querySelectorAll<HTMLButtonElement>('[data-event]'));
  const eventsField = form.querySelector<HTMLElement>('[data-events-field]')!;
  const err = (k: string) => form.querySelector<HTMLElement>(`[data-err="${k}"]`)!;
  let attendance: 'yes' | 'no' | null = null;

  attend.forEach((b) =>
    b.addEventListener('click', () => {
      attendance = b.dataset.attend as 'yes' | 'no';
      attend.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      eventsField.hidden = attendance === 'no';
      err('attendance').textContent = '';
    }),
  );
  eventPills.forEach((b) =>
    b.addEventListener('click', () => {
      b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true'));
      err('events').textContent = '';
    }),
  );

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector<HTMLElement>('.btn-gold')!;
    btn.classList.remove('shine');
    void btn.offsetWidth;
    btn.classList.add('shine');

    const name = nameEl.value.trim();
    const guests = Number(guestsEl.value);
    const events = eventPills.filter((b) => b.getAttribute('aria-pressed') === 'true').map((b) => b.dataset.label!);
    let ok = true;
    const fail = (k: string, msg: string) => {
      err(k).textContent = msg;
      ok = false;
    };
    ['name', 'attendance', 'guests', 'events'].forEach((k) => (err(k).textContent = ''));
    if (!name) fail('name', C.ui.errName);
    if (!attendance) fail('attendance', C.ui.errAttendance);
    if (attendance === 'yes' && !(Number.isInteger(guests) && guests >= 1 && guests <= 20)) fail('guests', C.ui.errGuests);
    if (attendance === 'yes' && events.length === 0) fail('events', C.ui.errEvents);
    if (!ok) return;

    window.open(buildWhatsAppUrl(name, attendance === 'yes', guests, events), '_blank', 'noopener');
    form.hidden = true;
    root.querySelector<HTMLElement>('.thanks')!.hidden = false;
  });
};
