import { captureException } from '@sentry/browser';

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

console.log('[Service Worker] Initializing...');

// Clean up old caches
async function cleanupOldCaches() {
  const cacheNames = await caches.keys();

  return Promise.all(
    cacheNames
      .filter((cacheName) => cacheName !== CACHE_NAME)
      .map((cacheName) => {
        console.log('[Service Worker] Removing old cache:', cacheName);

        return caches.delete(cacheName);
      }),
  );
}

// Check if a URL should be cached
function shouldCacheUrl(url) {
  try {
    const pathname = new URL(url).pathname;

    return CACHE_PATTERNS.some((pattern) => pattern.test(pathname));
  } catch (e) {
    captureException('[Service Worker] Error parsing URL:', url, e);

    return false;
  }
}

async function enforceCacheLimit(cache) {
  const keys = await cache.keys();

  if (keys.length > MAX_CACHE_ENTRIES) {
    await cache.delete(keys[0]); // Remove oldest entry
    console.log('[Service Worker] Enforcing cache limit: deleted oldest entry');
  }
}

// Helper function to fetch and cache a request
async function fetchAndCache(request) {
  try {
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
      console.log('[Service Worker] Skipping cache due to no-store header:', request.url);

      return response;
    }

    // Cache the response
    const cache = await caches.open(CACHE_NAME);

    await cache.put(request, response.clone());

    // limit the number of entries in cache
    await enforceCacheLimit(cache);

    return response;
  } catch (error) {
    captureException('[Service Worker] Fetch failed:', error);
    throw error;
  }
}

// Install event - activate new service worker immediately
self.addEventListener('install', () => {
  console.log('[Service Worker] Install event');
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate event');
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

  // Always network for API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(JSON.stringify({ error: 'You are offline' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        });
      }),
    );

    return;
  }

  // Cache-first strategy for static resources
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        fetchAndCache(request).catch(console.error); // update cache in background

        return cachedResponse;
      }

      return fetchAndCache(request);
    }),
  );
});
