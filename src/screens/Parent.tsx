import { useState } from 'react';
import { Pencil, Plus, Volume2, VolumeX } from 'lucide-react';
import { AREAS, LEVEL_NAMES, moduleVar, type Level } from '../data/areas';
import { navigate } from '../router';
import { starKey, totalStars, useStore, type Profile } from '../store';
import { BackButton, TopBar } from '../components/ui';
import { ProfileDialog } from './Profiles';

// For grown-ups: voice, players, progress and difficulty. Reached from the
// "Who is playing?" screen with a press-and-hold.
export function Parent() {
  const { profiles, settings, setSettings, addProfile, updateProfile } = useStore();
  const [editing, setEditing] = useState<Profile | 'new' | null>(null);

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
            <button type="button" className="pill secondary small" onClick={() => setEditing(p)}>
              <Pencil size={24} strokeWidth={1.5} aria-hidden /> Edit
            </button>
          </div>
        ))}
        <div className="parent-row end">
          <button type="button" className="pill primary small" onClick={() => setEditing('new')}>
            <Plus size={24} strokeWidth={1.5} aria-hidden /> Add a player
          </button>
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
