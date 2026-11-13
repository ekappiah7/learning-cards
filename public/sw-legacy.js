// Loaded by the service worker. Devices that still have a version from
// before November 2026 (which saved every voice clip one by one) are moved
// to the new version straight away: the new worker takes over and reloads
// the open app once. Newer versions update at a safe moment instead (see
// src/update.ts).
let legacy = false;

self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      for (const name of await caches.keys()) {
        if (!name.startsWith('workbox-precache')) continue;
        const keys = await (await caches.open(name)).keys();
        if (keys.some(request => request.url.includes('/voice/lewis/'))) legacy = true;
      }
      if (legacy) await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', event => {
  if (!legacy) return;
  event.waitUntil(
    (async () => {
      await self.clients.claim();
      for (const client of await self.clients.matchAll({ type: 'window' })) client.navigate(client.url).catch(() => undefined);
    })(),
  );
});
