import type { ComponentType } from 'react';
import type { Activity, Area } from '../data/areas';
import type { Profile } from '../store';
import { ClapSentences, ClapWords } from './Clap';
import { FirstSound } from './FirstSound';
import { Adding, CountDots, MoreOrFewer, NumberLine } from './Numbers';
import { SoundItOut } from './SoundItOut';

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
};
