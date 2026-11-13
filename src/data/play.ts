import type { ByLevel, ModuleColor } from './areas';
import type { PictureName } from '../components/pictures';
import type { ShapeKind } from './thinking';

// Play content.

// Memory match: one board per card, easiest first. "numbers" boards use
// numerals, "words" boards use a picture with its word.
export const MEMORY_BOARDS: ByLevel<{ pairs: number; kind: 'numbers' | 'words' }[]> = {
  1: [{ pairs: 2, kind: 'numbers' }, { pairs: 3, kind: 'words' }, { pairs: 4, kind: 'words' }],
  2: [{ pairs: 3, kind: 'numbers' }, { pairs: 4, kind: 'words' }, { pairs: 6, kind: 'words' }],
  3: [{ pairs: 4, kind: 'numbers' }, { pairs: 6, kind: 'words' }, { pairs: 6, kind: 'words' }],
};

export const MEMORY_WORDS: { word: string; picture: PictureName }[] = [
  { word: 'cat', picture: 'cat' }, { word: 'dog', picture: 'dog' }, { word: 'sun', picture: 'sun' },
  { word: 'bus', picture: 'bus' }, { word: 'fish', picture: 'fish' }, { word: 'moon', picture: 'moon' },
  { word: 'star', picture: 'star' }, { word: 'cake', picture: 'cake' }, { word: 'key', picture: 'key' },
  { word: 'tent', picture: 'tent' }, { word: 'car', picture: 'car' }, { word: 'egg', picture: 'egg' },
];

// Copy the colours: how long each sequence is, one card each.
export const SIMON_LENGTHS: ByLevel<number[]> = {
  1: [2, 2, 3, 3, 3, 4],
  2: [2, 3, 3, 4, 4, 5],
  3: [3, 4, 4, 5, 5, 6],
};

export const SIMON_PADS: { color: ModuleColor; name: string }[] = [
  { color: 6, name: 'red' },
  { color: 5, name: 'blue' },
  { color: 4, name: 'green' },
  { color: 8, name: 'orange' },
];

// Draw and stamp: pen colours and the stamps on offer.
export const DRAW_COLOURS: ModuleColor[] = [6, 8, 2, 4, 5, 3, 7];
export const STAMPS: ShapeKind[] = ['star', 'circle', 'square', 'triangle'];

// Pop the letters: balloons to pop on each card, and letters used.
export const POP_TARGETS = 5;
export const POP_LETTERS: ByLevel<string[]> = {
  1: 'satpin'.split(''),
  2: 'satpinmdgock'.split(''),
  3: 'satpinmdgockeurhbfl'.split(''),
};

// Music maker: the notes of the bars (MIDI numbers, C major) and a tune
// the app can play for the child to watch, as bar numbers.
export const PIANO_NOTES = [60, 62, 64, 65, 67, 69, 71, 72];
export const PIANO_TUNE = [0, 0, 4, 4, 5, 5, 4, -1, 3, 3, 2, 2, 1, 1, 0];
