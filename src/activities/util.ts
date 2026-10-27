import { ROUND_SIZE } from '../components/ActivityFrame';

export function shuffle<T>(a: T[]): T[] {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

// A random round of up to ROUND_SIZE items, optionally ordered easiest first.
export function pickRound<T>(pool: T[], difficulty?: (item: T) => number): T[] {
  const round = shuffle(pool).slice(0, ROUND_SIZE);
  return difficulty ? round.sort((a, b) => difficulty(a) - difficulty(b)) : round;
}
