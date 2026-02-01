'use client';

import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

import { API_ENDPOINTS, useGetSignedUrlMutation, usePostFormsSignedUploadAckMutation } from '../api';
import { handleFileUploads } from '../utils/fileUpload';

export interface UploadedFile {
  file_id: string;
  file_name: string;
  file_type?: string;
}

export interface UseFileUploadOptions {
  /** Organization ID required for file uploads */
  organizationId?: string;
  /** Maximum number of files allowed */
  maxFiles?: number;
  /** Maximum file size in bytes */
  maxFileSizeBytes?: number;
  /** Accepted MIME types (e.g., 'image/*,video/*') */
  acceptedMimeTypes?: string;
  /** Callback when files are successfully uploaded */
  onUploadSuccess?: (files: UploadedFile[]) => void;
  /** Callback when file upload fails */
  onUploadError?: (error: unknown) => void;
  /** Custom file type validator */
  validateFileType?: (file: File) => boolean;
  /** Function to map MIME type to file extension for backend API */
  getMimeType?: (fileType: string) => string;
}

export interface UseFileUploadReturn {
  /** Currently uploaded files */
  files: UploadedFile[];
  /** Whether files are currently being uploaded */
  isUploading: boolean;
  /** Whether drag is currently over the drop zone */
  isDragOver: boolean;
  /** Reference to the file input element */
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  /** Props to spread on the drop zone element */
  dropZoneProps: {
    onDragEnter: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
  };
  /** Handle file selection from input or drop */
  handleFileSelect: (fileList: FileList | null) => Promise<void>;
  /** Handle file input change event */
  handleFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Open file picker dialog */
  openFilePicker: () => void;
  /** Remove a file by ID */
  removeFile: (fileId: string) => void;
  /** Clear all files */
  clearFiles: () => void;
  /** Check if more files can be added */
  canAddMoreFiles: boolean;
  /** Number of remaining file slots */
  remainingSlots: number;
}

const DEFAULT_MAX_FILES = 5;
const DEFAULT_MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB

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

  /**
   * Check if a file type is accepted based on MIME type patterns
   */
  const isFileTypeAccepted = useCallback(
    (file: File): boolean => {
      // Use custom validator if provided
      if (validateFileType) {
        return validateFileType(file);
      }

      // If no accepted types specified, accept all
      if (!acceptedMimeTypes) return true;

      const mimeType = file.type.toLowerCase();
      const acceptedTypes = acceptedMimeTypes.split(',').map((t) => t.trim().toLowerCase());

      return acceptedTypes.some((acceptedType) => {
        if (acceptedType.endsWith('/*')) {
          // Wildcard match (e.g., 'image/*')
          const prefix = acceptedType.slice(0, -2);
          return mimeType.startsWith(prefix);
        }
        return mimeType === acceptedType;
      });
    },
    [acceptedMimeTypes, validateFileType],
  );

  /**
   * Validate files and return valid files with any errors
   */
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

  /**
   * Upload files to S3 via presigned URLs
   */
  const uploadFiles = useCallback(
    async (filesToUpload: File[]) => {
      if (!organizationId || filesToUpload.length === 0) return;

      setIsUploading(true);

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

          setFiles((prev) => [...prev, ...newFiles]);
          onUploadSuccess?.(newFiles);
        }
      } catch (error) {
        toast.error('Failed to upload files');
        onUploadError?.(error);
      } finally {
        setIsUploading(false);
      }
    },
    [organizationId, getSignedUrl, postFormsSignedUploadAck, onUploadSuccess, onUploadError, getMimeType],
  );

  /**
   * Handle file selection from input or drop
   */
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

  /**
   * Handle file input change event
   */
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFileSelect(e.target.files);
      // Reset the input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [handleFileSelect],
  );

  /**
   * Open file picker dialog
   */
  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  /**
   * Remove a file by ID
   */
  const removeFile = useCallback((fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.file_id !== fileId));
  }, []);

  /**
   * Clear all files
   */
  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  // Drag and drop handlers
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
