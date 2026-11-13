import { createElement, type ComponentType } from 'react';
import type { Activity, Area } from '../data/areas';
import { STORIES } from '../data/stories';
import type { Profile } from '../store';
import { ClapSentences, ClapWords } from './Clap';
import { FirstSound } from './FirstSound';
import { AbcOrder, BigSmall, FindLetter, MeetLetters, TraceLetters } from './Letters';
import { Belongs, FindNumber, Piano, PopLetters, SizeOrder, TakeAway } from './More';
import { Adding, CountDots, MoreOrFewer, NumberLine } from './Numbers';
import { DrawBoard, MemoryMatch, Simon } from './Play';
import { ShapeHunt, ShapeNames, ShapeShadows, SidesCorners } from './Shapes';
import { SoundItOut } from './SoundItOut';
import { BuildSentence, StoryBook } from './Stories';
import { OddOneOut, Patterns, Sorting } from './Thinking';
import { BuildWord, MissingSound, ReadMatch, Rhymes, TrickyWords, WordFamilies } from './Words';

export type ActivityProps = { area: Area; activity: Activity; profile: Profile };

// Activity components keyed by `${areaId}/${activityId}`. An activity is
// playable when it has an entry here.
export const ACTIVITIES: Record<string, ComponentType<ActivityProps>> = {
  'letters/meet-letters': MeetLetters,
  'letters/trace-letters': TraceLetters,
  'letters/find-letter': FindLetter,
  'letters/first-sound': FirstSound,
  'letters/big-small': BigSmall,
  'letters/abc-order': AbcOrder,
  'reading/clap-words': ClapWords,
  'reading/sound-it-out': SoundItOut,
  'reading/build-word': BuildWord,
  'reading/missing-sound': MissingSound,
  'reading/rhymes': Rhymes,
  'reading/word-families': WordFamilies,
  'reading/read-match': ReadMatch,
  'reading/tricky-words': TrickyWords,
  'stories/clap-sentences': ClapSentences,
  'stories/build-sentence': BuildSentence,
  'numbers/count-dots': CountDots,
  'numbers/find-number': FindNumber,
  'numbers/more-fewer': MoreOrFewer,
  'numbers/number-line': NumberLine,
  'numbers/adding': Adding,
  'numbers/take-away': TakeAway,
  'shapes/shape-names': ShapeNames,
  'shapes/sides-corners': SidesCorners,
  'shapes/shape-hunt': ShapeHunt,
  'shapes/shape-shadows': ShapeShadows,
  'logic/patterns': Patterns,
  'logic/odd-one-out': OddOneOut,
  'logic/sorting': Sorting,
  'logic/size-order': SizeOrder,
  'logic/belongs': Belongs,
  'play/pop-letters': PopLetters,
  'play/memory': MemoryMatch,
  'play/simon': Simon,
  'play/piano': Piano,
  'play/draw': DrawBoard,
};

// Each story is its own activity in the Stories area.
for (const story of STORIES) {
  ACTIVITIES[`stories/${story.id}`] = props => createElement(StoryBook, { ...props, story });
}
