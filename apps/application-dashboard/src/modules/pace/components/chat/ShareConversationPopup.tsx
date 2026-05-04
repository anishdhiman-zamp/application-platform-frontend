import { type FC } from 'react';
import { Button, TooltipV2 } from '@zamp-platform/ui';
import { Share2 } from 'lucide-react';
import { conversationConfig, ResourceType, ShareResourcePopup, ShareResourceVersion } from '@/modules/shareResource';
import { PERMISSION_ROLES } from '@/utils/accessPermission/accessPermission.types';

interface ShareConversationPopupProps {
  conversationId: string;
  avoidCollisions?: boolean;
}

const ShareConversationPopup: FC<ShareConversationPopupProps> = ({ conversationId, avoidCollisions }) => {
  return (
    <TooltipV2 tooltipBody='Share' asChildTrigger>
      <span className='inline-flex'>
        <ShareResourcePopup
          resourceId={conversationId}
          resourceType={ResourceType.CONVERSATION}
          resourceConfig={conversationConfig}
          resourceAdminPrivilege={PERMISSION_ROLES.ADMIN}
          version={ShareResourceVersion.V2}
          forceAdminAccess
          avoidCollisions={avoidCollisions}
          customTrigger={
            <Button
              size='icon'
              variant='ghost'
              id='share-conversation-to-audience-btn'
              aria-label='Share conversation'
              className='text-GRAY_700 hover:text-GRAY_1000 h-7 w-7 p-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
            >
              <Share2 className='h-3.5 w-3.5' />
            </Button>
          }
        />
      </span>
    </TooltipV2>
  );
};

export default ShareConversationPopup;
