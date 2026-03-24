import { ChatMessage } from '../types/chat.types';

/**
 * Generates a unique key for a message, ensuring no duplicates
 * Uses message.id if available, otherwise falls back to timestamp with index
 */
export const getMessageKey = (message: ChatMessage, index: number): string => {
  return `${message.timestamp || message.id || 'msg'}-${index}`;
};
