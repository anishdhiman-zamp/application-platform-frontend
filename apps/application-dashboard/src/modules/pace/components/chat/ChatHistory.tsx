'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ResourceType } from '@zamp-platform/chat';
import { useInfiniteScroll } from '@zamp-platform/tanstack-table';
import { Button, Input } from '@zamp-platform/ui';
import { Search } from 'lucide-react';
import { useGetConversationHistoryQuery } from '@/apis/pace';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { useDebounce } from '@/hooks';
import { useAppSelector } from '@/hooks/toolkit';
import ChatHistoryItem from '@/modules/pace/components/chat/ChatHistoryItem';
import ChatHistorySkeleton from '@/modules/pace/components/loaders/ChatHistorySkeleton';
import EmptyStateListing from '@/modules/team/components/EmptyStateListing';
import type { RootState } from '@/store';
import type { FeedbackItemType } from '@/types/api/feedbacks.types';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

interface ChatHistoryProps {
  onSelectConversation: (id: string | null, title?: string) => void;
}

const ChatHistory = ({ onSelectConversation }: ChatHistoryProps) => {
  const organizationId = useAppSelector((state: RootState) => state?.user?.user?.orgs?.[0]?.organization_id) ?? '';
  const containerRef = useRef<HTMLDivElement>(null);

  const [page, setPage] = useState(1);
  const [allConversations, setAllConversations] = useState<FeedbackItemType[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, SEARCH_DEBOUNCE_MS);

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
      search: debouncedSearch || undefined,
    },
    {
      skip: !organizationId,
      refetchOnMountOrArgChange: false,
    },
  );

  const conversations = useMemo(() => conversationHistory?.conversations ?? [], [conversationHistory]);
  const displayConversations = useMemo(
    () => (allConversations.length > 0 ? allConversations : conversations),
    [allConversations, conversations],
  );
  const hasMore = allConversations.length < totalCount;

  const fetchNextPage = useCallback(() => {
    if (!isFetchingConversationHistory && hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [isFetchingConversationHistory, hasMore]);

  const { fetchMoreOnBottomReached } = useInfiniteScroll({
    fetchNextPage,
    isFetching: isFetchingConversationHistory,
    totalFetched: allConversations.length,
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
    setTotalCount(0);
    setSearchTerm('');
    setIsSearchOpen(false);
    refetchConversationHistory();
  }, [refetchConversationHistory]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleToggleSearch = useCallback(() => {
    setIsSearchOpen((prev) => !prev);
    if (isSearchOpen) {
      setSearchTerm('');
    }
  }, [isSearchOpen]);

  useEffect(() => {
    setPage(1);
    setAllConversations([]);
    setTotalCount(0);
  }, [debouncedSearch]);

  useEffect(() => {
    if (conversationHistory?.count !== undefined) {
      setTotalCount(conversationHistory.count);
    }
  }, [conversationHistory?.count]);

  useEffect(() => {
    if (page === 1) {
      setAllConversations(conversations);
    } else if (conversations.length > 0) {
      setAllConversations((prev) => {
        const existingIds = new Set(prev.map((c) => c.id));
        const newConversations = conversations.filter((c) => !existingIds.has(c.id));

        return [...prev, ...newConversations];
      });
    }
  }, [conversations, page]);

  return (
    <div className='mx-auto flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-white pt-4'>
      <div className='flex shrink-0 flex-col gap-4 p-3'>
        <div className='flex items-center justify-between'>
          <p className='f-14-550 text-gray-1000'>Chat History</p>
          <Button
            variant='ghost'
            size='icon'
            onClick={handleToggleSearch}
            className='h-7 w-7'
            data-testid='chat-history-search-toggle'
          >
            <Search size={16} className='text-gray-1000' />
          </Button>
        </div>
        {isSearchOpen && (
          <Input
            placeholder='Search conversations...'
            value={searchTerm}
            autoFocus
            onChange={handleSearchChange}
            iconPosition='leading'
            size='small'
            className='mb-1 w-full pr-8'
            data-testid='chat-history-search-input'
          />
        )}
      </div>
      <CommonWrapper
        isLoading={
          ((isLoadingConversationHistory || isUninitializedConversationHistory) && page === 1) ||
          (isFetchingConversationHistory && !!debouncedSearch && page === 1)
        }
        skeletonType={SkeletonTypes.CUSTOM}
        loader={<ChatHistorySkeleton />}
        refetchFunction={handleRefetch}
        isError={isErrorConversationHistory}
        isNoData={displayConversations.length === 0 && !isLoadingConversationHistory && !isFetchingConversationHistory}
        noDataBanner={
          <EmptyStateListing
            title={debouncedSearch ? 'No matching conversations' : 'No conversations found'}
            className='h-full flex-col items-center justify-center py-12 text-center'
          />
        }
        className='min-h-0 flex-1 pb-4'
        disableAnimation
      >
        <div ref={containerRef} className='h-full overflow-y-auto [scrollbar-width:thin]' onScroll={handleScroll}>
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
