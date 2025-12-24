'use client';

import { FC, useCallback, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { captureException } from '@sentry/nextjs';
import { toast } from '@zamp-platform/ui';
import ProcessEmptyState from 'modules/process/activity-runs/components/ProcessEmptyState';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { useGetKnowledgeBaseQuery } from '@/apis/processes';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { KB_TOAST_MESSAGES } from '@/components/common/toast/toast.constants';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { NEEDS_ATTENTION_EMPTY_STATE, ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';

interface ProcessCreationKnowledgeBaseProps {
  processId: string;
  processName: string;
}

const ProcessCreationKnowledgeBase: FC<ProcessCreationKnowledgeBaseProps> = ({ processId, processName }) => {
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const { data, isLoading: isLoadingKnowledgeBase } = useGetKnowledgeBaseQuery({ processId });

  const getMarkdownContent = useCallback(async () => {
    setIsLoading(true);
    if (!data?.content_signed_url) {
      setIsLoading(false);

      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(data.content_signed_url);

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
  }, [data?.content_signed_url]);

  useEffect(() => {
    getMarkdownContent();
  }, [data, getMarkdownContent]);

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
        </div>
      </div>
    </div>
  );
};

export default ProcessCreationKnowledgeBase;
