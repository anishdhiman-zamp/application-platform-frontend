import { FC } from 'react';
import { connectionConfig, ResourceType, ShareResourcePopup, ShareResourceVersion } from '@/modules/shareResource';
import { PERMISSION_ROLES } from '@/utils/accessPermission/accessPermission.types';

type ShareConnectionPopupProps = {
  connectionId: string;
};

const ShareConnectionPopup: FC<ShareConnectionPopupProps> = ({ connectionId }) => {
  return (
    <ShareResourcePopup
      resourceId={connectionId}
      resourceType={ResourceType.CONNECTION}
      resourceConfig={connectionConfig}
      resourceAdminPrivilege={PERMISSION_ROLES.ADMIN}
      version={ShareResourceVersion.V2}
    />
  );
};

export default ShareConnectionPopup;
