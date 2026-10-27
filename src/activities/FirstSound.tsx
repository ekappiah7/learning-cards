import { useMemo } from 'react';
import { Volume2 } from 'lucide-react';
import { moduleVar } from '../data/areas';
import { FIRST_SOUND_LETTERS, FIRST_SOUND_WORDS, LETTER_SOUNDS } from '../data/reading';
import { praise, speak } from '../speech';
import { ActivityFrame, useRound } from '../components/ActivityFrame';
import { ChoiceTiles, useAnswer, useLater, useSayOnShow } from '../components/Choices';
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
  const answer = item.word[0];
  const { solved, wrong, check, reset } = useAnswer();
  const later = useLater();

  useSayOnShow(item.word, index);
  const hear = () => speak(item.word);

  const choose = (letter: string) =>
    check(letter, answer, () => {
      speak(`${LETTER_SOUNDS[letter] ?? letter}. ${item.word}.`, { rate: 0.75 });
      later(() => praise(), 1600);
    });

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
      eyebrow="First sound"
      title={<>What does it <em>start</em> with?</>}
      spoken="What sound does it start with?"
      index={index}
      total={round.length}
      message={solved ? `${answer} is for ${item.word}!` : 'Which letter does it start with?'}
      feedback={solved ? 'right' : null}
      main={{ label: 'Hear it', icon: <Volume2 size={40} strokeWidth={1.5} aria-hidden />, onPress: hear, ariaLabel: 'Hear the word' }}
      onPrev={() => move(prev)}
      onNext={() => move(next)}
      hint="Space to hear it · arrows to move"
    >
      <button type="button" className="picture-slot shown" aria-label={`Hear ${item.word}`} onClick={hear}>
        <Picture name={item.picture} size={96} />
      </button>

      <ChoiceTiles
        options={item.choices}
        answer={answer}
        solved={solved}
        wrong={wrong}
        color={moduleVar(area.color)}
        label={l => `Letter ${l}`}
        onChoose={choose}
      />
    </ActivityFrame>
  );
}
