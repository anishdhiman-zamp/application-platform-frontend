/**
 * Battalion Resources
 *
 * Export all resource definitions.
 * Resources are registered automatically when imported.
 */

import { transactionStore } from '@zamp-platform/battalion';

export { type Dataset, DatasetResource } from './dataset.resource';

// Refresh mappings after all resources are registered
// This ensures newly registered resources are included in the transaction integration
transactionStore.refreshMappings();
export { type Process, ProcessResource } from './process.resource';
