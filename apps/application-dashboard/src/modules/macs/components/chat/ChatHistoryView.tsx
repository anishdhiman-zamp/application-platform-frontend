'use client';

import { useMemo, useState } from 'react';
import { ResourceType } from '@zamp-platform/chat';
import { Button, Input } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { MessagesSquare, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGetConversationHistoryQuery } from '@/apis/macs';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { ROUTES_PATH } from '@/constants/routeConfig';
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
  contentClassName?: string;
  onConversationClick?: (conversationId: string) => void;
}

const ChatHistoryView = ({ className, contentClassName, onConversationClick }: ChatHistoryViewProps) => {
  const organizationId = useAppSelector((state: RootState) => state?.user?.user?.orgs?.[0]?.organization_id) ?? '';
  const { setShowHistoryView } = useMacsContext();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const {
    data: conversationHistory,
    isLoading: isLoadingConversationHistory,
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
    onConversationClick?.(conversation?.id);
    setShowHistoryView(false);
    router.replace(`${ROUTES_PATH.MACS}?conversationId=${conversation?.id}`);
  };

  return (
    <div className={cn('mx-auto flex min-h-0 w-full flex-1 flex-col bg-white pt-4', className)}>
      <div className='flex items-center justify-between p-3'>
        <p className='f-14-550 text-gray-1000'>Chat History</p>
        <Button
          variant='ghost'
          size='icon'
          className='text-gray-1000 h-6 w-6 px-2 py-1'
          onClick={() => setShowSearch(!showSearch)}
        >
          <Search size={12} />
        </Button>
      </div>
      {showSearch && (
        <div className='mt-4 px-3 pb-4'>
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
        isLoading={isLoadingConversationHistory}
        skeletonType={SkeletonTypes.CUSTOM}
        loader={<ChatHistorySkeleton />}
        refetchFunction={refetchConversationHistory}
        isError={isErrorConversationHistory}
        isNoData={filteredConversations.length === 0}
        noDataBanner={
          <div className='flex flex-col items-center justify-center py-12 text-center'>
            <MessagesSquare size={48} className='mb-4 text-gray-300' />
            <p className='f-14-500 text-gray-600'>No conversations found</p>
            <p className='f-13-400 mt-1 text-gray-400'>Start a new chat to begin</p>
          </div>
        }
        className={cn('h-full w-full overflow-y-auto pb-4 [scrollbar-width:none]', contentClassName)}
      >
        <div className='space-y-0.5'>
          {filteredConversations.map((conversation) => (
            <ChatHistoryItem key={conversation.id} conversation={conversation} onClick={handleConversationClick} />
          ))}
        </div>
      </CommonWrapper>
    </div>
  );
};

export default ChatHistoryView;
