// All text on the page comes from here. Spelling is final: "Venkat Narsimha Garden",
// "Rajab-ul-Murajjab". Never change it.
// This invite is for the Valima only (shared with friends & relatives).

export type InviteEvent = {
  key: 'valima';
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
};

export const C = {
  bismillahEn: 'In the name of Allah, the Most Beneficent, the Most Merciful',
  groomShort: 'Fayaz',
  brideShort: 'Muskan',
  groomFull: 'Mohammed Fayaz',
  brideFull: 'Muskan Khanam',
  blessings: 'With the blessings of Late Mrs. & Mr. Abdul Khader Sahab Pattedar (Konayapally)',
  host: 'MRS. LATE ABDUL RAHMATH SAHAB',
  hostLine: 'Requests the honour of your presence on the occasion of the Valima of her son',
  brideParents: '(D/o Mrs. & Mr. Khamru Jama Khan Sahab)',
  quote:
    'With joyful hearts and gratitude, we invite you to celebrate love, unity, and the beginning of a beautiful journey together.',
  heroLabel: 'VALIMA',
  scratchReveal: '15th December 2026',
  scratchSub: 'Tuesday · 8:00 PM',
  events: [
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
    },
  ] as InviteEvent[],

  footerLine: 'With gratitude · 15 December 2026',
  music: '/music.mp3',

  // UI copy
  ui: {
    title: 'Fayaz & Muskan · Valima',
    ogDescription:
      'You are invited to the Valima of Mohammed Fayaz & Muskan Khanam · Tuesday, 15 December 2026 · 8 PM · Venkat Narsimha Garden, Amangal',
    tapToEnter: 'TAP TO ENTER',
    doorsLabel: 'Open the invitation doors',
    and: '&',
    inshaAllah: '— Insha Allah —',
    scratchLabel: 'SCRATCH TO REVEAL',
    scratchAria: 'Scratch to reveal the Valima date. Press Enter to reveal.',
    scroll: 'Scroll',
    invitationLabel: 'THE INVITATION',
    with: 'with',
    countdownLabel: 'COUNTING THE MOMENTS',
    countdownTitle: 'Until We Celebrate',
    units: ['DAYS', 'HOURS', 'MINUTES', 'SECONDS'],
    alhamdulillah: 'Alhamdulillah',
    venueLabel: 'THE VENUE',
    viewOnMaps: '📍 VIEW ON MAPS',
    mapTitle: 'Map of {venue}',
    footerNames: 'Fayaz & Muskan',
    musicPlay: 'Play music',
    musicPause: 'Pause music',
  },
};

export const mapEmbedUrl = (e: InviteEvent) => `https://maps.google.com/maps?q=${e.mapLat},${e.mapLng}&z=16&output=embed`;
