'use client';

import { Button, LiveWaveform, Textarea } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { ArrowUp, Check, CircleStop, Loader, Loader2, Mic, Paperclip, X } from 'lucide-react';
import React, { FC, useEffect, useRef } from 'react';

import { UploadedFileType } from '../types/block.types';
import { AttachmentsList, FileReferencesList } from './blocks';

interface S3UploadedFile {
  file_id: string;
  file_name: string;
  file_type?: string;
  file?: File;
}

export interface ChatComposerProps {
  // Textarea props
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onPaste?: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  autoFocus?: boolean;

  // File references (new filesystem upload flow)
  fileReferences?: UploadedFileType[];
  onRemoveFileReference?: (fileId: string) => void;

  /** @deprecated Use fileReferences instead. Kept for backward compatibility with S3 uploads. */
  attachments?: S3UploadedFile[];
  /** @deprecated Use onRemoveFileReference instead. Kept for backward compatibility with S3 uploads. */
  removeAttachment?: (fileId: string) => void;

  isUploading?: boolean;
  onAttachClick?: () => void;
  showAttachButton?: boolean;

  // Recording
  shouldShowRecorder: boolean;
  isPreparingToRecord: boolean;
  microphone?: MediaRecorder | null;
  isCommitting?: boolean;
  onStartRecording: () => void;
  onAcceptRecording: () => void;
  onRejectRecording: () => void;
  microphoneDisabled?: boolean;

  // Submit button (optional - only ConnectedChatInput uses it)
  showSubmitButton?: boolean;
  onSubmit?: () => void;
  isSubmitDisabled?: boolean;

  // Streaming / stop
  isStreaming?: boolean;
  onStop?: () => void;
  isStopping?: boolean;

  // Styling
  className?: string;
  textareaClassName?: string;
  textareaStyle?: React.CSSProperties;
  containerClassName?: string;

  // Textarea dimensions
  minTextareaHeight?: number;
  maxTextareaHeight?: number;

  // Model selector slot rendered in the right action bar
  modelSelectorSlot?: React.ReactNode;
}

export const ChatComposer: FC<ChatComposerProps> = ({
  // Textarea props
  value,
  onChange,
  placeholder = 'Ask anything or give feedback...',
  onKeyDown,
  onPaste,
  autoFocus = false,

  // File references (new flow)
  fileReferences,
  onRemoveFileReference,

  // Attachments (legacy S3 flow - deprecated)
  attachments,
  removeAttachment,

  isUploading = false,
  onAttachClick,
  showAttachButton = true,

  // Recording
  shouldShowRecorder,
  isPreparingToRecord,
  microphone,
  isCommitting = false,
  onStartRecording,
  onAcceptRecording,
  onRejectRecording,
  microphoneDisabled = false,

  // Submit button
  showSubmitButton = false,
  onSubmit,
  isSubmitDisabled = true,

  // Streaming / stop
  isStreaming = false,
  onStop,
  isStopping = false,

  // Styling
  className,
  textareaClassName,
  textareaStyle,
  containerClassName,

  // Textarea dimensions
  minTextareaHeight = 18,
  maxTextareaHeight = 200,

  // Model selector
  modelSelectorSlot,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleContainerClick = () => {
    if (!shouldShowRecorder) {
      textareaRef.current?.focus();
    }
  };

  const handleRemoveFileReference = (fileId: string) => {
    onRemoveFileReference?.(fileId);
    textareaRef.current?.focus();
  };

  const handleRemoveAttachment = (fileId: string) => {
    removeAttachment?.(fileId);
    textareaRef.current?.focus();
  };

  // Determine which file display to use
  const useFileReferences = fileReferences && fileReferences.length > 0;
  const useAttachments = attachments && attachments.length > 0;

  // Auto-focus effect
  useEffect(() => {
    if (autoFocus && !shouldShowRecorder) {
      const timeoutId = setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [autoFocus, shouldShowRecorder]);

  // Auto-resize effect
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea || shouldShowRecorder) return;

    requestAnimationFrame(() => {
      if (!value) {
        textarea.style.height = `${minTextareaHeight}px`;
        return;
      }

      textarea.style.height = `${minTextareaHeight}px`;

      const newHeight = Math.min(Math.max(textarea.scrollHeight, minTextareaHeight), maxTextareaHeight);
      textarea.style.height = `${newHeight}px`;
    });
  }, [value, minTextareaHeight, maxTextareaHeight, shouldShowRecorder]);

  return (
    <div
      className={cn(
        'border-GRAY_400 focus-within:border-GRAY_600 relative w-full rounded-xl border shadow-xs transition-all',
        shouldShowRecorder && 'border-gray-400',
        containerClassName,
        className,
      )}
    >
      {useFileReferences && (
        <FileReferencesList
          fileReferences={fileReferences}
          onRemove={handleRemoveFileReference}
          isLoading={isUploading}
          className='px-2.5 pt-2'
        />
      )}
      {useAttachments && (
        <AttachmentsList
          attachments={attachments}
          removeAttachment={handleRemoveAttachment}
          isLoading={isUploading}
          className='px-2.5 pt-2'
        />
      )}

      {shouldShowRecorder ? (
        <div className='flex w-full items-center justify-between gap-2 p-2.5'>
          <Button
            variant='ghost'
            size='icon'
            className='bg-GRAY_200 hover:bg-GRAY_200 !size-5 shrink-0 rounded-full [&_svg]:size-3'
            aria-label='Reject recording'
            onClick={onRejectRecording}
          >
            <X className='text-GRAY_1000' />
          </Button>

          {/* Visualizer */}

          <LiveWaveform
            active={!!microphone}
            processing={isCommitting}
            height={20}
            barWidth={4}
            barGap={2}
            barRadius={2}
            mode='static'
            sensitivity={1.5}
          />

          <Button
            size='icon'
            className='!size-5 shrink-0 rounded-full [&_svg]:size-3'
            aria-label='Accept recording'
            onClick={onAcceptRecording}
            disabled={isCommitting}
            isLoading={isCommitting}
          >
            <Check className='text-white' />
          </Button>
        </div>
      ) : (
        <div onClick={handleContainerClick} className='flex w-full flex-col pt-2.5'>
          <div className='px-2.5'>
            <Textarea
              ref={textareaRef}
              value={value}
              autoFocus={autoFocus}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={onKeyDown}
              onPaste={onPaste}
              placeholder={placeholder}
              className={cn(
                'f-13-450 placeholder:text-muted-foreground min-h-0 w-full resize-none overflow-y-auto rounded-none border-none bg-transparent p-0 shadow-none outline-none [scrollbar-width:none]',
                textareaClassName,
              )}
              style={{
                maxHeight: `${maxTextareaHeight}px`,
                lineHeight: '18px',
                ...textareaStyle,
              }}
            />
          </div>
          <div className='flex items-center justify-between py-2.5 pr-2.5 pl-1.5'>
            {showAttachButton && onAttachClick ? (
              <Button
                variant='ghost'
                size='icon'
                className='hover:text-gray-1000 !size-5 rounded-[2px] p-[2px] text-gray-900 hover:bg-gray-100 [&_svg]:size-3'
                aria-label='Attach file'
                onClick={onAttachClick}
                disabled={isUploading}
              >
                <Paperclip />
              </Button>
            ) : (
              <div />
            )}

            <div className='flex items-center gap-x-2'>
              {modelSelectorSlot}
              {isPreparingToRecord ? (
                <Loader size={14} className='animate-spin text-gray-900' />
              ) : (
                <Button
                  variant='ghost'
                  size='icon'
                  className='hover:text-gray-1000 !size-5 rounded-[2px] p-[2px] text-gray-900 hover:bg-gray-100 [&_svg]:size-3'
                  aria-label='Start recording'
                  onClick={onStartRecording}
                  disabled={microphoneDisabled}
                >
                  <Mic />
                </Button>
              )}
              {showSubmitButton && (isStreaming || isStopping) && onStop ? (
                <Button
                  onClick={onStop}
                  disabled={isStopping}
                  size='icon'
                  variant='ghost'
                  aria-label='Stop generating'
                  className='!size-5 rounded-full bg-black p-0 text-white hover:bg-black hover:text-white [&_svg]:size-3'
                >
                  {isStopping ? <Loader2 className='animate-spin' /> : <CircleStop />}
                </Button>
              ) : (
                showSubmitButton &&
                onSubmit && (
                  <Button
                    onClick={onSubmit}
                    disabled={isSubmitDisabled}
                    size='icon'
                    aria-label='Send message'
                    className='disabled:bg-GRAY_300 !size-5 rounded-full p-[2px] !text-white disabled:cursor-not-allowed [&_svg]:size-3'
                  >
                    <ArrowUp className={cn('text-white', { 'text-GRAY_700': isSubmitDisabled })} />
                  </Button>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatComposer;
