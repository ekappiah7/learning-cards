import { useEffect } from 'react';
import { House, RotateCcw } from 'lucide-react';
import { moduleVar, type Activity, type Area } from '../data/areas';
import { navigate } from '../router';
import { setMood, speak } from '../speech';
import { AREA_HOST, otherCharacter } from '../data/characters';
import { Buddy } from '../components/Buddy';
import { totalStars, type Profile } from '../store';
import { StarShape } from '../components/ui';
import { sfx } from '../sound';

// Shown at the end of a round. The activity awards the star before
// navigating here, so this screen only celebrates and never changes data.
export function Reward({ area, activity, profile }: { area: Area; activity: Activity; profile: Profile }) {
  const total = totalStars(profile);
  const color = moduleVar(area.color);
  const shown = Math.min(total, 40);

  const host = AREA_HOST[area.id] ?? 'jabari';

  useEffect(() => {
    // Both characters cheer while the host congratulates and the other
    // announces the star.
    const cheer = () => {
      setMood('jabari', 'cheer', 2000);
      setMood('jamila', 'cheer', 2000);
    };
    cheer();
    sfx('star');
    const again = setInterval(cheer, 2600);
    const t = setTimeout(
      () =>
        speak([
          { by: host, say: ['Well done,', { name: profile.name, id: profile.id }] },
          { by: otherCharacter(host), say: 'You got a star.' },
        ]),
      400,
    );
    return () => {
      clearTimeout(t);
      clearInterval(again);
    };
  }, [profile.name, profile.id, host]);

  return (
    <div className="page fade-in">
      <div className="reward">
        <div className="reward-stage">
          <Buddy who="jabari" size={150} />
          <StarShape className="big-star" size={200} color={color} />
          <Buddy who="jamila" size={150} />
        </div>
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
