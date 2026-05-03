'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ResourceType, unreadStore, useActiveStreamingIds, useUnreadConversations } from '@zamp-platform/chat';
import { useInfiniteScroll } from '@zamp-platform/tanstack-table';
import { Button, Input } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { ArrowRight, Plus } from 'lucide-react';
import Link from 'next/link';
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

const PAGE_SIZE = 30;
const SEARCH_DEBOUNCE_MS = 300;

interface ChatHistoryProps {
  onSelectConversation: (id: string | null, title?: string) => void;
  onStartNewChat?: () => void;
  activeConversationId?: string | null;
  compact?: boolean;
  recentLimit?: number;
  viewMoreHref?: string;
}

const ChatHistory = ({
  onSelectConversation,
  onStartNewChat,
  activeConversationId,
  compact = false,
  recentLimit,
  viewMoreHref,
}: ChatHistoryProps) => {
  const isRecentMode = typeof recentLimit === 'number';
  const queryLimit = isRecentMode ? recentLimit : PAGE_SIZE;

  const organizationId = useAppSelector((state: RootState) => state?.user?.user?.orgs?.[0]?.organization_id) ?? '';
  const containerRef = useRef<HTMLDivElement>(null);
  const activeStreamingIds = useActiveStreamingIds();
  const unreadIds = useUnreadConversations();

  const [pagination, setPagination] = useState<{
    page: number;
    totalPages: number;
    totalCount: number;
    conversations: FeedbackItemType[];
    lastMergedPage: number;
  }>({
    page: 1,
    totalPages: 0,
    totalCount: 0,
    conversations: [],
    lastMergedPage: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');

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
      page: pagination.page,
      limit: queryLimit,
      search: !isRecentMode && debouncedSearch ? debouncedSearch : undefined,
    },
    {
      skip: !organizationId,
    },
  );

  const { page, totalPages, conversations: allConversations } = pagination;
  const hasMore = !isRecentMode && totalPages > 0 && page < totalPages;
  const isInitialLoading =
    allConversations.length === 0 &&
    (isFetchingConversationHistory || isUninitializedConversationHistory) &&
    page === 1;
  const isEmptyState = allConversations.length === 0 && !isLoadingConversationHistory && !isFetchingConversationHistory;

  const resetPagination = useCallback(() => {
    setPagination({ page: 1, totalPages: 0, totalCount: 0, conversations: [], lastMergedPage: 0 });
  }, []);

  const fetchNextPage = useCallback(() => {
    if (isRecentMode) return;
    setPagination((prev) => {
      if (isFetchingConversationHistory || prev.totalPages === 0 || prev.page >= prev.totalPages) {
        return prev;
      }

      return { ...prev, page: prev.page + 1 };
    });
  }, [isFetchingConversationHistory, isRecentMode]);

  const { fetchMoreOnBottomReached } = useInfiniteScroll({
    fetchNextPage,
    isFetching: isFetchingConversationHistory,
    totalFetched: page,
    totalRowCount: hasMore ? totalPages : page,
    hasDataSource: !!organizationId && !isRecentMode,
    threshold: compact ? 100 : 500,
  });

  const handleScroll = useCallback(() => {
    if (isRecentMode) return;
    fetchMoreOnBottomReached(containerRef.current);
  }, [fetchMoreOnBottomReached, isRecentMode]);

  const handleRefetch = useCallback(() => {
    resetPagination();
    setSearchTerm('');
    refetchConversationHistory();
  }, [refetchConversationHistory, resetPagination]);

  const handleSelectConversation = useCallback(
    (id: string | null, title?: string) => {
      if (id) unreadStore.markRead(id);
      onSelectConversation(id, title);
    },
    [onSelectConversation],
  );

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleMergeFetchedPage = useCallback(() => {
    if (!conversationHistory) return;

    setPagination((prev) => {
      if (prev.lastMergedPage === prev.page) return prev;

      const fetched = conversationHistory.conversations ?? [];
      const existingIds = new Set(prev.conversations.map((c) => c.id));
      const deduped = fetched.filter((c) => !existingIds.has(c.id));

      return {
        ...prev,
        totalPages: conversationHistory.total_pages ?? prev.totalPages,
        totalCount: conversationHistory.count ?? prev.totalCount,
        conversations: prev.page === 1 ? fetched : [...prev.conversations, ...deduped],
        lastMergedPage: prev.page,
      };
    });
  }, [conversationHistory]);

  useEffect(() => {
    if (isRecentMode) return;
    resetPagination();
  }, [debouncedSearch, isRecentMode, resetPagination]);

  useEffect(() => {
    handleMergeFetchedPage();
  }, [handleMergeFetchedPage]);

  useEffect(() => {
    if (isRecentMode) return;
    fetchMoreOnBottomReached(containerRef.current);
  }, [allConversations.length, fetchMoreOnBottomReached, isRecentMode]);

  const visibleConversations = isRecentMode ? allConversations.slice(0, recentLimit) : allConversations;

  return (
    <div
      className={cn('mx-auto flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-transparent', !compact && 'pt-10')}
    >
      {!compact && (
        <div className='flex shrink-0 flex-col gap-2 px-3 pb-2'>
          <div className='flex h-6 items-center'>
            <p className='f-12-500 text-GRAY_600 pl-1 font-mono tracking-wide uppercase'>Chats</p>
          </div>
          {!isRecentMode && (
            <Input
              placeholder='Search...'
              value={searchTerm}
              onChange={handleSearchChange}
              iconPosition='leading'
              size='small'
              className='bg-BG_WHITE mb-0 w-full pr-8'
              data-testid='chat-history-search-input'
            />
          )}
        </div>
      )}
      <CommonWrapper
        isLoading={isInitialLoading}
        skeletonType={SkeletonTypes.CUSTOM}
        loader={<ChatHistorySkeleton />}
        refetchFunction={handleRefetch}
        isError={isErrorConversationHistory}
        isNoData={isEmptyState}
        noDataBanner={
          <EmptyStateListing
            title={!isRecentMode && debouncedSearch ? 'No matching conversations' : 'No conversations found'}
            className='h-full flex-col items-center justify-center py-12 text-center'
          />
        }
        className='flex min-h-0 flex-1 flex-col overflow-hidden pb-2'
        disableAnimation
      >
        <div ref={containerRef} className='flex-1 overflow-y-auto [scrollbar-width:none]' onScroll={handleScroll}>
          <div className='flex w-full flex-col gap-y-0.5 px-3'>
            {visibleConversations.map((conversation) => (
              <ChatHistoryItem
                key={conversation?.id}
                conversation={conversation}
                onSelect={handleSelectConversation}
                isStreaming={activeStreamingIds.has(conversation?.id)}
                isSelected={activeConversationId === conversation?.id}
                isUnread={unreadIds.has(conversation?.id)}
              />
            ))}
            {isRecentMode && viewMoreHref && !isEmptyState && (
              <Link
                href={viewMoreHref}
                className='text-GRAY_700 hover:text-GRAY_900 hover:bg-accent flex h-8 w-full items-center justify-between gap-x-2 rounded-lg px-2 text-sm font-medium transition-colors'
                data-testid='chat-history-view-more'
              >
                View more chats
                <ArrowRight size={14} />
              </Link>
            )}
          </div>
          {!isRecentMode && isFetchingConversationHistory && page > 1 && <ChatHistorySkeleton itemCount={PAGE_SIZE} />}
        </div>
      </CommonWrapper>
      {onStartNewChat && activeConversationId && (
        <Button
          variant='ghost'
          className='text-GRAY_700 hover:text-GRAY_1000 h-12 w-full justify-center gap-2 rounded-none border-t border-gray-200 px-2 text-sm font-medium'
          onClick={onStartNewChat}
          data-testid='chat-history-start-new'
        >
          <Plus size={16} />
          Start new chat
        </Button>
      )}
    </div>
  );
};

export default ChatHistory;
