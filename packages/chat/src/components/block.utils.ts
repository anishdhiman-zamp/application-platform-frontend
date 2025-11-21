import { Block, BlockType } from '../types/block.types';
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
      case BlockType.SINGLE_SELECT:
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
