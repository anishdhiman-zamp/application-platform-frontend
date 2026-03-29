const CACHE_VERSION = '1'; // increment manually, whenever updating old static assets
const CACHE_NAME = `zamp-sw-cache-v${CACHE_VERSION}`;
const MAX_CACHE_ENTRIES = 100;
const IDB_NAME = 'zamp-sw-store';
const IDB_STORE = 'config';
const ORG_ID_KEY = 'X-Zamp-Organization-Id';

// In-memory cache for organizationId to avoid IndexedDB reads on every request
let cachedOrganizationId = null;

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

// IndexedDB helpers for storing/retrieving org ID
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_NAME, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
  });
}

async function getOrganizationId() {
  // Return cached value if available
  if (cachedOrganizationId !== null) {
    return cachedOrganizationId;
  }

  let db;

  try {
    db = await openDB();

    return new Promise((resolve) => {
      const transaction = db.transaction(IDB_STORE, 'readonly');
      const store = transaction.objectStore(IDB_STORE);
      const request = store.get(ORG_ID_KEY);

      request.onsuccess = () => {
        cachedOrganizationId = request.result || '';
        db.close();
        resolve(cachedOrganizationId);
      };
      request.onerror = () => {
        db.close();
        resolve('');
      };
    });
  } catch {
    db?.close();

    return '';
  }
}

async function setOrganizationId(orgId) {
  let db;

  try {
    db = await openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(IDB_STORE, 'readwrite');
      const store = transaction.objectStore(IDB_STORE);
      const request = store.put(orgId, ORG_ID_KEY);

      request.onsuccess = () => {
        db.close();
        resolve();
      };
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch {
    db?.close();
  }
}

// Listen for messages from the main thread to update org ID in IndexedDB
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SET_ORGANIZATION_ID') {
    const orgId = event.data.organizationId || '';

    cachedOrganizationId = orgId; // Update in-memory cache immediately
    setOrganizationId(orgId).catch(() => {}); // Persist to IndexedDB
  }
});

// Check if URL is a file API request that needs auth headers
function isFileApiRequest(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    // Match /files/ path on allowed API domains
    const allowedHosts = ['api-us.zamp.ai', 'api-me.zamp.ai', 'api-dev.zamp.ai', 'api-stg.zamp.ai'];
    const isAllowedHost = allowedHosts.includes(hostname) || hostname.endsWith('.coder.dev-mum.internal.zamp.dev');

    return isAllowedHost && urlObj.pathname.startsWith('/files/');
  } catch {
    return false;
  }
}

// Handle file API requests with custom headers
async function handleFileApiRequest(request) {
  const organizationId = await getOrganizationId();
  const headers = new Headers(request.headers);

  if (organizationId) {
    headers.set('X-Zamp-Organization-Id', organizationId);
  }

  const modifiedRequest = new Request(request.url, {
    method: request.method,
    headers: headers,
    mode: 'cors',
    credentials: 'include',
    redirect: request.redirect,
  });

  return fetch(modifiedRequest);
}

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

  // Handle cross-origin file API requests with auth headers
  if (isFileApiRequest(request.url)) {
    event.respondWith(handleFileApiRequest(request));

    return;
  }

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
