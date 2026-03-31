'use client';

import ReactMarkdown from 'react-markdown';
import { MarkdownBlock } from '@zamp-platform/chat';
import { cn } from '@zamp-platform/ui/utils';
import remarkGfm from 'remark-gfm';

const SHIMMER_GRADIENT = {
  backgroundImage:
    'linear-gradient(90deg, var(--GRAY_700) 0%, var(--GRAY_700) 40%, var(--BLUE_900) 50%, var(--GRAY_700) 60%, var(--GRAY_700) 100%)',
  backgroundSize: '200% 100%',
};

const markdownComponents = {
  p: ({ children }: { children?: React.ReactNode }) => <p className='mt-3 first:mt-0'>{children}</p>,
};

interface SummaryMarkdownProps {
  text: string;
  shimmerLast: boolean;
}

const SummaryMarkdown = ({ text, shimmerLast }: SummaryMarkdownProps) => {
  if (!shimmerLast) {
    return <MarkdownBlock payload={{ text }} />;
  }

  const paragraphs = text.split(/\n\n/);
  const lastParagraph = paragraphs[paragraphs.length - 1];
  const leadingText = paragraphs.length > 1 ? paragraphs.slice(0, -1).join('\n\n') : '';

  return (
    <div className='text-[14px] leading-[1.4] font-[450]'>
      {leadingText && (
        <div className='text-GRAY_700'>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {leadingText}
          </ReactMarkdown>
        </div>
      )}
      <div
        className={cn('animate-shimmer-text bg-clip-text text-transparent', leadingText && 'mt-3')}
        style={SHIMMER_GRADIENT}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {lastParagraph}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default SummaryMarkdown;
