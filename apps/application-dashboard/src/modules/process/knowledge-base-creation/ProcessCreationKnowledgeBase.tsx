'use client';

import { useCallback, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { captureException } from '@sentry/nextjs';
import { toast } from '@zamp-platform/ui';
import { useParams } from 'next/navigation';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { useGetProcessesQuery } from '@/apis/pages';
import { useGetKnowledgeBaseQuery } from '@/apis/processes';
import { KB_TOAST_MESSAGES } from '@/components/common/toast/toast.constants';

const ProcessCreationKnowledgeBase = () => {
  const params = useParams();
  const processId = params?.processId as string;
  const [markdownContent, setMarkdownContent] = useState<string>('');

  const { data: processes } = useGetProcessesQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });
  const { data } = useGetKnowledgeBaseQuery({ processId });

  const processName = processes?.find((process) => process.id === processId)?.display_name ?? '';

  const getMarkdownContent = useCallback(async () => {
    if (!data?.content_signed_url) return;
    try {
      const response = await fetch(data.content_signed_url);

      if (!response.ok) {
        setMarkdownContent('');
        toast.error(KB_TOAST_MESSAGES.FAILED_FETCHING_KNOWLEDGE_BASE);

        return;
      }
      const content = await response.text();

      setMarkdownContent(content);
    } catch (error) {
      setMarkdownContent('');
      captureException(error);
      toast.error(KB_TOAST_MESSAGES.FAILED_FETCHING_KNOWLEDGE_BASE);
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
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>
            {markdownContent}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default ProcessCreationKnowledgeBase;
