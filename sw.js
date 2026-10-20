/* Cache name is intentionally versioned so browsers remove old broken bundles. */
const CACHE_NAME = 'chai-catcher-v2-fixed';
const CORE_ASSETS = [
  './', './index.html', './styles.css', './manifest.webmanifest', './apple-touch-icon.png',
  './assets/icons/icon-192.png', './assets/icons/icon-512.png',
  './js/settings.js', './js/storage.js', './js/audio.js', './js/input.js',
  './js/objects.js', './js/renderer.js', './js/game.js', './js/ui.js', './js/app.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(CORE_ASSETS.map(async (asset) => {
      try { await cache.add(asset); } catch (error) { console.warn('Could not pre-cache:', asset, error); }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const fresh = await fetch(request);
      if (fresh && (fresh.ok || fresh.type === 'opaque')) cache.put(request, fresh.clone()).catch(() => {});
      return fresh;
    } catch (error) {
      const cached = await cache.match(request);
      if (cached) return cached;
      throw error;
    }
  })());
});
