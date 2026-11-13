import { STORIES } from './stories.ts';

// Activity areas and their activities. Add or reorder activities here; each
// activity becomes playable once it has a component in src/activities.

export type ModuleColor = 2 | 3 | 4 | 5 | 6 | 7 | 8;

// Difficulty, set per area in the parent corner. Medium is the default.
export type Level = 1 | 2 | 3;
export type ByLevel<T> = Record<Level, T>;
export const LEVEL_NAMES: ByLevel<string> = { 1: 'Easy', 2: 'Medium', 3: 'Harder' };
export type IconName =
  | 'BookOpen' | 'Hash' | 'Puzzle' | 'Gamepad2'
  | 'Hand' | 'MessageSquareText' | 'AudioLines' | 'Ear'
  | 'CircleDot' | 'Scale' | 'MoveRight' | 'Plus'
  | 'Shapes' | 'SearchX' | 'Layers'
  | 'Copy' | 'Music' | 'Brush'
  | 'CaseSensitive' | 'PenLine' | 'Search' | 'ALargeSmall' | 'ArrowDownAZ' | 'Smile'
  | 'Blocks' | 'CircleDashed' | 'Sparkles' | 'Network' | 'Images' | 'Zap'
  | 'LibraryBig' | 'Rows3' | 'BookOpenText'
  | 'Target' | 'Minus' | 'ArrowUpNarrowWide' | 'Group' | 'PartyPopper' | 'Piano'
  | 'Pentagon' | 'ScanSearch' | 'Blend';

export type Activity = {
  id: string;
  title: string;        // shown on the tile
  spoken: string;       // read aloud when the tile is tapped
  icon: IconName;
};

export type Area = {
  id: string;
  title: string;
  spoken: string;
  color: ModuleColor;
  icon: IconName;
  levels: ByLevel<string>;   // what each difficulty level means, for parents
  activities: Activity[];
};

export const AREAS: Area[] = [
  {
    id: 'letters',
    title: 'Letters',
    spoken: 'Letters and sounds',
    color: 7,
    icon: 'CaseSensitive',
    levels: {
      1: 'First letters only (s, a, t, p, i, n, m, d), 2 letters to choose from, ABC order up to h.',
      2: 'Most letters, 3 letters to choose from, the whole alphabet in order.',
      3: 'All letters, 4 to choose from including look-alikes such as b and d, and "what comes before".',
    },
    activities: [
      { id: 'meet-letters', title: 'Meet the letters', spoken: 'Meet the letters', icon: 'Smile' },
      { id: 'trace-letters', title: 'Trace the letter', spoken: 'Trace the letter', icon: 'PenLine' },
      { id: 'find-letter', title: 'Find the letter', spoken: 'Find the letter', icon: 'Search' },
      { id: 'first-sound', title: 'First sound', spoken: 'Find the first sound', icon: 'Ear' },
      { id: 'big-small', title: 'Big and small', spoken: 'Big and small letters', icon: 'ALargeSmall' },
      { id: 'abc-order', title: 'ABC order', spoken: 'A B C order', icon: 'ArrowDownAZ' },
    ],
  },
  {
    id: 'reading',
    title: 'Words',
    spoken: 'Words',
    color: 6,
    icon: 'BookOpen',
    levels: {
      1: 'Clap words up to 2 claps, no extra letters when building words, first sound missing, 2 pictures to choose from, first tricky words.',
      2: 'All clap words, 1 extra letter when building, first or middle sound missing, 3 pictures, more tricky words.',
      3: 'As Medium with 2 extra letters, any sound missing, 4 pictures and the hardest tricky words.',
    },
    activities: [
      { id: 'clap-words', title: 'Clap the word', spoken: 'Clap the syllables', icon: 'Hand' },
      { id: 'sound-it-out', title: 'Sound it out', spoken: 'Sound it out', icon: 'AudioLines' },
      { id: 'build-word', title: 'Build the word', spoken: 'Build the word', icon: 'Blocks' },
      { id: 'missing-sound', title: 'Missing sound', spoken: 'Find the missing sound', icon: 'CircleDashed' },
      { id: 'rhymes', title: 'Rhyme time', spoken: 'Rhyme time', icon: 'Sparkles' },
      { id: 'word-families', title: 'Word families', spoken: 'Word families', icon: 'Network' },
      { id: 'read-match', title: 'Read and match', spoken: 'Read and match', icon: 'Images' },
      { id: 'tricky-words', title: 'Tricky words', spoken: 'Tricky words', icon: 'Zap' },
    ],
  },
  {
    id: 'stories',
    title: 'Stories',
    spoken: 'Stories',
    color: 2,
    icon: 'LibraryBig',
    levels: {
      1: 'Stories are read aloud. Sentences to clap and build have up to 4 words.',
      2: 'Stories are read aloud. Sentences have up to 5 words.',
      3: 'Stories wait for the child to read first; tap Read to me to check. All sentences.',
    },
    activities: [
      { id: 'clap-sentences', title: 'Clap the sentence', spoken: 'Clap the words in a sentence', icon: 'MessageSquareText' },
      { id: 'build-sentence', title: 'Build the sentence', spoken: 'Build the sentence', icon: 'Rows3' },
      ...STORIES.map(st => ({ id: st.id, title: st.title, spoken: st.title, icon: 'BookOpenText' as const })),
    ],
  },
  {
    id: 'numbers',
    title: 'Numbers',
    spoken: 'Numbers',
    color: 5,
    icon: 'Hash',
    levels: {
      1: 'Numbers up to 5, big differences, adding and taking away within 5, 2 numbers to choose from.',
      2: 'Numbers up to 10, adding and taking away within 10, 3 numbers to choose from.',
      3: 'Find numbers and number line up to 20, close differences, 4 numbers to choose from.',
    },
    activities: [
      { id: 'count-dots', title: 'Count the dots', spoken: 'Count the dots', icon: 'CircleDot' },
      { id: 'find-number', title: 'Find the number', spoken: 'Find the number', icon: 'Target' },
      { id: 'more-fewer', title: 'More or fewer', spoken: 'More or fewer', icon: 'Scale' },
      { id: 'number-line', title: 'Number line hop', spoken: 'Number line hop', icon: 'MoveRight' },
      { id: 'adding', title: 'Adding to ten', spoken: 'Adding to ten', icon: 'Plus' },
      { id: 'take-away', title: 'Take away', spoken: 'Take away', icon: 'Minus' },
    ],
  },
  {
    id: 'shapes',
    title: 'Shapes',
    spoken: 'Shapes',
    color: 8,
    icon: 'Shapes',
    levels: {
      1: 'Circle, square, triangle, star and heart; sides of triangles, squares and rectangles; 2 to choose from.',
      2: 'Adds rectangle, oval, diamond and pentagon; 3 to choose from.',
      3: 'Adds hexagon and semicircle; shadows are turned around; 4 to choose from.',
    },
    activities: [
      { id: 'shape-names', title: 'Name the shape', spoken: 'Name the shape', icon: 'Shapes' },
      { id: 'sides-corners', title: 'Sides and corners', spoken: 'Sides and corners', icon: 'Pentagon' },
      { id: 'shape-hunt', title: 'Shape hunt', spoken: 'Shape hunt', icon: 'ScanSearch' },
      { id: 'shape-shadows', title: 'Shape shadows', spoken: 'Shape shadows', icon: 'Blend' },
    ],
  },
  {
    id: 'logic',
    title: 'Thinking',
    spoken: 'Thinking games',
    color: 3,
    icon: 'Puzzle',
    levels: {
      1: 'Simple AB patterns, odd one out from 3, sorting 4 shapes, ordering 3 sizes, 2 pictures to choose from.',
      2: 'Mixed patterns, odd one out from 4 including size, sorting 6 shapes, ordering 4 sizes, 3 pictures.',
      3: 'Longer patterns, odd one out from 5, sorting 8 shapes, ordering 5 sizes, 4 pictures.',
    },
    activities: [
      { id: 'patterns', title: 'What comes next', spoken: 'What comes next?', icon: 'Rows3' },
      { id: 'odd-one-out', title: 'Odd one out', spoken: 'Odd one out', icon: 'SearchX' },
      { id: 'sorting', title: 'Sort them', spoken: 'Sort them', icon: 'Layers' },
      { id: 'size-order', title: 'Small to big', spoken: 'Small to big', icon: 'ArrowUpNarrowWide' },
      { id: 'belongs', title: 'Which one belongs', spoken: 'Which one belongs?', icon: 'Group' },
    ],
  },
  {
    id: 'play',
    title: 'Play',
    spoken: 'Play',
    color: 4,
    icon: 'Gamepad2',
    levels: {
      1: 'Memory boards of 2 to 4 pairs, colour sequences of 2 to 4, balloons with the first 6 letters.',
      2: 'Memory boards of 3 to 6 pairs, colour sequences of 2 to 5, balloons with 12 letters.',
      3: 'Memory boards of 4 to 6 pairs, colour sequences of 3 to 6, balloons with most letters.',
    },
    activities: [
      { id: 'pop-letters', title: 'Pop the letters', spoken: 'Pop the letters', icon: 'PartyPopper' },
      { id: 'memory', title: 'Memory match', spoken: 'Memory match', icon: 'Copy' },
      { id: 'simon', title: 'Copy the colours', spoken: 'Copy the colours', icon: 'Music' },
      { id: 'piano', title: 'Music maker', spoken: 'Music maker', icon: 'Piano' },
      { id: 'draw', title: 'Draw and stamp', spoken: 'Draw and stamp', icon: 'Brush' },
    ],
  },
];

export function findArea(id: string) {
  return AREAS.find(a => a.id === id);
}

export function findActivity(areaId: string, activityId: string) {
  return findArea(areaId)?.activities.find(a => a.id === activityId);
}

// Colours a child can pick for their profile. Module 1 is gold, which the
// design system keeps for lines only, so it is left out.
export const PROFILE_COLORS: ModuleColor[] = [6, 2, 3, 8, 5, 4, 7];

export const moduleVar = (n: ModuleColor) => `var(--module-${n})`;
