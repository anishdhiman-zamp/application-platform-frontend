import { type RefObject, useMemo } from 'react';
import { captureException } from '@sentry/browser';
import { toast } from '@zamp-platform/ui';
import { type AgGridReact } from 'ag-grid-react';
import { useResourceAccess } from 'hooks/useResourceAccess';
import { useGetDatasetDisplayConfigQuery, useUpdateDatasetMutation } from '@/apis/admin';
import { UPDATE_TYPE } from '@/components/common/table/CustomHeader/customHeader.types';
import { CUSTOM_COLUMNS_TYPE } from '@/components/common/table/table.types';
import { APITags } from '@/constants/api.constants';
import { HandleDisplayConfigUpdateParamsType } from '@/modules/data/data.types';
import {
  getDefaultOrderDisplayConfig,
  getUpdatedAliasDisplayConfig,
  getUpdatedDateFormatDisplayConfig,
} from '@/modules/data/data.utils';
import { DATASET_ACCESS_PRIVILEGES, ResourceType } from '@/modules/shareResource/shareResource.types';
import { UpdateDatasetRequestType } from '@/types/api/admin.types';
import { snakeCaseToSentenceCase } from '@/utils/common';

const useDisplayConfigUpdate = (tableRef: RefObject<AgGridReact | null>, datasetId: string) => {
  const { checkUserPrivilege } = useResourceAccess({
    resourceType: ResourceType.DATASET,
    resourceId: datasetId,
  });

  const isCurrentUserAdmin = useMemo(() => {
    return checkUserPrivilege(DATASET_ACCESS_PRIVILEGES.ADMIN);
  }, [checkUserPrivilege]);

  const [updateDataset] = useUpdateDatasetMutation();

  const { data: displayConfigData } = useGetDatasetDisplayConfigQuery(
    { datasetId },
    { skip: !datasetId || !isCurrentUserAdmin, refetchOnMountOrArgChange: false },
  );

  const handleUpdate = (payload: UpdateDatasetRequestType, type: UPDATE_TYPE, invalidateTags?: APITags[]) => {
    updateDataset({ ...payload, invalidateTags: invalidateTags ?? [APITags.GET_DATASET_DISPLAY_CONFIG] })
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
      display_config: getUpdatedAliasDisplayConfig(
        tableRef,
        columnId,
        value as string,
        displayConfigData?.display_config ?? [],
      ),
    };

    handleUpdate(payload, UPDATE_TYPE.ALIAS);
  };

  const handleDateFormatUpdate = ({ columnId, value }: HandleDisplayConfigUpdateParamsType) => {
    const payload = {
      datasetId,
      display_config: getUpdatedDateFormatDisplayConfig(
        tableRef,
        columnId,
        value as string,
        displayConfigData?.display_config ?? [],
      ),
    };

    handleUpdate(payload, UPDATE_TYPE.DATE_FORMAT);
  };

  const handleTypeUpdate = ({ columnId, value }: HandleDisplayConfigUpdateParamsType) => {
    const displayConfigIndex = displayConfigData?.display_config?.findIndex((item) => item.column === columnId) ?? -1;

    if (displayConfigIndex === -1) return;
    const updatedDisplayConfig =
      displayConfigData?.display_config?.map((item) => {
        if (item.column === columnId) {
          return { ...item, type: value as CUSTOM_COLUMNS_TYPE };
        }

        return item;
      }) ?? [];

    const payload = {
      datasetId,
      display_config: updatedDisplayConfig,
    };

    handleUpdate(payload, UPDATE_TYPE.TYPE, [APITags.GET_DATASET_FILTER_CONFIG, APITags.GET_DATASET_DISPLAY_CONFIG]);
  };

  const handleDefaultOrderUpdate = () => {
    const payload = {
      datasetId,
      display_config: getDefaultOrderDisplayConfig(displayConfigData?.display_config ?? [], tableRef),
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
