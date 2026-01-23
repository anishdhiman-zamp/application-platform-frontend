import { API_DOMAIN } from '@zamp-platform/api';

import { TransactionClient, TransactionClientConfig } from './client';
import { TransactionIntegration } from './integration';

/**
 * Default configuration - uses API_DOMAIN from @zamp-platform/api
 */
const getDefaultConfig = (): TransactionClientConfig => ({
  baseUrl: API_DOMAIN,
  maxRetries: 3,
  retryDelay: 1000,
  retryBackoffMultiplier: 2,
});

/**
 * Global transaction store - singleton pattern with lazy initialization
 */
class TransactionStore {
  private integration: TransactionIntegration | null = null;
  private client: TransactionClient | null = null;
  private customConfig: TransactionClientConfig | null = null;

  /**
   * Configure the transaction store with custom settings.
   * Call this before using any resources if you need custom config.
   * If not called, defaults will be used.
   */
  configure(config: Partial<TransactionClientConfig>): void {
    this.customConfig = { ...getDefaultConfig(), ...config };
    // Reset to force re-initialization with new config
    this.integration = null;
    this.client = null;
  }

  /**
   * Get integration - lazily initializes if needed
   */
  getIntegration(): TransactionIntegration {
    if (!this.integration) {
      this.ensureInitialized();
    }
    return this.integration!;
  }

  /**
   * Get client - lazily initializes if needed
   */
  getClient(): TransactionClient {
    if (!this.client) {
      this.ensureInitialized();
    }
    return this.client!;
  }

  /**
   * Check if store is initialized
   */
  isInitialized(): boolean {
    return this.integration !== null;
  }

  /**
   * Ensure the store is initialized
   */
  private ensureInitialized(): void {
    if (this.integration) return;

    const config = this.customConfig || getDefaultConfig();
    this.client = new TransactionClient(config);
    this.integration = new TransactionIntegration({ client: this.client });

    // Retry pending requests on initialization (browser only)
    if (typeof window !== 'undefined') {
      this.client.retryPendingRequests().catch(console.error);
    }
  }

  /**
   * Reset the store (mainly for testing)
   */
  reset(): void {
    this.integration = null;
    this.client = null;
    this.customConfig = null;
  }
}

export const transactionStore = new TransactionStore();
