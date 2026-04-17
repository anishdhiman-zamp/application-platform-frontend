import { type FC } from 'react';
import { conversationConfig, ResourceType, ShareResourcePopup, ShareResourceVersion } from '@/modules/shareResource';
import { PERMISSION_ROLES } from '@/utils/accessPermission/accessPermission.types';

interface ShareConversationPopupProps {
  conversationId: string;
}

const ShareConversationPopup: FC<ShareConversationPopupProps> = ({ conversationId }) => {
  return (
    <ShareResourcePopup
      resourceId={conversationId}
      resourceType={ResourceType.CONVERSATION}
      resourceConfig={conversationConfig}
      resourceAdminPrivilege={PERMISSION_ROLES.ADMIN}
      version={ShareResourceVersion.V2}
      forceAdminAccess
    />
  );
};

export default ShareConversationPopup;
