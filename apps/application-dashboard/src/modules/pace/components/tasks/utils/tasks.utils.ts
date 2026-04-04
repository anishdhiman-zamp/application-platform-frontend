import {
  BLOCK_TYPE,
  type ChatMessage,
  type ConversationInputRequiredItem,
  HITL_INPUT_TYPE,
  HITL_INPUT_TYPE_LEGACY,
  type HITLQuestionWithEntity,
  SenderType,
  type StreamingState,
} from '@zamp-platform/chat';
import { STATUS_DISPLAY } from '@/modules/pace/components/tasks/constants/tasks.constants';

const messageContributesToSteps = (msg: ChatMessage): boolean => {
  if (msg.sender_type === SenderType.ASSISTANT) return true;
  const elements = msg.message_content?.elements ?? [];

  return msg.sender_type === SenderType.USER && elements.some((el) => el.type === BLOCK_TYPE.INPUTS_RESPONDED);
};

export const getStepCount = (messages: ChatMessage[], streamingState: StreamingState | null | undefined): number => {
  const messageCount = messages.filter(messageContributesToSteps).reduce((count, msg) => {
    const elements = msg.message_content?.elements ?? [];

    return count + elements.filter((el) => el.type !== BLOCK_TYPE.TOOL_RESULT).length;
  }, 0);

  const streamingElements = streamingState?.message_content?.elements ?? [];
  const streamingCount = streamingElements.filter((el) => el.type !== BLOCK_TYPE.TOOL_RESULT).length;

  return messageCount + streamingCount;
};

export const getProcessedMessages = (messages: ChatMessage[]) => {
  let lastSummaryText: string | null = null;

  const lastAssistantIndex = (() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].sender_type === SenderType.ASSISTANT) return i;
    }

    return -1;
  })();

  const processedMessages = messages.reduce<Array<{ message: ChatMessage; summaryText: string | null }>>(
    (acc, msg, index) => {
      if (msg.sender_type === SenderType.ASSISTANT) {
        const elements = msg.message_content?.elements ?? [];
        const lastMarkdownIdx = elements.findLastIndex((el) => el.type === BLOCK_TYPE.MARKDOWN);

        if (lastMarkdownIdx === -1) {
          acc.push({ message: msg, summaryText: null });

          return acc;
        }

        const markdownEl = elements[lastMarkdownIdx] as { payload: { text: string } };
        const trimmedElements = elements.filter((_, i) => i !== lastMarkdownIdx);
        const trimmedMsg = { ...msg, message_content: { ...msg.message_content, elements: trimmedElements } };

        if (index === lastAssistantIndex) {
          lastSummaryText = markdownEl.payload.text;
        }

        acc.push({ message: trimmedMsg, summaryText: markdownEl.payload.text });

        return acc;
      }

      if (msg.sender_type === SenderType.USER) {
        const elements = msg.message_content?.elements ?? [];

        if (elements.some((el) => el.type === BLOCK_TYPE.INPUTS_RESPONDED)) {
          acc.push({ message: msg, summaryText: null });
        }
      }

      return acc;
    },
    [],
  );

  return { processedMessages, lastSummaryText };
};

export const getStatusLabel = (isAgentActive: boolean, taskStatus: string | undefined): string => {
  return isAgentActive ? 'In progress' : (STATUS_DISPLAY[taskStatus ?? ''] ?? taskStatus ?? '');
};

export const getDisplayTitle = (urlTitle: string | null, chatTitle: string): string => {
  return urlTitle || chatTitle || 'Untitled';
};

export const mapInputsRequiredToHitlQuestions = (items: ConversationInputRequiredItem[]): HITLQuestionWithEntity[] => {
  const result: HITLQuestionWithEntity[] = [];

  for (const item of items) {
    const data = item.input_required_data;

    if (!data) continue;

    if (data.input_type === HITL_INPUT_TYPE.APPROVAL) {
      result.push({
        id: item.entity_id,
        entity_id: item.entity_id,
        entity_type: item.entity_type,
        question: data.question ?? '',
        options: null,
        input_type: HITL_INPUT_TYPE.APPROVAL,
        is_multi_select: false,
        allow_custom_input: data.allow_custom_input ?? false,
      });
      continue;
    }

    if (data.input_type === HITL_INPUT_TYPE.TEXT) {
      result.push({
        id: item.entity_id,
        entity_id: item.entity_id,
        entity_type: item.entity_type,
        question: data.question ?? '',
        options: null,
        input_type: HITL_INPUT_TYPE.TEXT,
        is_multi_select: false,
        allow_custom_input: false,
      });
      continue;
    }

    if (!data.options?.length) continue;

    result.push({
      id: item.entity_id,
      entity_id: item.entity_id,
      entity_type: item.entity_type,
      question: data.question ?? '',
      options: data.options.map((opt) => ({
        id: opt.id,
        label: opt.label,
        title: opt.title ?? opt.label,
        description: opt.description,
      })),
      input_type:
        data.input_type === HITL_INPUT_TYPE_LEGACY.MULTI_SELECT ? HITL_INPUT_TYPE.MULTIPLE_CHOICE : data.input_type,
      is_multi_select:
        data.input_type === HITL_INPUT_TYPE.MULTIPLE_CHOICE || data.input_type === HITL_INPUT_TYPE_LEGACY.MULTI_SELECT,
      allow_custom_input: data.allow_custom_input ?? false,
    });
  }

  return result;
};
