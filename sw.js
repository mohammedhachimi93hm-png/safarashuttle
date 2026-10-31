/* Safara Shuttle app: keeps the site working offline.
   Pages: network first (always the newest version when online).
   Images and icons: shown from cache at once, then refreshed in the background. */
const CACHE = 'safara-v3';
const CORE = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then(res => {
          if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put('./index.html', copy)); }
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  const fresh = caches.open(CACHE).then(cache =>
    fetch(req).then(res => { if (res.ok) cache.put(req, res.clone()); return res; })
  );
  e.waitUntil(fresh.catch(() => {}));
  e.respondWith(
    caches.match(req).then(hit => hit || fresh.catch(() => Response.error()))
  );
});
