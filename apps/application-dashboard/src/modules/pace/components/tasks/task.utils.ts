import { BLOCK_TYPE, type ChatMessage, SenderType, type StreamingState } from '@zamp-platform/chat';
import { STATUS_DISPLAY } from 'modules/pace/components/tasks/task-listing.constants';

export function getStepCount(messages: ChatMessage[], streamingState: StreamingState | null | undefined): number {
  const messageCount = messages
    .filter((m) => m.sender_type === SenderType.ASSISTANT)
    .reduce((count, msg) => {
      const elements = msg.message_content?.elements ?? [];

      return count + elements.filter((el) => el.type !== BLOCK_TYPE.TOOL_RESULT).length;
    }, 0);

  const streamingElements = streamingState?.message_content?.elements ?? [];
  const streamingCount = streamingElements.filter((el) => el.type !== BLOCK_TYPE.TOOL_RESULT).length;

  return messageCount + streamingCount;
}

export function getProcessedMessages(messages: ChatMessage[]) {
  const assistantMessages = messages.filter((m) => m.sender_type === SenderType.ASSISTANT);

  return assistantMessages.map((msg) => {
    const elements = msg.message_content?.elements ?? [];
    const lastMarkdownIdx = elements.findLastIndex((el) => el.type === BLOCK_TYPE.MARKDOWN);

    if (lastMarkdownIdx === -1) {
      return { message: msg, summaryText: null };
    }

    const markdownEl = elements[lastMarkdownIdx] as { payload: { text: string } };
    const trimmedElements = elements.filter((_, i) => i !== lastMarkdownIdx);
    const trimmedMsg = { ...msg, message_content: { ...msg.message_content, elements: trimmedElements } };

    return { message: trimmedMsg, summaryText: markdownEl.payload.text };
  });
}

export function getStatusLabel(isAgentActive: boolean, taskStatus: string | undefined): string {
  return isAgentActive ? 'In progress' : (STATUS_DISPLAY[taskStatus ?? ''] ?? taskStatus ?? '');
}

export function getDisplayTitle(urlTitle: string | null, chatTitle: string): string {
  return urlTitle || chatTitle || 'Untitled';
}
