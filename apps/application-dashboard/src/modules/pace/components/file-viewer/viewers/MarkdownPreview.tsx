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
      <div className='text-GRAY_950 mx-auto max-w-[1080px] p-6 text-sm leading-[1.667] font-[420] wrap-break-word'>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSlug]}
          components={{
            h1: ({ children }) => (
              <h1 className='text-GRAY_1000 mt-9 mb-4 text-2xl leading-[1.4] font-semibold tracking-[-0.02em] first:mt-2'>
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className='text-GRAY_1000 mt-7 mb-3 text-[19px] leading-[1.4] font-semibold tracking-[-0.015em] first:mt-0'>
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className='text-GRAY_1000 mt-5 mb-2.5 text-base leading-[1.4] font-semibold tracking-[-0.01em] first:mt-0'>
                {children}
              </h3>
            ),
            p: ({ children }) => <p className='mt-3 first:mt-0'>{children}</p>,
            ul: ({ children }) => <ul className='mt-3 list-disc pl-5 first:mt-0'>{children}</ul>,
            ol: ({ children }) => <ol className='mt-3 list-decimal pl-7 first:mt-0'>{children}</ol>,
            li: ({ children }) => <li className='mt-2 first:mt-0'>{children}</li>,
            hr: () => <hr className='bg-GRAY_300 my-8 h-px border-none' />,
            strong: ({ children }) => <strong className='text-GRAY_1000 font-semibold'>{children}</strong>,
            blockquote: ({ children }) => (
              <blockquote className='border-GRAY_300 text-GRAY_900 mt-4 border-l-2 pl-4 first:mt-0'>
                {children}
              </blockquote>
            ),
            pre: ({ children }) => <>{children}</>,
            table: ({ children }) => (
              <div className='mt-4 overflow-x-auto pb-3 first:mt-0'>
                <table className='text-GRAY_950 w-full border-collapse text-[13px] font-[420]'>{children}</table>
              </div>
            ),
            thead: ({ children }) => <thead>{children}</thead>,
            th: ({ children }) => (
              <th className='text-GRAY_900 border-GRAY_300 border-b pt-1 pr-4 pb-2 text-left text-[11px] font-semibold tracking-[0.04em] uppercase'>
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className='text-GRAY_950 border-GRAY_300 border-b py-2.5 pr-4 leading-normal'>{children}</td>
            ),
            code: ({ className: codeClassName, children, ...props }) => {
              const isInline = !codeClassName && !String(children).includes('\n');

              if (isInline) {
                return (
                  <code className='bg-PINK_100 text-PINK_600 rounded-[3px] px-1 py-0.5 font-mono text-xs font-normal'>
                    {children}
                  </code>
                );
              }

              return (
                <pre className='bg-GRAY_100 border-GRAY_300 mt-5 overflow-x-auto rounded-lg border px-5 py-4 first:mt-0'>
                  <code className='text-GRAY_1000 font-mono text-[13px] leading-normal font-normal' {...props}>
                    {children}
                  </code>
                </pre>
              );
            },
            a: ({ href, children }) => {
              if (!href) return <>{children}</>;

              return (
                <Link
                  href={href}
                  target='_blank'
                  className='text-BLUE_700 decoration-BLUE_700 underline underline-offset-2'
                >
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
