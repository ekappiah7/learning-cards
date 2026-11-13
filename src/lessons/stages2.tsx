import type { ComponentType, CSSProperties } from 'react';
import { CircleHelp, Link2, Pointer, Star, Volume2, Zap } from 'lucide-react';
import { moduleVar, type ModuleColor } from '../data/areas';
import { LESSONS } from '../data/lessons';
import { PIANO_NOTES } from '../data/play';
import { STORIES, type Story } from '../data/stories';
import { Picture } from '../components/pictures';
import { Scene } from '../components/Scene';
import { Shape } from '../components/Shape';
import { Geo } from '../components/Geo';
import { lineMs } from '../speech';

// More lesson scenes (see stages.tsx). `step` counts the notes played after
// a line, for the scenes that have music.

export type StageProps = { beat: number; step?: number };
const C: ModuleColor[] = [6, 2, 3, 8, 5];
const col = (i: number) => moduleVar(C[i % C.length]);
const fill = (c: string): CSSProperties => ({ background: c, borderColor: c });
const show = (on: boolean): CSSProperties | undefined => (on ? undefined : { visibility: 'hidden' });

// A finger that taps whatever it sits on.
const Tap = () => (
  <span className="lesson-tap" aria-hidden>
    <Pointer size={52} strokeWidth={1.5} />
  </span>
);

function MeetStage({ beat }: StageProps) {
  const lively = beat === 2 || beat === 4;
  return (
    <>
      <div className="meet">
        <span key={lively ? `w${beat}` : 'l'} className={`meet-letter single tap-spot${lively ? ' ls-wobble' : ''}`} style={{ background: moduleVar(7) }}>
          s
          {beat === 4 && <Tap />}
        </span>
        <span className={`picture-slot${beat >= 3 ? ' shown' : ''}`}>{beat >= 3 && <Picture name="sun" size={96} />}</span>
      </div>
      <div className="lesson-word meet-word">
        {beat >= 3 ? (
          <>
            <span className="lit-first">s</span>un
          </>
        ) : beat >= 1 ? (
          'S'
        ) : (
          ' '
        )}
      </div>
    </>
  );
}

function FindLetterStage({ beat }: StageProps) {
  return (
    <>
      <span key={beat === 1 ? 'on' : 'off'} className={`lesson-speaker${beat === 1 ? ' sounding' : ''}`}>
        <Volume2 size={72} strokeWidth={1.5} />
      </span>
      <div className="letter-row" style={show(beat >= 2)}>
        {['s', 'm', 't'].map(l => {
          const hit = l === 'm' && beat >= 3;
          return (
            <span key={hit ? 'hit' : `${l}${beat >= 2}`} className={`letter-tile small${hit ? ' lit bounce' : beat >= 2 ? ' pop-in' : ''}`} style={hit ? fill(col(0)) : undefined}>
              {l}
            </span>
          );
        })}
      </div>
    </>
  );
}

function BigSmallStage({ beat }: StageProps) {
  const same = beat === 3 || beat === 4;
  const tile = (glyph: string, from: number, colour: ModuleColor) => (
    <span
      key={same ? `${glyph}${beat}` : `${glyph}${beat >= from}`}
      className={`meet-letter single${same ? ' ls-wobble' : ''}`}
      style={{ background: moduleVar(colour), ...show(beat >= from) }}
    >
      {glyph}
    </span>
  );
  return (
    <div className="pair-row">
      {tile('B', 1, 7)}
      <span className={`pair-link${beat >= 5 ? ' on' : ''}`}>
        <Link2 size={44} strokeWidth={1.5} />
      </span>
      {tile('b', 2, 2)}
    </div>
  );
}

function AbcStage({ beat }: StageProps) {
  return (
    <div className="numline letters">
      {['a', 'b', 'c', 'd'].map((l, k) => {
        const blank = k === 3 && beat < 5;
        const now = (k < 3 && beat === k + 1) || (k === 3 && beat === 5);
        return (
          <div key={k} className="num-stop">
            <span
              key={now ? `n${beat}` : 'n'}
              className={`num-node${blank ? ' blank' : ''}${k < 3 && beat >= k + 1 ? ' given' : ''}${now ? ' pop-in' : ''}${k === 3 && beat === 4 ? ' ls-pulse' : ''}`}
              style={k === 3 && beat >= 5 ? fill(moduleVar(7)) : undefined}
            >
              {blank ? '?' : l}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function MissingStage({ beat }: StageProps) {
  const found = beat >= 4;
  const lively = beat === 1 || beat === 5;
  return (
    <>
      <span className={`ls-wrap${lively ? ' bounce' : ''}`}>
        <span className="picture-slot shown">
          <Picture name="cat" size={96} />
        </span>
      </span>
      <div className={`slots${beat === 2 ? ' ls-sounding' : ''}`}>
        {['c', 'a', 't'].map((l, k) => {
          const blank = k === 0 && !found;
          return (
            <span
              key={k === 0 && found ? 'found' : k}
              className={`slot${blank ? ' asked' : ' filled'}${blank && beat === 3 ? ' ls-pulse' : ''}`}
              style={k === 0 && found ? fill(col(0)) : undefined}
            >
              {blank ? '?' : l}
            </span>
          );
        })}
      </div>
    </>
  );
}

function ReadMatchStage({ beat }: StageProps) {
  return (
    <>
      <div className={`read-word${beat === 1 ? ' ls-sounding' : ''}`}>
        {['d', 'o', 'g'].map((l, k) => (
          <span key={k} className={beat === 2 ? 'on' : undefined}>
            {l}
          </span>
        ))}
      </div>
      <div className="letter-row" style={show(beat >= 3)}>
        {(['cat', 'dog', 'sun'] as const).map(p => {
          const hit = p === 'dog' && beat >= 4;
          return (
            <span key={hit ? 'hit' : `${p}${beat >= 3}`} className={`picture-slot shown${hit ? ' glow' : ''}${beat >= 4 && !hit ? ' dim' : ''}`}>
              <Picture name={p} size={96} />
            </span>
          );
        })}
      </div>
    </>
  );
}

function TrickyStage({ beat }: StageProps) {
  return (
    <>
      <span key={beat <= 1 ? `z${beat}` : 'z'} className={`lesson-zap${beat <= 1 ? ' bounce' : ''}`}>
        <Zap size={64} strokeWidth={1.5} />
      </span>
      <div className="letter-row">
        {['the', 'to', 'no'].map((w, k) => {
          const on = beat >= k + 2;
          return (
            <span key={`${w}${on}`} className={`letter-tile word-tile${on ? ' pop-in lit' : ''}`} style={on ? fill(col(k)) : show(false)}>
              {w}
            </span>
          );
        })}
      </div>
    </>
  );
}

function BuildSentenceStage({ beat }: StageProps) {
  const words = ['The', 'dog', 'can', 'run.'];
  const placed = Math.max(0, Math.min(beat - 1, words.length));
  return (
    <>
      <div className="sentence-line">
        {words.map((w, k) => (
          <span key={k < placed ? `f${k}` : k} className={`word-slot${k < placed ? ' filled' : ''}`}>
            {k < placed ? w : ''}
          </span>
        ))}
      </div>
      <div className="letter-row">
        {[3, 0, 2, 1].map(k => (
          <span key={k} className={`letter-tile word-tile${k < placed ? ' gone' : ''}${beat === 0 ? ' ls-wobble' : ''}`}>
            {words[k]}
          </span>
        ))}
      </div>
    </>
  );
}

// One scene per story: its first picture and sentence, showing how the
// words light up, how to hear a word again, and that questions follow.
function storyStage(st: Story) {
  const page = st.pages[0];
  const words = page.text.split(' ');
  const weights = words.map(w => w.replace(/[.,!?]/g, '').length + 1.5);
  const sum = weights.reduce((a, b) => a + b, 0);
  return function StoryStage({ beat }: StageProps) {
    // Each word is lit for its share of the line, as in the story itself.
    const total = lineMs(page.text, 'jabari') || words.length * 420;
    let t = 60;
    const timing = weights.map(wt => {
      const at = t;
      t += (wt / sum) * total;
      return { animationDelay: `${Math.round(at)}ms`, animationDuration: `${Math.round((wt / sum) * total)}ms` };
    });
    return (
      <>
        <Scene page={page} />
        <div className="story-under">
          {beat <= 1 ? (
            <div key={beat} className={`lesson-word story-title${beat === 1 ? ' pop-in' : ''}`}>{beat === 1 ? st.title : ' '}</div>
          ) : beat === 5 ? (
            <div className="letter-row">
              {[0, 1].map(k => (
                <span key={k} className="story-q pop-in" style={{ animationDelay: `${k * 0.25}s` }}>
                  <CircleHelp size={48} strokeWidth={1.5} />
                </span>
              ))}
            </div>
          ) : (
            <p className={`story-text${beat === 3 ? ' ls-reading' : ''}`}>
              {words.map((w, k) => {
                const tapped = beat === 4 && k === Math.min(1, words.length - 1);
                return (
                  <span key={k} className={`story-word${tapped ? ' on tap-spot' : ''}`} style={beat === 3 ? timing[k] : undefined}>
                    {w}
                    {tapped && <Tap />}
                  </span>
                );
              })}
            </p>
          )}
        </div>
      </>
    );
  };
}

function FindNumberStage({ beat }: StageProps) {
  return (
    <div className="letter-row">
      {[3, 5, 2].map((n, k) => {
        const on = beat >= k + 1;
        const hit = n === 5 && beat >= 5;
        return (
          <span key={n} className="num-card" style={show(on)}>
            <span key={hit ? 'hit' : `${on}`} className={`letter-tile small${hit ? ' lit bounce' : on ? ' pop-in' : ''}`} style={hit ? fill(moduleVar(5)) : undefined}>
              {n}
            </span>
            <span className="num-pips">
              {Array.from({ length: n }, (_, i) => (
                <i key={i} style={{ background: col(k) }} />
              ))}
            </span>
          </span>
        );
      })}
    </div>
  );
}

function ShapeNamesStage({ beat }: StageProps) {
  return (
    <div className="letter-row">
      {(['circle', 'square', 'triangle'] as const).map((kind, k) => {
        const on = beat >= k + 1;
        const hit = kind === 'triangle' && beat >= 5;
        return (
          <span key={kind} className="num-card" style={show(on)}>
            <span key={hit ? 'hit' : `${on}`} className={`letter-tile shape-tile geo-tile${hit ? ' lit bounce' : ''}`}>
              <Geo kind={kind} color={col(k)} size="92%" className={on && !hit ? 'spin-in' : undefined} />
            </span>
            <span className="pic-word">{kind}</span>
          </span>
        );
      })}
    </div>
  );
}

function ShadowStage({ beat }: StageProps) {
  const dark = 'var(--plum-900)';
  return (
    <>
      <div className="shadow-pair">
        <Geo kind="star" color={moduleVar(8)} size="100%" className="geo-big small" />
        {beat >= 1 && <Geo kind="star" color={dark} size="100%" className="geo-big small shadow-slide" />}
      </div>
      <div className="letter-row" style={show(beat >= 2)}>
        {(['circle', 'star', 'square'] as const).map(kind => {
          const hit = kind === 'star' && beat >= 3;
          return (
            <span key={hit ? 'hit' : `${kind}${beat >= 2}`} className={`letter-tile shape-tile geo-tile${hit ? ' lit bounce' : beat >= 2 ? ' pop-in' : ''}`}>
              <Geo kind={kind} color={hit ? moduleVar(8) : dark} size="92%" />
            </span>
          );
        })}
      </div>
    </>
  );
}

function SizeStage({ beat }: StageProps) {
  const sorted = beat >= 5;
  const picked = Math.max(0, Math.min(beat - 1, 3));
  return (
    <div className="size-row">
      {(sorted ? [1, 2, 3] : [2, 3, 1]).map(size => (
        <span key={`${size}${sorted}`} className={`size-item${size <= picked ? ' picked' : ''}${sorted ? ' pop-in' : ''}`}>
          <span className="size-shape" style={{ ['--s' as string]: size / 3 }}>
            <Shape kind="star" color={moduleVar(3)} size={120} />
          </span>
          <span className="size-badge">{size <= picked ? size : ''}</span>
        </span>
      ))}
    </div>
  );
}

function BelongsStage({ beat }: StageProps) {
  return (
    <div className="letter-row">
      {(['bus', 'hat', 'dog'] as const).map((p, k) => {
        const hit = p === 'dog' && beat >= 5;
        return (
          // The wrapper does the bouncing, so the card itself never re-appears.
          <span key={p} className={`ls-wrap${beat === k + 2 ? ' bounce' : ''}`}>
            <span className={`picture-slot shown captioned${hit ? ' glow' : ''}${beat >= 5 && !hit ? ' dim' : ''}`}>
              <span className="pic-face">
                <Picture name={p} size="100%" />
                <span className="pic-word">{p}</span>
              </span>
            </span>
          </span>
        );
      })}
    </div>
  );
}

const BALLOONS: { l: string; x: number; y: number; c: ModuleColor }[] = [
  { l: 's', x: 14, y: 60, c: 6 },
  { l: 'm', x: 32, y: 32, c: 5 },
  { l: 's', x: 50, y: 64, c: 2 },
  { l: 't', x: 68, y: 30, c: 4 },
  { l: 'a', x: 86, y: 58, c: 8 },
];

function PopStage({ beat }: StageProps) {
  return (
    <div className="pop-field lesson-pop">
      {BALLOONS.map((b, i) => {
        const target = b.l === 's';
        const popped = target && beat >= (i === 0 ? 2 : 3);
        return (
          <span key={i} className={`ls-balloon${!target && beat >= 4 ? ' away' : ''}`} style={{ left: `${b.x}%`, top: `${b.y}%`, animationDelay: `${i * -0.7}s` }}>
            <span className={`balloon${popped ? ' popped' : ''}${target && beat === 1 ? ' ls-pulse' : ''}`} style={{ background: moduleVar(b.c) }}>
              {b.l}
            </span>
          </span>
        );
      })}
      {beat >= 5 && (
        <span className="lesson-pop-star pop-in">
          <Star size={88} strokeWidth={1.5} />
        </span>
      )}
    </div>
  );
}

const BARS: ModuleColor[] = [6, 5, 8, 3, 4, 7, 2];

function PianoStage({ beat, step = -1 }: StageProps) {
  const notes = LESSONS['play/piano'][beat]?.notes;
  const lit = notes && step >= 0 ? PIANO_NOTES.indexOf(notes[step]) : -1;
  const point = beat === 1 ? 0 : beat === 2 ? PIANO_NOTES.length - 1 : -1;
  return (
    <div className="piano">
      {PIANO_NOTES.map((_, i) => (
        <span
          key={i}
          className={`piano-bar${lit === i ? ' on' : ''}${point === i ? ' ls-point' : ''}${beat <= 0 ? ' ls-bar-in' : ''}`}
          style={{ background: moduleVar(BARS[i % BARS.length]), height: `${100 - i * 6}%`, animationDelay: `${i * 0.08}s` }}
        />
      ))}
    </div>
  );
}

export const MORE_STAGES: Record<string, ComponentType<StageProps>> = {
  'letters/meet-letters': MeetStage,
  'letters/find-letter': FindLetterStage,
  'letters/big-small': BigSmallStage,
  'letters/abc-order': AbcStage,
  'reading/missing-sound': MissingStage,
  'reading/read-match': ReadMatchStage,
  'reading/tricky-words': TrickyStage,
  'stories/build-sentence': BuildSentenceStage,
  ...Object.fromEntries(STORIES.map(st => [`stories/${st.id}`, storyStage(st)])),
  'numbers/find-number': FindNumberStage,
  'shapes/shape-names': ShapeNamesStage,
  'shapes/shape-shadows': ShadowStage,
  'logic/size-order': SizeStage,
  'logic/belongs': BelongsStage,
  'play/pop-letters': PopStage,
  'play/piano': PianoStage,
};
