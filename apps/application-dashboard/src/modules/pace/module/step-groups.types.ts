import type { ConversationSummaryStepGroup } from '@zamp-platform/chat';
import { ProcessedMessage } from 'modules/pace/components/tasks/utils/tasks.utils';

/** Matches one row in API `step_groups` (flat or per-message). */
export type StepGroupData = ConversationSummaryStepGroup;

/** Enriched group with resolved processedMessages ready for rendering. */
export interface ResolvedStepGroup {
  id: string;
  summary: string;
  messages: ProcessedMessage[];
  stepCount: number;
}

/** One assistant message worth of step groups plus that message’s trailing markdown. */
export interface MessageStepGroupsSection {
  messageId: string;
  groups: ResolvedStepGroup[];
  lastMarkdownText: string | null;
}
