// Activity areas and their activities. Add or reorder activities here; each
// activity becomes playable once it has a component in src/activities.

export type ModuleColor = 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type IconName =
  | 'BookOpen' | 'Hash' | 'Puzzle' | 'Gamepad2'
  | 'Hand' | 'MessageSquareText' | 'AudioLines' | 'Ear'
  | 'CircleDot' | 'Scale' | 'MoveRight' | 'Plus'
  | 'Shapes' | 'SearchX' | 'Layers'
  | 'Copy' | 'Music' | 'Brush';

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
  activities: Activity[];
};

export const AREAS: Area[] = [
  {
    id: 'reading',
    title: 'Reading',
    spoken: 'Reading',
    color: 6,
    icon: 'BookOpen',
    activities: [
      { id: 'clap-words', title: 'Clap the word', spoken: 'Clap the syllables', icon: 'Hand' },
      { id: 'clap-sentences', title: 'Clap the sentence', spoken: 'Clap the words in a sentence', icon: 'MessageSquareText' },
      { id: 'sound-it-out', title: 'Sound it out', spoken: 'Sound it out', icon: 'AudioLines' },
      { id: 'first-sound', title: 'First sound', spoken: 'Find the first sound', icon: 'Ear' },
    ],
  },
  {
    id: 'numbers',
    title: 'Numbers',
    spoken: 'Numbers',
    color: 5,
    icon: 'Hash',
    activities: [
      { id: 'count-dots', title: 'Count the dots', spoken: 'Count the dots', icon: 'CircleDot' },
      { id: 'more-fewer', title: 'More or fewer', spoken: 'More or fewer', icon: 'Scale' },
      { id: 'number-line', title: 'Number line hop', spoken: 'Number line hop', icon: 'MoveRight' },
      { id: 'adding', title: 'Adding to ten', spoken: 'Adding to ten', icon: 'Plus' },
    ],
  },
  {
    id: 'logic',
    title: 'Thinking',
    spoken: 'Thinking games',
    color: 3,
    icon: 'Puzzle',
    activities: [
      { id: 'patterns', title: 'What comes next', spoken: 'What comes next?', icon: 'Shapes' },
      { id: 'odd-one-out', title: 'Odd one out', spoken: 'Odd one out', icon: 'SearchX' },
      { id: 'sorting', title: 'Sort them', spoken: 'Sort them', icon: 'Layers' },
    ],
  },
  {
    id: 'play',
    title: 'Play',
    spoken: 'Play',
    color: 4,
    icon: 'Gamepad2',
    activities: [
      { id: 'memory', title: 'Memory match', spoken: 'Memory match', icon: 'Copy' },
      { id: 'simon', title: 'Copy the colours', spoken: 'Copy the colours', icon: 'Music' },
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
