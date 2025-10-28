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
    <div className='prose prose-sm max-w-none text-gray-900' data-testid='markdown-block'>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>
        {payload.text}
      </ReactMarkdown>
    </div>
  );
};
