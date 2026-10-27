import type { ComponentType } from 'react';
import type { Activity, Area } from '../data/areas';
import type { Profile } from '../store';
import { ClapSentences, ClapWords } from './Clap';

export type ActivityProps = { area: Area; activity: Activity; profile: Profile };

// Activity components keyed by `${areaId}/${activityId}`. An activity is
// playable when it has an entry here.
export const ACTIVITIES: Record<string, ComponentType<ActivityProps>> = {
  'reading/clap-words': ClapWords,
  'reading/clap-sentences': ClapSentences,
};
