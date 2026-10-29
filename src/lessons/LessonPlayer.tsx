import { useEffect, useState } from 'react';
import { Play, RotateCcw, X } from 'lucide-react';
import { LESSONS, type Beat } from '../data/lessons';
import { speakAndWait, stop, setMood } from '../speech';
import { currentTheme, playMusic, sfx } from '../sound';
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

export function LessonPlayer({ lessonKey, title, onClose }: { lessonKey: string; title: string; onClose: () => void }) {
  const beats = LESSONS[lessonKey];
  const Stage = STAGES[lessonKey];
  const [beat, setBeat] = useState(-1);
  const [done, setDone] = useState(false);
  const [run, setRun] = useState(0);

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
      await wait(500);
      for (let i = 0; i < beats.length && alive; i++) {
        const b = beats[i];
        setBeat(i);
        if (b.sfx) sfx(b.sfx);
        if (b.sfx === 'right') {
          setMood('jabari', 'cheer', 1600);
          setMood('jamila', 'cheer', 1600);
        }
        await speakAndWait(b.say, { by: b.by });
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
      stop();
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
  }, [done, onClose]);

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
        <Stage beat={beat} />
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
