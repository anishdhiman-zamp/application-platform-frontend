'use client';

import { useMemo, useState } from 'react';
import { ResourceType } from '@zamp-platform/chat';
import { Button, Input } from '@zamp-platform/ui';
import { MessagesSquare, Search } from 'lucide-react';
import { useGetConversationHistoryQuery } from '@/apis/macs';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { useAppSelector } from '@/hooks/toolkit';
import ChatHistoryItem from '@/modules/macs/components/chat/ChatHistoryItem';
import { ChatHistorySkeleton } from '@/modules/macs/components/loaders';
import type { RootState } from '@/store';

interface ChatHistoryProps {
  onSelectConversation: (id: string | null) => void;
}

const ChatHistory = ({ onSelectConversation }: ChatHistoryProps) => {
  const organizationId = useAppSelector((state: RootState) => state?.user?.user?.orgs?.[0]?.organization_id) ?? '';
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const {
    data: conversationHistory,
    isLoading: isLoadingConversationHistory,
    isError: isErrorConversationHistory,
    isUninitialized: isUninitializedConversationHistory,
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

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const query = searchQuery.toLowerCase();

    return conversations.filter(
      (conv) => conv?.title?.toLowerCase().includes(query) || conv?.initiated_by?.toLowerCase().includes(query),
    );
  }, [conversations, searchQuery]);

  return (
    <div className='mx-auto flex min-h-0 w-full flex-1 flex-col bg-white pt-4'>
      <div className='flex items-center justify-between p-3'>
        <p className='f-14-550 text-gray-1000'>Chat History</p>
        <Button
          variant='ghost'
          size='icon'
          className={`text-gray-1000 h-6 w-6 px-2 py-1 ${conversations.length === 0 ? 'invisible' : ''}`}
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
            className='placeholder:f-14-400 h-8'
            autoFocus
          />
        </div>
      )}
      <CommonWrapper
        isLoading={isLoadingConversationHistory || isUninitializedConversationHistory}
        skeletonType={SkeletonTypes.CUSTOM}
        loader={<ChatHistorySkeleton />}
        refetchFunction={refetchConversationHistory}
        isError={isErrorConversationHistory}
        isNoData={filteredConversations.length === 0}
        noDataBanner={
          <div className='flex h-full flex-col items-center justify-center py-12 text-center'>
            <MessagesSquare size={48} className='mb-4 text-gray-300' />
            <p className='f-14-500 text-gray-600'>No conversations found</p>
            <p className='f-13-400 mt-1 text-gray-400'>Start a new chat to begin</p>
          </div>
        }
        className='h-full w-full overflow-y-auto pb-4 [scrollbar-width:none]'
      >
        <div className='space-y-0.5'>
          {filteredConversations.map((conversation) => (
            <ChatHistoryItem key={conversation?.id} conversation={conversation} onSelect={onSelectConversation} />
          ))}
        </div>
      </CommonWrapper>
    </div>
  );
};

export default ChatHistory;
