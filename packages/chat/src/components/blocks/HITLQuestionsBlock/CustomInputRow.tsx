'use client';

import { Input } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { Check, PenLine } from 'lucide-react';
import React from 'react';

export interface CustomInputRowProps {
  isFocused: boolean;
  isSelected: boolean;
  isMultiSelect: boolean;
  value: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  onMouseEnter: () => void;
  onClick: () => void;
  onChange: (value: string) => void;
}

export const CustomInputRow: React.FC<CustomInputRowProps> = ({
  isFocused,
  isSelected,
  isMultiSelect,
  value,
  inputRef,
  onMouseEnter,
  onClick,
  onChange,
}) => {
  return (
    <div
      className={cn(
        'w-full shrink-0 cursor-pointer rounded-[10px] transition-colors duration-200',
        isFocused ? 'bg-GRAY_50' : 'hover:bg-GRAY_20',
      )}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
    >
      <div className='flex w-full items-center px-3 py-2.5'>
        <div className='flex min-h-px min-w-px flex-1 items-center gap-2.5'>
          <div
            className={cn(
              'flex h-5 w-5 shrink-0 items-center justify-center overflow-clip rounded-md transition-colors',
              isSelected ? 'bg-GRAY_1000' : 'bg-GRAY_50',
            )}
          >
            {isMultiSelect ? (
              isSelected ? (
                <Check className='text-BG_WHITE' size={14} strokeWidth={3} />
              ) : (
                <PenLine className='text-GRAY_950' size={12} strokeWidth={1} />
              )
            ) : (
              <PenLine className={cn(isSelected ? 'text-BG_WHITE' : 'text-GRAY_950')} size={12} strokeWidth={1} />
            )}
          </div>

          {isFocused ? (
            <div className='bg-BG_WHITE relative flex h-8 flex-1 items-start rounded-md'>
              <div
                aria-hidden='true'
                className='border-GRAY_200 pointer-events-none absolute inset-[-3px] rounded-[9px] border-[3px]'
              />
              <div className='relative flex h-full w-full items-center rounded-md px-3'>
                <div
                  aria-hidden='true'
                  className='border-GRAY_500 pointer-events-none absolute inset-0 rounded-md border'
                />
                <Input
                  ref={(element) => {
                    if (inputRef) {
                      inputRef.current = element;
                    }
                  }}
                  type='text'
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  size='small'
                  wrapperClassName='contents'
                  className={cn(
                    'h-full min-w-0 flex-1 rounded-none border-0 bg-transparent p-0 shadow-none ring-0',
                    'focus:border-0 focus:ring-0',
                    'text-GRAY_1000 placeholder:text-GRAY_400 text-xs font-[450] outline-none',
                  )}
                  placeholder='Type something else...'
                  style={{ caretColor: 'var(--GRAY_1000)' }}
                />
              </div>
            </div>
          ) : (
            <div className='bg-BG_WHITE flex h-8 min-h-px min-w-px flex-1 flex-col items-start overflow-clip rounded-md'>
              <div className='relative h-full w-full rounded-md'>
                <div
                  aria-hidden='true'
                  className='border-GRAY_200 pointer-events-none absolute inset-0 rounded-md border'
                />
                <div className='flex h-full flex-col justify-center'>
                  <div className='flex h-full items-center px-3'>
                    <span
                      className={cn(
                        'text-xs font-[450] whitespace-pre-wrap',
                        value ? 'text-GRAY_1000' : 'text-GRAY_400',
                      )}
                    >
                      {value || 'Type something else...'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
