// Music and sound effects, made live with the Web Audio API: no audio files,
// so they work offline and add nothing to the download. The music gets
// quieter whenever a character is talking.

import { TUNES, type Theme } from './data/music';
import { characterState } from './speech';

const MUSIC_LEVEL = 0.16;
const DUCKED_LEVEL = 0.045;
const SFX_LEVEL = 0.4;

let ctx: AudioContext | null = null;
let musicGain: GainNode | null = null;
let sfxGain: GainNode | null = null;
let musicOn = true;
let sfxOn = true;
let theme: Theme | null = null;
let timer: ReturnType<typeof setInterval> | undefined;

function audio(): AudioContext | null {
  if (ctx) return ctx;
  const AC = typeof window !== 'undefined' ? window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext : undefined;
  if (!AC) return null;
  ctx = new AC();
  const master = ctx.createGain();
  master.gain.value = 1;
  master.connect(ctx.destination);
  musicGain = ctx.createGain();
  musicGain.gain.value = MUSIC_LEVEL;
  musicGain.connect(master);
  sfxGain = ctx.createGain();
  sfxGain.gain.value = SFX_LEVEL;
  sfxGain.connect(master);
  return ctx;
}

// Browsers start audio suspended until the first tap.
function wake() {
  const c = audio();
  if (c && c.state === 'suspended') c.resume().catch(() => undefined);
  if (theme && musicOn && !timer) startLoop();
}
// A soft tick for every button press.
function tick(e: Event) {
  if ((e.target as Element | null)?.closest?.('button')) sfx('tap');
}
if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', wake, { capture: true });
  window.addEventListener('pointerdown', tick);
  window.addEventListener('keydown', wake, { capture: true });
}

// Duck the music under speech.
characterState.subscribe(() => {
  if (!ctx || !musicGain) return;
  const target = characterState.get().speaking ? DUCKED_LEVEL : MUSIC_LEVEL;
  musicGain.gain.setTargetAtTime(target, ctx.currentTime, 0.12);
});

const freq = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

// One soft note: oscillator through an envelope.
function note(dest: AudioNode, midi: number, at: number, dur: number, type: OscillatorType, level: number) {
  const c = ctx!;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq(midi);
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(level, at + 0.02);
  g.gain.exponentialRampToValueAtTime(level * 0.5, at + Math.min(0.25, dur * 0.5));
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  o.connect(g).connect(dest);
  o.start(at);
  o.stop(at + dur + 0.05);
}

function noise(dest: AudioNode, at: number, dur: number, level: number, highpass = 4000) {
  const c = ctx!;
  const buf = c.createBuffer(1, Math.max(1, Math.floor(c.sampleRate * dur)), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = 'highpass';
  f.frequency.value = highpass;
  const g = c.createGain();
  g.gain.value = level;
  src.connect(f).connect(g).connect(dest);
  src.start(at);
}

// ---------- music loop ----------

let nextTime = 0;
let step = 0; // melody index
let beat = 0; // beats since the tune started

function startLoop() {
  const c = audio();
  if (!c || !theme || timer) return;
  nextTime = c.currentTime + 0.1;
  step = 0;
  beat = 0;
  timer = setInterval(schedule, 50);
}

function stopLoop() {
  clearInterval(timer);
  timer = undefined;
}

// Schedules notes a little ahead of time so playback stays smooth.
function schedule() {
  const c = ctx;
  if (!c || !theme || !musicGain || c.state !== 'running') return;
  const tune = TUNES[theme];
  const spb = 60 / tune.bpm;
  while (nextTime < c.currentTime + 0.25) {
    const [n, beats] = tune.melody[step % tune.melody.length];
    const dur = beats * spb;
    if (n) note(musicGain, n, nextTime, dur * 0.95, 'triangle', 0.35);
    // Bass and a soft chord at the start of each bar, shaker on off-beats.
    for (let b = 0; b < beats; b++) {
      const t = nextTime + b * spb;
      const inBar = (beat + b) % 4;
      const root = tune.chords[Math.floor((beat + b) / 4) % tune.chords.length];
      if (inBar === 0) {
        note(musicGain, root, t, spb * 1.8, 'sine', 0.5);
        note(musicGain, root + 12, t, spb * 3.6, 'sine', 0.12);
        note(musicGain, root + 16, t, spb * 3.6, 'sine', 0.08);
        note(musicGain, root + 19, t, spb * 3.6, 'sine', 0.08);
      } else if (inBar === 2) {
        note(musicGain, root + 7, t, spb * 1.6, 'sine', 0.35);
      }
      if (tune.shaker) noise(musicGain, t + spb / 2, 0.05, 0.12, 6000);
    }
    nextTime += dur;
    beat += beats;
    step++;
  }
}

export const currentTheme = () => theme;

export function playMusic(t: Theme | null) {
  if (t === theme) return;
  theme = t;
  stopLoop();
  if (t && musicOn && ctx?.state === 'running') startLoop();
}

export function setMusicEnabled(on: boolean) {
  musicOn = on;
  if (!on) stopLoop();
  else if (theme && ctx?.state === 'running') startLoop();
}

export function setSoundsEnabled(on: boolean) {
  sfxOn = on;
}

// ---------- sound effects ----------

export type Sfx = 'tap' | 'right' | 'wrong' | 'star' | 'clap' | 'flip' | 'pop' | 'whoosh' | `pad${0 | 1 | 2 | 3}`;

const PADS = [72, 76, 79, 84]; // Copy the colours: one note per pad

export function sfx(name: Sfx) {
  if (!sfxOn) return;
  const c = audio();
  if (!c || !sfxGain || c.state !== 'running') return;
  const t = c.currentTime + 0.01;
  const g = sfxGain;
  switch (name) {
    case 'tap':
      note(g, 84, t, 0.07, 'sine', 0.25);
      break;
    case 'pop':
      note(g, 79, t, 0.09, 'sine', 0.4);
      note(g, 91, t + 0.03, 0.06, 'sine', 0.2);
      break;
    case 'right':
      [72, 76, 79, 84].forEach((n, i) => note(g, n, t + i * 0.07, 0.3, 'triangle', 0.35));
      break;
    case 'wrong':
      note(g, 62, t, 0.18, 'sine', 0.3);
      note(g, 59, t + 0.14, 0.25, 'sine', 0.25);
      break;
    case 'star':
      [72, 76, 79, 84, 88, 91].forEach((n, i) => note(g, n, t + i * 0.09, 0.5, 'triangle', 0.35));
      noise(g, t + 0.5, 0.4, 0.15, 7000);
      break;
    case 'clap':
      noise(g, t, 0.09, 0.9, 1200);
      break;
    case 'flip':
      noise(g, t, 0.12, 0.35, 2500);
      break;
    case 'whoosh':
      noise(g, t, 0.3, 0.25, 1500);
      break;
    default: {
      const i = Number(name.slice(3));
      note(g, PADS[i] ?? 72, t, 0.4, 'triangle', 0.45);
    }
  }
}
