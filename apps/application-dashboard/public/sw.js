const CACHE_VERSION = '1'; // increment manually, whenever updating old static assets
const CACHE_NAME = `zamp-sw-cache-v${CACHE_VERSION}`;
const MAX_CACHE_ENTRIES = 100;

const CACHE_PATTERNS = [
  /^\/_next\/static\//, // Next.js static files
  /^\/_next\/image\//, // Optimized images
  /^\/images\//, // Custom images
  /^\/fonts\//, // Fonts
  /^\/icons\//, // Icons directory
  /^\/mp4\//, // Video files
  /^\/[^/]+\.(ico|svg|png|jpg|jpeg|webp)$/i, // Root level icons and images
  /^\/pdf\.worker\.min\.mjs$/, // PDF worker
];

// Clean up old caches
async function cleanupOldCaches() {
  const cacheNames = await caches.keys();

  return Promise.all(
    cacheNames
      .filter((cacheName) => cacheName !== CACHE_NAME)
      .map((cacheName) => {
        return caches.delete(cacheName);
      }),
  );
}

// Check if a URL should be cached
function shouldCacheUrl(url) {
  try {
    const pathname = new URL(url).pathname;

    return CACHE_PATTERNS.some((pattern) => pattern.test(pathname));
  } catch {
    return false;
  }
}

async function enforceCacheLimit(cache) {
  const keys = await cache.keys();

  if (keys.length > MAX_CACHE_ENTRIES) {
    await cache.delete(keys[0]); // Remove oldest entry
  }
}

// Helper function to fetch and cache a request
async function fetchAndCache(request) {
  const response = await fetch(request);

  // Do not cache non-OK or opaque responses
  if (
    !response ||
    response.status !== 200 ||
    request.method !== 'GET' ||
    response.type === 'opaque' || // Don't cache opaque responses
    !shouldCacheUrl(request.url)
  ) {
    return response;
  }

  // Respect 'Cache-Control: no-store' headers
  const cacheControl = response.headers.get('Cache-Control');

  if (cacheControl && cacheControl.includes('no-store')) {
    return response;
  }

  // Cache the response
  const cache = await caches.open(CACHE_NAME);

  await cache.put(request, response.clone());

  // limit the number of entries in cache
  await enforceCacheLimit(cache);

  return response;
}

// Install event - activate new service worker immediately
self.addEventListener('install', () => {
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(Promise.all([cleanupOldCaches(), self.clients.claim()]));
});

// Fetch event handler
self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET' || !request.url.startsWith('http')) return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  // Do not cache navigation requests (avoid stale HTML)
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request));

    return;
  }

  // Pass through API requests
  if (url.pathname.startsWith('/api/')) return;

  // Cache-first strategy for static resources
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        fetchAndCache(request); // update cache in background

        return cachedResponse;
      }

      return fetchAndCache(request);
    }),
  );
});
