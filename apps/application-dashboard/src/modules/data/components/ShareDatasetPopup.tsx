import { FC } from 'react';
import { ShareDatasetPopupPropsType } from 'modules/data/data.types';
import { datasetConfig, ResourceType, ShareResourcePopup } from '@/modules/shareResource';
import { PERMISSION_ROLES } from '@/utils/accessPermission/accessPermission.types';

/**
 * ShareDatasetPopup component
 * Wrapper around the shared ShareResourcePopup component with dataset-specific configuration
 */
const ShareDatasetPopup: FC<ShareDatasetPopupPropsType> = ({ datasetId }) => {
  return (
    <ShareResourcePopup
      resourceId={datasetId}
      resourceType={ResourceType.DATASET}
      resourceConfig={datasetConfig}
      resourceAdminPrivilege={PERMISSION_ROLES.ADMIN}
    />
  );
};

export default ShareDatasetPopup;
