import { createStore, del, get, keys, set, type UseStore } from 'idb-keyval';

/**
 * Transaction request stored in IndexedDB
 */
export interface StoredTransactionRequest {
  requestId: string;
  payload: TransactionRequestPayload;
  timestamp: number;
  retryCount: number;
  lastRetryAt?: number;
  status: 'pending' | 'retrying' | 'failed';
}

/**
 * Transaction request payload matching the backend API contract
 */
export interface TransactionRequestPayload {
  request_id: string;
  execution_mode?: 'sync' | 'async';
  transactions: Transaction[];
}

/**
 * Individual transaction in a request
 */
export interface Transaction {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  client_timestamp?: string;
}

const DB_NAME = 'battalion-db';
const DB_STORE_NAME = 'battalion-transactions';
const REQUEST_PREFIX = 'txn-request:';

/**
 * Get or create the custom store for battalion transactions
 */
let battalionStore: UseStore | null = null;

function getStore(): UseStore {
  if (!battalionStore) {
    battalionStore = createStore(DB_NAME, DB_STORE_NAME);
  }
  return battalionStore;
}

/**
 * IndexedDB utility for storing and managing transaction requests
 */
export class TransactionIndexedDB {
  /**
   * Store a transaction request in IndexedDB
   */
  static async storeRequest(requestId: string, payload: TransactionRequestPayload): Promise<void> {
    const storedRequest: StoredTransactionRequest = {
      requestId,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending',
    };

    await set(`${REQUEST_PREFIX}${requestId}`, storedRequest, getStore());
  }

  /**
   * Get a stored transaction request by ID
   */
  static async getRequest(requestId: string): Promise<StoredTransactionRequest | undefined> {
    return get<StoredTransactionRequest>(`${REQUEST_PREFIX}${requestId}`, getStore());
  }

  /**
   * Get all pending transaction requests
   */
  static async getAllPendingRequests(): Promise<StoredTransactionRequest[]> {
    const allKeys = await keys<string>(getStore());
    const requestKeys = allKeys.filter((key) => key.startsWith(REQUEST_PREFIX));

    const requests: StoredTransactionRequest[] = [];
    for (const key of requestKeys) {
      const request = await get<StoredTransactionRequest>(key, getStore());
      if (request && (request.status === 'pending' || request.status === 'retrying')) {
        requests.push(request);
      }
    }

    return requests;
  }

  /**
   * Update retry count and status for a request
   */
  static async updateRequestStatus(
    requestId: string,
    updates: Partial<Pick<StoredTransactionRequest, 'retryCount' | 'lastRetryAt' | 'status'>>,
  ): Promise<void> {
    const existing = await this.getRequest(requestId);
    if (!existing) {
      return;
    }

    const updated: StoredTransactionRequest = {
      ...existing,
      ...updates,
    };

    await set(`${REQUEST_PREFIX}${requestId}`, updated, getStore());
  }

  /**
   * Delete a transaction request from IndexedDB (on success)
   */
  static async deleteRequest(requestId: string): Promise<void> {
    await del(`${REQUEST_PREFIX}${requestId}`, getStore());
  }

  /**
   * Mark a request as failed (after max retries)
   */
  static async markRequestAsFailed(requestId: string): Promise<void> {
    await this.updateRequestStatus(requestId, { status: 'failed' });
  }

  /**
   * Clear all stored requests (useful for cleanup)
   */
  static async clearAllRequests(): Promise<void> {
    const allKeys = await keys<string>(getStore());
    const requestKeys = allKeys.filter((key) => key.startsWith(REQUEST_PREFIX));

    await Promise.all(requestKeys.map((key) => del(key, getStore())));
  }

  /**
   * Get the store name being used
   */
  static getStoreName(): string {
    return DB_STORE_NAME;
  }

  /**
   * Get the database name being used
   */
  static getDBName(): string {
    return DB_NAME;
  }
}
