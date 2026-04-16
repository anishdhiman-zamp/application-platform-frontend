'use client';

import { toast } from '@zamp-platform/ui';
import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';

import useChatAdapters from '../../../hooks/useChatAdapters';
import { type UploadedFile } from '../../../hooks/useChatInput';
import { useFilesystemMutations } from '../../../hooks/useFilesystemMutations';
import { MicrophoneState } from '../../../hooks/useMicrophoneRecorder';
import { useTranscription } from '../../../hooks/useTranscription';
import { SOCKET_STATES } from '../../../types/transcription.types';
import { handleFilesystemUploads, sanitizeFileName } from '../../../utils/filesystemUpload';
import { ChatComposer, type ChatComposerHandle } from '../../ChatComposer';

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

    const [fileReferences, setFileReferences] = useState<UploadedFile[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isRejectingRef = useRef(false);
    const transcriptInsertionIndexRef = useRef(-1);
    const valueRef = useRef(value);
    valueRef.current = value;

    const { uploadMutations } = useFilesystemMutations();

    const getEmptyString = useCallback(() => '', []);
    const getUsername = useCallback(() => username, [username]);
    const handleAdapterError = useCallback((error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    }, []);

    useImperativeHandle(ref, () => ({
      focus: () => composerRef.current?.focus(),
    }));

    const { transcriptionAdapter } = useChatAdapters({
      getCurrentUserName: getEmptyString,
      getResourceId: getEmptyString,
      getScopeId: getEmptyString,
      getUsername,
      onError: handleAdapterError,
    });

    const handleTranscriptChunk = useCallback(
      (chunk: string) => {
        if (isRejectingRef.current) return;
        const current = valueRef.current;
        if (transcriptInsertionIndexRef.current === -1) {
          transcriptInsertionIndexRef.current = current.length > 0 ? current.length + 1 : 0;
        }
        onChange(current ? `${current} ${chunk}` : chunk);
      },
      [onChange],
    );

    const { isRecording, startRecording, stopRecording, microphoneState, connectionState, microphone, isCommitting } =
      useTranscription({
        adapter: transcriptionAdapter,
        onTranscriptChunk: handleTranscriptChunk,
      });

    const shouldShowRecorder = isRecording && connectionState === SOCKET_STATES.open;
    const isPreparingToRecord = isRecording && connectionState !== SOCKET_STATES.open;

    const handleStartRecording = useCallback(async () => {
      if (microphoneState === MicrophoneState.Error) {
        toast.error('Microphone unavailable. Please check browser permissions and try again.');
        return;
      }
      isRejectingRef.current = false;
      transcriptInsertionIndexRef.current = -1;
      await startRecording();
    }, [microphoneState, startRecording]);

    const handleAcceptRecording = useCallback(() => {
      try {
        stopRecording();
      } catch {
        toast.error('Failed to stop recording. Please try again.');
      }
    }, [stopRecording]);

    const handleRejectRecording = useCallback(() => {
      try {
        isRejectingRef.current = true;
        const insertIdx = transcriptInsertionIndexRef.current;
        if (insertIdx !== -1) {
          onChange(valueRef.current.slice(0, insertIdx).trim());
        }
        transcriptInsertionIndexRef.current = -1;
        stopRecording();
      } catch {
        toast.error('Failed to stop recording. Please try again.');
      }
    }, [stopRecording, onChange]);

    const handleFileSelect = useCallback(
      async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const filesArray = Array.from(files);
        const uploading: (UploadedFile & { _originalFile: File })[] = filesArray.map((file) => ({
          id: crypto.randomUUID(),
          path: '',
          name: sanitizeFileName(file.name),
          file_type: file.type,
          file,
          _originalFile: file,
        }));

        setIsUploading(true);
        setFileReferences((prev) => [...prev, ...uploading]);

        try {
          const { successful, failed } = await handleFilesystemUploads(files, username, uploadMutations);

          if (failed.length > 0) {
            toast.error(`${failed.length} file(s) failed to upload.`);
          }

          // Build a map from original File object → uploaded path for O(1) lookup
          const successByFile = new Map(successful.map((s) => [s.file, s.path]));
          const failedFiles = new Set(failed.map((f) => f.file));
          const uploadingById = new Map(uploading.map((u) => [u.id, u]));

          setFileReferences((prev) => {
            const resolved = prev
              .map((f) => {
                const original = uploadingById.get(f.id);
                if (!original) return f; // not part of this batch
                if (failedFiles.has(original._originalFile)) return null; // failed — drop
                const path = successByFile.get(original._originalFile);
                return path ? { ...f, path } : null;
              })
              .filter((f): f is UploadedFile => f !== null);
            onFileReferencesChange(resolved.filter((r) => r.path).map((r) => ({ path: r.path, name: r.name })));
            return resolved;
          });
        } catch {
          toast.error('Failed to upload file. Please try again.');
          setFileReferences((prev) => prev.filter((f) => f.path !== ''));
        } finally {
          setIsUploading(false);
        }
      },
      [uploadMutations, onFileReferencesChange, username],
    );

    const handleRemoveFileReference = useCallback(
      (filePath: string) => {
        setFileReferences((prev) => {
          const next = prev.filter((f) => f.path !== filePath);
          onFileReferencesChange(next.filter((r) => r.path).map((r) => ({ path: r.path, name: r.name })));
          return next;
        });
      },
      [onFileReferencesChange],
    );

    const handleAttachClick = useCallback(() => {
      fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFileSelect(e.target.files);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
      [handleFileSelect],
    );

    const handlePaste = useCallback(
      (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const files = e.clipboardData?.files;
        if (files && files.length > 0) {
          e.preventDefault();
          handleFileSelect(files);
        }
      },
      [handleFileSelect],
    );

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
          microphoneDisabled={microphoneState === MicrophoneState.SettingUp}
          showSubmitButton={false}
          showFilePreview={showFilePreview}
        />
      </div>
    );
  },
);

ChatComposerInput.displayName = 'ChatComposerInput';
