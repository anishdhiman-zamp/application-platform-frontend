import type { BlockAction, HITLQuestion } from '../../../types/block.types';
import type { HITLEntityType } from '../../../types/chat.types';

export interface HITLQuestionWithEntity extends HITLQuestion {
  entity_id?: string;
  entity_type?: string;
  input_id?: string;
  title?: string;
}

export interface HITLQuestionsBlockProps {
  payload: {
    questions: HITLQuestionWithEntity[];
    action?: BlockAction;
  };
  /** Called after the HITL respond API succeeds */
  onSubmit?: () => void;
  sourceEntityId?: string;
  sourceEntityType?: HITLEntityType;
  /** Conversation ID used when navigating to a task route from the title click */
  conversationId?: string;
  username?: string;
  /** Current llm_model the conversation is running on. */
  llmModel?: string | null;
}
