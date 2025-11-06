'use client';

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
    <div className='prose prose-sm f-13-450 max-w-none' data-testid='markdown-block'>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        components={{
          a: ({ ...props }) => <a {...props} className='text-blue-700' style={{ textDecoration: 'none' }} />,
        }}
      >
        {payload.text}
      </ReactMarkdown>
    </div>
  );
};
