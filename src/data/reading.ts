// Reading content. Edit these lists to add or change words and sentences.
import type { PictureName } from '../components/pictures';
import type { ByLevel } from './areas';

// Syllables are split with |, so "ba|na|na" claps three times.
export const CLAP_WORDS: string[] = [
  'cat', 'dog', 'sun', 'fish', 'ball', 'frog',
  'ap|ple', 'ti|ger', 'rab|bit', 'mon|key', 'pen|cil', 'tur|tle',
  'ba|na|na', 'el|e|phant', 'but|ter|fly', 'di|no|saur', 'ko|a|la', 'pi|an|o',
  'wa|ter|mel|on', 'cat|er|pil|lar', 'al|li|ga|tor', 'hel|i|cop|ter',
];

// Each sentence claps once per word.
export const CLAP_SENTENCES: string[] = [
  'The girl is ill.', 'I am ill.', 'The boy is sad.', 'The sun is hot.', 'I see a cat.', 'The dog can run.',
  'Mum has a hat.', 'Dad is in bed.', 'The bus is red.', 'A fish can swim.', 'The cup is big.', 'Look at the frog.',
  'The girl is in bed.', 'My cat is fat.', 'We like to play.', 'The pig is in the mud.', 'She has a red ball.',
  'The boy can kick the ball.', 'I can see the big tree.', 'The girl is ill and sad.', 'Mum gave the girl a drink.',
];

// How each letter sounds when tapped or blended. Speech voices read letters
// by name, so these are spellings that make the voice say the sound.
// Listen on your tablet and adjust any that sound wrong.
export const LETTER_SOUNDS: Record<string, string> = {
  a: 'ah', b: 'buh', c: 'kuh', d: 'duh', e: 'eh', f: 'fff', g: 'guh', h: 'huh', i: 'ih',
  j: 'juh', k: 'kuh', l: 'lll', m: 'mmm', n: 'nnn', o: 'aw', p: 'puh', q: 'kwuh', r: 'rrr',
  s: 'sss', t: 'tuh', u: 'uh', v: 'vvv', w: 'wuh', x: 'ks', y: 'yuh', z: 'zzz',
};

// Sound it out: three-letter words, one sound per letter. A picture is
// shown after blending when one exists.
export const CVC_WORDS: { word: string; picture?: PictureName }[] = [
  { word: 'cat', picture: 'cat' }, { word: 'map', picture: 'map' }, { word: 'fan', picture: 'fan' },
  { word: 'rat', picture: 'rat' }, { word: 'van', picture: 'van' }, { word: 'ham', picture: 'ham' },
  { word: 'bed', picture: 'bed' }, { word: 'pen', picture: 'pen' }, { word: 'pin', picture: 'pin' },
  { word: 'dog', picture: 'dog' }, { word: 'pot', picture: 'pot' }, { word: 'sun', picture: 'sun' },
  { word: 'bus', picture: 'bus' }, { word: 'bug', picture: 'bug' }, { word: 'nut', picture: 'nut' },
  { word: 'hen' }, { word: 'net' }, { word: 'leg' }, { word: 'pig' }, { word: 'lid' }, { word: 'sit' },
  { word: 'log' }, { word: 'hot' }, { word: 'top' }, { word: 'cup' }, { word: 'mud' }, { word: 'run' },
];

// First sound: each word is said aloud with its picture, and the child
// picks the letter it starts with.
export const FIRST_SOUND_WORDS: { word: string; picture: PictureName }[] = [
  { word: 'apple', picture: 'apple' }, { word: 'bus', picture: 'bus' }, { word: 'bed', picture: 'bed' },
  { word: 'book', picture: 'book' }, { word: 'cat', picture: 'cat' }, { word: 'cake', picture: 'cake' },
  { word: 'car', picture: 'car' }, { word: 'dog', picture: 'dog' }, { word: 'drum', picture: 'drum' },
  { word: 'egg', picture: 'egg' }, { word: 'fish', picture: 'fish' }, { word: 'fan', picture: 'fan' },
  { word: 'gift', picture: 'gift' }, { word: 'guitar', picture: 'guitar' }, { word: 'house', picture: 'house' },
  { word: 'heart', picture: 'heart' }, { word: 'key', picture: 'key' }, { word: 'lamp', picture: 'lamp' },
  { word: 'leaf', picture: 'leaf' }, { word: 'lock', picture: 'lock' }, { word: 'moon', picture: 'moon' },
  { word: 'map', picture: 'map' }, { word: 'mouse', picture: 'mouse' }, { word: 'nut', picture: 'nut' },
  { word: 'pen', picture: 'pen' }, { word: 'pizza', picture: 'pizza' }, { word: 'piano', picture: 'piano' },
  { word: 'rabbit', picture: 'rabbit' }, { word: 'rocket', picture: 'rocket' }, { word: 'sun', picture: 'sun' },
  { word: 'star', picture: 'star' }, { word: 'tent', picture: 'tent' }, { word: 'train', picture: 'train' },
  { word: 'table', picture: 'table' }, { word: 'umbrella', picture: 'umbrella' }, { word: 'van', picture: 'van' },
  { word: 'watch', picture: 'watch' }, { word: 'worm', picture: 'worm' },
];

// Difficulty settings for each level: Easy (1), Medium (2), Harder (3).
export const CLAP_MAX_SYLLABLES: ByLevel<number> = { 1: 2, 2: 4, 3: 4 };
export const CLAP_MAX_WORDS: ByLevel<number> = { 1: 4, 2: 99, 3: 99 };
export const SOUND_IT_OUT_PICTURED_ONLY: ByLevel<boolean> = { 1: true, 2: false, 3: false };
export const FIRST_SOUND_CHOICES: ByLevel<number> = { 1: 2, 2: 3, 3: 4 };

// Letters offered as wrong choices in First sound.
// k is left out because it sounds the same as c.
export const FIRST_SOUND_LETTERS = 'abcdefghlmnprstuvw'.split('');
