import { useEffect } from 'react';
import { findActivity, findArea } from './data/areas';
import { navigate, useRoute } from './router';
import { useStore } from './store';
import { Backdrop } from './components/ui';
import { Profiles } from './screens/Profiles';
import { Home } from './screens/Home';
import { AreaPage } from './screens/AreaPage';
import { Reward } from './screens/Reward';

export function App() {
  const route = useRoute();
  const { current } = useStore();

  // Every screen past "Who's playing?" needs a chosen player.
  const needsProfile = route.name !== 'profiles' && !current;
  useEffect(() => {
    if (needsProfile) navigate({ name: 'profiles' });
  }, [needsProfile]);

  return (
    <>
      <Backdrop />
      {screen()}
    </>
  );

  function screen() {
    if (route.name === 'profiles' || !current) return <Profiles />;
    if (route.name === 'area') {
      const area = findArea(route.areaId);
      if (area) return <AreaPage key={area.id} area={area} profile={current} />;
    }
    if (route.name === 'reward') {
      const area = findArea(route.areaId);
      const activity = findActivity(route.areaId, route.activityId);
      if (area && activity) return <Reward area={area} activity={activity} profile={current} />;
    }
    return <Home profile={current} />;
  }
}
