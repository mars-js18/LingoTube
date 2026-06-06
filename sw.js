const CACHE_NAME = 'lingotube-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  // Estrategia Stale-While-Revalidate para mayor velocidad y funcionamiento offline
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      const fetchPromise = fetch(e.request).then((networkResponse) => {
        // Solo cachear peticiones exitosas (no de chrome-extension ni data uris)
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(e.request, responseToCache);
            });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback para cuando no hay red y no está en caché
      });
      return cachedResponse || fetchPromise;
    })
  );
});
