// Speech helper around the Web Speech API. Prefers an en-GB voice at a
// child-friendly rate, and stays silent when the parent turns voice off.

const DEFAULT_RATE = 0.8;

let enabled = true;
let voice: SpeechSynthesisVoice | null = null;

function synth(): SpeechSynthesis | null {
  return typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
}

function pickVoice() {
  const s = synth();
  if (!s) return;
  const voices = s.getVoices();
  voice =
    voices.find(v => v.lang === 'en-GB' && v.localService) ||
    voices.find(v => v.lang === 'en-GB') ||
    voices.find(v => v.lang.startsWith('en-GB')) ||
    voices.find(v => v.lang.startsWith('en')) ||
    null;
}

// Voices load asynchronously in most browsers.
const s0 = synth();
if (s0) {
  pickVoice();
  s0.addEventListener?.('voiceschanged', pickVoice);
}

export function setVoiceEnabled(on: boolean) {
  enabled = on;
  if (!on) stop();
}

export function stop() {
  try {
    synth()?.cancel();
  } catch {
    /* speech is best effort */
  }
}

export type SpeakOptions = { rate?: number; pitch?: number; queue?: boolean };

export function speak(text: string, opts: SpeakOptions = {}) {
  const s = synth();
  if (!enabled || !s || !text) return;
  try {
    const u = new SpeechSynthesisUtterance(text);
    if (voice) u.voice = voice;
    u.lang = voice?.lang ?? 'en-GB';
    u.rate = opts.rate ?? DEFAULT_RATE;
    u.pitch = opts.pitch ?? 1.1;
    if (!opts.queue) s.cancel();
    s.speak(u);
  } catch {
    /* speech is best effort */
  }
}

const PRAISE = ['Well done!', 'Brilliant!', 'Great job!', 'You did it!', 'Super!', 'Fantastic!'];

export function praise(name?: string) {
  const p = PRAISE[Math.floor(Math.random() * PRAISE.length)];
  speak(name ? `${p} ${name}!`.replace('!!', '!') : p);
}
