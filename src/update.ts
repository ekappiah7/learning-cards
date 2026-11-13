import { registerSW } from 'virtual:pwa-register';

// App updates. A new version downloads in the background and is switched in
// at a safe moment (the player or home screen), never in the middle of an
// activity. The app also checks for a new version each time it is opened.

let safe = true;
let waiting = false;

const apply = registerSW({
  immediate: true,
  onNeedRefresh() {
    waiting = true;
    tryApply();
  },
  onRegisteredSW(_url, registration) {
    if (!registration) return;
    const check = () => {
      if (navigator.onLine) registration.update().catch(() => undefined);
    };
    document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && check());
    setInterval(check, 60 * 60 * 1000);
  },
});

function tryApply() {
  if (waiting && safe) void apply(true);
}

// Called by the app as screens change.
export function setSafeToUpdate(isSafe: boolean) {
  safe = isSafe;
  tryApply();
}

// Parent corner: look for a new version now. Resolves to what happened.
export async function checkForUpdate(): Promise<'updating' | 'latest' | 'offline'> {
  if (!navigator.onLine) return 'offline';
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    await reg?.update();
    await new Promise(r => setTimeout(r, 1500));
    if (reg?.waiting || reg?.installing || waiting) {
      safe = true;
      tryApply();
      return 'updating';
    }
    return 'latest';
  } catch {
    return 'offline';
  }
}

export const APP_VERSION: string = __APP_VERSION__;
