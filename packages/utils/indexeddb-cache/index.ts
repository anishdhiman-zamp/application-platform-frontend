/**
 * IndexedDB-based content cache for persistent storage
 * Implements stale-while-revalidate pattern for content caching
 */

const DEFAULT_DB_NAME = 'zamp-content-cache';
const DEFAULT_DB_VERSION = 1;
const DEFAULT_STORE_NAME = 'cached-content';

export interface IndexedDBCacheEntry {
  key: string;
  content: string;
  contentHash: string;
  timestamp: number;
  isEmpty?: boolean; // Marks zero state (e.g., 404 - no content exists yet)
}

export interface IndexedDBCacheConfig {
  dbName?: string;
  dbVersion?: number;
  storeName?: string;
}

/**
 * Simple hash function to detect content changes
 */
export const hashContent = (content: string): string => {
  let hash = 0;

  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);

    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return hash.toString(36);
};

/**
 * Opens the IndexedDB database
 */
const openDB = (config: IndexedDBCacheConfig = {}): Promise<IDBDatabase> => {
  const dbName = config.dbName ?? DEFAULT_DB_NAME;
  const dbVersion = config.dbVersion ?? DEFAULT_DB_VERSION;
  const storeName = config.storeName ?? DEFAULT_STORE_NAME;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(storeName)) {
        const store = db.createObjectStore(storeName, { keyPath: 'key' });

        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
};

/**
 * Gets cached content for a given key
 */
export const getCachedContent = async (
  key: string,
  config: IndexedDBCacheConfig = {},
): Promise<IndexedDBCacheEntry | null> => {
  const storeName = config.storeName ?? DEFAULT_STORE_NAME;

  try {
    const db = await openDB(config);
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  } catch {
    console.warn('Failed to get cached content:', key);

    return null;
  }
};

/**
 * Sets cached content for a given key
 */
export const setCachedContent = async (
  key: string,
  content: string,
  config: IndexedDBCacheConfig = {},
): Promise<void> => {
  const storeName = config.storeName ?? DEFAULT_STORE_NAME;

  try {
    const db = await openDB(config);
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);

    const entry: IndexedDBCacheEntry = {
      key,
      content,
      contentHash: hashContent(content),
      timestamp: Date.now(),
      isEmpty: false,
    };

    return new Promise((resolve, reject) => {
      const request = store.put(entry);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch {
    console.warn('Failed to cache content:', key);
  }
};

/**
 * Sets empty state cache (e.g., 404 - no content exists yet)
 * This prevents showing loader when navigating back to a known empty state
 */
export const setCachedEmptyState = async (key: string, config: IndexedDBCacheConfig = {}): Promise<void> => {
  const storeName = config.storeName ?? DEFAULT_STORE_NAME;

  try {
    const db = await openDB(config);
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);

    const entry: IndexedDBCacheEntry = {
      key,
      content: '',
      contentHash: '',
      timestamp: Date.now(),
      isEmpty: true,
    };

    return new Promise((resolve, reject) => {
      const request = store.put(entry);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch {
    console.warn('Failed to cache empty state:', key);
  }
};

/**
 * Checks if content has changed by comparing hashes
 */
export const hasContentChanged = (cachedEntry: IndexedDBCacheEntry | null, newContent: string): boolean => {
  if (!cachedEntry) return true;

  return cachedEntry.contentHash !== hashContent(newContent);
};

/**
 * Checks if cached empty state has expired
 * Default TTL: 5 minutes (allows periodic re-checking for newly created content)
 */
export const isEmptyStateCacheExpired = (
  cachedEntry: IndexedDBCacheEntry | null,
  ttlMs: number = 5 * 60 * 1000,
): boolean => {
  if (!cachedEntry?.isEmpty) return false;

  return Date.now() - cachedEntry.timestamp > ttlMs;
};

/**
 * Clears cached content for a given key
 */
export const clearCachedContent = async (key: string, config: IndexedDBCacheConfig = {}): Promise<void> => {
  const storeName = config.storeName ?? DEFAULT_STORE_NAME;

  try {
    const db = await openDB(config);
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch {
    console.warn('Failed to clear cached content:', key);
  }
};

/**
 * Clears all cached content older than maxAge (in milliseconds)
 * Default: 7 days
 */
export const cleanupOldCache = async (
  maxAge: number = 7 * 24 * 60 * 60 * 1000,
  config: IndexedDBCacheConfig = {},
): Promise<void> => {
  const storeName = config.storeName ?? DEFAULT_STORE_NAME;

  try {
    const db = await openDB(config);
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const index = store.index('timestamp');

    const cutoffTime = Date.now() - maxAge;

    return new Promise((resolve) => {
      const request = index.openCursor(IDBKeyRange.upperBound(cutoffTime));

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;

        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => resolve();
    });
  } catch {
    console.warn('Failed to cleanup old cache');
  }
};

/**
 * Creates a configured cache instance with preset options
 * Useful for creating domain-specific caches
 */
export const createIndexedDBCache = (config: IndexedDBCacheConfig) => {
  return {
    get: (key: string) => getCachedContent(key, config),
    set: (key: string, content: string) => setCachedContent(key, content, config),
    setEmptyState: (key: string) => setCachedEmptyState(key, config),
    clear: (key: string) => clearCachedContent(key, config),
    cleanup: (maxAge?: number) => cleanupOldCache(maxAge, config),
    hasContentChanged: (cachedEntry: IndexedDBCacheEntry | null, newContent: string) =>
      hasContentChanged(cachedEntry, newContent),
  };
};
