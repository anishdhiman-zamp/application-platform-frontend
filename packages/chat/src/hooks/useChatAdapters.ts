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
import { handleFileUploads } from '../utils/fileUpload';
import { ChatInputAdapter, UploadedFile } from './useChatInput';

/**
 * Configuration for creating chat adapters
 */
export interface ChatAdaptersConfig {
  getCurrentUserName: () => string;
  getProcessId: () => string;
  getActivityRunId: () => string;
  getOrganizationId: () => string;
  getMimeType?: (fileType: string) => string;
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
 *   getProcessId: () => processId,
 *   getActivityRunId: () => activityRunId,
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
  const { getCurrentUserName, getProcessId, getActivityRunId, getOrganizationId, getMimeType, onError, onSuccess } =
    config;

  const [getSignedUrl] = useGetSignedUrlMutation();
  const [postFormsSignedUploadAck] = usePostFormsSignedUploadAckMutation();
  const [postInteractionDisable] = usePostInteractionDisableMutation();
  const [getSpeechToTextAccessToken] = useLazyGetSpeechToTextAccessTokenQuery({});

  const uploadFiles = useCallback(
    async (files: FileList): Promise<UploadedFile[]> => {
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

  const getElevenLabsToken = useCallback(async () => {
    const result = await getSpeechToTextAccessToken({}).unwrap();

    return result.access_token;
  }, [getSpeechToTextAccessToken]);

  const chatInputAdapter: ChatInputAdapter = useMemo(
    () => ({
      getCurrentUserName,
      getProcessId,
      getActivityRunId,
      uploadFiles,
      disableInteraction,
      onError,
      onSuccess,
    }),
    [getCurrentUserName, getProcessId, getActivityRunId, uploadFiles, disableInteraction, onError, onSuccess],
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
