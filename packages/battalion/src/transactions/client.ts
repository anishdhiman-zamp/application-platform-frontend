import { isBrowser } from '@zamp-platform/utils';

import { TransactionIndexedDB, TransactionRequestPayload } from './indexeddb';

/**
 * Transaction API response types
 */
export interface TransactionRequestResponse {
  id: string;
  client_request_id: string;
  execution_mode: 'sync' | 'async';
  status: 'created' | 'in_progress' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  transactions?: TransactionResponse[];
}

export interface TransactionResponse {
  client_transaction_id: string;
  status: 'completed' | 'failed';
  failure?: {
    type: string;
    code: string;
    message: string;
  };
}

/**
 * Configuration for transaction client
 */
export interface TransactionClientConfig {
  baseUrl: string;
  maxRetries?: number;
  retryDelay?: number;
  retryBackoffMultiplier?: number;
  getOrganizationId?: () => string | null;
  getAuthHeaders?: () => Record<string, string>;
}

/**
 * Internal config type with defaults applied
 */
interface InternalConfig {
  baseUrl: string;
  maxRetries: number;
  retryDelay: number;
  retryBackoffMultiplier: number;
  getOrganizationId?: () => string | null;
  getAuthHeaders?: () => Record<string, string>;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  retryBackoffMultiplier: 2,
};

/**
 * Transaction API client for fire-and-forget requests
 */
export class TransactionClient {
  private config: InternalConfig;

  constructor(config: TransactionClientConfig) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };
  }

  /**
   * Submit a transaction request (non-blocking)
   * Stores in IndexedDB and sends to backend without awaiting response
   * Returns immediately so FE can proceed optimistically
   */
  submitTransactionRequest(payload: TransactionRequestPayload): void {
    if (!isBrowser()) {
      throw new Error('Transaction client can only be used in browser environment');
    }

    const { request_id } = payload;

    // Store in IndexedDB and send API request without awaiting
    // This allows FE to proceed immediately with optimistic updates
    TransactionIndexedDB.storeRequest(request_id, payload)
      .then(() => {
        // Send API request after storing (don't await response)
        this.sendTransactionRequest(request_id).catch((error) => {
          // Error is logged but not thrown - API call happens in background
          console.error(`Failed to send transaction request ${request_id}:`, error);
        });
      })
      .catch((error) => {
        // Even if IndexedDB storage fails, try to send the request
        console.error(`Failed to store transaction request ${request_id}:`, error);
        this.sendTransactionRequest(request_id).catch((err) => {
          console.error(`Failed to send transaction request ${request_id}:`, err);
        });
      });
  }

  /**
   * Send a transaction request to the backend
   * Returns true on success, false on 5xx error (for retry)
   */
  private async sendTransactionRequest(requestId: string): Promise<boolean> {
    const storedRequest = await TransactionIndexedDB.getRequest(requestId);
    if (!storedRequest) {
      return false;
    }

    const { payload } = storedRequest;

    try {
      const response = await this.makeRequest(payload);

      if (response.ok) {
        // Success - delete from IndexedDB
        await TransactionIndexedDB.deleteRequest(requestId);
        return true;
      }

      // Check if it's a 5xx error (server error - retry)
      if (response.status >= 500 && response.status < 600) {
        // Update retry count
        const newRetryCount = storedRequest.retryCount + 1;
        await TransactionIndexedDB.updateRequestStatus(requestId, {
          retryCount: newRetryCount,
          lastRetryAt: Date.now(),
          status: 'retrying',
        });

        // Schedule retry if under max retries
        if (newRetryCount <= this.config.maxRetries) {
          this.scheduleRetry(requestId, newRetryCount);
        } else {
          // Max retries reached - mark as failed
          await TransactionIndexedDB.markRequestAsFailed(requestId);
        }

        return false;
      }

      // Non-5xx error (4xx, etc.) - don't retry, but keep in IndexedDB for debugging
      // Could optionally mark as failed or delete based on requirements
      await TransactionIndexedDB.updateRequestStatus(requestId, {
        status: 'failed',
      });

      return false;
    } catch (error) {
      // Network error or other exception - treat as 5xx for retry purposes
      console.error(`Network error sending transaction request ${requestId}:`, error);

      const newRetryCount = storedRequest.retryCount + 1;
      await TransactionIndexedDB.updateRequestStatus(requestId, {
        retryCount: newRetryCount,
        lastRetryAt: Date.now(),
        status: 'retrying',
      });

      if (newRetryCount <= this.config.maxRetries) {
        this.scheduleRetry(requestId, newRetryCount);
      } else {
        await TransactionIndexedDB.markRequestAsFailed(requestId);
      }

      return false;
    }
  }

  /**
   * Make HTTP request to transaction API
   */
  private async makeRequest(payload: TransactionRequestPayload): Promise<Response> {
    const url = `${this.config.baseUrl}/transaction-requests`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.config.getAuthHeaders?.(),
    };

    const orgId = this.config.getOrganizationId?.();
    if (orgId) {
      headers['X-Zamp-Organization-Id'] = orgId;
    }

    return fetch(url, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Schedule a retry with exponential backoff
   */
  private scheduleRetry(requestId: string, retryCount: number): void {
    const delay = this.config.retryDelay * Math.pow(this.config.retryBackoffMultiplier, retryCount - 1);

    setTimeout(() => {
      this.sendTransactionRequest(requestId).catch((error) => {
        console.error(`Retry failed for transaction request ${requestId}:`, error);
      });
    }, delay);
  }

  /**
   * Retry all pending requests (useful for recovery after page load)
   */
  async retryPendingRequests(): Promise<void> {
    const pendingRequests = await TransactionIndexedDB.getAllPendingRequests();

    for (const request of pendingRequests) {
      // Only retry if not already retrying (to avoid duplicate retries)
      if (request.status === 'pending' || request.retryCount < this.config.maxRetries) {
        this.sendTransactionRequest(request.requestId).catch((error) => {
          console.error(`Failed to retry transaction request ${request.requestId}:`, error);
        });
      }
    }
  }

  /**
   * Get status of a transaction request
   */
  async getTransactionStatus(requestId: string): Promise<TransactionRequestResponse | null> {
    const url = `${this.config.baseUrl}/transaction-requests/${requestId}/summary`;
    const headers: Record<string, string> = {
      ...this.config.getAuthHeaders?.(),
    };

    const orgId = this.config.getOrganizationId?.();
    if (orgId) {
      headers['X-Zamp-Organization-Id'] = orgId;
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      if (response.ok) {
        return (await response.json()) as TransactionRequestResponse;
      }

      return null;
    } catch (error) {
      console.error(`Failed to get transaction status for ${requestId}:`, error);
      return null;
    }
  }
}
