// All text on the page comes from here. Spelling is final: "Ruby Garden",
// "Venkat Narsimha Garden", "Rajab-ul-Murajjab". Never change it.

export type InviteEvent = {
  key: 'nikah' | 'valima';
  title: string;
  day: string;
  date: string;
  hijri: string;
  time: string;
  note: string;
  venue: string;
  address: string;
  startISO: string;
  mapQuery: string;
  /** Exact Google Maps pin (from the family's shared links). */
  mapLat: number;
  mapLng: number;
  /** Full Google Maps place URL opened by "VIEW ON MAPS". */
  mapPlaceUrl: string;
  /** Short label used on the RSVP event pills. */
  pill: string;
};

export const C = {
  bismillahEn: 'In the name of Allah, the Most Beneficent, the Most Merciful',
  groomShort: 'Fayaz',
  brideShort: 'Muskan',
  groomFull: 'Mohammed Fayaz',
  brideFull: 'Muskan Khanam',
  blessings: 'With the blessings of Late Mrs. & Mr. Abdul Khader Sahab Pattedar (Konayapally)',
  host: 'MRS. LATE ABDUL RAHMATH SAHAB',
  hostLine: 'Requests the honour of your presence on the occasion of the Nikah & Valima of her son',
  brideParents: '(D/o Mrs. & Mr. Khamru Jama Khan Sahab)',
  quote:
    'With joyful hearts and gratitude, we invite you to celebrate love, unity, and the beginning of a beautiful journey together.',
  heroLabel: 'NIKAH & VALIMA',
  scratchReveal: '14th & 15th December 2026',
  scratchSub: 'Monday & Tuesday',
  events: [
    {
      key: 'nikah',
      title: 'Nikah',
      day: 'Monday',
      date: '14th December 2026',
      hijri: '4 Rajab 1448 AH',
      time: '10:00 AM',
      note: 'Lunch follows',
      venue: 'Ruby Garden',
      address: 'Sripur Road, Nagarkurnool',
      startISO: '2026-12-14T10:00:00+05:30',
      mapQuery: 'Ruby Garden, Sripur Road, Nagarkurnool, Telangana',
      mapLat: 16.4786175,
      mapLng: 78.3060455,
      mapPlaceUrl:
        'https://www.google.com/maps/place/Ruby+Gardens+Function+Hall/@16.4784009,78.3057736,148m/data=!3m1!1e3!4m6!3m5!1s0x3bca6d005b04d0bb:0xfa99cfbe2cb503b5!8m2!3d16.4786175!4d78.3060455!16s%2Fg%2F11vr_m01zm',
      pill: 'NIKAH · 14 DEC',
    },
    {
      key: 'valima',
      title: 'Valima',
      day: 'Tuesday',
      date: '15th December 2026',
      hijri: '5 Rajab-ul-Murajjab 1448 AH',
      time: '8:00 PM',
      note: 'Dinner',
      venue: 'Venkat Narsimha Garden',
      address: 'Shad Nagar Road, Amangal',
      startISO: '2026-12-15T20:00:00+05:30',
      mapQuery: 'Venkat Narsimha Garden, Shadnagar Road, Amangal, Telangana',
      mapLat: 16.8444037,
      mapLng: 78.5197176,
      mapPlaceUrl:
        'https://www.google.com/maps/place/Venkata+Narasimha+Gardens+And+Function+Hall/@16.8444186,78.5193368,228m/data=!3m1!1e3!4m6!3m5!1s0x3bca51a091a8af1f:0x8ca710c8fb17b52a!8m2!3d16.8444037!4d78.5197176!16s%2Fg%2F11fzb17fcg',
      pill: 'VALIMA · 15 DEC',
    },
  ] as InviteEvent[],

  // ─── TODO: fill these three before sharing the link ───────────────────────
  rsvpDeadline: 'TODO e.g. 7th December 2026',
  whatsappNumber: 'TODO 91XXXXXXXXXX', // digits only, with country code
  contacts: [{name: 'FAYAZ', phone: 'TODO +91 XXXXX XXXXX'}],
  // ──────────────────────────────────────────────────────────────────────────

  footerLine: 'With gratitude · 14 & 15 December 2026',
  music: '/music.mp3',

  // UI copy
  ui: {
    title: 'Fayaz & Muskan · Nikah & Valima',
    ogDescription:
      'You are invited to the Nikah & Valima of Mohammed Fayaz & Muskan Khanam · 14 & 15 December 2026 · Nagarkurnool & Amangal',
    tapToEnter: 'TAP TO ENTER',
    doorsLabel: 'Open the invitation doors',
    and: '&',
    inshaAllah: '— Insha Allah —',
    scratchLabel: 'SCRATCH TO REVEAL',
    scratchAria: 'Scratch to reveal the wedding dates. Press Enter to reveal.',
    scroll: 'Scroll',
    invitationLabel: 'THE INVITATION',
    with: 'with',
    countdownLabel: 'COUNTING THE MOMENTS',
    countdownTitle: 'Until We Celebrate',
    units: ['DAYS', 'HOURS', 'MINUTES', 'SECONDS'],
    alhamdulillah: 'Alhamdulillah',
    rsvpLabel: 'RSVP',
    rsvpTitle: 'Kindly Respond',
    rsvpIntro: 'Your presence is the greatest gift. Please confirm by {deadline}.',
    name: 'NAME',
    namePlaceholder: 'Your full name',
    attendance: 'ATTENDANCE',
    joyfully: 'JOYFULLY',
    regrets: 'REGRETS',
    guests: 'GUESTS',
    eventsLabel: 'EVENTS',
    send: 'SEND RSVP',
    errName: 'Please enter your name.',
    errAttendance: 'Please choose an attendance option.',
    errGuests: 'Guests must be between 1 and 20.',
    errEvents: 'Please choose at least one event.',
    thanksTitle: 'Shukriya!',
    thanksLine: "We can't wait to celebrate with you.",
    waHeader: "Assalamu Alaikum! RSVP for Fayaz & Muskan's wedding",
    waName: 'Name',
    waReply: 'Reply',
    waGuests: 'Guests',
    waEvents: 'Events',
    waJoyfully: 'Joyfully accepts',
    waRegrets: 'Regretfully declines',
    venueLabel: 'THE VENUE',
    viewOnMaps: '📍 VIEW ON MAPS',
    mapTitle: 'Map of {venue}',
    footerNames: 'Fayaz & Muskan',
    musicPlay: 'Play music',
    musicPause: 'Pause music',
  },
};

export const mapEmbedUrl = (e: InviteEvent) => `https://maps.google.com/maps?q=${e.mapLat},${e.mapLng}&z=16&output=embed`;
