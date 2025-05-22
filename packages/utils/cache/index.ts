interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface CacheOptions {
  expiryTime?: number; // in milliseconds
  maxSize?: number; // maximum number of entries
}

class CacheStore {
  private store: Map<string, CacheEntry<any>>;
  private readonly defaultExpiryTime: number;
  private readonly maxSize: number;

  constructor(options: CacheOptions = {}) {
    this.store = new Map();
    this.defaultExpiryTime = options.expiryTime || 5 * 60 * 1000; // 5 minutes default
    this.maxSize = options.maxSize || 1000; // 1000 entries default
  }

  set<T>(key: string, data: T): void {
    // Remove oldest entry if at max size
    if (this.store.size >= this.maxSize) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey) {
        this.store.delete(oldestKey);
      }
    }

    this.store.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > this.defaultExpiryTime;
    if (isExpired) {
      this.store.delete(key);
      return null;
    }

    return entry.data as T;
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  has(key: string): boolean {
    return this.store.has(key);
  }

  size(): number {
    return this.store.size;
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now - entry.timestamp > this.defaultExpiryTime) {
        this.store.delete(key);
      }
    }
  }
}

// Create a default instance
const GlobalCacheStore = new CacheStore();

export { CacheStore, GlobalCacheStore };
export type { CacheEntry, CacheOptions };
