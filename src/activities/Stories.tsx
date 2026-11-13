import { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpenText } from 'lucide-react';
import { moduleVar } from '../data/areas';
import { otherCharacter } from '../data/characters';
import { CLAP_SENTENCES, SENTENCE_MAX_WORDS } from '../data/reading';
import type { Story } from '../data/stories';
import { getHost, lineMs, praise, speak, stop, whenQuiet, type Speech } from '../speech';
import { sfx } from '../sound';
import { useLevel } from '../store';
import { ActivityFrame, useRound } from '../components/ActivityFrame';
import { ChoiceTiles, useAnswer, useLater, useSayOnShow } from '../components/Choices';
import type { PictureName } from '../components/pictures';
import { Scene } from '../components/Scene';
import { PicFace, Speaker, bare } from './common';
import { useBuilder } from './Words';
import { pickRound, shuffle } from './util';
import type { ActivityProps } from './index';

// ---------- Build the sentence ----------

export function BuildSentence({ area, activity, profile }: ActivityProps) {
  const level = useLevel(area.id);
  const round = useMemo(() => {
    const pool = CLAP_SENTENCES.filter(s => {
      const n = s.split(' ').length;
      return n >= 3 && n <= SENTENCE_MAX_WORDS[level];
    });
    return pickRound(pool, s => s.split(' ').length).map(sentence => {
      const words = sentence.split(' ');
      let tiles = shuffle(words.map((text, id) => ({ id, text })));
      if (tiles.every((t, k) => t.text === words[k])) tiles = tiles.reverse();
      return { sentence, words, tiles };
    });
  }, [level]);
  const { index, next, prev } = useRound(area, activity, round.length);
  const item = round[index];
  const later = useLater();
  const said: Speech = ['Put the words in order.', item.sentence];
  const b = useBuilder(item.words, (word, done) => {
    speak(bare(word));
    if (done) {
      later(() => {
        sfx('right');
        speak(item.sentence);
        later(() => praise(), lineMs(item.sentence) + 500);
      }, 800);
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
      eyebrow="Build the sentence"
      title={<>Build the <em>sentence</em></>}
      spoken={said}
      index={index}
      total={round.length}
      message={b.done ? 'You built the sentence!' : 'Tap the words in order'}
      feedback={b.done ? 'right' : null}
      main={{ label: 'Hear it', icon: <Speaker />, onPress: () => speak(item.sentence), ariaLabel: 'Hear the sentence' }}
      onReset={() => {
        later.cancel();
        b.reset();
      }}
      onPrev={() => move(prev)}
      onNext={() => move(next)}
      hint="Space to hear it · arrows to move"
    >
      <div className="sentence-line" aria-label="Your sentence">
        {item.words.map((w, k) => (
          <span key={k} className={`word-slot${k < b.used.length ? ' filled' : ''}`}>
            {k < b.used.length ? w : ''}
          </span>
        ))}
      </div>
      <div className="letter-row" data-next={item.words[b.used.length] ?? ''}>
        {item.tiles.map(t => {
          const gone = b.used.includes(t.id);
          const shaking = b.wrong?.id === t.id;
          return (
            <button
              key={shaking ? `${index}-${t.id}-${b.wrong!.n}` : `${index}-${t.id}`}
              type="button"
              className={`letter-tile word-tile${gone ? ' gone' : ''}${shaking ? ' wobble' : ''}`}
              aria-label={`Word ${bare(t.text)}`}
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

// ---------- Story books ----------

// A story: one sentence per page, read aloud with each word lighting up in
// time, then two questions about it. Tapping a word says it.
export function StoryBook({ area, activity, profile, story }: ActivityProps & { story: Story }) {
  const level = useLevel(area.id);
  const pages = story.pages.length;
  const { index, next, prev } = useRound(area, activity, pages + story.questions.length);
  const page = index < pages ? story.pages[index] : null;
  const question = page ? null : story.questions[index - pages];
  const { solved, wrong, check, reset } = useAnswer();
  const later = useLater();
  const [lit, setLit] = useState(-1);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  // The two characters take turns reading the pages.
  const reader = index % 2 === 0 ? getHost() : otherCharacter(getHost());

  const clearLit = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setLit(-1);
  };
  useEffect(() => clearLit, []);

  const read = () => {
    if (!page) return;
    clearLit();
    const words = page.text.split(' ');
    speak(page.text, { by: reader });
    // Light each word for its share of the sentence, by length.
    const total = lineMs(page.text, reader) || words.length * 420;
    const weights = words.map(w => bare(w).length + 1.5);
    const sum = weights.reduce((a, b) => a + b, 0);
    let t = 60;
    words.forEach((_, k) => {
      timers.current.push(setTimeout(() => setLit(k), t));
      t += (weights[k] / sum) * total;
    });
    timers.current.push(setTimeout(() => setLit(-1), t + 200));
  };

  // Read each page as it opens (on Harder the child reads first), and ask
  // each question.
  useEffect(() => {
    let alive = true;
    // Let the story's name (or the last line) finish first.
    const t = setTimeout(() => {
      void whenQuiet().then(() => {
        if (!alive) return;
        if (question) speak(question.ask);
        else if (level < 3) read();
      });
    }, 250);
    return () => {
      alive = false;
      clearTimeout(t);
    };
    // Runs once per page.
  }, [index]);

  const move = (go: () => void) => {
    later.cancel();
    clearLit();
    stop();
    reset();
    go();
  };

  const color = moduleVar(area.color);

  return (
    <ActivityFrame
      area={area}
      activity={activity}
      profile={profile}
      eyebrow="Story"
      title={story.title}
      spoken={story.title}
      index={index}
      total={pages + story.questions.length}
      message={question ? (solved ? `${question.answer}!` : question.ask) : level === 3 ? 'Read it, then tap Read to me' : undefined}
      feedback={solved ? 'right' : null}
      main={
        question
          ? { label: 'Hear it', icon: <Speaker />, onPress: () => speak(question.ask), ariaLabel: 'Hear the question' }
          : { label: 'Read to me', icon: <BookOpenText size={40} strokeWidth={1.5} aria-hidden />, onPress: read }
      }
      onPrev={() => move(prev)}
      onNext={() => move(next)}
      hint="Space to read · arrows to turn the page"
    >
      {page ? (
        <>
          <div className="scene-box">
            <Scene key={index} page={page} />
          </div>
          <p className="story-text">
            {page.text.split(' ').map((w, k) => (
              <button
                key={k}
                type="button"
                className={`story-word${k === lit ? ' on' : ''}`}
                onClick={() => {
                  clearLit();
                  speak(bare(w));
                }}
              >
                {w}
              </button>
            ))}
          </p>
        </>
      ) : (
        question && (
          <ChoiceTiles
            key={index}
            options={question.options}
            answer={question.answer}
            solved={solved}
            wrong={wrong}
            color={color}
            className="letter-tile pic-tile"
            label={v => v}
            render={v => <PicFace name={v as PictureName} caption />}
            onChoose={v =>
              check(v, question.answer, () => {
                speak(question.answer);
                later(() => praise(), 1300);
              })
            }
          />
        )
      )}
    </ActivityFrame>
  );
}
