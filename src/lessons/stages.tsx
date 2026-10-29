import type { ComponentType, CSSProperties } from 'react';
import { Hand, Pencil, Rabbit } from 'lucide-react';
import { moduleVar, type ModuleColor } from '../data/areas';
import { Picture } from '../components/pictures';
import { Shape } from '../components/Shape';

// The animated scene for each lesson. A stage shows what belongs to the
// current beat (line) of the script in src/data/lessons.ts: things appear,
// light up or move as `beat` counts up.

type StageProps = { beat: number };
const C: ModuleColor[] = [6, 2, 3, 8, 5];
const col = (i: number) => moduleVar(C[i % C.length]);
const fill = (c: string): CSSProperties => ({ background: c, borderColor: c });

function ClapHand({ beat, from, to }: { beat: number; from: number; to: number }) {
  const clapping = beat >= from && beat <= to;
  return (
    <span key={clapping ? `c${beat}` : 'idle'} className={`lesson-hand${clapping ? ' clapping' : ''}`} aria-hidden>
      <Hand size={72} strokeWidth={1.5} />
    </span>
  );
}

function ClapWords({ beat }: StageProps) {
  const parts = ['but', 'ter', 'fly'];
  return (
    <>
      <div className="clap-item syllables">
        {parts.map((p, k) => (
          <span key={k} className="part">
            <span style={{ color: beat >= 2 + k ? col(k) : undefined }}>{p}</span>
            {k < 2 && <span className="sep">·</span>}
          </span>
        ))}
      </div>
      <div className="clap-dots">
        {parts.map((_, k) => (
          <span key={k} className={beat === 2 + k ? 'pop' : undefined} style={beat >= 2 + k ? fill(col(k)) : undefined} />
        ))}
      </div>
      <ClapHand beat={beat} from={2} to={4} />
    </>
  );
}

function ClapSentences({ beat }: StageProps) {
  const words = ['The', 'dog', 'can', 'run.'];
  return (
    <>
      <div className="clap-item words">
        {words.map((w, k) => (
          <span key={k} className="part" style={beat >= 2 + k ? { color: col(k), borderBottomColor: col(k) } : undefined}>
            {w}
          </span>
        ))}
      </div>
      <div className="clap-dots words">
        {words.map((_, k) => (
          <span key={k} className={beat === 2 + k ? 'pop' : undefined} style={beat >= 2 + k ? fill(col(k)) : undefined} />
        ))}
      </div>
      <ClapHand beat={beat} from={2} to={5} />
    </>
  );
}

function SoundItOut({ beat }: StageProps) {
  const letters = ['c', 'a', 't'];
  return (
    <>
      <div className={`letter-row${beat >= 4 ? ' together' : ''}`}>
        {letters.map((l, k) => {
          const lit = beat >= 1 + k;
          return (
            <span key={k} className={`letter-tile${lit ? ' lit' : ''}${beat === 1 + k ? ' saying' : ''}`} style={lit ? fill(col(k)) : undefined}>
              {l}
            </span>
          );
        })}
      </div>
      <span className={`picture-slot${beat >= 6 ? ' shown' : ''}`}>{beat >= 6 && <Picture name="cat" size={96} />}</span>
    </>
  );
}

function FirstSound({ beat }: StageProps) {
  return (
    <>
      <span className={`picture-slot shown${beat === 1 ? ' bounce' : ''}`}>
        <Picture name="sun" size={96} />
      </span>
      <div className="lesson-word">
        <span className={beat >= 2 ? 'first lit-first' : 'first'}>s</span>un
      </div>
      {beat >= 2 && (
        <span className="letter-tile lit bounce" style={fill(moduleVar(6))}>
          s
        </span>
      )}
    </>
  );
}

function Apple({ n, show }: { n: number; show: boolean }) {
  return (
    <span className={`apple${show ? ' in' : ''}`}>
      <svg viewBox="0 0 40 44" width="64" height="70" aria-hidden>
        <path d="M20 10c-4-6-12-6-16 1-5 9 1 27 9 30 3 1 5-1 7-1s4 2 7 1c8-3 14-21 9-30-4-7-12-7-16-1z" fill="var(--module-6)" />
        <path d="M20 10q1-6 5-8" stroke="var(--plum-950)" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M22 6q6-4 10 0q-6 3-10 0z" fill="var(--module-4)" />
      </svg>
      <span className="apple-n">{show ? n : ''}</span>
    </span>
  );
}

function CountDots({ beat }: StageProps) {
  return (
    <div className="apples">
      {[1, 2, 3, 4, 5].map(n => (
        <Apple key={n} n={n} show={beat >= n} />
      ))}
    </div>
  );
}

function Plate({ n, glow, label }: { n: number; glow: boolean; label?: string }) {
  return (
    <div className={`plate${glow ? ' glow' : ''}`}>
      <div className="cookies">
        {Array.from({ length: n }, (_, i) => (
          <span key={i} className="cookie" />
        ))}
      </div>
      <span className="plate-label">{label}</span>
    </div>
  );
}

function MoreFewer({ beat }: StageProps) {
  return (
    <div className="plates">
      <Plate n={6} glow={beat === 1 || beat >= 3} label={beat >= 1 ? 'more' : ''} />
      <Plate n={2} glow={beat >= 2} label={beat >= 2 ? 'fewer' : ''} />
    </div>
  );
}

function NumberLine({ beat }: StageProps) {
  const at = beat >= 4 ? 2 : beat >= 2 ? 3 : 2;
  return (
    <div className="numline">
      {[0, 1, 2, 3, 4, 5].map(n => (
        <div key={n} className="num-stop">
          <span key={n === at ? `h${beat}` : n} className={`hopper${n === at ? ' here hopped' : ''}`} aria-hidden>
            <Rabbit size={44} strokeWidth={1.5} />
          </span>
          <span className={`num-node${n === at ? ' given' : ''}`}>{n}</span>
        </div>
      ))}
    </div>
  );
}

function Adding({ beat }: StageProps) {
  const counted = beat >= 3 ? Math.min(beat - 2, 5) : 0;
  const ball = (i: number, c: string) => (
    <span key={i} className={`ball${i < counted ? ' counted' : ''}`} style={{ background: c }}>
      {i < counted ? i + 1 : ''}
    </span>
  );
  return (
    <>
      <div className={`ball-row${beat >= 2 ? ' together' : ''}`}>
        <span className="ball-group">{[0, 1, 2].map(i => ball(i, moduleVar(6)))}</span>
        <span className={`sum-sign${beat >= 2 ? ' gone' : ''}`}>+</span>
        <span className={`ball-group${beat >= 1 ? '' : ' hidden'}`}>{[3, 4].map(i => ball(i, moduleVar(2)))}</span>
      </div>
      <div className="lesson-word">{beat >= 8 ? '3 + 2 = 5' : beat >= 1 ? '3 + 2' : '3'}</div>
    </>
  );
}

function Patterns({ beat }: StageProps) {
  const seq = ['circle', 'square', 'circle', 'square'] as const;
  const colour = (k: number) => (k % 2 ? moduleVar(5) : moduleVar(6));
  const group = (k: number) => (beat === 1 && k < 2) || (beat === 2 && k >= 2 && k < 4);
  return (
    <div className="pattern-row lesson-pattern">
      {seq.map((s, k) => (
        <span key={k} className={`pattern-slot${group(k) ? ' lift' : ''}`}>
          <Shape kind={s} color={colour(k)} size={80} />
        </span>
      ))}
      <span className={`pattern-slot${beat >= 4 ? ' filled' : ' blank'}${beat === 3 ? ' pulse' : ''}`}>
        {beat >= 4 ? <Shape kind="circle" color={moduleVar(6)} size={80} /> : '?'}
      </span>
    </div>
  );
}

function OddOneOut({ beat }: StageProps) {
  const items = ['star', 'star', 'circle', 'star'] as const;
  return (
    <div className="letter-row">
      {items.map((s, k) => (
        <span
          key={k === 2 ? `odd${beat >= 1 ? beat : 0}` : k}
          className={`letter-tile shape-tile${k === 2 && beat >= 1 ? ' wobble' : ''}${k === 2 && beat >= 2 ? ' lit' : ''}`}
        >
          <Shape kind={s} color={moduleVar(4)} size={84} />
        </span>
      ))}
    </div>
  );
}

function Sorting({ beat }: StageProps) {
  const items = [
    { shape: 'circle', bin: 0 },
    { shape: 'triangle', bin: 1 },
    { shape: 'square', bin: 0 },
    { shape: 'star', bin: 1 },
  ] as const;
  const colour = (bin: number) => (bin === 0 ? moduleVar(6) : moduleVar(5));
  return (
    <>
      <div className="sort-tray">
        {items.map((it, k) =>
          beat >= k + 1 ? null : (
            <span key={k} className="sort-item">
              <Shape kind={it.shape} color={colour(it.bin)} size={60} />
            </span>
          ),
        )}
      </div>
      <div className="bins">
        {['red', 'blue'].map((name, b) => (
          <div key={b} className="bin">
            <span className="bin-label">
              <Shape kind="circle" color={colour(b)} size={40} />
              {name}
            </span>
            <span className="bin-items">
              {items.map((it, k) =>
                it.bin === b && beat >= k + 1 ? (
                  <span key={k} className="drop-in">
                    <Shape kind={it.shape} color={colour(b)} size={44} />
                  </span>
                ) : null,
              )}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

function Memory({ beat }: StageProps) {
  const faces = ['cat', 'sun', 'cat', 'dog'] as const;
  const up = (i: number) => (beat >= 1 && beat <= 2 && (i === 0 || i === 1)) || (beat >= 3 && (i === 0 || i === 2));
  const matched = (i: number) => beat >= 3 && (i === 0 || i === 2);
  return (
    <div className="memory-grid" style={{ ['--cols' as string]: 4 }}>
      {faces.map((f, i) => (
        <span key={i} className={`memory-card${up(i) ? ' up' : ''}${matched(i) ? ' matched' : ''}`}>
          <span className="memory-inner">
            <span className="memory-back" />
            <span className="memory-face">
              <Picture name={f} size={56} />
              <span className="memory-word">{f}</span>
            </span>
          </span>
        </span>
      ))}
    </div>
  );
}

function Simon({ beat }: StageProps) {
  const pads: ModuleColor[] = [6, 5, 4, 8];
  const lit = beat >= 1 && beat <= 3 ? beat - 1 : -1;
  return (
    <div className={`simon${beat >= 5 ? ' replay' : ''}`}>
      {pads.map((c, i) => (
        <span key={i} className={`simon-pad${lit === i ? ' lit' : ''}`} style={{ background: moduleVar(c), ['--i' as string]: i }} />
      ))}
    </div>
  );
}

function Draw({ beat }: StageProps) {
  return (
    <div className="lesson-board">
      <svg viewBox="0 0 300 160" aria-hidden>
        <path className="draw-line" d="M20 120c30-80 60-80 80 0s50 80 80 0 50-80 90-10" stroke="var(--module-6)" strokeWidth="9" fill="none" strokeLinecap="round" />
        {beat >= 1 && (
          <g className="drop-in">
            <path d="M220 30l6 13 14 2-10 10 2 14-12-7-12 7 2-14-10-10 14-2z" fill="var(--module-8)" />
          </g>
        )}
        {beat >= 1 && beat !== 2 && <circle className="drop-in" cx="250" cy="120" r="18" fill="var(--module-3)" />}
      </svg>
      <span className="lesson-pencil" aria-hidden>
        <Pencil size={44} strokeWidth={1.5} />
      </span>
    </div>
  );
}

export const STAGES: Record<string, ComponentType<StageProps>> = {
  'reading/clap-words': ClapWords,
  'reading/clap-sentences': ClapSentences,
  'reading/sound-it-out': SoundItOut,
  'reading/first-sound': FirstSound,
  'numbers/count-dots': CountDots,
  'numbers/more-fewer': MoreFewer,
  'numbers/number-line': NumberLine,
  'numbers/adding': Adding,
  'logic/patterns': Patterns,
  'logic/odd-one-out': OddOneOut,
  'logic/sorting': Sorting,
  'play/memory': Memory,
  'play/simon': Simon,
  'play/draw': Draw,
};
