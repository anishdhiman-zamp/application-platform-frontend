import { REQUEST_TYPES } from '@zamp-platform/api';
import {
  Block,
  BlockType,
  ButtonBlockType,
  ChatMessage,
  ChatMessageType,
  DisplayLayerActionType,
  LocationType,
  ResourceType,
  ScopeType,
  SenderType,
} from '@zamp-platform/chat';
import { ChartNoAxesColumn, Check, Loader } from 'lucide-react';
import { FEEDBACK_STATUS } from 'modules/feedback/feedback.constants';
import Image from 'next/image';
import { FEEDBACK_OPEN_ICON } from '@/constants/icons';
import { FeedbackItemType, LocationData } from '@/types/api/feedbacks.types';
import {
  DependentElementInteraction,
  PostInteractionPayloadType,
  PostInteractionResponseType,
} from '@/types/api/interaction.types';
import { defaultFn, MapAny } from '@/types/commonTypes';
import { getUserNameFromEmail } from '@/utils/common';

export const getFeedbackItems = (feedbackItems: FeedbackItemType[], annotationLocation: LocationData) => {
  const matchingFeedbackItems: FeedbackItemType[] = [];

  for (const item of feedbackItems) {
    const itemLocation = item.annotation_data.location;

    if (
      itemLocation.data.process_id !== annotationLocation.data.process_id ||
      itemLocation.data.activity_run_id !== annotationLocation.data.activity_run_id
    ) {
      continue;
    }

    if (
      annotationLocation.type === LocationType.DATASET_FIELD &&
      itemLocation.type === LocationType.DATASET_FIELD &&
      itemLocation.data.dataset_id === annotationLocation.data.dataset_id &&
      itemLocation.data.dataset_row_id === annotationLocation.data.dataset_row_id &&
      itemLocation.data.dataset_field_id === annotationLocation.data.dataset_field_id
    ) {
      matchingFeedbackItems.push(item);
    }

    if (
      annotationLocation.type === LocationType.LOG &&
      itemLocation.type === LocationType.LOG &&
      itemLocation.data.log_id === annotationLocation.data.log_id
    ) {
      matchingFeedbackItems.push(item);
    }

    if (annotationLocation.type === LocationType.ACTIVITY_RUN && itemLocation.type === LocationType.ACTIVITY_RUN) {
      matchingFeedbackItems.push(item);
    }
  }

  return matchingFeedbackItems;
};

export const getMessagePayload = (blockConfig: ButtonBlockType, payload: MapAny) => {
  let updatedText = blockConfig.payload.label;
  let textType = 'plain_text';

  if (blockConfig.action?.display_layer_action === DisplayLayerActionType.SEND_BUTTON_TEXT_WITH_SELECTED_OPTION) {
    blockConfig.action.dependent_elements?.forEach((element) => {
      updatedText += ' ' + payload[element].label;
      textType = payload[element].optionType;
    });
  }

  const messagePayload: ChatMessage = {
    resource_id: payload.resourceId,
    resource_type: payload.resourceType as ResourceType,
    message_content: {
      text: updatedText,
      text_type: textType,
      elements: [
        {
          id: `m_txt_${Date.now()}`,
          type: textType,
          order: 0,
          payload: {
            text: updatedText,
          },
        },
      ] as Block[],
    },
    message_type: ChatMessageType.TEXT,
    sender_type: SenderType.USER,
    timestamp: new Date().toISOString(),
    metadata: {},
    sender_name: payload.senderName,
  };

  return messagePayload;
};

export const getInteractionPayload = (blockConfig: ButtonBlockType, payload: MapAny) => {
  const dependentElementInteractions: DependentElementInteraction[] = [];

  if (blockConfig?.action?.dependent_elements?.length) {
    blockConfig.action.dependent_elements.forEach((element) => {
      dependentElementInteractions.push({
        element_id: element,
        payload: {
          selected_option_id: payload[element]?.value || '',
        },
      });
    });
  }

  const interactionPayload: PostInteractionPayloadType = {
    conversationId: payload.conversationId,
    messageId: payload.messageId,
    params: {
      resource_id: payload.resourceId,
      resource_type: payload.resourceType as ResourceType,
    },
    body: {
      interactions: [
        {
          element_id: blockConfig.id,
          payload: {
            is_clicked: true,
            dependent_elements_interactions: dependentElementInteractions,
          },
        },
      ],
    },
  };

  return interactionPayload;
};

export const getFeedbackItemConfig = (
  feedbackItem: FeedbackItemType,
  setCurrentFeedbackItem: (feedbackItem: FeedbackItemType) => void,
) => {
  switch (feedbackItem.status) {
    case FEEDBACK_STATUS.OPEN:
      return {
        icon: <Image src={FEEDBACK_OPEN_ICON} alt='feedback open' width={12} height={12} />,
        allowDelete: true,
        onCheck: () => setCurrentFeedbackItem(feedbackItem),
      };
    case FEEDBACK_STATUS.QUEUED:
      return {
        icon: <ChartNoAxesColumn size={12} className='rotate-90' />,
        onCheck: () => setCurrentFeedbackItem(feedbackItem),
        allowDelete: true,
      };
    case FEEDBACK_STATUS.PROCESSING:
      return {
        icon: <Loader size={12} className='mt-1' />,
        onCheck: defaultFn,
      };
    case FEEDBACK_STATUS.APPLIED:
      return {
        icon: <Check size={12} />,
        onCheck: defaultFn,
      };
    default:
      return {
        icon: null,
      };
  }
};

/**
 * Updates the messages array by finding and replacing the message with matching message_id
 * @param response - The response object containing message_id and the updated message
 * @param messages - The array of messages to update
 * @param resource_type - The type of resource
 * @param resource_id - The id of the resource
 * @returns Updated messages array with the replaced message content
 */
export const updateMessageInArray = (
  response: PostInteractionResponseType,
  messages: ChatMessage[],
  resource_type: ResourceType,
  resource_id: string,
): ChatMessage[] => {
  return messages.map((message) => {
    if (message.id === response.message_id) {
      return {
        resource_type: resource_type,
        resource_id: resource_id,
        message_content: response.message.content,
        message_type: ChatMessageType.TEXT,
        sender_type: response.message.sender_type as SenderType,
        metadata: {},
        timestamp: response.message.created_at,
        sender_name: response.message.sender_name,
        id: response.message_id,
        conversation_id: response.conversation_id,
      } as ChatMessage;
    }

    return message;
  });
};

export const createChatbotUrl = (annotationLocation: LocationData) => {
  let url = `/processes/${annotationLocation?.data?.process_id}/activity-logs/${annotationLocation?.data?.activity_run_id}?chatbot_process_id=${annotationLocation?.data?.process_id}&chatbot_activity_run_id=${annotationLocation?.data?.activity_run_id}`;

  switch (annotationLocation?.type) {
    case LocationType.DATASET_FIELD:
      url += `&chatbot_annotation_location_type=dataset_field&chatbot_dataset_id=${annotationLocation?.data?.dataset_id}&chatbot_dataset_row_id=${annotationLocation?.data?.dataset_row_id}&chatbot_dataset_field_id=${annotationLocation?.data?.dataset_field_id}`;
      break;
    case LocationType.LOG:
      url += `&chatbot_annotation_location_type=log&chatbot_log_id=${annotationLocation?.data?.log_id}`;
      break;
  }

  return url;
};

export const doesUrlMatchLocation = (searchParams: URLSearchParams, location: LocationData): boolean => {
  const urlType = searchParams.get('chatbot_annotation_location_type');

  if (urlType !== location.type) return false;

  // Check common fields
  const processId = searchParams.get('chatbot_process_id');
  const activityRunId = searchParams.get('chatbot_activity_run_id');

  if (processId !== location.data.process_id || activityRunId !== location.data.activity_run_id) {
    return false;
  }

  if (location.type === LocationType.DATASET_FIELD) {
    const datasetFieldId = searchParams.get('chatbot_dataset_field_id');

    if (datasetFieldId !== location.data.dataset_field_id) return false;

    // Check additional dataset fields
    const datasetId = searchParams.get('chatbot_dataset_id');
    const datasetRowId = searchParams.get('chatbot_dataset_row_id');

    return datasetId === location.data.dataset_id && datasetRowId === location.data.dataset_row_id;
  }

  if (location.type === LocationType.LOG) {
    const logId = searchParams.get('chatbot_log_id');

    return logId === location.data.log_id;
  }

  return true;
};

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
 * Creates a user message payload for chat
 * @param inputValue - The text content of the message
 * @param resourceId - The ID of the resource (e.g., process ID)
 * @param senderEmail - The email of the sender
 * @param attachments - Optional array of file attachments
 * @returns ChatMessage payload
 */
export const createUserMessagePayload = (
  inputValue: string,
  resourceId: string,
  senderEmail: string,
  attachments?: Array<{ file_id: string }>,
): ChatMessage => {
  return {
    resource_id: resourceId,
    resource_type: ResourceType.PROCESS,
    message_content: {
      text: inputValue,
      text_type: 'plain_text',
      elements: [
        {
          id: `m_txt_${Date.now()}`,
          type: BlockType.PLAIN_TEXT,
          order: 0,
          payload: {
            text: inputValue,
          },
        },
      ] as Block[],
      attachments: attachments && attachments.length > 0 ? attachments : undefined,
    },
    message_type: ChatMessageType.TEXT,
    sender_type: SenderType.USER,
    timestamp: new Date().toISOString(),
    metadata: {},
    sender_name: getUserNameFromEmail(senderEmail),
  };
};

export interface UploadedFile {
  file_id: string;
  file_name: string;
  file_type: string;
  file: File;
}

/**
 * Handles file upload to signed URL and returns uploaded file metadata
 * @param file - The file to upload
 * @param getSignedUrl - Function to get signed URL
 * @param uploadPath - API endpoint path for signed URL
 * @returns Promise with uploaded file metadata
 */
export const processFileUpload = async (
  file: File,
  getSignedUrl: (params: { path: string; payload: { file_name: string; file_type: string } }) => Promise<{
    upload_url: string;
    file_upload_id: string;
  }>,
  uploadPath: string,
): Promise<UploadedFile> => {
  const fileType = file.type || 'application/octet-stream';

  // Get signed URL
  const response = await getSignedUrl({
    path: uploadPath,
    payload: {
      file_name: file.name,
      file_type: fileType,
    },
  });

  // Upload file to signed URL
  await uploadFileToSignedUrl(response.upload_url, file, fileType);

  return {
    file_id: response.file_upload_id,
    file_name: file.name,
    file_type: fileType,
    file: file,
  };
};

/**
 * Processes multiple file uploads
 * @param files - FileList to upload
 * @param getSignedUrl - Function to get signed URL
 * @param uploadPath - API endpoint path for signed URL
 * @returns Promise with array of uploaded file metadata
 */
export const processMultipleFileUploads = async (
  files: FileList,
  getSignedUrl: (params: { path: string; payload: { file_name: string; file_type: string } }) => Promise<{
    upload_url: string;
    file_upload_id: string;
  }>,
  uploadPath: string,
): Promise<UploadedFile[]> => {
  const uploadPromises: Promise<UploadedFile>[] = [];

  for (let i = 0; i < files.length; i++) {
    uploadPromises.push(processFileUpload(files[i], getSignedUrl, uploadPath));
  }

  return Promise.all(uploadPromises);
};

/**
 * Handles file uploads with RTK Query mutation
 * @param files - FileList to upload
 * @param getSignedUrlMutation - RTK Query mutation function that returns signed URL
 * @param uploadPath - API endpoint path for signed URL
 * @returns Promise with array of uploaded file metadata
 */
export const handleFileUploadsWithMutation = async (
  files: FileList,
  getSignedUrlMutation: (params: {
    path: string;
    payload: { file_name: string; file_type: string };
  }) => Promise<
    { data: { upload_url: string; file_upload_id: string }; error?: undefined } | { data?: undefined; error: unknown }
  >,
  uploadPath: string,
): Promise<UploadedFile[]> => {
  const getSignedUrlWrapper = async (params: { path: string; payload: { file_name: string; file_type: string } }) => {
    const result = await getSignedUrlMutation(params);

    if ('error' in result) {
      throw new Error('Failed to get signed URL');
    }

    return result.data;
  };

  return processMultipleFileUploads(files, getSignedUrlWrapper, uploadPath);
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
 * Creates a conversation payload for initial conversation creation
 * @param processId - The process ID
 * @param activityRunId - The activity run ID
 * @param messageText - The text content of the first message
 * @param annotationLocation - The location data for annotation
 * @param senderEmail - The email of the sender
 * @param attachments - Optional array of file attachments
 * @returns Conversation creation payload
 */
export const createConversationPayload = (
  processId: string,
  activityRunId: string,
  messageText: string,
  annotationLocation: LocationData,
  senderEmail: string,
  attachments?: Array<{ file_id: string }>,
) => {
  return {
    resource_id: processId,
    resource_type: ResourceType.PROCESS,
    scope_type: ScopeType.ACTIVITY_RUN,
    scope_id: activityRunId,
    message_content: {
      text: messageText,
      text_type: 'plain_text',
      elements: [
        {
          id: 'm_txt_001',
          type: BlockType.PLAIN_TEXT,
          order: 0,
          payload: {
            text: messageText,
          },
        },
      ] as Block[],
      attachments: attachments && attachments.length > 0 ? attachments : undefined,
    },
    annotation_data: {
      location: annotationLocation,
    },
    sender_name: getUserNameFromEmail(senderEmail),
  };
};
