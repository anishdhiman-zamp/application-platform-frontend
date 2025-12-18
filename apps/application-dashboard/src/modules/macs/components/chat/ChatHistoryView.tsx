'use client';

import { useMemo, useState } from 'react';
import { ResourceType } from '@zamp-platform/chat';
import { Button, Input } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { MessagesSquare, Search } from 'lucide-react';
import { useGetConversationHistoryQuery } from '@/apis/macs';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { useAppSelector } from '@/hooks/toolkit';
import { ChatHistorySkeleton } from '@/modules/macs/components/loaders';
import { useMacsContext } from '@/modules/macs/context/MacsContext';
import type { RootState } from '@/store';
import type { FeedbackItemType } from '@/types/api/feedbacks.types';

interface ChatHistoryItemProps {
  conversation: FeedbackItemType;
  onClick?: (conversation: FeedbackItemType) => void;
}

const ChatHistoryItem = ({ conversation, onClick }: ChatHistoryItemProps) => {
  const handleClick = () => {
    onClick?.(conversation);
  };

  return (
    <Button
      variant='ghost'
      onClick={handleClick}
      className='h-auto w-full items-center justify-between gap-2.5 rounded-lg px-3 py-2.5 hover:bg-gray-50'
    >
      <div className='flex items-center gap-2.5'>
        <MessagesSquare size={16} className='flex-shrink-0 text-gray-500' />
        <p className='f-13-500 text-gray-1000 line-clamp-1 text-left'>
          {conversation?.title || 'Untitled conversation'}
        </p>
      </div>
    </Button>
  );
};

export interface ChatHistoryViewProps {
  className?: string;
  onConversationClick?: (conversation: FeedbackItemType) => void;
}

const ChatHistoryView = ({ className, onConversationClick }: ChatHistoryViewProps) => {
  const organizationId = useAppSelector((state: RootState) => state?.user?.user?.orgs?.[0]?.organization_id) ?? '';
  const { setShowHistoryView } = useMacsContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

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

  const conversations = conversationHistory?.conversations ?? [];

  // Filter conversations based on search query
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const query = searchQuery.toLowerCase();

    return conversations.filter(
      (conv) => conv?.title?.toLowerCase().includes(query) || conv?.initiated_by?.toLowerCase().includes(query),
    );
  }, [conversations, searchQuery]);

  const handleConversationClick = (conversation: FeedbackItemType) => {
    if (onConversationClick) {
      onConversationClick(conversation);
    } else {
      // Default behavior: close history view
      console.log('Navigate to conversation:', conversation.conversation_id);
      setShowHistoryView(false);
    }
  };

  if (conversations.length === 0 && !isFetchingConversationHistory && !isErrorConversationHistory) {
    return null;
  }

  return (
    <div className={cn('mx-auto flex h-full w-full flex-col bg-white', className)}>
      {/* Content */}
      <div className='mx-auto w-full max-w-[700px] flex-1 overflow-y-auto pt-4'>
        {/* Title and Search */}
        <div className='mb-4 flex items-center justify-between p-3'>
          <h1 className='f-14-550 text-gray-1000'>Chat History</h1>
          <Button
            variant='ghost'
            size='icon'
            className='text-gray-1000 h-6 w-6 px-2 py-1'
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search size={12} />
          </Button>
        </div>
        {/* Search Input */}
        {showSearch && (
          <div className='px-3 pb-4'>
            <Input
              placeholder='Search'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='h-8'
              autoFocus
            />
          </div>
        )}

        <CommonWrapper
          isLoading={isFetchingConversationHistory}
          skeletonType={SkeletonTypes.CUSTOM}
          loader={<ChatHistorySkeleton />}
          refetchFunction={refetchConversationHistory}
          isError={isErrorConversationHistory}
          className='w-full'
        >
          {filteredConversations.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-12 text-center'>
              <MessagesSquare size={48} className='mb-4 text-gray-300' />
              <p className='f-14-500 text-gray-600'>No conversations found</p>
              <p className='f-13-400 mt-1 text-gray-400'>Start a new chat to begin</p>
            </div>
          ) : (
            <div className='space-y-0.5'>
              {filteredConversations.map((conversation) => (
                <ChatHistoryItem key={conversation.id} conversation={conversation} onClick={handleConversationClick} />
              ))}
            </div>
          )}
        </CommonWrapper>
      </div>
    </div>
  );
};

export default ChatHistoryView;
