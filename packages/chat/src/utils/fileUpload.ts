import { REQUEST_TYPES } from '@zamp-platform/api';

import { UploadedFile } from '../hooks/useChatInput';

/**
 * Signed URL response type
 */
export interface SignedUrlResponse {
  upload_url: string;
  file_upload_id: string;
}

/**
 * Parameters for getting a signed URL
 */
export interface SignedUrlParams {
  path: string;
  payload: {
    file_name: string;
    file_type: string;
    organization_id: string;
  };
}

/**
 * Function type for getting a signed URL
 */
export type GetSignedUrlFn = (params: SignedUrlParams) => Promise<SignedUrlResponse>;

/**
 * Function type for acknowledging file upload
 */
export type PostUploadAckFn = (params: { fileImportId: string }) => Promise<unknown>;

/**
 * Uploads a file to a signed URL using XMLHttpRequest
 * @param uploadUrl - The signed URL to upload the file to
 * @param file - The file to upload
 * @param fileType - The MIME type of the file
 * @returns Promise that resolves to true if upload succeeds, rejects on failure
 */
export const uploadFileToSignedUrl = async (uploadUrl: string, file: File, fileType: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open(REQUEST_TYPES.PUT, uploadUrl, true);
    xhr.setRequestHeader('Content-Type', fileType);

    xhr.onload = function () {
      if (xhr.status === 200) {
        resolve(true);
      } else {
        reject(new Error('Upload failed'));
      }
    };

    xhr.onerror = function () {
      reject(new Error('Upload failed'));
    };

    xhr.send(file);
  });
};

/**
 * Handles file upload to signed URL and returns uploaded file metadata
 * @param file - The file to upload
 * @param getSignedUrl - Function to get signed URL
 * @param uploadPath - API endpoint path for signed URL
 * @param organizationId - Organization ID for the upload
 * @param postUploadAck - Optional function to call after successful upload
 * @param getMimeType - Optional function to map file type to MIME type
 * @returns Promise with uploaded file metadata
 */
export const processFileUpload = async (
  file: File,
  getSignedUrl: GetSignedUrlFn,
  uploadPath: string,
  organizationId: string,
  postUploadAck?: PostUploadAckFn,
  getMimeType?: (fileType: string) => string,
): Promise<UploadedFile> => {
  const fileType = file.type || 'application/octet-stream';
  const mappedFileType = getMimeType ? getMimeType(fileType) : fileType;

  // Get signed URL
  const response = await getSignedUrl({
    path: uploadPath,
    payload: {
      file_name: file.name,
      file_type: mappedFileType,
      organization_id: organizationId,
    },
  });

  // Upload file to signed URL
  await uploadFileToSignedUrl(response.upload_url, file, fileType);

  // Call postUploadAck after successful upload
  if (postUploadAck) {
    await postUploadAck({ fileImportId: response.file_upload_id });
  }

  return {
    file_id: response.file_upload_id,
    file_name: file.name,
    file_type: fileType,
    file: file,
  };
};

/**
 * Result type for multiple file uploads
 */
export interface MultipleFileUploadResult {
  successful: UploadedFile[];
  failed: { file: File; error: unknown }[];
}

/**
 * Processes multiple file uploads
 * @param files - FileList to upload
 * @param getSignedUrl - Function to get signed URL
 * @param uploadPath - API endpoint path for signed URL
 * @param organizationId - Organization ID for the upload
 * @param postUploadAck - Optional function to call after successful upload
 * @param getMimeType - Optional function to map file type to MIME type
 * @returns Promise with object containing successful uploads and failed uploads
 */
export const processMultipleFileUploads = async (
  files: FileList,
  getSignedUrl: GetSignedUrlFn,
  uploadPath: string,
  organizationId: string,
  postUploadAck?: PostUploadAckFn,
  getMimeType?: (fileType: string) => string,
): Promise<MultipleFileUploadResult> => {
  const uploadPromises: Promise<UploadedFile>[] = [];
  const fileArray = Array.from(files);

  for (let i = 0; i < files.length; i++) {
    uploadPromises.push(
      processFileUpload(files[i], getSignedUrl, uploadPath, organizationId, postUploadAck, getMimeType),
    );
  }

  const results = await Promise.allSettled(uploadPromises);

  const successful: UploadedFile[] = [];
  const failed: { file: File; error: unknown }[] = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      successful.push(result.value);
    } else {
      failed.push({ file: fileArray[index], error: result.reason });
    }
  });

  return { successful, failed };
};

/**
 * Wraps an RTK Query mutation for getSignedUrl to handle errors
 * @param getSignedUrlMutation - RTK Query mutation function that returns signed URL
 * @returns Wrapped function that throws on error
 */
export const wrapGetSignedUrl = (
  getSignedUrlMutation: (
    params: SignedUrlParams,
  ) => Promise<{ data: SignedUrlResponse; error?: undefined } | { data?: undefined; error: unknown }>,
): GetSignedUrlFn => {
  return async (params: SignedUrlParams) => {
    const result = await getSignedUrlMutation(params);

    if ('error' in result) {
      throw new Error('Failed to get signed URL');
    }

    return result.data;
  };
};

/**
 * Wraps an RTK Query mutation for postUploadAck to handle errors
 * @param postUploadAckMutation - RTK Query mutation function
 * @returns Wrapped function that throws on error
 */
export const wrapPostUploadAck = (
  postUploadAckMutation: (params: {
    fileImportId: string;
  }) => Promise<{ data: void; error?: undefined } | { data?: undefined; error: unknown }>,
): PostUploadAckFn => {
  return async (params: { fileImportId: string }) => {
    const result = await postUploadAckMutation(params);

    if ('error' in result) {
      throw new Error('Failed to acknowledge file upload');
    }

    return result.data;
  };
};

/**
 * Handles file uploads with RTK Query mutations
 * @param files - FileList to upload
 * @param getSignedUrlMutation - RTK Query mutation function that returns signed URL
 * @param uploadPath - API endpoint path for signed URL
 * @param organizationId - Organization ID for the upload
 * @param postUploadAckMutation - Optional RTK Query mutation to call after successful upload
 * @param getMimeType - Optional function to map file type to MIME type
 * @returns Promise with object containing successful uploads and failed uploads
 */
export const handleFileUploads = async (
  files: FileList,
  getSignedUrlMutation: (
    params: SignedUrlParams,
  ) => Promise<{ data: SignedUrlResponse; error?: undefined } | { data?: undefined; error: unknown }>,
  uploadPath: string,
  organizationId: string,
  postUploadAckMutation?: (params: {
    fileImportId: string;
  }) => Promise<{ data: void; error?: undefined } | { data?: undefined; error: unknown }>,
  getMimeType?: (fileType: string) => string,
): Promise<MultipleFileUploadResult> => {
  const getSignedUrlWrapper = wrapGetSignedUrl(getSignedUrlMutation);
  const postUploadAckWrapper = postUploadAckMutation ? wrapPostUploadAck(postUploadAckMutation) : undefined;

  return processMultipleFileUploads(
    files,
    getSignedUrlWrapper,
    uploadPath,
    organizationId,
    postUploadAckWrapper,
    getMimeType,
  );
};

/**
 * Checks if Enter key was pressed without Shift
 * @param event - Keyboard event
 * @returns true if Enter without Shift, false otherwise
 */
export const isSubmitKeyPress = (event: React.KeyboardEvent): boolean => {
  return event.key === 'Enter' && !event.shiftKey;
};

/**
 * Checks if a file type is accepted based on accepted file types string
 * @param file - The file to check
 * @param acceptedFileTypes - Comma-separated string of accepted file types (e.g., '.pdf,.png,image/*')
 * @returns true if the file type is accepted, false otherwise
 */
export const formatRejectedExtensions = (rejectedExtensions: string[]): string => {
  if (rejectedExtensions.length === 1) {
    return rejectedExtensions[0];
  } else if (rejectedExtensions.length === 2) {
    return `${rejectedExtensions[0]} and ${rejectedExtensions[1]}`;
  } else {
    const lastExtension = rejectedExtensions.pop();
    return `${rejectedExtensions.join(', ')}, and ${lastExtension}`;
  }
};

export const isFileTypeAccepted = (file: File, acceptedFileTypes?: string): boolean => {
  if (!acceptedFileTypes) return true;

  const acceptedTypes = acceptedFileTypes.split(',').map((type) => type.trim().toLowerCase());
  const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
  const fileMimeType = file.type.toLowerCase();

  return acceptedTypes.some((acceptedType) => {
    if (acceptedType.includes('/')) {
      if (acceptedType.endsWith('/*')) {
        const mimePrefix = acceptedType.slice(0, -2);
        return fileMimeType.startsWith(mimePrefix);
      }
      return fileMimeType === acceptedType;
    }
    return fileExtension === acceptedType;
  });
};
