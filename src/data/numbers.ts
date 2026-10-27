import type { ByLevel } from './areas';

// Numbers content. Each setting has an Easy (1), Medium (2) and Harder (3)
// value; the parent corner picks which one is used.

// Count the dots: how many dots can appear on a card.
export const COUNT: ByLevel<{ min: number; max: number }> = {
  1: { min: 1, max: 5 },
  2: { min: 1, max: 10 },
  3: { min: 1, max: 10 },
};

// More or fewer: group sizes, and the smallest gap between the two groups.
export const COMPARE: ByLevel<{ min: number; max: number; minGap: number }> = {
  1: { min: 1, max: 6, minGap: 3 },
  2: { min: 1, max: 10, minGap: 1 },
  3: { min: 1, max: 10, minGap: 1 },
};

// Number line hop: the numbers shown on the line.
export const NUMBER_LINE: ByLevel<{ min: number; max: number }> = {
  1: { min: 0, max: 10 },
  2: { min: 0, max: 10 },
  3: { min: 0, max: 20 },
};

// Adding: both parts are at least 1, and the total is at most this.
export const ADD: ByLevel<{ maxTotal: number }> = {
  1: { maxTotal: 5 },
  2: { maxTotal: 10 },
  3: { maxTotal: 10 },
};

// How many number tiles to choose from.
export const NUMBER_CHOICES: ByLevel<number> = { 1: 2, 2: 3, 3: 4 };
