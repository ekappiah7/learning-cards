// Reading content. Edit these lists to add or change words and sentences.
// The first half is used by the Letters and Stories areas too.
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

// ---------- Words area ----------

// Three-letter words with a picture each. Used by Build the word, Missing
// sound, Read and match and Rhyme time. Every word needs a picture name
// from src/components/pictures.tsx.
export const PICTURE_WORDS: PictureName[] = [
  'cat', 'hat', 'bat', 'mat', 'rat', 'van', 'man', 'fan', 'pan', 'can', 'map', 'cap', 'bag', 'jam', 'ham',
  'bed', 'pen', 'hen', 'net', 'jet', 'web', 'leg', 'ten',
  'pin', 'bin', 'pig', 'wig', 'lid', 'six',
  'dog', 'log', 'fox', 'box', 'pot', 'mop', 'top',
  'sun', 'bun', 'bus', 'bug', 'mug', 'rug', 'jug', 'cup', 'nut', 'hut', 'tub', 'mud',
];

// Build the word: how many extra letters are mixed in.
export const BUILD_EXTRA_LETTERS: ByLevel<number> = { 1: 0, 2: 1, 3: 2 };

// Missing sound: which position is blanked (0 first, 1 middle, 2 last).
export const MISSING_POSITIONS: ByLevel<number[]> = { 1: [0], 2: [0, 1], 3: [0, 1, 2] };

// Read and match: number of pictures to choose from.
export const READ_MATCH_CHOICES: ByLevel<number> = { 1: 2, 2: 3, 3: 4 };

// Rhyme time: groups of pictured words that rhyme.
export const RHYME_GROUPS: PictureName[][] = [
  ['cat', 'hat', 'bat', 'mat', 'rat'],
  ['van', 'man', 'fan', 'pan', 'can'],
  ['map', 'cap'],
  ['jam', 'ham'],
  ['pen', 'hen', 'ten'],
  ['net', 'jet'],
  ['pin', 'bin'],
  ['pig', 'wig'],
  ['dog', 'log', 'frog'],
  ['fox', 'box'],
  ['mop', 'top'],
  ['sun', 'bun'],
  ['bug', 'mug', 'rug', 'jug'],
  ['nut', 'hut'],
  ['car', 'star'],
  ['house', 'mouse'],
];

// Word families: an ending, and first letters that make real words with it.
export const WORD_FAMILIES: { ending: string; starts: string[] }[] = [
  { ending: 'at', starts: ['c', 'h', 'b', 'm', 'r', 's'] },
  { ending: 'an', starts: ['v', 'm', 'f', 'p', 'c', 'r'] },
  { ending: 'ap', starts: ['m', 'c', 't', 'n'] },
  { ending: 'en', starts: ['p', 'h', 't', 'm'] },
  { ending: 'et', starts: ['n', 'j', 'w', 'p', 'v'] },
  { ending: 'in', starts: ['p', 'b', 't', 'w', 'f'] },
  { ending: 'ig', starts: ['p', 'w', 'd', 'b'] },
  { ending: 'og', starts: ['d', 'l', 'f', 'j'] },
  { ending: 'op', starts: ['m', 't', 'h', 'p'] },
  { ending: 'ot', starts: ['p', 'h', 'd', 'c'] },
  { ending: 'ug', starts: ['b', 'm', 'r', 'j', 'h'] },
  { ending: 'un', starts: ['s', 'b', 'r', 'f'] },
];
export const FAMILY_WORDS_PER_CARD = 4;

// Tricky words: common words to know by sight. Each level adds more.
export const TRICKY_WORDS: ByLevel<string[]> = {
  1: ['I', 'a', 'the', 'to', 'no', 'go', 'is', 'in', 'it', 'on', 'at', 'and'],
  2: ['he', 'she', 'we', 'me', 'be', 'my', 'you', 'was', 'see', 'can', 'like', 'look'],
  3: ['they', 'said', 'are', 'come', 'here', 'this', 'have', 'with', 'for', 'play', 'went', 'mum', 'dad'],
};
export const TRICKY_CHOICES: ByLevel<number> = { 1: 3, 2: 3, 3: 4 };

// Build the sentence: longest sentence (in words) at each level.
export const SENTENCE_MAX_WORDS: ByLevel<number> = { 1: 4, 2: 5, 3: 7 };
