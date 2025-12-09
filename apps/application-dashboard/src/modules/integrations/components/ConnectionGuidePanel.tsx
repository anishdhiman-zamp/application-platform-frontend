'use client';

import { type FC, useCallback, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { captureException } from '@sentry/browser';
import { Button, toast } from '@zamp-platform/ui';
import { X } from 'lucide-react';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import ImageLoader from '@/components/common/loader/ImageLoader';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { getAssetUrl, ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import type { defaultFnType } from '@/types/commonTypes';

interface ConnectionGuidePanelProps {
  guide?: string;
  onClose: defaultFnType;
}

const ConnectionGuidePanel: FC<ConnectionGuidePanelProps> = ({ guide, onClose }) => {
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getMarkdownContent = useCallback(async () => {
    if (!guide) {
      setIsLoading(false);

      return;
    }

    try {
      setIsLoading(true);
      const guideUrl = getAssetUrl(guide);
      const response = await fetch(guideUrl);

      if (!response.ok) {
        throw new Error('Failed to fetch guide');
      }

      const content = await response.text();

      setMarkdownContent(content);
    } catch (error) {
      setMarkdownContent('');
      captureException(error);
      toast.error('Failed to load guide');
    } finally {
      setIsLoading(false);
    }
  }, [guide]);

  useEffect(() => {
    getMarkdownContent();
  }, [guide, getMarkdownContent]);

  return (
    <div className='flex h-full flex-1 flex-col overflow-hidden bg-white'>
      {/* Close button */}
      <div className='flex shrink-0 justify-end px-4 pt-6'>
        <Button variant='ghost' size='icon' onClick={onClose} className='text-GRAY_700 hover:text-GRAY_900 h-7 w-7'>
          <X width={18} height={18} />
        </Button>
      </div>

      <CommonWrapper
        className='flex-1 overflow-hidden'
        loader={<ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={100} height={100} />}
        skeletonType={SkeletonTypes.CUSTOM}
        isLoading={isLoading}
      >
        <div className='markdown-body prose prose-sm h-full max-w-none overflow-y-auto px-12 pb-6'>
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>
            {markdownContent}
          </ReactMarkdown>
        </div>
      </CommonWrapper>
    </div>
  );
};

export default ConnectionGuidePanel;
