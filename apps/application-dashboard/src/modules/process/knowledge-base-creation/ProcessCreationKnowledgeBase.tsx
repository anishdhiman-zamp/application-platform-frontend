'use client';

import { FC, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { captureException } from '@sentry/nextjs';
import { toast } from '@zamp-platform/ui';
import { BaseEventPayload, EVENT_TYPE } from '@zamp-platform/utils/event-bus/event-bus.types';
import ProcessEmptyState from 'modules/process/activity-runs/components/ProcessEmptyState';
import MarkdownContent from 'modules/process/knowledge-base-creation/components/MarkdownContent';
import MarkdownSkeleton from 'modules/process/knowledge-base-creation/components/MarkdownSkeleton';
import { KNOWLEDGE_BASE_SSE_TYPES } from 'modules/process/knowledge-base-creation/sop-creation.constants';
import dynamic from 'next/dynamic';
import { useGetKnowledgeBaseQuery } from '@/apis/processes';
import { useEventBus } from '@/app/_providers/sse-provider';
import { KB_TOAST_MESSAGES } from '@/components/common/toast/toast.constants';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { NEEDS_ATTENTION_EMPTY_STATE } from '@/constants/icons';
import { useAppSelector } from '@/hooks/toolkit';
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
}

const ProcessCreationKnowledgeBase: FC<ProcessCreationKnowledgeBaseProps> = ({
  processId,
  processName,
  onChatSubmit = defaultFn,
  isChatbotExpanded,
  isDisabled,
}) => {
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [inputValue, setInputValue] = useState<string>('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const { sseEventBus } = useEventBus();
  const { isSidebarOpen } = useAppSelector((state) => state.layoutConfig);
  const fetchedUrlRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);

  const { data, isLoading: isLoadingKnowledgeBase } = useGetKnowledgeBaseQuery({ processId });

  // Extract base path from signed URL for comparison (removes query params like signature/expiry)
  const getUrlBasePath = useCallback((url: string) => {
    try {
      const urlObj = new URL(url);

      return urlObj.origin + urlObj.pathname;
    } catch {
      return url;
    }
  }, []);

  const getMarkdownContent = useCallback(
    async (url?: string, forceRefetch = false) => {
      const targetUrl = url || data?.content_signed_url;

      if (!targetUrl) {
        setIsLoading(false);

        return;
      }

      // Prevent concurrent fetches
      if (isFetchingRef.current) {
        return;
      }

      const targetBasePath = getUrlBasePath(targetUrl);

      // Skip if we've already fetched this content (unless forced by SSE update)
      // Compare base paths since signed URLs change but path stays same for same content
      if (!forceRefetch && fetchedUrlRef.current === targetBasePath) {
        return;
      }

      try {
        isFetchingRef.current = true;
        setIsLoading(true);
        const response = await fetch(targetUrl);

        if (!response.ok) {
          setMarkdownContent('');
          toast.error(KB_TOAST_MESSAGES.FAILED_FETCHING_KNOWLEDGE_BASE);
          isFetchingRef.current = false;

          return;
        }
        const content = await response.text();

        fetchedUrlRef.current = targetBasePath;
        setMarkdownContent(content);
        setIsLoading(false);
        isFetchingRef.current = false;
      } catch (error) {
        setMarkdownContent('');
        captureException(error);
        toast.error(KB_TOAST_MESSAGES.FAILED_FETCHING_KNOWLEDGE_BASE);
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    },
    [data?.content_signed_url, getUrlBasePath],
  );

  // Reset the fetched URL ref when processId changes
  useEffect(() => {
    fetchedUrlRef.current = null;
  }, [processId]);

  useEffect(() => {
    if (!data?.content_signed_url) return;

    getMarkdownContent();
  }, [data?.content_signed_url, getMarkdownContent]);

  useEffect(() => {
    const sub = sseEventBus.subscribe(EVENT_TYPE.KNOWLEDGE_BASE, (data: BaseEventPayload) => {
      const payload = data?.payload as MapAny;

      if (data?.source_id !== processId) return;

      if (payload?.type === KNOWLEDGE_BASE_SSE_TYPES.KNOWLEDGE_BASE_UPDATED) {
        const url = payload?.content_signed_url;

        // Force refetch when SSE update comes in
        getMarkdownContent(url, true);
      }
    });

    return () => {
      sub.unsubscribe();
    };
  }, [sseEventBus, processId, getMarkdownContent]);

  return (
    <div>
      <div className='kb-create h-full max-h-[calc(100vh-60px)] overflow-y-auto px-8 py-10 pb-20'>
        <div className='m-auto max-w-[800px]'>
          {!!processName && <div className='f-26-550 border-GRAY_400 pb-4'>{processName}</div>}
          <CommonWrapper
            isLoading={isLoading || !processName || isLoadingKnowledgeBase}
            skeletonType={SkeletonTypes.CUSTOM}
            isNoData={!markdownContent}
            loader={<MarkdownSkeleton />}
            noDataBanner={
              <ProcessEmptyState
                title='No process defined yet'
                description='Start teaching Pace your workflow and watch it come to life.'
                iconUrl={NEEDS_ATTENTION_EMPTY_STATE}
              />
            }
          >
            <Suspense fallback={<MarkdownSkeleton />}>
              <MarkdownContent content={markdownContent} />
            </Suspense>
          </CommonWrapper>
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
    </div>
  );
};

export default ProcessCreationKnowledgeBase;
