// Background tunes, played by the app's own synthesiser (src/sound.ts), so
// they need no audio files. Notes are MIDI numbers (60 is middle C, 0 is a
// rest); each note lasts `beats`. Chords are one per bar, as MIDI roots.

export type Tune = {
  bpm: number;
  melody: [number, number][]; // [note, beats]
  chords: number[];           // bass root for each 4-beat bar, looped
  shaker?: boolean;           // soft off-beat shaker
};

export type Theme = 'home' | 'reading' | 'numbers' | 'logic' | 'play' | 'lesson';

export const TUNES: Record<Theme, Tune> = {
  // Bright and welcoming, C major.
  home: {
    bpm: 100,
    melody: [
      [72, 1], [76, 1], [79, 1], [76, 1], [77, 1], [76, 1], [74, 2],
      [72, 1], [74, 1], [76, 1], [72, 1], [74, 2], [0, 2],
      [76, 1], [79, 1], [81, 1], [79, 1], [77, 1], [76, 1], [74, 2],
      [72, 1], [74, 1], [71, 1], [74, 1], [72, 2], [0, 2],
    ],
    chords: [48, 53, 43, 48],
    shaker: true,
  },
  // Calm and gentle, F major, for listening and reading.
  reading: {
    bpm: 84,
    melody: [
      [77, 2], [81, 1], [79, 1], [77, 2], [74, 2],
      [76, 2], [77, 1], [79, 1], [72, 4],
      [74, 2], [77, 1], [81, 1], [79, 2], [77, 2],
      [76, 1], [74, 1], [76, 2], [77, 4],
    ],
    chords: [41, 46, 48, 41],
  },
  // Bouncy counting tune, G major.
  numbers: {
    bpm: 108,
    melody: [
      [67, 1], [71, 1], [74, 1], [71, 1], [67, 1], [71, 1], [74, 2],
      [76, 1], [74, 1], [72, 1], [71, 1], [69, 2], [0, 2],
      [71, 1], [74, 1], [79, 1], [74, 1], [76, 1], [74, 1], [72, 2],
      [71, 1], [69, 1], [66, 1], [69, 1], [67, 2], [0, 2],
    ],
    chords: [43, 48, 50, 43],
    shaker: true,
  },
  // Curious and thoughtful, A minor.
  logic: {
    bpm: 92,
    melody: [
      [69, 1], [72, 1], [76, 2], [74, 1], [72, 1], [71, 2],
      [72, 1], [74, 1], [76, 1], [79, 1], [76, 4],
      [77, 1], [76, 1], [74, 2], [72, 1], [71, 1], [69, 2],
      [71, 1], [72, 1], [71, 1], [68, 1], [69, 4],
    ],
    chords: [45, 41, 48, 40],
  },
  // Playful, D major.
  play: {
    bpm: 112,
    melody: [
      [74, 1], [78, 1], [81, 1], [78, 1], [83, 2], [81, 2],
      [79, 1], [78, 1], [76, 1], [78, 1], [74, 2], [0, 2],
      [76, 1], [78, 1], [79, 1], [81, 1], [83, 1], [81, 1], [79, 2],
      [78, 1], [76, 1], [73, 1], [76, 1], [74, 2], [0, 2],
    ],
    chords: [50, 43, 45, 50],
    shaker: true,
  },
  // Soft bed for the mini-lessons, under the talking.
  lesson: {
    bpm: 90,
    melody: [
      [72, 2], [76, 2], [79, 2], [76, 2],
      [74, 2], [77, 2], [81, 2], [77, 2],
    ],
    chords: [48, 50],
  },
};
