'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ResourceType } from '@zamp-platform/chat';
import { useInfiniteScroll } from '@zamp-platform/tanstack-table';
import { MessagesSquare } from 'lucide-react';
import { useGetConversationHistoryQuery } from '@/apis/pace';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { useAppSelector } from '@/hooks/toolkit';
import ChatHistoryItem from '@/modules/pace/components/chat/ChatHistoryItem';
import ChatHistorySkeleton from '@/modules/pace/components/loaders/ChatHistorySkeleton';
import type { RootState } from '@/store';
import type { FeedbackItemType } from '@/types/api/feedbacks.types';

const PAGE_SIZE = 20;

interface ChatHistoryProps {
  onSelectConversation: (id: string | null) => void;
}

const ChatHistory = ({ onSelectConversation }: ChatHistoryProps) => {
  const organizationId = useAppSelector((state: RootState) => state?.user?.user?.orgs?.[0]?.organization_id) ?? '';
  const [page, setPage] = useState(1);
  const [allConversations, setAllConversations] = useState<FeedbackItemType[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    data: conversationHistory,
    isLoading: isLoadingConversationHistory,
    isError: isErrorConversationHistory,
    isUninitialized: isUninitializedConversationHistory,
    isFetching: isFetchingConversationHistory,
    refetch: refetchConversationHistory,
  } = useGetConversationHistoryQuery(
    {
      resourceType: ResourceType.ORGANIZATION,
      resourceId: organizationId,
      page,
      limit: PAGE_SIZE,
    },
    {
      skip: !organizationId,
      refetchOnMountOrArgChange: false,
    },
  );

  const conversations = useMemo(() => conversationHistory?.conversations ?? [], [conversationHistory]);
  const totalCount = useMemo(() => conversationHistory?.count ?? 0, [conversationHistory]);
  const displayConversations = useMemo(
    () => (allConversations.length > 0 ? allConversations : conversations),
    [allConversations, conversations],
  );

  const fetchNextPage = useCallback(() => {
    if (!isFetchingConversationHistory && displayConversations.length < totalCount) {
      setPage((prev) => prev + 1);
    }
  }, [isFetchingConversationHistory, displayConversations.length, totalCount]);

  const { fetchMoreOnBottomReached } = useInfiniteScroll({
    fetchNextPage,
    isFetching: isFetchingConversationHistory,
    totalFetched: displayConversations.length,
    totalRowCount: totalCount,
    hasDataSource: !!organizationId,
    threshold: 500,
  });

  const handleScroll = useCallback(() => {
    fetchMoreOnBottomReached(containerRef.current);
  }, [fetchMoreOnBottomReached]);

  const handleRefetch = useCallback(() => {
    setPage(1);
    setAllConversations([]);
    refetchConversationHistory();
  }, [refetchConversationHistory]);

  useEffect(() => {
    if (conversations?.length > 0) {
      if (page === 1) {
        setAllConversations(conversations);
      } else {
        setAllConversations((prev) => {
          const existingIds = new Set(prev.map((c) => c.id));
          const newConversations = conversations.filter((c) => !existingIds.has(c.id));

          return [...prev, ...newConversations];
        });
      }
    }
  }, [conversations, page]);

  return (
    <div className='mx-auto flex min-h-0 w-full flex-1 flex-col bg-white pt-4'>
      <div className='flex items-center justify-between p-3'>
        <p className='f-14-550 text-gray-1000'>Chat History</p>
      </div>
      <CommonWrapper
        isLoading={(isLoadingConversationHistory || isUninitializedConversationHistory) && page === 1}
        skeletonType={SkeletonTypes.CUSTOM}
        loader={<ChatHistorySkeleton />}
        refetchFunction={handleRefetch}
        isError={isErrorConversationHistory}
        isNoData={displayConversations.length === 0 && !isLoadingConversationHistory}
        noDataBanner={
          <div className='flex h-full flex-col items-center justify-center py-12 text-center'>
            <MessagesSquare size={48} className='mb-4 text-gray-300' />
            <p className='f-14-500 text-gray-600'>No conversations found</p>
            <p className='f-13-400 mt-1 text-gray-400'>Start a new chat to begin</p>
          </div>
        }
        className='h-full w-full pb-4'
      >
        <div ref={containerRef} className='h-full overflow-y-auto [scrollbar-width:none]' onScroll={handleScroll}>
          <div className='space-y-0.5'>
            {displayConversations.map((conversation) => (
              <ChatHistoryItem key={conversation?.id} conversation={conversation} onSelect={onSelectConversation} />
            ))}
          </div>
          {isFetchingConversationHistory && page > 1 && <ChatHistorySkeleton itemCount={10} />}
        </div>
      </CommonWrapper>
    </div>
  );
};

export default ChatHistory;
