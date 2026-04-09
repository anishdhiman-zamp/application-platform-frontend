import { appConfig, ResourceType, ShareResourcePopup, ShareResourceVersion } from '@/modules/shareResource';
import { PERMISSION_ROLES } from '@/utils/accessPermission/accessPermission.types';

interface ShareAppPopupProps {
  appId: string;
}

const ShareAppPopup = ({ appId }: ShareAppPopupProps) => {
  return (
    <ShareResourcePopup
      resourceId={appId}
      resourceType={ResourceType.APP}
      resourceConfig={appConfig}
      resourceAdminPrivilege={PERMISSION_ROLES.ADMIN}
      version={ShareResourceVersion.V2}
    />
  );
};

export default ShareAppPopup;
