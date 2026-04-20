'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';

import { useFilesystemFileUpload } from '../../../hooks/useFilesystemFileUpload';
import { ChatComposer, type ChatComposerHandle } from '../../ChatComposer';
import { useRecording } from './useRecording';

export interface ChatComposerFileRef {
  path: string;
  name: string;
}

export interface ChatComposerInputProps {
  value: string;
  onChange: (value: string) => void;
  onFileReferencesChange: (refs: ChatComposerFileRef[]) => void;
  placeholder?: string;
  className?: string;
  username?: string;
  showFilePreview?: boolean;
}

export interface ChatComposerInputHandle {
  focus: () => void;
}

/**
 * Self-contained composer input for HITL questions.
 * Wires ChatComposer with microphone transcription and file upload —
 * no external chat context required.
 */
export const ChatComposerInput = forwardRef<ChatComposerInputHandle, ChatComposerInputProps>(
  (
    {
      value,
      onChange,
      onFileReferencesChange,
      placeholder = 'Type your answer...',
      className,
      username = '',
      showFilePreview = true,
    },
    ref,
  ) => {
    const composerRef = useRef<ChatComposerHandle>(null);

    useImperativeHandle(ref, () => ({
      focus: () => composerRef.current?.focus(),
    }));

    const {
      fileReferences,
      isUploading,
      fileInputRef,
      handleRemoveFileReference,
      handleAttachClick,
      handleFileChange,
      handlePaste,
    } = useFilesystemFileUpload({ username, onFileReferencesChange });

    const {
      shouldShowRecorder,
      isPreparingToRecord,
      microphone,
      isCommitting,
      microphoneDisabled,
      handleStartRecording,
      handleAcceptRecording,
      handleRejectRecording,
    } = useRecording({ username, value, onChange });

    return (
      <div className={className}>
        <input
          ref={fileInputRef}
          type='file'
          multiple
          onChange={handleFileChange}
          className='hidden'
          aria-label='File input'
        />
        <ChatComposer
          ref={composerRef}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onPaste={handlePaste}
          fileReferences={fileReferences}
          onRemoveFileReference={handleRemoveFileReference}
          isUploading={isUploading}
          onAttachClick={handleAttachClick}
          showAttachButton
          shouldShowRecorder={shouldShowRecorder}
          isPreparingToRecord={isPreparingToRecord}
          microphone={microphone}
          isCommitting={isCommitting}
          onStartRecording={handleStartRecording}
          onAcceptRecording={handleAcceptRecording}
          onRejectRecording={handleRejectRecording}
          microphoneDisabled={microphoneDisabled}
          showSubmitButton={false}
          showFilePreview={showFilePreview}
        />
      </div>
    );
  },
);

ChatComposerInput.displayName = 'ChatComposerInput';
