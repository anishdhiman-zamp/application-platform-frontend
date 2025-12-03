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
  // Convert single newlines to markdown hard breaks (two spaces + newline)
  // This preserves line breaks that users enter with shift+enter
  const processedText = payload.text.replace(/\n/g, '  \n');

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
        {processedText}
      </ReactMarkdown>
    </div>
  );
};
