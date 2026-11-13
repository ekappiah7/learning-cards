import { useEffect, useMemo, useRef, useState } from 'react';
import { ListOrdered, Music } from 'lucide-react';
import { moduleVar, type ModuleColor } from '../data/areas';
import { FIND_NUMBER, NUMBER_CHOICES, TAKE_AWAY } from '../data/numbers';
import { BELONGS_CHOICES, GROUPS, SIZE_ORDER_ITEMS, type ShapeKind } from '../data/thinking';
import { PIANO_NOTES, PIANO_TUNE, POP_LETTERS, POP_TARGETS } from '../data/play';
import { praise, speak, stop, type Speech } from '../speech';
import { currentTheme, playMusic, playNote, sfx } from '../sound';
import { useLevel } from '../store';
import { line } from '../voice/phrases';
import { ActivityFrame, ROUND_SIZE, useRound } from '../components/ActivityFrame';
import { ChoiceTiles, useAnswer, useLater, useSayOnShow } from '../components/Choices';
import type { PictureName } from '../components/pictures';
import { Shape } from '../components/Shape';
import { PicFace, Speaker, sample } from './common';
import { Dots, numberChoices, range, useCountAlong } from './Numbers';
import { shuffle } from './util';
import type { ActivityProps } from './index';

const COLORS: ModuleColor[] = [6, 5, 8, 3, 4, 7, 2];

// ---------- Numbers: find the number ----------

export function FindNumber({ area, activity, profile }: ActivityProps) {
  const level = useLevel(area.id);
  const round = useMemo(() => {
    const { min, max } = FIND_NUMBER[level];
    return shuffle(range(min, max))
      .slice(0, ROUND_SIZE)
      .sort((a, b) => a - b)
      .map(n => ({ n, choices: numberChoices(n, min, max, NUMBER_CHOICES[level] + 1) }));
  }, [level]);
  const { index, next, prev } = useRound(area, activity, round.length);
  const item = round[index];
  const color = moduleVar(area.color);
  const { solved, wrong, check, reset } = useAnswer();
  const later = useLater();
  const said: Speech = ['Find the number', String(item.n)];

  useSayOnShow(said, index);

  const move = (go: () => void) => {
    later.cancel();
    reset();
    go();
  };

  return (
    <ActivityFrame
      area={area}
      activity={activity}
      profile={profile}
      eyebrow="Find the number"
      title={<>Find the <em>number</em></>}
      spoken={said}
      index={index}
      total={round.length}
      message={solved ? `${item.n}!` : 'Listen, then tap the number'}
      feedback={solved ? 'right' : null}
      main={{ label: 'Hear it', icon: <Speaker />, onPress: () => speak(said), ariaLabel: 'Hear the number' }}
      onPrev={() => move(prev)}
      onNext={() => move(next)}
      hint="Space to hear it · arrows to move"
    >
      {solved && <Dots n={item.n} color={color} counted={item.n} cols={item.n > 10 ? 10 : 5} size={item.n > 10 ? 's' : 'm'} />}
      <ChoiceTiles
        options={item.choices}
        answer={String(item.n)}
        solved={solved}
        wrong={wrong}
        color={color}
        label={v => `Number ${v}`}
        onChoose={v =>
          check(v, String(item.n), () => {
            speak(String(item.n));
            later(() => praise(), 1100);
          })
        }
      />
    </ActivityFrame>
  );
}

// ---------- Numbers: take away ----------

export function TakeAway({ area, activity, profile }: ActivityProps) {
  const level = useLevel(area.id);
  const round = useMemo(() => {
    const pairs = range(2, TAKE_AWAY[level].maxStart).flatMap(a => range(1, a - 1).map(b => ({ a, b })));
    return shuffle(pairs)
      .slice(0, ROUND_SIZE)
      .sort((x, y) => x.a - y.a)
      .map(p => ({ ...p, left: p.a - p.b, choices: numberChoices(p.a - p.b, 1, TAKE_AWAY[level].maxStart - 1, NUMBER_CHOICES[level]) }));
  }, [level]);
  const { index, next, prev } = useRound(area, activity, round.length);
  const item = round[index];
  const color = moduleVar(area.color);
  const { solved, wrong, check, reset } = useAnswer();
  const later = useLater();
  const [gone, setGone] = useState(0);
  const [counted, setCounted] = useState(0);
  const along = useCountAlong(setCounted, n => speak(`${n}!`));
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const question = line.takeQuestion(item.a, item.b);

  // Take the dots away one by one as the card opens.
  useEffect(() => {
    setGone(0);
    let k = 0;
    const step = () => {
      k++;
      setGone(k);
      sfx('pop');
      if (k < item.b) timer.current = setTimeout(step, 450);
    };
    timer.current = setTimeout(step, 1900);
    return () => clearTimeout(timer.current);
  }, [index, item.b]);

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
      eyebrow="Take away"
      title={<>Take <em>away</em></>}
      spoken={question}
      index={index}
      total={round.length}
      message={solved ? `${item.a} take away ${item.b} is ${item.left}!` : `${item.a} take away ${item.b} is…`}
      feedback={solved ? 'right' : null}
      main={{
        label: 'Count with me',
        icon: <ListOrdered size={40} strokeWidth={1.5} aria-hidden />,
        onPress: () => {
          clearTimeout(timer.current);
          setGone(item.b);
          along.start(item.left);
        },
      }}
      onReset={() => {
        along.cancel();
        setCounted(0);
      }}
      onPrev={() => move(prev)}
      onNext={() => move(next)}
      hint="Space to count · arrows to move"
    >
      <div className="take-row" aria-label={question}>
        {range(1, item.a).map(k => {
          const away = k > item.a - gone;
          return (
            <span key={k} className={`take-dot${away ? ' away' : ''}${!away && k <= counted ? ' counted' : ''}`} style={{ background: color }}>
              {!away && k <= counted ? k : ''}
            </span>
          );
        })}
      </div>
      <div className="sum-line">
        {item.a} − {item.b} = <span className={solved ? 'sum-answer' : 'sum-answer blank'}>{solved ? item.left : '?'}</span>
      </div>
      <ChoiceTiles
        options={item.choices}
        answer={String(item.left)}
        solved={solved}
        wrong={wrong}
        color={color}
        className="letter-tile small"
        label={v => `Number ${v}`}
        onChoose={v =>
          check(v, String(item.left), () => {
            along.cancel();
            clearTimeout(timer.current);
            setGone(item.b);
            setCounted(item.left);
            speak(line.takeAnswer(item.a, item.b, item.left));
            later(() => praise(), 2600);
          })
        }
      />
    </ActivityFrame>
  );
}

// ---------- Thinking: small to big ----------

const KINDS: ShapeKind[] = ['circle', 'square', 'triangle', 'star'];

export function SizeOrder({ area, activity, profile }: ActivityProps) {
  const level = useLevel(area.id);
  const round = useMemo(
    () =>
      range(0, ROUND_SIZE - 1).map(i => {
        const n = SIZE_ORDER_ITEMS[level];
        const up = i % 2 === 0;
        // Sizes 1..n; `order` is the order they must be tapped in.
        const sizes = shuffle(range(1, n));
        return { kind: KINDS[i % KINDS.length], color: COLORS[i % COLORS.length], up, sizes, n };
      }),
    [level],
  );
  const { index, next, prev } = useRound(area, activity, round.length);
  const item = round[index];
  const [picked, setPicked] = useState<number[]>([]);
  const [shake, setShake] = useState<{ size: number; n: number } | null>(null);
  const later = useLater();
  const done = picked.length >= item.n;
  const said = item.up ? 'Tap from smallest to biggest.' : 'Tap from biggest to smallest.';

  useSayOnShow(said, index);

  const fresh = () => {
    later.cancel();
    setPicked([]);
    setShake(null);
  };

  const tap = (size: number) => {
    if (done || picked.includes(size)) return;
    const want = item.up ? picked.length + 1 : item.n - picked.length;
    if (size === want) {
      const all = [...picked, size];
      setPicked(all);
      setShake(null);
      sfx('pop');
      if (all.length >= item.n) {
        later(() => {
          sfx('right');
          speak('All in order!');
          later(() => praise(), 1500);
        }, 400);
      } else speak(String(all.length));
    } else {
      setShake(s => ({ size, n: (s?.n ?? 0) + 1 }));
      sfx('wrong');
      speak('Try again');
    }
  };

  return (
    <ActivityFrame
      area={area}
      activity={activity}
      profile={profile}
      eyebrow="Small to big"
      title={item.up ? <>Smallest to <em>biggest</em></> : <>Biggest to <em>smallest</em></>}
      spoken={said}
      index={index}
      total={round.length}
      message={done ? 'All in order!' : item.up ? 'Tap the smallest first' : 'Tap the biggest first'}
      feedback={done ? 'right' : null}
      main={{ label: 'Hear it', icon: <Speaker />, onPress: () => speak(said), ariaLabel: 'Hear what to do' }}
      onReset={fresh}
      onPrev={() => {
        fresh();
        prev();
      }}
      onNext={() => {
        fresh();
        next();
      }}
      hint="Space to hear it · arrows to move"
    >
      <div className="size-row" data-up={item.up ? 1 : 0}>
        {item.sizes.map(size => {
          const at = picked.indexOf(size);
          const shaking = shake?.size === size;
          return (
            <button
              key={shaking ? `${index}-${size}-${shake.n}` : `${index}-${size}`}
              type="button"
              className={`size-item${at >= 0 ? ' picked' : ''}${shaking ? ' wobble' : ''}`}
              aria-label={`Size ${size} of ${item.n}`}
              onClick={() => tap(size)}
            >
              <span className="size-shape" style={{ ['--s' as string]: size / item.n }}>
                <Shape kind={item.kind} color={moduleVar(item.color)} size={120} />
              </span>
              <span className="size-badge">{at >= 0 ? at + 1 : ''}</span>
            </button>
          );
        })}
      </div>
    </ActivityFrame>
  );
}

// ---------- Thinking: which one belongs ----------

export function Belongs({ area, activity, profile }: ActivityProps) {
  const level = useLevel(area.id);
  const round = useMemo(() => {
    const order = shuffle(GROUPS);
    return range(0, ROUND_SIZE - 1).map(i => {
        const group = order[i % order.length];
        const answer = sample(group.items);
        const others = shuffle(
          GROUPS.filter(g => g !== group)
            .flatMap(g => g.items)
            .filter(p => !group.items.includes(p) && !group.notWith?.includes(p)),
        ).slice(0, BELONGS_CHOICES[level] - 1);
        return { ask: group.ask, answer, choices: shuffle<PictureName>([answer, ...others]) };
    });
  }, [level]);
  const { index, next, prev } = useRound(area, activity, round.length);
  const item = round[index];
  const { solved, wrong, check, reset } = useAnswer();
  const later = useLater();

  useSayOnShow(item.ask, index);

  const move = (go: () => void) => {
    later.cancel();
    reset();
    go();
  };

  return (
    <ActivityFrame
      area={area}
      activity={activity}
      profile={profile}
      eyebrow="Which one belongs"
      title={<>Which <em>one?</em></>}
      spoken={item.ask}
      index={index}
      total={round.length}
      message={solved ? `${item.answer}!` : item.ask}
      feedback={solved ? 'right' : null}
      main={{ label: 'Hear it', icon: <Speaker />, onPress: () => speak(item.ask), ariaLabel: 'Hear the question' }}
      onPrev={() => move(prev)}
      onNext={() => move(next)}
      hint="Space to hear it · arrows to move"
    >
      <ChoiceTiles
        key={index}
        options={item.choices}
        answer={item.answer}
        solved={solved}
        wrong={wrong}
        color={moduleVar(area.color)}
        className="letter-tile pic-tile"
        label={v => v}
        render={v => <PicFace name={v as PictureName} caption={solved} />}
        onChoose={v =>
          check(v, item.answer, () => {
            speak(item.answer);
            later(() => praise(), 1300);
          })
        }
      />
    </ActivityFrame>
  );
}

// ---------- Play: pop the letters ----------

type Balloon = { id: number; letter: string; color: ModuleColor; left: number; seconds: number; delay: number; popped: boolean };

const BALLOONS = 6;
const POP_CARDS = 4;

export function PopLetters({ area, activity, profile }: ActivityProps) {
  const level = useLevel(area.id);
  const targets = useMemo(() => shuffle(POP_LETTERS[level]).slice(0, POP_CARDS), [level]);
  const { index, next, prev } = useRound(area, activity, targets.length);
  const target = targets[index];
  const later = useLater();
  const [count, setCount] = useState(0);
  const [shake, setShake] = useState<{ id: number; n: number } | null>(null);
  const done = count >= POP_TARGETS;
  const said: Speech = ['Pop the balloons that say', { letter: target }];

  // About half the balloons carry the letter to pop.
  const pickLetter = () => (Math.random() < 0.5 ? target : sample(POP_LETTERS[level].filter(l => l !== target)));
  const make = (id: number): Balloon => ({
    id,
    letter: id % 2 === 0 ? target : pickLetter(),
    color: COLORS[id % COLORS.length],
    left: 4 + ((id * 37) % 6) * 15.5,
    seconds: 7 + ((id * 13) % 5),
    delay: -((id * 29) % 70) / 10,
    popped: false,
  });
  const [balloons, setBalloons] = useState<Balloon[]>(() => range(0, BALLOONS - 1).map(make));

  useEffect(() => {
    setBalloons(range(0, BALLOONS - 1).map(make));
    setCount(0);
    setShake(null);
    // New balloons for each card.
  }, [index]);

  useSayOnShow(said, index);

  const tap = (b: Balloon) => {
    if (done || b.popped) return;
    if (b.letter === target) {
      sfx('pop');
      setBalloons(bs => bs.map(x => (x.id === b.id ? { ...x, popped: true } : x)));
      const n = count + 1;
      setCount(n);
      if (n >= POP_TARGETS) {
        later(() => {
          sfx('right');
          speak('You popped them all!');
          later(() => praise(), 1800);
        }, 300);
      } else speak([{ letter: target }]);
    } else {
      setShake(s => ({ id: b.id, n: (s?.n ?? 0) + 1 }));
      sfx('wrong');
      speak([{ letter: b.letter }]);
    }
  };

  // Each time a balloon floats off the top it comes back with a new letter.
  const recycle = (id: number) => setBalloons(bs => bs.map(x => (x.id === id ? { ...x, letter: pickLetter(), popped: false } : x)));

  return (
    <ActivityFrame
      area={area}
      activity={activity}
      profile={profile}
      eyebrow="Pop the letters"
      title={<>Pop the <em>{target}</em> balloons</>}
      spoken={said}
      index={index}
      total={targets.length}
      message={done ? 'You popped them all!' : `${count} of ${POP_TARGETS}`}
      feedback={done ? 'right' : null}
      main={{ label: 'Hear it', icon: <Speaker />, onPress: () => speak(said), ariaLabel: 'Hear the sound to pop' }}
      onPrev={() => {
        later.cancel();
        prev();
      }}
      onNext={() => {
        later.cancel();
        next();
      }}
      hint="Space to hear it · arrows to move"
    >
      <div className={`pop-field${done ? ' done' : ''}`} data-target={target}>
        {balloons.map(b => {
          const shaking = shake?.id === b.id;
          return (
            <span
              key={`${index}-${b.id}`}
              className="balloon-track"
              style={{ left: `${b.left}%`, animationDuration: `${b.seconds}s`, animationDelay: `${b.delay}s` }}
              onAnimationIteration={() => recycle(b.id)}
            >
              <button
                key={shaking ? `s${shake.n}` : 'b'}
                type="button"
                className={`balloon${b.popped ? ' popped' : ''}${shaking ? ' wobble' : ''}`}
                style={{ background: moduleVar(b.color) }}
                data-letter={b.letter}
                aria-label={`Balloon ${b.letter}`}
                onPointerDown={() => tap(b)}
              >
                {b.letter}
              </button>
            </span>
          );
        })}
      </div>
    </ActivityFrame>
  );
}

// ---------- Play: music maker ----------

export function Piano({ area, activity, profile }: ActivityProps) {
  const { index, next, prev } = useRound(area, activity, 1);
  const [lit, setLit] = useState(-1);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const said = 'Tap the bars to make music.';

  // The background tune stops here so the child's notes are clear.
  useEffect(() => {
    const before = currentTheme();
    playMusic(null);
    return () => {
      timers.current.forEach(clearTimeout);
      playMusic(before);
    };
  }, []);

  useSayOnShow(said, 0);

  const hit = (i: number) => {
    playNote(PIANO_NOTES[i]);
    setLit(i);
    timers.current.push(setTimeout(() => setLit(v => (v === i ? -1 : v)), 260));
  };

  const playTune = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    speak('Listen to my tune.');
    PIANO_TUNE.forEach((bar, k) => {
      if (bar >= 0) timers.current.push(setTimeout(() => hit(bar), 1600 + k * 420));
    });
  };

  return (
    <ActivityFrame
      area={area}
      activity={activity}
      profile={profile}
      eyebrow="Music maker"
      title={<>Music <em>maker</em></>}
      spoken={said}
      index={index}
      total={1}
      main={{ label: 'Play me a tune', icon: <Music size={40} strokeWidth={1.5} aria-hidden />, onPress: playTune }}
      onPrev={prev}
      onNext={next}
      hint="Space to hear a tune"
    >
      <div className="piano">
        {PIANO_NOTES.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`piano-bar${lit === i ? ' on' : ''}`}
            style={{ background: moduleVar(COLORS[i % COLORS.length]), height: `${100 - i * 6}%` }}
            aria-label={`Note ${i + 1}`}
            onPointerDown={() => hit(i)}
          />
        ))}
      </div>
    </ActivityFrame>
  );
}
