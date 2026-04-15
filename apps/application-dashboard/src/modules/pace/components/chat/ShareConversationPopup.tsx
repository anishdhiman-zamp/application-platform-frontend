import { type FC } from 'react';
import { conversationConfig, ResourceType, ShareResourcePopup, ShareResourceVersion } from '@/modules/shareResource';
import { PERMISSION_ROLES } from '@/utils/accessPermission/accessPermission.types';

interface ShareConversationPopupProps {
  conversationId: string;
  isAdmin: boolean;
}

const ShareConversationPopup: FC<ShareConversationPopupProps> = ({ conversationId, isAdmin }) => {
  if (!isAdmin) return null;

  return (
    <ShareResourcePopup
      resourceId={conversationId}
      resourceType={ResourceType.CONVERSATION}
      resourceConfig={conversationConfig}
      resourceAdminPrivilege={PERMISSION_ROLES.ADMIN}
      version={ShareResourceVersion.V2}
      forceAdminAccess={isAdmin}
    />
  );
};

export default ShareConversationPopup;
