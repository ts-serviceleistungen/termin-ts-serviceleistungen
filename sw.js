const CACHE = 'ts-serviceleistungen-pwa-v20261111-invoice-signoff-9';
const SHELL = [
  './',
  './index.html',
  './admin.html',
  './request.css',
  './admin.css',
  './app.js',
  './admin.js',
  './logo-original-rechnung.webp.b64',
  './config.js',
  './pwa.js',
  './datenschutz.html',
  './foto-drohnen.html',
  './foto-drohnen.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './ts-logo-left.png',
  './ts-logo-right.png',
  './logo-serviceleistungen.png',
  './bmw-m3-hero.png',
  './admin-hero-reference.jpg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== location.origin) return;

  // Always fetch live admin code/config so deployed fixes cannot be hidden
  // behind an older cached dashboard bundle.
  const isAdminAsset = /\/(admin\.html|admin\.js|config\.js)$/.test(url.pathname);
  if (isAdminAsset) {
    event.respondWith(
      fetch(request, { cache: 'no-store' }).then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(request, copy));
        }
        return response;
      }).catch(() => caches.match(request))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(request, copy));
        }
        return response;
      }).catch(() => caches.match('./index.html'))
    })
  );
});