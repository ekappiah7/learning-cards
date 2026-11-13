import type { ByLevel, ModuleColor } from './areas';
import type { PictureName } from '../components/pictures';

// Thinking content. Shapes and colours are drawn by the app, so they only
// need a name to be spoken.

export type ShapeKind = 'circle' | 'square' | 'triangle' | 'star';

export const SHAPES: { kind: ShapeKind; name: string }[] = [
  { kind: 'circle', name: 'circle' },
  { kind: 'square', name: 'square' },
  { kind: 'triangle', name: 'triangle' },
  { kind: 'star', name: 'star' },
];

// Module colours with the names a child would use for them.
export const COLOURS: { color: ModuleColor; name: string }[] = [
  { color: 6, name: 'red' },
  { color: 5, name: 'blue' },
  { color: 8, name: 'orange' },
  { color: 3, name: 'purple' },
  { color: 4, name: 'green' },
  { color: 7, name: 'pink' },
];

// What comes next: the repeating units for each level, easiest first. Each
// letter stands for a different shape in a different colour.
export const PATTERNS: ByLevel<string[]> = {
  1: ['AB', 'AB', 'AB', 'AB', 'AAB', 'ABB'],
  2: ['AB', 'AB', 'AAB', 'ABB', 'ABC', 'AABB'],
  3: ['AAB', 'ABB', 'ABC', 'AABB', 'ABC', 'ABBC'],
};

// Odd one out: what makes the odd one different on each card, in order.
export const ODD_ONE_OUT: ByLevel<('colour' | 'shape' | 'size')[]> = {
  1: ['colour', 'shape', 'colour', 'shape', 'colour', 'shape'],
  2: ['colour', 'shape', 'colour', 'shape', 'size', 'size'],
  3: ['colour', 'shape', 'size', 'colour', 'shape', 'size'],
};
export const ODD_ONE_OUT_ITEMS: ByLevel<number> = { 1: 3, 2: 4, 3: 5 };

// Sort them: one card per way of sorting, with this many shapes each.
export const SORT_BY: ('colour' | 'shape' | 'size')[] = ['colour', 'shape', 'size'];
export const SORT_ITEMS: ByLevel<number> = { 1: 4, 2: 6, 3: 8 };

// Small to big: how many shapes to put in order.
export const SIZE_ORDER_ITEMS: ByLevel<number> = { 1: 3, 2: 4, 3: 5 };

// Which one belongs: each question has pictures that fit it. Wrong choices
// are taken from the other groups, leaving out any in notWith.
export const GROUPS: { ask: string; items: PictureName[]; notWith?: PictureName[] }[] = [
  { ask: 'Which one is an animal?', items: ['cat', 'dog', 'pig', 'hen', 'fox', 'frog', 'fish', 'rabbit'] },
  { ask: 'Which one can you eat?', items: ['apple', 'bun', 'cake', 'egg', 'jam', 'orange', 'pizza', 'ham'], notWith: ['fish', 'hen', 'pig', 'frog', 'rabbit'] },
  { ask: 'Which one can you ride in?', items: ['bus', 'van', 'car', 'jet', 'rocket', 'train'] },
  { ask: 'Which one can you wear?', items: ['hat', 'cap', 'wig', 'watch'] },
  { ask: 'Which one is in the sky?', items: ['sun', 'moon', 'star', 'kite'], notWith: ['jet', 'rocket'] },
];
export const BELONGS_CHOICES: ByLevel<number> = { 1: 2, 2: 3, 3: 4 };
