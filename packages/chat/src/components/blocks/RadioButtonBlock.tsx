'use client';

import { Label } from '@zamp-platform/ui';
import { Radio, RadioGroup } from '@zamp-platform/ui';
import Link from 'next/link';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

import { SingleSelectOption } from '../../types/block.types';

interface SingleSelectBlockProps {
  payload: {
    options: SingleSelectOption[];
    initial_option_id?: string;
    is_disabled?: boolean;
  };
  blockId: string;
  value: string;
  onChange: (value: string) => void;
}

export const SingleSelectBlock: React.FC<SingleSelectBlockProps> = ({ payload, blockId, value, onChange }) => {
  return (
    <div className='my-3' data-testid='single-select-block'>
      <RadioGroup value={value || payload.initial_option_id} onValueChange={onChange}>
        {payload.options?.map((option) => (
          <div key={option.id} className='mb-2 flex items-start gap-2'>
            <Radio value={option.id} id={`${blockId}-${option.id}`} className='mt-1' disabled={payload.is_disabled} />
            <Label
              htmlFor={`${blockId}-${option.id}`}
              className='text-gray-1000 cursor-pointer text-sm leading-relaxed font-normal'
            >
              {option.type === 'markdown' ? (
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
