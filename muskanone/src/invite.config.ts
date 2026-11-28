// All text on the pastel-sky storybook invite comes from here (design brief: DESIGN-BRIEF.md).
// Content is from the printed card (groom's family). Spelling is final: "Ruby Garden", "Venkat Narsimha Garden",
// "Rajab-ul-Murajjab", "Mrs. Late Abdul Rahmath Sahab", "Pattedar (Konayapally)".
// ⚠ Every Urdu and Arabic line was transcribed from the card photo: have a fluent reader check them before sharing.

export type InviteEvent = {
  key: 'nikah' | 'valima';
  title: string;
  /** ⚠ check */
  urdu: string;
  day: string;
  date: string;
  hijri: string;
  time: string;
  note: string;
  blurb: string;
  venue: string;
  address: string;
  startISO: string;
  /** Exact Google Maps pin (from the family's shared links). */
  mapLat: number;
  mapLng: number;
  /** Full Google Maps place URL opened by "Open in Maps". */
  mapPlaceUrl: string;
};

/** Change when the Netlify site for branch Muskanone is created under another name. */
export const SITE_URL = 'https://muskanone.netlify.app/';

export const C = {
  bismillahAr: 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ', // ⚠ check
  bismillahEn: 'In the name of Allah, the Most Beneficent, the Most Merciful',

  /** Groom first on this card. */
  firstShort: 'Fayaz',
  firstFull: 'Mohammed Fayaz',
  secondShort: 'Muskan',
  secondFull: 'Muskan Khanam',
  monogram: ['F', 'M'] as [string, string],

  heroLabel: 'NIKAH & VALIMA',
  saveTheDate: 'Save the Date',
  scratchReveal: '14 · 15 December 2026',
  scratchSub: 'Nikah & Valima · Insha Allah',

  blessingsLabel: 'With the Blessings of:',
  blessings: 'Late Mrs. & Mr. Abdul Khader Sahab Pattedar (Konayapally)',
  host: 'Mrs. Late Abdul Rahmath Sahab',
  hostLine: 'Solicit your gracious presence on the auspicious occasion of the Nikah & Valima Ceremony of her son',
  with: 'with',
  secondParents: 'Daughter of Mrs. & Mr. Khamru Jama Khan Sahab',

  /** The card's Urdu page, line by line. ⚠ every line: fluent reader to check. */
  urdu: {
    blessings: 'دعاؤں کے سائے میں: عبدالقادر صاحب و اہلیہ مرحومین پٹے دار (کونیہ پلی)',
    first: 'محمد فیاض سلمہ',
    with: 'ہمراہ',
    second: 'مسکان خانم',
    secondParents: 'دختر نیک اختر جناب قمرو جامع خان صاحب و اہلیہ',
    occasion: 'ولیمہ مسنونہ',
    welcome: 'آپ کی تشریف آوری و شرفِ ہم طعامی موجبِ تشکر',
    hostLabel: 'آرزومند',
    host: 'اہلیہ عبدالرحمت صاحب مرحوم',
    nearDear: 'المنتظرین: عزیز و اقارب',
  },

  /** RSVP replies open WhatsApp to this number (country code, digits only). */
  rsvpWhatsApp: '919515824929',

  events: [
    {
      key: 'nikah',
      title: 'Nikah',
      urdu: 'نکاح مسنون',
      day: 'Monday',
      date: '14th December 2026',
      // Not printed on the card; same as the family's other invites. Confirm before sharing.
      hijri: '4 Rajab 1448 AH',
      time: '10:00 AM',
      note: 'Lunch follows',
      blurb: 'The Nikah, followed by lunch',
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
      title: 'Valima Ceremony',
      urdu: 'ولیمہ مسنونہ',
      day: 'Tuesday',
      date: '15th December 2026',
      hijri: '5th Rajab-ul-Murajjab 1448 Hijri',
      time: '8:00 PM',
      note: 'Dinner',
      blurb: 'Valima dinner',
      venue: 'Venkat Narsimha Garden',
      address: 'Shad Nagar Road, Amangal',
      startISO: '2026-12-15T20:00:00+05:30',
      mapLat: 16.8444037,
      mapLng: 78.5197176,
      mapPlaceUrl:
        'https://www.google.com/maps/place/Venkata+Narasimha+Gardens+And+Function+Hall/@16.8444186,78.5193368,228m/data=!3m1!1e3!4m6!3m5!1s0x3bca51a091a8af1f:0x8ca710c8fb17b52a!8m2!3d16.8444037!4d78.5197176!16s%2Fg%2F11fzb17fcg',
    },
  ] as InviteEvent[],

  warmRegards: 'Warm Regards',
  compliments: 'With Best Compliments From:',
  nearDear: 'Near & Dear',
  music: '/music.mp3',

  ui: {
    title: 'Nikah & Valima · Mohammed Fayaz',
    ogDescription: '14 & 15 December 2026 · Nagarkurnool & Amangal',
    tapToEnter: 'TAP TO OPEN',
    curtainLabel: 'Open the invitation',
    scratchLabel: 'SCRATCH TO REVEAL',
    scratchAria: 'Scratch to reveal the wedding dates. Press Enter to reveal.',
    venueLabel: 'Venue :-',
    countdownKicker: 'COUNTING DOWN',
    /** "|" splits the title over two script lines (one line is too wide for a phone). */
    countdownTitle: 'Counting down|to the Nikah',
    countdownUntil: 'Until {date} · The {event}',
    units: ['DAYS', 'HOURS', 'MINS', 'SECS'],
    alhamdulillah: 'Alhamdulillah — thank you for your duas',
    rsvpKicker: 'KINDLY RESPOND',
    rsvpTitle: 'Will you join us?',
    rsvpName: 'YOUR NAME',
    rsvpNamePh: 'Enter your full name',
    rsvpYes: 'In sha Allah, I will attend',
    rsvpNo: "Sorry, can't make it",
    rsvpSend: 'SEND ON WHATSAPP',
    rsvpNeedName: 'Please enter your name',
    rsvpNeedChoice: 'Please choose one',
    rsvpMsgYes: 'Assalamu Alaikum, In sha Allah {name} will attend the Nikah & Valima of Mohammed Fayaz.',
    rsvpMsgNo: "Assalamu Alaikum, sorry {name} can't make it. Duas and best wishes for Mohammed Fayaz.",
    venuesKicker: 'FIND YOUR WAY',
    venuesTitle: 'The Venues',
    openMaps: 'OPEN IN MAPS',
    viewAgain: '↺ View again',
    musicPlay: 'Play music',
    musicPause: 'Pause music',
  },
};

/** Google Maps preview of the exact pin (shown on the venues page; a tap opens the full map). */
export const mapEmbedUrl = (e: InviteEvent) => `https://maps.google.com/maps?q=${e.mapLat},${e.mapLng}&z=16&output=embed`;

/**
 * Phone tester (shared/autotest). true: the 🧪 Test button shows, but only on links with ?test
 * (https://muskanone.netlify.app/?test); guests on the normal link never see it. false: the tester is not loaded at all.
 */
export const TEST_MODE = true;
