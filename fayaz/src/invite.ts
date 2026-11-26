// Single source of truth for this invitation's content.
// The landing page (site/index.html) repeats these values by hand. Keep the two in sync.
import type {EventDetails} from './components/EventCard';

export const COUPLE = {
  groom: 'Mohammed Fayaz',
  bride: 'Muskan Khanam',
  urdu: 'محمد فیاض ہمراہ مسکان خانم',
  monogram: 'F&M',
};

export const NIKAH: EventDetails & {mapsUrl: string} = {
  title: 'Nikah',
  day: 'Monday',
  date: '14th December 2026',
  hijri: '4 Rajab 1448',
  time: '10:00 AM',
  venue: 'Ruby Gardens',
  address: 'Sripur Road, Nagarkurnool',
  mapsUrl:
    'https://www.google.com/maps/place/Ruby+Gardens+Function+Hall/@16.4784009,78.3057736,148m/data=!3m1!1e3!4m6!3m5!1s0x3bca6d005b04d0bb:0xfa99cfbe2cb503b5!8m2!3d16.4786175!4d78.3060455!16s%2Fg%2F11vr_m01zm',
};

export const VALIMA: EventDetails & {mapsUrl: string} = {
  title: 'Valima',
  day: 'Tuesday',
  date: '15th December 2026',
  hijri: '5 Rajab-ul-Murajjab 1448',
  time: 'Dinner · 8:00 PM',
  venue: 'Venkata Narasimha Gardens',
  address: 'Shad Nagar Road, Amangal',
  mapsUrl:
    'https://www.google.com/maps/place/Venkata+Narasimha+Gardens+And+Function+Hall/@16.8444186,78.5193368,228m/data=!3m1!1e3!4m6!3m5!1s0x3bca51a091a8af1f:0x8ca710c8fb17b52a!8m2!3d16.8444037!4d78.5197176!16s%2Fg%2F11fzb17fcg',
};
