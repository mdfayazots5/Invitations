import {loadFont as loadGreatVibes} from '@remotion/google-fonts/GreatVibes';
import {loadFont as loadCormorant} from '@remotion/google-fonts/CormorantGaramond';
import {loadFont as loadNastaliq} from '@remotion/google-fonts/NotoNastaliqUrdu';
import {loadFont as loadAmiri} from '@remotion/google-fonts/Amiri';

const script = loadGreatVibes('normal', {weights: ['400'], subsets: ['latin']});
const serif = loadCormorant('normal', {
  weights: ['400', '500', '600', '700'],
  subsets: ['latin'],
});
loadCormorant('italic', {weights: ['400', '500', '600'], subsets: ['latin']});
const urdu = loadNastaliq('normal', {weights: ['400', '600'], subsets: ['arabic']});
const arabic = loadAmiri('normal', {weights: ['400', '700'], subsets: ['arabic']});

export const FONTS = {
  script: script.fontFamily,
  serif: serif.fontFamily,
  urdu: urdu.fontFamily,
  arabic: arabic.fontFamily,
};
