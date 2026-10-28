import { useSyncExternalStore } from 'react';

// The parent's own recordings (children's names and letter sounds), kept in
// this browser's IndexedDB. They never leave the device.

const DB_NAME = 'learning-cards-voice';
const STORE = 'recordings';

export const recKey = {
  name: (profileId: string) => `name:${profileId}`,
  letter: (letter: string) => `letter:${letter}`,
};

const urls = new Map<string, string>();
const listeners = new Set<() => void>();
let version = 0;

function changed() {
  version++;
  listeners.forEach(l => l());
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function run(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => void): Promise<void> {
  return openDb().then(
    db =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        fn(tx.objectStore(STORE));
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      }),
  );
}

// Loads every saved recording into memory once at startup.
export async function loadRecordings() {
  try {
    await run('readonly', s => {
      const req = s.openCursor();
      req.onsuccess = () => {
        const c = req.result;
        if (!c) return;
        urls.set(String(c.key), URL.createObjectURL(c.value as Blob));
        c.continue();
      };
    });
    changed();
  } catch {
    /* storage may be unavailable; the app falls back to the built-in voice */
  }
}

export function recordingUrl(key: string) {
  return urls.get(key);
}

export async function saveRecording(key: string, blob: Blob) {
  await run('readwrite', s => s.put(blob, key));
  const old = urls.get(key);
  if (old) URL.revokeObjectURL(old);
  urls.set(key, URL.createObjectURL(blob));
  changed();
}

export async function deleteRecording(key: string) {
  await run('readwrite', s => s.delete(key));
  const old = urls.get(key);
  if (old) URL.revokeObjectURL(old);
  urls.delete(key);
  changed();
}

// Re-renders a component when recordings are added or removed.
export function useRecordings() {
  useSyncExternalStore(
    l => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => version,
  );
  return { has: (key: string) => urls.has(key) };
}
