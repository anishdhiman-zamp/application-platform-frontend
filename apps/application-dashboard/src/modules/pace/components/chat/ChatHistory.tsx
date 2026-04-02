'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ResourceType, unreadStore, useActiveStreamingIds, useUnreadConversations } from '@zamp-platform/chat';
import { useInfiniteScroll } from '@zamp-platform/tanstack-table';
import { Button, Input } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
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

const PAGE_SIZE = 30;
const SEARCH_DEBOUNCE_MS = 300;

interface ChatHistoryProps {
  onSelectConversation: (id: string | null, title?: string) => void;
  onDeleteConversation?: (id: string) => void;
  onRenameConversation?: (id: string, newTitle: string) => void;
  activeConversationId?: string | null;
  compact?: boolean;
}

const ChatHistory = ({
  onSelectConversation,
  onDeleteConversation,
  onRenameConversation,
  activeConversationId,
  compact = false,
}: ChatHistoryProps) => {
  const organizationId = useAppSelector((state: RootState) => state?.user?.user?.orgs?.[0]?.organization_id) ?? '';
  const containerRef = useRef<HTMLDivElement>(null);
  const activeStreamingIds = useActiveStreamingIds();
  const unreadIds = useUnreadConversations();

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
    },
  );

  const conversations = useMemo(() => conversationHistory?.conversations ?? [], [conversationHistory]);
  const displayConversations = useMemo(() => {
    const source = allConversations.length > 0 ? allConversations : conversations;

    return [...source].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }, [allConversations, conversations]);
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
    threshold: compact ? 100 : 500,
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
      setAllConversations((prev) => prev.filter((c) => c.id !== id));
      setTotalCount((prev) => Math.max(0, prev - 1));
      onDeleteConversation?.(id);
    },
    [onDeleteConversation],
  );

  const handleDeleteConversationFailure = useCallback((conversation: FeedbackItemType) => {
    setAllConversations((prev) => [...prev, conversation]);
    setTotalCount((prev) => prev + 1);
  }, []);

  const handleRenameConversation = useCallback(
    (id: string, newTitle: string) => {
      setAllConversations((prev) => prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c)));
      onRenameConversation?.(id, newTitle);
    },
    [onRenameConversation],
  );

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
    fetchMoreOnBottomReached(containerRef.current);
  }, [displayConversations.length]);

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
            autoFocus={compact}
            onChange={handleSearchChange}
            iconPosition='leading'
            size='small'
            className={cn('bg-BG_WHITE w-full pr-8', compact ? 'mb-0' : 'mb-1')}
            data-testid='chat-history-search-input'
          />
        )}
      </div>
      <CommonWrapper
        isLoading={
          displayConversations.length === 0 &&
          (isLoadingConversationHistory || isUninitializedConversationHistory) &&
          page === 1
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
        className='flex min-h-0 flex-1 flex-col overflow-hidden pb-2'
        disableAnimation
      >
        <div ref={containerRef} className='flex-1 overflow-y-auto [scrollbar-width:none]' onScroll={handleScroll}>
          <div className='w-full space-y-0.5 px-2'>
            {displayConversations.map((conversation) => (
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
          {isFetchingConversationHistory && page > 1 && <ChatHistorySkeleton itemCount={10} />}
        </div>
      </CommonWrapper>
    </div>
  );
};

export default ChatHistory;
