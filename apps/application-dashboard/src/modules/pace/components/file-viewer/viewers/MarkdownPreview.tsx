'use client';

import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@zamp-platform/ui/utils';
import Link from 'next/link';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

const MarkdownPreview = memo(({ content, className = '' }: MarkdownPreviewProps) => {
  return (
    <div className={cn('animate-opacity h-full w-full overflow-auto', className)}>
      <div className='prose prose-sm max-w-none p-6'>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSlug]}
          components={{
            a: ({ href, children }) => {
              if (!href) return null;

              return (
                <Link href={href} className='text-blue-700'>
                  {children}
                </Link>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
});

MarkdownPreview.displayName = 'MarkdownPreview';

export default MarkdownPreview;
