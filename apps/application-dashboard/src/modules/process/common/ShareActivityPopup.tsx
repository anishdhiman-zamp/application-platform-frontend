import { FC } from 'react';
import { activityConfig, ResourceType, ShareResourcePopup } from '@/modules/shareResource';
import { PERMISSION_ROLES } from '@/utils/accessPermission/accessPermission.types';

/**
 * ShareActivityPopup component
 * Wrapper around the shared ShareResourcePopup component with activity-specific configuration
 */

type ShareActivityPopupProps = {
  activityId: string;
};

const ShareActivityPopup: FC<ShareActivityPopupProps> = ({ activityId }) => {
  return (
    <ShareResourcePopup
      resourceId={activityId}
      resourceType={ResourceType.ACTIVITY}
      resourceConfig={activityConfig}
      resourceAdminPrivilege={PERMISSION_ROLES.ADMIN}
    />
  );
};

export default ShareActivityPopup;
