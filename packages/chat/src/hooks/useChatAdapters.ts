'use client';

import { useCallback, useMemo } from 'react';

import {
  API_ENDPOINTS,
  useGetSignedUrlMutation,
  useLazyGetSpeechToTextAccessTokenQuery,
  usePostFormsSignedUploadAckMutation,
  usePostInteractionDisableMutation,
} from '../api';
import { ResourceType } from '../types/chat.types';
import { TranscriptionAdapter } from '../types/transcription.types';
import { handleFileUploads, MultipleFileUploadResult } from '../utils/fileUpload';
import { ChatInputAdapter } from './useChatInput';

/**
 * Configuration for creating chat adapters
 */
export interface ChatAdaptersConfig {
  getCurrentUserName: () => string;
  getResourceId: () => string;
  getScopeId: () => string;
  getOrganizationId: () => string;
  getMimeType?: (fileType: string) => string;
  onError?: (error: unknown) => void;
  onSuccess?: (message: string) => void;
  /**
   * Optional custom token getter for ElevenLabs speech-to-text.
   * If not provided, the default implementation using chatApi will be used.
   * Use this if you need to use a different API slice (e.g., baseApi) for token fetching.
   */
  getElevenLabsToken?: () => Promise<string>;
}

/**
 * Return type for useChatAdapters hook
 */
export interface ChatAdaptersResult {
  chatInputAdapter: ChatInputAdapter;
  transcriptionAdapter: TranscriptionAdapter;
}

/**
 * Hook that creates chat adapters with all API hooks called internally.
 * This is a plug-and-play hook - just provide context getters and callbacks.
 *
 * @param config - Configuration object with context getters and callbacks
 * @returns Object containing chatInputAdapter and transcriptionAdapter
 *
 * @example
 * ```tsx
 * const { chatInputAdapter, transcriptionAdapter } = useChatAdapters({
 *   getCurrentUserName: () => currentUserName || '',
 *   getResourceId: () => processId,
 *   getScopeId: () => activityRunId,
 *   getOrganizationId: () => organizationId,
 *   getMimeType: (fileType) => FileMimeType[fileType] ?? fileType,
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
    getResourceId,
    getScopeId,
    getOrganizationId,
    getMimeType,
    onError,
    onSuccess,
    getElevenLabsToken: customGetElevenLabsToken,
  } = config;

  const [getSignedUrl] = useGetSignedUrlMutation();
  const [postFormsSignedUploadAck] = usePostFormsSignedUploadAckMutation();
  const [postInteractionDisable] = usePostInteractionDisableMutation();
  // Always call the hook unconditionally to satisfy rules of hooks
  const [getSpeechToTextAccessToken] = useLazyGetSpeechToTextAccessTokenQuery({});

  const uploadFiles = useCallback(
    async (files: FileList): Promise<MultipleFileUploadResult> => {
      return handleFileUploads(
        files,
        getSignedUrl,
        API_ENDPOINTS.FORMS_SIGNED_UPLOAD_URL_POST,
        getOrganizationId(),
        postFormsSignedUploadAck,
        getMimeType,
      );
    },
    [getSignedUrl, getOrganizationId, postFormsSignedUploadAck, getMimeType],
  );

  const disableInteraction = useCallback(
    async (interactionParams: {
      conversationId: string;
      messageId: string;
      resourceId: string;
      resourceType: string;
    }) => {
      await postInteractionDisable({
        conversationId: interactionParams.conversationId,
        messageId: interactionParams.messageId,
        params: {
          resource_id: interactionParams.resourceId,
          resource_type: interactionParams.resourceType as ResourceType,
        },
      });
    },
    [postInteractionDisable],
  );

  // Default implementation using chatApi
  const defaultGetElevenLabsToken = useCallback(async () => {
    try {
      const result = await getSpeechToTextAccessToken({}).unwrap();
      return result.access_token;
    } catch (error) {
      onError?.(error);
      throw error;
    }
  }, [getSpeechToTextAccessToken, onError]);

  // Use custom token getter if provided, otherwise use default
  const getElevenLabsToken = customGetElevenLabsToken || defaultGetElevenLabsToken;

  const chatInputAdapter: ChatInputAdapter = useMemo(
    () => ({
      getCurrentUserName,
      getResourceId,
      getScopeId,
      uploadFiles,
      disableInteraction,
      onError,
      onSuccess,
    }),
    [getCurrentUserName, getResourceId, getScopeId, uploadFiles, disableInteraction, onError, onSuccess],
  );

  const transcriptionAdapter: TranscriptionAdapter = useMemo(
    () => ({
      getElevenLabsToken,
      onError,
    }),
    [getElevenLabsToken, onError],
  );

  return {
    chatInputAdapter,
    transcriptionAdapter,
  };
}

export default useChatAdapters;
