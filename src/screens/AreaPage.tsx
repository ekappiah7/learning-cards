import { moduleVar, type Area } from '../data/areas';
import { navigate } from '../router';
import { speak } from '../speech';
import { starKey, type Profile } from '../store';
import { BackButton, Icon, Stars, TopBar } from '../components/ui';
import { PlayerChip } from './Home';

export function AreaPage({ area, profile }: { area: Area; profile: Profile }) {
  const color = moduleVar(area.color);
  return (
    <div className="page fade-in">
      <TopBar
        eyebrow={profile.name}
        title={area.title}
        spoken={area.spoken}
        left={<BackButton label="Home" onClick={() => navigate({ name: 'home' })} />}
        right={<PlayerChip profile={profile} />}
      />
      <div className="grid">
        {area.activities.map(act => (
          <button
            key={act.id}
            type="button"
            className={`card-tile${act.ready ? '' : ' soon'}`}
            aria-label={act.ready ? act.title : `${act.title}, coming soon`}
            onClick={() => {
              if (!act.ready) {
                speak(`${act.spoken}. Coming soon!`);
                return;
              }
              speak(act.spoken);
              // Activities are wired in from stage 2.
            }}
          >
            <span className="disc" style={{ background: color }}>
              <Icon name={act.icon} size={56} />
            </span>
            <span>{act.title}</span>
            <Stars count={profile.stars[starKey(area.id, act.id)] ?? 0} color={color} />
          </button>
        ))}
      </div>
    </div>
  );
}
