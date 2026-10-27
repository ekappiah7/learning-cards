import { useEffect, useRef, useState } from 'react';
import { speak } from '../speech';

// Shared pick-the-answer logic: a wrong choice wobbles and says "Try
// again", a right one stays lit. There is no failure state.
export function useAnswer() {
  const [solved, setSolved] = useState(false);
  const [wrong, setWrong] = useState<{ value: string; n: number } | null>(null);

  const reset = () => {
    setSolved(false);
    setWrong(null);
  };

  const check = (value: string, answer: string, onRight: () => void) => {
    if (solved) return;
    if (value === answer) {
      setSolved(true);
      setWrong(null);
      onRight();
    } else {
      setWrong(w => ({ value, n: (w?.n ?? 0) + 1 }));
      speak('Try again');
    }
  };

  return { solved, wrong, check, reset };
}

// Runs one delayed action (such as praise after an answer). Starting a new
// one, calling cancel, or leaving the screen stops the pending one.
export function useLater() {
  const t = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(t.current), []);
  const later = (fn: () => void, ms: number) => {
    clearTimeout(t.current);
    t.current = setTimeout(fn, ms);
  };
  later.cancel = () => clearTimeout(t.current);
  return later;
}

// Says `text` shortly after each new card appears. Pass the card index as
// `card` so the same question is said again on the next card.
export function useSayOnShow(text: string, card?: number) {
  const t = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    t.current = setTimeout(() => speak(text), 350);
    return () => clearTimeout(t.current);
  }, [text, card]);
}

export function ChoiceTiles({
  options, answer, solved, wrong, color, label, onChoose,
}: {
  options: string[];
  answer: string;
  solved: boolean;
  wrong: { value: string; n: number } | null;
  color: string;
  label: (value: string) => string;
  onChoose: (value: string) => void;
}) {
  return (
    <div className="letter-row">
      {options.map(v => {
        const lit = solved && v === answer;
        const shaking = wrong?.value === v;
        return (
          <button
            key={shaking ? `${v}-${wrong.n}` : v}
            type="button"
            className={`letter-tile${lit ? ' lit' : ''}${shaking ? ' wobble' : ''}`}
            style={lit ? { background: color, borderColor: color } : undefined}
            aria-label={label(v)}
            onClick={() => onChoose(v)}
          >
            {v}
          </button>
        );
      })}
    </div>
  );
}
