import { ResourceType } from '@zamp-platform/chat';
import { Button } from '@zamp-platform/ui';
import { MessagesSquare, Trash2 } from 'lucide-react';
import { findTimeDifference } from 'modules/data/data.utils';
import { useGetConversationHistoryQuery } from '@/apis/macs';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { useAppSelector } from '@/hooks/toolkit';
import { ChatHistorySkeleton } from '@/modules/macs/components/loaders';
import type { RootState } from '@/store';
import type { FeedbackItemType } from '@/types/api/feedbacks.types';

interface ChatHistoryItemProps {
  conversation: FeedbackItemType;
  onClick?: (conversation: FeedbackItemType) => void;
  onDelete?: (conversation: FeedbackItemType) => void;
}

const ChatHistoryItem = ({ conversation, onClick, onDelete }: ChatHistoryItemProps) => {
  const handleClick = () => {
    onClick?.(conversation);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(conversation);
  };

  return (
    <div className='group relative'>
      <Button
        variant='ghost'
        onClick={handleClick}
        className='h-auto w-full items-start justify-start gap-2.5 rounded-lg px-3 hover:bg-gray-50'
      >
        <div className='mt-0.5 flex-shrink-0'>
          <MessagesSquare size={12} className='text-gray-500' />
        </div>
        <div className='min-w-0 flex-1 text-left'>
          <p className='f-13-500 text-gray-1000 line-clamp-1'>{conversation?.title || 'Untitled conversation'}</p>
          <div className='mt-0.5 flex items-center gap-1.5'>
            <p className='f-11-450 text-gray-600'>{findTimeDifference(conversation?.created_at)}</p>
            <div className='h-[2px] w-[2px] rounded-full bg-gray-600'></div>
            <p className='f-11-450 text-gray-600'>{conversation?.initiated_by}</p>
          </div>
        </div>
      </Button>
      <Button
        variant='ghost'
        size='icon'
        onClick={handleDelete}
        className='absolute top-1/2 right-2 h-7 w-7 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100'
        aria-label='Delete conversation'
      >
        <Trash2 size={14} className='text-gray-500 hover:text-red-500' />
      </Button>
    </div>
  );
};

const ChatHistory = () => {
  const organizationId = useAppSelector((state: RootState) => state?.user?.user?.orgs?.[0]?.organization_id) ?? '';

  const {
    data: conversationHistory,
    isFetching: isFetchingConversationHistory,
    isError: isErrorConversationHistory,
    refetch: refetchConversationHistory,
  } = useGetConversationHistoryQuery(
    {
      resourceType: ResourceType.ORGANIZATION,
      resourceId: organizationId,
    },
    {
      skip: !organizationId,
    },
  );

  // TODO: Remove fallback to DUMMY_CONVERSATIONS once API is working
  const conversations = conversationHistory?.conversations ?? [];

  const handleConversationClick = (conversation: FeedbackItemType) => {
    // TODO: Implement navigation to conversation
    console.log('Conversation clicked:', conversation.conversation_id);
  };

  const handleConversationDelete = (conversation: FeedbackItemType) => {
    // TODO: Implement delete conversation API call
    console.log('Delete conversation:', conversation.conversation_id);
  };

  if (conversations.length === 0 && !isFetchingConversationHistory && !isErrorConversationHistory) {
    return null;
  }

  return (
    <CommonWrapper
      isLoading={isFetchingConversationHistory}
      skeletonType={SkeletonTypes.CUSTOM}
      loader={<ChatHistorySkeleton />}
      refetchFunction={refetchConversationHistory}
      isError={isErrorConversationHistory}
      className='w-full max-w-[700px]'
    >
      <div className='f-11-550 text-GRAY_700 px-3 py-2'>Recent</div>
      <div className='space-y-0.5'>
        {conversations.map((conversation) => (
          <ChatHistoryItem
            key={conversation.id}
            conversation={conversation}
            onClick={handleConversationClick}
            onDelete={handleConversationDelete}
          />
        ))}
      </div>
    </CommonWrapper>
  );
};

export default ChatHistory;
