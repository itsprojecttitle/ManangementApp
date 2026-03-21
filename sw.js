const CACHE_VERSION = 'mgmtapp-v20260319-cachefix-1';
const SHELL_CACHE = `shell-${CACHE_VERSION}`;
const DATA_CACHE = `data-${CACHE_VERSION}`;

const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/ManagementApp.html',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg',
  '/MissionBrief.md',
  '/MissionDebrief.md',
  '/OfficialProbeManuel.md',
  '/ProbeSkill.md'
];

function cacheShellAssets() {
  return caches.open(SHELL_CACHE).then((cache) => Promise.all(
    SHELL_ASSETS.map((path) => fetch(path, { cache: 'reload' })
      .then((res) => {
        if (!res || !res.ok) return null;
        return cache.put(path, res.clone());
      })
      .catch(() => null))
  ));
}

self.addEventListener('install', (event) => {
  event.waitUntil(cacheShellAssets());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((k) => ![SHELL_CACHE, DATA_CACHE].includes(k))
        .map((k) => caches.delete(k))
    ))
  );
  self.clients.claim();
});

const isHtmlRequest = (req) => req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');
const isCriticalAsset = (url) => url.pathname.endsWith('.js') || url.pathname.endsWith('.css');

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== 'GET') return;

  // API: network first, fallback to cached data if offline.
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const resClone = res.clone();
            caches.open(DATA_CACHE).then((cache) => cache.put(req, resClone));
          }
          return res;
        })
        .catch(() => caches.match(req).then((cached) => cached || new Response('[]', {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })))
    );
    return;
  }

  // HTML navigations: network first to avoid stale shells.
  if (isHtmlRequest(req)) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const resClone = res.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(req, resClone));
          }
          return res;
        })
        .catch(() => caches.match(req).then((cached) => cached
          || caches.match('/ManagementApp.html')
          || caches.match('/index.html')))
    );
    return;
  }

  // Critical assets (JS/CSS): network first to prevent stale bundles.
  if (isCriticalAsset(url)) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const resClone = res.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(req, resClone));
          }
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Other static assets: stale-while-revalidate.
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        if (res && res.ok) {
          const resClone = res.clone();
          caches.open(SHELL_CACHE).then((cache) => cache.put(req, resClone));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
