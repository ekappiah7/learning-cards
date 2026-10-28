import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import { Eye, Pencil, Undo2, Volume2 } from 'lucide-react';
import { moduleVar } from '../data/areas';
import { DRAW_COLOURS, MEMORY_BOARDS, MEMORY_WORDS, SIMON_LENGTHS, SIMON_PADS, STAMPS } from '../data/play';
import type { ShapeKind } from '../data/thinking';
import { praise, speak, stop } from '../speech';
import { useLevel } from '../store';
import { line } from '../voice/phrases';
import { ActivityFrame, useRound } from '../components/ActivityFrame';
import { useLater, useSayOnShow } from '../components/Choices';
import { Picture } from '../components/pictures';
import { Shape, SHAPE_PATHS } from '../components/Shape';
import { shuffle } from './util';
import type { ActivityProps } from './index';

const Speaker = () => <Volume2 size={40} strokeWidth={1.5} aria-hidden />;

// ---------- Memory match ----------

type Face = { key: string; spoken: string; word?: (typeof MEMORY_WORDS)[number]; number?: number };

function makeBoard(b: (typeof MEMORY_BOARDS)[1][number]): Face[] {
  const faces: Face[] =
    b.kind === 'numbers'
      ? shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).slice(0, b.pairs).map(n => ({ key: `n${n}`, spoken: String(n), number: n }))
      : shuffle(MEMORY_WORDS).slice(0, b.pairs).map(w => ({ key: w.word, spoken: w.word, word: w }));
  return shuffle([...faces, ...faces]);
}

export function MemoryMatch({ area, activity, profile }: ActivityProps) {
  const level = useLevel(area.id);
  const round = useMemo(() => MEMORY_BOARDS[level].map(makeBoard), [level]);
  const { index, next, prev } = useRound(area, activity, round.length);
  const cards = round[index];
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const later = useLater();
  const done = matched.size * 2 === cards.length;

  useSayOnShow('Find the pairs', index);

  const resetCard = () => {
    later.cancel();
    setOpen([]);
    setMatched(new Set());
  };

  const flip = (i: number) => {
    if (open.length === 2 || open.includes(i) || matched.has(cards[i].key)) return;
    speak(cards[i].spoken);
    if (open.length === 0) {
      setOpen([i]);
      return;
    }
    const first = open[0];
    setOpen([first, i]);
    if (cards[first].key === cards[i].key) {
      const m = new Set(matched).add(cards[i].key);
      later(() => {
        setMatched(m);
        setOpen([]);
        if (m.size * 2 === cards.length) {
          speak('You found all the pairs!');
          later(() => praise(), 1800);
        } else speak('A pair!');
      }, 700);
    } else {
      // Not a pair: both turn back over after a moment. No penalty.
      later(() => setOpen([]), 1300);
    }
  };

  const cols = cards.length <= 6 ? 3 : 4;

  return (
    <ActivityFrame
      area={area}
      activity={activity}
      profile={profile}
      eyebrow="Memory match"
      title={<>Find the <em>pairs</em></>}
      spoken="Find the pairs. Turn over two cards."
      index={index}
      total={round.length}
      message={done ? 'All pairs found!' : 'Turn over two cards'}
      feedback={done ? 'right' : null}
      main={{ label: 'Hear it', icon: <Speaker />, onPress: () => speak('Find the pairs. Turn over two cards.'), ariaLabel: 'Hear what to do' }}
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
      <div className={`memory-grid n${cards.length}`} style={{ ['--cols' as string]: cols }}>
        {cards.map((c, i) => {
          const up = open.includes(i) || matched.has(c.key);
          return (
            <button
              key={`${index}-${i}`}
              type="button"
              className={`memory-card${up ? ' up' : ''}${matched.has(c.key) ? ' matched' : ''}`}
              aria-label={up ? c.spoken : 'Hidden card'}
              onClick={() => flip(i)}
            >
              <span className="memory-inner">
                <span className="memory-back" aria-hidden />
                <span className="memory-face" aria-hidden>
                  {c.number !== undefined ? (
                    <span className="memory-number">{c.number}</span>
                  ) : c.word ? (
                    <>
                      <Picture name={c.word.picture} size={56} />
                      <span className="memory-word">{c.word.word}</span>
                    </>
                  ) : null}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </ActivityFrame>
  );
}

// ---------- Copy the colours (Simon) ----------

// A random sequence with no colour twice in a row, since a pad lighting
// twice running is hard for young children to see.
function makeSequence(n: number) {
  const seq: number[] = [];
  while (seq.length < n) {
    const pad = Math.floor(Math.random() * SIMON_PADS.length);
    if (pad !== seq[seq.length - 1]) seq.push(pad);
  }
  return seq;
}

export function Simon({ area, activity, profile }: ActivityProps) {
  const level = useLevel(area.id);
  const round = useMemo(() => SIMON_LENGTHS[level].map(makeSequence), [level]);
  const { index, next, prev } = useRound(area, activity, round.length);
  const seq = round[index];
  const [lit, setLit] = useState<number | null>(null);
  // Starts true so the first demo plays before the child's turn.
  const [playing, setPlaying] = useState(true);
  const [pos, setPos] = useState(0);
  const [wrong, setWrong] = useState<{ pad: number; n: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const later = useLater();
  const done = pos >= seq.length;

  const clear = () => clearTimeout(timer.current);
  useEffect(() => clear, []);

  // Light each pad in turn and say its colour.
  const play = useCallback(() => {
    clear();
    later.cancel();
    setPos(0);
    setPlaying(true);
    const step = (k: number) => {
      if (k >= seq.length) {
        setLit(null);
        setPlaying(false);
        speak('Your turn!');
        return;
      }
      setLit(seq[k]);
      speak(SIMON_PADS[seq[k]].name);
      timer.current = setTimeout(() => {
        setLit(null);
        timer.current = setTimeout(() => step(k + 1), 250);
      }, 650);
    };
    timer.current = setTimeout(() => step(0), 400);
  }, [seq]);

  // Watch the new sequence as soon as each card appears.
  useEffect(() => {
    timer.current = setTimeout(play, 500);
    return clear;
  }, [play]);

  const tap = (pad: number) => {
    if (playing || done) return;
    clear();
    setLit(pad);
    timer.current = setTimeout(() => setLit(null), 300);
    speak(SIMON_PADS[pad].name);
    if (pad === seq[pos]) {
      const p = pos + 1;
      setPos(p);
      setWrong(null);
      if (p >= seq.length) {
        later(() => speak('You copied it!'), 500);
        later(() => praise(), 1800);
      }
    } else {
      setWrong(w => ({ pad, n: (w?.n ?? 0) + 1 }));
      setPos(0);
      speak('Oops! Watch again.');
      later(play, 1600);
    }
  };

  const move = (go: () => void) => {
    clear();
    later.cancel();
    stop();
    setLit(null);
    setPlaying(true);
    setPos(0);
    setWrong(null);
    go();
  };

  return (
    <ActivityFrame
      area={area}
      activity={activity}
      profile={profile}
      eyebrow="Copy the colours"
      title={<>Copy the <em>colours</em></>}
      spoken="Watch the colours, then copy them."
      index={index}
      total={round.length}
      message={done ? 'You copied it!' : playing ? 'Watch…' : 'Your turn!'}
      feedback={done ? 'right' : null}
      main={{ label: 'Watch', icon: <Eye size={40} strokeWidth={1.5} aria-hidden />, onPress: play, ariaLabel: 'Watch the colours again' }}
      onPrev={() => move(prev)}
      onNext={() => move(next)}
      hint="Space to watch · arrows to move"
    >
      <div className="simon">
        {SIMON_PADS.map((p, i) => {
          const shaking = wrong?.pad === i;
          return (
            <button
              key={shaking ? `${i}-${wrong.n}` : i}
              type="button"
              className={`simon-pad${lit === i ? ' lit' : ''}${shaking ? ' wobble' : ''}`}
              style={{ background: moduleVar(p.color) }}
              aria-label={p.name}
              onClick={() => tap(i)}
            />
          );
        })}
      </div>
      <div className="clap-dots words" aria-label={`${Math.min(pos, seq.length)} of ${seq.length}`}>
        {seq.map((pad, k) => (
          <span key={k} style={k < pos ? { background: moduleVar(SIMON_PADS[pad].color), borderColor: moduleVar(SIMON_PADS[pad].color) } : undefined} />
        ))}
      </div>
    </ActivityFrame>
  );
}

// ---------- Draw and stamp ----------

// Marks are stored in 0..1 coordinates so the picture survives resizing.
type Mark =
  | { type: 'pen'; color: string; points: [number, number][] }
  | { type: 'stamp'; color: string; shape: ShapeKind; x: number; y: number }
  | { type: 'clear' };
type Tool = 'pen' | ShapeKind;

const cssColor = (v: string) => {
  const name = v.match(/var\((--[^)]+)\)/)?.[1];
  return name ? getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#5A0B4D' : v;
};

export function DrawBoard({ area, activity, profile }: ActivityProps) {
  const { index, next, prev } = useRound(area, activity, 1);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [color, setColor] = useState<string>(moduleVar(DRAW_COLOURS[0]));
  const [tool, setTool] = useState<Tool>('pen');
  const drawing = useRef<Mark | null>(null);

  const redraw = useCallback(() => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const w = c.width;
    const h = c.height;
    ctx.clearRect(0, 0, w, h);
    const lastClear = marks.map(m => m.type).lastIndexOf('clear');
    const all = [...marks.slice(lastClear + 1), ...(drawing.current ? [drawing.current] : [])];
    for (const m of all) {
      if (m.type === 'pen') {
        ctx.strokeStyle = cssColor(m.color);
        ctx.lineWidth = Math.max(6, w / 70);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        m.points.forEach(([x, y], i) => (i ? ctx.lineTo(x * w, y * h) : ctx.moveTo(x * w, y * h)));
        if (m.points.length === 1) ctx.lineTo(m.points[0][0] * w + 0.1, m.points[0][1] * h);
        ctx.stroke();
      } else if (m.type === 'stamp') {
        const size = Math.max(48, w / 9);
        ctx.save();
        ctx.translate(m.x * w - size / 2, m.y * h - size / 2);
        ctx.scale(size / 100, size / 100);
        ctx.fillStyle = cssColor(m.color);
        ctx.fill(new Path2D(SHAPE_PATHS[m.shape]));
        ctx.restore();
      }
    }
  }, [marks]);

  // Match the canvas pixels to its on-screen size.
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const fit = () => {
      const r = c.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      c.width = Math.round(r.width * dpr);
      c.height = Math.round(r.height * dpr);
      redraw();
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(c);
    return () => ro.disconnect();
  }, [redraw]);

  const at = (e: PointerEvent<HTMLCanvasElement>): [number, number] => {
    const r = e.currentTarget.getBoundingClientRect();
    return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height];
  };

  const onDown = (e: PointerEvent<HTMLCanvasElement>) => {
    const [x, y] = at(e);
    if (tool === 'pen') {
      e.currentTarget.setPointerCapture(e.pointerId);
      drawing.current = { type: 'pen', color, points: [[x, y]] };
      redraw();
    } else {
      setMarks(m => [...m, { type: 'stamp', color, shape: tool, x, y }]);
    }
  };
  const onMove = (e: PointerEvent<HTMLCanvasElement>) => {
    const d = drawing.current;
    if (d?.type !== 'pen') return;
    d.points.push(at(e));
    redraw();
  };
  const onUp = () => {
    const d = drawing.current;
    drawing.current = null;
    if (d) setMarks(m => [...m, d]);
  };

  const undo = () => {
    speak('Undo');
    setMarks(m => m.slice(0, -1));
  };
  const clearPage = () => {
    speak('New page');
    setMarks(m => (m.length && m[m.length - 1].type !== 'clear' ? [...m, { type: 'clear' }] : m));
  };

  return (
    <ActivityFrame
      area={area}
      activity={activity}
      profile={profile}
      eyebrow="Draw and stamp"
      title={<>Draw and <em>stamp</em></>}
      spoken="Draw and stamp. Pick a colour, then draw or stamp."
      index={index}
      total={1}
      main={{ label: 'Undo', icon: <Undo2 size={40} strokeWidth={1.5} aria-hidden />, onPress: undo, ariaLabel: 'Undo the last mark' }}
      onReset={clearPage}
      onPrev={prev}
      onNext={next}
      hint="Space to undo"
      toolbar={
        <div className="draw-tools">
          <div className="swatches" role="group" aria-label="Colours">
            {[...DRAW_COLOURS.map(moduleVar), 'var(--plum-700)'].map(c => (
              <button
                key={c}
                type="button"
                className="swatch"
                aria-label="Colour"
                aria-pressed={c === color}
                style={{ background: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
          <div className="swatches" role="group" aria-label="Tools">
            <button
              type="button"
              className="tool-btn"
              aria-label="Pen"
              aria-pressed={tool === 'pen'}
              onClick={() => {
                setTool('pen');
                speak('Pen');
              }}
            >
              <Pencil size={36} strokeWidth={1.5} aria-hidden />
            </button>
            {STAMPS.map(s => (
              <button
                key={s}
                type="button"
                className="tool-btn"
                aria-label={`${s} stamp`}
                aria-pressed={tool === s}
                onClick={() => {
                  setTool(s);
                  speak(line.stamp(s));
                }}
              >
                <Shape kind={s} color={color} size={40} />
              </button>
            ))}
          </div>
        </div>
      }
    >
      <canvas
        ref={canvas}
        className="draw-canvas"
        aria-label="Drawing board"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      />
    </ActivityFrame>
  );
}
