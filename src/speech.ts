// Spoken output. Each line plays a pre-recorded clip in the app's voice
// (see scripts/voice). Names and letter sounds use the parent's own
// recordings when there are any. Anything without a recording falls back to
// the device's speech engine, preferring a natural British male voice.

import clips from './voice/lewis.json';
import { LETTER_SOUNDS } from './data/reading';
import { PRAISE, phraseKey, type Part, type Speech } from './voice/phrases';
import { recKey, recordingUrl } from './voice/recordings';

export type { Speech } from './voice/phrases';

const CLIP_DIR = './voice/lewis/';
const CLIPS = clips as Record<string, string>;
const TTS_RATE = 0.8;
const GAP_MS = 60;

let enabled = true;
let turn = 0; // bumped on every new line or stop, so stale callbacks do nothing

type Item = { kind: 'audio'; url: string; text: string } | { kind: 'tts'; text: string; rate: number };

// ---------- device voice (fallback) ----------

function synth(): SpeechSynthesis | null {
  return typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
}

let voice: SpeechSynthesisVoice | null = null;
const MALE = /daniel|arthur|oliver|george|ryan|thomas|harry|malcolm|lewis|uk english male|male/i;
const NATURAL = /natural|neural|enhanced|premium|online/i;

function score(v: SpeechSynthesisVoice) {
  let s = 0;
  if (v.lang === 'en-GB' || v.lang === 'en_GB') s += 8;
  else if (v.lang.startsWith('en')) s += 2;
  else return -1;
  if (MALE.test(v.name)) s += 4;
  if (NATURAL.test(v.name)) s += 3;
  if (v.localService) s += 1;
  return s;
}

function pickVoice() {
  const s = synth();
  if (!s) return;
  const ranked = s.getVoices().map(v => [score(v), v] as const).filter(([n]) => n >= 0).sort((a, b) => b[0] - a[0]);
  voice = ranked[0]?.[1] ?? null;
}

const s0 = synth();
if (s0) {
  pickVoice();
  s0.addEventListener?.('voiceschanged', pickVoice);
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

function itemsFor(speech: Speech, rate: number): Item[] {
  const parts: Part[] = typeof speech === 'string' ? [speech] : speech;
  return parts.flatMap((p): Item[] => {
    if (typeof p === 'string') {
      const file = CLIPS[phraseKey(p)];
      if (file) return [{ kind: 'audio', url: CLIP_DIR + file, text: p }];
      return p.trim() ? [{ kind: 'tts', text: p, rate }] : [];
    }
    if ('name' in p) {
      const url = recordingUrl(recKey.name(p.id));
      return url ? [{ kind: 'audio', url, text: p.name }] : [{ kind: 'tts', text: p.name, rate }];
    }
    const url = recordingUrl(recKey.letter(p.letter));
    return url ? [{ kind: 'audio', url, text: p.letter }] : itemsFor(LETTER_SOUNDS[p.letter] ?? p.letter, rate);
  });
}

function playItems(items: Item[], mine: number) {
  if (mine !== turn) return;
  const it = items.shift();
  if (!it) return;
  const next = () => {
    if (mine === turn) setTimeout(() => playItems(items, mine), GAP_MS);
  };
  // Lets the automated tests see what is said, clip or not.
  window.dispatchEvent(new CustomEvent('learning-cards:speak', { detail: { text: it.text, clip: it.kind === 'audio' } }));
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
    if (voice) u.voice = voice;
    u.lang = voice?.lang ?? 'en-GB';
    u.rate = it.kind === 'tts' ? it.rate : TTS_RATE;
    u.onend = next;
    u.onerror = next;
    s.speak(u);
  } catch {
    next();
  }
}

export type SpeakOptions = { rate?: number };

export function speak(speech: Speech, opts: SpeakOptions = {}) {
  stop();
  if (!enabled) return;
  playItems(itemsFor(speech, opts.rate ?? TTS_RATE), turn);
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
}

export function setVoiceEnabled(on: boolean) {
  enabled = on;
  if (!on) stop();
}

export function praise() {
  speak(PRAISE[Math.floor(Math.random() * PRAISE.length)]);
}
