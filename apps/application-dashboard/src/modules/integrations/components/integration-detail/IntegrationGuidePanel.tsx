import { type FC, useCallback, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { captureException } from '@sentry/browser';
import { toast } from '@zamp-platform/ui';
import { X } from 'lucide-react';
import { motion } from 'motion/react';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import ImageLoader from '@/components/common/loader/ImageLoader';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { getAssetUrl, ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { useScrollDetection } from '@/hooks/useScrollDetection';
import { cn } from '@/utils/common';

interface IntegrationGuidePanelProps {
  guide?: string;
  onClose: () => void;
}

const IntegrationGuidePanel: FC<IntegrationGuidePanelProps> = ({ guide, onClose }) => {
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { ref: scrollContainerRef, isScrolled } = useScrollDetection();

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
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{
        width: '30%',
        opacity: 1,
        transition: {
          width: { duration: 0.25, ease: 'easeOut' },
          opacity: { duration: 0.2, delay: 0.25, ease: 'easeOut' },
        },
      }}
      exit={{
        width: 0,
        opacity: 0,
        transition: {
          opacity: { duration: 0.15, ease: 'easeOut' },
          width: { duration: 0.25, delay: 0.1, ease: 'easeInOut' },
        },
      }}
      className='border-GRAY_400 flex h-full flex-shrink-0 flex-col overflow-hidden border-l bg-white'
    >
      <div className={cn('flex items-center justify-between px-12 py-5', isScrolled && 'border-GRAY_400 border-b')}>
        <span className='f-13-450 text-GRAY_600'>Connection guide</span>

        <X width={16} height={16} onClick={onClose} className='text-GRAY_700 hover:text-GRAY_700 cursor-pointer' />
      </div>
      <CommonWrapper
        className='flex-1 overflow-hidden'
        loader={<ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} />}
        skeletonType={SkeletonTypes.CUSTOM}
        isLoading={isLoading}
      >
        <div
          ref={scrollContainerRef}
          className='markdown-body prose prose-sm h-full max-w-none overflow-y-auto px-12 py-4'
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>
            {markdownContent}
          </ReactMarkdown>
        </div>
      </CommonWrapper>
    </motion.div>
  );
};

export default IntegrationGuidePanel;
