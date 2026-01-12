/**
 * OPFS (Origin Private File System) Storage
 *
 * Document-based storage for persisting resource data.
 * Provides instant loading when users return to the same resource.
 */

import { ResourceName } from '../types';

/**
 * Stored resource data with metadata
 */
interface StoredResourceData<T = unknown> {
  resourceName: ResourceName;
  data: T;
  timestamp: number;
  version: number;
}

/**
 * OPFS Storage configuration
 */
export interface OPFSStorageConfig {
  /**
   * Directory name for battalion data
   */
  directory?: string;
  /**
   * Max age in milliseconds before data is considered stale
   */
  maxAge?: number;
}

const DEFAULT_CONFIG: Required<OPFSStorageConfig> = {
  directory: 'battalion-cache',
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
};

/**
 * OPFS Storage Manager
 * Handles reading and writing resource data to OPFS
 */
class OPFSStorageManager {
  private config: Required<OPFSStorageConfig>;
  private rootHandle: FileSystemDirectoryHandle | null = null;
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  constructor(config?: OPFSStorageConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Initialize OPFS access
   */
  private async initialize(): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        // Check if OPFS is available
        if (!('storage' in navigator) || !('getDirectory' in navigator.storage)) {
          console.warn('[OPFS] Origin Private File System not available, falling back to memory');
          return;
        }

        // Get root directory
        const root = await navigator.storage.getDirectory();

        // Get or create battalion directory
        this.rootHandle = await root.getDirectoryHandle(this.config.directory, {
          create: true,
        });

        this.initialized = true;
      } catch (error) {
        console.error('[OPFS] Failed to initialize:', error);
      }
    })();

    return this.initPromise;
  }

  /**
   * Get file name for a resource
   */
  private getFileName(resourceName: ResourceName): string {
    return `${resourceName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.json`;
  }

  /**
   * Save resource data to OPFS
   */
  async save<T>(resourceName: ResourceName, data: T): Promise<void> {
    await this.initialize();

    if (!this.rootHandle) {
      // Fallback: store in memory cache if OPFS not available
      this.memoryCache.set(resourceName, {
        resourceName,
        data,
        timestamp: Date.now(),
        version: 1,
      });
      return;
    }

    try {
      const fileName = this.getFileName(resourceName);
      const fileHandle = await this.rootHandle.getFileHandle(fileName, { create: true });

      const storedData: StoredResourceData<T> = {
        resourceName,
        data,
        timestamp: Date.now(),
        version: 1,
      };

      // Get writable stream and write data
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(storedData));
      await writable.close();
    } catch (error) {
      console.error(`[OPFS] Failed to save ${resourceName}:`, error);
    }
  }

  /**
   * Load resource data from OPFS
   */
  async load<T>(resourceName: ResourceName): Promise<T | null> {
    await this.initialize();

    if (!this.rootHandle) {
      // Fallback: load from memory cache
      const cached = this.memoryCache.get(resourceName);
      if (cached && this.isDataFresh(cached.timestamp)) {
        return cached.data as T;
      }
      return null;
    }

    try {
      const fileName = this.getFileName(resourceName);
      const fileHandle = await this.rootHandle.getFileHandle(fileName);
      const file = await fileHandle.getFile();
      const content = await file.text();

      const storedData: StoredResourceData<T> = JSON.parse(content);

      // Check if data is still fresh
      if (!this.isDataFresh(storedData.timestamp)) {
        return null;
      }

      return storedData.data;
    } catch (error) {
      // File doesn't exist or read error - return null
      if ((error as Error).name !== 'NotFoundError') {
        console.error(`[OPFS] Failed to load ${resourceName}:`, error);
      }
      return null;
    }
  }

  /**
   * Load resource data with metadata
   */
  async loadWithMetadata<T>(resourceName: ResourceName): Promise<StoredResourceData<T> | null> {
    await this.initialize();

    if (!this.rootHandle) {
      const cached = this.memoryCache.get(resourceName);
      if (cached && this.isDataFresh(cached.timestamp)) {
        return cached as StoredResourceData<T>;
      }
      return null;
    }

    try {
      const fileName = this.getFileName(resourceName);
      const fileHandle = await this.rootHandle.getFileHandle(fileName);
      const file = await fileHandle.getFile();
      const content = await file.text();

      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  /**
   * Check if data is still fresh
   */
  private isDataFresh(timestamp: number): boolean {
    return Date.now() - timestamp < this.config.maxAge;
  }

  /**
   * Delete resource data from OPFS
   */
  async delete(resourceName: ResourceName): Promise<void> {
    await this.initialize();

    this.memoryCache.delete(resourceName);

    if (!this.rootHandle) return;

    try {
      const fileName = this.getFileName(resourceName);
      await this.rootHandle.removeEntry(fileName);
    } catch (error) {
      if ((error as Error).name !== 'NotFoundError') {
        console.error(`[OPFS] Failed to delete ${resourceName}:`, error);
      }
    }
  }

  /**
   * Get all entry names from the directory handle
   */
  private async getEntryNames(): Promise<string[]> {
    if (!this.rootHandle) return [];

    const names: string[] = [];
    try {
      // FileSystemDirectoryHandle is iterable, but TypeScript types may not reflect this
      // Cast through unknown to allow iteration
      const entries = this.rootHandle as unknown as AsyncIterable<[string, FileSystemHandle]>;
      for await (const [name] of entries) {
        names.push(name);
      }
    } catch {
      // Fallback: try to iterate using values()
      try {
        const values = (this.rootHandle as unknown as { values(): AsyncIterable<FileSystemHandle> }).values?.();
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
  }

  /**
   * Clear all cached data
   */
  async clear(): Promise<void> {
    await this.initialize();

    this.memoryCache.clear();

    if (!this.rootHandle) return;

    try {
      const names = await this.getEntryNames();
      for (const name of names) {
        await this.rootHandle.removeEntry(name);
      }
    } catch (error) {
      console.error('[OPFS] Failed to clear cache:', error);
    }
  }

  /**
   * Get all cached resource names
   */
  async getCachedResources(): Promise<ResourceName[]> {
    await this.initialize();

    if (!this.rootHandle) {
      return Array.from(this.memoryCache.keys());
    }

    const resources: ResourceName[] = [];
    try {
      const names = await this.getEntryNames();
      for (const name of names) {
        if (name.endsWith('.json')) {
          resources.push(name.replace('.json', ''));
        }
      }
    } catch (error) {
      console.error('[OPFS] Failed to list cached resources:', error);
    }
    return resources;
  }

  /**
   * Check if OPFS is available
   */
  isAvailable(): boolean {
    return typeof window !== 'undefined' && 'storage' in navigator && 'getDirectory' in navigator.storage;
  }

  // Memory cache fallback for when OPFS is not available
  private memoryCache = new Map<ResourceName, StoredResourceData>();
}

// Global storage instance
let globalOPFSStorage: OPFSStorageManager | null = null;

/**
 * Get the global OPFS storage manager
 */
export function getOPFSStorage(config?: OPFSStorageConfig): OPFSStorageManager {
  if (!globalOPFSStorage) {
    globalOPFSStorage = new OPFSStorageManager(config);
  }
  return globalOPFSStorage;
}

/**
 * Create a new OPFS storage instance
 */
export function createOPFSStorage(config?: OPFSStorageConfig): OPFSStorageManager {
  return new OPFSStorageManager(config);
}

/**
 * Reset the global OPFS storage (useful for testing)
 */
export async function resetOPFSStorage(): Promise<void> {
  if (globalOPFSStorage) {
    await globalOPFSStorage.clear();
  }
  globalOPFSStorage = null;
}

export { OPFSStorageManager };
