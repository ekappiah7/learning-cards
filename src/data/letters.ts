import type { PictureName } from '../components/pictures';
import type { ByLevel } from './areas';

// Letters content. Each letter has a word and picture, shown in "Meet the
// letters" and said as "A is for apple."

export const LETTERS: Record<string, { word: string; picture: PictureName }> = {
  a: { word: 'apple', picture: 'apple' }, b: { word: 'ball', picture: 'ball' }, c: { word: 'cat', picture: 'cat' },
  d: { word: 'dog', picture: 'dog' }, e: { word: 'egg', picture: 'egg' }, f: { word: 'fish', picture: 'fish' },
  g: { word: 'gift', picture: 'gift' }, h: { word: 'hat', picture: 'hat' }, i: { word: 'insect', picture: 'bug' },
  j: { word: 'jam', picture: 'jam' }, k: { word: 'key', picture: 'key' }, l: { word: 'leaf', picture: 'leaf' },
  m: { word: 'moon', picture: 'moon' }, n: { word: 'nest', picture: 'nest' }, o: { word: 'orange', picture: 'orange' },
  p: { word: 'pig', picture: 'pig' }, q: { word: 'queen', picture: 'queen' }, r: { word: 'rocket', picture: 'rocket' },
  s: { word: 'sun', picture: 'sun' }, t: { word: 'tree', picture: 'tree' }, u: { word: 'umbrella', picture: 'umbrella' },
  v: { word: 'van', picture: 'van' }, w: { word: 'worm', picture: 'worm' }, x: { word: 'box', picture: 'box' },
  y: { word: 'yo-yo', picture: 'yoyo' }, z: { word: 'zigzag', picture: 'zigzag' },
};

export const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

// The line said for a letter, as two clips: its name, then "is for apple."
// (x is the only letter that is not at the start of its word.)
export const letterName = (l: string) => l.toUpperCase();
export const letterIsFor = (l: string) => `is ${l === 'x' ? 'in' : 'for'} ${LETTERS[l].word}.`;

// Letters are taught in small sets, in a common phonics order, so the first
// sets already make words (sat, pin, tap).
export const LETTER_SETS: string[][] = [
  ['s', 'a', 't', 'p', 'i', 'n'],
  ['m', 'd', 'g', 'o', 'c', 'k'],
  ['e', 'u', 'r', 'h', 'b', 'f'],
  ['l', 'j', 'v', 'w', 'x', 'y'],
  ['z', 'q', 's', 'a', 'm', 'e'],
];

// Find the letter: which letters can be asked, and how many to choose from.
export const FIND_LETTER_POOL: ByLevel<string[]> = {
  1: 'satpinmd'.split(''),
  2: 'satpinmdgocekurhbfl'.split(''),
  3: ALPHABET.filter(l => l !== 'q' && l !== 'x'),
};
export const LETTER_CHOICES: ByLevel<number> = { 1: 2, 2: 3, 3: 4 };

// ABC order: how far through the alphabet, and whether "before" is asked.
export const ABC_ORDER: ByLevel<{ upTo: string; before: boolean }> = {
  1: { upTo: 'h', before: false },
  2: { upTo: 'z', before: false },
  3: { upTo: 'z', before: true },
};

// Letters that look alike, offered together on the Harder level.
export const LOOK_ALIKE: Record<string, string[]> = {
  b: ['d', 'p'], d: ['b', 'q'], p: ['q', 'b'], q: ['p', 'd'], m: ['n', 'w'], n: ['m', 'u'], u: ['n', 'v'],
  i: ['l', 'j'], l: ['i', 't'], f: ['t', 'l'], t: ['f', 'l'], v: ['w', 'u'], w: ['v', 'm'], a: ['o', 'e'], e: ['a', 'c'],
};
