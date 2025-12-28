'use client';

import { FC, useCallback, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { captureException } from '@sentry/nextjs';
import { toast } from '@zamp-platform/ui';
import { BaseEventPayload, EVENT_TYPE } from '@zamp-platform/utils/event-bus/event-bus.types';
import ProcessEmptyState from 'modules/process/activity-runs/components/ProcessEmptyState';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { useGetKnowledgeBaseQuery } from '@/apis/processes';
import { useEventBus } from '@/app/_providers/sse-provider';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { KB_TOAST_MESSAGES } from '@/components/common/toast/toast.constants';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { NEEDS_ATTENTION_EMPTY_STATE, ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { useAppSelector } from '@/hooks/toolkit';
import KbChatInput from '@/modules/knowledge-based/chatbot/KbChatInput';
import { defaultFn, MapAny } from '@/types/commonTypes';
import { cn } from '@/utils/common';

interface ProcessCreationKnowledgeBaseProps {
  processId: string;
  processName: string;
  onChatSubmit?: (message: string) => void;
  isChatbotExpanded?: boolean;
}

const ProcessCreationKnowledgeBase: FC<ProcessCreationKnowledgeBaseProps> = ({
  processId,
  processName,
  onChatSubmit = defaultFn,
  isChatbotExpanded,
}) => {
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [inputValue, setInputValue] = useState<string>('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const { sseEventBus } = useEventBus();
  const { isSidebarOpen } = useAppSelector((state) => state.layoutConfig);

  const { data, isLoading: isLoadingKnowledgeBase } = useGetKnowledgeBaseQuery({ processId });

  const getMarkdownContent = useCallback(
    async (url?: string) => {
      setIsLoading(true);
      if (!url && !data?.content_signed_url) {
        setIsLoading(false);

        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(url || data?.content_signed_url || '');

        if (!response.ok) {
          setMarkdownContent('');
          toast.error(KB_TOAST_MESSAGES.FAILED_FETCHING_KNOWLEDGE_BASE);

          return;
        }
        const content = await response.text();

        setMarkdownContent(content);
        setIsLoading(false);
      } catch (error) {
        setMarkdownContent('');
        captureException(error);
        toast.error(KB_TOAST_MESSAGES.FAILED_FETCHING_KNOWLEDGE_BASE);
        setIsLoading(false);
      }
    },
    [data?.content_signed_url],
  );

  useEffect(() => {
    getMarkdownContent();
  }, [data, getMarkdownContent]);

  useEffect(() => {
    const sub = sseEventBus.subscribe(EVENT_TYPE.KNOWLEDGE_BASE, (data: BaseEventPayload) => {
      const payload = data?.payload as MapAny;

      if (data?.source_id !== processId) return;

      if (payload?.type === 'knowledge_base_updated') {
        const url = payload?.content_signed_url;

        getMarkdownContent(url);
      }
    });

    return () => {
      sub.unsubscribe();
    };
  }, [sseEventBus, processId]);

  return (
    <div>
      <div className='kb-create h-full max-h-[calc(100vh-60px)] overflow-y-auto px-8 py-6 pb-20'>
        <div className='m-auto max-w-[800px]'>
          {!!processName && <div className='f-18-500 border-GRAY_400 border-b pb-4'>{processName}</div>}
          <CommonWrapper
            isLoading={isLoading || !processName || isLoadingKnowledgeBase}
            skeletonType={SkeletonTypes.CUSTOM}
            isNoData={!markdownContent}
            loader={
              <div className='flex h-full min-h-[calc(100vh-88px)] w-full items-center justify-center'>
                <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={240} height={240} className='rounded-tl-xl' />
              </div>
            }
            noDataBanner={
              <ProcessEmptyState
                title='No process defined yet'
                description='Start teaching Pace your workflow and watch it come to life.'
                iconUrl={NEEDS_ATTENTION_EMPTY_STATE}
              />
            }
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>
              {markdownContent}
            </ReactMarkdown>
          </CommonWrapper>
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
                  'w-[336px]': !isInputFocused && inputValue.length === 0,
                })}
                inputValue={inputValue}
                setInputValue={setInputValue}
                textWrapperClassName='flex pt-0 items-end'
                textAreaClassName='!pt-4 pb-4 !min-h-[26px]'
                placeholderClassName='!top-4'
                sendButtonClassName='!p-3'
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessCreationKnowledgeBase;
