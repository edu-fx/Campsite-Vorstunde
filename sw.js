// Offline-Speicher für die Lern-App (Vorstunde EUV 4). Seite: zuerst Netz (damit Updates ankommen), sonst Speicher.
// Bilder und Schriften: zuerst Speicher. Bei geänderten Bildern VERSION hochzählen.
const VERSION = 'vs-euv4-camp-v1';
const CORE = ['./', './index.html', './manifest.webmanifest', './assets/icon-180.png', './assets/icon-512.png',
  './assets/bg_hero.jpg', './assets/bg_reception.jpg', './assets/max.jpg', './assets/receptionist.jpg',
  './assets/flyer_canoe.jpg', './assets/flyer_climbing.jpg', './assets/flyer_campfire.jpg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => Promise.all(CORE.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET') return;
  const fonts = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (url.origin !== location.origin && !fonts) return;
  if (req.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('.html')) {
    e.respondWith(fetch(req).then(res => {
      const copy = res.clone(); caches.open(VERSION).then(c => c.put('./index.html', copy)); return res;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req, {ignoreSearch: true}).then(hit => hit || fetch(req).then(res => {
    if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
    return res;
  })));
});
