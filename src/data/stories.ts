import type { PictureName } from '../components/pictures';

// Short stories to read along with. Each page has one sentence and a small
// scene. Scene items are placed by their centre, in percent of the scene
// (x across, y down), with a size in percent of the scene's width.

export type SceneAnim = 'bob' | 'hop' | 'slide' | 'spin' | 'sleep' | 'pop' | 'float';
export type SceneItem = { pic: PictureName; x: number; y: number; size: number; anim?: SceneAnim };
export type StoryPage = { text: string; bg: 'day' | 'night' | 'room'; items: SceneItem[] };
export type StoryQuestion = { ask: string; options: PictureName[]; answer: PictureName };
export type Story = { id: string; title: string; pages: StoryPage[]; questions: StoryQuestion[] };

export const STORIES: Story[] = [
  {
    id: 'story-fat-cat',
    title: 'The fat cat',
    pages: [
      { text: 'This is a cat.', bg: 'room', items: [{ pic: 'cat', x: 50, y: 58, size: 30, anim: 'bob' }] },
      { text: 'The cat is fat.', bg: 'room', items: [{ pic: 'cat', x: 50, y: 54, size: 44, anim: 'bob' }] },
      { text: 'The cat sat on a mat.', bg: 'room', items: [{ pic: 'mat', x: 50, y: 82, size: 54 }, { pic: 'cat', x: 50, y: 56, size: 32 }] },
      { text: 'A rat ran to the mat.', bg: 'room', items: [{ pic: 'mat', x: 40, y: 82, size: 54 }, { pic: 'cat', x: 40, y: 56, size: 32 }, { pic: 'rat', x: 84, y: 76, size: 18, anim: 'slide' }] },
      { text: 'The cat and the rat had a nap.', bg: 'room', items: [{ pic: 'mat', x: 50, y: 82, size: 60 }, { pic: 'cat', x: 40, y: 58, size: 30, anim: 'sleep' }, { pic: 'rat', x: 68, y: 72, size: 16, anim: 'sleep' }] },
    ],
    questions: [
      { ask: 'Who sat on the mat?', options: ['dog', 'cat', 'hen'], answer: 'cat' },
      { ask: 'Who ran to the mat?', options: ['rat', 'pig', 'fox'], answer: 'rat' },
    ],
  },
  {
    id: 'story-red-bus',
    title: 'The red bus',
    pages: [
      { text: 'The bus is red.', bg: 'day', items: [{ pic: 'bus', x: 50, y: 62, size: 48 }] },
      { text: 'The bus is big.', bg: 'day', items: [{ pic: 'bus', x: 50, y: 56, size: 68 }] },
      { text: 'A man got on the bus.', bg: 'day', items: [{ pic: 'bus', x: 38, y: 60, size: 50 }, { pic: 'man', x: 82, y: 62, size: 20, anim: 'hop' }] },
      { text: 'A dog got on the bus.', bg: 'day', items: [{ pic: 'bus', x: 38, y: 60, size: 50 }, { pic: 'dog', x: 82, y: 68, size: 18, anim: 'hop' }] },
      { text: 'The bus went up the hill.', bg: 'day', items: [{ pic: 'sun', x: 84, y: 22, size: 16, anim: 'spin' }, { pic: 'bus', x: 48, y: 56, size: 40, anim: 'slide' }] },
      { text: 'It is fun on the bus!', bg: 'day', items: [{ pic: 'sun', x: 84, y: 22, size: 16, anim: 'spin' }, { pic: 'bus', x: 48, y: 58, size: 56, anim: 'bob' }] },
    ],
    questions: [
      { ask: 'Which animal got on the bus?', options: ['cat', 'pig', 'dog'], answer: 'dog' },
      { ask: 'What went up the hill?', options: ['bus', 'jet', 'bed'], answer: 'bus' },
    ],
  },
  {
    id: 'story-pig-mud',
    title: 'The pig in the mud',
    pages: [
      { text: 'The sun is hot.', bg: 'day', items: [{ pic: 'sun', x: 50, y: 38, size: 36, anim: 'spin' }] },
      { text: 'The pig is hot.', bg: 'day', items: [{ pic: 'sun', x: 82, y: 22, size: 18, anim: 'spin' }, { pic: 'pig', x: 44, y: 62, size: 34, anim: 'bob' }] },
      { text: 'The pig can see mud.', bg: 'day', items: [{ pic: 'mud', x: 76, y: 80, size: 38 }, { pic: 'pig', x: 24, y: 64, size: 28 }] },
      { text: 'The pig ran to the mud.', bg: 'day', items: [{ pic: 'mud', x: 76, y: 80, size: 38 }, { pic: 'pig', x: 46, y: 64, size: 28, anim: 'slide' }] },
      { text: 'The pig sat in the mud.', bg: 'day', items: [{ pic: 'pig', x: 50, y: 58, size: 30, anim: 'bob' }, { pic: 'mud', x: 50, y: 82, size: 60 }] },
      { text: 'The pig is not hot now.', bg: 'day', items: [{ pic: 'sun', x: 84, y: 20, size: 14 }, { pic: 'pig', x: 50, y: 58, size: 30, anim: 'hop' }, { pic: 'mud', x: 50, y: 82, size: 60 }] },
    ],
    questions: [
      { ask: 'Where did the pig sit?', options: ['bed', 'mud', 'box'], answer: 'mud' },
      { ask: 'What was hot?', options: ['moon', 'cup', 'sun'], answer: 'sun' },
    ],
  },
  {
    id: 'story-hen-egg',
    title: 'The hen and the egg',
    pages: [
      { text: 'The hen has a nest.', bg: 'day', items: [{ pic: 'nest', x: 62, y: 76, size: 38 }, { pic: 'hen', x: 24, y: 62, size: 28, anim: 'bob' }] },
      { text: 'The hen sat on the nest.', bg: 'day', items: [{ pic: 'hen', x: 50, y: 52, size: 32 }, { pic: 'nest', x: 50, y: 78, size: 40 }] },
      { text: 'The hen has an egg.', bg: 'day', items: [{ pic: 'hen', x: 30, y: 60, size: 30 }, { pic: 'egg', x: 70, y: 70, size: 16, anim: 'bob' }] },
      { text: 'Tap, tap, tap went the egg.', bg: 'day', items: [{ pic: 'egg', x: 50, y: 60, size: 28, anim: 'hop' }] },
      { text: 'A chick is in the egg!', bg: 'day', items: [{ pic: 'chick', x: 50, y: 58, size: 30, anim: 'pop' }] },
      { text: 'The hen is a mum.', bg: 'day', items: [{ pic: 'hen', x: 36, y: 58, size: 34 }, { pic: 'chick', x: 72, y: 72, size: 16, anim: 'hop' }] },
    ],
    questions: [
      { ask: 'What did the hen sit on?', options: ['nest', 'bed', 'mat'], answer: 'nest' },
      { ask: 'What was in the egg?', options: ['frog', 'chick', 'fish'], answer: 'chick' },
    ],
  },
  {
    id: 'story-fox-box',
    title: 'The fox and the box',
    pages: [
      { text: 'A fox can see a box.', bg: 'day', items: [{ pic: 'fox', x: 24, y: 60, size: 28, anim: 'bob' }, { pic: 'box', x: 72, y: 70, size: 30 }] },
      { text: 'Is it a hat? No!', bg: 'day', items: [{ pic: 'box', x: 50, y: 72, size: 34 }, { pic: 'hat', x: 50, y: 28, size: 20, anim: 'float' }] },
      { text: 'Is it a bun? No!', bg: 'day', items: [{ pic: 'box', x: 50, y: 72, size: 34 }, { pic: 'bun', x: 50, y: 28, size: 20, anim: 'float' }] },
      { text: 'Is it a bug? No!', bg: 'day', items: [{ pic: 'box', x: 50, y: 72, size: 34 }, { pic: 'bug', x: 50, y: 28, size: 20, anim: 'float' }] },
      { text: 'It is a frog!', bg: 'day', items: [{ pic: 'box', x: 50, y: 76, size: 34 }, { pic: 'frog', x: 50, y: 42, size: 28, anim: 'pop' }] },
      { text: 'Hop, hop, hop went the frog.', bg: 'day', items: [{ pic: 'fox', x: 18, y: 62, size: 22 }, { pic: 'frog', x: 60, y: 66, size: 26, anim: 'hop' }] },
    ],
    questions: [
      { ask: 'What was in the box?', options: ['hat', 'bun', 'frog'], answer: 'frog' },
      { ask: 'Who can see the box?', options: ['fox', 'dog', 'hen'], answer: 'fox' },
    ],
  },
  {
    id: 'story-bedtime',
    title: 'Time for bed',
    pages: [
      { text: 'The sun went down.', bg: 'day', items: [{ pic: 'sun', x: 50, y: 66, size: 30 }] },
      { text: 'The moon is up.', bg: 'night', items: [{ pic: 'star', x: 22, y: 22, size: 8, anim: 'bob' }, { pic: 'star', x: 42, y: 12, size: 6, anim: 'bob' }, { pic: 'moon', x: 72, y: 28, size: 24, anim: 'float' }] },
      { text: 'The dog is in his bed.', bg: 'night', items: [{ pic: 'bed', x: 50, y: 70, size: 50 }, { pic: 'dog', x: 42, y: 54, size: 20, anim: 'sleep' }] },
      { text: 'The cat is on the rug.', bg: 'night', items: [{ pic: 'rug', x: 50, y: 82, size: 52 }, { pic: 'cat', x: 50, y: 60, size: 26, anim: 'sleep' }] },
      { text: 'The hen is in the hut.', bg: 'night', items: [{ pic: 'hut', x: 50, y: 58, size: 46 }, { pic: 'hen', x: 50, y: 74, size: 14, anim: 'sleep' }] },
      { text: 'It is time for bed. Good night!', bg: 'night', items: [{ pic: 'star', x: 20, y: 24, size: 8, anim: 'bob' }, { pic: 'star', x: 80, y: 18, size: 6, anim: 'bob' }, { pic: 'moon', x: 50, y: 40, size: 34, anim: 'float' }] },
    ],
    questions: [
      { ask: 'Where is the dog?', options: ['bus', 'bed', 'box'], answer: 'bed' },
      { ask: 'What is up at night?', options: ['moon', 'bus', 'mug'], answer: 'moon' },
    ],
  },
];

export const findStory = (id: string) => STORIES.find(s => s.id === id);
