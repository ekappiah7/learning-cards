import { useState } from 'react';
import { Check, Mic, Pencil, Plus, Volume2, VolumeX } from 'lucide-react';
import { AREAS, LEVEL_NAMES, moduleVar, type Level } from '../data/areas';
import { LETTER_EXAMPLES } from '../data/reading';
import { navigate } from '../router';
import { starKey, totalStars, useStore, type Profile } from '../store';
import { BackButton, TopBar } from '../components/ui';
import { Recorder } from '../components/Recorder';
import type { Speech } from '../speech';
import { recKey, useRecordings } from '../voice/recordings';
import { ProfileDialog } from './Profiles';

// For grown-ups: voice, players, progress and difficulty. Reached from the
// "Who is playing?" screen with a press-and-hold.
export function Parent() {
  const { profiles, settings, setSettings, addProfile, updateProfile } = useStore();
  const [editing, setEditing] = useState<Profile | 'new' | null>(null);
  const [recording, setRecording] = useState<{ title: string; hint: string; key: string; current: Speech } | null>(null);
  const { has } = useRecordings();

  const recordName = (p: Profile) =>
    setRecording({
      title: `${p.name}'s name`,
      hint: `Say "${p.name}" clearly, once. The app says it after "Hello," and "Well done,".`,
      key: recKey.name(p.id),
      current: ['Hello,', { name: p.name, id: p.id }],
    });
  const recordLetter = (l: string) =>
    setRecording({
      title: `Letter ${l}`,
      hint: `Say only the sound "${l}" makes at the start of "${LETTER_EXAMPLES[l]}", short and clean, without adding "uh" where you can.`,
      key: recKey.letter(l),
      current: [{ letter: l }],
    });

  const setLevel = (areaId: string, level: Level) => setSettings({ levels: { ...settings.levels, [areaId]: level } });
  const levelOf = (areaId: string): Level => {
    const l = settings.levels[areaId];
    return l === 1 || l === 3 ? l : 2;
  };

  return (
    <div className="page parent fade-in">
      <TopBar
        eyebrow="For grown-ups"
        title={<>Parent <em>corner</em></>}
        spoken="Parent corner"
        left={<BackButton label="Who is playing" onClick={() => navigate({ name: 'profiles' })} />}
      />

      <section className="panel parent-section">
        <h2>Voice</h2>
        <div className="parent-row">
          <span>{settings.voice ? 'The app reads everything aloud.' : 'The app is silent.'}</span>
          <button
            type="button"
            role="switch"
            aria-checked={settings.voice}
            className="switch"
            onClick={() => setSettings({ voice: !settings.voice })}
          >
            {settings.voice ? <Volume2 size={28} strokeWidth={1.5} aria-hidden /> : <VolumeX size={28} strokeWidth={1.5} aria-hidden />}
            {settings.voice ? 'Voice on' : 'Voice off'}
          </button>
        </div>
      </section>

      <section className="panel parent-section">
        <h2>Players</h2>
        {profiles.length === 0 && <p className="parent-note">No players yet.</p>}
        {profiles.map(p => (
          <div key={p.id} className="parent-row">
            <span className="player">
              <span className="dot" style={{ background: moduleVar(p.color) }} />
              <strong>{p.name}</strong>
              <span className="parent-note">
                {totalStars(p)} star{totalStars(p) === 1 ? '' : 's'}
              </span>
            </span>
            <span className="row-actions">
              <button type="button" className="pill secondary small" onClick={() => recordName(p)} aria-label={`Record ${p.name}'s name`}>
                {has(recKey.name(p.id)) ? <Check size={24} strokeWidth={1.5} aria-hidden /> : <Mic size={24} strokeWidth={1.5} aria-hidden />} Name
              </button>
              <button type="button" className="pill secondary small" onClick={() => setEditing(p)}>
                <Pencil size={24} strokeWidth={1.5} aria-hidden /> Edit
              </button>
            </span>
          </div>
        ))}
        <div className="parent-row end">
          <button type="button" className="pill primary small" onClick={() => setEditing('new')}>
            <Plus size={24} strokeWidth={1.5} aria-hidden /> Add a player
          </button>
        </div>
      </section>

      <section className="panel parent-section">
        <h2>Letter sounds</h2>
        <p className="parent-note">
          The app's voice can only approximate phonics sounds. Tap a letter to record how you say its sound; your recording
          replaces the app's version on this tablet. Letters with a tick are recorded. Recordings never leave this device.
        </p>
        <div className="letter-grid">
          {'abcdefghijklmnopqrstuvwxyz'.split('').map(l => (
            <button
              key={l}
              type="button"
              className={`letter-key${has(recKey.letter(l)) ? ' done' : ''}`}
              aria-label={`Letter ${l}${has(recKey.letter(l)) ? ', recorded' : ''}`}
              onClick={() => recordLetter(l)}
            >
              {l}
              {has(recKey.letter(l)) && <Check size={18} strokeWidth={2} aria-hidden />}
            </button>
          ))}
        </div>
      </section>

      <section className="panel parent-section">
        <h2>Progress</h2>
        {profiles.length === 0 ? (
          <p className="parent-note">Stars will show here once a child has played.</p>
        ) : (
          <div className="table-wrap">
            <table className="progress">
              <thead>
                <tr>
                  <th scope="col">Stars per activity</th>
                  {profiles.map(p => (
                    <th key={p.id} scope="col">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              {AREAS.map(a => (
                <tbody key={a.id}>
                  <tr className="area-row">
                    <th scope="rowgroup">
                      <span className="dot" style={{ background: moduleVar(a.color) }} />
                      {a.title}
                    </th>
                    {profiles.map(p => (
                      <td key={p.id}>{a.activities.reduce((n, act) => n + (p.stars[starKey(a.id, act.id)] ?? 0), 0)}</td>
                    ))}
                  </tr>
                  {a.activities.map(act => (
                    <tr key={act.id}>
                      <th scope="row">{act.title}</th>
                      {profiles.map(p => (
                        <td key={p.id}>{p.stars[starKey(a.id, act.id)] ?? 0}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
        )}
      </section>

      <section className="panel parent-section">
        <h2>Difficulty</h2>
        <p className="parent-note">Applies to every player. Changes take effect the next time an activity is opened.</p>
        {AREAS.map(a => {
          const current = levelOf(a.id);
          return (
            <div key={a.id} className="level-block">
              <div className="parent-row">
                <span className="player">
                  <span className="dot" style={{ background: moduleVar(a.color) }} />
                  <strong>{a.title}</strong>
                </span>
                <div className="seg" role="radiogroup" aria-label={`${a.title} difficulty`}>
                  {([1, 2, 3] as Level[]).map(l => (
                    <button key={l} type="button" role="radio" aria-checked={l === current} onClick={() => setLevel(a.id, l)}>
                      {LEVEL_NAMES[l]}
                    </button>
                  ))}
                </div>
              </div>
              <p className="parent-note">{a.levels[current]}</p>
            </div>
          );
        })}
      </section>

      {recording && (
        <Recorder title={recording.title} hint={recording.hint} recKey={recording.key} current={recording.current} onClose={() => setRecording(null)} />
      )}

      {editing && (
        <ProfileDialog
          heading={editing === 'new' ? 'New player' : 'Edit player'}
          initialName={editing === 'new' ? '' : editing.name}
          initialColor={editing === 'new' ? undefined : editing.color}
          taken={profiles.map(p => p.color)}
          onCancel={() => setEditing(null)}
          onSave={(name, color) => {
            if (editing === 'new') addProfile(name, color);
            else updateProfile(editing.id, { name: name.trim(), color });
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
