import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Level, ModuleColor } from './data/areas';
import { setVoiceEnabled } from './speech';
import { setMusicEnabled, setSoundsEnabled } from './sound';

// All app state lives in localStorage on this device. Nothing is sent anywhere.

export type Profile = {
  id: string;
  name: string;
  color: ModuleColor;
  stars: Record<string, number>; // key: `${areaId}/${activityId}`
  seen?: string[]; // lessons already watched, same keys
};

export type Settings = {
  voice: boolean;
  music: boolean;
  sounds: boolean;
  levels: Record<string, number>; // difficulty per area, 1 (easy) to 3
};

type Saved = { version: 1; profiles: Profile[]; currentId: string | null; settings: Settings };

const KEY = 'learning-cards:v1';
const EMPTY: Saved = { version: 1, profiles: [], currentId: null, settings: { voice: true, music: true, sounds: true, levels: {} } };

function load(): Saved {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const data = JSON.parse(raw) as Saved;
    if (data?.version !== 1 || !Array.isArray(data.profiles)) return EMPTY;
    return { ...EMPTY, ...data, settings: { ...EMPTY.settings, ...data.settings } };
  } catch {
    return EMPTY;
  }
}

function save(data: Saved) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* storage may be blocked; the app still works for this visit */
  }
}

const newId = () => Math.random().toString(36).slice(2, 10);

export const starKey = (areaId: string, activityId: string) => `${areaId}/${activityId}`;
export const totalStars = (p: Profile) => Object.values(p.stars).reduce((a, b) => a + b, 0);

type Store = {
  profiles: Profile[];
  current: Profile | null;
  settings: Settings;
  addProfile: (name: string, color: ModuleColor) => Profile;
  updateProfile: (id: string, patch: Partial<Pick<Profile, 'name' | 'color'>>) => void;
  selectProfile: (id: string | null) => void;
  awardStar: (areaId: string, activityId: string) => void;
  markSeen: (key: string) => void;
  setSettings: (patch: Partial<Settings>) => void;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Saved>(load);

  useEffect(() => save(data), [data]);
  useEffect(() => setVoiceEnabled(data.settings.voice), [data.settings.voice]);
  useEffect(() => setMusicEnabled(data.settings.music), [data.settings.music]);
  useEffect(() => setSoundsEnabled(data.settings.sounds), [data.settings.sounds]);

  const addProfile = useCallback((name: string, color: ModuleColor) => {
    const p: Profile = { id: newId(), name: name.trim(), color, stars: {} };
    setData(d => ({ ...d, profiles: [...d.profiles, p] }));
    return p;
  }, []);

  const updateProfile = useCallback((id: string, patch: Partial<Pick<Profile, 'name' | 'color'>>) => {
    setData(d => ({ ...d, profiles: d.profiles.map(p => (p.id === id ? { ...p, ...patch } : p)) }));
  }, []);

  const selectProfile = useCallback((id: string | null) => setData(d => ({ ...d, currentId: id })), []);

  const awardStar = useCallback((areaId: string, activityId: string) => {
    const k = starKey(areaId, activityId);
    setData(d => ({
      ...d,
      profiles: d.profiles.map(p => (p.id === d.currentId ? { ...p, stars: { ...p.stars, [k]: (p.stars[k] ?? 0) + 1 } } : p)),
    }));
  }, []);

  const markSeen = useCallback((key: string) => {
    setData(d => ({
      ...d,
      profiles: d.profiles.map(p => (p.id === d.currentId && !p.seen?.includes(key) ? { ...p, seen: [...(p.seen ?? []), key] } : p)),
    }));
  }, []);

  const setSettings = useCallback((patch: Partial<Settings>) => {
    setData(d => ({ ...d, settings: { ...d.settings, ...patch } }));
  }, []);

  const value = useMemo<Store>(
    () => ({
      profiles: data.profiles,
      current: data.profiles.find(p => p.id === data.currentId) ?? null,
      settings: data.settings,
      addProfile,
      updateProfile,
      selectProfile,
      awardStar,
      markSeen,
      setSettings,
    }),
    [data, addProfile, updateProfile, selectProfile, awardStar, markSeen, setSettings],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// The difficulty level chosen for an area in the parent corner.
export function useLevel(areaId: string): Level {
  const l = useStore().settings.levels[areaId];
  return l === 1 || l === 3 ? l : 2;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore must be used inside StoreProvider');
  return s;
}
