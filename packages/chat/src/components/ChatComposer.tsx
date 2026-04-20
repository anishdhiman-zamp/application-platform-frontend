'use client';

import { Button, LiveWaveform, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { ArrowUp, Check, Hourglass, Loader, Loader2, Mic, Paperclip, Square, X } from 'lucide-react';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';

import { UploadedFileType } from '../types/block.types';
import { AttachmentsList, FileReferencesList } from './blocks';
import { RichTextEditor, type RichTextEditorHandle } from './RichTextEditor';

interface S3UploadedFile {
  file_id: string;
  file_name: string;
  file_type?: string;
  file?: File;
}

export interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  onPaste?: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;

  fileReferences?: UploadedFileType[];
  onRemoveFileReference?: (fileId: string) => void;

  /** @deprecated Use fileReferences instead. Kept for backward compatibility with S3 uploads. */
  attachments?: S3UploadedFile[];
  /** @deprecated Use onRemoveFileReference instead. Kept for backward compatibility with S3 uploads. */
  removeAttachment?: (fileId: string) => void;

  isUploading?: boolean;
  onAttachClick?: () => void;
  showAttachButton?: boolean;

  shouldShowRecorder: boolean;
  isPreparingToRecord: boolean;
  microphone?: MediaRecorder | null;
  isCommitting?: boolean;
  onStartRecording: () => void;
  onAcceptRecording: () => void;
  onRejectRecording: () => void;
  microphoneDisabled?: boolean;

  showSubmitButton?: boolean;
  onSubmit?: () => void;
  isSubmitDisabled?: boolean;

  isStreaming?: boolean;
  onStop?: () => void;
  isStopping?: boolean;

  className?: string;
  textareaClassName?: string;
  textareaStyle?: React.CSSProperties;
  containerClassName?: string;

  minTextareaHeight?: number;
  maxTextareaHeight?: number;

  modelSelectorSlot?: React.ReactNode;
  autoLoopToggleSlot?: React.ReactNode;
  voiceChatSlot?: React.ReactNode;
  hideRecordingButton?: boolean;
  showFilePreview?: boolean;
}

export interface ChatComposerHandle {
  focus: () => void;
}

export const ChatComposer = forwardRef<ChatComposerHandle, ChatComposerProps>(
  (
    {
      value,
      onChange,
      placeholder = 'Ask anything or give feedback...',
      autoFocus = false,
      onPaste,

      fileReferences,
      onRemoveFileReference,

      attachments,
      removeAttachment,

      isUploading = false,
      onAttachClick,
      showAttachButton = true,

      shouldShowRecorder,
      isPreparingToRecord,
      microphone,
      isCommitting = false,
      onStartRecording,
      onAcceptRecording,
      onRejectRecording,
      microphoneDisabled = false,

      showSubmitButton = false,
      onSubmit,
      isSubmitDisabled = true,

      isStreaming = false,
      onStop,
      isStopping = false,

      className,
      textareaClassName,
      textareaStyle,
      containerClassName,

      minTextareaHeight = 18,
      maxTextareaHeight = 200,

      modelSelectorSlot,
      autoLoopToggleSlot,
      voiceChatSlot,
      hideRecordingButton = false,
      showFilePreview = true,
    },
    ref,
  ) => {
    const editorRef = useRef<RichTextEditorHandle>(null);

    useImperativeHandle(ref, () => ({
      focus: () => editorRef.current?.focus(),
    }));

    const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!shouldShowRecorder && e.target === e.currentTarget) {
        editorRef.current?.focus();
      }
    };

    const handleRemoveFileReference = (fileId: string) => {
      onRemoveFileReference?.(fileId);
    };

    const handleRemoveAttachment = (fileId: string) => {
      removeAttachment?.(fileId);
    };

    const useFileReferences = fileReferences && fileReferences.length > 0;
    const useAttachments = attachments && attachments.length > 0;

    const isStreamingActive = showSubmitButton && (isStreaming || isStopping) && onStop;
    const hasComposerContent = !!value.trim() || !!fileReferences?.length;
    const hasContentToQueue = !isSubmitDisabled || (isUploading && hasComposerContent);

    const renderSubmitArea = () => {
      if (isStreamingActive && hasContentToQueue) {
        return (
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onSubmit}
                  disabled={isSubmitDisabled}
                  size='icon'
                  aria-label='Queue message'
                  className='bg-GRAY_950 text-BG_WHITE hover:bg-GRAY_950 hover:text-BG_WHITE dark:bg-GRAY_500 dark:hover:bg-GRAY_600 dark:text-GRAY_1000 dark:hover:text-GRAY_1000 size-[26px] rounded-full p-0 [&_svg]:size-3.5'
                >
                  <Hourglass className='size-3!' />
                </Button>
              </TooltipTrigger>
              <TooltipContent side='top' align='center' className='f-10-450 p-1.5' sideOffset={4}>
                Queue message
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }

      if (isStreamingActive) {
        return (
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onStop}
                  disabled={isStopping}
                  size='icon'
                  variant='ghost'
                  aria-label='Stop generating'
                  className='bg-GRAY_950 text-BG_WHITE hover:bg-GRAY_950 hover:text-BG_WHITE dark:bg-GRAY_500 dark:hover:bg-GRAY_600 dark:text-GRAY_1000 dark:hover:text-GRAY_1000 size-[26px] rounded-full p-0 [&_svg]:size-3.5'
                >
                  {isStopping ? (
                    <Loader2 className='animate-spin' />
                  ) : (
                    <Square fill='currentColor' strokeWidth={0} className='size-2.5!' />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side='top' align='center' className='f-10-450 p-1.5' sideOffset={4}>
                Stop generating
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }

      if (showSubmitButton && onSubmit) {
        return (
          <Button
            onClick={onSubmit}
            disabled={isSubmitDisabled}
            size='icon'
            aria-label='Send message'
            className='disabled:bg-GRAY_300 dark:hover:bg-GRAY_600 dark:disabled:bg-GRAY_300 size-[26px] rounded-full p-[2px] text-white disabled:cursor-not-allowed dark:bg-white [&_svg]:size-3.5'
          >
            <ArrowUp
              className={cn('text-BG_WHITE dark:text-BG_WHITE', {
                'text-GRAY_700 dark:text-GRAY_600': isSubmitDisabled,
              })}
            />
          </Button>
        );
      }

      return null;
    };

    return (
      <div
        className={cn(
          'border-GRAY_400 bg-BG_WHITE focus-within:border-GRAY_300 shadow-chatbot-shadow relative w-full rounded-xl border transition-all',
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
            showFilePreview={showFilePreview}
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
              className='bg-accent hover:bg-accent size-[26px] shrink-0 rounded-full [&_svg]:size-3.5'
              aria-label='Reject recording'
              onClick={onRejectRecording}
            >
              <X className='text-GRAY_1000' />
            </Button>

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
              className='size-[26px] shrink-0 rounded-full [&_svg]:size-3.5'
              aria-label='Accept recording'
              onClick={onAcceptRecording}
              disabled={isCommitting}
              isLoading={isCommitting}
            >
              <Check />
            </Button>
          </div>
        ) : (
          <div className='flex w-full flex-col'>
            <div className='p-3' onClick={handleContainerClick}>
              <RichTextEditor
                ref={editorRef}
                value={value}
                onChange={onChange}
                onPaste={onPaste}
                placeholder={placeholder}
                onSubmit={onSubmit}
                isSubmitDisabled={isSubmitDisabled}
                autoFocus={autoFocus}
                className={textareaClassName}
                style={textareaStyle}
                minHeight={minTextareaHeight}
                maxHeight={maxTextareaHeight}
                editorAttributes={{
                  role: 'textbox',
                  enterkeyhint: 'enter',
                  'data-testid': 'chat-input',
                  'aria-label': placeholder,
                  'aria-multiline': 'true',
                  'aria-required': 'false',
                  'aria-invalid': 'false',
                  translate: 'no',
                }}
              />
            </div>
            <div className='flex items-center justify-between py-2.5 pr-2.5 pl-2'>
              <div className='flex items-center gap-x-2'>
                {showAttachButton && onAttachClick ? (
                  <Button
                    variant='ghost'
                    size='icon'
                    className='hover:text-GRAY_1000 text-GRAY_700 hover:bg-accent size-[26px] rounded-[6px] p-[2px] [&_svg]:size-3.5'
                    aria-label='Attach file'
                    onClick={onAttachClick}
                  >
                    <Paperclip />
                  </Button>
                ) : null}
                {autoLoopToggleSlot}
              </div>

              <div className='flex items-center gap-x-2'>
                {modelSelectorSlot}
                {voiceChatSlot}
                {!hideRecordingButton &&
                  (isPreparingToRecord ? (
                    <div className='flex size-[26px] items-center justify-center'>
                      <Loader size={14} className='text-GRAY_700 animate-spin' />
                    </div>
                  ) : (
                    <Button
                      variant='ghost'
                      size='icon'
                      className='hover:text-GRAY_1000 text-GRAY_700 hover:bg-accent size-[26px] rounded-[6px] p-[2px] [&_svg]:size-3.5'
                      aria-label='Start recording'
                      onClick={onStartRecording}
                      disabled={microphoneDisabled}
                    >
                      <Mic />
                    </Button>
                  ))}

                {renderSubmitArea()}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
);

ChatComposer.displayName = 'ChatComposer';

export default ChatComposer;
