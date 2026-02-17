'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { captureException } from '@sentry/nextjs';
import { SSEEventType, useLazyGetOutputFileDownloadQuery } from '@zamp-platform/chat';
import { toast } from '@zamp-platform/ui';
import { BaseEventPayload, EVENT_TYPE } from '@zamp-platform/utils/event-bus/event-bus.types';
import {
  getCachedContent,
  hasContentChanged,
  isEmptyStateCacheExpired,
  setCachedContent,
  setCachedEmptyState,
} from '@zamp-platform/utils/indexeddb-cache';
import { SOP_CREATION_FILENAME } from 'modules/process/knowledge-base-creation/sop-creation.constants';
import { useGetKnowledgeBaseQuery } from '@/apis/processes';
import { useEventBus } from '@/app/_providers/sse-provider';
import { KB_TOAST_MESSAGES } from '@/components/common/toast/toast.constants';
import { MapAny } from '@/types/commonTypes';

interface UseKnowledgeBaseContentParams {
  processId: string;
  conversationId?: string;
  initialSopFilename?: string;
  isKnowledgeBaseCreated?: boolean;
}

interface UseKnowledgeBaseContentReturn {
  markdownContent: string;
  isLoading: boolean;
  isKnownEmptyState: boolean;
  hasNon404Error: boolean;
  refetch: () => void;
}

interface FetchState {
  fetchedUrl: string | null;
  isFetching: boolean;
  hasCacheBeenChecked: boolean;
  hasReceivedSSEUpdate: boolean;
}

const CACHE_KEY_PREFIX = 'kb-content-';

/**
 * Custom hook to manage knowledge base content fetching, caching, and SSE updates
 * Implements stale-while-revalidate pattern for optimal UX
 */
export const useKnowledgeBaseContent = ({
  processId,
  conversationId,
  initialSopFilename,
  isKnowledgeBaseCreated = false,
}: UseKnowledgeBaseContentParams): UseKnowledgeBaseContentReturn => {
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isKnownEmptyState, setIsKnownEmptyState] = useState(false);

  const fetchStateRef = useRef<FetchState>({
    fetchedUrl: null,
    isFetching: false,
    hasCacheBeenChecked: false,
    hasReceivedSSEUpdate: false,
  });

  const { sseEventBus } = useEventBus();
  const [getOutputFileDownload] = useLazyGetOutputFileDownloadQuery();

  const {
    data: knowledgeBaseData,
    isError: isKnowledgeBaseError,
    error: knowledgeBaseError,
    refetch: refetchKnowledgeBase,
  } = useGetKnowledgeBaseQuery({ processId }, { skip: !processId || !isKnowledgeBaseCreated });

  const cacheKey = `${CACHE_KEY_PREFIX}${processId}`;

  // Determine if error is a 404 (zero state)
  const is404Error =
    isKnowledgeBaseError &&
    knowledgeBaseError &&
    typeof knowledgeBaseError === 'object' &&
    'status' in knowledgeBaseError &&
    knowledgeBaseError.status === 404;

  // Determine if there's a non-404 error (actual error to show)
  const hasNon404Error =
    isKnowledgeBaseError &&
    knowledgeBaseError &&
    typeof knowledgeBaseError === 'object' &&
    'status' in knowledgeBaseError &&
    knowledgeBaseError.status !== 404;

  /**
   * Fetches markdown content from a URL with caching support
   */
  const fetchMarkdownContent = useCallback(
    async (url?: string, forceRefetch = false) => {
      const targetUrl = url || knowledgeBaseData?.content_signed_url;

      if (!targetUrl) {
        setIsLoading(false);

        return;
      }

      // Prevent concurrent fetches
      if (fetchStateRef.current.isFetching) {
        setIsLoading(true);

        return;
      }

      // Skip if already fetched this URL (unless forced)
      if (!forceRefetch && fetchStateRef.current.fetchedUrl === targetUrl) {
        return;
      }

      const hasCachedContent = markdownContent.length > 0;

      try {
        fetchStateRef.current.isFetching = true;

        // Only show loader if no cached content
        if (!hasCachedContent) {
          setIsLoading(true);
        }

        const response = await fetch(targetUrl);

        if (!response.ok) {
          handleFetchError(hasCachedContent);

          return;
        }

        const content = await response.text();

        fetchStateRef.current.fetchedUrl = targetUrl;

        await updateContentWithCache(content, forceRefetch);
      } catch (error) {
        handleFetchError(hasCachedContent, error);
      } finally {
        fetchStateRef.current.isFetching = false;
        setIsLoading(false);
      }
    },
    [knowledgeBaseData?.content_signed_url, markdownContent.length, cacheKey],
  );

  /**
   * Handles fetch errors gracefully
   */
  const handleFetchError = (hasCachedContent: boolean, error?: unknown) => {
    if (!hasCachedContent) {
      setMarkdownContent('');
    }
    if (error) {
      captureException(error);
    }
    toast.error(KB_TOAST_MESSAGES.FAILED_FETCHING_KNOWLEDGE_BASE);
    fetchStateRef.current.isFetching = false;
    setIsLoading(false);
  };

  /**
   * Updates content and cache based on whether it's a forced refresh
   */
  const updateContentWithCache = async (content: string, forceRefetch: boolean) => {
    if (forceRefetch) {
      setMarkdownContent(content);
      await setCachedContent(cacheKey, content);
    } else {
      const cached = await getCachedContent(cacheKey);

      if (hasContentChanged(cached, content)) {
        setMarkdownContent(content);
        await setCachedContent(cacheKey, content);
      }
    }
  };

  /**
   * Fetches download URL and content for a specific file
   */
  const fetchFileContent = useCallback(
    async (filename: string, forceRefetch = false) => {
      if (!conversationId || !filename) return;

      try {
        const res = await getOutputFileDownload({ conversationId, filename }).unwrap();

        if (res?.download_url) {
          if (forceRefetch) {
            fetchStateRef.current.hasReceivedSSEUpdate = true;
            setIsKnownEmptyState(false);
          }
          await fetchMarkdownContent(res.download_url, forceRefetch);
        }
      } catch (error) {
        console.error('Failed to fetch download URL:', error);
        setIsLoading(false);
      }
    },
    [conversationId, getOutputFileDownload, fetchMarkdownContent],
  );

  // Load cached content when processId changes
  useEffect(() => {
    // Reset state for new process
    fetchStateRef.current = {
      fetchedUrl: null,
      isFetching: false,
      hasCacheBeenChecked: false,
      hasReceivedSSEUpdate: false,
    };
    setMarkdownContent('');
    setIsLoading(true);
    setIsKnownEmptyState(false);

    const loadCachedContent = async () => {
      const cached = await getCachedContent(cacheKey);

      if (cached?.isEmpty && !isEmptyStateCacheExpired(cached)) {
        // Cached empty state - show zero state immediately
        setIsKnownEmptyState(true);
        setIsLoading(false);
      } else if (cached?.content) {
        setMarkdownContent(cached.content);
        setIsLoading(false);
      }

      fetchStateRef.current.hasCacheBeenChecked = true;
    };

    loadCachedContent();
  }, [cacheKey]);

  // Handle API response and errors
  useEffect(() => {
    if (isKnowledgeBaseError) {
      setIsLoading(false);

      // Cache empty state on 404 (unless SSE update in progress)
      if (is404Error && !fetchStateRef.current.hasReceivedSSEUpdate) {
        setIsKnownEmptyState(true);
        setCachedEmptyState(cacheKey);
      }

      return;
    }

    if (!knowledgeBaseData?.content_signed_url) return;

    // Content available - clear empty state
    fetchStateRef.current.hasReceivedSSEUpdate = false;
    setIsKnownEmptyState(false);
    fetchMarkdownContent();
  }, [knowledgeBaseData?.content_signed_url, isKnowledgeBaseError, is404Error, cacheKey, fetchMarkdownContent]);

  // Fetch initial SOP file if provided
  useEffect(() => {
    if (!initialSopFilename || !conversationId) {
      setIsLoading(false);

      return;
    }

    fetchFileContent(initialSopFilename, true);
  }, [initialSopFilename, conversationId, fetchFileContent]);

  // Subscribe to SSE events for real-time updates
  useEffect(() => {
    const subscription = sseEventBus.subscribe(EVENT_TYPE.CONVERSATION_V2, async (data: BaseEventPayload) => {
      const payload = data?.payload as MapAny;

      if (data?.source_id !== conversationId) return;

      if (payload?.type === SSEEventType.OUTPUT_FILES) {
        const outputFiles = payload?.message?.output_files;
        const currentSopFile = outputFiles?.find((file: MapAny) => file?.filename === SOP_CREATION_FILENAME);

        if (currentSopFile?.filename) {
          await fetchFileContent(currentSopFile.filename, true);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [sseEventBus, conversationId, fetchFileContent]);

  return {
    markdownContent,
    isLoading,
    isKnownEmptyState,
    hasNon404Error,
    refetch: refetchKnowledgeBase,
  };
};
