import type { ByLevel, ModuleColor } from './areas';

// Shapes content: the shapes children learn to name, with their sides and
// corners, and pictures made of shapes for the shape hunt.

export type GeoKind =
  | 'circle' | 'square' | 'triangle' | 'rectangle' | 'oval' | 'star' | 'heart' | 'diamond' | 'pentagon' | 'hexagon' | 'semicircle';

// Shapes with straight sides list their corners (in a 100 x 100 box), so
// sides and corners can be counted one by one. Others have a path.
export const GEO: Record<GeoKind, { name: string; plural: string; points?: [number, number][]; path?: string }> = {
  circle: { name: 'circle', plural: 'circles', path: 'M50 6a44 44 0 1 0 0.01 0Z' },
  oval: { name: 'oval', plural: 'ovals', path: 'M50 22a46 28 0 1 0 0.01 0Z' },
  semicircle: { name: 'semicircle', plural: 'semicircles', path: 'M6 70A44 44 0 0 1 94 70Z' },
  heart: { name: 'heart', plural: 'hearts', path: 'M50 90C8 60 6 30 27 20C40 14 48 23 50 31C52 23 60 14 73 20C94 30 92 60 50 90Z' },
  star: { name: 'star', plural: 'stars', path: 'M50 5l13.2 27.8 30.3 3.6-22.3 20.9 5.7 30.1L50 72.6 23.1 87.4l5.7-30.1L6.5 36.4l30.3-3.6Z' },
  triangle: { name: 'triangle', plural: 'triangles', points: [[50, 10], [92, 86], [8, 86]] },
  square: { name: 'square', plural: 'squares', points: [[14, 14], [86, 14], [86, 86], [14, 86]] },
  rectangle: { name: 'rectangle', plural: 'rectangles', points: [[5, 26], [95, 26], [95, 74], [5, 74]] },
  diamond: { name: 'diamond', plural: 'diamonds', points: [[50, 5], [84, 50], [50, 95], [16, 50]] },
  pentagon: { name: 'pentagon', plural: 'pentagons', points: [[50, 8], [92, 39], [76, 90], [24, 90], [8, 39]] },
  hexagon: { name: 'hexagon', plural: 'hexagons', points: [[94, 50], [72, 88], [28, 88], [6, 50], [28, 12], [72, 12]] },
};

// Name the shape: which shapes are used at each level.
export const SHAPE_NAMES: ByLevel<GeoKind[]> = {
  1: ['circle', 'square', 'triangle', 'star', 'heart'],
  2: ['circle', 'square', 'triangle', 'star', 'heart', 'rectangle', 'oval', 'diamond'],
  3: ['circle', 'square', 'triangle', 'star', 'heart', 'rectangle', 'oval', 'diamond', 'pentagon', 'hexagon', 'semicircle'],
};
export const SHAPE_CHOICES: ByLevel<number> = { 1: 2, 2: 3, 3: 4 };

// Sides and corners: shapes with straight sides, by level.
export const SIDES_SHAPES: ByLevel<GeoKind[]> = {
  1: ['triangle', 'square', 'rectangle'],
  2: ['triangle', 'square', 'rectangle', 'diamond', 'pentagon'],
  3: ['triangle', 'square', 'rectangle', 'diamond', 'pentagon', 'hexagon'],
};

// Shape hunt: pictures drawn from circles, squares, rectangles and
// triangles on a 200 x 150 board. x, y is the top left corner; a triangle
// points up unless turned.
export type HuntShape = { k: 'circle' | 'square' | 'rectangle' | 'triangle'; x: number; y: number; w: number; h: number; c: ModuleColor; turn?: number };
export const HUNT_PICTURES: { name: string; shapes: HuntShape[] }[] = [
  {
    name: 'house',
    shapes: [
      { k: 'circle', x: 156, y: 8, w: 32, h: 32, c: 8 },
      { k: 'square', x: 55, y: 62, w: 84, h: 84, c: 5 },
      { k: 'triangle', x: 43, y: 12, w: 108, h: 50, c: 6 },
      { k: 'square', x: 64, y: 74, w: 22, h: 22, c: 2 },
      { k: 'square', x: 108, y: 74, w: 22, h: 22, c: 2 },
      { k: 'rectangle', x: 86, y: 104, w: 22, h: 42, c: 3 },
      { k: 'circle', x: 10, y: 96, w: 44, h: 44, c: 4 },
      { k: 'rectangle', x: 27, y: 120, w: 10, h: 26, c: 8 },
    ],
  },
  {
    name: 'train',
    shapes: [
      { k: 'circle', x: 40, y: 6, w: 16, h: 16, c: 3 },
      { k: 'circle', x: 58, y: 0, w: 22, h: 22, c: 3 },
      { k: 'rectangle', x: 30, y: 28, w: 16, h: 30, c: 6 },
      { k: 'rectangle', x: 14, y: 58, w: 96, h: 50, c: 4 },
      { k: 'square', x: 110, y: 40, w: 68, h: 68, c: 5 },
      { k: 'square', x: 126, y: 52, w: 30, h: 30, c: 2 },
      { k: 'triangle', x: 0, y: 84, w: 28, h: 24, c: 8, turn: -90 },
      { k: 'circle', x: 22, y: 100, w: 36, h: 36, c: 7 },
      { k: 'circle', x: 68, y: 100, w: 36, h: 36, c: 7 },
      { k: 'circle', x: 126, y: 96, w: 44, h: 44, c: 7 },
    ],
  },
  {
    name: 'rocket',
    shapes: [
      { k: 'circle', x: 8, y: 10, w: 34, h: 34, c: 8 },
      { k: 'circle', x: 160, y: 30, w: 14, h: 14, c: 2 },
      { k: 'triangle', x: 70, y: 0, w: 60, h: 44, c: 6 },
      { k: 'rectangle', x: 74, y: 44, w: 52, h: 72, c: 5 },
      { k: 'circle', x: 86, y: 54, w: 28, h: 28, c: 2 },
      { k: 'triangle', x: 44, y: 78, w: 30, h: 38, c: 3 },
      { k: 'triangle', x: 126, y: 78, w: 30, h: 38, c: 3 },
      { k: 'triangle', x: 82, y: 116, w: 36, h: 32, c: 8, turn: 180 },
      { k: 'square', x: 160, y: 96, w: 26, h: 26, c: 4 },
    ],
  },
  {
    name: 'robot',
    shapes: [
      { k: 'triangle', x: 90, y: 0, w: 20, h: 16, c: 6 },
      { k: 'square', x: 72, y: 16, w: 56, h: 56, c: 5 },
      { k: 'circle', x: 82, y: 28, w: 14, h: 14, c: 8 },
      { k: 'circle', x: 104, y: 28, w: 14, h: 14, c: 8 },
      { k: 'rectangle', x: 86, y: 52, w: 28, h: 10, c: 6 },
      { k: 'rectangle', x: 62, y: 74, w: 76, h: 46, c: 3 },
      { k: 'rectangle', x: 38, y: 76, w: 22, h: 12, c: 4 },
      { k: 'rectangle', x: 140, y: 76, w: 22, h: 12, c: 4 },
      { k: 'circle', x: 78, y: 88, w: 16, h: 16, c: 2 },
      { k: 'circle', x: 106, y: 88, w: 16, h: 16, c: 2 },
      { k: 'square', x: 70, y: 122, w: 24, h: 24, c: 7 },
      { k: 'square', x: 106, y: 122, w: 24, h: 24, c: 7 },
    ],
  },
  {
    name: 'boat',
    shapes: [
      { k: 'circle', x: 160, y: 6, w: 30, h: 30, c: 8 },
      { k: 'rectangle', x: 96, y: 14, w: 6, h: 84, c: 3 },
      { k: 'triangle', x: 102, y: 20, w: 56, h: 70, c: 6 },
      { k: 'triangle', x: 44, y: 40, w: 52, h: 50, c: 7 },
      { k: 'rectangle', x: 30, y: 98, w: 140, h: 30, c: 5 },
      { k: 'circle', x: 52, y: 106, w: 14, h: 14, c: 2 },
      { k: 'circle', x: 93, y: 106, w: 14, h: 14, c: 2 },
      { k: 'circle', x: 134, y: 106, w: 14, h: 14, c: 2 },
      { k: 'square', x: 6, y: 20, w: 22, h: 22, c: 4 },
    ],
  },
];

// Spoken lines.
export const shapeLine = {
  find: (k: GeoKind) => `Find the ${GEO[k].name}.`,
  sides: (k: GeoKind) => {
    const n = GEO[k].points?.length ?? 0;
    return `A ${GEO[k].name} has ${n} sides.`;
  },
  corners: (k: GeoKind) => {
    const n = GEO[k].points?.length ?? 0;
    return `A ${GEO[k].name} has ${n} corners.`;
  },
  tapAll: (k: GeoKind) => `Tap all the ${GEO[k].plural}.`,
};
