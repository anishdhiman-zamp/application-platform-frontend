import { BLOCK_TYPE, type ChatMessage, SenderType } from '@zamp-platform/chat';
import {
  getLastMarkdownTextFromMessage,
  type ProcessedMessage,
} from '@/modules/pace/components/tasks/utils/tasks.utils';
import type {
  MessageStepGroupsSection,
  ResolvedStepGroup,
  StepGroupData,
} from '@/modules/pace/module/step-groups.types';

/**
 * Resolves backend step_groups data against raw chat messages.
 *
 * Uses `element_ids` to assign individual elements to groups.
 * Works with raw messages (before getProcessedMessages strips the last markdown)
 * so that all elements are available for matching.
 */
export function resolveStepGroups(stepGroups: StepGroupData[], messages: ChatMessage[]): ResolvedStepGroup[] {
  if (stepGroups.length === 0 || messages.length === 0) return [];

  const assistantMessages = messages.filter((m) => m.sender_type === SenderType.ASSISTANT);

  if (assistantMessages.length === 0) return [];

  const resolved: ResolvedStepGroup[] = [];

  for (let i = 0; i < stepGroups.length; i++) {
    const group = stepGroups[i];
    const elementIdSet = new Set(group.element_ids);

    if (elementIdSet.size === 0) continue;

    const groupMessages: ProcessedMessage[] = [];
    let stepCount = 0;

    for (const msg of assistantMessages) {
      const elements = msg.message_content?.elements ?? [];
      const matchingElements = elements.filter((el) => el.id && elementIdSet.has(el.id));

      if (matchingElements.length === 0) continue;

      const filteredMessage = {
        ...msg,
        message_content: { ...msg.message_content, elements: matchingElements },
      };

      groupMessages.push({ message: filteredMessage, summaryText: null });
      stepCount += matchingElements.filter((el) => el.type !== BLOCK_TYPE.TOOL_RESULT).length;
    }

    if (groupMessages.length > 0) {
      resolved.push({
        id: `step-group-${i}`,
        summary: group.summary,
        messages: groupMessages,
        stepCount,
      });
    }
  }

  return resolved;
}

/**
 * Resolves `step_groups` when shaped as `messageId -> StepGroupData[]`.
 * Each section only matches elements on that message. `lastMarkdownText` is the last markdown
 * block on that same assistant message.
 */
export function resolveMessageStepGroupSections(
  stepGroupsByMessageId: Record<string, StepGroupData[]>,
  messages: ChatMessage[],
): MessageStepGroupsSection[] {
  const sections: MessageStepGroupsSection[] = [];

  for (const msg of messages) {
    const id = msg.id;

    if (!id || msg.sender_type !== SenderType.ASSISTANT) continue;

    const lastMarkdownText = getLastMarkdownTextFromMessage(msg);
    const groups = stepGroupsByMessageId[id];

    if (!groups?.length) {
      if (lastMarkdownText) {
        sections.push({ messageId: id, groups: [], lastMarkdownText });
      }
      continue;
    }

    const resolvedGroups: ResolvedStepGroup[] = [];

    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      const elementIdSet = new Set(group.element_ids);

      if (elementIdSet.size === 0) continue;

      const elements = msg.message_content?.elements ?? [];
      const matchingElements = elements.filter((el) => el.id && elementIdSet.has(el.id));

      if (matchingElements.length === 0) continue;

      const filteredMessage: ChatMessage = {
        ...msg,
        message_content: { ...msg.message_content, elements: matchingElements },
      };
      const stepCount = matchingElements.filter((el) => el.type !== BLOCK_TYPE.TOOL_RESULT).length;

      resolvedGroups.push({
        id: `${id}-step-group-${i}`,
        summary: group.summary,
        messages: [{ message: filteredMessage, summaryText: null }],
        stepCount,
      });
    }

    sections.push({ messageId: id, groups: resolvedGroups, lastMarkdownText });
  }

  return sections;
}

/** Legacy flat `step_groups` array → single section (no per-message markdown footer). */
export function stepGroupsLegacyToSections(
  stepGroups: StepGroupData[],
  messages: ChatMessage[],
): MessageStepGroupsSection[] {
  const groups = resolveStepGroups(stepGroups, messages);

  if (groups.length === 0) return [];

  return [{ messageId: '__legacy__', groups, lastMarkdownText: null }];
}
