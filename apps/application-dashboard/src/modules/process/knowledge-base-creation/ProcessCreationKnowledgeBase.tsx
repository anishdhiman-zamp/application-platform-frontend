'use client';

import { FC, Suspense, useCallback, useEffect, useRef, useState } from 'react';
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
import ProcessEmptyState from 'modules/process/activity-runs/components/ProcessEmptyState';
import { MarkdownContentSkeleton } from 'modules/process/knowledge-base-creation/components/KnowledgeBaseContentSkeleton';
import MarkdownContent from 'modules/process/knowledge-base-creation/components/MarkdownContent';
import KnowledgeBaseConfig from 'modules/process/knowledge-base-creation/KnowldgeBaseConfig';
import { SOP_CREATION_FILENAME } from 'modules/process/knowledge-base-creation/sop-creation.constants';
import dynamic from 'next/dynamic';
import { useEventBus } from '@/app/_providers/sse-provider';
import { KB_TOAST_MESSAGES } from '@/components/common/toast/toast.constants';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { FEATURE_FLAGS } from '@/constants/featureFlags';
import { NEEDS_ATTENTION_EMPTY_STATE } from '@/constants/icons';
import { useAppSelector } from '@/hooks/toolkit';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { IntegrationType } from '@/modules/integrations/types/integrations.types';
import PaceIcon from '@/modules/knowledge-based/icons/PaceIcon';
import { defaultFn, MapAny } from '@/types/commonTypes';
import { cn } from '@/utils/common';

// Lazy load chat input - not needed for initial paint
const KbChatInput = dynamic(() => import('@/modules/knowledge-based/chatbot/KbChatInput'), {
  ssr: false,
});

interface ProcessCreationKnowledgeBaseProps {
  processId: string;
  processName: string;
  onChatSubmit?: (message: string) => void;
  isChatbotExpanded?: boolean;
  isDisabled?: boolean;
  integrations: IntegrationType[];
  initialSopFilename?: string;
  conversationId?: string;
}

const ProcessCreationKnowledgeBase: FC<ProcessCreationKnowledgeBaseProps> = ({
  processId,
  processName,
  onChatSubmit = defaultFn,
  isChatbotExpanded,
  isDisabled,
  integrations,
  initialSopFilename,
  conversationId,
}) => {
  const fetchedUrlRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);
  const hasCacheBeenCheckedRef = useRef(false);
  const hasReceivedSSEUpdateRef = useRef(false);

  const { isSidebarOpen } = useAppSelector((state) => state.layoutConfig);
  const { isEnabled: isKnowledgeBaseConfigEnabled } = useFeatureFlag(FEATURE_FLAGS.ZAMP_INTERNAL);
  const [getOutputFileDownload, { error, isError }] = useLazyGetOutputFileDownloadQuery();

  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [isKnownEmptyState, setIsKnownEmptyState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [inputValue, setInputValue] = useState<string>('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const { sseEventBus } = useEventBus();

  // Cache key based on processId
  const cacheKey = `kb-content-${processId}`;

  const getMarkdownContent = useCallback(async (url?: string, forceRefetch = false) => {
    const targetUrl = url;

    if (!targetUrl) {
      setIsLoading(false);

      return;
    }

    // Prevent concurrent fetches
    if (isFetchingRef.current) {
      setIsLoading(true);

      return;
    }

    // Skip if we've already fetched this content (unless forced by SSE update)
    // Compare base paths since signed URLs change but path stays same for same content
    if (!forceRefetch && fetchedUrlRef.current === targetUrl) {
      return;
    }
    // If we have cached content, fetch in background without showing loader
    const hasCachedContent = markdownContent.length > 0;

    try {
      isFetchingRef.current = true;

      // Only show loader if we don't have cached content
      if (!hasCachedContent) {
        setIsLoading(true);
      }

      const response = await fetch(targetUrl);

      if (!response.ok) {
        // Only clear content if we don't have cached version
        if (!hasCachedContent) {
          setMarkdownContent('');
        }
        toast.error(KB_TOAST_MESSAGES.FAILED_FETCHING_KNOWLEDGE_BASE);
        setIsLoading(false);
        isFetchingRef.current = false;
        setIsLoading(false);

        return;
      }
      const content = await response.text();

      fetchedUrlRef.current = targetUrl;

      // When forceRefetch is true (e.g., SSE update), always update content
      // Otherwise, check if content has changed before updating
      if (forceRefetch) {
        setMarkdownContent(content);
        await setCachedContent(cacheKey, content);
      } else {
        const cached = await getCachedContent(cacheKey);

        if (hasContentChanged(cached, content)) {
          setMarkdownContent(content);
          // Update cache with new content
          await setCachedContent(cacheKey, content);
        }
      }

      setIsLoading(false);
      isFetchingRef.current = false;
    } catch (fetchError) {
      // Only clear content if we don't have cached version
      if (!hasCachedContent) {
        setMarkdownContent('');
      }
      captureException(fetchError);
      toast.error(KB_TOAST_MESSAGES.FAILED_FETCHING_KNOWLEDGE_BASE);
      isFetchingRef.current = false;
    }
  }, []);

  // Check if error is a 404 (zero state - no knowledge base exists yet)
  const is404Error = isError && error && 'status' in error && error.status === 404;

  useEffect(() => {
    if (isError) {
      setIsLoading(false);

      // Cache zero state when we get a 404 error
      // But skip if we've received an SSE update (refetch is in progress)
      if (is404Error && !hasReceivedSSEUpdateRef.current) {
        setIsKnownEmptyState(true);
        setCachedEmptyState(cacheKey);
      }
    }
    if (!initialSopFilename) return;

    // We have content now, so it's not an empty state anymore
    // Also clear the SSE update flag since refetch completed successfully
    hasReceivedSSEUpdateRef.current = false;
    setIsKnownEmptyState(false);
    getMarkdownContent();
  }, [initialSopFilename, getMarkdownContent, isError, is404Error, cacheKey]);

  useEffect(() => {
    if (!initialSopFilename || !conversationId) {
      setIsLoading(false);

      return;
    }

    const fetchInitialSop = async () => {
      try {
        const res = await getOutputFileDownload({ conversationId, filename: initialSopFilename }).unwrap();

        if (res?.download_url) {
          getMarkdownContent(res.download_url, true);
        }
      } catch (error) {
        console.error('Failed to fetch initial SOP download URL:', error);
        setIsLoading(false);
      }
    };

    fetchInitialSop();
  }, [initialSopFilename, conversationId, getOutputFileDownload, getMarkdownContent]);

  // Load cached content when processId changes (includes initial mount)
  useEffect(() => {
    // Reset refs for new process
    fetchedUrlRef.current = null;
    hasCacheBeenCheckedRef.current = false;
    hasReceivedSSEUpdateRef.current = false;

    // Reset state for new process
    setMarkdownContent('');
    setIsLoading(true);
    setIsKnownEmptyState(false);

    // Load cache for processId
    const loadCachedContent = async () => {
      const cached = await getCachedContent(cacheKey);

      if (cached?.isEmpty && !isEmptyStateCacheExpired(cached)) {
        // Cached empty state (404) - show zero state immediately without loader
        // Skip if expired to allow re-checking for newly created content
        setIsKnownEmptyState(true);
        setIsLoading(false);
        // Will revalidate in background to check if content now exists
      } else if (cached?.content) {
        setMarkdownContent(cached.content);
        setIsLoading(false);
        // Will revalidate in background when URL is available
      }
      hasCacheBeenCheckedRef.current = true;
    };

    loadCachedContent();
  }, [cacheKey]);

  useEffect(() => {
    const sub = sseEventBus.subscribe(EVENT_TYPE.CONVERSATION_V2, async (data: BaseEventPayload) => {
      const payload = data?.payload as MapAny;

      if (data?.source_id !== conversationId) return;

      if (payload?.type === SSEEventType.OUTPUT_FILES) {
        const outputFiles = payload?.message?.output_files;

        const currentSopFile = outputFiles?.find((file: MapAny) => file?.filename === SOP_CREATION_FILENAME);

        if (currentSopFile && currentSopFile.filename && conversationId) {
          try {
            const res = await getOutputFileDownload({ conversationId, filename: currentSopFile.filename }).unwrap();

            if (res?.download_url) {
              hasReceivedSSEUpdateRef.current = true;
              setIsKnownEmptyState(false);
              getMarkdownContent(res.download_url, true);
            }
          } catch (error) {
            console.error('Failed to fetch download URL:', error);
          }
        }
      }
    });

    return () => {
      sub.unsubscribe();
    };
  }, [sseEventBus, conversationId, getMarkdownContent]);

  return (
    <div>
      <div className='kb-create h-full max-h-[calc(100vh-60px)] overflow-y-auto px-8 py-10 pb-20'>
        <div className='m-auto max-w-[800px]'>
          <CommonWrapper
            skeletonType={SkeletonTypes.CUSTOM}
            isNoData={(!markdownContent && !isLoading) || isKnownEmptyState}
            isError={error && 'status' in error && error.status !== 404}
            noDataBanner={
              <ProcessEmptyState
                title=''
                description='Start teaching Pace your workflow and watch it come to life.'
                iconUrl={NEEDS_ATTENTION_EMPTY_STATE}
              />
            }
          >
            <div
              className={cn({
                'animate-pulse': isLoading,
              })}
            >
              {markdownContent && <div className='f-26-550 border-GRAY_400 pb-4'>{processName}</div>}
              {isKnowledgeBaseConfigEnabled && <KnowledgeBaseConfig integrations={integrations} />}
              <Suspense fallback={<MarkdownContentSkeleton />}>
                <MarkdownContent content={markdownContent} />
              </Suspense>
            </div>
          </CommonWrapper>
        </div>

        {!isDisabled && (
          <div
            className={cn('fixed right-0 bottom-0 z-1000 m-auto w-full transition-opacity duration-400', {
              'opacity-100': !isChatbotExpanded,
              'pointer-events-none opacity-0': isChatbotExpanded,
              'w-[calc(100vw-241px)]': isSidebarOpen,
              'w-full': !isSidebarOpen,
            })}
          >
            <div className='bg-gradient-to-transparent w-full pb-6'>
              <KbChatInput
                onSubmit={onChatSubmit}
                className={cn('mx-auto w-full transition-all duration-400', {
                  'w-[672px]': isInputFocused || inputValue.length > 0,
                  'w-[436px]': !isInputFocused && inputValue.length === 0,
                })}
                inputValue={inputValue}
                setInputValue={setInputValue}
                textWrapperClassName='flex pt-0 items-end'
                textAreaClassName='!pt-3 pb-3 !min-h-[26px]'
                placeholderClassName='!top-4'
                sendButtonClassName='!p-3'
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                placeholder={
                  <div className='-mt-1 flex items-center gap-1'>
                    Ask away or give feedback to
                    <PaceIcon height={12} width={12} />
                    Pace
                  </div>
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessCreationKnowledgeBase;
