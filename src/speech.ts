// Spoken output. Each line plays a pre-recorded clip in the speaking
// character's voice (see scripts/voice). Names and letter sounds use the
// parent's own recordings when there are any. Anything without a recording
// falls back to the device's speech engine, picking a natural British voice
// of the speaker's gender. The characters' faces follow who is talking.

import lewis from './voice/lewis.json';
import alice from './voice/alice.json';
import { LETTER_SOUNDS } from './data/reading';
import { CHARACTERS, otherCharacter, type CharacterId } from './data/characters';
import { PRAISE, phraseKey, type Part, type Speech } from './voice/phrases';
import { recKey, recordingUrl } from './voice/recordings';

export type { Speech } from './voice/phrases';

const CLIPS: Record<'lewis' | 'alice', Record<string, string>> = { lewis, alice };
const TTS_RATE = 0.8;
const GAP_MS = 60;

let enabled = true;
let turn = 0; // bumped on every new line or stop, so stale callbacks do nothing
let host: CharacterId = 'jabari';

type Item = { by: CharacterId; text: string } & ({ kind: 'audio'; url: string } | { kind: 'tts'; rate: number });

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

// ---------- audio clips ----------

const audio: HTMLAudioElement | null = typeof Audio !== 'undefined' ? new Audio() : null;
if (audio) audio.preload = 'auto';

// iPads only let audio play after a tap, and then only on an element that
// has played before, so play a moment of silence on the first touch.
const SILENCE = './voice/silence.mp3';
let unlocked = false;
function unlock() {
  if (unlocked || !audio) return;
  unlocked = true;
  audio.src = SILENCE;
  audio.play().then(() => audio.pause(), () => (unlocked = false));
}
if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', unlock, { capture: true });
  window.addEventListener('keydown', unlock, { capture: true });
}

// ---------- building and playing a line ----------

function clipFor(by: CharacterId, text: string) {
  const key = phraseKey(text);
  const own = CHARACTERS[by].voice;
  const file = CLIPS[own][key];
  if (file) return `./voice/${own}/${file}`;
  // Not recorded in this voice yet: use the other voice rather than a robot.
  const other = CHARACTERS[otherCharacter(by)].voice;
  return CLIPS[other][key] ? `./voice/${other}/${CLIPS[other][key]}` : null;
}

function itemsFor(speech: Speech, rate: number, by: CharacterId): Item[] {
  const parts: Part[] = typeof speech === 'string' ? [speech] : speech;
  return parts.flatMap((p): Item[] => {
    if (typeof p === 'string') {
      const url = clipFor(by, p);
      if (url) return [{ kind: 'audio', url, text: p, by }];
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

// Lines that make the speaker look encouraging rather than pleased.
const ENCOURAGE = /^(try again|oops)/;

function playItems(items: Item[], mine: number, done?: () => void) {
  if (mine !== turn) return;
  const it = items.shift();
  if (!it) {
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
  window.dispatchEvent(new CustomEvent('learning-cards:speak', { detail: { text: it.text, clip: it.kind === 'audio', by: it.by } }));
  if (it.kind === 'audio' && audio) {
    audio.onended = next;
    audio.onerror = next;
    audio.src = it.url;
    audio.play().catch(next);
    return;
  }
  const s = synth();
  if (!s) return next();
  try {
    const u = new SpeechSynthesisUtterance(it.text);
    const v = voices[CHARACTERS[it.by].gender];
    if (v) u.voice = v;
    u.lang = v?.lang ?? 'en-GB';
    u.rate = it.kind === 'tts' ? it.rate : TTS_RATE;
    u.onend = next;
    u.onerror = next;
    s.speak(u);
  } catch {
    next();
  }
}

export type SpeakOptions = { rate?: number; by?: CharacterId };

export function speak(speech: Speech, opts: SpeakOptions = {}) {
  stop();
  if (!enabled) return;
  playItems(itemsFor(speech, opts.rate ?? TTS_RATE, opts.by ?? host), turn);
}

// Like speak, but resolves when the line has finished (or was cut off), so
// lessons can wait for each line before moving on.
export function speakAndWait(speech: Speech, opts: SpeakOptions = {}): Promise<void> {
  stop();
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
    playItems(itemsFor(speech, opts.rate ?? TTS_RATE, opts.by ?? host), mine, finish);
  });
}

export function stop() {
  turn++;
  if (audio) {
    audio.onended = null;
    audio.onerror = null;
    audio.pause();
  }
  try {
    synth()?.cancel();
  } catch {
    /* speech is best effort */
  }
  if (state.speaking) set({ speaking: null });
}

export function setVoiceEnabled(on: boolean) {
  enabled = on;
  if (!on) stop();
}

// Praise comes from the other character, so the two feel like a team.
export function praise() {
  const by = otherCharacter(host);
  setMood(by, 'cheer', 2400);
  setMood(host, 'cheer', 2400);
  speak(PRAISE[Math.floor(Math.random() * PRAISE.length)], { by });
}
