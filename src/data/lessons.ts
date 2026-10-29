import type { CharacterId } from './characters';
import type { Part } from '../voice/phrases';

// "Watch first" mini-lessons: one short scene per activity. Each beat is a
// line said by Jabari or Jamila; the scene (src/lessons/stages.tsx) moves on
// as each line is said. Edit the words here; scripts/voice records them.

export type Beat = {
  by: CharacterId;
  say: string | Part[];
  sfx?: 'clap' | 'pop' | 'right' | 'flip' | 'whoosh' | 'pad0' | 'pad1' | 'pad2';
  hold?: number; // extra pause after the line, in ms
};

const J = 'jabari' as const;
const M = 'jamila' as const;

export const LESSONS: Record<string, Beat[]> = {
  'reading/clap-words': [
    { by: M, say: "Let's clap a word together!" },
    { by: J, say: 'Listen. Butterfly.' },
    { by: M, say: 'but', sfx: 'clap' },
    { by: M, say: 'ter', sfx: 'clap' },
    { by: M, say: 'fly', sfx: 'clap', hold: 500 },
    { by: J, say: 'Three claps! Butterfly has three parts.', sfx: 'right' },
    { by: M, say: 'Now it is your turn. Tap Clap for each part!' },
  ],
  'reading/clap-sentences': [
    { by: M, say: 'Sentences are made of words.' },
    { by: J, say: 'The dog can run.' },
    { by: M, say: 'The', sfx: 'clap' },
    { by: M, say: 'dog', sfx: 'clap' },
    { by: M, say: 'can', sfx: 'clap' },
    { by: M, say: 'run', sfx: 'clap', hold: 500 },
    { by: J, say: 'Four claps, four words!', sfx: 'right' },
    { by: M, say: 'Clap once for every word you read.' },
  ],
  'reading/sound-it-out': [
    { by: M, say: 'Every letter makes a sound.' },
    { by: M, say: [{ letter: 'c' }], sfx: 'pop' },
    { by: M, say: [{ letter: 'a' }], sfx: 'pop' },
    { by: M, say: [{ letter: 't' }], sfx: 'pop', hold: 400 },
    { by: J, say: 'Now push the sounds together.', sfx: 'whoosh' },
    { by: M, say: [{ letter: 'c' }, { letter: 'a' }, { letter: 't' }] },
    { by: J, say: 'Cat! You can sound out words too.', sfx: 'right' },
  ],
  'reading/first-sound': [
    { by: J, say: 'Every word starts with a sound.' },
    { by: M, say: 'Sun.' },
    { by: M, say: [{ letter: 's' }], sfx: 'pop' },
    { by: J, say: 'Sun starts with the letter s.', sfx: 'right' },
    { by: M, say: 'Listen for the first sound, then find its letter.' },
  ],
  'numbers/count-dots': [
    { by: J, say: "Let's count the apples!" },
    { by: J, say: '1', sfx: 'pop' },
    { by: J, say: '2', sfx: 'pop' },
    { by: J, say: '3', sfx: 'pop' },
    { by: J, say: '4', sfx: 'pop' },
    { by: J, say: '5', sfx: 'pop', hold: 400 },
    { by: M, say: 'Five apples! The last number tells us how many.', sfx: 'right' },
    { by: J, say: 'Touch each one as you count.' },
  ],
  'numbers/more-fewer': [
    { by: J, say: 'Look at these two plates.' },
    { by: M, say: 'This plate has more.', sfx: 'pop' },
    { by: J, say: 'This plate has fewer.', sfx: 'pop' },
    { by: M, say: 'More means a bigger group. Fewer means a smaller group.' },
  ],
  'numbers/number-line': [
    { by: J, say: 'This is a number line.' },
    { by: M, say: 'The rabbit is on 2.' },
    { by: J, say: 'Hop forward one!', sfx: 'pop' },
    { by: M, say: '3 comes after 2.', sfx: 'right' },
    { by: J, say: 'Now hop back one!', sfx: 'pop' },
    { by: M, say: '2 comes before 3.', sfx: 'right' },
    { by: J, say: 'After means one more. Before means one less.' },
  ],
  'numbers/adding': [
    { by: J, say: 'Here are 3 balls.' },
    { by: M, say: 'And here are 2 more.' },
    { by: J, say: 'Push them together!', sfx: 'whoosh' },
    { by: J, say: '1', sfx: 'pop' },
    { by: J, say: '2', sfx: 'pop' },
    { by: J, say: '3', sfx: 'pop' },
    { by: J, say: '4', sfx: 'pop' },
    { by: J, say: '5', sfx: 'pop' },
    { by: M, say: '3 and 2 make 5!', sfx: 'right' },
  ],
  'logic/patterns': [
    { by: M, say: 'A pattern repeats, again and again.' },
    { by: J, say: 'Red circle, blue square.' },
    { by: J, say: 'Red circle, blue square.' },
    { by: M, say: 'What comes next?', hold: 600 },
    { by: J, say: 'Red circle!', sfx: 'right' },
    { by: M, say: 'Find the part that repeats.' },
  ],
  'logic/odd-one-out': [
    { by: M, say: 'Three of these are the same.' },
    { by: J, say: 'One is different.', sfx: 'pop' },
    { by: M, say: 'The circle is a different shape!', sfx: 'right' },
    { by: J, say: 'Look at the colour, the shape and the size.' },
  ],
  'logic/sorting': [
    { by: M, say: "Let's sort by colour." },
    { by: J, say: 'red', sfx: 'pop' },
    { by: J, say: 'blue', sfx: 'pop' },
    { by: J, say: 'red', sfx: 'pop' },
    { by: J, say: 'blue', sfx: 'pop' },
    { by: M, say: 'All sorted! The same colours go together.', sfx: 'right' },
  ],
  'play/memory': [
    { by: J, say: 'Memory match! All the cards are face down.' },
    { by: M, say: 'Turn over two cards.', sfx: 'flip' },
    { by: J, say: 'Cat and sun. Not a pair. Remember where they are!', sfx: 'flip' },
    { by: M, say: 'Cat and cat. A pair!', sfx: 'right' },
    { by: J, say: 'Find all the pairs to win.' },
  ],
  'play/simon': [
    { by: J, say: 'Watch the colours light up.' },
    { by: J, say: 'red', sfx: 'pad0' },
    { by: J, say: 'blue', sfx: 'pad1' },
    { by: J, say: 'green', sfx: 'pad2', hold: 400 },
    { by: M, say: 'Now copy them, in the same order.' },
    { by: J, say: 'Red, blue, green!', sfx: 'right' },
  ],
  'play/draw': [
    { by: J, say: 'Pick a colour, then draw with your finger.' },
    { by: M, say: 'Tap a stamp to make shapes.', sfx: 'pop' },
    { by: J, say: 'Undo takes away the last thing you did.' },
    { by: M, say: 'Make anything you like!', sfx: 'right' },
  ],
};
