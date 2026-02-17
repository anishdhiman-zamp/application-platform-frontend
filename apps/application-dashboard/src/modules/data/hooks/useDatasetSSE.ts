'use client';

import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { captureException } from '@sentry/nextjs';
import {
  getColumnConfigForDataset,
  mapSchemaTypeToColumnType,
  setColumnConfigForDataset,
} from '@zamp-platform/dataset-create-edit';
import { SYSTEM_COLUMNS } from '@zamp-platform/dataset-create-edit/constants';
import { type BaseEventPayload, EVENT_TYPE } from '@zamp-platform/utils/event-bus/event-bus.types';
import { DATASET_RESOURCE_TRANSACTION_PAYLOAD_TYPE } from 'modules/data/data.types';
import { useEventBus } from '@/app/_providers/sse-provider';
import { APITags } from '@/constants/api.constants';
import { baseApi } from '@/services/baseApi';
import type { MapAny } from '@/types/commonTypes';

interface DatasetSSEPayload {
  type: 'dataset_updated' | 'dataset_created' | 'dataset_deleted';
  dataset?: {
    dataset_id: string;
    title: string;
    table_name: string;
    description: string;
    metadata: {
      display_config: Array<{
        column: string;
        alias: string | null;
        is_hidden: boolean;
        is_editable: boolean;
        type: string | null;
        config: MapAny | null;
      }>;
      schema: {
        columns: Array<{
          name: string;
          type: string;
          default: string | null;
          nullable: boolean;
          primary_key: boolean;
          auto_increment: boolean;
        }>;
      };
    };
  };
}

interface UseDatasetSSEProps {
  /** If provided, enables detail mode: filters events by this ID and syncs localStorage + context */
  datasetId?: string;
  /** If true, invalidates the dataset listing RTK Query cache on any dataset event */
  invalidateListing?: boolean;
  /** Callback when columns are updated from SSE (detail mode only) */
  onColumnsUpdated?: (columns: NonNullable<DatasetSSEPayload['dataset']>['metadata']['schema']['columns']) => void;
  /** Callback to update context column IDs to match backend (detail mode only) */
  updateColumnIdsFromBE?: (beColumns: Array<{ id: string; name?: string }>) => void;
}

/**
 * Unified hook to listen for dataset SSE events.
 *
 * - **Detail mode** (`datasetId` provided): Filters events for the specific dataset,
 *   updates localStorage with correct column IDs, syncs display config (aliases, visibility),
 *   and maps frontend temporary IDs to backend IDs.
 *
 * - **Listing mode** (`invalidateListing: true`): Invalidates the RTK Query cache for the
 *   dataset listing, triggering an auto-refresh on the listing page.
 *
 * Both modes can be enabled simultaneously.
 */
export function useDatasetSSE({
  datasetId,
  invalidateListing = false,
  onColumnsUpdated,
  updateColumnIdsFromBE,
}: UseDatasetSSEProps) {
  const { sseEventBus } = useEventBus();
  const dispatch = useDispatch();

  const handleDatasetEvent = useCallback(
    (data: BaseEventPayload) => {
      if (!data) return;

      const payload = data.payload as DatasetSSEPayload;

      // --- Listing mode: invalidate cache on any dataset event ---
      if (
        invalidateListing &&
        (payload?.type === DATASET_RESOURCE_TRANSACTION_PAYLOAD_TYPE.DATASET_UPDATED ||
          payload?.type === DATASET_RESOURCE_TRANSACTION_PAYLOAD_TYPE.DATASET_CREATED ||
          payload?.type === DATASET_RESOURCE_TRANSACTION_PAYLOAD_TYPE.DATASET_DELETED)
      ) {
        dispatch(baseApi.util.invalidateTags([APITags.GET_DATASET_LISTING]));
      }

      // --- Detail mode: sync localStorage + context for a specific dataset ---
      if (!datasetId || data.source_id !== datasetId) return;

      if (
        payload?.type === DATASET_RESOURCE_TRANSACTION_PAYLOAD_TYPE.DATASET_UPDATED ||
        payload?.type === DATASET_RESOURCE_TRANSACTION_PAYLOAD_TYPE.DATASET_CREATED
      ) {
        const dataset = payload.dataset;

        if (!dataset) return;

        const displayConfig = dataset.metadata?.display_config || [];
        const schemaColumns = dataset.metadata?.schema?.columns || [];

        // System columns to filter out
        const userSchemaColumns = schemaColumns.filter((col) => !SYSTEM_COLUMNS.includes(col?.name || ''));

        // Build a map of display_config by column name (lowercase for case-insensitive matching)
        const displayConfigMap = new Map(displayConfig.map((dc) => [dc.column.toLowerCase(), dc]));

        // Update localStorage with correct column IDs
        try {
          const existingConfig = getColumnConfigForDataset(datasetId) as Record<string, unknown> | null;
          const existingColumns =
            (
              existingConfig as {
                columns?: Array<{ colId: string; columnName: string; width: number; isVisible: boolean }>;
              }
            )?.columns || [];

          // Create maps of column name/id -> existing settings (width, visibility, order)
          const existingSettingsByName = new Map<string, { width: number; isVisible: boolean; order: number }>();
          const existingSettingsById = new Map<string, { width: number; isVisible: boolean; order: number }>();

          existingColumns.forEach(
            (col: { colId: string; columnName: string; width: number; isVisible: boolean }, index: number) => {
              const normalizedName = col.columnName?.toLowerCase().trim().replace(/\s+/g, '_');

              if (normalizedName) {
                existingSettingsByName.set(normalizedName, {
                  width: col.width,
                  isVisible: col.isVisible,
                  order: index,
                });
              }
              existingSettingsById.set(col.colId, { width: col.width, isVisible: col.isVisible, order: index });
            },
          );

          // Build new columns array with correct BE column IDs
          const newColumns = userSchemaColumns.map((schemaCol) => {
            const beColumnId = schemaCol.name;
            const displayConfigEntry = displayConfigMap.get(beColumnId.toLowerCase());

            // Generate display name: use alias if available, otherwise capitalize and replace underscores
            const displayName =
              displayConfigEntry?.alias || beColumnId.charAt(0).toUpperCase() + beColumnId.slice(1).replace(/_/g, ' ');

            // Try to get existing settings by matching column name (normalized)
            const normalizedBeId = beColumnId.toLowerCase().trim();
            const existingByName = existingSettingsByName.get(normalizedBeId);
            const existingById = existingSettingsById.get(beColumnId);
            const existingSettings = existingByName || existingById;

            // Determine visibility: use existing settings, then displayConfig, default to true
            const isHiddenFromConfig = displayConfigEntry?.is_hidden ?? false;

            return {
              colId: beColumnId,
              columnName: displayName,
              columnType: mapSchemaTypeToColumnType(schemaCol.type),
              isVisible: existingSettings?.isVisible ?? !isHiddenFromConfig,
              width: existingSettings?.width ?? 150,
            };
          });

          // Sort by original order if available, to preserve user's column ordering
          newColumns.sort((a, b) => {
            const orderA = existingSettingsByName.get(a.colId.toLowerCase())?.order ?? 999;
            const orderB = existingSettingsByName.get(b.colId.toLowerCase())?.order ?? 999;

            return orderA - orderB;
          });

          // Append any FE-only columns that aren't in backend yet (unsaved additions)
          const FE_TEMP_ID_PATTERN = /^col_\d+_/;
          const beColumnIds = new Set(newColumns.map((c: { colId: string }) => c.colId.toLowerCase()));
          const feOnlyColumns = existingColumns
            .filter(
              (col: { colId: string }) =>
                !beColumnIds.has(col.colId.toLowerCase()) && FE_TEMP_ID_PATTERN.test(col.colId),
            )
            .map(
              (col: { colId: string; columnName: string; width: number; isVisible: boolean; columnType?: string }) => ({
                colId: col.colId,
                columnName: col.columnName,
                columnType: mapSchemaTypeToColumnType(col.columnType || 'TEXT'),
                isVisible: col.isVisible,
                width: col.width,
              }),
            );

          if (feOnlyColumns.length > 0) {
            newColumns.push(...feOnlyColumns);
          }

          // Update localStorage
          setColumnConfigForDataset(datasetId, {
            dataset_name: dataset.title,
            dataset_unique_key_name: dataset.table_name || '',
            columns: newColumns,
          });

          // Update context column IDs and names to match BE
          if (updateColumnIdsFromBE) {
            const beColumns = userSchemaColumns.map((schemaCol) => {
              const displayConfigEntry = displayConfigMap.get(schemaCol.name.toLowerCase());
              const displayName =
                displayConfigEntry?.alias ||
                schemaCol.name.charAt(0).toUpperCase() + schemaCol.name.slice(1).replace(/_/g, ' ');

              return {
                id: schemaCol.name,
                name: displayName,
              };
            });

            updateColumnIdsFromBE(beColumns);
          }

          // Notify parent if callback provided
          if (onColumnsUpdated) {
            onColumnsUpdated(schemaColumns);
          }
        } catch (error) {
          captureException(error, {
            extra: { datasetId, context: 'useDatasetSSE - Failed to update localStorage from SSE event' },
          });
        }
      }
    },
    [datasetId, invalidateListing, dispatch, onColumnsUpdated, updateColumnIdsFromBE],
  );

  useEffect(() => {
    const subscription = sseEventBus.subscribe(EVENT_TYPE.DATASET, handleDatasetEvent);

    return () => {
      subscription.unsubscribe();
    };
  }, [sseEventBus, handleDatasetEvent]);
}
