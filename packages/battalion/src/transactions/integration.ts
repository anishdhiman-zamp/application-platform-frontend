import { getResourceRegistry } from '../core/registry';
import { ResourceName } from '../types';
import { TransactionClient } from './client';
import { TransactionRequestPayload } from './indexeddb';

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface TransactionMapping {
  transactionType: string;
  transformPayload?: (data: unknown) => Record<string, unknown>;
}

export class TransactionIntegration {
  private client: TransactionClient;
  private actionMap = new Map<string, TransactionMapping>();

  constructor(config: { client: TransactionClient }) {
    this.client = config.client;
    this.discoverMappings();
  }

  private discoverMappings(): void {
    const resources = getResourceRegistry().getAll();

    resources.forEach((resource) => {
      if (!resource.transactions) return;

      const { create, update, delete: deleteType, transformPayload } = resource.transactions;

      if (create) {
        this.actionMap.set(`${resource.name}:create`, {
          transactionType: create,
          transformPayload: transformPayload?.create,
        });
      }
      if (update) {
        this.actionMap.set(`${resource.name}:update`, {
          transactionType: update,
          transformPayload: transformPayload?.update,
        });
      }
      if (deleteType) {
        this.actionMap.set(`${resource.name}:delete`, {
          transactionType: deleteType,
          transformPayload: transformPayload?.delete,
        });
      }
    });
  }

  async createTransactionRequest(
    resource: ResourceName,
    action: 'create' | 'update' | 'delete',
    data: unknown,
    resourceId?: string,
  ): Promise<string> {
    const mapping = this.actionMap.get(`${resource}:${action}`);
    if (!mapping) {
      throw new Error(`No transaction mapping for ${resource}:${action}`);
    }

    const requestId = generateUUID();
    const resourceType = getResourceRegistry().get(resource)?.transactions?.resourceType;
    const payload = mapping.transformPayload ? mapping.transformPayload(data) : (data as Record<string, unknown>);

    const requestPayload: TransactionRequestPayload = {
      request_id: requestId,
      execution_mode: 'sync',
      transactions: [
        {
          id: generateUUID(),
          type: mapping.transactionType,
          payload,
          client_timestamp: new Date().toISOString(),
          ...(resourceType && { resource_type: resourceType }),
          ...(resourceId && { resource_id: resourceId }),
        },
      ],
    };

    this.client.submitTransactionRequest(requestPayload);
    return requestId;
  }

  async createBatchTransactionRequest(
    transactions: Array<{
      resource: ResourceName;
      action: 'create' | 'update' | 'delete';
      data: unknown;
      options?: { resourceId?: string };
    }>,
  ): Promise<string> {
    const requestId = generateUUID();

    const transactionList = transactions.map((txn) => {
      const mapping = this.actionMap.get(`${txn.resource}:${txn.action}`);
      if (!mapping) {
        throw new Error(`No transaction mapping for ${txn.resource}:${txn.action}`);
      }

      const resourceType = getResourceRegistry().get(txn.resource)?.transactions?.resourceType;
      const payload = mapping.transformPayload
        ? mapping.transformPayload(txn.data)
        : (txn.data as Record<string, unknown>);

      return {
        id: generateUUID(),
        type: mapping.transactionType,
        payload,
        client_timestamp: new Date().toISOString(),
        ...(resourceType && { resource_type: resourceType }),
        ...(txn.options?.resourceId && { resource_id: txn.options.resourceId }),
      };
    });

    this.client.submitTransactionRequest({
      request_id: requestId,
      execution_mode: 'sync',
      transactions: transactionList,
    });

    return requestId;
  }

  shouldUseTransactions(resource: ResourceName, action: 'create' | 'update' | 'delete'): boolean {
    return this.actionMap.has(`${resource}:${action}`);
  }
}
