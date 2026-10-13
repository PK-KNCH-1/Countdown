/* Countdown service worker: keeps the app usable offline.
   App files: network first, falling back to the saved copy.
   Fonts: saved copy first. Sync calls are never cached. */
const VERSION = 'countdown-v9';
// Caches are shared by everything on the same website, so name them after this copy's folder
// and only ever clear this copy's old ones (and the unscoped names used before v8).
const SCOPE = new URL(self.registration.scope).pathname;
const CACHE = `${SCOPE}|${VERSION}`;
const SHELL = ['./', 'index.html', 'style.css?v=9', 'data.js?v=9', 'sync.js?v=9', 'quiz.js?v=9', 'qz-chem.js?v=9', 'qz-phys.js?v=9', 'qz-bio.js?v=9', 'qz-maths.js?v=9', 'qz-econ.js?v=9', 'app.js?v=9', 'config.js?v=9', 'manifest.webmanifest', 'icons/icon-192.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE && (k.startsWith(`${SCOPE}|`) || /^countdown-v\d+$/.test(k))).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname.endsWith('fonts.googleapis.com') || url.hostname.endsWith('fonts.gstatic.com')) {
    e.respondWith(
      caches.open(CACHE).then((c) => c.match(req).then((hit) => hit || fetch(req).then((res) => { c.put(req, res.clone()); return res; })))
    );
    return;
  }
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(req, { cache: 'no-cache' })
      .then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match(req, { ignoreSearch: true })).then((hit) => hit || caches.match('index.html')))
  );
});
