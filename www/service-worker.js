const CACHE_NAME = 'discipline30-static-v17-fixes';
const APP_SHELL = ['./', './index.html', './ai-coach-config.js', './manifest.json', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const isConfig = new URL(event.request.url).pathname.endsWith('/ai-coach-config.js');
  const isPage = event.request.mode === 'navigate' || event.request.destination === 'document' || isConfig;
  if (isPage) {
    // Network first for the page itself, so a new version is picked up as soon as the device is online.
    event.respondWith(fetch(event.request).then(response => {
      if (response && response.ok) { const copy = response.clone(); caches.open(CACHE_NAME).then(cache => cache.put(isConfig ? event.request : './index.html', copy)); }
      return response;
    }).catch(() => caches.match(isConfig ? event.request : './index.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response && response.ok && new URL(event.request.url).origin === self.location.origin) {
      const copy = response.clone(); caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
    }
    return response;
  })));
});
