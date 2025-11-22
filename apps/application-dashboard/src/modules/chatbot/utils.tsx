import { REQUEST_TYPES } from '@zamp-platform/api';
import {
  Block,
  BlockType,
  ButtonBlockType,
  ChatMessage,
  ChatMessageType,
  DisplayLayerActionType,
  LocationData,
  LocationType,
  MessageAttachmentType,
  ResourceType,
  ScopeType,
  SenderType,
} from '@zamp-platform/chat';
import { ChartNoAxesColumn, Check, Loader } from 'lucide-react';
import { FileMimeType } from 'modules/data/components/importDataset/importData.constants';
import { FEEDBACK_STATUS } from 'modules/feedback/feedback.constants';
import Image from 'next/image';
import { FEEDBACK_OPEN_ICON } from '@/constants/icons';
import { store } from '@/store';
import { FeedbackItemType } from '@/types/api/feedbacks.types';
import { SignedUrlBodyType, SignedUrlResponseType } from '@/types/api/fileUpload.types';
import {
  DependentElementInteraction,
  PostInteractionPayloadType,
  PostInteractionResponseType,
} from '@/types/api/interaction.types';
import { defaultFn, MapAny } from '@/types/commonTypes';

/**
 * Generates a unique ID for a chatbot instance based on annotation location
 * @param annotationLocation - The location data for annotation
 * @returns Unique chatbot instance ID string
 */
export const generateChatbotInstanceId = (annotationLocation: LocationData): string => {
  const { type, data } = annotationLocation;
  const parts = [
    type,
    data.process_id,
    data.activity_run_id,
    'dataset_id' in data ? data.dataset_id : undefined,
    'dataset_row_id' in data ? data.dataset_row_id : undefined,
    'dataset_field_id' in data ? data.dataset_field_id : undefined,
    'log_id' in data ? data.log_id : undefined,
  ].filter(Boolean);

  return `chatbot-${parts.join('-')}`;
};

export const getFeedbackItems = (feedbackItems: FeedbackItemType[], annotationLocation: LocationData) => {
  const matchingFeedbackItems: FeedbackItemType[] = [];

  for (const item of feedbackItems) {
    const itemLocation = item?.annotation_data?.location;

    if (!itemLocation) {
      continue;
    }

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
        icon: <Loader size={12} className='mt-0.5' />,
        onCheck: defaultFn,
      };
    case FEEDBACK_STATUS.APPLIED:
      return {
        icon: <Check size={12} className='text-ORANGE_1000 mt-0.5' />,
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

/**
 * Updates button elements in the last message to have is_display = false
 * @param lastMessage - The last message in the chat
 * @param setMessages - Function to update the chat messages
 */
export const updateButtonElementsDisplay = (
  lastMessage: ChatMessage,
  setMessages: (updater: (prevMessages: ChatMessage[]) => ChatMessage[]) => void,
): void => {
  const lastMessageElements = lastMessage?.message_content?.elements || [];

  if (lastMessageElements.length > 0) {
    const updatedElements = lastMessageElements.map((element) => {
      if (element?.type === BlockType.BUTTON && element?.payload?.is_display !== false) {
        return {
          ...element,
          payload: {
            ...element.payload,
            is_display: false,
          },
        };
      }

      return element;
    });

    setMessages((prevMessages) => [
      ...prevMessages.slice(0, -1),
      {
        ...lastMessage,
        message_content: {
          ...lastMessage.message_content,
          elements: updatedElements,
        },
      },
    ]);
  }
};

export const createChatbotUrl = (annotationLocation: LocationData) => {
  let url = `/processes/${annotationLocation?.data?.process_id}/activity-logs/${annotationLocation?.data?.activity_run_id}?chatbot_process_id=${annotationLocation?.data?.process_id}&chatbot_activity_run_id=${annotationLocation?.data?.activity_run_id}`;

  switch (annotationLocation?.type) {
    case LocationType.DATASET_FIELD:
      url += `&chatbot_annotation_location_type=${LocationType.DATASET_FIELD}&chatbot_dataset_id=${annotationLocation?.data?.dataset_id}&chatbot_dataset_row_id=${annotationLocation?.data?.dataset_row_id}&chatbot_dataset_field_id=${annotationLocation?.data?.dataset_field_id}`;
      break;
    case LocationType.LOG:
      url += `&chatbot_annotation_location_type=${LocationType.LOG}&chatbot_log_id=${annotationLocation?.data?.log_id}`;
      break;
    case LocationType.ACTIVITY_RUN:
      url += `&chatbot_annotation_location_type=${LocationType.ACTIVITY_RUN}`;
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

  if (location.type === LocationType.ACTIVITY_RUN) {
    return true;
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
  senderName: string,
  attachments?: MessageAttachmentType[],
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
    sender_name: senderName,
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
 * @param postFormsSignedUploadAck - Optional function to call after successful upload
 * @returns Promise with uploaded file metadata
 */
export const processFileUpload = async (
  file: File,
  getSignedUrl: (params: SignedUrlBodyType) => Promise<{
    upload_url: string;
    file_upload_id: string;
  }>,
  uploadPath: string,
  postFormsSignedUploadAck?: (params: { fileImportId: string }) => Promise<unknown>,
): Promise<UploadedFile> => {
  const fileType = file.type || 'application/octet-stream';
  const organizationId = store.getState()?.user?.user?.orgs?.[0]?.organization_id ?? '';

  // Get signed URL
  const response = await getSignedUrl({
    path: uploadPath,
    payload: {
      file_name: file.name,
      file_type: FileMimeType[fileType] ?? fileType,
      organization_id: organizationId,
    },
  });

  // Upload file to signed URL
  await uploadFileToSignedUrl(response.upload_url, file, fileType);

  // Call postFormsSignedUploadAck after successful upload
  if (postFormsSignedUploadAck) {
    await postFormsSignedUploadAck({ fileImportId: response.file_upload_id });
  }

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
 * @param postFormsSignedUploadAck - Optional function to call after successful upload
 * @returns Promise with array of uploaded file metadata
 */
export const processMultipleFileUploads = async (
  files: FileList,
  getSignedUrl: (params: SignedUrlBodyType) => Promise<SignedUrlResponseType>,
  uploadPath: string,
  postFormsSignedUploadAck?: (params: { fileImportId: string }) => Promise<unknown>,
): Promise<UploadedFile[]> => {
  const uploadPromises: Promise<UploadedFile>[] = [];

  for (let i = 0; i < files.length; i++) {
    uploadPromises.push(processFileUpload(files[i], getSignedUrl, uploadPath, postFormsSignedUploadAck));
  }

  return Promise.all(uploadPromises);
};

/**
 * Wraps RTK Query mutation for getSignedUrl to handle errors
 * @param getSignedUrlMutation - RTK Query mutation function that returns signed URL
 * @returns Wrapped function that throws on error
 */
export const wrapGetSignedUrl = (
  getSignedUrlMutation: (
    params: SignedUrlBodyType,
  ) => Promise<{ data: SignedUrlResponseType; error?: undefined } | { data?: undefined; error: unknown }>,
): ((params: SignedUrlBodyType) => Promise<SignedUrlResponseType>) => {
  return async (params: SignedUrlBodyType) => {
    const result = await getSignedUrlMutation(params);

    if ('error' in result) {
      throw new Error('Failed to get signed URL');
    }

    return result.data;
  };
};

/**
 * Wraps RTK Query mutation for postFormsSignedUploadAck to handle errors
 * @param postFormsSignedUploadAckMutation - RTK Query mutation function
 * @returns Wrapped function that throws on error
 */
export const wrapPostFormsSignedUploadAck = (
  postFormsSignedUploadAckMutation: (params: {
    fileImportId: string;
  }) => Promise<{ data: void; error?: undefined } | { data?: undefined; error: unknown }>,
): ((params: { fileImportId: string }) => Promise<void>) => {
  return async (params: { fileImportId: string }) => {
    const result = await postFormsSignedUploadAckMutation(params);

    if ('error' in result) {
      throw new Error('Failed to acknowledge file upload');
    }

    return result.data;
  };
};

/**
 * Handles file uploads with RTK Query mutation
 * @param files - FileList to upload
 * @param getSignedUrlMutation - RTK Query mutation function that returns signed URL
 * @param uploadPath - API endpoint path for signed URL
 * @param postFormsSignedUploadAck - Optional function to call after successful upload
 * @returns Promise with array of uploaded file metadata
 */
export const handleFileUploadsWithMutation = async (
  files: FileList,
  getSignedUrlMutation: (
    params: SignedUrlBodyType,
  ) => Promise<{ data: SignedUrlResponseType; error?: undefined } | { data?: undefined; error: unknown }>,
  uploadPath: string,
  postFormsSignedUploadAck?: (params: { fileImportId: string }) => Promise<unknown>,
): Promise<UploadedFile[]> => {
  const getSignedUrlWrapper = wrapGetSignedUrl(getSignedUrlMutation);

  return processMultipleFileUploads(files, getSignedUrlWrapper, uploadPath, postFormsSignedUploadAck);
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
  senderName: string,
  attachments?: MessageAttachmentType[],
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
    sender_name: senderName,
  };
};
