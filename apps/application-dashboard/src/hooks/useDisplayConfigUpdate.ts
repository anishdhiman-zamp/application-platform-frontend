import { type RefObject, useMemo } from 'react';
import { captureException } from '@sentry/browser';
import { useResource } from '@zamp-platform/battalion';
import { toast } from '@zamp-platform/ui';
import { type AgGridReact } from 'ag-grid-react';
import { useUpdateDatasetMutation } from '@/apis/dataset';
import type { Dataset } from '@/app/(authenticated)/resources';
import { UPDATE_TYPE } from '@/components/common/table/CustomHeader/customHeader.types';
import { CUSTOM_COLUMNS_TYPE } from '@/components/common/table/table.types';
import { APITags } from '@/constants/api.constants';
import { HandleDisplayConfigUpdateParamsType } from '@/modules/data/data.types';
import {
  getDefaultOrderDisplayConfig,
  getUpdatedAliasDisplayConfig,
  getUpdatedDateFormatDisplayConfig,
} from '@/modules/data/data.utils';
import type { DatasetMetadataType } from '@/types/api/dataset.types';
import { DisplayConfigType, UpdateDatasetRequestType } from '@/types/api/dataset.types';
import { snakeCaseToSentenceCase } from '@/utils/common';

const useDisplayConfigUpdate = (tableRef: RefObject<AgGridReact | null>, datasetId: string) => {
  const [updateDataset] = useUpdateDatasetMutation();

  const { data: datasets } = useResource<Dataset>('Dataset');
  const currentDataset = datasets?.find((d) => d.id === datasetId);
  const displayConfig = useMemo<DisplayConfigType[] | undefined>(() => {
    const metadata = currentDataset?.metadata as DatasetMetadataType | undefined;

    return metadata?.display_config?.map(({ column, alias, is_hidden, is_editable, type, config }) => ({
      column,
      alias: alias ?? undefined,
      is_hidden,
      is_editable,
      type: (type as CUSTOM_COLUMNS_TYPE) ?? undefined,
      config: config ?? undefined,
    }));
  }, [currentDataset?.metadata]);

  const handleUpdate = (payload: UpdateDatasetRequestType, type: UPDATE_TYPE, invalidateTags?: APITags[]) => {
    updateDataset({ ...payload, invalidateTags: invalidateTags ?? [APITags.GET_DATASET_LISTING] })
      .then(() => {
        toast.success(`${snakeCaseToSentenceCase(type)} updated successfully`);
      })
      .catch((err) => {
        captureException(err);
        toast.error(`${snakeCaseToSentenceCase(type)} update failed`);
      });
  };

  const handleAliasUpdate = ({ columnId, value }: HandleDisplayConfigUpdateParamsType) => {
    const payload = {
      datasetId,
      display_config: getUpdatedAliasDisplayConfig(tableRef, columnId, value as string, displayConfig ?? []),
    };

    handleUpdate(payload, UPDATE_TYPE.ALIAS);
  };

  const handleDateFormatUpdate = ({ columnId, value }: HandleDisplayConfigUpdateParamsType) => {
    const payload = {
      datasetId,
      display_config: getUpdatedDateFormatDisplayConfig(tableRef, columnId, value as string, displayConfig ?? []),
    };

    handleUpdate(payload, UPDATE_TYPE.DATE_FORMAT);
  };

  const handleTypeUpdate = ({ columnId, value }: HandleDisplayConfigUpdateParamsType) => {
    const displayConfigIndex = displayConfig?.findIndex((item) => item.column === columnId) ?? -1;

    if (displayConfigIndex === -1) return;
    const updatedDisplayConfig =
      displayConfig?.map((item) => {
        if (item.column === columnId) {
          return { ...item, type: value as CUSTOM_COLUMNS_TYPE };
        }

        return item;
      }) ?? [];

    const payload = {
      datasetId,
      display_config: updatedDisplayConfig,
    };

    handleUpdate(payload, UPDATE_TYPE.TYPE, [APITags.GET_DATASET_FILTER_CONFIG, APITags.GET_DATASET_LISTING]);
  };

  const handleDefaultOrderUpdate = () => {
    const payload = {
      datasetId,
      display_config: getDefaultOrderDisplayConfig(displayConfig ?? [], tableRef),
    };

    handleUpdate(payload, UPDATE_TYPE.DEFAULT_ORDER);
  };

  return {
    handleAliasUpdate,
    handleDateFormatUpdate,
    handleTypeUpdate,
    handleDefaultOrderUpdate,
  };
};

export default useDisplayConfigUpdate;
