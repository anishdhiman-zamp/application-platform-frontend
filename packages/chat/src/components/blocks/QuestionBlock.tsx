'use client';

import { Button } from '@zamp-platform/ui';
import { Undo2 } from 'lucide-react';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

import { TEXT_TYPE } from '../../types/block.types';

interface QuestionBlockProps {
  payload: {
    type: TEXT_TYPE;
    question: string;
  };
}

export const QuestionBlock: React.FC<QuestionBlockProps> = ({ payload }) => {
  return (
    <div className='flex items-start justify-between gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
      <div className='f-14-450 flex-1 text-gray-900'>
        {payload.type === 'markdown' ? (
          <div className='prose prose-sm max-w-none'>
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>
              {payload.question}
            </ReactMarkdown>
          </div>
        ) : (
          payload.question
        )}
      </div>
      <Button
        variant='ghost'
        size='icon'
        className='flex-shrink-0 text-gray-400 hover:text-gray-600'
        aria-label='Reply to question'
      >
        <Undo2 className='h-5 w-5' />
      </Button>
    </div>
  );
};
