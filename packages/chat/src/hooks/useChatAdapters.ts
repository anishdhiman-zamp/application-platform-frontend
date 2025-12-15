'use client';

import { useCallback, useMemo } from 'react';

import { ResourceType } from '../types/chat.types';
import { TranscriptionAdapter } from '../types/transcription.types';
import { handleFileUploads, SignedUrlParams, SignedUrlResponse } from '../utils/fileUpload';
import { ChatInputAdapter, UploadedFile } from './useChatInput';

/**
 * Configuration for creating chat adapters
 */
export interface ChatAdaptersConfig {
  // User context
  getCurrentUserName: () => string;
  getProcessId: () => string;
  getActivityRunId: () => string;
  getOrganizationId: () => string;

  // File upload mutations
  getSignedUrlMutation: (
    params: SignedUrlParams,
  ) => Promise<{ data: SignedUrlResponse; error?: undefined } | { data?: undefined; error: unknown }>;
  postUploadAckMutation?: (params: {
    fileImportId: string;
  }) => Promise<{ data: void; error?: undefined } | { data?: undefined; error: unknown }>;
  uploadPath: string;
  getMimeType?: (fileType: string) => string;

  // Interaction disable mutation
  disableInteractionMutation?: (params: {
    conversationId: string;
    messageId: string;
    params: {
      resource_id: string;
      resource_type: ResourceType;
    };
  }) => Promise<unknown>;

  // Transcription token getters
  getDeepgramToken?: () => Promise<string>;
  getElevenLabsToken?: () => Promise<string>;

  // Error/success handlers
  onError?: (error: unknown) => void;
  onSuccess?: (message: string) => void;
}

/**
 * Return type for useChatAdapters hook
 */
export interface ChatAdaptersResult {
  chatInputAdapter: ChatInputAdapter;
  transcriptionAdapter: TranscriptionAdapter;
}

/**
 * Hook that creates chat adapters from provided configuration
 * This centralizes adapter creation logic so it can be reused across different layouts
 *
 * @param config - Configuration object with mutations and context getters
 * @returns Object containing chatInputAdapter and transcriptionAdapter
 *
 * @example
 * ```tsx
 * const { chatInputAdapter, transcriptionAdapter } = useChatAdapters({
 *   getCurrentUserName: () => currentUserName || '',
 *   getProcessId: () => processId,
 *   getActivityRunId: () => activityRunId,
 *   getOrganizationId: () => organizationId,
 *   getSignedUrlMutation: getSignedUrl,
 *   postUploadAckMutation: postFormsSignedUploadAck,
 *   uploadPath: API_ENDPOINTS.FORMS_SIGNED_UPLOAD_URL_POST,
 *   disableInteractionMutation: postInteractionDisable,
 *   getElevenLabsToken: async () => {
 *     const result = await getSpeechToTextAccessToken({}).unwrap();
 *     return result.access_token;
 *   },
 *   onError: (error) => {
 *     captureException(error);
 *     toast.error('An error occurred');
 *   },
 *   onSuccess: (message) => toast.success(message),
 * });
 * ```
 */
export function useChatAdapters(config: ChatAdaptersConfig): ChatAdaptersResult {
  const {
    getCurrentUserName,
    getProcessId,
    getActivityRunId,
    getOrganizationId,
    getSignedUrlMutation,
    postUploadAckMutation,
    uploadPath,
    getMimeType,
    disableInteractionMutation,
    getDeepgramToken,
    getElevenLabsToken,
    onError,
    onSuccess,
  } = config;

  // Create upload files function
  const uploadFiles = useCallback(
    async (files: FileList): Promise<UploadedFile[]> => {
      return handleFileUploads(
        files,
        getSignedUrlMutation,
        uploadPath,
        getOrganizationId(),
        postUploadAckMutation,
        getMimeType,
      );
    },
    [getSignedUrlMutation, uploadPath, getOrganizationId, postUploadAckMutation, getMimeType],
  );

  // Create disable interaction function
  const disableInteraction = useCallback(
    async (interactionParams: {
      conversationId: string;
      messageId: string;
      resourceId: string;
      resourceType: string;
    }) => {
      if (disableInteractionMutation) {
        await disableInteractionMutation({
          conversationId: interactionParams.conversationId,
          messageId: interactionParams.messageId,
          params: {
            resource_id: interactionParams.resourceId,
            resource_type: interactionParams.resourceType as ResourceType,
          },
        });
      }
    },
    [disableInteractionMutation],
  );

  // Create chat input adapter
  const chatInputAdapter: ChatInputAdapter = useMemo(
    () => ({
      getCurrentUserName,
      getProcessId,
      getActivityRunId,
      uploadFiles,
      disableInteraction: disableInteractionMutation ? disableInteraction : undefined,
      onError,
      onSuccess,
    }),
    [
      getCurrentUserName,
      getProcessId,
      getActivityRunId,
      uploadFiles,
      disableInteraction,
      disableInteractionMutation,
      onError,
      onSuccess,
    ],
  );

  // Create transcription adapter
  const transcriptionAdapter: TranscriptionAdapter = useMemo(
    () => ({
      getDeepgramToken,
      getElevenLabsToken,
      onError,
    }),
    [getDeepgramToken, getElevenLabsToken, onError],
  );

  return {
    chatInputAdapter,
    transcriptionAdapter,
  };
}

export default useChatAdapters;
