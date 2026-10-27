import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw, Star } from 'lucide-react';
import { moduleVar, type Activity, type Area } from '../data/areas';
import { navigate } from '../router';
import { speak, stop } from '../speech';
import { useStore, type Profile } from '../store';
import { BackButton, TopBar } from './ui';
import { PlayerChip } from '../screens/Home';

// Items per round before the reward screen.
export const ROUND_SIZE = 6;

export type ActionButton = { label: string; icon?: ReactNode; onPress: () => void; ariaLabel?: string };

export type Feedback = 'right' | 'wrong' | null;

// Tracks the current item in a round and finishes the round with a star.
export function useRound(area: Area, activity: Activity, total: number) {
  const { awardStar } = useStore();
  const [index, setIndex] = useState(0);

  const finish = useCallback(() => {
    stop();
    awardStar(area.id, activity.id);
    navigate({ name: 'reward', areaId: area.id, activityId: activity.id });
  }, [area.id, activity.id, awardStar]);

  const next = useCallback(() => {
    if (index >= total - 1) finish();
    else setIndex(index + 1);
  }, [index, total, finish]);

  const prev = useCallback(() => setIndex(i => Math.max(0, i - 1)), []);
  const restart = useCallback(() => setIndex(0), []);

  return { index: Math.min(index, Math.max(total - 1, 0)), next, prev, restart };
}

type Props = {
  area: Area;
  activity: Activity;
  profile: Profile;
  eyebrow: string;
  title: ReactNode;
  spoken: string;
  toolbar?: ReactNode;          // optional chips above the card
  index: number;
  total: number;
  children: ReactNode;          // the item being learned
  message?: ReactNode;          // short feedback line under the item
  feedback?: Feedback;          // colour pop or gentle wobble on the card
  main: ActionButton;           // the big action; Space presses it
  extra?: ActionButton[];       // smaller actions beside the main one
  onReset?: () => void;         // round "again" button in the card corner
  onPrev: () => void;
  onNext: () => void;
  hint?: string;                // keyboard hint, shown on wide screens
};

// One task on screen at a time. Title at the top, the item in a single
// card, the main action under it, and Back / Next always at the bottom.
export function ActivityFrame(p: Props) {
  const color = moduleVar(p.area.color);
  const last = p.index >= p.total - 1;

  // Keep the latest handlers in a ref so the key listener is added once.
  const h = useRef(p);
  h.current = p;

  useEffect(() => {
    const isTyping = (t: EventTarget | null) => t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement;
    const onDown = (e: KeyboardEvent) => {
      if (isTyping(e.target) || e.repeat) return;
      if (e.code === 'Space') {
        e.preventDefault();
        h.current.main.onPress();
      } else if (e.key === 'ArrowRight') h.current.onNext();
      else if (e.key === 'ArrowLeft') h.current.onPrev();
    };
    // Stop Space from also clicking whichever button has focus.
    const onUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isTyping(e.target)) e.preventDefault();
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
      stop();
    };
  }, []);

  return (
    <div className="page activity-page fade-in">
      <TopBar
        eyebrow={p.eyebrow}
        title={p.title}
        spoken={p.spoken}
        left={<BackButton label={p.area.title} onClick={() => navigate({ name: 'area', areaId: p.area.id })} />}
        right={<PlayerChip profile={p.profile} />}
      />

      {p.toolbar}

      <main className={`activity-card${p.feedback ? ` is-${p.feedback}` : ''}`}>
        {p.onReset && (
          <button
            type="button"
            className="icon-btn small card-corner"
            aria-label="Again"
            onClick={() => {
              speak('Again');
              p.onReset?.();
            }}
          >
            <RotateCcw size={32} strokeWidth={1.5} aria-hidden />
          </button>
        )}
        <div className="pips" aria-label={`Card ${p.index + 1} of ${p.total}`}>
          {Array.from({ length: p.total }, (_, i) => (
            <span key={i} className={i === p.index ? 'now' : undefined} style={i <= p.index ? { background: color, borderColor: color } : undefined} />
          ))}
        </div>

        {p.children}

        <div className="message" aria-live="polite">{p.message}</div>

        <div className="main-actions">
          <button type="button" className="pill primary big" aria-label={p.main.ariaLabel} onClick={p.main.onPress}>
            {p.main.icon}
            {p.main.label}
          </button>
          {p.extra?.map(a => (
            <button key={a.label} type="button" className="pill secondary" aria-label={a.ariaLabel} onClick={a.onPress}>
              {a.icon}
              {a.label}
            </button>
          ))}
        </div>
      </main>

      <nav className="activity-nav">
        <button
          type="button"
          className="pill secondary"
          disabled={p.index === 0}
          onClick={() => {
            speak('Back');
            p.onPrev();
          }}
        >
          <ArrowLeft size={32} strokeWidth={1.5} aria-hidden /> Back
        </button>
        {p.hint && <div className="hint">{p.hint}</div>}
        <button
          type="button"
          className="pill primary"
          onClick={() => {
            if (!last) speak('Next');
            p.onNext();
          }}
        >
          {last ? (
            <>
              Finish <Star size={32} strokeWidth={1.5} aria-hidden />
            </>
          ) : (
            <>
              Next <ArrowRight size={32} strokeWidth={1.5} aria-hidden />
            </>
          )}
        </button>
      </nav>
    </div>
  );
}

// A row of choice chips, e.g. "1 clap", "2 claps". Each one says its label.
export function Chips({ items, active, onPick }: { items: { label: string; spoken?: string }[]; active: number; onPick: (i: number) => void }) {
  return (
    <div className="chips" role="group">
      {items.map((c, i) => (
        <button
          key={c.label}
          type="button"
          className="chip-btn"
          aria-pressed={i === active}
          onClick={() => {
            speak(c.spoken ?? c.label);
            onPick(i);
          }}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
