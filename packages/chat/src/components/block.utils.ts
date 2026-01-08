import { captureException } from '@sentry/browser';

import { toast } from '../../../ui/src/components/ui/toast';
import { Block, BLOCK_TYPE } from '../types/block.types';
import { ChatMessage, ChatMessageType, GetConversationByIdResponseType, SenderType } from '../types/chat.types';

/**
 * Extracts initial values from blocks that support initial values
 * Currently supports:
 * - Single select (initial_value)
 *
 * Future support planned for:
 * - Dropdowns (initial_selection)
 * - Checkboxes (initial_checked)
 * - Text inputs (initial_value)
 */
export const extractInitialValues = (blocks: Block[]): Record<string, { label: string; value: string }> => {
  const initialValues: Record<string, { label: string; value: string }> = {};

  blocks.forEach((block) => {
    switch (block.type) {
      case BLOCK_TYPE.SINGLE_SELECT:
        if (block.payload.initial_value) {
          initialValues[block.id] = { label: block.payload.initial_value, value: block.payload.initial_value };
        }
        break;

      default:
        break;
    }
  });

  return initialValues;
};

export const getHistoryFormattedMessages = (conversationHistory: GetConversationByIdResponseType): ChatMessage[] => {
  return conversationHistory.messages.map((message) => ({
    resource_type: conversationHistory.conversation.resource_type,
    resource_id: conversationHistory.conversation.resource_id,
    message_content: message.content,
    message_type: ChatMessageType.TEXT,
    sender_type: message.sender_type as SenderType,
    metadata: {},
    timestamp: message.created_at,
    sender_name: message.sender_name,
    id: message.id,
    conversation_id: message.conversation_id,
  }));
};

/**
 * Downloads a file from a given URL
 * @param downloadUrl - The URL to download the file from
 * @param fileName - The name to save the file as
 */
export const downloadFile = async (downloadUrl: string, fileName: string): Promise<void> => {
  try {
    const response = await fetch(downloadUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    captureException(error);
    toast.error('Failed to download file');
  }
};

/**
 * Formats the thinking duration between two timestamps
 * @param startTimestamp - The start timestamp
 * @param stopTimestamp - The stop timestamp
 * @returns Formatted duration string or null if invalid
 */
export const formatThinkingDuration = (startTimestamp?: string, stopTimestamp?: string): string | null => {
  if (!startTimestamp || !stopTimestamp) return null;

  const startTime = new Date(startTimestamp).getTime();
  const stopTime = new Date(stopTimestamp).getTime();
  const durationMs = stopTime - startTime;

  if (isNaN(durationMs) || durationMs < 0) return null;

  const seconds = Math.round(durationMs / 1000);
  if (seconds < 1) return 'less than 1 sec';
  if (seconds === 1) return '1 sec';
  return `${seconds} sec`;
};

/**
 * Helper function to format JSON string with proper indentation
 * @param jsonString - The JSON string to format
 * @returns Formatted JSON string or original string if parsing fails
 */
export const formatJson = (jsonString: string | undefined): string => {
  if (!jsonString) return '';
  try {
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed, null, 2);
  } catch {
    // If parsing fails, return the original string
    return jsonString;
  }
};
