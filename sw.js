/* Countdown service worker: keeps the app usable offline.
   App files: network first, falling back to the saved copy.
   Fonts: saved copy first. Sync calls are never cached. */
const VERSION = 'countdown-v7';
const SHELL = ['./', 'index.html', 'style.css?v=7', 'data.js?v=7', 'sync.js?v=7', 'quiz.js?v=7', 'qz-chem.js?v=7', 'qz-phys.js?v=7', 'qz-bio.js?v=7', 'qz-maths.js?v=7', 'qz-econ.js?v=7', 'app.js?v=7', 'config.js?v=7', 'manifest.webmanifest', 'icons/icon-192.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname.endsWith('fonts.googleapis.com') || url.hostname.endsWith('fonts.gstatic.com')) {
    e.respondWith(
      caches.open(VERSION).then((c) => c.match(req).then((hit) => hit || fetch(req).then((res) => { c.put(req, res.clone()); return res; })))
    );
    return;
  }
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(req, { cache: 'no-cache' })
      .then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match(req, { ignoreSearch: true })).then((hit) => hit || caches.match('index.html')))
  );
});
