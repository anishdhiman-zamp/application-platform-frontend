import { BLOCK_TYPE, type ChatMessage, SenderType, type TaskStatus } from '@zamp-platform/chat';

/**
 * Reconciles fresh API history messages with in-memory SSE updates.
 *
 * - API data wins by default.
 * - Task block statuses from `prev` win only when SSE has touched them since the
 *   last fetch (`hasSSEUpdatedStatuses`); otherwise `prev` is treated as stale.
 * - Optimistic user messages in `prev` that haven't appeared in the API response
 *   yet are preserved so a just-sent message doesn't vanish on refetch.
 */
export const mergeHistoryWithSSEStatuses = (
  prev: ChatMessage[],
  historyMessages: ChatMessage[],
  hasSSEUpdatedStatuses: boolean,
): ChatMessage[] => {
  const sseTaskStatuses = new Map<string, TaskStatus>();

  if (hasSSEUpdatedStatuses) {
    for (const msg of prev) {
      for (const el of msg.message_content?.elements ?? []) {
        if (el.type === BLOCK_TYPE.TASK && el.payload?.task_id) {
          sseTaskStatuses.set(el.payload.task_id, el.payload.status as TaskStatus);
        }
      }
    }
  }

  const merged =
    sseTaskStatuses.size > 0
      ? historyMessages.map((msg) => {
          const elements = msg.message_content?.elements;

          if (!elements?.length) return msg;

          let hasUpdate = false;
          const updatedElements = elements.map((el) => {
            if (el.type === BLOCK_TYPE.TASK && el.payload?.task_id) {
              const sseStatus = sseTaskStatuses.get(el.payload.task_id);

              if (sseStatus && sseStatus !== el.payload.status) {
                hasUpdate = true;

                return { ...el, payload: { ...el.payload, status: sseStatus } };
              }
            }

            return el;
          });

          return hasUpdate ? { ...msg, message_content: { ...msg.message_content, elements: updatedElements } } : msg;
        })
      : historyMessages;

  if (prev.length === 0) return merged;

  const dbMessageIds = new Set(merged.map((m) => m.id).filter(Boolean));
  const replayedMessages = prev.filter((m) => {
    if (!m.id || dbMessageIds.has(m.id)) return false;

    return m.sender_type === SenderType.USER;
  });

  return replayedMessages.length > 0 ? [...merged, ...replayedMessages] : merged;
};
