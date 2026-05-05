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
import { type BaseEventPayload, EVENT_TYPE } from '@zamp-platform/utils/event-bus';
import { DATASET_RESOURCE_TRANSACTION_PAYLOAD_TYPE } from 'modules/data/data.types';
import { useEventBus } from '@/app/_providers/sse-provider';
import { APITags } from '@/constants/api.constants';
import { baseApi } from '@/services/baseApi';
import type { MapAny } from '@/types/commonTypes';

interface DatasetSSEPayload {
  type: (typeof DATASET_RESOURCE_TRANSACTION_PAYLOAD_TYPE)[keyof typeof DATASET_RESOURCE_TRANSACTION_PAYLOAD_TYPE];
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
  datasetId?: string;
  invalidateListing?: boolean;
  onColumnsUpdated?: (columns: NonNullable<DatasetSSEPayload['dataset']>['metadata']['schema']['columns']) => void;
  updateColumnIdsFromBE?: (beColumns: Array<{ id: string; name?: string }>) => void;
}

/** Listens for dataset SSE events to sync localStorage, context, and RTK Query cache. */
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

      if (
        invalidateListing &&
        (payload?.type === DATASET_RESOURCE_TRANSACTION_PAYLOAD_TYPE.DATASET_UPDATED ||
          payload?.type === DATASET_RESOURCE_TRANSACTION_PAYLOAD_TYPE.DATASET_CREATED ||
          payload?.type === DATASET_RESOURCE_TRANSACTION_PAYLOAD_TYPE.DATASET_DELETED)
      ) {
        dispatch(baseApi.util.invalidateTags([APITags.GET_DATASET_LISTING]));
      }

      if (
        payload?.type === DATASET_RESOURCE_TRANSACTION_PAYLOAD_TYPE.DATASET_UPDATED ||
        payload?.type === DATASET_RESOURCE_TRANSACTION_PAYLOAD_TYPE.DATASET_CREATED
      ) {
        const dataset = payload.dataset;
        const eventDatasetId = data.source_id || dataset?.dataset_id;

        if (dataset && eventDatasetId) {
          const displayConfig = dataset.metadata?.display_config || [];
          const schemaColumns = dataset.metadata?.schema?.columns || [];

          const userSchemaColumns = schemaColumns.filter((col) => !SYSTEM_COLUMNS.includes(col?.name || ''));
          const displayConfigMap = new Map(displayConfig.map((dc) => [dc.column.toLowerCase(), dc]));

          try {
            const existingConfig = getColumnConfigForDataset(eventDatasetId) as Record<string, unknown> | null;

            if (existingConfig) {
              const existingColumns =
                (
                  existingConfig as {
                    columns?: Array<{ colId: string; columnName: string; width: number; isVisible: boolean }>;
                  }
                )?.columns || [];

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

              const newColumns = userSchemaColumns.map((schemaCol) => {
                const beColumnId = schemaCol.name;
                const displayConfigEntry = displayConfigMap.get(beColumnId.toLowerCase());

                const displayName =
                  displayConfigEntry?.alias ||
                  beColumnId.charAt(0).toUpperCase() + beColumnId.slice(1).replace(/_/g, ' ');

                const normalizedBeId = beColumnId.toLowerCase().trim();
                const existingByName = existingSettingsByName.get(normalizedBeId);
                const existingById = existingSettingsById.get(beColumnId);
                const existingSettings = existingByName || existingById;

                const isHiddenFromConfig = displayConfigEntry?.is_hidden ?? false;

                return {
                  colId: beColumnId,
                  columnName: displayName,
                  columnType: mapSchemaTypeToColumnType(schemaCol.type),
                  isVisible: existingSettings?.isVisible ?? !isHiddenFromConfig,
                  width: existingSettings?.width ?? 150,
                  isRequired: !schemaCol.nullable,
                  defaultValue: schemaCol.default ?? null,
                };
              });

              // Sort by original order: lookup by name first, then by column ID (handles renamed columns)
              newColumns.sort((a, b) => {
                const orderA =
                  existingSettingsByName.get(a.colId.toLowerCase())?.order ??
                  existingSettingsById.get(a.colId)?.order ??
                  999;
                const orderB =
                  existingSettingsByName.get(b.colId.toLowerCase())?.order ??
                  existingSettingsById.get(b.colId)?.order ??
                  999;

                return orderA - orderB;
              });

              // Append FE-only columns not yet in backend
              const FE_TEMP_ID_PATTERN = /^col_\d+_/;
              const beColumnIds = new Set(newColumns.map((c: { colId: string }) => c.colId.toLowerCase()));
              const beColumnNamesNormalized = new Set(
                newColumns.map((c: { colId: string }) => c.colId.toLowerCase().trim()),
              );
              const feOnlyColumns = existingColumns
                .filter((col: { colId: string; columnName: string }) => {
                  if (!FE_TEMP_ID_PATTERN.test(col.colId)) return false;
                  if (beColumnIds.has(col.colId.toLowerCase())) return false;
                  const normalizedName = col.columnName?.toLowerCase().trim().replace(/\s+/g, '_');

                  if (normalizedName && beColumnNamesNormalized.has(normalizedName)) return false;

                  return true;
                })
                .map(
                  (col: {
                    colId: string;
                    columnName: string;
                    width: number;
                    isVisible: boolean;
                    columnType?: string;
                    isRequired?: boolean;
                    defaultValue?: string | null;
                  }) => ({
                    colId: col.colId,
                    columnName: col.columnName,
                    columnType: mapSchemaTypeToColumnType(col.columnType || 'TEXT'),
                    isVisible: col.isVisible,
                    width: col.width,
                    isRequired: col.isRequired || false,
                    defaultValue: col.defaultValue ?? null,
                  }),
                );

              if (feOnlyColumns.length > 0) {
                newColumns.push(...feOnlyColumns);
              }

              setColumnConfigForDataset(eventDatasetId, {
                dataset_name: dataset.title,
                dataset_unique_key_name: dataset.table_name || '',
                columns: newColumns,
              });
            }
          } catch (error) {
            captureException(error, {
              tags: { source: 'useDatasetSSE', context: 'syncLocalStorageFromSSE' },
              extra: { datasetId: eventDatasetId, payloadType: payload?.type },
            });
          }

          if (datasetId && eventDatasetId === datasetId) {
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

            if (onColumnsUpdated) {
              onColumnsUpdated(schemaColumns);
            }
          }
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
