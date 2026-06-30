const CACHE_VERSION = 'haistore-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const CATALOG_CACHE = `${CACHE_VERSION}-catalog`;

const CATALOG_PATHS = [
  '/catalog/home-bundle.json',
  '/catalog/store-categories-tree.json',
  '/catalog/inventory-index.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key.startsWith('haistore-') && !key.startsWith(CACHE_VERSION)).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

function isCacheFirstAsset(url) {
  return (
    url.pathname.startsWith('/assets/') ||
    /\/products\/[^/]+-256\.webp$/i.test(url.pathname)
  );
}

function isCatalogJson(url) {
  return url.pathname.startsWith('/catalog/') && url.pathname.endsWith('.json');
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (isCacheFirstAsset(url)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) {
          void cache.put(request, response.clone());
        }
        return response;
      }),
    );
    return;
  }

  if (isCatalogJson(url)) {
    event.respondWith(
      caches.open(CATALOG_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((response) => {
            if (response.ok) {
              void cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => cached);

        return cached ?? network;
      }),
    );
  }
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'PRECACHE_CATALOG') {
    event.waitUntil(
      caches.open(CATALOG_CACHE).then((cache) =>
        Promise.all(
          CATALOG_PATHS.map((path) =>
            fetch(path)
              .then((response) => (response.ok ? cache.put(path, response) : undefined))
              .catch(() => undefined),
          ),
        ),
      ),
    );
  }
});
