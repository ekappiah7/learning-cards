import { useMemo, useRef, useState, type PointerEvent } from 'react';
import { Volume2 } from 'lucide-react';
import { moduleVar } from '../data/areas';
import { COLOURS, ODD_ONE_OUT, ODD_ONE_OUT_ITEMS, PATTERNS, SHAPES, SORT_BY, SORT_ITEMS, type ShapeKind } from '../data/thinking';
import { praise, speak } from '../speech';
import { ActivityFrame, useRound } from '../components/ActivityFrame';
import { ChoiceTiles, useAnswer, useLater, useSayOnShow } from '../components/Choices';
import { Shape } from '../components/Shape';
import { shuffle } from './util';
import type { ActivityProps } from './index';

// ---------- shared helpers ----------

// A shape token: which shape, which colour (index into COLOURS), and size.
type Token = { shape: ShapeKind; colour: number; big?: boolean };

const tokenId = (t: Token) => `${t.shape}-${t.colour}${t.big ? '-big' : ''}`;
const colourName = (i: number) => COLOURS[i].name;
const shapeName = (k: ShapeKind) => SHAPES.find(s => s.kind === k)?.name ?? k;
const tokenName = (t: Token) => `${t.big === undefined ? '' : t.big ? 'big ' : 'small '}${colourName(t.colour)} ${shapeName(t.shape)}`;
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const colourIndexes = () => shuffle(COLOURS.map((_, i) => i));
const shapeKinds = () => shuffle(SHAPES.map(s => s.kind));

function TokenShape({ t, size = 72 }: { t: Token; size?: number }) {
  return <Shape kind={t.shape} color={moduleVar(COLOURS[t.colour].color)} size={t.big === undefined ? size : t.big ? size * 1.3 : size * 0.7} />;
}

const Speaker = () => <Volume2 size={40} strokeWidth={1.5} aria-hidden />;

// ---------- What comes next ----------

function makePattern(unit: string) {
  const letters = [...new Set(unit)];
  const kinds = shapeKinds();
  const cols = colourIndexes();
  const tokenFor: Record<string, Token> = {};
  letters.forEach((l, i) => (tokenFor[l] = { shape: kinds[i], colour: cols[i] }));
  const shown = Math.min(unit.length * 2 + 1, 7);
  const seq = Array.from({ length: shown }, (_, i) => tokenFor[unit[i % unit.length]]);
  const answer = tokenFor[unit[shown % unit.length]];
  const options = letters.map(l => tokenFor[l]);
  while (options.length < 3) options.push({ shape: kinds[options.length % kinds.length], colour: cols[options.length] });
  const byId = Object.fromEntries(options.map(t => [tokenId(t), t]));
  return { seq, answer, byId, choices: shuffle(Object.keys(byId)) };
}

export function Patterns({ area, activity, profile }: ActivityProps) {
  const round = useMemo(() => PATTERNS.map(makePattern), []);
  const { index, next, prev } = useRound(area, activity, round.length);
  const item = round[index];
  const { solved, wrong, check, reset } = useAnswer();
  const later = useLater();
  const question = 'What comes next?';

  useSayOnShow(question, index);

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
      eyebrow="Patterns"
      title={<>What comes <em>next?</em></>}
      spoken={question}
      index={index}
      total={round.length}
      message={solved ? `${tokenName(item.answer)}!` : 'Look at the pattern'}
      feedback={solved ? 'right' : null}
      main={{
        label: 'Hear it',
        icon: <Speaker />,
        ariaLabel: 'Hear the pattern',
        onPress: () => speak(`${item.seq.map(tokenName).join(', ')}. What comes next?`),
      }}
      onPrev={() => move(prev)}
      onNext={() => move(next)}
      hint="Space to hear it · arrows to move"
    >
      <div className="pattern-row">
        {item.seq.map((t, k) => (
          <button key={k} type="button" className="pattern-slot" aria-label={tokenName(t)} onClick={() => speak(tokenName(t))}>
            <TokenShape t={t} />
          </button>
        ))}
        <span className={`pattern-slot${solved ? ' filled' : ' blank'}`} aria-label={solved ? tokenName(item.answer) : 'What comes next?'}>
          {solved ? <TokenShape t={item.answer} /> : '?'}
        </span>
      </div>
      <ChoiceTiles
        options={item.choices}
        answer={tokenId(item.answer)}
        solved={solved}
        wrong={wrong}
        color={moduleVar(area.color)}
        label={id => tokenName(item.byId[id])}
        render={id => <TokenShape t={item.byId[id]} size={80} />}
        className="letter-tile shape-tile"
        onChoose={id =>
          check(id, tokenId(item.answer), () => {
            speak(`Yes! ${tokenName(item.answer)}.`);
            later(() => praise(), 1500);
          })
        }
      />
    </ActivityFrame>
  );
}

// ---------- Odd one out ----------

function makeOdd(mode: 'colour' | 'shape' | 'size') {
  const [c1, c2] = colourIndexes();
  const [s1, s2] = shapeKinds();
  const oddBig = Math.random() < 0.5;
  const base: Token = mode === 'size' ? { shape: s1, colour: c1, big: !oddBig } : { shape: s1, colour: c1 };
  const odd: Token =
    mode === 'colour' ? { shape: s1, colour: c2 } : mode === 'shape' ? { shape: s2, colour: c1 } : { shape: s1, colour: c1, big: oddBig };
  const oddAt = Math.floor(Math.random() * ODD_ONE_OUT_ITEMS);
  const items = Array.from({ length: ODD_ONE_OUT_ITEMS }, (_, i) => (i === oddAt ? odd : base));
  const why = mode === 'size' ? (oddBig ? 'bigger' : 'smaller') : `a different ${mode}`;
  return { items, oddAt, why };
}

export function OddOneOut({ area, activity, profile }: ActivityProps) {
  const round = useMemo(() => ODD_ONE_OUT.map(makeOdd), []);
  const { index, next, prev } = useRound(area, activity, round.length);
  const item = round[index];
  const { solved, wrong, check, reset } = useAnswer();
  const later = useLater();
  const question = 'Which one is different?';

  useSayOnShow(question, index);

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
      eyebrow="Odd one out"
      title={<>Which one is <em>different?</em></>}
      spoken={question}
      index={index}
      total={round.length}
      message={solved ? `That one is ${item.why}!` : 'Tap the odd one out'}
      feedback={solved ? 'right' : null}
      main={{ label: 'Hear it', icon: <Speaker />, onPress: () => speak(question), ariaLabel: 'Hear the question' }}
      onPrev={() => move(prev)}
      onNext={() => move(next)}
      hint="Space to hear it · arrows to move"
    >
      <ChoiceTiles
        options={item.items.map((_, i) => String(i))}
        answer={String(item.oddAt)}
        solved={solved}
        wrong={wrong}
        color={moduleVar(area.color)}
        label={i => tokenName(item.items[+i])}
        render={i => <TokenShape t={item.items[+i]} size={84} />}
        className="letter-tile shape-tile odd-tile"
        onChoose={i =>
          check(i, String(item.oddAt), () => {
            speak(`Yes! That one is ${item.why}.`);
            later(() => praise(), 1800);
          })
        }
      />
    </ActivityFrame>
  );
}

// ---------- Sort them ----------

type SortBy = 'colour' | 'shape' | 'size';
type Bin = { name: string; label: Token; outline?: boolean };

function makeSort(by: SortBy) {
  const cols = colourIndexes();
  const kinds = shapeKinds();
  const half = Math.ceil(SORT_ITEMS / 2);
  const bins: Bin[] =
    by === 'colour'
      ? [0, 1].map(i => ({ name: colourName(cols[i]), label: { shape: 'circle', colour: cols[i] } }))
      : by === 'shape'
        ? [0, 1].map(i => ({ name: `${shapeName(kinds[i])}s`, label: { shape: kinds[i], colour: 0 }, outline: true }))
        : [
            { name: 'big', label: { shape: 'circle', colour: 0, big: true }, outline: true },
            { name: 'small', label: { shape: 'circle', colour: 0, big: false }, outline: true },
          ];
  const items = Array.from({ length: SORT_ITEMS }, (_, i) => {
    const bin = i < half ? 0 : 1;
    const t: Token =
      by === 'colour'
        ? { shape: pick(kinds), colour: cols[bin] }
        : by === 'shape'
          ? { shape: kinds[bin], colour: pick(cols) }
          : { shape: pick(kinds), colour: pick(cols), big: bin === 0 };
    return { id: i, t, bin };
  });
  return { by, bins, items: shuffle(items) };
}

export function Sorting({ area, activity, profile }: ActivityProps) {
  const round = useMemo(() => SORT_BY.map(makeSort), []);
  const { index, next, prev } = useRound(area, activity, round.length);
  const card = round[index];
  const later = useLater();
  const [placed, setPlaced] = useState<Record<number, number>>({});
  const [selected, setSelected] = useState<number | null>(null);
  const [wrong, setWrong] = useState<{ id: number; n: number } | null>(null);
  const [drag, setDrag] = useState<{ id: number; x: number; y: number } | null>(null);
  const start = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null);
  const question = `Sort them by ${card.by}`;
  const done = card.items.every(it => placed[it.id] !== undefined);

  useSayOnShow(question, index);

  const resetCard = () => {
    later.cancel();
    setPlaced({});
    setSelected(null);
    setWrong(null);
    setDrag(null);
  };

  const drop = (id: number, bin: number) => {
    const it = card.items.find(x => x.id === id);
    setSelected(null);
    setDrag(null);
    if (!it || placed[id] !== undefined) return;
    if (it.bin === bin) {
      const nextPlaced = { ...placed, [id]: bin };
      setPlaced(nextPlaced);
      setWrong(null);
      if (card.items.every(x => nextPlaced[x.id] !== undefined)) {
        speak('All sorted!');
        later(() => praise(), 1200);
      } else speak(card.bins[bin].name);
    } else {
      setWrong(w => ({ id, n: (w?.n ?? 0) + 1 }));
      speak('Try again');
    }
  };

  // Drag with a finger or mouse; a short tap selects instead, and tapping a
  // box then puts the selected shape in it.
  const onDown = (e: PointerEvent<HTMLButtonElement>, id: number) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { id, x: e.clientX, y: e.clientY, moved: false };
  };
  const onMove = (e: PointerEvent<HTMLButtonElement>) => {
    const s = start.current;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (!s.moved && Math.hypot(dx, dy) < 10) return;
    s.moved = true;
    setDrag({ id: s.id, x: dx, y: dy });
  };
  const onUp = (e: PointerEvent<HTMLButtonElement>) => {
    const s = start.current;
    start.current = null;
    if (!s) return;
    if (!s.moved) {
      setSelected(sel => (sel === s.id ? null : s.id));
      const it = card.items.find(x => x.id === s.id);
      if (it) speak(tokenName(it.t));
      return;
    }
    const el = e.currentTarget;
    el.style.visibility = 'hidden';
    const under = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>('[data-bin]');
    el.style.visibility = '';
    if (under) drop(s.id, Number(under.dataset.bin));
    else setDrag(null);
  };

  const left = card.items.filter(it => placed[it.id] === undefined);

  return (
    <ActivityFrame
      area={area}
      activity={activity}
      profile={profile}
      eyebrow="Sort them"
      title={<>Sort them by <em>{card.by}</em></>}
      spoken={question}
      index={index}
      total={round.length}
      message={done ? 'All sorted!' : 'Drag each one into a box'}
      feedback={done ? 'right' : null}
      main={{ label: 'Hear it', icon: <Speaker />, onPress: () => speak(`${question}. ${card.bins[0].name} or ${card.bins[1].name}?`), ariaLabel: 'Hear the question' }}
      onReset={resetCard}
      onPrev={() => {
        resetCard();
        prev();
      }}
      onNext={() => {
        resetCard();
        next();
      }}
      hint="Space to hear it · arrows to move"
    >
      <div className="sort-tray" aria-label="Shapes to sort">
        {left.map(it => {
          const dragging = drag?.id === it.id;
          const shaking = wrong?.id === it.id;
          return (
            <button
              key={shaking ? `${it.id}-${wrong.n}` : it.id}
              type="button"
              className={`sort-item${selected === it.id ? ' selected' : ''}${dragging ? ' dragging' : ''}${shaking ? ' wobble' : ''}`}
              style={dragging ? { transform: `translate(${drag.x}px, ${drag.y}px) scale(1.1)` } : undefined}
              aria-label={tokenName(it.t)}
              aria-pressed={selected === it.id}
              onPointerDown={e => onDown(e, it.id)}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={() => {
                start.current = null;
                setDrag(null);
              }}
            >
              <TokenShape t={it.t} size={60} />
            </button>
          );
        })}
      </div>

      <div className="bins">
        {card.bins.map((b, i) => (
          <button
            key={i}
            type="button"
            data-bin={i}
            className="bin"
            aria-label={`${b.name} box`}
            onClick={() => (selected !== null ? drop(selected, i) : speak(b.name))}
          >
            <span className="bin-label">
              {b.outline ? (
                <Shape kind={b.label.shape} color="var(--text-heading)" size={b.label.big === false ? 32 : 48} outline />
              ) : (
                <TokenShape t={b.label} size={40} />
              )}
              {b.name}
            </span>
            <span className="bin-items">
              {card.items
                .filter(it => placed[it.id] === i)
                .map(it => (
                  <TokenShape key={it.id} t={it.t} size={44} />
                ))}
            </span>
          </button>
        ))}
      </div>
    </ActivityFrame>
  );
}
