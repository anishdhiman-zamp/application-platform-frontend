'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ResourceType, unreadStore, useActiveStreamingIds, useUnreadConversations } from '@zamp-platform/chat';
import { useInfiniteScroll } from '@zamp-platform/tanstack-table';
import { Button, Input } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { Plus, Search } from 'lucide-react';
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
  onDeleteConversation?: (id: string) => void;
  onRenameConversation?: (id: string, newTitle: string) => void;
  onStartNewChat?: () => void;
  activeConversationId?: string | null;
  compact?: boolean;
}

const ChatHistory = ({
  onSelectConversation,
  onDeleteConversation,
  onRenameConversation,
  onStartNewChat,
  activeConversationId,
  compact = false,
}: ChatHistoryProps) => {
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
      page: pagination.page,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
    },
    {
      skip: !organizationId,
    },
  );

  const { page, totalPages, conversations: allConversations } = pagination;
  const hasMore = totalPages > 0 && page < totalPages;
  const isInitialLoading =
    allConversations.length === 0 &&
    (isFetchingConversationHistory || isUninitializedConversationHistory) &&
    page === 1;
  const isEmptyState = allConversations.length === 0 && !isLoadingConversationHistory && !isFetchingConversationHistory;

  const resetPagination = useCallback(() => {
    setPagination({ page: 1, totalPages: 0, totalCount: 0, conversations: [], lastMergedPage: 0 });
  }, []);

  const fetchNextPage = useCallback(() => {
    setPagination((prev) => {
      if (isFetchingConversationHistory || prev.totalPages === 0 || prev.page >= prev.totalPages) {
        return prev;
      }

      return { ...prev, page: prev.page + 1 };
    });
  }, [isFetchingConversationHistory]);

  const { fetchMoreOnBottomReached } = useInfiniteScroll({
    fetchNextPage,
    isFetching: isFetchingConversationHistory,
    totalFetched: page,
    totalRowCount: hasMore ? totalPages : page,
    hasDataSource: !!organizationId,
    threshold: compact ? 100 : 500,
  });

  const handleScroll = useCallback(() => {
    fetchMoreOnBottomReached(containerRef.current);
  }, [fetchMoreOnBottomReached]);

  const handleRefetch = useCallback(() => {
    resetPagination();
    setSearchTerm('');
    setIsSearchOpen(false);
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

  const handleToggleSearch = useCallback(() => {
    setIsSearchOpen((prev) => !prev);
    if (isSearchOpen) {
      setSearchTerm('');
    }
  }, [isSearchOpen]);

  const handleDeleteConversation = useCallback(
    (id: string) => {
      setPagination((prev) => ({
        ...prev,
        conversations: prev.conversations.filter((c) => c.id !== id),
        totalCount: Math.max(0, prev.totalCount - 1),
      }));
      onDeleteConversation?.(id);
    },
    [onDeleteConversation],
  );

  const handleDeleteConversationFailure = useCallback((conversation: FeedbackItemType) => {
    setPagination((prev) => ({
      ...prev,
      conversations: [...prev.conversations, conversation],
      totalCount: prev.totalCount + 1,
    }));
  }, []);

  const handleRenameConversation = useCallback(
    (id: string, newTitle: string) => {
      setPagination((prev) => ({
        ...prev,
        conversations: prev.conversations.map((c) => (c.id === id ? { ...c, title: newTitle } : c)),
      }));
      onRenameConversation?.(id, newTitle);
    },
    [onRenameConversation],
  );

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
    resetPagination();
  }, [debouncedSearch, resetPagination]);

  useEffect(() => {
    handleMergeFetchedPage();
  }, [handleMergeFetchedPage]);

  useEffect(() => {
    fetchMoreOnBottomReached(containerRef.current);
  }, [allConversations.length, fetchMoreOnBottomReached]);

  return (
    <div
      className={cn('mx-auto flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-transparent', !compact && 'pt-4')}
    >
      <div className={cn('flex shrink-0 flex-col', compact ? 'gap-0 p-2' : 'gap-4 p-3')}>
        {!compact && (
          <div className='flex items-center justify-between'>
            <p className='f-14-550 text-GRAY_1000'>Chats</p>
            <Button
              variant='ghost'
              size='icon'
              onClick={handleToggleSearch}
              className='h-7 w-7'
              data-testid='chat-history-search-toggle'
            >
              <Search size={16} className='text-GRAY_700' />
            </Button>
          </div>
        )}
        {(isSearchOpen || compact) && (
          <Input
            placeholder='Search...'
            value={searchTerm}
            autoFocus
            onChange={handleSearchChange}
            iconPosition='leading'
            size='small'
            className={cn('bg-BG_WHITE w-full pr-8', compact ? 'mb-0' : 'mb-1')}
            data-testid='chat-history-search-input'
          />
        )}
      </div>
      <CommonWrapper
        isLoading={isInitialLoading}
        skeletonType={SkeletonTypes.CUSTOM}
        loader={<ChatHistorySkeleton />}
        refetchFunction={handleRefetch}
        isError={isErrorConversationHistory}
        isNoData={isEmptyState}
        noDataBanner={
          <EmptyStateListing
            title={debouncedSearch ? 'No matching conversations' : 'No conversations found'}
            className='h-full flex-col items-center justify-center py-12 text-center'
          />
        }
        className='flex min-h-0 flex-1 flex-col overflow-hidden pb-2'
        disableAnimation
      >
        <div ref={containerRef} className='flex-1 overflow-y-auto [scrollbar-width:none]' onScroll={handleScroll}>
          <div className='w-full space-y-0.5 px-2'>
            {allConversations.map((conversation) => (
              <ChatHistoryItem
                key={conversation?.id}
                conversation={conversation}
                onSelect={handleSelectConversation}
                isStreaming={activeStreamingIds.has(conversation?.id)}
                isSelected={activeConversationId === conversation?.id}
                isUnread={unreadIds.has(conversation?.id)}
                organizationId={organizationId}
                onDelete={handleDeleteConversation}
                onDeleteFailure={handleDeleteConversationFailure}
                onRename={handleRenameConversation}
              />
            ))}
          </div>
          {isFetchingConversationHistory && page > 1 && <ChatHistorySkeleton itemCount={PAGE_SIZE} />}
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
