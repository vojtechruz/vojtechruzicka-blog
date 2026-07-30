// Self-destroying service worker.
//
// The Gatsby version of this site (gatsby-plugin-offline) registered a service
// worker at exactly this URL. Visitors from that era still carry it and it
// serves them the stale precached Gatsby app shell. Serving this replacement
// unregisters the old worker, wipes its caches, and reloads open tabs so they
// pick up the live site immediately. A 404 at /sw.js would also unregister it
// eventually, but only after one more visit served from the stale cache.
//
// Safe to delete roughly a year after the Eleventy launch (2026-07); any
// stragglers are then handled by the 404-unregister fallback.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.map((key) => caches.delete(key)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((client) => client.navigate(client.url));
    })(),
  );
});
