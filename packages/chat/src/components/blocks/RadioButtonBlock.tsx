'use client';

import { Label } from '@zamp-platform/ui';
import { Radio, RadioGroup } from '@zamp-platform/ui';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

import { BlockAction, SingleSelectOption } from '../../types/block.types';

interface SingleSelectBlockProps {
  payload: {
    options: SingleSelectOption[];
    initial_value?: string;
    action: BlockAction;
  };
  blockId: string;
  value: string;
  onChange: (value: string) => void;
}

export const SingleSelectBlock: React.FC<SingleSelectBlockProps> = ({ payload, blockId, value, onChange }) => {
  return (
    <div className='my-3' data-testid='single-select-block'>
      <RadioGroup value={value} onValueChange={onChange}>
        {payload.options?.map((option) => (
          <div key={option.id} className='mb-2 flex items-start space-x-3'>
            <Radio value={option.id} id={`${blockId}-${option.id}`} className='mt-1' />
            <Label
              htmlFor={`${blockId}-${option.id}`}
              className='cursor-pointer text-sm leading-relaxed font-normal text-gray-900'
            >
              {option.type === 'markdown' ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>
                  {option.label}
                </ReactMarkdown>
              ) : (
                option.label
              )}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export const RadioButtonBlock = SingleSelectBlock;
