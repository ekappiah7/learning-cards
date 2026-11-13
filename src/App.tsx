import { useEffect } from 'react';
import { findActivity, findArea } from './data/areas';
import { navigate, useRoute } from './router';
import { starKey, useStore } from './store';
import { Backdrop } from './components/ui';
import { Profiles } from './screens/Profiles';
import { Home } from './screens/Home';
import { AreaPage } from './screens/AreaPage';
import { Reward } from './screens/Reward';
import { Parent } from './screens/Parent';
import { ACTIVITIES } from './activities';
import { LessonGate } from './lessons/LessonPlayer';
import { PictureGallery } from './components/pictures';
import { AREA_HOST } from './data/characters';
import { setHost } from './speech';
import { playMusic } from './sound';
import { TUNES } from './data/music';
import { setSafeToUpdate } from './update';
import type { Theme } from './data/music';

export function App() {
  const route = useRoute();
  const { current } = useStore();

  // Every screen past "Who's playing?" needs a chosen player, except the
  // parent corner.
  const needsProfile = route.name !== 'profiles' && route.name !== 'parent' && !current;
  useEffect(() => {
    if (needsProfile) navigate({ name: 'profiles' });
  }, [needsProfile]);

  // Each area has its own tune; the start screens share one; the parent
  // corner is quiet.
  const theme: Theme | null =
    route.name === 'parent' ? null : 'areaId' in route && route.areaId in TUNES ? (route.areaId as Theme) : 'home';
  useEffect(() => playMusic(theme), [theme]);

  // A new version is only switched in on these screens, never mid-activity.
  const safe = route.name === 'profiles' || route.name === 'home';
  useEffect(() => setSafeToUpdate(safe), [safe]);

  return (
    <>
      <Backdrop />
      {screen()}
    </>
  );

  function screen() {
    if (window.location.hash === '#/pictures') return <PictureGallery />;
    // The character who speaks on this screen.
    setHost('areaId' in route ? (AREA_HOST[route.areaId] ?? 'jabari') : 'jabari');
    if (route.name === 'parent') return <Parent />;
    if (route.name === 'profiles' || !current) return <Profiles />;
    if (route.name === 'area') {
      const area = findArea(route.areaId);
      if (area) return <AreaPage key={area.id} area={area} profile={current} />;
    }
    if (route.name === 'play') {
      const area = findArea(route.areaId);
      const activity = findActivity(route.areaId, route.activityId);
      const Play = ACTIVITIES[starKey(route.areaId, route.activityId)];
      if (area && activity && Play)
        return (
          <LessonGate key={starKey(route.areaId, route.activityId)} area={area} activity={activity} profile={current}>
            <Play area={area} activity={activity} profile={current} />
          </LessonGate>
        );
    }
    if (route.name === 'reward') {
      const area = findArea(route.areaId);
      const activity = findActivity(route.areaId, route.activityId);
      if (area && activity) return <Reward area={area} activity={activity} profile={current} />;
    }
    return <Home profile={current} />;
  }
}
