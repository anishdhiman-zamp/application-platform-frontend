'use client';

import { Textarea } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { Check, PenLine } from 'lucide-react';
import React from 'react';

export interface CustomInputRowProps {
  isFocused: boolean;
  isSelected: boolean;
  isMultiSelect: boolean;
  value: string;
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
  onClick: () => void;
  onChange: (value: string) => void;
}

export const CustomInputRow: React.FC<CustomInputRowProps> = ({
  isFocused,
  isSelected,
  isMultiSelect,
  value,
  inputRef,
  onClick,
  onChange,
}) => {
  return (
    <div
      data-hitl-focused={isFocused || undefined}
      className={cn(
        'w-full shrink-0 cursor-pointer rounded-[10px] transition-colors duration-200',
        isFocused ? 'bg-GRAY_50' : 'hover:bg-GRAY_20',
      )}
      onClick={onClick}
    >
      <div className='flex w-full items-start px-3 py-2.5'>
        <div className='flex min-w-px flex-1 items-start gap-2.5'>
          <div
            className={cn(
              'mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center overflow-clip rounded-md transition-colors',
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

          <Textarea
            ref={(element) => {
              if (inputRef) {
                inputRef.current = element;
              }
            }}
            value={value}
            rows={3}
            onChange={(e) => onChange(e.target.value)}
            readOnly={!isFocused}
            className={cn(
              'text-GRAY_1000 placeholder:text-GRAY_400 min-h-[60px] flex-1 resize-none rounded-md border px-3 py-1.5 text-xs font-[450] shadow-none',
              isFocused
                ? 'border-GRAY_500 ring-GRAY_200 bg-BG_WHITE ring-[3px] ring-offset-0 focus-visible:outline-hidden'
                : 'border-GRAY_200 bg-BG_WHITE',
            )}
            placeholder='Type something else...'
          />
        </div>
      </div>
    </div>
  );
};
