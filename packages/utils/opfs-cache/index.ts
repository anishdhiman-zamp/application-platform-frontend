/**
 * OPFS (Origin Private File System) based content cache for persistent storage
 * Implements stale-while-revalidate pattern for content caching
 */

const DEFAULT_DIRECTORY = 'zamp-content-cache';

export interface OPFSCacheEntry {
  key: string;
  content: string;
  contentHash: string;
  timestamp: number;
  isEmpty?: boolean; // Marks zero state (e.g., 404 - no content exists yet)
}

export interface OPFSCacheConfig {
  directory?: string;
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
 * Check if OPFS is available in the current environment
 */
export const isOPFSAvailable = (): boolean => {
  return typeof window !== 'undefined' && 'storage' in navigator && 'getDirectory' in navigator.storage;
};

/**
 * Get the cache directory handle
 */
const getCacheDirectory = async (config: OPFSCacheConfig = {}): Promise<FileSystemDirectoryHandle | null> => {
  const directory = config.directory ?? DEFAULT_DIRECTORY;

  if (!isOPFSAvailable()) {
    console.warn('[OPFS] Origin Private File System not available');
    return null;
  }

  try {
    const root = await navigator.storage.getDirectory();
    return await root.getDirectoryHandle(directory, { create: true });
  } catch (error) {
    console.error('[OPFS] Failed to get cache directory:', error);
    return null;
  }
};

/**
 * Convert key to safe filename
 */
const getFileName = (key: string): string => {
  return `${key.toLowerCase().replace(/[^a-z0-9]/g, '-')}.json`;
};

/**
 * Gets cached content for a given key
 */
export const getCachedContent = async (key: string, config: OPFSCacheConfig = {}): Promise<OPFSCacheEntry | null> => {
  try {
    const dirHandle = await getCacheDirectory(config);
    if (!dirHandle) return null;

    const fileName = getFileName(key);
    const fileHandle = await dirHandle.getFileHandle(fileName);
    const file = await fileHandle.getFile();
    const content = await file.text();

    return JSON.parse(content) as OPFSCacheEntry;
  } catch (error) {
    // File doesn't exist or read error - return null silently for NotFoundError
    if ((error as Error).name !== 'NotFoundError') {
      console.warn('[OPFS] Failed to get cached content:', key);
    }
    return null;
  }
};

/**
 * Sets cached content for a given key
 */
export const setCachedContent = async (key: string, content: string, config: OPFSCacheConfig = {}): Promise<void> => {
  try {
    const dirHandle = await getCacheDirectory(config);
    if (!dirHandle) return;

    const fileName = getFileName(key);
    const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });

    const entry: OPFSCacheEntry = {
      key,
      content,
      contentHash: hashContent(content),
      timestamp: Date.now(),
      isEmpty: false,
    };

    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(entry));
    await writable.close();
  } catch {
    console.warn('[OPFS] Failed to cache content:', key);
  }
};

/**
 * Sets empty state cache (e.g., 404 - no content exists yet)
 * This prevents showing loader when navigating back to a known empty state
 */
export const setCachedEmptyState = async (key: string, config: OPFSCacheConfig = {}): Promise<void> => {
  try {
    const dirHandle = await getCacheDirectory(config);
    if (!dirHandle) return;

    const fileName = getFileName(key);
    const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });

    const entry: OPFSCacheEntry = {
      key,
      content: '',
      contentHash: '',
      timestamp: Date.now(),
      isEmpty: true,
    };

    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(entry));
    await writable.close();
  } catch {
    console.warn('[OPFS] Failed to cache empty state:', key);
  }
};

/**
 * Checks if content has changed by comparing hashes
 */
export const hasContentChanged = (cachedEntry: OPFSCacheEntry | null, newContent: string): boolean => {
  if (!cachedEntry) return true;

  return cachedEntry.contentHash !== hashContent(newContent);
};

/**
 * Clears cached content for a given key
 */
export const clearCachedContent = async (key: string, config: OPFSCacheConfig = {}): Promise<void> => {
  try {
    const dirHandle = await getCacheDirectory(config);
    if (!dirHandle) return;

    const fileName = getFileName(key);
    await dirHandle.removeEntry(fileName);
  } catch (error) {
    if ((error as Error).name !== 'NotFoundError') {
      console.warn('[OPFS] Failed to clear cached content:', key);
    }
  }
};

/**
 * Get all entry names from the directory handle
 */
const getEntryNames = async (dirHandle: FileSystemDirectoryHandle): Promise<string[]> => {
  const names: string[] = [];
  try {
    // FileSystemDirectoryHandle is iterable
    const entries = dirHandle as unknown as AsyncIterable<[string, FileSystemHandle]>;
    for await (const [name] of entries) {
      names.push(name);
    }
  } catch {
    // Fallback: try to iterate using values()
    try {
      const values = (dirHandle as unknown as { values(): AsyncIterable<FileSystemHandle> }).values?.();
      if (values) {
        for await (const handle of values) {
          names.push(handle.name);
        }
      }
    } catch {
      // If iteration fails, we can't list entries
    }
  }
  return names;
};

/**
 * Clears all cached content older than maxAge (in milliseconds)
 * Default: 7 days
 */
export const cleanupOldCache = async (
  maxAge: number = 7 * 24 * 60 * 60 * 1000,
  config: OPFSCacheConfig = {},
): Promise<void> => {
  try {
    const dirHandle = await getCacheDirectory(config);
    if (!dirHandle) return;

    const cutoffTime = Date.now() - maxAge;
    const names = await getEntryNames(dirHandle);

    for (const name of names) {
      if (!name.endsWith('.json')) continue;

      try {
        const fileHandle = await dirHandle.getFileHandle(name);
        const file = await fileHandle.getFile();
        const content = await file.text();
        const entry: OPFSCacheEntry = JSON.parse(content);

        if (entry.timestamp < cutoffTime) {
          await dirHandle.removeEntry(name);
        }
      } catch {
        // Skip files that can't be read or parsed
      }
    }
  } catch {
    console.warn('[OPFS] Failed to cleanup old cache');
  }
};

/**
 * Clears all cached content in the directory
 */
export const clearAllCache = async (config: OPFSCacheConfig = {}): Promise<void> => {
  try {
    const dirHandle = await getCacheDirectory(config);
    if (!dirHandle) return;

    const names = await getEntryNames(dirHandle);

    for (const name of names) {
      try {
        await dirHandle.removeEntry(name);
      } catch {
        // Skip files that can't be removed
      }
    }
  } catch {
    console.warn('[OPFS] Failed to clear all cache');
  }
};

/**
 * Creates a configured cache instance with preset options
 * Useful for creating domain-specific caches
 */
export const createOPFSCache = (config: OPFSCacheConfig) => {
  return {
    get: (key: string) => getCachedContent(key, config),
    set: (key: string, content: string) => setCachedContent(key, content, config),
    setEmptyState: (key: string) => setCachedEmptyState(key, config),
    clear: (key: string) => clearCachedContent(key, config),
    clearAll: () => clearAllCache(config),
    cleanup: (maxAge?: number) => cleanupOldCache(maxAge, config),
    hasContentChanged: (cachedEntry: OPFSCacheEntry | null, newContent: string) =>
      hasContentChanged(cachedEntry, newContent),
    isAvailable: isOPFSAvailable,
  };
};
