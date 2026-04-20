'use client';

import { toast } from '@zamp-platform/ui';
import { useCallback, useRef, useState } from 'react';

import { handleFilesystemUploads, sanitizeFileName } from '../utils/filesystemUpload';
import type { UploadedFile } from './useChatInput';
import { useFilesystemMutations } from './useFilesystemMutations';

export interface FileReference {
  path: string;
  name: string;
}

interface UseFilesystemFileUploadParams {
  username: string;
  onFileReferencesChange: (refs: FileReference[]) => void;
}

interface UseFilesystemFileUploadReturn {
  fileReferences: UploadedFile[];
  isUploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleRemoveFileReference: (filePath: string) => void;
  handleAttachClick: () => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
}

export const useFilesystemFileUpload = ({
  username,
  onFileReferencesChange,
}: UseFilesystemFileUploadParams): UseFilesystemFileUploadReturn => {
  const [fileReferences, setFileReferences] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadMutations } = useFilesystemMutations();

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const uploading: (UploadedFile & { _originalFile: File })[] = Array.from(files).map((file) => ({
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

        const successByFile = new Map(successful.map((s) => [s.file, s.path]));
        const failedFiles = new Set(failed.map((f) => f.file));
        const uploadingById = new Map(uploading.map((u) => [u.id, u]));

        setFileReferences((prev) => {
          const resolved = prev
            .map((f) => {
              const original = uploadingById.get(f.id);
              if (!original) return f;
              if (failedFiles.has(original._originalFile)) return null;
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
      void handleFileSelect(e.target.files);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [handleFileSelect],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const files = e.clipboardData?.files;
      if (files && files.length > 0) {
        e.preventDefault();
        void handleFileSelect(files);
      }
    },
    [handleFileSelect],
  );

  return {
    fileReferences,
    isUploading,
    fileInputRef,
    handleRemoveFileReference,
    handleAttachClick,
    handleFileChange,
    handlePaste,
  };
};
