/**
 * Dataset Resource Definition
 *
 * Defines the Dataset resource using Battalion's defineResource.
 */

import { defineResource } from '@zamp-platform/battalion';
import { DATASET_TOAST_MESSAGES } from '@zamp-platform/dataset-create-edit/constants';
import { toast } from '@zamp-platform/ui';
import { EVENT_TYPE } from '@zamp-platform/utils';
import { z } from 'zod';
import { API_ENDPOINTS } from '@/apis/apiEndpoint.constants';
import { APITags } from '@/constants/api.constants';
import { TRANSACTION_CONTROLLER_WORKFLOW_NAMES } from '@/modules/data/data.types';
import { resourceTypeRouteMap } from '@/modules/shareResource/shareResource.constants';
import { ResourceType } from '@/modules/shareResource/shareResource.types';
import { baseApi } from '@/services/baseApi';
import { store } from '@/store';
import { dispatchDatasetCreated, dispatchDatasetUpdated } from '@/utils/events';

// Column definition type for dataset schema
interface DatasetColumn {
  name: string;
  type: string;
  nullable?: boolean;
  default?: string | boolean | null;
  primary_key?: boolean;
}

// Column for add_columns in update payload
interface AddColumn {
  name: string;
  type: string;
  nullable: boolean;
  default?: string | null;
}

// Column for alter_columns in update payload
interface AlterColumn {
  name: string;
  new_name?: string;
  type?: string;
  default?: string | null;
  nullable?: boolean;
}

// Display config for column display and metadata
interface DisplayConfigItem {
  column: string;
  alias?: string | null;
  is_hidden?: boolean;
  is_editable?: boolean;
  type?: string;
}

// Update payload interface
interface DatasetUpdatePayload {
  id: string;
  title?: string;
  description?: string;
  add_columns?: AddColumn[];
  drop_columns?: string[];
  alter_columns?: AlterColumn[];
  display_config?: DisplayConfigItem[];
}

// Schema matching DatasetType from types/api/dataset.types.ts
const DatasetSchema = z.object({
  id: z.string(),
  title: z.string(),
  tableName: z.string().optional(),
  description: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  created_by: z.string(),
  organization_id: z.string(),
  metadata: z.record(z.unknown()).optional(),
  // Additional columns for the dataset schema (user-defined columns)
  columns: z
    .array(
      z.object({
        name: z.string(),
        type: z.string(),
        nullable: z.boolean().optional(),
        default: z.union([z.string(), z.boolean()]).optional(),
        primary_key: z.boolean().optional(),
      }),
    )
    .optional(),
});

export type Dataset = z.infer<typeof DatasetSchema>;
export type { DatasetColumn };

/**
 * Dataset Resource
 *
 * Features:
 * - Live sync with SSE (listens to DATASET events via global EventBus)
 * - Optimistic updates for all mutations
 * - Transaction-based create/update/delete operations
 *
 * Transaction Types:
 * - CreateDatasetControllerWorkflow: Create a new dataset
 * - UpdateDatasetControllerWorkflow: Update dataset
 * - DeleteDatasetControllerWorkflow: Delete a dataset
 */
// Response type from the API
interface DatasetListResponse {
  datasets: Dataset[];
  totalCount: number;
}

export const DatasetResource = defineResource({
  name: 'Dataset',
  schema: DatasetSchema,
  endpoints: {
    list: API_ENDPOINTS.DATASET_LISTING_GET,
  },
  // Extract the datasets array from the API response
  transformResponse: (response: unknown) => (response as DatasetListResponse).datasets,
  transactions: {
    create: TRANSACTION_CONTROLLER_WORKFLOW_NAMES.CREATE_DATASET,
    update: TRANSACTION_CONTROLLER_WORKFLOW_NAMES.UPDATE_DATASET,
    delete: TRANSACTION_CONTROLLER_WORKFLOW_NAMES.DELETE_DATASET,
    resourceType: 'Dataset',
    idField: 'id',
    transformPayload: {
      create: (data: unknown) => {
        const datasetData = data as Partial<Dataset>;
        const rawColumns = datasetData.columns || [];

        const regexforSpaceReplacement = /\s+/g;
        const sanitizedColumns = rawColumns.map((col) => ({
          ...col,
          name: col.name.replace(regexforSpaceReplacement, '_').toLowerCase(),
        }));

        const payload = {
          dataset_id: datasetData?.id,
          title: datasetData?.title || '',
          description: datasetData?.description || '',
          type: 'source',
          schema: {
            columns: sanitizedColumns.map(({ name, type, nullable, default: defaultValue }) => ({
              name,
              type,
              nullable,
              default: defaultValue,
            })),
          },
          metadata: {
            display_config: sanitizedColumns.map((col) => ({
              column: col?.name || '',
              is_hidden: (col as { is_hidden?: boolean }).is_hidden ?? false,
              is_editable: false,
            })),
          },
        };

        return payload;
      },
      update: (data: unknown) => {
        const { id, title, description, add_columns, drop_columns, alter_columns, display_config } =
          data as DatasetUpdatePayload;

        const lcAddColumns = add_columns?.map((col) => ({ ...col, name: col.name?.toLowerCase() }));
        const lcDropColumns = drop_columns?.map((col) => col?.toLowerCase());
        const lcAlterColumns = alter_columns?.map((col) => ({ ...col, name: col.name?.toLowerCase() }));
        const lcDisplayConfig = display_config?.map((col) => ({ ...col, column: col.column?.toLowerCase() }));

        return {
          dataset_id: id,
          ...(title && { title }),
          ...(description && { description }),
          ...(lcAddColumns?.length && { add_columns: lcAddColumns }),
          ...(lcDropColumns?.length && { drop_columns: lcDropColumns }),
          ...(lcAlterColumns?.length && { alter_columns: lcAlterColumns }),
          ...(lcDisplayConfig?.length && { display_config: lcDisplayConfig }),
        };
      },
      delete: (data: unknown) => {
        const datasetData = data as { id?: string };

        return {
          dataset_id: datasetData.id,
        };
      },
    },
    optimistic: {
      create: 'append',
      update: 'merge',
      delete: 'remove',

      /**
       * Creates a full Dataset object for optimistic updates.
       */
      getOptimisticItem: (data: Partial<Dataset>): Dataset => ({
        id: data.id || `temp-${Date.now()}`,
        title: data.title || '',
        description: data.description || '',
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString(),
        created_by: data.created_by || '',
        organization_id: data.organization_id || '',
        metadata: data.metadata || {},
        columns: data.columns || [],
      }),
    },
    onSuccess: {
      create: (data: unknown) => {
        const datasetId = (data as Dataset)?.id as string;

        dispatchDatasetCreated(datasetId);
        toast.success(DATASET_TOAST_MESSAGES.DATASET_CREATED_SUCCESS);
        store.dispatch(baseApi.util.invalidateTags([APITags.GET_DATASET_LISTING]));

        if (datasetId) {
          const resourceRoute = resourceTypeRouteMap[ResourceType.DATASET];

          store.dispatch(
            baseApi.util.invalidateTags([
              { type: APITags.GET_AUDIENCE_BY_RESOURCE_ID, id: `${resourceRoute}-${datasetId}` },
            ]),
          );
        }
      },
      update: (id: string) => {
        dispatchDatasetUpdated(id);
        toast.success(DATASET_TOAST_MESSAGES.DATASET_UPDATED_SUCCESS);
        store.dispatch(baseApi.util.invalidateTags([APITags.GET_DATASET_LISTING]));
      },
    },
    onRollback: {
      create: () => toast.error('Failed to create dataset. Please try again.'),
      update: () => toast.error('Failed to update dataset. Please try again.'),
      delete: () => toast.error('Failed to delete dataset. Please try again.'),
    },
  },
  liveSync: {
    enabled: true,
    strategy: 'sse',
    sseConfig: {
      event: EVENT_TYPE.DATASET,
    },
  },
  cache: {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  },
});
