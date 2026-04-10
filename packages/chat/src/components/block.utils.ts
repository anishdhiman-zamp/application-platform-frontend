import { captureException } from '@sentry/browser';
import { safeJsonParse } from '@zamp-platform/utils';

import { toast } from '../../../ui/src/components/ui/toast';
import {
  Block,
  BLOCK_TYPE,
  type ToolCallInfo,
  type ToolUseContentBlock,
  type ToolUseDisplayContentParsed,
} from '../types/block.types';
import {
  ChatMessage,
  ChatMessageType,
  GetConversationByIdResponseType,
  MessageState,
  SenderType,
} from '../types/chat.types';

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
  return conversationHistory.messages
    .filter((message) => message.state !== MessageState.STREAMING)
    .map((message) => ({
      resource_type: conversationHistory?.conversation?.resource_type,
      resource_id: conversationHistory?.conversation?.resource_id,
      message_content: message.content,
      message_type: ChatMessageType.TEXT,
      sender_type: message.sender_type as SenderType,
      metadata: {},
      timestamp: message.created_at,
      sender_name: message.sender_name,
      id: message.id,
      conversation_id: message?.conversation_id,
      state: message.state,
    }));
};

/**
 * Returns the ID of the last assistant message if its state is STREAMING, or null.
 * Using the last assistant message avoids false positives from stale STREAMING states
 * on earlier messages and matches the actual in-progress message the server is generating.
 */
export const getStreamingMessageId = (conversationHistory: GetConversationByIdResponseType): string | null => {
  const messages = conversationHistory.messages;
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message.sender_type === SenderType.ASSISTANT) {
      return message.state === MessageState.STREAMING ? message.id : null;
    }
  }
  return null;
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
export const buildIntegrationItemFromToolResult = (
  toolResultData: Record<string, unknown> & { integration_name?: string },
) => ({
  title: '',
  description: '',
  icon: '',
  provider: '',
  connections: [],
  ...toolResultData,
  name: toolResultData?.integration_name,
  auth: [
    {
      auth_type: 'connected_url',
      title: null,
      description: null,
      fields: {},
    },
  ],
});

export const formatJson = (jsonString: string | undefined): string => {
  if (!jsonString) return '';
  try {
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return jsonString;
  }
};

/**
 * Extracts display metadata from a single {@link ToolUseContentBlock}.
 *
 * Resolution order for `displayName` (first truthy wins — empty strings are treated as absent):
 *  1. `payload.display_title`           — set by TOOL_USE_BLOCK_UPDATE_DELTA
 *  2. `display_content.display_title`   — structured display_content JSON
 *  3. `input_json.display_title`        — synthetic param injected by the LLM
 *  4. `partial_json.display_title`      — same, before input_json is finalised
 *  5. `payload.display_name`            — fallback human-readable name
 *  6. `'Unknown'`                       — last-resort sentinel
 *
 * @param toolUseBlock  The block to extract info from.
 * @param fallbackIndex Used to generate a stable synthetic id when `tool_call_id` is absent.
 */
export function extractToolCallInfo(toolUseBlock: ToolUseContentBlock, fallbackIndex: number): ToolCallInfo {
  const displayContent = safeJsonParse<ToolUseDisplayContentParsed>(toolUseBlock?.payload?.display_content?.json_block);
  const parsedInput = safeJsonParse<Record<string, unknown>>(toolUseBlock?.payload?.input_json);
  const parsedPartial = safeJsonParse<Record<string, unknown>>(toolUseBlock?.payload?.partial_json);
  const toolCallId = toolUseBlock?.payload?.tool_call_id ?? toolUseBlock?.id;

  return {
    id: toolCallId ?? `tool-${fallbackIndex}`,
    name: toolUseBlock?.payload?.name ?? displayContent?.tool_name ?? 'Unknown',
    displayName:
      toolUseBlock?.payload?.display_title ||
      displayContent?.display_title ||
      (typeof parsedInput?.display_title === 'string' ? parsedInput.display_title : undefined) ||
      (typeof parsedPartial?.display_title === 'string' ? parsedPartial.display_title : undefined) ||
      toolUseBlock?.payload?.display_name ||
      'Unknown',
    icon: toolUseBlock?.payload?.icon ?? displayContent?.icon,
    isComplete: toolUseBlock?.is_complete !== false,
    block: toolUseBlock,
  };
}
