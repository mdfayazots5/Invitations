// All text on the family invite comes from here. Spelling is final (from the family's card):
// "Ruby Garden", "Venkat Narsimha Garden", "Rajab-ul-Murajjab", "Mrs. Late Abdul Rahmath Sahab".

export type InviteEvent = {
  key: 'nikah' | 'valima';
  title: string;
  urdu: string;
  day: string;
  date: string;
  hijri: string;
  time: string;
  note: string;
  venue: string;
  address: string;
  startISO: string;
  /** Exact Google Maps pin (from the family's shared links). */
  mapLat: number;
  mapLng: number;
  /** Full Google Maps place URL opened by "VIEW ON MAPS". */
  mapPlaceUrl: string;
};

export const SITE_URL = 'https://fayazinvitation.netlify.app/';

export const C = {
  bismillahAr: 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ',
  bismillahEn: 'In the name of Allah, the Most Beneficent, the Most Merciful',
  groomShort: 'Fayaz',
  brideShort: 'Muskan',
  groomFull: 'Mohammed Fayaz',
  brideFull: 'Muskan Khanam',
  namesUrdu: 'محمد فیاض ہمراہ مسکان خانم',
  welcomeUrdu: 'آپ کی تشریف آوری باعث مسرت ہوگی',
  fromUrdu: 'المنتظرین: عزیز و اقارب',
  blessingsLabel: 'With the blessings of',
  blessings: 'Late Mrs. & Mr. Abdul Khader Sahab Pattedar',
  blessingsPlace: '(Konayapally)',
  withJoy: 'With joy in our hearts',
  host: 'Mrs. Late Abdul Rahmath Sahab',
  hostLine: 'solicits your gracious presence on the auspicious occasion of the Nikah & Valima of her son',
  brideParents: 'daughter of Mrs. & Mr. Khamru Jama Khan Sahab',
  heroLabel: 'NIKAH & VALIMA',
  scratchReveal: '14th & 15th December 2026',
  scratchSub: 'Monday & Tuesday',
  events: [
    {
      key: 'nikah',
      title: 'Nikah',
      urdu: 'نکاح مسنون',
      day: 'Monday',
      date: '14th December 2026',
      hijri: '4 Rajab 1448 AH',
      time: '10:00 AM',
      note: 'Lunch follows',
      venue: 'Ruby Garden',
      address: 'Sripur Road, Nagarkurnool',
      startISO: '2026-12-14T10:00:00+05:30',
      mapLat: 16.4786175,
      mapLng: 78.3060455,
      mapPlaceUrl:
        'https://www.google.com/maps/place/Ruby+Gardens+Function+Hall/@16.4784009,78.3057736,148m/data=!3m1!1e3!4m6!3m5!1s0x3bca6d005b04d0bb:0xfa99cfbe2cb503b5!8m2!3d16.4786175!4d78.3060455!16s%2Fg%2F11vr_m01zm',
    },
    {
      key: 'valima',
      title: 'Valima',
      urdu: 'ولیمہ مسنونہ',
      day: 'Tuesday',
      date: '15th December 2026',
      hijri: '5 Rajab-ul-Murajjab 1448 AH',
      time: '8:00 PM',
      note: 'Dinner',
      venue: 'Venkat Narsimha Garden',
      address: 'Shad Nagar Road, Amangal',
      startISO: '2026-12-15T20:00:00+05:30',
      mapLat: 16.8444037,
      mapLng: 78.5197176,
      mapPlaceUrl:
        'https://www.google.com/maps/place/Venkata+Narasimha+Gardens+And+Function+Hall/@16.8444186,78.5193368,228m/data=!3m1!1e3!4m6!3m5!1s0x3bca51a091a8af1f:0x8ca710c8fb17b52a!8m2!3d16.8444037!4d78.5197176!16s%2Fg%2F11fzb17fcg',
    },
  ] as InviteEvent[],

  presence: 'Your presence and duas will be our greatest blessing',
  compliments: 'With best compliments from',
  nearDear: 'Near & Dear',
  inshaAllahClose: 'Insha Allah',
  music: '/music.mp3',

  // UI copy
  ui: {
    title: 'Fayaz & Muskan · Nikah & Valima',
    ogDescription:
      'Nikah: Monday, 14 December 2026 · 10 AM · Ruby Garden, Nagarkurnool. Valima: Tuesday, 15 December 2026 · 8 PM · Venkat Narsimha Garden, Amangal.',
    tapToEnter: 'TAP TO OPEN',
    doorsLabel: 'Open the invitation doors',
    and: '&',
    inshaAllah: '— Insha Allah —',
    scratchLabel: 'SCRATCH TO REVEAL',
    scratchAria: 'Scratch to reveal the wedding dates. Press Enter to reveal.',
    scroll: 'Scroll',
    invitationLabel: 'THE INVITATION',
    with: 'with',
    eventsLabel: 'THE CELEBRATIONS',
    countdownLabel: 'COUNTING THE MOMENTS',
    /** "|" splits the title over two script lines (one line is too wide for a phone). */
    countdownTitle: 'Until We Say|Qubool Hai',
    countdownTitleAfter: 'Until the Valima',
    units: ['DAYS', 'HOURS', 'MINUTES', 'SECONDS'],
    alhamdulillah: 'Alhamdulillah',
    venueLabel: 'THE VENUES',
    viewOnMaps: 'VIEW ON MAPS',
    mapTitle: 'Map of {venue}',
    footerNames: 'Fayaz & Muskan',
    footerLine: '14 & 15 December 2026',
    musicPlay: 'Play music',
    musicPause: 'Pause music',
  },
};

export const mapEmbedUrl = (e: InviteEvent) => `https://maps.google.com/maps?q=${e.mapLat},${e.mapLng}&z=16&output=embed`;
