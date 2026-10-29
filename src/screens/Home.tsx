import { AREAS, moduleVar } from '../data/areas';
import { navigate } from '../router';
import { speak } from '../speech';
import { line } from '../voice/phrases';
import { totalStars, type Profile } from '../store';
import { BackButton, Icon, StarShape, TopBar } from '../components/ui';

export function PlayerChip({ profile }: { profile: Profile }) {
  const n = totalStars(profile);
  return (
    <button
      type="button"
      className="chip"
      aria-label={`${profile.name}, ${n} star${n === 1 ? '' : 's'}`}
      onClick={() => speak([{ name: profile.name, id: profile.id }, line.hasStars(n)])}
    >
      <span className="dot" style={{ background: moduleVar(profile.color) }}>
        <StarShape size={28} color="var(--plum-950)" filled={false} />
      </span>
      {n}
    </button>
  );
}

export function Home({ profile }: { profile: Profile }) {
  return (
    <div className="page fade-in">
      <TopBar
        eyebrow={`Hello, ${profile.name}`}
        title={<>What shall we <em>play?</em></>}
        spoken={['Hello,', { name: profile.name, id: profile.id }, 'What shall we play?']}
        left={<BackButton label="Change player" onClick={() => navigate({ name: 'profiles' })} />}
        right={<PlayerChip profile={profile} />}
      />
      <div className="grid fill cols-2">
        {AREAS.map(a => (
          <button
            key={a.id}
            type="button"
            className="area-tile"
            style={{ background: moduleVar(a.color) }}
            onClick={() => {
              speak(a.spoken);
              navigate({ name: 'area', areaId: a.id });
            }}
          >
            <Icon name={a.icon} size={96} />
            <span>{a.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
