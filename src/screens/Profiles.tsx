import { useState } from 'react';
import { Check, Plus, X } from 'lucide-react';
import { PROFILE_COLORS, moduleVar, type ModuleColor } from '../data/areas';
import { navigate } from '../router';
import { speak } from '../speech';
import { useStore } from '../store';
import { HoldToOpen, TopBar } from '../components/ui';

export function Profiles() {
  const { profiles, addProfile, selectProfile } = useStore();
  const [adding, setAdding] = useState(false);

  const pick = (id: string, name: string) => {
    selectProfile(id);
    speak(['Hello,', { name, id }]);
    navigate({ name: 'home' });
  };

  return (
    <div className="page fade-in">
      <TopBar
        eyebrow="Learning cards"
        title={<>Who is <em>playing?</em></>}
        spoken="Who is playing?"
        right={<HoldToOpen label="Parent corner" onOpen={() => navigate({ name: 'parent' })} />}
      />

      <div className="grid fill">
        {profiles.map(p => (
          <button key={p.id} type="button" className="card-tile" onClick={() => pick(p.id, p.name)}>
            <span className="avatar" style={{ background: moduleVar(p.color) }}>{p.name.charAt(0).toUpperCase()}</span>
            <span>{p.name}</span>
          </button>
        ))}
        <button
          type="button"
          className="card-tile"
          onClick={() => {
            speak('Add a player');
            setAdding(true);
          }}
          aria-label="Add a player"
        >
          <span className="disc outline" style={{ width: 140, height: 140 }}>
            <Plus size={56} strokeWidth={1.5} aria-hidden />
          </span>
          <span>Add a player</span>
        </button>
      </div>

      {profiles.length === 0 && <p className="empty-note">A grown-up can add each child here.</p>}

      {adding && (
        <ProfileDialog
          taken={profiles.map(p => p.color)}
          onCancel={() => setAdding(false)}
          onSave={(name, color) => {
            const p = addProfile(name, color);
            setAdding(false);
            pick(p.id, p.name);
          }}
        />
      )}
    </div>
  );
}

// Used here to add a player, and later in the parent corner to rename one.
export function ProfileDialog({
  initialName = '',
  initialColor,
  taken = [],
  heading = 'New player',
  onSave,
  onCancel,
}: {
  initialName?: string;
  initialColor?: ModuleColor;
  taken?: ModuleColor[];        // colours other players use; the default avoids them
  heading?: string;
  onSave: (name: string, color: ModuleColor) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState<ModuleColor>(initialColor ?? PROFILE_COLORS.find(c => !taken.includes(c)) ?? PROFILE_COLORS[0]);
  const ok = name.trim().length > 0;

  return (
    <div className="scrim" role="dialog" aria-modal="true" aria-label={heading} onClick={onCancel}>
      <form
        className="panel dialog"
        onClick={e => e.stopPropagation()}
        onSubmit={e => {
          e.preventDefault();
          if (ok) onSave(name, color);
        }}
      >
        <h2>{heading}</h2>
        <label className="field-label" htmlFor="profile-name">Name</label>
        <input
          id="profile-name"
          className="input"
          value={name}
          maxLength={20}
          autoComplete="off"
          autoFocus
          onChange={e => setName(e.target.value)}
        />
        <div className="field-label">Colour</div>
        <div className="swatches">
          {PROFILE_COLORS.map(c => (
            <button
              key={c}
              type="button"
              className="swatch"
              aria-label={`Colour ${c}`}
              aria-pressed={c === color}
              style={{ background: moduleVar(c) }}
              onClick={() => setColor(c)}
            >
              {c === color && <Check size={36} strokeWidth={1.5} aria-hidden />}
            </button>
          ))}
        </div>
        <div className="actions">
          <button type="button" className="pill secondary" onClick={onCancel}>
            <X size={32} strokeWidth={1.5} aria-hidden /> Cancel
          </button>
          <button type="submit" className="pill primary" disabled={!ok}>
            <Check size={32} strokeWidth={1.5} aria-hidden /> Save
          </button>
        </div>
      </form>
    </div>
  );
}
