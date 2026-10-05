const CACHE = 'ts-serviceleistungen-pwa-v20261005-3';
const SHELL = [
  './',
  './index.html',
  './admin.html',
  './request.css',
  './admin.css',
  './app.js',
  './admin.js',
  './config.js',
  './pwa.js',
  './datenschutz.html',
  './foto-drohnen.html',
  './foto-drohnen.js',
  './manifest.json',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/ts-logo-left.png',
  './assets/ts-logo-right.png',
  './assets/bmw-m3-hero.png',
  './assets/admin-hero-reference.jpg'
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

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(request, copy));
        }
        return response;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
