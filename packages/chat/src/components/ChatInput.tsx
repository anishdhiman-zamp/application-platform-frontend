'use client';

import { Button, Textarea } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { ArrowUp, Loader, Mic, Paperclip } from 'lucide-react';
import React, { FC, ReactNode, RefObject, useEffect, useRef } from 'react';

import { UploadedFileType } from '../types/block.types';
import { AttachmentsList } from './blocks';

export interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  isDisabled?: boolean;
  textareaRef?: RefObject<HTMLTextAreaElement | null>;
  attachments?: UploadedFileType[];
  onAttachmentRemove?: (fileId: string) => void;
  isUploading?: boolean;
  onAttachClick?: () => void;
  showAttachButton?: boolean;
  showMicButton?: boolean;
  onMicClick?: () => void;
  isMicDisabled?: boolean;
  isMicLoading?: boolean;
  className?: string;
  containerClassName?: string;
  showBorder?: boolean;
  autoFocus?: boolean;
  maxHeight?: number;
  customLeftActions?: ReactNode;
  customRightActions?: ReactNode;
  fileInputRef?: RefObject<HTMLInputElement | null>;
  onFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  acceptedFileTypes?: string;
  recorderComponent?: ReactNode;
  isRecording?: boolean;
}

export const ChatInput: FC<ChatInputProps> = ({
  value,
  onChange,
  onSubmit,
  onKeyDown,
  placeholder = 'Ask anything or give feedback...',
  isDisabled = false,
  textareaRef: externalTextareaRef,
  attachments = [],
  onAttachmentRemove,
  isUploading = false,
  onAttachClick,
  showAttachButton = true,
  showMicButton = true,
  onMicClick,
  isMicDisabled = false,
  isMicLoading = false,
  className,
  containerClassName,
  showBorder = true,
  autoFocus = false,
  maxHeight = 200,
  customLeftActions,
  customRightActions,
  fileInputRef: externalFileInputRef,
  onFileChange,
  acceptedFileTypes,
  recorderComponent,
  isRecording = false,
}) => {
  const internalTextareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = externalTextareaRef || internalTextareaRef;

  const internalFileInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = externalFileInputRef || internalFileInputRef;

  const handleContainerClick = () => {
    if (!isRecording && !isDisabled) {
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (onKeyDown) {
      onKeyDown(e);
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const handleAttachClick = () => {
    if (onAttachClick) {
      onAttachClick();
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onFileChange) {
      onFileChange(e);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = '20px';
    const scrollHeight = textarea.scrollHeight;
    const newHeight = Math.min(scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;
  }, [value, maxHeight]);

  useEffect(() => {
    if (autoFocus && !isDisabled && !isRecording) {
      const timeoutId = setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [autoFocus, isDisabled, isRecording]);

  return (
    <div
      className={cn('w-full', containerClassName, {
        'border-t p-3': showBorder,
        'border-none p-0': !showBorder,
        'pt-1.5': attachments.length > 0,
      })}
    >
      {onFileChange && (
        <input
          ref={fileInputRef}
          type='file'
          multiple
          onChange={handleFileChange}
          className='hidden'
          aria-label='File input'
          accept={acceptedFileTypes}
        />
      )}
      <AttachmentsList attachments={attachments} removeAttachment={onAttachmentRemove} isLoading={isUploading} />
      <div className={cn(isRecording ? 'relative w-full rounded-xl border border-gray-600 p-1.5' : '')}>
        <div className='relative'>
          {isRecording && recorderComponent ? (
            recorderComponent
          ) : (
            <div className={cn('shadow-side-drawer-inner rounded-xl border', className)} onClick={handleContainerClick}>
              <Textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className='f-13-450 placeholder:text-muted-foreground m-2.5 min-h-0 w-[316px] resize-none overflow-y-auto border-none bg-transparent p-0 pr-0 shadow-none outline-none'
                style={{
                  height: '20px',
                  maxHeight: `${maxHeight}px`,
                  lineHeight: '18px',
                }}
                disabled={isDisabled}
              />

              <div className='flex items-center justify-between py-2.5 pr-2.5 pl-1.5'>
                <div className='flex items-center gap-1'>
                  {customLeftActions}
                  {showMicButton && (
                    <>
                      {isMicLoading ? (
                        <Loader size={14} className='animate-spin text-gray-900' />
                      ) : (
                        <Button
                          variant='ghost'
                          size='icon'
                          className='hover:text-gray-1000 !size-4 rounded-[2px] text-gray-900 hover:bg-gray-300 [&_svg]:size-3'
                          aria-label='Start recording'
                          onClick={onMicClick}
                          disabled={isMicDisabled || isDisabled}
                        >
                          <Mic />
                        </Button>
                      )}
                    </>
                  )}
                  {showAttachButton && (
                    <Button
                      variant='ghost'
                      size='icon'
                      className='hover:text-gray-1000 !size-4 rounded-[2px] text-gray-900 hover:bg-gray-300 [&_svg]:size-3'
                      aria-label='Attach file'
                      onClick={handleAttachClick}
                      disabled={isUploading || isDisabled}
                    >
                      <Paperclip />
                    </Button>
                  )}
                </div>
                <div className='flex items-center gap-1'>
                  {customRightActions}
                  <Button
                    onClick={onSubmit}
                    disabled={!value.trim() || isUploading || isDisabled}
                    size='icon'
                    aria-label='Send message'
                    className='!size-5 rounded-full [&_svg]:size-3'
                  >
                    <ArrowUp />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
