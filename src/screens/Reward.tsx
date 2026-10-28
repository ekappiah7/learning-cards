import { useEffect } from 'react';
import { House, RotateCcw } from 'lucide-react';
import { moduleVar, type Activity, type Area } from '../data/areas';
import { navigate } from '../router';
import { speak } from '../speech';
import { totalStars, type Profile } from '../store';
import { StarShape } from '../components/ui';

// Shown at the end of a round. The activity awards the star before
// navigating here, so this screen only celebrates and never changes data.
export function Reward({ area, activity, profile }: { area: Area; activity: Activity; profile: Profile }) {
  const total = totalStars(profile);
  const color = moduleVar(area.color);
  const shown = Math.min(total, 40);

  useEffect(() => {
    const t = setTimeout(() => speak(['Well done,', { name: profile.name, id: profile.id }, 'You got a star.']), 400);
    return () => clearTimeout(t);
  }, [profile.name, profile.id]);

  return (
    <div className="page fade-in">
      <div className="reward">
        <StarShape className="big-star" size={220} color={color} />
        <h1 className="title">
          Well done, <em>{profile.name}!</em>
        </h1>
        <div className="collection" aria-label={`${total} stars collected`}>
          {Array.from({ length: shown }, (_, i) => (
            <StarShape key={i} size={40} color={moduleVar(profile.color)} className={i === shown - 1 ? 'new' : undefined} />
          ))}
        </div>
        <div className="actions" style={{ justifyContent: 'center' }}>
          <button
            type="button"
            className="pill secondary"
            onClick={() => {
              speak('Play again');
              navigate({ name: 'play', areaId: area.id, activityId: activity.id });
            }}
            aria-label={`Play ${activity.title} again`}
          >
            <RotateCcw size={36} strokeWidth={1.5} aria-hidden /> Again
          </button>
          <button
            type="button"
            className="pill primary"
            onClick={() => {
              speak('Home');
              navigate({ name: 'home' });
            }}
          >
            <House size={36} strokeWidth={1.5} aria-hidden /> Home
          </button>
        </div>
      </div>
    </div>
  );
}
