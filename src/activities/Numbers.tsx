import { useEffect, useMemo, useRef, useState } from 'react';
import { ListOrdered, Rabbit, Volume2 } from 'lucide-react';
import { moduleVar, type ModuleColor } from '../data/areas';
import { ADD, COMPARE, COUNT, NUMBER_CHOICES, NUMBER_LINE } from '../data/numbers';
import { praise, speak, stop } from '../speech';
import { ActivityFrame, ROUND_SIZE, useRound } from '../components/ActivityFrame';
import { ChoiceTiles, useAnswer, useLater, useSayOnShow } from '../components/Choices';
import { shuffle } from './util';
import type { ActivityProps } from './index';

// ---------- shared helpers ----------

const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const rand = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));

// The answer plus nearby numbers inside [min, max], shuffled.
function numberChoices(answer: number, min: number, max: number) {
  const near = shuffle(range(Math.max(min, answer - 3), Math.min(max, answer + 3)).filter(n => n !== answer));
  return shuffle([answer, ...near.slice(0, NUMBER_CHOICES - 1)]).map(String);
}

type Timer = ReturnType<typeof setTimeout>;

// Lights dots one at a time, saying each number. Returns start and cancel.
function useCountAlong(onStep: (k: number) => void, onDone: (n: number) => void) {
  const t = useRef<Timer>(undefined);
  const cancel = () => clearTimeout(t.current);
  useEffect(() => cancel, []);
  const start = (n: number) => {
    cancel();
    const step = (k: number) => {
      if (k > n) {
        onDone(n);
        return;
      }
      onStep(k);
      speak(String(k), { rate: 0.8 });
      t.current = setTimeout(() => step(k + 1), 700);
    };
    t.current = setTimeout(() => step(1), 150);
  };
  return { start, cancel };
}

// Dots arranged in rows, like a ten frame. Counted dots show their number.
// `from` is the number of the first dot, so a second group can count on.
function Dots({
  n, color, counted = 0, from = 1, cols = 5, size = 'l', onTap,
}: { n: number; color: string; counted?: number; from?: number; cols?: number; size?: 'l' | 'm' | 's'; onTap?: () => void }) {
  return (
    <div className={`dots size-${size}`} style={{ gridTemplateColumns: `repeat(${Math.min(n, cols)}, auto)` }}>
      {range(from, from + n - 1).map(k => (
        <span
          key={k}
          className={k <= counted ? 'counted' : undefined}
          style={{ background: color }}
          onClick={onTap}
          role={onTap ? 'button' : undefined}
          aria-label={onTap ? 'Count a dot' : undefined}
        >
          {k <= counted ? k : ''}
        </span>
      ))}
    </div>
  );
}

const Speaker = () => <Volume2 size={40} strokeWidth={1.5} aria-hidden />;

// ---------- Count the dots ----------

export function CountDots({ area, activity, profile }: ActivityProps) {
  const round = useMemo(
    () => shuffle(range(COUNT.min, COUNT.max)).slice(0, ROUND_SIZE).sort((a, b) => a - b).map(n => ({ n, choices: numberChoices(n, COUNT.min, COUNT.max) })),
    [],
  );
  const { index, next, prev } = useRound(area, activity, round.length);
  const item = round[index];
  const color = moduleVar(area.color);
  const { solved, wrong, check, reset } = useAnswer();
  const later = useLater();
  const [counted, setCounted] = useState(0);
  const along = useCountAlong(setCounted, n => speak(`${n}!`));

  useSayOnShow('How many dots?', index);

  const tapDot = () => {
    along.cancel();
    if (counted >= item.n) return;
    speak(String(counted + 1));
    setCounted(counted + 1);
  };

  const move = (go: () => void) => {
    along.cancel();
    later.cancel();
    stop();
    reset();
    setCounted(0);
    go();
  };

  return (
    <ActivityFrame
      area={area}
      activity={activity}
      profile={profile}
      eyebrow="Count the dots"
      title={<>How many <em>dots?</em></>}
      spoken="How many dots?"
      index={index}
      total={round.length}
      message={solved ? `${item.n} dot${item.n === 1 ? '' : 's'}!` : 'Count them, then tap the number'}
      feedback={solved ? 'right' : null}
      main={{ label: 'Count with me', icon: <ListOrdered size={40} strokeWidth={1.5} aria-hidden />, onPress: () => along.start(item.n) }}
      onReset={() => {
        along.cancel();
        setCounted(0);
      }}
      onPrev={() => move(prev)}
      onNext={() => move(next)}
      hint="Space to count · arrows to move"
    >
      <Dots n={item.n} color={color} counted={counted} onTap={tapDot} />
      <ChoiceTiles
        options={item.choices}
        answer={String(item.n)}
        solved={solved}
        wrong={wrong}
        color={color}
        label={v => `Number ${v}`}
        onChoose={v =>
          check(v, String(item.n), () => {
            setCounted(item.n);
            speak(`${item.n}!`);
            later(() => praise(), 900);
          })
        }
      />
    </ActivityFrame>
  );
}

// ---------- More or fewer ----------

type Side = 'left' | 'right';

export function MoreOrFewer({ area, activity, profile }: ActivityProps) {
  const round = useMemo(() => {
    const items = range(1, ROUND_SIZE).map(i => {
      let a = 0;
      let b = 0;
      while (Math.abs(a - b) < Math.max(1, COMPARE.minGap)) {
        a = rand(COMPARE.min, COMPARE.max);
        b = rand(COMPARE.min, COMPARE.max);
      }
      return { a, b, ask: (i % 2 ? 'more' : 'fewer') as 'more' | 'fewer' };
    });
    // Big differences are easier, so they come first.
    return items.sort((x, y) => Math.abs(y.a - y.b) - Math.abs(x.a - x.b));
  }, []);
  const { index, next, prev } = useRound(area, activity, round.length);
  const item = round[index];
  const { solved, wrong, check, reset } = useAnswer();
  const later = useLater();
  const question = `Which has ${item.ask}?`;
  const answer: Side = (item.ask === 'more') === item.a > item.b ? 'left' : 'right';
  const groups: { side: Side; n: number; color: ModuleColor }[] = [
    { side: 'left', n: item.a, color: 8 },
    { side: 'right', n: item.b, color: 3 },
  ];

  useSayOnShow(question, index);

  const choose = (side: Side) =>
    check(side, answer, () => {
      const big = Math.max(item.a, item.b);
      const small = Math.min(item.a, item.b);
      speak(item.ask === 'more' ? `Yes! ${big} is more than ${small}.` : `Yes! ${small} is fewer than ${big}.`);
      later(() => praise(), 2400);
    });

  return (
    <ActivityFrame
      area={area}
      activity={activity}
      profile={profile}
      eyebrow="More or fewer"
      title={<>Which has <em>{item.ask}?</em></>}
      spoken={question}
      index={index}
      total={round.length}
      message={solved ? (item.ask === 'more' ? `${Math.max(item.a, item.b)} is more!` : `${Math.min(item.a, item.b)} is fewer!`) : 'Tap the group'}
      feedback={solved ? 'right' : null}
      main={{ label: 'Hear it', icon: <Speaker />, onPress: () => speak(question), ariaLabel: 'Hear the question' }}
      onPrev={() => {
        later.cancel();
        reset();
        prev();
      }}
      onNext={() => {
        later.cancel();
        reset();
        next();
      }}
      hint="Space to hear it · arrows to move"
    >
      <div className="groups">
        {groups.map(g => {
          const shaking = wrong?.value === g.side;
          const picked = solved && g.side === answer;
          return (
            <button
              key={shaking ? `${g.side}-${wrong.n}` : g.side}
              type="button"
              className={`group-panel${picked ? ' picked' : ''}${shaking ? ' wobble' : ''}`}
              aria-label={`${g.n} dots`}
              onClick={() => choose(g.side)}
            >
              <Dots n={g.n} color={moduleVar(g.color)} size="s" />
              <span className="group-count">{solved ? g.n : ''}</span>
            </button>
          );
        })}
      </div>
    </ActivityFrame>
  );
}

// ---------- Number line hop ----------

export function NumberLine({ area, activity, profile }: ActivityProps) {
  const round = useMemo(() => {
    const span = 3; // numbers shown besides the blank
    const make = (ask: 'after' | 'before') => {
      const start = rand(NUMBER_LINE.min, NUMBER_LINE.max - span);
      const nodes = range(start, start + span);
      const blank = ask === 'after' ? span : 0;
      return { ask, nodes, blank, answer: nodes[blank], given: nodes[ask === 'after' ? span - 1 : 1] };
    };
    const half = ROUND_SIZE / 2;
    // "What comes after" is easier, so it comes first.
    return [...range(1, half).map(() => make('after')), ...range(1, ROUND_SIZE - half).map(() => make('before'))].map(it => ({
      ...it,
      choices: numberChoices(it.answer, NUMBER_LINE.min, NUMBER_LINE.max),
    }));
  }, []);
  const { index, next, prev } = useRound(area, activity, round.length);
  const item = round[index];
  const color = moduleVar(area.color);
  const { solved, wrong, check, reset } = useAnswer();
  const later = useLater();
  const question = `What comes ${item.ask} ${item.given}?`;

  useSayOnShow(question, index);

  const hopAt = solved ? item.blank : item.nodes.indexOf(item.given);

  return (
    <ActivityFrame
      area={area}
      activity={activity}
      profile={profile}
      eyebrow="Number line hop"
      title={<>What comes <em>{item.ask}?</em></>}
      spoken={question}
      index={index}
      total={round.length}
      message={solved ? `${item.answer} comes ${item.ask} ${item.given}!` : question}
      feedback={solved ? 'right' : null}
      main={{ label: 'Hear it', icon: <Speaker />, onPress: () => speak(question), ariaLabel: 'Hear the question' }}
      onPrev={() => {
        later.cancel();
        reset();
        prev();
      }}
      onNext={() => {
        later.cancel();
        reset();
        next();
      }}
      hint="Space to hear it · arrows to move"
    >
      <div className="numline">
        {item.nodes.map((n, k) => {
          const isBlank = k === item.blank && !solved;
          return (
            <div key={k} className="num-stop">
              <span className={`hopper${k === hopAt ? ' here' : ''}${solved && k === hopAt ? ' hopped' : ''}`} aria-hidden>
                <Rabbit size={44} strokeWidth={1.5} />
              </span>
              <span
                className={`num-node${isBlank ? ' blank' : ''}${n === item.given ? ' given' : ''}`}
                style={k === item.blank && solved ? { background: color, borderColor: color } : undefined}
              >
                {isBlank ? '?' : n}
              </span>
            </div>
          );
        })}
      </div>
      <ChoiceTiles
        options={item.choices}
        answer={String(item.answer)}
        solved={solved}
        wrong={wrong}
        color={color}
        label={v => `Number ${v}`}
        onChoose={v =>
          check(v, String(item.answer), () => {
            speak(`${item.answer}! ${item.answer} comes ${item.ask} ${item.given}.`);
            later(() => praise(), 2400);
          })
        }
      />
    </ActivityFrame>
  );
}

// ---------- Adding to ten ----------

export function Adding({ area, activity, profile }: ActivityProps) {
  const round = useMemo(() => {
    const pairs = range(1, ADD.maxTotal - 1).flatMap(a => range(1, ADD.maxTotal - a).map(b => ({ a, b })));
    return shuffle(pairs)
      .slice(0, ROUND_SIZE)
      .sort((x, y) => x.a + x.b - (y.a + y.b))
      .map(p => ({ ...p, sum: p.a + p.b, choices: numberChoices(p.a + p.b, 2, ADD.maxTotal) }));
  }, []);
  const { index, next, prev } = useRound(area, activity, round.length);
  const item = round[index];
  const color = moduleVar(area.color);
  const { solved, wrong, check, reset } = useAnswer();
  const later = useLater();
  const [counted, setCounted] = useState(0);
  const along = useCountAlong(setCounted, n => speak(`${n}!`));
  const question = `${item.a} and ${item.b} make?`;

  useSayOnShow(question, index);

  const move = (go: () => void) => {
    along.cancel();
    later.cancel();
    stop();
    reset();
    setCounted(0);
    go();
  };

  return (
    <ActivityFrame
      area={area}
      activity={activity}
      profile={profile}
      eyebrow="Adding to ten"
      title={<>Put them <em>together</em></>}
      spoken={`Put them together. ${question}`}
      index={index}
      total={round.length}
      message={solved ? `${item.a} and ${item.b} make ${item.sum}!` : `${item.a} and ${item.b} make…`}
      feedback={solved ? 'right' : null}
      main={{ label: 'Count with me', icon: <ListOrdered size={40} strokeWidth={1.5} aria-hidden />, onPress: () => along.start(item.sum) }}
      onReset={() => {
        along.cancel();
        setCounted(0);
      }}
      onPrev={() => move(prev)}
      onNext={() => move(next)}
      hint="Space to count · arrows to move"
    >
      <div className="sum-row" aria-label={question}>
        <div className="sum-part">
          <Dots n={item.a} color={moduleVar(6)} counted={counted} cols={3} size="m" />
          <span className="sum-num">{item.a}</span>
        </div>
        <span className="sum-sign">+</span>
        <div className="sum-part">
          <Dots n={item.b} color={moduleVar(2)} counted={counted} from={item.a + 1} cols={3} size="m" />
          <span className="sum-num">{item.b}</span>
        </div>
        <span className="sum-sign">=</span>
        <span className={`num-node${solved ? '' : ' blank'}`} style={solved ? { background: color, borderColor: color } : undefined}>
          {solved ? item.sum : '?'}
        </span>
      </div>
      <ChoiceTiles
        options={item.choices}
        answer={String(item.sum)}
        solved={solved}
        wrong={wrong}
        color={color}
        label={v => `Number ${v}`}
        onChoose={v =>
          check(v, String(item.sum), () => {
            along.cancel();
            setCounted(item.sum);
            speak(`${item.a} and ${item.b} make ${item.sum}!`);
            later(() => praise(), 2200);
          })
        }
      />
    </ActivityFrame>
  );
}
