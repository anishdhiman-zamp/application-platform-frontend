import { FC } from 'react';
import { datasetConfig, ResourceType, ShareResourcePopup } from '@/modules/shareResource';
import { PERMISSION_ROLES } from '@/utils/accessPermission/accessPermission.types';

/**
 * ShareDatasetPopup component
 * Wrapper around the shared ShareResourcePopup component with dataset-specific configuration
 */

type ShareDatasetPopupProps = {
  datasetId: string;
};

const ShareDatasetPopup: FC<ShareDatasetPopupProps> = ({ datasetId }) => {
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
