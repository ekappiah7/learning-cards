// Every line the app can say. The app builds its spoken lines with these
// helpers, and scripts/voice records each phrase from allPhrases() once in
// the chosen voice. Imports use .ts extensions so the recording script can
// load this file directly with Node.
import { AREAS } from '../data/areas.ts';
import {
  CLAP_SENTENCES, CLAP_WORDS, CVC_WORDS, FIRST_SOUND_WORDS, LETTER_SOUNDS, PICTURE_WORDS, RHYME_GROUPS, TRICKY_WORDS,
  WORD_FAMILIES,
} from '../data/reading.ts';
import { ALPHABET, LETTERS, letterIsFor, letterName } from '../data/letters.ts';
import { STORIES } from '../data/stories.ts';
import { GEO, shapeLine, type GeoKind } from '../data/shapes.ts';
import { COLOURS, GROUPS, SHAPES } from '../data/thinking.ts';
import { MEMORY_WORDS, SIMON_PADS, STAMPS } from '../data/play.ts';
import { LESSONS } from '../data/lessons.ts';

// A spoken line: plain text, or parts played one after another. A name or
// letter part uses the parent's own recording when there is one.
export type Part =
  | string
  | { name: string; id: string }
  | { letter: string }
  | { by: 'jabari' | 'jamila'; say: string | Part[] }; // said by a particular character
export type Speech = string | Part[];

const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`;

// Lines built from numbers or content.
export const line = {
  claps: (n: number) => plural(n, 'clap'),
  words: (n: number) => plural(n, 'word'),
  hasStars: (n: number) => `has ${plural(n, 'star')}`,
  moreThan: (big: number, small: number) => `Yes! ${big} is more than ${small}.`,
  fewerThan: (small: number, big: number) => `Yes! ${small} is fewer than ${big}.`,
  whichHas: (ask: 'more' | 'fewer') => `Which has ${ask}?`,
  whatComes: (ask: 'after' | 'before', n: number) => `What comes ${ask} ${n}?`,
  comes: (a: number, ask: 'after' | 'before', n: number) => `${a} comes ${ask} ${n}.`,
  addQuestion: (a: number, b: number) => `${a} and ${b} make?`,
  addAnswer: (a: number, b: number, sum: number) => `${a} and ${b} make ${sum}!`,
  sortBy: (by: string) => `Sort them by ${by}`,
  binChoice: (a: string, b: string) => `${a} or ${b}?`,
  oddWhy: (why: string) => `Yes! That one is ${why}.`,
  stamp: (shape: string) => `${shape} stamp`,
  takeQuestion: (a: number, b: number) => `${a} take away ${b} is?`,
  takeAnswer: (a: number, b: number, left: number) => `${a} take away ${b} is ${left}!`,
  group: (n: number) => `Group ${n}`,
};

export const PRAISE = ['Well done!', 'Brilliant!', 'Great job!', 'You did it!', 'Super!', 'Fantastic!'];

// Fixed lines used around the app.
const FIXED = [
  'Yes!', 'Again', 'Back', 'Next', 'Home', 'Play again', 'Try again', 'Ask a grown-up', 'Add a player', 'Who is playing?',
  'Parent corner', 'Hello,', 'What shall we play?', 'Well done,', 'You got a star.', 'Coming soon!', 'Shuffle',
  'How many claps?', 'How many words?', 'All words', 'All sentences', 'Six or more words',
  'Sound it out. Tap each letter, then blend.', 'What sound does it start with?',
  'How many dots?', 'Put them together.', 'What comes next?', 'Which one is different?', 'All sorted!',
  'Find the pairs', 'Find the pairs. Turn over two cards.', 'You found all the pairs!', 'A pair!',
  'Watch the colours, then copy them.', 'Your turn!', 'You copied it!', 'Oops! Watch again.',
  'Draw and stamp. Pick a colour, then draw or stamp.', 'Undo', 'New page', 'Pen',
  'big', 'small', 'bigger', 'smaller', 'a different colour', 'a different shape',
  // Letters
  'Trace the letter', 'Use your finger to trace the letter.', 'Which letter says', 'Find the small letter', 'Find the big letter',
  'What comes after', 'What comes before', 'Tap the letter to hear its sound.',
  // Words
  'Build the word', 'What sound is missing?', 'Which word rhymes with', 'rhymes with', 'Make new words. Tap a letter.',
  'You made new words!', 'Read the word. Find the picture.', 'Find the word',
  // Stories
  'Put the words in order.', 'The end!', 'Read it with me.', 'Your turn to read.',
  // Numbers, thinking, play
  'Find the number', 'Tap from smallest to biggest.', 'Tap from biggest to smallest.', 'All in order!',
  'Pop the balloons that say', 'You popped them all!', 'Tap the bars to make music.', 'Listen to my tune.',
  'How many sides?', 'How many corners?', 'You found them all!', 'Find the shadow that fits.',
];

const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const clean = (s: string) => s.replace(/[.,!?]/g, '');

// The key a recording is stored under: case and punctuation are ignored.
export function phraseKey(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
}

// Phrase lists for the recording script, split by how slowly to say them.
export function allPhrases(): { normal: string[]; slow: string[] } {
  const normal = new Set<string>(FIXED);
  const slow = new Set<string>();
  const add = (s: string) => normal.add(s);

  PRAISE.forEach(add);
  for (const a of AREAS) {
    add(a.spoken);
    a.activities.forEach(act => add(act.spoken));
  }

  // Reading
  range(1, 4).forEach(n => add(line.claps(n)));
  range(1, 7).forEach(n => add(line.words(n)));
  for (const w of CLAP_WORDS) {
    const parts = w.split('|');
    add(parts.join(''));
    parts.forEach(p => slow.add(p));
  }
  for (const s of CLAP_SENTENCES) {
    add(s);
    s.split(' ').forEach(w => add(clean(w)));
  }
  Object.values(LETTER_SOUNDS).forEach(s => slow.add(s));
  CVC_WORDS.forEach(w => add(w.word));
  FIRST_SOUND_WORDS.forEach(w => add(w.word));

  // Letters
  for (const l of ALPHABET) {
    add(letterName(l));
    add(letterIsFor(l));
    add(LETTERS[l].word);
  }
  range(1, 5).forEach(n => add(line.group(n)));

  // Words
  PICTURE_WORDS.forEach(add);
  RHYME_GROUPS.flat().forEach(add);
  for (const f of WORD_FAMILIES) {
    slow.add(f.ending);
    f.starts.forEach(st => add(st + f.ending));
  }
  Object.values(TRICKY_WORDS).flat().forEach(add);

  // Stories
  for (const st of STORIES) {
    for (const pg of st.pages) {
      add(pg.text);
      pg.text.split(' ').forEach(w => add(clean(w)));
    }
    for (const q of st.questions) {
      add(q.ask);
      q.options.forEach(add);
    }
  }

  // Numbers
  for (const a of range(2, 10))
    for (const b of range(1, a - 1)) {
      add(line.takeQuestion(a, b));
      add(line.takeAnswer(a, b, a - b));
    }
  range(0, 20).forEach(n => add(String(n)));
  range(0, 100).forEach(n => add(line.hasStars(n)));
  (['more', 'fewer'] as const).forEach(a => add(line.whichHas(a)));
  for (const big of range(1, 10))
    for (const small of range(1, big - 1)) {
      add(line.moreThan(big, small));
      add(line.fewerThan(small, big));
    }
  for (const n of range(0, 20)) {
    if (n < 20) {
      add(line.whatComes('after', n));
      add(line.comes(n + 1, 'after', n));
    }
    if (n > 0) {
      add(line.whatComes('before', n));
      add(line.comes(n - 1, 'before', n));
    }
  }
  for (const a of range(1, 9))
    for (const b of range(1, 10 - a)) {
      add(line.addQuestion(a, b));
      add(line.addAnswer(a, b, a + b));
    }

  // Thinking
  const colourNames = COLOURS.map(c => c.name);
  const shapeNames = SHAPES.map(s => s.name);
  for (const c of colourNames) {
    add(c);
    for (const s of shapeNames) {
      add(`${c} ${s}`);
      add(`big ${c} ${s}`);
      add(`small ${c} ${s}`);
    }
  }
  shapeNames.forEach(s => add(`${s}s`));
  ['colour', 'shape', 'size'].forEach(by => add(line.sortBy(by)));
  ['bigger', 'smaller', 'a different colour', 'a different shape'].forEach(w => add(line.oddWhy(w)));
  for (const a of colourNames) for (const b of colourNames) if (a !== b) add(line.binChoice(a, b));
  for (const a of shapeNames) for (const b of shapeNames) if (a !== b) add(line.binChoice(`${a}s`, `${b}s`));
  add(line.binChoice('big', 'small'));
  for (const g of GROUPS) {
    add(g.ask);
    g.items.forEach(add);
  }

  // Shapes
  for (const k of Object.keys(GEO) as GeoKind[]) {
    add(GEO[k].name);
    add(shapeLine.find(k));
    if (GEO[k].points) {
      add(shapeLine.sides(k));
      add(shapeLine.corners(k));
    }
  }
  (['circle', 'square', 'rectangle', 'triangle'] as const).forEach(k => add(shapeLine.tapAll(k)));

  // Play
  MEMORY_WORDS.forEach(w => add(w.word));
  SIMON_PADS.forEach(p => add(p.name));
  STAMPS.forEach(s => add(line.stamp(s)));

  // Watch-first lessons (letter parts are already covered above).
  for (const beats of Object.values(LESSONS))
    for (const b of beats) {
      if (typeof b.say === 'string') add(b.say);
      else b.say.forEach(p => typeof p === 'string' && add(p));
    }

  for (const s of slow) normal.delete(s);
  return { normal: [...normal], slow: [...slow] };
}
