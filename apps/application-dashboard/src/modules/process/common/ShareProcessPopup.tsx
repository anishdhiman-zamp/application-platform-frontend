import { FC } from 'react';
import { processConfig, ResourceType, ShareResourcePopup } from '@/modules/shareResource';
import { PERMISSION_ROLES } from '@/utils/accessPermission/accessPermission.types';

/**
 * ShareActivityPopup component
 * Wrapper around the shared ShareResourcePopup component with activity-specific configuration
 */

type ShareProcessProps = {
  processId: string;
};

const ShareProcessPopup: FC<ShareProcessProps> = ({ processId }) => {
  return (
    <ShareResourcePopup
      resourceId={processId}
      resourceType={ResourceType.PROCESS}
      resourceConfig={processConfig}
      resourceAdminPrivilege={PERMISSION_ROLES.ADMIN}
    />
  );
};

export default ShareProcessPopup;
