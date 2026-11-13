import { useMemo, useState } from 'react';
import { moduleVar, type ModuleColor } from '../data/areas';
import {
  BUILD_EXTRA_LETTERS, FAMILY_WORDS_PER_CARD, MISSING_POSITIONS, PICTURE_WORDS, READ_MATCH_CHOICES, RHYME_GROUPS,
  TRICKY_CHOICES, TRICKY_WORDS, WORD_FAMILIES,
} from '../data/reading';
import { praise, speak, type Speech } from '../speech';
import { sfx } from '../sound';
import { useLevel } from '../store';
import { ActivityFrame, useRound } from '../components/ActivityFrame';
import { ChoiceTiles, useAnswer, useLater, useSayOnShow } from '../components/Choices';
import { Picture, hasPicture, type PictureName } from '../components/pictures';
import { CONSONANTS, PicFace, Speaker, VOWELS, sample } from './common';
import { pickRound, shuffle } from './util';
import type { ActivityProps } from './index';

const TILE_COLORS: ModuleColor[] = [6, 2, 3, 8, 5, 4, 7];
const tileColor = (i: number) => moduleVar(TILE_COLORS[i % TILE_COLORS.length]);

// ---------- Build the word ----------

type Tile = { id: number; text: string };

// Mixed-up tiles for a list of pieces, never already in the right order.
function scramble(pieces: string[], extras: string[] = []): Tile[] {
  const tiles = [...pieces, ...extras].map((text, id) => ({ id, text }));
  for (let i = 0; i < 8; i++) {
    const mixed = shuffle(tiles);
    if (pieces.length < 2 || mixed.some((t, k) => t.text !== pieces[k])) return mixed;
  }
  return tiles.reverse();
}

// Shared tap-in-order logic for Build the word and Build the sentence.
export function useBuilder(pieces: string[], onPlace: (piece: string, done: boolean) => void) {
  const [used, setUsed] = useState<number[]>([]);
  const [wrong, setWrong] = useState<{ id: number; n: number } | null>(null);
  const done = used.length >= pieces.length;

  const tap = (tile: Tile) => {
    if (done || used.includes(tile.id)) return;
    if (tile.text === pieces[used.length]) {
      const next = [...used, tile.id];
      setUsed(next);
      setWrong(null);
      sfx('pop');
      onPlace(tile.text, next.length >= pieces.length);
    } else {
      setWrong(w => ({ id: tile.id, n: (w?.n ?? 0) + 1 }));
      sfx('wrong');
      speak('Try again');
    }
  };
  const reset = () => {
    setUsed([]);
    setWrong(null);
  };
  return { used, wrong, done, tap, reset };
}

export function BuildWord({ area, activity, profile }: ActivityProps) {
  const level = useLevel(area.id);
  const round = useMemo(
    () =>
      pickRound(PICTURE_WORDS).map(word => {
        const letters = word.split('');
        const extras = shuffle([...VOWELS, ...CONSONANTS].filter(l => !letters.includes(l))).slice(0, BUILD_EXTRA_LETTERS[level]);
        return { word, letters, tiles: scramble(letters, extras) };
      }),
    [level],
  );
  const { index, next, prev } = useRound(area, activity, round.length);
  const item = round[index];
  const later = useLater();
  const said: Speech = ['Build the word', item.word];
  const b = useBuilder(item.letters, (letter, done) => {
    speak([{ letter }], { rate: 0.7 });
    if (done) {
      later(() => {
        sfx('right');
        speak(item.word);
        later(() => praise(), 1300);
      }, 700);
    }
  });

  useSayOnShow(said, index);

  const move = (go: () => void) => {
    later.cancel();
    b.reset();
    go();
  };

  return (
    <ActivityFrame
      area={area}
      activity={activity}
      profile={profile}
      eyebrow="Build the word"
      title={<>Build the <em>word</em></>}
      spoken={said}
      index={index}
      total={round.length}
      message={b.done ? `${item.word}!` : 'Tap the letters in order'}
      feedback={b.done ? 'right' : null}
      main={{ label: 'Hear it', icon: <Speaker />, onPress: () => speak(said), ariaLabel: 'Hear the word' }}
      onReset={() => {
        later.cancel();
        b.reset();
      }}
      onPrev={() => move(prev)}
      onNext={() => move(next)}
      hint="Space to hear it · arrows to move"
    >
      <button type="button" key={index} className="picture-slot shown" aria-label={`Hear ${item.word}`} onClick={() => speak(item.word)}>
        <Picture name={item.word} size="74%" />
      </button>
      <div className="slots" aria-label="Your word">
        {item.letters.map((l, k) => (
          <span key={k} className={`slot${k < b.used.length ? ' filled' : ''}`} style={k < b.used.length ? { background: tileColor(k), borderColor: tileColor(k) } : undefined}>
            {k < b.used.length ? l : ''}
          </span>
        ))}
      </div>
      <div className="letter-row" data-next={item.letters[b.used.length] ?? ''}>
        {item.tiles.map(t => {
          const gone = b.used.includes(t.id);
          const shaking = b.wrong?.id === t.id;
          return (
            <button
              key={shaking ? `${index}-${t.id}-${b.wrong!.n}` : `${index}-${t.id}`}
              type="button"
              className={`letter-tile small${gone ? ' gone' : ''}${shaking ? ' wobble' : ''}`}
              aria-label={`Letter ${t.text}`}
              disabled={gone}
              onClick={() => b.tap(t)}
            >
              {t.text}
            </button>
          );
        })}
      </div>
    </ActivityFrame>
  );
}

// ---------- Missing sound ----------

export function MissingSound({ area, activity, profile }: ActivityProps) {
  const level = useLevel(area.id);
  const round = useMemo(
    () =>
      pickRound(PICTURE_WORDS).map(word => {
        const at = sample(MISSING_POSITIONS[level]);
        const answer = word[at];
        const pool = (VOWELS.includes(answer) ? VOWELS : CONSONANTS).filter(l => l !== answer && !(answer === 'c' && l === 'k') && !(answer === 'k' && l === 'c'));
        return { word, at, answer, choices: shuffle([answer, ...shuffle(pool).slice(0, 2)]) };
      }),
    [level],
  );
  const { index, next, prev } = useRound(area, activity, round.length);
  const item = round[index];
  const { solved, wrong, check, reset } = useAnswer();
  const later = useLater();
  const color = moduleVar(area.color);
  const said: Speech = ['What sound is missing?', item.word];

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
      eyebrow="Missing sound"
      title={<>What is <em>missing?</em></>}
      spoken={said}
      index={index}
      total={round.length}
      message={solved ? `${item.word}!` : 'Which letter is missing?'}
      feedback={solved ? 'right' : null}
      main={{ label: 'Hear it', icon: <Speaker />, onPress: () => speak(said), ariaLabel: 'Hear the word' }}
      onPrev={() => move(prev)}
      onNext={() => move(next)}
      hint="Space to hear it · arrows to move"
    >
      <button type="button" key={index} className="picture-slot shown" aria-label={`Hear ${item.word}`} onClick={() => speak(item.word)}>
        <Picture name={item.word} size="74%" />
      </button>
      <div className="slots">
        {item.word.split('').map((l, k) => {
          const blank = k === item.at;
          return (
            <span key={k} className={`slot${!blank || solved ? ' filled' : ''}${blank ? ' asked' : ''}`} style={blank && solved ? { background: color, borderColor: color } : undefined}>
              {blank && !solved ? '?' : l}
            </span>
          );
        })}
      </div>
      <ChoiceTiles
        options={item.choices}
        answer={item.answer}
        solved={solved}
        wrong={wrong}
        color={color}
        className="letter-tile small"
        label={v => `Letter ${v}`}
        onChoose={v =>
          check(v, item.answer, () => {
            speak([{ letter: item.answer }, item.word], { rate: 0.75 });
            later(() => praise(), 1800);
          })
        }
      />
    </ActivityFrame>
  );
}

// ---------- Rhyme time ----------

export function Rhymes({ area, activity, profile }: ActivityProps) {
  const level = useLevel(area.id);
  const round = useMemo(
    () =>
      pickRound(RHYME_GROUPS).map(group => {
        const [target, answer] = shuffle(group);
        const others = shuffle(RHYME_GROUPS.filter(g => g !== group).map(g => sample(g))).slice(0, level === 1 ? 1 : 2);
        return { target, answer, choices: shuffle<PictureName>([answer, ...others]) };
      }),
    [level],
  );
  const { index, next, prev } = useRound(area, activity, round.length);
  const item = round[index];
  const { solved, wrong, check, reset } = useAnswer();
  const later = useLater();
  const said: Speech = ['Which word rhymes with', item.target];

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
      eyebrow="Rhyme time"
      title={<>Rhyme <em>time</em></>}
      spoken={said}
      index={index}
      total={round.length}
      message={solved ? `${item.target} rhymes with ${item.answer}!` : `What rhymes with ${item.target}?`}
      feedback={solved ? 'right' : null}
      main={{ label: 'Hear it', icon: <Speaker />, onPress: () => speak([...said, ...item.choices]), ariaLabel: 'Hear the words' }}
      onPrev={() => move(prev)}
      onNext={() => move(next)}
      hint="Space to hear it · arrows to move"
    >
      <button type="button" key={index} className="picture-slot shown captioned" aria-label={`Hear ${item.target}`} onClick={() => speak(item.target)}>
        <PicFace name={item.target} caption />
      </button>
      <ChoiceTiles
        options={item.choices}
        answer={item.answer}
        solved={solved}
        wrong={wrong}
        color={moduleVar(area.color)}
        className="letter-tile pic-tile"
        label={v => v}
        render={v => <PicFace name={v as PictureName} caption />}
        onChoose={v =>
          check(v, item.answer, () => {
            speak([item.target, 'rhymes with', item.answer]);
            later(() => praise(), 2600);
          })
        }
      />
    </ActivityFrame>
  );
}

// ---------- Word families ----------

export function WordFamilies({ area, activity, profile }: ActivityProps) {
  const round = useMemo(
    () => pickRound(WORD_FAMILIES).map(f => ({ ending: f.ending, starts: shuffle(f.starts).slice(0, FAMILY_WORDS_PER_CARD) })),
    [],
  );
  const { index, next, prev } = useRound(area, activity, round.length);
  const item = round[index];
  const [made, setMade] = useState<string[]>([]);
  const [current, setCurrent] = useState<string | null>(null);
  const later = useLater();
  const done = made.length >= item.starts.length;
  const said = 'Make new words. Tap a letter.';

  useSayOnShow(said, index);

  const fresh = () => {
    later.cancel();
    setMade([]);
    setCurrent(null);
  };

  const pick = (start: string) => {
    const word = start + item.ending;
    sfx('pop');
    setCurrent(start);
    speak([{ letter: start }, item.ending, word], { rate: 0.75 });
    if (!made.includes(start)) {
      const all = [...made, start];
      setMade(all);
      if (all.length >= item.starts.length) {
        later(() => {
          sfx('right');
          speak('You made new words!');
          later(() => praise(), 1800);
        }, 2600);
      }
    }
  };

  const word = current ? current + item.ending : null;

  return (
    <ActivityFrame
      area={area}
      activity={activity}
      profile={profile}
      eyebrow="Word families"
      title={<>Make new <em>words</em></>}
      spoken={said}
      index={index}
      total={round.length}
      message={done ? `The ${item.ending} family!` : `${made.length} of ${item.starts.length} words`}
      feedback={done ? 'right' : null}
      main={{ label: 'Hear it', icon: <Speaker />, onPress: () => speak(word ?? said), ariaLabel: 'Hear it' }}
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
      <div className="family">
        <div className="slots">
          <span key={current ?? 'blank'} className={`slot${current ? ' filled pop-in' : ' asked'}`} style={current ? { background: moduleVar(area.color), borderColor: moduleVar(area.color) } : undefined}>
            {current ?? '?'}
          </span>
          {item.ending.split('').map((l, k) => (
            <span key={k} className="slot filled">
              {l}
            </span>
          ))}
        </div>
        <span className={`picture-slot${word && hasPicture(word) ? ' shown' : ''}`} key={word ?? 'none'}>
          {word && hasPicture(word) && <Picture name={word} size="74%" />}
        </span>
      </div>
      <div className="letter-row">
        {item.starts.map((st, k) => {
          const used = made.includes(st);
          return (
            <button
              key={`${index}-${st}`}
              type="button"
              className={`letter-tile small${used ? ' lit' : ''}`}
              style={used ? { background: tileColor(k), borderColor: tileColor(k) } : undefined}
              aria-label={`Letter ${st}`}
              onClick={() => pick(st)}
            >
              {st}
            </button>
          );
        })}
      </div>
    </ActivityFrame>
  );
}

// ---------- Read and match ----------

export function ReadMatch({ area, activity, profile }: ActivityProps) {
  const level = useLevel(area.id);
  const round = useMemo(
    () =>
      pickRound(PICTURE_WORDS).map(word => {
        const others = shuffle(PICTURE_WORDS.filter(w => w !== word));
        // Harder: wrong pictures start with the same letter where possible.
        const close = level === 3 ? others.filter(w => w[0] === word[0]) : [];
        const picks = [...close, ...others.filter(w => !close.includes(w))].slice(0, READ_MATCH_CHOICES[level] - 1);
        return { word, choices: shuffle<PictureName>([word, ...picks]) };
      }),
    [level],
  );
  const { index, next, prev } = useRound(area, activity, round.length);
  const item = round[index];
  const { solved, wrong, check, reset } = useAnswer();
  const later = useLater();
  const [lit, setLit] = useState(-1);
  const intro = 'Read the word. Find the picture.';

  useSayOnShow(index === 0 ? intro : '', index);

  const move = (go: () => void) => {
    later.cancel();
    reset();
    setLit(-1);
    go();
  };

  // Help: say each sound with its letter lit, then the word.
  const soundOut = () => {
    const letters = item.word.split('');
    const step = (k: number) => {
      if (k >= letters.length) {
        setLit(-1);
        speak(item.word);
        return;
      }
      setLit(k);
      sfx('pop');
      speak([{ letter: letters[k] }], { rate: 0.7 });
      later(() => step(k + 1), 750);
    };
    step(0);
  };

  return (
    <ActivityFrame
      area={area}
      activity={activity}
      profile={profile}
      eyebrow="Read and match"
      title={<>Read and <em>match</em></>}
      spoken={intro}
      index={index}
      total={round.length}
      message={solved ? `${item.word}!` : 'Read it, then tap the picture'}
      feedback={solved ? 'right' : null}
      main={{ label: 'Help me', icon: <Speaker />, onPress: soundOut, ariaLabel: 'Sound it out' }}
      onPrev={() => move(prev)}
      onNext={() => move(next)}
      hint="Space for help · arrows to move"
    >
      <div className="read-word" aria-label={item.word}>
        {item.word.split('').map((l, k) => (
          <span key={k} className={k === lit ? 'on' : undefined}>
            {l}
          </span>
        ))}
      </div>
      <ChoiceTiles
        options={item.choices}
        answer={item.word}
        solved={solved}
        wrong={wrong}
        color={moduleVar(area.color)}
        className="letter-tile pic-tile"
        label={v => v}
        render={v => <PicFace name={v as PictureName} />}
        onChoose={v =>
          check(v, item.word, () => {
            later.cancel();
            setLit(-1);
            speak(item.word);
            later(() => praise(), 1300);
          })
        }
      />
    </ActivityFrame>
  );
}

// ---------- Tricky words ----------

export function TrickyWords({ area, activity, profile }: ActivityProps) {
  const level = useLevel(area.id);
  const round = useMemo(() => {
    const known = ([1, 2, 3] as const).filter(l => l <= level).flatMap(l => TRICKY_WORDS[l]);
    return pickRound(TRICKY_WORDS[level]).map(word => ({
      word,
      choices: shuffle([word, ...shuffle(known.filter(w => w !== word)).slice(0, TRICKY_CHOICES[level] - 1)]),
    }));
  }, [level]);
  const { index, next, prev } = useRound(area, activity, round.length);
  const item = round[index];
  const { solved, wrong, check, reset } = useAnswer();
  const later = useLater();
  const said: Speech = ['Find the word', item.word];

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
      eyebrow="Tricky words"
      title={<>Tricky <em>words</em></>}
      spoken={said}
      index={index}
      total={round.length}
      message={solved ? `${item.word}!` : 'Listen, then find the word'}
      feedback={solved ? 'right' : null}
      main={{ label: 'Hear it', icon: <Speaker />, onPress: () => speak(said), ariaLabel: 'Hear the word' }}
      onPrev={() => move(prev)}
      onNext={() => move(next)}
      hint="Space to hear it · arrows to move"
    >
      <ChoiceTiles
        options={item.choices}
        answer={item.word}
        solved={solved}
        wrong={wrong}
        color={moduleVar(area.color)}
        className="letter-tile word-tile"
        label={v => `Word ${v}`}
        onChoose={v =>
          check(v, item.word, () => {
            speak(item.word);
            later(() => praise(), 1300);
          })
        }
      />
    </ActivityFrame>
  );
}
