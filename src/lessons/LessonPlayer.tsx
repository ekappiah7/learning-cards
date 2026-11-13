import { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, X } from 'lucide-react';
import { LESSONS, type Beat } from '../data/lessons';
import { useStore, type Profile } from '../store';
import type { Activity, Area } from '../data/areas';
import type { ReactNode } from 'react';
import { prepare, setLessonOpen, setMood, speakAndWait, stop, whenQuiet } from '../speech';
import { currentTheme, playMusic, playNote, sfx } from '../sound';
import { Buddy } from '../components/Buddy';
import { STAGES } from './stages';

// Plays one "Watch first" mini-lesson full screen: Jabari and Jamila take
// turns saying the lines while the scene above them acts it out.

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

const caption = (b: Beat) =>
  typeof b.say === 'string' ? b.say : b.say.map(p => (typeof p === 'string' ? p : 'letter' in p ? p.letter : '')).join(' ');

export function hasLesson(key: string) {
  return key in LESSONS && key in STAGES;
}

// The six stories share one "seen" mark, so the cartoon about how stories
// work plays by itself once, not before every story.
export const seenKey = (key: string) => (key.startsWith('stories/story-') ? 'stories/story' : key);

// Shows an activity's cartoon before the activity itself the first time a
// child opens it. The activity only starts once the cartoon is closed, so
// nothing plays or speaks underneath.
export function LessonGate({ area, activity, profile, children }: { area: Area; activity: Activity; profile: Profile; children: ReactNode }) {
  const key = `${area.id}/${activity.id}`;
  const { markSeen } = useStore();
  const [watching, setWatching] = useState(() => hasLesson(key) && !profile.seen?.includes(seenKey(key)));
  useEffect(() => {
    if (watching) markSeen(seenKey(key));
    // Only when the activity opens.
  }, []);
  if (!watching) return <>{children}</>;
  return (
    <div className="page activity-page">
      <LessonPlayer lessonKey={key} title={activity.title} onClose={() => setWatching(false)} />
    </div>
  );
}

export function LessonPlayer({ lessonKey, title, onClose: whenClosed }: { lessonKey: string; title: string; onClose: () => void }) {
  const beats = LESSONS[lessonKey];
  const Stage = STAGES[lessonKey];
  const [beat, setBeat] = useState(-1);
  const [step, setStep] = useState(-1); // which note of the line is sounding
  const [done, setDone] = useState(false);
  const [run, setRun] = useState(0);
  const closed = useRef(false);

  // The cartoon has the floor: whatever is underneath cannot talk over it.
  // Closing hands the floor back first, so the activity can speak at once.
  const onClose = () => {
    if (!closed.current) {
      closed.current = true;
      stop({ lesson: true });
      setLessonOpen(false);
    }
    whenClosed();
  };
  useEffect(() => {
    closed.current = false;
    setLessonOpen(true);
    beats.forEach(b => prepare(b.say, b.by));
    return () => {
      if (!closed.current) stop({ lesson: true });
      setLessonOpen(false);
    };
  }, [beats]);

  // Lesson music while open, then back to the area's tune.
  useEffect(() => {
    const before = currentTheme();
    playMusic('lesson');
    sfx('whoosh');
    return () => playMusic(before);
  }, []);

  useEffect(() => {
    let alive = true;
    setDone(false);
    setBeat(-1);
    (async () => {
      // Let the name of the activity finish before the first line.
      await wait(350);
      await whenQuiet();
      for (let i = 0; i < beats.length && alive; i++) {
        const b = beats[i];
        setBeat(i);
        if (b.sfx) sfx(b.sfx);
        if (b.sfx === 'right') {
          setMood('jabari', 'cheer', 1600);
          setMood('jamila', 'cheer', 1600);
        }
        await speakAndWait(b.say, { by: b.by, lesson: true });
        for (let k = 0; b.notes && k < b.notes.length && alive; k++) {
          setStep(k);
          playNote(b.notes[k], 0.5);
          await wait(250);
          setStep(-1);
          await wait(110);
        }
        if (alive) await wait(b.hold ?? 300);
      }
      if (alive) {
        setDone(true);
        setMood('jabari', 'wave', 2000);
        setMood('jamila', 'wave', 2000);
      }
    })();
    return () => {
      alive = false;
      if (!closed.current) stop({ lesson: true });
    };
  }, [run, beats]);

  // While open, keys belong to the lesson, not the activity underneath.
  useEffect(() => {
    const ours = (e: KeyboardEvent) => e.code === 'Space' || e.key === 'Escape' || e.key.startsWith('Arrow');
    const onDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || (e.code === 'Space' && done)) onClose();
      if (ours(e)) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    };
    const onUp = (e: KeyboardEvent) => {
      if (ours(e)) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    };
    window.addEventListener('keydown', onDown, { capture: true });
    window.addEventListener('keyup', onUp, { capture: true });
    return () => {
      window.removeEventListener('keydown', onDown, { capture: true });
      window.removeEventListener('keyup', onUp, { capture: true });
    };
    // onClose is stable enough: it only reads refs and the parent's handler.
  }, [done]);

  const current = beat >= 0 ? beats[beat] : null;

  return (
    <div className="lesson" role="dialog" aria-modal="true" aria-label={`Watch: ${title}`}>
      <div className="lesson-top">
        <div className="eyebrow">Watch first</div>
        <button type="button" className="icon-btn" aria-label="Close" data-close onClick={onClose}>
          <X size={36} strokeWidth={1.5} aria-hidden />
        </button>
      </div>
      <h2 className="title lesson-title">{title}</h2>

      <div className="lesson-stage" aria-hidden>
        <Stage beat={beat} step={step} />
      </div>

      <div className="lesson-bottom">
        <Buddy who="jabari" size={120} />
        <p className={`lesson-caption${current ? ` by-${current.by}` : ''}`} aria-live="polite">
          {current ? caption(current) : ''}
        </p>
        <Buddy who="jamila" size={120} />
      </div>

      <div className={`lesson-actions${done ? ' show' : ''}`}>
        <button type="button" className="pill secondary" onClick={() => setRun(r => r + 1)} disabled={!done}>
          <RotateCcw size={32} strokeWidth={1.5} aria-hidden /> Watch again
        </button>
        <button type="button" className="pill primary" onClick={onClose} disabled={!done} data-play>
          <Play size={32} strokeWidth={1.5} aria-hidden /> Let's play!
        </button>
      </div>
    </div>
  );
}
