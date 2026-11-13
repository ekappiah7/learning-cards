// Spoken output. Each line plays a pre-recorded clip in the speaking
// character's voice (see scripts/voice). Clips are decoded and played
// through the shared audio output, which starts them at once; an <audio>
// element is the fallback (and the way on iPhones and iPads, where it keeps
// working with the silent switch on). Names and letter sounds use the
// parent's own recordings when there are any. Anything without a recording
// falls back to the device's speech engine, picking a natural British voice
// of the speaker's gender. The characters' faces follow who is talking.

import { LETTER_SOUNDS } from './data/reading';
import { CHARACTERS, otherCharacter, type CharacterId } from './data/characters';
import { PRAISE, phraseKey, type Part, type Speech } from './voice/phrases';
import { recKey, recordingUrl } from './voice/recordings';
import { clipBytes, clipMs, clipUrl, hasClip } from './voice/packs';
import { audioContext, audioOut, wakeAudio } from './audio';

export type { Speech } from './voice/phrases';

const TTS_RATE = 0.8;
const GAP_MS = 60;

let enabled = true;
let turn = 0; // bumped on every new line or stop, so stale callbacks do nothing
let host: CharacterId = 'jabari';
let active: Item[] | null = null; // what is left of the line being said
let lessonOpen = false; // while a Watch first cartoon plays, only it may speak

type Voice = 'lewis' | 'alice';
type Item = { by: CharacterId; text: string } & (
  | { kind: 'clip'; voice: Voice; key: string } // a recorded line
  | { kind: 'audio'; url: string } // the parent's own recording
  | { kind: 'tts'; rate: number } // the device voice
);

// ---------- who is talking, and how they feel ----------

export type Mood = 'idle' | 'cheer' | 'think' | 'wave';
type State = { speaking: CharacterId | null; mood: Record<CharacterId, Mood> };
let state: State = { speaking: null, mood: { jabari: 'idle', jamila: 'idle' } };
const listeners = new Set<() => void>();
const moodTimers: Partial<Record<CharacterId, ReturnType<typeof setTimeout>>> = {};

function set(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach(l => l());
}

export const characterState = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  get: () => state,
};

// Shows a mood for a moment, then goes back to idle.
export function setMood(id: CharacterId, mood: Mood, ms = 1800) {
  clearTimeout(moodTimers[id]);
  set({ mood: { ...state.mood, [id]: mood } });
  if (mood !== 'idle') moodTimers[id] = setTimeout(() => set({ mood: { ...state.mood, [id]: 'idle' } }), ms);
}

// The character who leads the current screen; lines are said by them unless
// a part names someone else.
export function setHost(id: CharacterId) {
  host = id;
}
export const getHost = () => host;

// ---------- device voice (fallback) ----------

function synth(): SpeechSynthesis | null {
  return typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
}

const voices: Record<'male' | 'female', SpeechSynthesisVoice | null> = { male: null, female: null };
const MALE = /daniel|arthur|oliver|george|ryan|thomas|harry|malcolm|lewis|uk english male|\bmale/i;
const FEMALE = /serena|kate|stephanie|martha|libby|sonia|maisie|hazel|susan|alice|female/i;
const NATURAL = /natural|neural|enhanced|premium|online/i;

function score(v: SpeechSynthesisVoice, gender: 'male' | 'female') {
  let s = 0;
  if (v.lang === 'en-GB' || v.lang === 'en_GB') s += 8;
  else if (v.lang.startsWith('en')) s += 2;
  else return -1;
  if ((gender === 'male' ? MALE : FEMALE).test(v.name)) s += 4;
  if (NATURAL.test(v.name)) s += 3;
  if (v.localService) s += 1;
  return s;
}

function pickVoices() {
  const s = synth();
  if (!s) return;
  for (const g of ['male', 'female'] as const) {
    const ranked = s.getVoices().map(v => [score(v, g), v] as const).filter(([n]) => n >= 0).sort((a, b) => b[0] - a[0]);
    voices[g] = ranked[0]?.[1] ?? null;
  }
}

const s0 = synth();
if (s0) {
  pickVoices();
  s0.addEventListener?.('voiceschanged', pickVoices);
}

// ---------- playing a recorded clip ----------

const IOS =
  typeof navigator !== 'undefined' &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

// Whatever must be cancelled to silence the item now playing.
let cancelCurrent: (() => void) | null = null;

// Decoded clips, most recently used last. Decoding takes a few
// milliseconds, so this only needs to hold what is on screen.
const buffers = new Map<string, Promise<AudioBuffer | null>>();
const MAX_BUFFERS = 48;

function buffer(voice: Voice, key: string): Promise<AudioBuffer | null> {
  const id = `${voice}/${key}`;
  const had = buffers.get(id);
  if (had) {
    buffers.delete(id);
    buffers.set(id, had);
    return had;
  }
  const c = audioContext();
  const made: Promise<AudioBuffer | null> = clipBytes(voice, key)
    .then(bytes => (bytes && c ? c.decodeAudioData(bytes) : null))
    .catch(() => null);
  buffers.set(id, made);
  void made.then(b => {
    if (!b && buffers.get(id) === made) buffers.delete(id);
  });
  if (buffers.size > MAX_BUFFERS) buffers.delete(buffers.keys().next().value as string);
  return made;
}

let voiceOut: GainNode | null = null;
function output(): AudioNode | null {
  const c = audioContext();
  const out = audioOut();
  if (!c || !out) return null;
  if (!voiceOut) {
    voiceOut = c.createGain();
    voiceOut.gain.value = 1;
    voiceOut.connect(out);
  }
  return voiceOut;
}

// True once sound can play; gives up quickly so a line is never held up.
function awake(): Promise<boolean> {
  if (audioContext()?.state === 'running') return Promise.resolve(true);
  return Promise.race([wakeAudio(), new Promise<boolean>(r => setTimeout(() => r(false), 300))]);
}

// Lets the automated tests see when a line really starts to sound.
function heard(it: Item, asked: number, via: string) {
  window.dispatchEvent(new CustomEvent('learning-cards:heard', { detail: { text: it.text, ms: Math.round(performance.now() - asked), via } }));
}

function playClip(it: Item & { kind: 'clip' }, mine: number, next: () => void) {
  const asked = performance.now();
  const viaElement = () => {
    const url = clipUrl(it.voice, it.key);
    if (url) playUrl(url, it, mine, next, asked);
    else next();
  };
  if (IOS || !output()) return viaElement();
  void Promise.all([awake(), buffer(it.voice, it.key)]).then(([ok, buf]) => {
    if (mine !== turn) return;
    if (!ok) return viaElement();
    if (!buf) return next(); // not on the device and no connection: skip it
    const c = audioContext()!;
    const src = c.createBufferSource();
    src.buffer = buf;
    src.connect(output()!);
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(guard);
      if (mine === turn) {
        cancelCurrent = null;
        next();
      }
    };
    // If the end is never reported (the output was interrupted), move on anyway.
    const guard = setTimeout(finish, buf.duration * 1000 + 700);
    src.onended = finish;
    cancelCurrent = () => {
      done = true;
      clearTimeout(guard);
      src.onended = null;
      try {
        src.stop();
      } catch {
        /* already stopped */
      }
    };
    src.start();
    heard(it, asked, 'direct');
  });
}

// ---------- the <audio> element: fallback, and the parent's recordings ----------

const audio: HTMLAudioElement | null = typeof Audio !== 'undefined' ? new Audio() : null;
if (audio) audio.preload = 'auto';

// iPads and iPhones only let audio play after a tap, and then only on an
// element that has played before, so play a moment of silence on a touch.
// Never while a line is being said: that would cut the line off.
const SILENCE = './voice/silence.mp3';
let unlocked = false;
function unlock() {
  if (unlocked || !audio || state.speaking) return;
  audio.src = SILENCE;
  audio.play().then(
    () => {
      unlocked = true;
      if (audio.src.endsWith('silence.mp3')) audio.pause();
    },
    () => undefined,
  );
}
if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', unlock, { capture: true });
  window.addEventListener('keydown', unlock, { capture: true });
}

function playUrl(url: string, it: Item, mine: number, next: () => void, asked = performance.now()) {
  if (!audio) return next();
  let done = false;
  let guard: ReturnType<typeof setTimeout>;
  const finish = () => {
    if (done) return;
    done = true;
    clearTimeout(guard);
    if (mine === turn) {
      cancelCurrent = null;
      next();
    }
  };
  // Move on if the clip never starts, or never reports its end.
  guard = setTimeout(finish, 5000);
  audio.onplaying = () => {
    clearTimeout(guard);
    guard = setTimeout(finish, (Number.isFinite(audio.duration) ? audio.duration * 1000 : 8000) + 1000);
    heard(it, asked, 'element');
  };
  audio.onended = finish;
  audio.onerror = finish;
  cancelCurrent = () => {
    done = true;
    clearTimeout(guard);
    audio.onended = null;
    audio.onerror = null;
    audio.onplaying = null;
    audio.pause();
  };
  audio.src = url;
  audio.play().then(() => (unlocked = true), finish);
}

// ---------- building and playing a line ----------

function clipFor(by: CharacterId, text: string): { voice: Voice; key: string } | null {
  const key = phraseKey(text);
  const own = CHARACTERS[by].voice;
  if (hasClip(own, key)) return { voice: own, key };
  // If a line is not recorded in this voice, use the other voice rather than a robot.
  const other = CHARACTERS[otherCharacter(by)].voice;
  return hasClip(other, key) ? { voice: other, key } : null;
}

function itemsFor(speech: Speech, rate: number, by: CharacterId): Item[] {
  const parts: Part[] = typeof speech === 'string' ? [speech] : speech;
  return parts.flatMap((p): Item[] => {
    if (typeof p === 'string') {
      const clip = clipFor(by, p);
      if (clip) return [{ kind: 'clip', ...clip, text: p, by }];
      return p.trim() ? [{ kind: 'tts', text: p, rate, by }] : [];
    }
    if ('by' in p) return itemsFor(p.say, rate, p.by);
    if ('name' in p) {
      const url = recordingUrl(recKey.name(p.id));
      return url ? [{ kind: 'audio', url, text: p.name, by }] : [{ kind: 'tts', text: p.name, rate, by }];
    }
    const url = recordingUrl(recKey.letter(p.letter));
    return url ? [{ kind: 'audio', url, text: p.letter, by }] : itemsFor(LETTER_SOUNDS[p.letter] ?? p.letter, rate, by);
  });
}

// Gets the first few clips of a line ready, so they start the moment they are due.
function warm(items: Item[]) {
  if (IOS) return;
  for (const it of items.slice(0, 6)) if (it.kind === 'clip') void buffer(it.voice, it.key);
}

// Lines that make the speaker look encouraging rather than pleased.
const ENCOURAGE = /^(try again|oops)/;

function playItems(items: Item[], mine: number, done?: () => void) {
  if (mine !== turn) return;
  const it = items.shift();
  if (!it) {
    active = null;
    set({ speaking: null });
    done?.();
    return;
  }
  const next = () => {
    if (mine === turn) setTimeout(() => playItems(items, mine, done), GAP_MS);
  };
  set({ speaking: it.by });
  if (ENCOURAGE.test(phraseKey(it.text))) setMood(it.by, 'think');
  // Lets the automated tests see what is said, clip or not.
  window.dispatchEvent(new CustomEvent('learning-cards:speak', { detail: { text: it.text, clip: it.kind !== 'tts', by: it.by } }));
  if (items[0]?.kind === 'clip') warm([items[0]]);
  if (it.kind === 'clip') return playClip(it, mine, next);
  if (it.kind === 'audio') return playUrl(it.url, it, mine, next);
  const s = synth();
  if (!s) return next();
  try {
    const u = new SpeechSynthesisUtterance(it.text);
    const v = voices[CHARACTERS[it.by].gender];
    if (v) u.voice = v;
    u.lang = v?.lang ?? 'en-GB';
    u.rate = it.rate;
    let over = false;
    const finish = () => {
      if (over) return;
      over = true;
      clearTimeout(guard);
      next();
    };
    // Some phones never report the end of device speech.
    const guard = setTimeout(finish, 2500 + it.text.length * 110);
    u.onend = finish;
    u.onerror = finish;
    cancelCurrent = () => {
      over = true;
      clearTimeout(guard);
    };
    s.speak(u);
  } catch {
    next();
  }
}

// `queue` waits for the line being said to finish instead of cutting it off.
// `lesson` marks lines from a Watch first cartoon, which has the floor.
export type SpeakOptions = { rate?: number; by?: CharacterId; queue?: boolean; lesson?: boolean };

// Silences everything, whoever asked.
function halt() {
  turn++;
  active = null;
  cancelCurrent?.();
  cancelCurrent = null;
  try {
    synth()?.cancel();
  } catch {
    /* speech is best effort */
  }
  if (state.speaking) set({ speaking: null });
}

export function speak(speech: Speech, opts: SpeakOptions = {}) {
  if (lessonOpen && !opts.lesson) return;
  const items = itemsFor(speech, opts.rate ?? TTS_RATE, opts.by ?? host);
  if (opts.queue && enabled && active && state.speaking) {
    warm(items);
    active.push(...items);
    return;
  }
  halt();
  if (!enabled) return;
  warm(items);
  active = items;
  playItems(items, turn);
}

// Like speak, but resolves when the line has finished (or was cut off), so
// lessons can wait for each line before moving on.
export function speakAndWait(speech: Speech, opts: SpeakOptions = {}): Promise<void> {
  if (lessonOpen && !opts.lesson) return Promise.resolve();
  halt();
  if (!enabled) return new Promise(r => setTimeout(r, 900));
  const mine = turn;
  return new Promise(resolve => {
    // A stop() from elsewhere ends the line early; resolve so nothing hangs.
    const check = setInterval(() => {
      if (turn !== mine) finish();
    }, 200);
    function finish() {
      clearInterval(check);
      resolve();
    }
    const items = itemsFor(speech, opts.rate ?? TTS_RATE, opts.by ?? host);
    warm(items);
    active = items;
    playItems(items, mine, finish);
  });
}

// Gets a line ready ahead of time, so it starts without any wait.
export function prepare(speech: Speech, by: CharacterId = host) {
  warm(itemsFor(speech, TTS_RATE, by));
}

// Resolves when nobody is talking, or after `maxMs` at the latest.
export function whenQuiet(maxMs = 2500): Promise<void> {
  if (!state.speaking) return Promise.resolve();
  return new Promise(resolve => {
    const finish = () => {
      clearTimeout(timer);
      listeners.delete(check);
      resolve();
    };
    const check = () => {
      if (!state.speaking) finish();
    };
    const timer = setTimeout(finish, maxMs);
    listeners.add(check);
  });
}

// While a Watch first cartoon is open, the activity underneath stays quiet.
export function setLessonOpen(open: boolean) {
  lessonOpen = open;
}

// How long a plain line takes to say in the host's (or given) voice, in
// milliseconds. Used to light up words in time with a sentence.
export function lineMs(text: string, by: CharacterId = host) {
  return clipMs(CHARACTERS[by].voice, phraseKey(text));
}

export function stop(opts: { lesson?: boolean } = {}) {
  if (lessonOpen && !opts.lesson) return;
  halt();
}

export function setVoiceEnabled(on: boolean) {
  enabled = on;
  if (!on) halt();
}

// Praise comes from the other character, so the two feel like a team.
export function praise() {
  if (lessonOpen) return;
  const by = otherCharacter(host);
  setMood(by, 'cheer', 2400);
  setMood(host, 'cheer', 2400);
  speak(PRAISE[Math.floor(Math.random() * PRAISE.length)], { by });
}
