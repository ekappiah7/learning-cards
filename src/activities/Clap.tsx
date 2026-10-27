import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Hand, Play } from 'lucide-react';
import { moduleVar, type ModuleColor } from '../data/areas';
import { CLAP_MAX_SYLLABLES, CLAP_MAX_WORDS, CLAP_SENTENCES, CLAP_WORDS } from '../data/reading';
import { speak, stop } from '../speech';
import { useLevel } from '../store';
import { ActivityFrame, Chips, useRound } from '../components/ActivityFrame';
import { pickRound } from './util';
import type { ActivityProps } from './index';

// Port of the Clap Words and Clap Sentences prototypes (reference/*.dc.html).
// Tap Clap once per syllable (or word): the next part lights up and a circle
// fills. "Clap with me" plays the demo, "Again" resets the card.

type Filter = { label: string; spoken: string; test: (n: number) => boolean };

type ClapConfig = {
  kind: 'syllables' | 'words';
  items: string[][];
  joiner: string;
  colors: ModuleColor[];
  eyebrow: string;
  title: ReactNode;
  spoken: string;
  filters: Filter[];
  idle: string;
  done: (n: number) => string;
  sayEachClap: boolean;   // sentences say each word as it is clapped
  doneDelay: number;      // ms before the whole item is said
  demoStep: number;       // ms between demo claps
  demoRate: number;
};

const NUM = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight'];
const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`;

const WORDS: ClapConfig = {
  kind: 'syllables',
  items: CLAP_WORDS.map(w => w.split('|')),
  joiner: '',
  colors: [6, 2, 3, 8],
  eyebrow: 'Clap the word',
  title: <>How many <em>claps?</em></>,
  spoken: 'How many claps?',
  filters: [
    { label: 'All', spoken: 'All words', test: () => true },
    ...[1, 2, 3, 4].map(n => ({ label: plural(n, 'clap'), spoken: plural(n, 'clap'), test: (k: number) => k === n })),
  ],
  idle: 'Say it and clap',
  done: n => `${NUM[n]} clap${n > 1 ? 's' : ''}!`,
  sayEachClap: false,
  doneDelay: 350,
  demoStep: 800,
  demoRate: 0.7,
};

const SENTENCES: ClapConfig = {
  kind: 'words',
  items: CLAP_SENTENCES.map(s => s.split(' ')),
  joiner: ' ',
  colors: [6, 2, 3, 8, 5, 4, 7],
  eyebrow: 'Clap the sentence',
  title: <>How many <em>words?</em></>,
  spoken: 'How many words?',
  filters: [
    { label: 'All', spoken: 'All sentences', test: () => true },
    ...[3, 4, 5].map(n => ({ label: plural(n, 'word'), spoken: plural(n, 'word'), test: (k: number) => k === n })),
    { label: '6+ words', spoken: 'Six or more words', test: (k: number) => k >= 6 },
  ],
  idle: 'Read it and clap each word',
  done: n => `${NUM[n]} words!`,
  sayEachClap: true,
  doneDelay: 400,
  demoStep: 850,
  demoRate: 0.75,
};

const clean = (part: string) => part.replace(/[.,!?]/g, '');

export const ClapWords = (props: ActivityProps) => <Clap {...props} config={WORDS} />;
export const ClapSentences = (props: ActivityProps) => <Clap {...props} config={SENTENCES} />;

function Clap({ area, activity, profile, config: c }: ActivityProps & { config: ClapConfig }) {
  // The level caps how long items get; chips with nothing left are hidden.
  const level = useLevel(area.id);
  const max = c.kind === 'syllables' ? CLAP_MAX_SYLLABLES[level] : CLAP_MAX_WORDS[level];
  const items = useMemo(() => c.items.filter(i => i.length <= max), [c, max]);
  const filters = useMemo(() => c.filters.filter(f => items.some(i => f.test(i.length))), [c, items]);
  const [filter, setFilter] = useState(0);
  const [seed, setSeed] = useState(0);
  const [claps, setClaps] = useState(0);
  const [popKey, setPopKey] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // seed only exists to draw a fresh round when Shuffle is pressed.
  const round = useMemo(() => pickRound(items.filter(i => filters[filter].test(i.length)), i => i.length), [items, filters, filter, seed]);
  const { index, next, prev, restart } = useRound(area, activity, round.length);
  const item = round[index];
  const n = item.length;
  const done = claps >= n;
  const say = (text: string, rate?: number) => speak(text, { rate });
  const whole = () => item.join(c.joiner);
  const colorAt = (k: number) => moduleVar(c.colors[k % c.colors.length]);

  const clear = () => clearTimeout(timer.current);
  useEffect(() => clear, []);

  const resetCard = () => {
    clear();
    stop();
    setClaps(0);
  };

  const go = (move: () => void) => {
    resetCard();
    move();
  };

  const clap = () => {
    clear();
    if (claps >= n) return;
    const k = claps + 1;
    setClaps(k);
    setPopKey(x => x + 1);
    if (k === n) timer.current = setTimeout(() => say(whole()), c.doneDelay);
    else if (c.sayEachClap) say(clean(item[k - 1]));
  };

  const demo = () => {
    resetCard();
    const step = (k: number) => {
      if (k >= n) {
        say(whole());
        return;
      }
      setClaps(k + 1);
      setPopKey(x => x + 1);
      say(clean(item[k]), c.demoRate);
      timer.current = setTimeout(() => step(k + 1), c.demoStep);
    };
    timer.current = setTimeout(() => step(0), 300);
  };

  const chips = [...filters.map(f => ({ label: f.label, spoken: f.spoken })), { label: 'Shuffle', spoken: 'Shuffle' }];

  return (
    <ActivityFrame
      area={area}
      activity={activity}
      profile={profile}
      eyebrow={c.eyebrow}
      title={c.title}
      spoken={c.spoken}
      toolbar={
        <Chips
          items={chips}
          active={filter}
          onPick={i => {
            resetCard();
            if (i < filters.length) setFilter(i);
            else setSeed(s => s + 1);
            restart();
          }}
        />
      }
      index={index}
      total={round.length}
      message={done ? c.done(n) : claps ? `${claps}…` : c.idle}
      feedback={done ? 'right' : null}
      main={{ label: 'Clap', icon: <Hand size={40} strokeWidth={1.5} aria-hidden />, onPress: clap }}
      extra={[{ label: 'Clap with me', icon: <Play size={32} strokeWidth={1.5} aria-hidden />, onPress: demo }]}
      onReset={resetCard}
      onPrev={() => go(prev)}
      onNext={() => go(next)}
      hint="Space to clap · arrows to move"
    >
      <button
        type="button"
        className={`clap-item ${c.kind}`}
        title={c.kind === 'syllables' ? 'Hear the word' : 'Hear the sentence'}
        onClick={() => say(whole())}
      >
        {item.map((part, k) =>
          c.kind === 'syllables' ? (
            <span key={k} className="part">
              <span style={{ color: k < claps ? colorAt(k) : undefined }}>{part}</span>
              {k < n - 1 && <span className="sep">·</span>}
            </span>
          ) : (
            <span key={k} className="part" style={k < claps ? { color: colorAt(k), borderBottomColor: colorAt(k) } : undefined}>
              {part}
            </span>
          ),
        )}
      </button>

      <div className={`clap-dots ${c.kind}`}>
        {item.map((_, k) => (
          <span
            key={k === claps - 1 ? `pop-${popKey}` : k}
            className={k === claps - 1 ? 'pop' : undefined}
            style={k < claps ? { background: colorAt(k), borderColor: colorAt(k) } : undefined}
          />
        ))}
      </div>
    </ActivityFrame>
  );
}
