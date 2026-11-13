import { useMemo, useState } from 'react';
import { ListOrdered } from 'lucide-react';
import { moduleVar, type ModuleColor } from '../data/areas';
import { GEO, HUNT_PICTURES, SHAPE_CHOICES, SHAPE_NAMES, SIDES_SHAPES, shapeLine, type GeoKind, type HuntShape } from '../data/shapes';
import { praise, speak, stop } from '../speech';
import { sfx } from '../sound';
import { useLevel } from '../store';
import { ActivityFrame, ROUND_SIZE, useRound } from '../components/ActivityFrame';
import { ChoiceTiles, useAnswer, useLater, useSayOnShow } from '../components/Choices';
import { Geo } from '../components/Geo';
import { Speaker, sample } from './common';
import { numberChoices, useCountAlong } from './Numbers';
import { pickRound, shuffle } from './util';
import type { ActivityProps } from './index';

const COLORS: ModuleColor[] = [6, 2, 3, 5, 4, 7, 8];
const colorAt = (i: number) => moduleVar(COLORS[i % COLORS.length]);

// The answer plus other shapes, each with a colour.
function shapeChoices(answer: GeoKind, pool: GeoKind[], count: number) {
  return shuffle([answer, ...shuffle(pool.filter(k => k !== answer)).slice(0, count - 1)]);
}

// ---------- Name the shape ----------

export function ShapeNames({ area, activity, profile }: ActivityProps) {
  const level = useLevel(area.id);
  const round = useMemo(
    () => pickRound(SHAPE_NAMES[level]).map((kind, i) => ({ kind, tint: i, choices: shapeChoices(kind, SHAPE_NAMES[level], SHAPE_CHOICES[level]) })),
    [level],
  );
  const { index, next, prev } = useRound(area, activity, round.length);
  const item = round[index];
  const { solved, wrong, check, reset } = useAnswer();
  const later = useLater();
  const said = shapeLine.find(item.kind);

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
      eyebrow="Name the shape"
      title={<>Find the <em>{GEO[item.kind].name}</em></>}
      spoken={said}
      index={index}
      total={round.length}
      message={solved ? `A ${GEO[item.kind].name}!` : 'Listen, then tap the shape'}
      feedback={solved ? 'right' : null}
      main={{ label: 'Hear it', icon: <Speaker />, onPress: () => speak(said), ariaLabel: 'Hear the shape name' }}
      onPrev={() => move(prev)}
      onNext={() => move(next)}
      hint="Space to hear it · arrows to move"
    >
      <ChoiceTiles
        key={index}
        options={item.choices}
        answer={item.kind}
        solved={solved}
        wrong={wrong}
        color="var(--surface-raised)"
        className="letter-tile shape-tile geo-tile"
        label={v => GEO[v as GeoKind].name}
        render={v => <Geo kind={v as GeoKind} color={colorAt(item.tint + item.choices.indexOf(v as GeoKind))} size="92%" className="spin-in" />}
        onChoose={v =>
          check(v, item.kind, () => {
            speak(GEO[item.kind].name);
            later(() => praise(), 1300);
          })
        }
      />
    </ActivityFrame>
  );
}

// ---------- Sides and corners ----------

export function SidesCorners({ area, activity, profile }: ActivityProps) {
  const level = useLevel(area.id);
  const round = useMemo(() => {
    const pool = SIDES_SHAPES[level];
    const kinds = Array.from({ length: ROUND_SIZE }, (_, i) => shuffle(pool)[i % pool.length]);
    return kinds
      .sort((a, b) => GEO[a].points!.length - GEO[b].points!.length)
      .map((kind, i) => {
        const n = GEO[kind].points!.length;
        return { kind, n, ask: (i % 2 === 0 ? 'sides' : 'corners') as 'sides' | 'corners', tint: i, choices: numberChoices(n, 3, 6, level === 1 ? 2 : 3) };
      });
  }, [level]);
  const { index, next, prev } = useRound(area, activity, round.length);
  const item = round[index];
  const { solved, wrong, check, reset } = useAnswer();
  const later = useLater();
  const [counted, setCounted] = useState(0);
  const along = useCountAlong(setCounted, n => speak(`${n}!`));
  const question = item.ask === 'sides' ? 'How many sides?' : 'How many corners?';
  const answerLine = item.ask === 'sides' ? shapeLine.sides(item.kind) : shapeLine.corners(item.kind);

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
      eyebrow="Sides and corners"
      title={<>How many <em>{item.ask}?</em></>}
      spoken={question}
      index={index}
      total={round.length}
      message={solved ? answerLine : `Count the ${item.ask}`}
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
      <Geo key={index} kind={item.kind} color={colorAt(item.tint)} size="100%" count={counted} show={item.ask} className="geo-big spin-in" />
      <ChoiceTiles
        options={item.choices}
        answer={String(item.n)}
        solved={solved}
        wrong={wrong}
        color={moduleVar(area.color)}
        className="letter-tile small"
        label={v => `Number ${v}`}
        onChoose={v =>
          check(v, String(item.n), () => {
            along.cancel();
            setCounted(item.n);
            speak(answerLine);
            later(() => praise(), 2600);
          })
        }
      />
    </ActivityFrame>
  );
}

// ---------- Shape hunt ----------

const HUNT_NAME: Record<HuntShape['k'], GeoKind> = { circle: 'circle', square: 'square', rectangle: 'rectangle', triangle: 'triangle' };

function HuntPiece({ s, found, shake, onTap }: { s: HuntShape; found: number; shake: boolean; onTap: () => void }) {
  const cx = s.x + s.w / 2;
  const cy = s.y + s.h / 2;
  const fill = moduleVar(s.c);
  const common = {
    fill,
    stroke: found ? 'var(--plum-700)' : 'none',
    strokeWidth: found ? 4 : 0,
    strokeLinejoin: 'round' as const,
    onPointerDown: onTap,
  };
  return (
    <g className={`hunt-piece${found ? ' found' : ''}${shake ? ' wobble' : ''}`} role="button" aria-label={s.k}>
      {s.k === 'circle' ? (
        <ellipse cx={cx} cy={cy} rx={s.w / 2} ry={s.h / 2} {...common} />
      ) : s.k === 'triangle' ? (
        <path d={`M${cx} ${s.y}L${s.x + s.w} ${s.y + s.h}H${s.x}Z`} transform={s.turn ? `rotate(${s.turn} ${cx} ${cy})` : undefined} {...common} />
      ) : (
        <rect x={s.x} y={s.y} width={s.w} height={s.h} rx="2" {...common} />
      )}
      {found > 0 && (
        <text x={cx} y={cy + 5} textAnchor="middle" className="hunt-num">
          {found}
        </text>
      )}
    </g>
  );
}

export function ShapeHunt({ area, activity, profile }: ActivityProps) {
  const round = useMemo(() => {
    const cards = shuffle(HUNT_PICTURES).map(pic => {
      const counts = new Map<HuntShape['k'], number>();
      pic.shapes.forEach(s => counts.set(s.k, (counts.get(s.k) ?? 0) + 1));
      // Prefer a shape that appears at least twice in the picture.
      const many = [...counts].filter(([, n]) => n >= 2).map(([k]) => k);
      const target = sample(many.length ? many : [...counts.keys()]);
      return { pic, target, total: counts.get(target) ?? 0 };
    });
    return cards;
  }, []);
  const { index, next, prev } = useRound(area, activity, round.length);
  const item = round[index];
  const [found, setFound] = useState<number[]>([]);
  const [shake, setShake] = useState<{ i: number; n: number } | null>(null);
  const later = useLater();
  const done = found.length >= item.total;
  const said = shapeLine.tapAll(HUNT_NAME[item.target]);

  useSayOnShow(said, index);

  const fresh = () => {
    later.cancel();
    setFound([]);
    setShake(null);
  };

  const tap = (i: number) => {
    if (done || found.includes(i)) return;
    if (item.pic.shapes[i].k === item.target) {
      const all = [...found, i];
      setFound(all);
      setShake(null);
      sfx('pop');
      if (all.length >= item.total) {
        later(() => {
          sfx('right');
          speak('You found them all!');
          later(() => praise(), 1800);
        }, 500);
      } else speak(String(all.length));
    } else {
      setShake(s => ({ i, n: (s?.n ?? 0) + 1 }));
      sfx('wrong');
      speak('Try again');
    }
  };

  return (
    <ActivityFrame
      area={area}
      activity={activity}
      profile={profile}
      eyebrow="Shape hunt"
      title={<>Find the <em>{GEO[HUNT_NAME[item.target]].plural}</em></>}
      spoken={said}
      index={index}
      total={round.length}
      message={done ? 'You found them all!' : `${found.length} of ${item.total}`}
      feedback={done ? 'right' : null}
      main={{ label: 'Hear it', icon: <Speaker />, onPress: () => speak(said), ariaLabel: 'Hear what to find' }}
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
      <svg key={index} className="hunt-board" data-target={item.target} viewBox="-4 -4 208 158" aria-label={`A ${item.pic.name} made of shapes`}>
        {item.pic.shapes.map((s, i) => (
          <HuntPiece
            key={shake?.i === i ? `${i}-${shake.n}` : i}
            s={s}
            found={found.indexOf(i) + 1}
            shake={shake?.i === i}
            onTap={() => tap(i)}
          />
        ))}
      </svg>
    </ActivityFrame>
  );
}

// ---------- Shape shadows ----------

export function ShapeShadows({ area, activity, profile }: ActivityProps) {
  const level = useLevel(area.id);
  const round = useMemo(
    () =>
      pickRound(SHAPE_NAMES[level]).map((kind, i) => ({
        kind,
        tint: i,
        choices: shapeChoices(kind, SHAPE_NAMES[level], SHAPE_CHOICES[level] + (level === 1 ? 1 : 0)),
        // Harder: shadows are turned a quarter or half way round.
        turns: level === 3 ? [90, 180, 270, 90].map(t => (Math.random() < 0.7 ? t : 0)) : [0, 0, 0, 0],
      })),
    [level],
  );
  const { index, next, prev } = useRound(area, activity, round.length);
  const item = round[index];
  const { solved, wrong, check, reset } = useAnswer();
  const later = useLater();
  const said = 'Find the shadow that fits.';

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
      eyebrow="Shape shadows"
      title={<>Which <em>shadow</em> fits?</>}
      spoken={said}
      index={index}
      total={round.length}
      message={solved ? `A ${GEO[item.kind].name}!` : 'Tap the matching shadow'}
      feedback={solved ? 'right' : null}
      main={{ label: 'Hear it', icon: <Speaker />, onPress: () => speak(said), ariaLabel: 'Hear what to do' }}
      onPrev={() => move(prev)}
      onNext={() => move(next)}
      hint="Space to hear it · arrows to move"
    >
      <Geo key={index} kind={item.kind} color={colorAt(item.tint)} size="100%" className="geo-big small spin-in" />
      <ChoiceTiles
        key={`c${index}`}
        options={item.choices}
        answer={item.kind}
        solved={solved}
        wrong={wrong}
        color="var(--surface-raised)"
        className="letter-tile shape-tile geo-tile"
        label={v => `${GEO[v as GeoKind].name} shadow`}
        render={v => <Geo kind={v as GeoKind} color="var(--plum-900)" size="92%" turn={item.turns[item.choices.indexOf(v as GeoKind)]} />}
        onChoose={v =>
          check(v, item.kind, () => {
            speak(GEO[item.kind].name);
            later(() => praise(), 1300);
          })
        }
      />
    </ActivityFrame>
  );
}
