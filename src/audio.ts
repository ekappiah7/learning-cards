// One shared audio output for the music, the sound effects and the recorded
// voices. Browsers keep it asleep until the first tap.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

export function audioContext(): AudioContext | null {
  if (ctx) return ctx;
  const AC =
    typeof window !== 'undefined'
      ? (window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)
      : undefined;
  if (!AC) return null;
  try {
    ctx = new AC({ latencyHint: 'interactive' });
  } catch {
    return null;
  }
  master = ctx.createGain();
  master.gain.value = 1;
  master.connect(ctx.destination);
  return ctx;
}

// Where everything plays into.
export function audioOut(): GainNode | null {
  audioContext();
  return master;
}

// Wakes the output up. Resolves true once sound can play.
export function wakeAudio(): Promise<boolean> {
  const c = audioContext();
  if (!c) return Promise.resolve(false);
  if (c.state === 'running') return Promise.resolve(true);
  return c.resume().then(
    () => c.state === 'running',
    () => false,
  );
}

if (typeof window !== 'undefined') {
  const wake = () => void wakeAudio();
  window.addEventListener('pointerdown', wake, { capture: true });
  window.addEventListener('keydown', wake, { capture: true });
  // Coming back to the app after the screen was off.
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && ctx && ctx.state !== 'running') void ctx.resume().catch(() => undefined);
  });
}
