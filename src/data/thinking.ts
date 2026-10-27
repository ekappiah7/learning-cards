import type { ModuleColor } from './areas';

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

// What comes next: the repeating units, easiest first. Each letter stands
// for a different shape in a different colour.
export const PATTERNS: string[] = ['AB', 'AB', 'AAB', 'ABB', 'ABC', 'AABB'];

// Odd one out: what makes the odd one different on each card, in order.
export const ODD_ONE_OUT: ('colour' | 'shape' | 'size')[] = ['colour', 'shape', 'colour', 'shape', 'size', 'size'];
export const ODD_ONE_OUT_ITEMS = 4;

// Sort them: one card per way of sorting, with this many shapes each.
export const SORT_BY: ('colour' | 'shape' | 'size')[] = ['colour', 'shape', 'size'];
export const SORT_ITEMS = 6;
