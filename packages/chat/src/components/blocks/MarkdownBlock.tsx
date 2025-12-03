'use client';

import Link from 'next/link';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

interface MarkdownBlockProps {
  payload: {
    text: string;
  };
}

export const MarkdownBlock: React.FC<MarkdownBlockProps> = ({ payload }) => {
  return (
    <div className='prose prose-sm f-13-450 text-gray-1000 max-w-none' data-testid='markdown-block'>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        components={{
          a: ({ href, ...props }) => {
            if (!href) return null;
            return (
              <Link href={href} className='text-blue-700'>
                {props.children}
              </Link>
            );
          },
        }}
      >
        {payload.text}
      </ReactMarkdown>
    </div>
  );
};
