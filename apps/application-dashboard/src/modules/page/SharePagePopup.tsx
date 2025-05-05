import { FC } from 'react';
import { pageConfig, ResourceType, ShareResourcePopup } from '@/modules/shareResource';
import { PERMISSION_ROLES } from '@/utils/accessPermission/accessPermission.types';

/**
 * SharePagePopup component
 * Wrapper around the shared ShareResourcePopup component with page-specific configuration
 */

type SharePagePopupProps = {
  pageId: string;
};

const SharePagePopup: FC<SharePagePopupProps> = ({ pageId }) => {
  return (
    <ShareResourcePopup
      resourceId={pageId}
      resourceType={ResourceType.PAGE}
      resourceConfig={pageConfig}
      resourceAdminPrivilege={PERMISSION_ROLES.ADMIN}
    />
  );
};

export default SharePagePopup;
