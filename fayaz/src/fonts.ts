import {continueRender, delayRender} from 'remotion';
import {loadFont as loadGreatVibes} from '@remotion/google-fonts/GreatVibes';
import {loadFont as loadCormorant} from '@remotion/google-fonts/CormorantGaramond';
import {loadFont as loadNastaliq} from '@remotion/google-fonts/NotoNastaliqUrdu';
import {loadFont as loadAmiri} from '@remotion/google-fonts/Amiri';

const loads = [
  loadGreatVibes('normal', {weights: ['400'], subsets: ['latin']}),
  loadCormorant('normal', {weights: ['400', '500', '600', '700'], subsets: ['latin']}),
  loadCormorant('italic', {weights: ['400', '500', '600'], subsets: ['latin']}),
  loadNastaliq('normal', {weights: ['400', '600'], subsets: ['arabic', 'latin']}),
  loadAmiri('normal', {weights: ['400', '700'], subsets: ['arabic']}),
];

// Block rendering until every font face is really usable.
const handle = delayRender('Loading fonts');
Promise.all(loads.map((l) => l.waitUntilDone()))
  .then(() => document.fonts.ready)
  .then(() => continueRender(handle))
  .catch((err) => {
    console.error('Font loading failed', err);
    continueRender(handle);
  });
