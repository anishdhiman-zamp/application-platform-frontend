'use client';

import { cn } from '@zamp-platform/ui/utils';
import { Check, CornerDownLeft, Loader2 } from 'lucide-react';
import React from 'react';

import type { HITLOption } from '../../../types/block.types';

export interface OptionRowProps {
  option: HITLOption;
  isFocused: boolean;
  isSelected: boolean;
  isMultiSelect: boolean;
  isSubmitting?: boolean;
  /** Badge text for single-select rows (e.g. A, B, C). Ignored when `isMultiSelect`. */
  singleSelectBadge?: string;
  onClick: () => void;
}

export const OptionRow: React.FC<OptionRowProps> = ({
  option,
  isFocused,
  isSelected,
  isMultiSelect,
  isSubmitting,
  singleSelectBadge,
  onClick,
}) => {
  return (
    <div
      data-hitl-focused={isFocused || undefined}
      className={cn(
        'w-full shrink-0 cursor-pointer rounded-[10px] transition-colors duration-200',
        isFocused ? 'bg-GRAY_50' : 'hover:bg-GRAY_50',
      )}
      onClick={onClick}
    >
      <div className={cn('flex w-full items-center p-2.5', isFocused && !isSelected && 'pr-3.5')}>
        <div className='flex min-h-px min-w-px flex-1 items-start gap-2.5'>
          <div
            className={cn(
              'flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-colors',
              isSelected ? 'bg-gray-1000' : 'bg-GRAY_50 border border-gray-300',
            )}
          >
            {isMultiSelect ? (
              isSelected ? (
                <Check className='text-BG_WHITE' size={14} strokeWidth={3} />
              ) : null
            ) : (
              <span
                className={cn('text-center text-[11px] font-medium', isSelected ? 'text-BG_WHITE' : 'text-gray-950')}
              >
                {singleSelectBadge ?? '?'}
              </span>
            )}
          </div>

          <div className='flex min-h-px min-w-px flex-1 flex-col items-start justify-center'>
            <div className='flex w-full items-center justify-between'>
              <span className='text-sm leading-[1.4] font-medium text-gray-950'>{option?.title ?? option?.label}</span>
              {isSubmitting ? (
                <Loader2 className='shrink-0 animate-spin text-gray-500' size={12} />
              ) : isFocused ? (
                <div className='bg-BG_WHITE flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border border-gray-300 p-1'>
                  <CornerDownLeft className='text-gray-700' size={10} />
                </div>
              ) : null}
            </div>
            <p className='w-full text-[13px] leading-[1.4] font-[450] whitespace-pre-wrap text-gray-700'>
              {option?.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
