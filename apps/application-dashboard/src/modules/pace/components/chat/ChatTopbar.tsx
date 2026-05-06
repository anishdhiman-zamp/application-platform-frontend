'use client';

import { cn } from '@zamp-platform/ui/utils';
import PageTopbar from '@/components/layouts/PageTopbar';
import { useResourceAccess } from '@/hooks/useResourceAccess';
import ConversationActions from '@/modules/pace/components/chat/ConversationActions';
import ShareConversationPopup from '@/modules/pace/components/chat/ShareConversationPopup';
import { DEFAULT_CHAT_TITLE } from '@/modules/pace/pace.constants';
import { ResourceType, ShareResourceVersion } from '@/modules/shareResource/shareResource.types';
import { PERMISSION_ROLES } from '@/utils/accessPermission/accessPermission.types';

interface ChatTopbarProps {
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  conversationId?: string | null;
  organizationId?: string;
  onTitleChange?: (newTitle: string) => void;
  onDeleteConversation?: () => void;
}

const ChatTopbar = ({
  className,
  style,
  title,
  conversationId,
  organizationId,
  onTitleChange,
  onDeleteConversation,
}: ChatTopbarProps) => {
  const displayTitle = title || DEFAULT_CHAT_TITLE;
  const { checkUserPrivilege } = useResourceAccess({
    resourceType: ResourceType.CONVERSATION,
    resourceId: conversationId ?? '',
    skipAudienceData: false,
    version: ShareResourceVersion.V2,
  });
  const isAdmin = checkUserPrivilege(PERMISSION_ROLES.ADMIN);
  const canEdit = Boolean(conversationId && organizationId);

  const handleRenameSuccess = (newTitle: string) => {
    onTitleChange?.(newTitle);
  };

  return (
    <PageTopbar
      title={displayTitle}
      className={cn(className)}
      style={style}
      titleTrailingAction={
        canEdit ? (
          <ConversationActions
            conversationId={conversationId ?? ''}
            organizationId={organizationId ?? ''}
            conversationTitle={displayTitle}
            onRenameSuccess={handleRenameSuccess}
            onDeleteSuccess={onDeleteConversation}
            triggerClassName='rounded p-1.5 text-gray-900 hover:text-gray-900'
          />
        ) : undefined
      }
      action={
        isAdmin && conversationId ? <ShareConversationPopup conversationId={conversationId} avoidCollisions /> : null
      }
    />
  );
};

export default ChatTopbar;
