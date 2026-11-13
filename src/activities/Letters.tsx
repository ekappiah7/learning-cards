import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import { moduleVar } from '../data/areas';
import {
  ABC_ORDER, ALPHABET, FIND_LETTER_POOL, LETTERS, LETTER_CHOICES, LETTER_SETS, LOOK_ALIKE, letterIsFor, letterName,
} from '../data/letters';
import { praise, speak, type Speech } from '../speech';
import { sfx } from '../sound';
import { starKey, useLevel } from '../store';
import { line } from '../voice/phrases';
import { ActivityFrame, Chips, useRound } from '../components/ActivityFrame';
import { ChoiceTiles, useAnswer, useLater, useSayOnShow } from '../components/Choices';
import { Picture } from '../components/pictures';
import { Speaker } from './common';
import { pickRound, shuffle } from './util';
import type { ActivityProps } from './index';

// Letters that make the same sound are never offered together.
const SAME_SOUND: Record<string, string> = { c: 'k', k: 'c' };

function letterChoices(answer: string, pool: string[], count: number, lookAlike: boolean) {
  const alike = lookAlike ? (LOOK_ALIKE[answer] ?? []) : [];
  const rest = shuffle(pool.filter(l => l !== answer && l !== SAME_SOUND[answer] && !alike.includes(l)));
  return shuffle([answer, ...[...alike, ...rest].slice(0, count - 1)]);
}

// Chips to pick one of the letter groups; starts on the group after the
// last one finished, so children move through the alphabet.
function useLetterSet({ area, activity, profile }: ActivityProps) {
  const stars = profile.stars[starKey(area.id, activity.id)] ?? 0;
  const [set, setSet] = useState(stars % LETTER_SETS.length);
  const chips = LETTER_SETS.map((s, i) => ({ label: s.join(' '), spoken: line.group(i + 1) }));
  return { set, setSet, chips, letters: LETTER_SETS[set] };
}

// ---------- Meet the letters ----------

export function MeetLetters(props: ActivityProps) {
  const { area, activity, profile } = props;
  const { set, setSet, chips, letters } = useLetterSet(props);
  const { index, next, prev, restart } = useRound(area, activity, letters.length);
  const l = letters[index];
  const info = LETTERS[l];
  const said: Speech = [{ letter: l }, letterName(l), letterIsFor(l)];
  const at = info.word.indexOf(l);

  useSayOnShow(said, set * 10 + index);

  return (
    <ActivityFrame
      area={area}
      activity={activity}
      profile={profile}
      eyebrow="Meet the letters"
      title={<>Meet the <em>letters</em></>}
      spoken="Tap the letter to hear its sound."
      toolbar={
        <Chips
          items={chips}
          active={set}
          onPick={i => {
            setSet(i);
            restart();
          }}
        />
      }
      index={index}
      total={letters.length}
      message={`${letterName(l)} ${letterIsFor(l)}`}
      main={{ label: 'Hear it', icon: <Speaker />, onPress: () => speak(said), ariaLabel: 'Hear the letter' }}
      onPrev={prev}
      onNext={next}
      hint="Space to hear it · arrows to move"
    >
      <div className="meet">
        <button
          type="button"
          key={l}
          className="meet-letter"
          style={{ background: moduleVar(area.color) }}
          aria-label={`Letter ${l}`}
          onClick={() => {
            sfx('pop');
            speak([{ letter: l }]);
          }}
        >
          <span>{l.toUpperCase()}</span>
          <span>{l}</span>
        </button>
        <button type="button" key={`p-${l}`} className="picture-slot shown large" aria-label={`Hear ${info.word}`} onClick={() => speak(info.word)}>
          <Picture name={info.picture} size="78%" />
        </button>
      </div>
      <div className="lesson-word meet-word">
        {info.word.slice(0, at)}
        <span className="lit-first">{l}</span>
        {info.word.slice(at + 1)}
      </div>
    </ActivityFrame>
  );
}

// ---------- Trace the letter ----------

// A square board with a big faint letter. The child draws over it; when
// most of the letter is covered, it fills in.
function TraceBoard({ glyph, color, done, onDone, resetKey }: { glyph: string; color: string; done: boolean; onDone: () => void; resetKey: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const geo = useRef({ size: 0, font: '', x: 0, y: 0, pen: 10 });
  const targets = useRef<{ x: number; y: number; hit: boolean }[]>([]);
  const hits = useRef(0);
  const last = useRef<{ x: number; y: number } | null>(null);
  const finished = useRef(false);

  const paintLetter = (ctx: CanvasRenderingContext2D, fill: string, dashed: boolean) => {
    const g = geo.current;
    ctx.font = g.font;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = fill;
    ctx.fillText(glyph, g.x, g.y);
    if (dashed) {
      ctx.setLineDash([g.size * 0.02, g.size * 0.02]);
      ctx.lineWidth = Math.max(2, g.size * 0.006);
      ctx.strokeStyle = cssColor('--line-strong');
      ctx.strokeText(glyph, g.x, g.y);
      ctx.setLineDash([]);
    }
  };

  // Set up the board for this letter.
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    let cancelled = false;
    finished.current = false;
    const setup = () => {
      if (cancelled) return;
      const dpr = window.devicePixelRatio || 1;
      const size = Math.max(120, Math.round(c.getBoundingClientRect().width * dpr));
      c.width = size;
      c.height = size;
      const ctx = c.getContext('2d');
      if (!ctx) return;
      // Scale the letter so its real outline fills about 70% of the board.
      const family = '"DM Sans", system-ui, sans-serif';
      ctx.font = `700 100px ${family}`;
      const m = ctx.measureText(glyph);
      const w = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
      const h = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
      const px = (100 * size * 0.7) / Math.max(w, h, 1);
      const k = px / 100;
      geo.current = {
        size,
        font: `700 ${px}px ${family}`,
        x: (size - w * k) / 2 + m.actualBoundingBoxLeft * k,
        y: (size - h * k) / 2 + m.actualBoundingBoxAscent * k,
        pen: size * 0.085,
      };
      ctx.clearRect(0, 0, size, size);
      paintLetter(ctx, cssColor('--cream-300'), true);
      // Sample points inside the letter; covering them counts as tracing.
      const off = document.createElement('canvas');
      off.width = size;
      off.height = size;
      const octx = off.getContext('2d', { willReadFrequently: true });
      if (!octx) return;
      const g = geo.current;
      octx.font = g.font;
      octx.fillText(glyph, g.x, g.y);
      const data = octx.getImageData(0, 0, size, size).data;
      const step = Math.max(4, Math.round(size / 56));
      const pts: { x: number; y: number; hit: boolean }[] = [];
      for (let y = 0; y < size; y += step) for (let x = 0; x < size; x += step) if (data[(y * size + x) * 4 + 3] > 128) pts.push({ x, y, hit: false });
      targets.current = pts;
      hits.current = 0;
      c.dataset.progress = '0';
    };
    (document.fonts?.load(`700 100px "DM Sans"`) ?? Promise.resolve()).then(setup, setup);
    return () => {
      cancelled = true;
    };
    // paintLetter only reads refs and the glyph.
  }, [glyph, resetKey]);

  // Fill the letter in once traced.
  useEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (done && ctx && geo.current.size) {
      ctx.clearRect(0, 0, geo.current.size, geo.current.size);
      paintLetter(ctx, color, false);
    }
  }, [done, color]);

  const at = (e: PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const k = geo.current.size / r.width;
    return { x: (e.clientX - r.left) * k, y: (e.clientY - r.top) * k };
  };

  const mark = (x: number, y: number) => {
    const r2 = (geo.current.pen * 0.62) ** 2;
    for (const t of targets.current) {
      if (!t.hit && (t.x - x) ** 2 + (t.y - y) ** 2 <= r2) {
        t.hit = true;
        hits.current++;
      }
    }
  };

  const draw = (e: PointerEvent<HTMLCanvasElement>) => {
    const c = ref.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx || !last.current || finished.current) return;
    const p = at(e);
    const from = last.current;
    ctx.strokeStyle = color;
    ctx.lineWidth = geo.current.pen;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    const steps = Math.max(1, Math.ceil(Math.hypot(p.x - from.x, p.y - from.y) / (geo.current.pen * 0.4)));
    for (let i = 0; i <= steps; i++) mark(from.x + ((p.x - from.x) * i) / steps, from.y + ((p.y - from.y) * i) / steps);
    last.current = p;
    const progress = targets.current.length ? hits.current / targets.current.length : 0;
    c.dataset.progress = progress.toFixed(2);
    if (progress >= 0.82 && !finished.current) {
      finished.current = true;
      onDone();
    }
  };

  return (
    <canvas
      ref={ref}
      className={`trace-board${done ? ' done' : ''}`}
      aria-label={`Trace the letter ${glyph}`}
      onPointerDown={e => {
        e.currentTarget.setPointerCapture(e.pointerId);
        last.current = at(e);
        draw(e);
      }}
      onPointerMove={draw}
      onPointerUp={() => (last.current = null)}
      onPointerCancel={() => (last.current = null)}
    />
  );
}

function cssColor(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#5A0B4D';
}

export function TraceLetters(props: ActivityProps) {
  const { area, activity, profile } = props;
  const level = useLevel(area.id);
  const { set, setSet, chips, letters } = useLetterSet(props);
  const { index, next, prev, restart } = useRound(area, activity, letters.length);
  const l = letters[index];
  // Harder: every other letter is a capital.
  const glyph = level === 3 && index % 2 === 1 ? l.toUpperCase() : l;
  const [done, setDone] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const later = useLater();
  const said: Speech = ['Trace the letter', { letter: l }];
  const color = cssColor(`--module-${area.color}`);

  useSayOnShow(said, set * 10 + index);

  const fresh = () => {
    later.cancel();
    setDone(false);
    setResetKey(k => k + 1);
  };

  return (
    <ActivityFrame
      area={area}
      activity={activity}
      profile={profile}
      eyebrow="Trace the letter"
      title={<>Trace the <em>letter</em></>}
      spoken="Use your finger to trace the letter."
      toolbar={
        <Chips
          items={chips}
          active={set}
          onPick={i => {
            fresh();
            setSet(i);
            restart();
          }}
        />
      }
      index={index}
      total={letters.length}
      message={done ? `${letterName(l)} ${letterIsFor(l)}` : 'Trace it with your finger'}
      feedback={done ? 'right' : null}
      main={{ label: 'Hear it', icon: <Speaker />, onPress: () => speak(said), ariaLabel: 'Hear the letter sound' }}
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
      <TraceBoard
        key={`${set}-${index}`}
        glyph={glyph}
        color={color}
        done={done}
        resetKey={resetKey}
        onDone={() => {
          setDone(true);
          sfx('right');
          speak([{ letter: l }, letterName(l), letterIsFor(l)]);
          later(() => praise(), 2600);
        }}
      />
    </ActivityFrame>
  );
}

// ---------- Find the letter ----------

export function FindLetter({ area, activity, profile }: ActivityProps) {
  const level = useLevel(area.id);
  const round = useMemo(
    () => pickRound(FIND_LETTER_POOL[level]).map(l => ({ l, choices: letterChoices(l, FIND_LETTER_POOL[level], LETTER_CHOICES[level], level === 3) })),
    [level],
  );
  const { index, next, prev } = useRound(area, activity, round.length);
  const item = round[index];
  const { solved, wrong, check, reset } = useAnswer();
  const later = useLater();
  const said: Speech = ['Which letter says', { letter: item.l }];

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
      eyebrow="Find the letter"
      title={<>Which <em>letter</em> is it?</>}
      spoken={said}
      index={index}
      total={round.length}
      message={solved ? `${letterName(item.l)} ${letterIsFor(item.l)}` : 'Listen, then tap the letter'}
      feedback={solved ? 'right' : null}
      main={{ label: 'Hear it', icon: <Speaker />, onPress: () => speak(said), ariaLabel: 'Hear the sound' }}
      onPrev={() => move(prev)}
      onNext={() => move(next)}
      hint="Space to hear it · arrows to move"
    >
      {solved && (
        <span className="picture-slot shown">
          <Picture name={LETTERS[item.l].picture} size="70%" />
        </span>
      )}
      <ChoiceTiles
        options={item.choices}
        answer={item.l}
        solved={solved}
        wrong={wrong}
        color={moduleVar(area.color)}
        label={v => `Letter ${v}`}
        onChoose={v =>
          check(v, item.l, () => {
            speak([{ letter: item.l }, letterName(item.l), letterIsFor(item.l)]);
            later(() => praise(), 2800);
          })
        }
      />
    </ActivityFrame>
  );
}

// ---------- Big and small letters ----------

export function BigSmall({ area, activity, profile }: ActivityProps) {
  const level = useLevel(area.id);
  const round = useMemo(
    () =>
      pickRound(FIND_LETTER_POOL[level]).map((l, i) => {
        const findSmall = i % 2 === 0;
        const choices = letterChoices(l, FIND_LETTER_POOL[level], LETTER_CHOICES[level], level === 3);
        return { l, findSmall, shown: findSmall ? l.toUpperCase() : l, answer: findSmall ? l : l.toUpperCase(), choices: choices.map(c => (findSmall ? c : c.toUpperCase())) };
      }),
    [level],
  );
  const { index, next, prev } = useRound(area, activity, round.length);
  const item = round[index];
  const { solved, wrong, check, reset } = useAnswer();
  const later = useLater();
  const said: Speech = [item.findSmall ? 'Find the small letter' : 'Find the big letter', letterName(item.l)];

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
      eyebrow="Big and small"
      title={<>Big and <em>small</em> letters</>}
      spoken={said}
      index={index}
      total={round.length}
      message={solved ? `${item.l.toUpperCase()} and ${item.l} are the same letter` : item.findSmall ? 'Find the small letter' : 'Find the big letter'}
      feedback={solved ? 'right' : null}
      main={{ label: 'Hear it', icon: <Speaker />, onPress: () => speak(said), ariaLabel: 'Hear the letter' }}
      onPrev={() => move(prev)}
      onNext={() => move(next)}
      hint="Space to hear it · arrows to move"
    >
      <div className="pair-row">
        <span key={index} className="meet-letter single" style={{ background: moduleVar(area.color) }}>
          <span>{item.shown}</span>
        </span>
        {solved && (
          <span className="meet-letter single pop-in" style={{ background: moduleVar(area.color) }}>
            <span>{item.answer}</span>
          </span>
        )}
      </div>
      <ChoiceTiles
        options={item.choices}
        answer={item.answer}
        solved={solved}
        wrong={wrong}
        color={moduleVar(area.color)}
        label={v => `Letter ${v}`}
        onChoose={v =>
          check(v, item.answer, () => {
            speak([letterName(item.l), { letter: item.l }]);
            later(() => praise(), 1800);
          })
        }
      />
    </ActivityFrame>
  );
}

// ---------- ABC order ----------

export function AbcOrder({ area, activity, profile }: ActivityProps) {
  const level = useLevel(area.id);
  const round = useMemo(() => {
    const { upTo, before } = ABC_ORDER[level];
    const max = ALPHABET.indexOf(upTo);
    const starts = shuffle(Array.from({ length: max - 2 }, (_, i) => i)).slice(0, 6).sort((a, b) => a - b);
    return starts.map((s, i) => {
      const four = ALPHABET.slice(s, s + 4);
      const askBefore = before && i % 2 === 1;
      const blank = askBefore ? 0 : 3;
      const answer = four[blank];
      const near = shuffle(ALPHABET.slice(Math.max(0, s - 3), s + 8).filter(l => !four.includes(l))).slice(0, LETTER_CHOICES[level] - 1);
      return { four, blank, answer, given: four[askBefore ? 1 : 2], askBefore, choices: shuffle([answer, ...near]) };
    });
  }, [level]);
  const { index, next, prev } = useRound(area, activity, round.length);
  const item = round[index];
  const { solved, wrong, check, reset } = useAnswer();
  const later = useLater();
  const color = moduleVar(area.color);
  const said: Speech = [item.askBefore ? 'What comes before' : 'What comes after', letterName(item.given)];

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
      eyebrow="ABC order"
      title={<>What comes <em>{item.askBefore ? 'before' : 'after'}?</em></>}
      spoken={said}
      index={index}
      total={round.length}
      message={solved ? item.four.join('  ') : `What comes ${item.askBefore ? 'before' : 'after'} ${item.given}?`}
      feedback={solved ? 'right' : null}
      main={{ label: 'Hear it', icon: <Speaker />, onPress: () => speak(said), ariaLabel: 'Hear the question' }}
      onPrev={() => move(prev)}
      onNext={() => move(next)}
      hint="Space to hear it · arrows to move"
    >
      <div className="numline letters">
        {item.four.map((l, k) => {
          const isBlank = k === item.blank && !solved;
          return (
            <div key={k} className="num-stop">
              <span
                className={`num-node${isBlank ? ' blank' : ''}${l === item.given ? ' given' : ''}`}
                style={k === item.blank && solved ? { background: color, borderColor: color } : undefined}
              >
                {isBlank ? '?' : l}
              </span>
            </div>
          );
        })}
      </div>
      <ChoiceTiles
        options={item.choices}
        answer={item.answer}
        solved={solved}
        wrong={wrong}
        color={color}
        label={v => `Letter ${v}`}
        onChoose={v =>
          check(v, item.answer, () => {
            speak(item.four.map(letterName));
            later(() => praise(), 2600);
          })
        }
      />
    </ActivityFrame>
  );
}
