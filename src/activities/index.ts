import type { ComponentType } from 'react';
import type { Activity, Area } from '../data/areas';
import type { Profile } from '../store';
import { ClapSentences, ClapWords } from './Clap';
import { FirstSound } from './FirstSound';
import { Adding, CountDots, MoreOrFewer, NumberLine } from './Numbers';
import { DrawBoard, MemoryMatch, Simon } from './Play';
import { SoundItOut } from './SoundItOut';
import { OddOneOut, Patterns, Sorting } from './Thinking';

export type ActivityProps = { area: Area; activity: Activity; profile: Profile };

// Activity components keyed by `${areaId}/${activityId}`. An activity is
// playable when it has an entry here.
export const ACTIVITIES: Record<string, ComponentType<ActivityProps>> = {
  'reading/clap-words': ClapWords,
  'reading/clap-sentences': ClapSentences,
  'reading/sound-it-out': SoundItOut,
  'reading/first-sound': FirstSound,
  'numbers/count-dots': CountDots,
  'numbers/more-fewer': MoreOrFewer,
  'numbers/number-line': NumberLine,
  'numbers/adding': Adding,
  'logic/patterns': Patterns,
  'logic/odd-one-out': OddOneOut,
  'logic/sorting': Sorting,
  'play/memory': MemoryMatch,
  'play/simon': Simon,
  'play/draw': DrawBoard,
};
