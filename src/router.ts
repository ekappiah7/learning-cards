import { useEffect, useState } from 'react';

// Tiny hash router. Hash URLs work on GitHub Pages and offline without
// any server rewrites.

export type Route =
  | { name: 'profiles' }
  | { name: 'home' }
  | { name: 'parent' }
  | { name: 'area'; areaId: string }
  | { name: 'play'; areaId: string; activityId: string }
  | { name: 'reward'; areaId: string; activityId: string };

export function parse(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  switch (parts[0]) {
    case 'home':
      return { name: 'home' };
    case 'parent':
      return { name: 'parent' };
    case 'area':
      if (parts[1]) return { name: 'area', areaId: parts[1] };
      break;
    case 'play':
    case 'reward':
      if (parts[1] && parts[2]) return { name: parts[0] as 'play' | 'reward', areaId: parts[1], activityId: parts[2] };
      break;
  }
  return { name: 'profiles' };
}

export function href(route: Route): string {
  switch (route.name) {
    case 'profiles':
      return '#/';
    case 'home':
      return '#/home';
    case 'parent':
      return '#/parent';
    case 'area':
      return `#/area/${encodeURIComponent(route.areaId)}`;
    case 'play':
    case 'reward':
      return `#/${route.name}/${encodeURIComponent(route.areaId)}/${encodeURIComponent(route.activityId)}`;
  }
}

export function navigate(route: Route) {
  window.location.hash = href(route);
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parse(window.location.hash));
  useEffect(() => {
    const onHash = () => {
      setRoute(parse(window.location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return route;
}
