import { QueryClient } from '@tanstack/react-query';

import { ResourceName } from '../types';
import { getOPFSStorage, OPFSStorageManager } from './opfs-storage';
import { getResourceRegistry } from './registry';

/**
 * Live sync configuration for a resource
 */
export interface LiveSyncConfig {
  enabled: boolean;
  strategy: 'polling' | 'sse';
  interval?: number; // For polling (ms)
  endpoint?: string; // For SSE
  /**
   * Enable OPFS persistence for instant loading
   */
  persist?: boolean;
  /**
   * Max age for persisted data (ms)
   */
  persistMaxAge?: number;
}

/**
 * Live sync state for a resource
 */
export interface LiveSyncState {
  isConnected: boolean;
  lastSyncAt: Date | null;
  error?: Error;
  /**
   * Whether data was loaded from cache
   */
  loadedFromCache?: boolean;
  /**
   * Whether background sync is in progress
   */
  isSyncing?: boolean;
}

/**
 * Live sync subscription
 */
interface LiveSyncSubscription {
  resourceName: ResourceName;
  config: LiveSyncConfig;
  state: LiveSyncState;
  intervalId?: ReturnType<typeof setInterval>;
  eventSource?: EventSource;
  onStateChange?: () => void;
}

/**
 * Live Sync Manager
 * Manages polling and SSE connections for resources with OPFS persistence
 */
class LiveSyncManagerImpl {
  private subscriptions = new Map<ResourceName, LiveSyncSubscription>();
  private queryClient: QueryClient | null = null;
  private resourceRegistry = getResourceRegistry();
  private opfsStorage: OPFSStorageManager;

  constructor() {
    this.opfsStorage = getOPFSStorage();
  }

  /**
   * Set the query client for invalidation
   */
  setQueryClient(queryClient: QueryClient): void {
    this.queryClient = queryClient;
  }

  /**
   * Subscribe to live updates for a resource
   */
  subscribe(resourceName: ResourceName, config: LiveSyncConfig, onStateChange?: () => void): void {
    // Don't re-subscribe if already subscribed
    if (this.subscriptions.has(resourceName)) {
      return;
    }

    const subscription: LiveSyncSubscription = {
      resourceName,
      config,
      state: {
        isConnected: false,
        lastSyncAt: null,
        loadedFromCache: false,
        isSyncing: false,
      },
      onStateChange,
    };

    this.subscriptions.set(resourceName, subscription);

    if (config.enabled) {
      // First, try to load from OPFS cache for instant display
      if (config.persist) {
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
   * Load data from OPFS cache
   */
  private async loadFromCache(subscription: LiveSyncSubscription): Promise<void> {
    try {
      const cached = await this.opfsStorage.loadWithMetadata(subscription.resourceName);

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
    if (subscription.config.strategy === 'polling') {
      this.startPolling(subscription);
    } else if (subscription.config.strategy === 'sse') {
      this.startSSE(subscription);
    }
  }

  /**
   * Unsubscribe from live updates for a resource
   */
  unsubscribe(resourceName: ResourceName): void {
    const subscription = this.subscriptions.get(resourceName);
    if (!subscription) return;

    this.stopSubscription(subscription);
    this.subscriptions.delete(resourceName);
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
    const interval = subscription.config.interval || 30000; // Default 30 seconds

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
   * Start SSE connection for a subscription
   */
  private startSSE(subscription: LiveSyncSubscription): void {
    const endpoint = subscription.config.endpoint;
    if (!endpoint) {
      console.error(`SSE endpoint not configured for resource ${subscription.resourceName}`);
      return;
    }

    try {
      const eventSource = new EventSource(endpoint);

      eventSource.onopen = () => {
        subscription.state.isConnected = true;
        subscription.state.error = undefined;
        this.notifyStateChange(subscription);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleUpdate(subscription, data);
        } catch (error) {
          console.error(`Failed to parse SSE message for ${subscription.resourceName}:`, error);
        }
      };

      eventSource.onerror = (error) => {
        subscription.state.isConnected = false;
        subscription.state.error = new Error('SSE connection error');
        this.notifyStateChange(subscription);
        console.error(`SSE error for ${subscription.resourceName}:`, error);

        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (this.subscriptions.has(subscription.resourceName)) {
            this.startSSE(subscription);
          }
        }, 5000);
      };

      subscription.eventSource = eventSource;
    } catch (error) {
      console.error(`Failed to start SSE for ${subscription.resourceName}:`, error);
      subscription.state.error = error instanceof Error ? error : new Error(String(error));
      this.notifyStateChange(subscription);
    }
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

    // Persist to OPFS if enabled
    if (subscription.config.persist) {
      try {
        await this.opfsStorage.save(subscription.resourceName, data);
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
      if (subscription.config.enabled) {
        if (subscription.config.persist) {
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
    await this.opfsStorage.delete(resourceName);
  }

  /**
   * Clear all persisted caches
   */
  async clearAllCaches(): Promise<void> {
    await this.opfsStorage.clear();
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
