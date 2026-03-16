const CACHE_VERSION = 'mgmtapp-v20260316-swissknife-4k-2';
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

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS)));
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

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== 'GET') return;

  // API: network first, fallback to cached data if offline.
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const resClone = res.clone();
          caches.open(DATA_CACHE).then((cache) => cache.put(req, resClone));
          return res;
        })
        .catch(() => caches.match(req).then((cached) => cached || new Response('[]', {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })))
    );
    return;
  }

  // Navigations: cache-first fallback to app shell.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('/ManagementApp.html'))
    );
    return;
  }

  // Static assets: cache first then network.
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      const resClone = res.clone();
      caches.open(SHELL_CACHE).then((cache) => cache.put(req, resClone));
      return res;
    }))
  );
});
