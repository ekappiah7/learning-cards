import { useEffect, useMemo, useRef, useState } from 'react';
import { Blend } from 'lucide-react';
import { moduleVar, type ModuleColor } from '../data/areas';
import { CVC_WORDS, SOUND_IT_OUT_PICTURED_ONLY } from '../data/reading';
import { praise, speak, stop } from '../speech';
import { useLevel } from '../store';
import { ActivityFrame, useRound } from '../components/ActivityFrame';
import { Picture } from '../components/pictures';
import { pickRound } from './util';
import type { ActivityProps } from './index';
import { sfx } from '../sound';

// Tap each letter to hear its sound, then Blend to hear the sounds run
// together into the word. The picture appears once the word is blended.

const COLORS: ModuleColor[] = [6, 2, 3];

export function SoundItOut({ area, activity, profile }: ActivityProps) {
  const level = useLevel(area.id);
  const round = useMemo(() => pickRound(SOUND_IT_OUT_PICTURED_ONLY[level] ? CVC_WORDS.filter(w => w.picture) : CVC_WORDS), [level]);
  const { index, next, prev } = useRound(area, activity, round.length);
  const item = round[index];
  const letters = item.word.split('');

  const [tapped, setTapped] = useState<boolean[]>([]);
  const [active, setActive] = useState(-1);   // letter being said during Blend
  const [blended, setBlended] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const clear = () => clearTimeout(timer.current);
  useEffect(() => clear, []);

  const resetCard = () => {
    clear();
    stop();
    setTapped([]);
    setActive(-1);
    setBlended(false);
  };

  const tap = (k: number) => {
    clear();
    setActive(-1);
    setTapped(t => {
      const n = t.slice();
      n[k] = true;
      return n;
    });
    sfx('pop');
    speak([{ letter: letters[k] }], { rate: 0.7 });
  };

  // Say each sound with its letter lit, then the whole word.
  const blend = () => {
    clear();
    setBlended(false);
    const step = (k: number) => {
      if (k >= letters.length) {
        setActive(-1);
        setTapped(letters.map(() => true));
        timer.current = setTimeout(() => {
          setBlended(true);
          sfx('right');
          speak(item.word);
          timer.current = setTimeout(() => praise(), 1200);
        }, 250);
        return;
      }
      setActive(k);
      sfx('pop');
    speak([{ letter: letters[k] }], { rate: 0.7 });
      timer.current = setTimeout(() => step(k + 1), 750);
    };
    step(0);
  };

  const allTapped = letters.every((_, k) => tapped[k]);
  const message = blended ? `${item.word}!` : allTapped ? 'Now blend it!' : 'Tap each letter';

  return (
    <ActivityFrame
      area={area}
      activity={activity}
      profile={profile}
      eyebrow="Sound it out"
      title={<>Sound it <em>out</em></>}
      spoken="Sound it out. Tap each letter, then blend."
      index={index}
      total={round.length}
      message={message}
      feedback={blended ? 'right' : null}
      main={{ label: 'Blend', icon: <Blend size={40} strokeWidth={1.5} aria-hidden />, onPress: blend }}
      onReset={resetCard}
      onPrev={() => {
        resetCard();
        prev();
      }}
      onNext={() => {
        resetCard();
        next();
      }}
      hint="Space to blend · arrows to move"
    >
      <div className="letter-row">
        {letters.map((l, k) => {
          const lit = tapped[k] || active === k;
          const c = moduleVar(COLORS[k % COLORS.length]);
          return (
            <button
              key={`${index}-${k}`}
              type="button"
              className={`letter-tile${lit ? ' lit' : ''}${active === k ? ' saying' : ''}`}
              style={lit ? { background: c, borderColor: c } : undefined}
              aria-label={`Letter ${l}`}
              onClick={() => tap(k)}
            >
              {l}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className={`picture-slot${blended ? ' shown' : ''}`}
        aria-label={blended ? `Hear ${item.word}` : 'Picture appears after blending'}
        onClick={() => blended && speak(item.word)}
      >
        {blended && (item.picture ? <Picture name={item.picture} size={96} /> : <span className="picture-word">{item.word}</span>)}
      </button>
    </ActivityFrame>
  );
}
