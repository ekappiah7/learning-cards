import { useSyncExternalStore } from 'react';
import index from './packs.json';

// The recorded voices, packed into a few files (scripts/voice/pack.mjs).
// The app downloads the packs itself and keeps them on the device, so
// speech works with no internet. Until a pack has arrived, its clips are
// fetched one by one from the network instead.

type Voice = 'lewis' | 'alice';
type Clip = [pack: number, offset: number, length: number, file: string];
const INDEX = index as unknown as Record<Voice, { packs: string[]; clips: Record<string, Clip> }>;

const CACHE = 'voice-packs';
const DIR = './voice/packs/';
const KBPS = 48; // clips are constant-bitrate mp3, so length gives duration

const blobs = new Map<string, Blob>();
const urls = new Map<string, string>();

export type PackState = { total: number; done: number; finished: boolean; failed: boolean };
let state: PackState = { total: 0, done: 0, finished: false, failed: false };
const listeners = new Set<() => void>();
function set(next: Partial<PackState>) {
  state = { ...state, ...next };
  listeners.forEach(l => l());
}

export function hasClip(voice: Voice, key: string) {
  return key in INDEX[voice].clips;
}

// A URL that plays this clip: from the downloaded pack when it is here,
// otherwise the single file on the network.
export function clipUrl(voice: Voice, key: string): string | null {
  const clip = INDEX[voice].clips[key];
  if (!clip) return null;
  const [pack, offset, length, file] = clip;
  const blob = blobs.get(INDEX[voice].packs[pack]);
  if (!blob) return `./voice/${voice}/${file}`;
  const id = `${voice}/${key}`;
  let url = urls.get(id);
  if (!url) {
    url = URL.createObjectURL(blob.slice(offset, offset + length, 'audio/mpeg'));
    urls.set(id, url);
  }
  return url;
}

// The bytes of one clip: cut from its pack when the pack is on the device,
// otherwise fetched alone from the network (given up after a few seconds,
// so a bad connection cannot hold a whole line up).
export async function clipBytes(voice: Voice, key: string): Promise<ArrayBuffer | null> {
  const clip = INDEX[voice].clips[key];
  if (!clip) return null;
  const [pack, offset, length, file] = clip;
  const blob = blobs.get(INDEX[voice].packs[pack]);
  try {
    if (blob) return await blob.slice(offset, offset + length).arrayBuffer();
    const stop = new AbortController();
    const timer = setTimeout(() => stop.abort(), 4000);
    try {
      const res = await fetch(`./voice/${voice}/${file}`, { signal: stop.signal, priority: 'high' } as RequestInit);
      return res.ok ? await res.arrayBuffer() : null;
    } finally {
      clearTimeout(timer);
    }
  } catch {
    return null;
  }
}

// How long a clip lasts, in milliseconds (0 when there is no clip).
export function clipMs(voice: Voice, key: string) {
  const clip = INDEX[voice].clips[key];
  return clip ? (clip[2] * 8) / KBPS : 0;
}

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

async function fetchPack(file: string): Promise<Blob> {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(DIR + file);
      if (!res.ok) throw new Error(String(res.status));
      return await res.blob();
    } catch (e) {
      if (attempt >= 4) throw e;
      await wait(1500 * (attempt + 1));
    }
  }
}

let started = false;

// Loads packs already on the device, downloads the rest, and removes packs
// from older versions. Safe to call again after a failure.
export async function loadPacks() {
  if (started) return;
  started = true;
  const files = [...INDEX.lewis.packs, ...INDEX.alice.packs];
  set({ total: files.length, done: 0, finished: false, failed: false });
  let cache: Cache | null = null;
  try {
    cache = 'caches' in window ? await caches.open(CACHE) : null;
    void navigator.storage?.persist?.();
  } catch {
    cache = null;
  }
  let failed = false;
  // Interleave the two voices so both start working early.
  const order = files.slice().sort((a, b) => a.slice(a.indexOf('-')).localeCompare(b.slice(b.indexOf('-'))));
  for (const file of order) {
    if (blobs.has(file)) {
      set({ done: state.done + 1 });
      continue;
    }
    try {
      const hit = await cache?.match(DIR + file);
      let blob = hit ? await hit.blob() : null;
      if (!blob) {
        blob = await fetchPack(file);
        await cache?.put(DIR + file, new Response(blob, { headers: { 'Content-Type': 'application/octet-stream' } })).catch(() => undefined);
      }
      blobs.set(file, blob);
      set({ done: state.done + 1 });
    } catch {
      failed = true;
    }
  }
  if (cache && !failed) {
    const keep = new Set(files.map(f => new URL(DIR + f, window.location.href).href));
    for (const req of await cache.keys()) if (!keep.has(req.url)) await cache.delete(req);
  }
  started = false;
  set({ finished: !failed, failed });
}

// After a failure, try again when the connection comes back, when the app
// is opened again, and every half minute while it stays open.
if (typeof window !== 'undefined') {
  const retry = () => {
    if (state.failed && navigator.onLine !== false) void loadPacks();
  };
  window.addEventListener('online', retry);
  document.addEventListener('visibilitychange', () => !document.hidden && retry());
  setInterval(retry, 30000);
}

export function usePackState() {
  return useSyncExternalStore(
    l => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
  );
}
