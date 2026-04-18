'use client';

import { cn } from '@zamp-platform/ui/utils';
import { Check, Loader2, PenLine } from 'lucide-react';
import React, { useEffect, useRef } from 'react';

import { type ChatComposerFileRef, ChatComposerInput, type ChatComposerInputHandle } from './ChatComposerInput';

export interface CustomInputRowProps {
  isFocused: boolean;
  isSelected: boolean;
  isMultiSelect: boolean;
  isSubmitting?: boolean;
  value: string;
  onClick: () => void;
  onChange: (value: string) => void;
  onFileReferencesChange?: (refs: ChatComposerFileRef[]) => void;
  username?: string;
}

export const CustomInputRow: React.FC<CustomInputRowProps> = ({
  isFocused,
  isSelected,
  isMultiSelect,
  isSubmitting,
  value,
  onClick,
  onChange,
  onFileReferencesChange,
  username,
}) => {
  const composerRef = useRef<ChatComposerInputHandle>(null);

  const renderIcon = () => {
    if (isSelected && isSubmitting) {
      return <Loader2 className='text-BG_WHITE animate-spin' size={12} />;
    }
    if (isMultiSelect && isSelected) {
      return <Check className='text-BG_WHITE' size={12} strokeWidth={2} />;
    }
    return <PenLine className={cn(isSelected ? 'text-BG_WHITE' : 'text-GRAY_950')} size={12} strokeWidth={1} />;
  };

  useEffect(() => {
    if (isFocused) {
      composerRef.current?.focus();
    }
  }, [isFocused]);

  return (
    <div
      data-hitl-focused={isFocused || undefined}
      className={cn('w-full shrink-0 cursor-pointer rounded-[10px] transition-colors duration-200', 'hover:bg-GRAY_20')}
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
            {renderIcon()}
          </div>

          <div className='flex-1 cursor-text' onClick={(e) => e.stopPropagation()}>
            <ChatComposerInput
              ref={composerRef}
              value={value}
              onChange={onChange}
              onFileReferencesChange={onFileReferencesChange ?? (() => {})}
              placeholder='Type something else...'
              className='bg-BG_WHITE rounded-xl'
              username={username}
              showFilePreview={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
