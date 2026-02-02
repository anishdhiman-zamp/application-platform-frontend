'use client';

import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

import { API_ENDPOINTS, useGetSignedUrlMutation, usePostFormsSignedUploadAckMutation } from '../api';
import { handleFileUploads } from '../utils/fileUpload';

interface UploadedFile {
  file_id: string;
  file_name: string;
  file_type?: string;
}

export interface UseFileUploadOptions {
  organizationId?: string;
  maxFiles?: number;
  maxFileSizeBytes?: number;
  acceptedMimeTypes?: string;
  onUploadSuccess?: (files: UploadedFile[]) => void;
  onUploadError?: (error: unknown) => void;
  validateFileType?: (file: File) => boolean;
  getMimeType?: (fileType: string) => string;
}

export interface UseFileUploadReturn {
  files: UploadedFile[];
  isUploading: boolean;
  isDragOver: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  dropZoneProps: {
    onDragEnter: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
  };
  handleFileSelect: (fileList: FileList | null) => Promise<void>;
  handleFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  openFilePicker: () => void;
  removeFile: (fileId: string) => void;
  clearFiles: () => void;
  canAddMoreFiles: boolean;
  remainingSlots: number;
}

const DEFAULT_MAX_FILES = 5;
const DEFAULT_MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;

export const useFileUpload = ({
  organizationId,
  maxFiles = DEFAULT_MAX_FILES,
  maxFileSizeBytes = DEFAULT_MAX_FILE_SIZE_BYTES,
  acceptedMimeTypes,
  onUploadSuccess,
  onUploadError,
  validateFileType,
  getMimeType,
}: UseFileUploadOptions = {}): UseFileUploadReturn => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const dragCounterRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [getSignedUrl] = useGetSignedUrlMutation();
  const [postFormsSignedUploadAck] = usePostFormsSignedUploadAckMutation();

  const maxFileSizeMB = Math.round(maxFileSizeBytes / (1024 * 1024));

  const isFileTypeAccepted = useCallback(
    (file: File): boolean => {
      if (validateFileType) {
        return validateFileType(file);
      }

      if (!acceptedMimeTypes) return true;

      const mimeType = file.type.toLowerCase();
      const acceptedTypes = acceptedMimeTypes.split(',').map((t) => t.trim().toLowerCase());

      return acceptedTypes.some((acceptedType) => {
        if (acceptedType.endsWith('/*')) {
          const prefix = acceptedType.slice(0, -2);
          return mimeType.startsWith(prefix);
        }
        return mimeType === acceptedType;
      });
    },
    [acceptedMimeTypes, validateFileType],
  );

  const validateFiles = useCallback(
    (filesToValidate: File[]): { valid: File[]; errors: string[] } => {
      const valid: File[] = [];
      const errors: string[] = [];

      const remainingSlots = maxFiles - files.length;
      if (filesToValidate.length > remainingSlots) {
        errors.push(`You can only add ${remainingSlots} more file${remainingSlots !== 1 ? 's' : ''}`);
        filesToValidate = filesToValidate.slice(0, remainingSlots);
      }

      for (const file of filesToValidate) {
        if (!isFileTypeAccepted(file)) {
          errors.push(`${file.name}: File type not allowed`);
          continue;
        }
        if (file.size > maxFileSizeBytes) {
          errors.push(`${file.name}: File size exceeds ${maxFileSizeMB}MB limit`);
          continue;
        }
        valid.push(file);
      }

      return { valid, errors };
    },
    [files.length, maxFiles, maxFileSizeBytes, maxFileSizeMB, isFileTypeAccepted],
  );

  const uploadFiles = useCallback(
    async (filesToUpload: File[]) => {
      if (!organizationId || filesToUpload.length === 0) return;

      // Optimistically add files with empty file_id to show loading state
      const uploadingFiles: UploadedFile[] = filesToUpload.map((file) => ({
        file_id: '',
        file_name: file.name,
        file_type: file.type,
      }));

      setIsUploading(true);
      setFiles((prev) => [...prev, ...uploadingFiles]);

      try {
        const dataTransfer = new DataTransfer();
        filesToUpload.forEach((file) => dataTransfer.items.add(file));

        const result = await handleFileUploads(
          dataTransfer.files,
          getSignedUrl,
          API_ENDPOINTS.FORMS_SIGNED_UPLOAD_URL_POST,
          organizationId,
          postFormsSignedUploadAck,
          getMimeType,
        );

        const failedFileNames = new Set(result.failed.map((f) => f.file.name));

        setFiles((prev) => {
          const tempEntriesMap = new Map<string, number>();
          prev.forEach((item, index) => {
            if (item.file_id === '' && !tempEntriesMap.has(item.file_name)) {
              tempEntriesMap.set(item.file_name, index);
            }
          });

          const updated = prev.filter((att) => {
            if (att.file_id !== '') return true;
            if (failedFileNames.has(att.file_name)) return false;
            return true;
          });

          const updatedTempEntriesMap = new Map<string, number>();
          updated.forEach((item, index) => {
            if (item.file_id === '' && !updatedTempEntriesMap.has(item.file_name)) {
              updatedTempEntriesMap.set(item.file_name, index);
            }
          });

          result.successful.forEach((newAttachment) => {
            const index = updatedTempEntriesMap.get(newAttachment.file_name);
            if (index !== undefined) {
              updated[index] = {
                file_id: newAttachment.file_id,
                file_name: newAttachment.file_name,
                file_type: newAttachment.file_type,
              };
            } else {
              updated.push({
                file_id: newAttachment.file_id,
                file_name: newAttachment.file_name,
                file_type: newAttachment.file_type,
              });
            }
          });

          return updated;
        });

        if (result.failed.length > 0) {
          result.failed.forEach(({ file }) => {
            toast.error(`Failed to upload ${file.name}`);
          });
        }

        if (result.successful.length > 0) {
          const newFiles: UploadedFile[] = result.successful.map((uploaded) => ({
            file_id: uploaded.file_id,
            file_name: uploaded.file_name,
            file_type: uploaded.file_type,
          }));
          onUploadSuccess?.(newFiles);
        }
      } catch (error) {
        setFiles((prev) => prev.filter((f) => f.file_id !== ''));
        toast.error('Failed to upload files');
        onUploadError?.(error);
      } finally {
        setIsUploading(false);
      }
    },
    [organizationId, getSignedUrl, postFormsSignedUploadAck, onUploadSuccess, onUploadError, getMimeType],
  );

  const handleFileSelect = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;

      const fileArray = Array.from(fileList);
      const { valid, errors } = validateFiles(fileArray);

      errors.forEach((error) => toast.error(error));

      if (valid.length > 0) {
        await uploadFiles(valid);
      }
    },
    [validateFiles, uploadFiles],
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFileSelect(e.target.files);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [handleFileSelect],
  );

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const removeFile = useCallback((fileIdOrName: string) => {
    setFiles((prev) => prev.filter((f) => f.file_id !== fileIdOrName && f.file_name !== fileIdOrName));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      dragCounterRef.current = 0;

      const droppedFiles = e.dataTransfer?.files;
      if (droppedFiles) {
        handleFileSelect(droppedFiles);
      }
    },
    [handleFileSelect],
  );

  const canAddMoreFiles = files.length < maxFiles;
  const remainingSlots = maxFiles - files.length;

  return {
    files,
    isUploading,
    isDragOver,
    fileInputRef,
    dropZoneProps: {
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
    },
    handleFileSelect,
    handleFileInputChange,
    openFilePicker,
    removeFile,
    clearFiles,
    canAddMoreFiles,
    remainingSlots,
  };
};

export default useFileUpload;
