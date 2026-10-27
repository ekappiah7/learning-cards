import { useEffect, useMemo, useRef, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { moduleVar } from '../data/areas';
import { FIRST_SOUND_LETTERS, FIRST_SOUND_WORDS, LETTER_SOUNDS } from '../data/reading';
import { praise, speak } from '../speech';
import { ActivityFrame, useRound } from '../components/ActivityFrame';
import { Picture } from '../components/pictures';
import { pickRound, shuffle } from './util';
import type { ActivityProps } from './index';

// Hear a word, see its picture, and tap the letter it starts with.

const CHOICES = 3;
// Letters that make the same first sound are never offered together.
const SAME_SOUND: Record<string, string> = { c: 'k', k: 'c' };

function choicesFor(word: string) {
  const first = word[0];
  const others = shuffle(FIRST_SOUND_LETTERS.filter(l => l !== first && l !== SAME_SOUND[first])).slice(0, CHOICES - 1);
  return shuffle([first, ...others]);
}

export function FirstSound({ area, activity, profile }: ActivityProps) {
  const round = useMemo(() => pickRound(FIRST_SOUND_WORDS).map(w => ({ ...w, choices: choicesFor(w.word) })), []);
  const { index, next, prev } = useRound(area, activity, round.length);
  const item = round[index];

  const [picked, setPicked] = useState<string | null>(null);
  const [wrong, setWrong] = useState<{ letter: string; n: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const color = moduleVar(area.color);
  const right = picked === item.word[0];

  // Say the word when each card appears.
  useEffect(() => {
    timer.current = setTimeout(() => speak(item.word), 350);
    return () => clearTimeout(timer.current);
  }, [item.word]);

  const hear = () => speak(item.word);

  const choose = (letter: string) => {
    clearTimeout(timer.current);
    if (right) return;
    if (letter === item.word[0]) {
      setPicked(letter);
      setWrong(null);
      speak(`${LETTER_SOUNDS[letter] ?? letter}. ${item.word}.`, { rate: 0.75 });
      timer.current = setTimeout(() => praise(), 1600);
    } else {
      setWrong(w => ({ letter, n: (w?.n ?? 0) + 1 }));
      speak('Try again');
    }
  };

  const move = (go: () => void) => {
    setPicked(null);
    setWrong(null);
    go();
  };

  return (
    <ActivityFrame
      area={area}
      activity={activity}
      profile={profile}
      eyebrow="First sound"
      title={<>What does it <em>start</em> with?</>}
      spoken="What sound does it start with?"
      index={index}
      total={round.length}
      message={right ? `${item.word[0]} is for ${item.word}!` : 'Which letter does it start with?'}
      feedback={right ? 'right' : null}
      main={{ label: 'Hear it', icon: <Volume2 size={40} strokeWidth={1.5} aria-hidden />, onPress: hear, ariaLabel: 'Hear the word' }}
      onPrev={() => move(prev)}
      onNext={() => move(next)}
      hint="Space to hear it · arrows to move"
    >
      <button type="button" className="picture-slot shown" aria-label={`Hear ${item.word}`} onClick={hear}>
        <Picture name={item.picture} size={96} />
      </button>

      <div className="letter-row">
        {item.choices.map(l => {
          const isRight = right && l === item.word[0];
          const shaking = wrong?.letter === l;
          return (
            <button
              key={shaking ? `${l}-${wrong.n}` : l}
              type="button"
              className={`letter-tile${isRight ? ' lit' : ''}${shaking ? ' wobble' : ''}`}
              style={isRight ? { background: color, borderColor: color } : undefined}
              aria-label={`Letter ${l}`}
              onClick={() => choose(l)}
            >
              {l}
            </button>
          );
        })}
      </div>
    </ActivityFrame>
  );
}
