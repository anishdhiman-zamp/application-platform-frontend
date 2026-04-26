import { BLOCK_TYPE, type ReferenceRef, type ReferencesBlockType } from '../types/block.types';
import { ChatMessage } from '../types/chat.types';

/**
 * Stable React key. Prefers `id` so optimistic and DB-confirmed records share a key
 * and reconcile in place across the merge.
 */
export const getMessageKey = (message: ChatMessage, index: number): string => {
  return `${message.id || message.timestamp || 'msg'}-${index}`;
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

export const getQueuedRefs = (msg: ChatMessage): { mentions: ReferenceRef[]; uploadCount: number } => {
  // Dedupe: queued messages carry the same refs on top-level `references`
  // and inside the optimistic REFERENCES block.
  const all: ReferenceRef[] = [];
  const seen = new Set<string>();
  const keyOf = (ref: ReferenceRef) =>
    `${ref.kind}:${ref.resource_id}:${ref.text_range ? `${ref.text_range[0]}-${ref.text_range[1]}` : ''}`;
  const pushUnique = (refs: ReferenceRef[] | undefined) => {
    for (const ref of refs ?? []) {
      const key = keyOf(ref);
      if (seen.has(key)) continue;
      seen.add(key);
      all.push(ref);
    }
  };
  pushUnique(msg.message_content?.references as ReferenceRef[] | undefined);
  const elements = msg.message_content?.elements ?? [];
  for (const el of elements) {
    if (el.type !== BLOCK_TYPE.REFERENCES) continue;
    pushUnique((el as ReferencesBlockType).payload?.references);
  }

  const mentions: ReferenceRef[] = [];
  let uploadCount = msg.message_content?.file_references?.length ?? 0;
  for (const ref of all) {
    if (ref.text_range) mentions.push(ref);
    else uploadCount += 1;
  }
  return { mentions, uploadCount };
};
