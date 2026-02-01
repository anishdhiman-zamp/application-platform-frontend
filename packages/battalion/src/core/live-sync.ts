import { QueryClient } from '@tanstack/react-query';
import type { EVENT_TYPE, EventBusInterface, EventBusSubscription } from '@zamp-platform/utils';
import { OPFSCache } from '@zamp-platform/utils';

import {
  DEFAULT_PERSIST_CONFIG,
  LiveSyncConfig,
  LiveSyncState,
  PersistConfig,
  ResolvedPersistConfig,
  ResourceName,
  STORAGE_TYPE,
  StorageAdapter,
  StoredResourceData,
} from '../types';
import { getResourceRegistry } from './registry';

/**
 * Resolve persist config from boolean | PersistConfig | undefined
 */
function resolvePersistConfig(persist: boolean | PersistConfig | undefined): ResolvedPersistConfig {
  if (!persist) {
    return { enabled: false, storage: STORAGE_TYPE.INDEXEDDB, maxAge: DEFAULT_PERSIST_CONFIG.maxAge };
  }

  if (persist === true) {
    return {
      enabled: true,
      storage: DEFAULT_PERSIST_CONFIG.storage,
      maxAge: DEFAULT_PERSIST_CONFIG.maxAge,
    };
  }

  return {
    enabled: true,
    storage: persist.storage ?? DEFAULT_PERSIST_CONFIG.storage,
    maxAge: persist.maxAge ?? DEFAULT_PERSIST_CONFIG.maxAge,
  };
}

/**
 * IndexedDB Storage Adapter with per-resource table storage
 * Each resource gets its own object store (e.g., "pages", "process")
 * Items are stored directly with itemId as key and data + timestamp as value
 */
class IndexedDBStorageAdapter implements StorageAdapter {
  private dbName = 'battalion-cache';
  private maxAge: number;
  private dbPromise: Promise<IDBDatabase> | null = null;
  private knownStores = new Set<string>(); // Cache of stores we know exist
  private resourceRegistry = getResourceRegistry();

  constructor(maxAge: number = DEFAULT_PERSIST_CONFIG.maxAge) {
    this.maxAge = maxAge;
  }

  /**
   * Get the store name for a resource
   */
  private getResourceStoreName(resourceName: ResourceName): string {
    return resourceName;
  }

  /**
   * Ensure a resource store exists, creating it if needed
   * Note: IndexedDB requires version increments to create new stores (onupgradeneeded only fires on version increase)
   */
  private async ensureResourceStore(resourceName: ResourceName): Promise<IDBDatabase> {
    const storeName = this.getResourceStoreName(resourceName);

    // If we know the store exists, just open the DB
    if (this.knownStores.has(storeName)) {
      return this.openDB();
    }

    // Open DB and check if store exists
    const db = await this.openDB();
    if (db.objectStoreNames.contains(storeName)) {
      this.knownStores.add(storeName);
      return db;
    }

    // Store doesn't exist - we need to create it
    // IndexedDB limitation: can only create stores in onupgradeneeded, which requires version increment
    db.close();
    this.dbPromise = null;

    // Get current version and increment to trigger onupgradeneeded
    const currentVersion = await this.getCurrentVersion();
    const newVersion = currentVersion + 1;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, newVersion);

      request.onerror = () => {
        this.dbPromise = null;
        reject(request.error);
      };

      request.onsuccess = () => {
        this.knownStores.add(storeName);
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(storeName)) {
          const store = db.createObjectStore(storeName);
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * Get current database version (needed to increment for store creation)
   */
  private async getCurrentVersion(): Promise<number> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const version = request.result.version || 1;
        request.result.close();
        resolve(version);
      };
      request.onupgradeneeded = () => resolve(1);
    });
  }

  private async openDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    // Use version 1, or get current version if DB exists
    const version = await this.getCurrentVersion();

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, version);

      request.onerror = () => {
        this.dbPromise = null;
        reject(request.error);
      };

      request.onsuccess = () => {
        const db = request.result;
        // Track existing stores
        for (let i = 0; i < db.objectStoreNames.length; i++) {
          const name = db.objectStoreNames[i];
          this.knownStores.add(name);
        }
        resolve(db);
      };

      request.onupgradeneeded = () => {
        // No stores created here - they're created dynamically per resource
      };
    });

    return this.dbPromise;
  }

  /**
   * Extract item ID from an item using the resource's idField from transaction config
   * Falls back to 'id' if not specified
   */
  private getItemId(resourceName: ResourceName, item: unknown, index: number): string {
    const resource = this.resourceRegistry.get(resourceName);
    const idField = resource?.transactions?.idField || 'id';

    if (item && typeof item === 'object') {
      const obj = item as Record<string, unknown>;
      const idValue = obj[idField];
      if (idValue !== undefined && idValue !== null) {
        return String(idValue);
      }
    }
    // Fallback to index-based ID
    return `__index_${index}`;
  }

  async save<T>(resourceName: ResourceName, data: T): Promise<void> {
    try {
      const db = await this.ensureResourceStore(resourceName);
      const storeName = this.getResourceStoreName(resourceName);
      const timestamp = Date.now();

      // Handle array data - store each item separately
      if (Array.isArray(data)) {
        const transaction = db.transaction([storeName], 'readwrite');
        const resourceStore = transaction.objectStore(storeName);

        // Clear existing items in the resource store
        resourceStore.clear();

        // Store each item with itemId as key, data + timestamp as value (no itemId in value)
        for (let i = 0; i < data.length; i++) {
          const item = data[i];
          const itemId = this.getItemId(resourceName, item, i);
          const storedItem = {
            ...(item as Record<string, unknown>),
            timestamp,
          };
          resourceStore.put(storedItem, itemId);
        }

        await new Promise<void>((resolve, reject) => {
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
        });
      } else {
        // Non-array data - store as single item with special key
        const transaction = db.transaction([storeName], 'readwrite');
        const resourceStore = transaction.objectStore(storeName);

        // Clear existing items
        resourceStore.clear();

        // Store data with '__single__' as key, data + timestamp as value (no itemId in value)
        const storedItem = {
          ...(data as Record<string, unknown>),
          timestamp,
        };
        resourceStore.put(storedItem, '__single__');

        await new Promise<void>((resolve, reject) => {
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
        });
      }
    } catch (error) {
      console.error(`[IndexedDB] Failed to save ${resourceName}:`, error);
    }
  }

  async load<T>(resourceName: ResourceName): Promise<T | null> {
    try {
      const stored = await this.loadWithMetadata<T>(resourceName);
      if (!stored) return null;

      // Check if data is still fresh
      if (Date.now() - stored.timestamp > this.maxAge) {
        return null;
      }

      return stored.data;
    } catch (error) {
      console.error(`[IndexedDB] Failed to load ${resourceName}:`, error);
      return null;
    }
  }

  async loadWithMetadata<T>(resourceName: ResourceName): Promise<StoredResourceData<T> | null> {
    try {
      const db = await this.openDB();
      const storeName = this.getResourceStoreName(resourceName);

      // Check if resource store exists
      if (!db.objectStoreNames.contains(storeName)) {
        return null;
      }

      const transaction = db.transaction([storeName], 'readonly');
      const resourceStore = transaction.objectStore(storeName);

      // Get all keys first
      const keys = await new Promise<string[]>((resolve, reject) => {
        const request = resourceStore.getAllKeys();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const allKeys = request.result.map((key) => String(key));
          resolve(allKeys);
        };
      });

      if (keys.length === 0) return null;

      // Check if single item
      if (keys.length === 1 && keys[0] === '__single__') {
        const item = await new Promise<Record<string, unknown> & { timestamp: number }>((resolve, reject) => {
          const request = resourceStore.get('__single__');
          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve(request.result as Record<string, unknown> & { timestamp: number });
        });

        // Check freshness
        if (Date.now() - item.timestamp > this.maxAge) {
          return null;
        }

        // Remove timestamp from data
        const { timestamp, ...data } = item;
        return {
          resourceName,
          data: data as T,
          timestamp,
          version: 1,
        };
      }

      // Load all items for array
      const items = await Promise.all(
        keys.map(
          (key) =>
            new Promise<Record<string, unknown> & { timestamp: number }>((resolve, reject) => {
              const request = resourceStore.get(key);
              request.onerror = () => reject(request.error);
              request.onsuccess = () => resolve(request.result as Record<string, unknown> & { timestamp: number });
            }),
        ),
      );

      if (items.length === 0) return null;

      // Check freshness using the first item's timestamp (all items have same timestamp)
      const firstTimestamp = items[0].timestamp;
      if (Date.now() - firstTimestamp > this.maxAge) {
        return null;
      }

      // Remove timestamp from each item
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const data = items.map(({ timestamp, ...item }) => item) as T;

      return {
        resourceName,
        data,
        timestamp: firstTimestamp,
        version: 1,
      };
    } catch (error) {
      console.error(`[IndexedDB] Failed to load ${resourceName}:`, error);
      return null;
    }
  }

  async delete(resourceName: ResourceName): Promise<void> {
    try {
      const db = await this.openDB();
      const storeName = this.getResourceStoreName(resourceName);

      // Check if resource store exists
      if (!db.objectStoreNames.contains(storeName)) {
        return;
      }

      const transaction = db.transaction([storeName], 'readwrite');
      const resourceStore = transaction.objectStore(storeName);

      // Clear all items in the resource store
      resourceStore.clear();

      await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (error) {
      console.error(`[IndexedDB] Failed to delete ${resourceName}:`, error);
    }
  }

  async clear(): Promise<void> {
    try {
      const db = await this.openDB();
      const storeNames = Array.from(db.objectStoreNames);

      const transaction = db.transaction(storeNames, 'readwrite');

      // Clear all resource stores
      await Promise.all(
        storeNames.map(
          (storeName) =>
            new Promise<void>((resolve, reject) => {
              const store = transaction.objectStore(storeName);
              const request = store.clear();
              request.onerror = () => reject(request.error);
              request.onsuccess = () => resolve();
            }),
        ),
      );
    } catch (error) {
      console.error('[IndexedDB] Failed to clear cache:', error);
    }
  }
}

/**
 * OPFS Storage Adapter using @zamp-platform/utils
 */
class OPFSStorageAdapter implements StorageAdapter {
  private cache: ReturnType<typeof OPFSCache.createOPFSCache>;
  private maxAge: number;
  // Memory cache fallback for when OPFS is not available
  private memoryCache = new Map<ResourceName, StoredResourceData>();

  constructor(maxAge: number = DEFAULT_PERSIST_CONFIG.maxAge) {
    this.maxAge = maxAge;
    this.cache = OPFSCache.createOPFSCache({
      directory: 'battalion-cache',
    });
  }

  async save<T>(resourceName: ResourceName, data: T): Promise<void> {
    const storedData: StoredResourceData<T> = {
      resourceName,
      data,
      timestamp: Date.now(),
      version: 1,
    };

    if (!OPFSCache.isOPFSAvailable()) {
      // Fallback: store in memory cache if OPFS not available
      this.memoryCache.set(resourceName, storedData as StoredResourceData);
      return;
    }

    try {
      await this.cache.set(resourceName, JSON.stringify(storedData));
    } catch (error) {
      console.error(`[OPFS] Failed to save ${resourceName}:`, error);
    }
  }

  async load<T>(resourceName: ResourceName): Promise<T | null> {
    const stored = await this.loadWithMetadata<T>(resourceName);
    if (!stored) return null;

    // Check if data is still fresh
    if (Date.now() - stored.timestamp > this.maxAge) {
      return null;
    }

    return stored.data;
  }

  async loadWithMetadata<T>(resourceName: ResourceName): Promise<StoredResourceData<T> | null> {
    if (!OPFSCache.isOPFSAvailable()) {
      // Fallback: load from memory cache
      const cached = this.memoryCache.get(resourceName);
      if (cached && Date.now() - cached.timestamp < this.maxAge) {
        return cached as StoredResourceData<T>;
      }
      return null;
    }

    try {
      const entry = await this.cache.get(resourceName);
      if (!entry || !entry.content) return null;

      // Check maxAge based on entry timestamp
      if (Date.now() - entry.timestamp > this.maxAge) {
        return null;
      }

      return JSON.parse(entry.content) as StoredResourceData<T>;
    } catch (error) {
      console.error(`[OPFS] Failed to load ${resourceName}:`, error);
      return null;
    }
  }

  async delete(resourceName: ResourceName): Promise<void> {
    this.memoryCache.delete(resourceName);

    if (!OPFSCache.isOPFSAvailable()) return;

    try {
      await this.cache.clear(resourceName);
    } catch (error) {
      console.error(`[OPFS] Failed to delete ${resourceName}:`, error);
    }
  }

  async clear(): Promise<void> {
    this.memoryCache.clear();

    if (!OPFSCache.isOPFSAvailable()) return;

    try {
      await this.cache.clearAll();
    } catch (error) {
      console.error('[OPFS] Failed to clear cache:', error);
    }
  }
}

/**
 * Get storage adapter based on storage type
 */
function getStorageAdapter(config: ResolvedPersistConfig): StorageAdapter {
  if (config.storage === STORAGE_TYPE.OPFS) {
    return new OPFSStorageAdapter(config.maxAge);
  }
  return new IndexedDBStorageAdapter(config.maxAge);
}

/**
 * Live sync subscription
 */
interface LiveSyncSubscription {
  resourceName: ResourceName;
  liveSyncConfig: LiveSyncConfig;
  persistConfig: ResolvedPersistConfig;
  state: LiveSyncState;
  intervalId?: ReturnType<typeof setInterval>;
  eventSource?: EventSource;
  /** EventBus subscription for SSE strategy using global SSE provider */
  eventSubscription?: EventBusSubscription;
  onStateChange?: () => void;
  subscriberCount: number;
  storageAdapter?: StorageAdapter;
}

/**
 * Live Sync Manager
 * Manages polling and SSE connections for resources with configurable persistence
 */
class LiveSyncManagerImpl {
  private subscriptions = new Map<ResourceName, LiveSyncSubscription>();
  private queryClient: QueryClient | null = null;
  private eventBus: EventBusInterface | null = null;
  private resourceRegistry = getResourceRegistry();

  /**
   * Set the query client for invalidation
   */
  setQueryClient(queryClient: QueryClient): void {
    this.queryClient = queryClient;
  }

  /**
   * Set the event bus for SSE subscriptions
   * This should be called with the EventBus from BattalionProvider
   */
  setEventBus(eventBus: EventBusInterface): void {
    this.eventBus = eventBus;
  }

  /**
   * Subscribe to live updates for a resource
   */
  subscribe(
    resourceName: ResourceName,
    liveSyncConfig: LiveSyncConfig,
    persist: boolean | PersistConfig | undefined,
    onStateChange?: () => void,
  ): void {
    const existingSubscription = this.subscriptions.get(resourceName);

    if (existingSubscription) {
      // Increment subscriber count
      existingSubscription.subscriberCount++;
      // Update the callback (use the latest one)
      existingSubscription.onStateChange = onStateChange;
      return;
    }

    const persistConfig = resolvePersistConfig(persist);
    const storageAdapter = persistConfig.enabled ? getStorageAdapter(persistConfig) : undefined;

    const subscription: LiveSyncSubscription = {
      resourceName,
      liveSyncConfig,
      persistConfig,
      state: {
        isConnected: false,
        lastSyncAt: null,
        loadedFromCache: false,
        isSyncing: false,
      },
      onStateChange,
      subscriberCount: 1,
      storageAdapter,
    };

    this.subscriptions.set(resourceName, subscription);

    if (liveSyncConfig.enabled) {
      // First, try to load from cache for instant display
      if (persistConfig.enabled && storageAdapter) {
        this.loadFromCache(subscription).then(() => {
          // Then start live sync in background
          this.startLiveSync(subscription);
        });
      } else {
        this.startLiveSync(subscription);
      }
    }
  }

  /**
   * Load data from cache
   */
  private async loadFromCache(subscription: LiveSyncSubscription): Promise<void> {
    if (!subscription.storageAdapter) return;

    try {
      const cached = await subscription.storageAdapter.loadWithMetadata(subscription.resourceName);

      if (cached && this.queryClient) {
        // Set cached data immediately for instant UI
        this.queryClient.setQueryData([subscription.resourceName], cached.data);

        subscription.state.loadedFromCache = true;
        subscription.state.lastSyncAt = new Date(cached.timestamp);

        this.notifyStateChange(subscription);
      }
    } catch (error) {
      console.error(`[LiveSync] Failed to load cache for ${subscription.resourceName}:`, error);
    }
  }

  /**
   * Start live sync based on strategy
   */
  private startLiveSync(subscription: LiveSyncSubscription): void {
    if (subscription.liveSyncConfig.strategy === 'polling') {
      this.startPolling(subscription);
    } else if (subscription.liveSyncConfig.strategy === 'sse') {
      this.startSSE(subscription);
    }
  }

  /**
   * Unsubscribe from live updates for a resource
   */
  unsubscribe(resourceName: ResourceName): void {
    const subscription = this.subscriptions.get(resourceName);
    if (!subscription) return;

    // Decrement subscriber count
    subscription.subscriberCount--;

    // Only delete and clean up if no more subscribers
    if (subscription.subscriberCount <= 0) {
      this.stopSubscription(subscription);
      this.subscriptions.delete(resourceName);
    }
  }

  /**
   * Get the sync state for a resource
   */
  getState(resourceName: ResourceName): LiveSyncState {
    const subscription = this.subscriptions.get(resourceName);
    return (
      subscription?.state || {
        isConnected: false,
        lastSyncAt: null,
        loadedFromCache: false,
        isSyncing: false,
      }
    );
  }

  /**
   * Manually trigger a sync for a resource
   */
  async sync(resourceName: ResourceName): Promise<void> {
    const subscription = this.subscriptions.get(resourceName);
    if (!subscription) return;

    await this.fetchAndUpdate(subscription);
  }

  /**
   * Start polling for a subscription
   */
  private startPolling(subscription: LiveSyncSubscription): void {
    const interval = subscription.liveSyncConfig.interval || 30000; // Default 30 seconds

    // Fetch immediately (in background if we have cached data)
    this.fetchAndUpdate(subscription).catch(console.error);

    // Start interval
    subscription.intervalId = setInterval(() => {
      this.fetchAndUpdate(subscription).catch(console.error);
    }, interval);

    subscription.state.isConnected = true;
    this.notifyStateChange(subscription);
  }

  /**
   * Start SSE connection for a subscription using EventBus
   * Subscribes to the configured event and triggers refetch when received
   */
  private startSSE(subscription: LiveSyncSubscription): void {
    const sseConfig = subscription.liveSyncConfig.sseConfig;

    if (!sseConfig?.event) {
      console.error(`[LiveSync] SSE config not available for ${subscription.resourceName}`);
      return;
    }

    if (!this.eventBus) {
      console.error(
        `[LiveSync] EventBus not available for ${subscription.resourceName}. Make sure BattalionProvider is set up with eventBus.`,
      );
      return;
    }

    try {
      // Subscribe to the resource event - triggers refetch when received
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      subscription.eventSubscription = this.eventBus.subscribe(sseConfig.event as EVENT_TYPE, () => {
        this.handleSSEEvent(subscription);
      });

      subscription.state.isConnected = true;
      subscription.state.error = undefined;
      this.notifyStateChange(subscription);

      // Fetch initial data
      this.fetchAndUpdate(subscription).catch(console.error);
    } catch (error) {
      console.error(`[LiveSync] Failed to start SSE for ${subscription.resourceName}:`, error);
      subscription.state.error = error instanceof Error ? error : new Error(String(error));
      this.notifyStateChange(subscription);
    }
  }

  /**
   * Handle SSE event - refetch data from the list endpoint
   */
  private handleSSEEvent(subscription: LiveSyncSubscription): void {
    this.fetchAndUpdate(subscription).catch(console.error);
  }

  /**
   * Stop a subscription
   */
  private stopSubscription(subscription: LiveSyncSubscription): void {
    if (subscription.intervalId) {
      clearInterval(subscription.intervalId);
      subscription.intervalId = undefined;
    }

    if (subscription.eventSource) {
      subscription.eventSource.close();
      subscription.eventSource = undefined;
    }

    // Clean up SSE event subscription
    if (subscription.eventSubscription) {
      subscription.eventSubscription.unsubscribe();
      subscription.eventSubscription = undefined;
    }

    subscription.state.isConnected = false;
    this.notifyStateChange(subscription);
  }

  /**
   * Fetch data and update cache
   */
  private async fetchAndUpdate(subscription: LiveSyncSubscription): Promise<void> {
    const resource = this.resourceRegistry.get(subscription.resourceName);
    if (!resource) return;

    subscription.state.isSyncing = true;
    this.notifyStateChange(subscription);

    try {
      const data = await resource.api.list();
      await this.handleUpdate(subscription, data);
    } catch (error) {
      subscription.state.error = error instanceof Error ? error : new Error(String(error));
      console.error(`Failed to fetch ${subscription.resourceName}:`, error);
    } finally {
      subscription.state.isSyncing = false;
      this.notifyStateChange(subscription);
    }
  }

  /**
   * Handle data update
   */
  private async handleUpdate(subscription: LiveSyncSubscription, data: unknown): Promise<void> {
    subscription.state.lastSyncAt = new Date();
    subscription.state.loadedFromCache = false;
    subscription.state.error = undefined;

    // Update query cache
    if (this.queryClient) {
      this.queryClient.setQueryData([subscription.resourceName], data);
    }

    // Persist to storage if enabled
    if (subscription.persistConfig.enabled && subscription.storageAdapter) {
      try {
        await subscription.storageAdapter.save(subscription.resourceName, data);
      } catch (error) {
        console.error(`[LiveSync] Failed to persist ${subscription.resourceName}:`, error);
      }
    }

    this.notifyStateChange(subscription);
  }

  /**
   * Notify state change to subscriber
   */
  private notifyStateChange(subscription: LiveSyncSubscription): void {
    if (subscription.onStateChange) {
      subscription.onStateChange();
    }
  }

  /**
   * Disconnect all subscriptions
   */
  disconnectAll(): void {
    this.subscriptions.forEach((subscription) => {
      this.stopSubscription(subscription);
    });
    this.subscriptions.clear();
  }

  /**
   * Reconnect all subscriptions
   */
  reconnectAll(): void {
    this.subscriptions.forEach((subscription) => {
      this.stopSubscription(subscription);
      if (subscription.liveSyncConfig.enabled) {
        if (subscription.persistConfig.enabled && subscription.storageAdapter) {
          this.loadFromCache(subscription).then(() => {
            this.startLiveSync(subscription);
          });
        } else {
          this.startLiveSync(subscription);
        }
      }
    });
  }

  /**
   * Check if any resource is connected
   */
  isAnyConnected(): boolean {
    for (const subscription of this.subscriptions.values()) {
      if (subscription.state.isConnected) return true;
    }
    return false;
  }

  /**
   * Get all subscribed resource names
   */
  getSubscribedResources(): ResourceName[] {
    return Array.from(this.subscriptions.keys());
  }

  /**
   * Clear persisted cache for a resource
   */
  async clearCache(resourceName: ResourceName): Promise<void> {
    const subscription = this.subscriptions.get(resourceName);
    if (subscription?.storageAdapter) {
      await subscription.storageAdapter.delete(resourceName);
    }
  }

  /**
   * Clear all persisted caches
   */
  async clearAllCaches(): Promise<void> {
    for (const subscription of this.subscriptions.values()) {
      if (subscription.storageAdapter) {
        await subscription.storageAdapter.clear();
        break; // Only need to clear once since all adapters share the same storage
      }
    }
  }
}

// Global live sync manager instance
let globalLiveSyncManager: LiveSyncManagerImpl | null = null;

/**
 * Get the global live sync manager
 */
export function getLiveSyncManager(): LiveSyncManagerImpl {
  if (!globalLiveSyncManager) {
    globalLiveSyncManager = new LiveSyncManagerImpl();
  }
  return globalLiveSyncManager;
}

/**
 * Create a new live sync manager instance
 */
export function createLiveSyncManager(): LiveSyncManagerImpl {
  return new LiveSyncManagerImpl();
}

/**
 * Reset the global live sync manager (useful for testing)
 */
export function resetLiveSyncManager(): void {
  if (globalLiveSyncManager) {
    globalLiveSyncManager.disconnectAll();
  }
  globalLiveSyncManager = null;
}

export { LiveSyncManagerImpl as LiveSyncManager };
