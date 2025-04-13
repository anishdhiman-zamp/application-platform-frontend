import { FC } from 'react';
import { useGetAudiencesByDatasetIdQuery, usePostShareDatasetToAudiencesByDatasetIdMutation } from 'apis/dataset';
import { datasetConfig, ResourceType, ShareResourcePopup } from 'components/common/share-resource';
import { accessPermissionForDataset } from 'utils/accessPermission/accessPermission';
import { ShareDatasetPopupPropsType } from 'modules/data/data.types';

/**
 * ShareDatasetPopup component
 * Wrapper around the shared ShareResourcePopup component with dataset-specific configuration
 */
const ShareDatasetPopup: FC<ShareDatasetPopupPropsType> = ({ datasetId }) => {
  const apiHooks = {
    useGetAudiencesQuery: useGetAudiencesByDatasetIdQuery,
    usePostShareMutation: usePostShareDatasetToAudiencesByDatasetIdMutation,
    accessPermissionFn: accessPermissionForDataset,
  };

  return (
    <ShareResourcePopup
      resourceId={datasetId}
      resourceType={ResourceType.DATASET}
      apiHooks={apiHooks}
      resourceConfig={datasetConfig}
    />
  );
};

export default ShareDatasetPopup;
