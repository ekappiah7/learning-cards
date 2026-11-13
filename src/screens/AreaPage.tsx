import { moduleVar, type Area } from '../data/areas';
import { navigate } from '../router';
import { useEffect } from 'react';
import { prepare, speak } from '../speech';
import { starKey, type Profile } from '../store';
import { BackButton, Icon, Stars, TopBar } from '../components/ui';
import { PlayerChip } from './Home';
import { ACTIVITIES } from '../activities';
import { AREA_HOST } from '../data/characters';

export function AreaPage({ area, profile }: { area: Area; profile: Profile }) {
  const color = moduleVar(area.color);
  // Have each activity's name ready, so it is said the moment it is tapped.
  useEffect(() => area.activities.forEach(act => prepare(act.spoken)), [area]);
  return (
    <div className="page fade-in">
      <TopBar
        eyebrow={profile.name}
        title={area.title}
        spoken={area.spoken}
        host={AREA_HOST[area.id]}
        left={<BackButton label="Home" onClick={() => navigate({ name: 'home' })} />}
        right={<PlayerChip profile={profile} />}
      />
      <div className={`grid fill acts n${area.activities.length}`}>
        {area.activities.map((act, i) => {
          const ready = starKey(area.id, act.id) in ACTIVITIES;
          return (
            <button
              key={act.id}
              type="button"
              className={`card-tile${ready ? '' : ' soon'}`}
              style={{ ['--i' as string]: i }}
              aria-label={ready ? act.title : `${act.title}, coming soon`}
              onClick={() => {
                if (!ready) {
                  speak([act.spoken, 'Coming soon!']);
                  return;
                }
                speak(act.spoken);
                navigate({ name: 'play', areaId: area.id, activityId: act.id });
              }}
            >
              <span className="disc" style={{ background: color }}>
                <Icon name={act.icon} size={56} />
              </span>
              <span>{act.title}</span>
              <Stars count={profile.stars[starKey(area.id, act.id)] ?? 0} color={color} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
