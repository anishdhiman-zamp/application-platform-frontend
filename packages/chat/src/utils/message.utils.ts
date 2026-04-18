import { BLOCK_TYPE } from '../types/block.types';
import { ChatMessage } from '../types/chat.types';

/**
 * Generates a unique key for a message, ensuring no duplicates
 * Uses message.id if available, otherwise falls back to timestamp with index
 */
export const getMessageKey = (message: ChatMessage, index: number): string => {
  return `${message.timestamp || message.id || 'msg'}-${index}`;
};

/**
 * Returns a plain-text preview of a chat message's body.
 *
 * Prefers the top-level `message_content.text` / `message_content.message` fields used by
 * locally-constructed messages. Falls back to scanning `message_content.elements` for the
 * first `PLAIN_TEXT` or `MARKDOWN` block — the shape used by messages deserialized from
 * conversation history, which carry their text inside content blocks rather than at the top level.
 *
 * @returns The message text, or an empty string when no text can be found.
 */
export const getMessagePreview = (msg: ChatMessage): string => {
  const direct = msg.message_content?.text || msg.message_content?.message;
  if (direct) return direct;

  const elements = msg.message_content?.elements;
  if (!elements?.length) return '';

  const textEl = elements.find((el) => el.type === BLOCK_TYPE.PLAIN_TEXT || el.type === BLOCK_TYPE.MARKDOWN);
  return (textEl?.payload as { text?: string } | undefined)?.text ?? '';
};

/**
 * Counts the attachments on a chat message.
 *
 * Prefers the top-level `file_references` / `attachments` fields used by locally-constructed
 * messages. Falls back to summing `file_references` across all `FILE_REFERENCES` blocks in
 * `message_content.elements` — the shape used by messages deserialized from conversation history.
 *
 * @returns The total attachment count, or 0 when none are present.
 */
export const getAttachmentCount = (msg: ChatMessage): number => {
  const fromContent =
    (msg.message_content?.file_references?.length ?? 0) + (msg.message_content?.attachments?.length ?? 0);
  if (fromContent > 0) return fromContent;

  const elements = msg.message_content?.elements;
  if (!elements?.length) return 0;

  return elements
    .filter((el) => el.type === BLOCK_TYPE.FILE_REFERENCES)
    .reduce((sum, el) => sum + ((el.payload as { file_references?: unknown[] }).file_references?.length ?? 0), 0);
};
