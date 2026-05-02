import { type FC } from 'react';
import { Button } from '@zamp-platform/ui';
import { conversationConfig, ResourceType, ShareResourcePopup, ShareResourceVersion } from '@/modules/shareResource';
import { PERMISSION_ROLES } from '@/utils/accessPermission/accessPermission.types';

interface ShareConversationPopupProps {
  conversationId: string;
  avoidCollisions?: boolean;
}

const ShareConversationPopup: FC<ShareConversationPopupProps> = ({ conversationId, avoidCollisions }) => {
  return (
    <ShareResourcePopup
      resourceId={conversationId}
      resourceType={ResourceType.CONVERSATION}
      resourceConfig={conversationConfig}
      resourceAdminPrivilege={PERMISSION_ROLES.ADMIN}
      version={ShareResourceVersion.V2}
      forceAdminAccess
      avoidCollisions={avoidCollisions}
      customTrigger={
        <Button size='small' variant='secondary' id='share-conversation-to-audience-btn' className='h-[30px]'>
          Share
        </Button>
      }
    />
  );
};

export default ShareConversationPopup;
