'use client';

import { cn } from '@zamp-platform/ui/utils';
import { AnimatePresence, motion } from 'framer-motion';
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
    <div
      className={cn(
        'bg-BG_WHITE border-GRAY_400 flex h-[54px] items-center justify-between gap-x-3 border-b p-3',
        className,
      )}
      style={style}
    >
      <div className='flex min-w-0 flex-1 items-center gap-x-1'>
        <span className='relative block min-w-0 overflow-hidden pr-1 pl-1.5'>
          <AnimatePresence mode='wait' initial={false}>
            <motion.span
              key={displayTitle}
              className='f-14-550 block truncate first-letter:uppercase'
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } }}
              exit={{ opacity: 0, y: -4, transition: { duration: 0.1, ease: 'easeIn' } }}
            >
              {displayTitle}
            </motion.span>
          </AnimatePresence>
        </span>
        {canEdit && (
          <ConversationActions
            conversationId={conversationId ?? ''}
            organizationId={organizationId ?? ''}
            conversationTitle={displayTitle}
            onRenameSuccess={handleRenameSuccess}
            onDeleteSuccess={onDeleteConversation}
            triggerClassName='rounded p-1.5 text-gray-900 hover:text-gray-900'
          />
        )}
      </div>
      <div className='flex items-center gap-1.5'>
        {isAdmin && conversationId && <ShareConversationPopup conversationId={conversationId} avoidCollisions />}
      </div>
    </div>
  );
};

export default ChatTopbar;
