import { Block, SenderType } from '@zamp-platform/chat';

export interface DependentElementInteraction {
  element_id: string;
  payload: {
    selected_option_id: string;
  };
}

export interface MessageInteractionPayload {
  is_clicked?: boolean;
  dependent_elements_interactions?: DependentElementInteraction[];
}

export interface PostInteractionPayloadType {
  conversationId: string;
  messageId: string;
  params: {
    resource_id: string;
    resource_type: string;
  };
  body: {
    interactions: Interaction[];
  };
}

export interface Interaction {
  element_id: string;
  payload: MessageInteractionPayload;
}

export interface PostInteractionResponseType {
  success: boolean;
  message_id: string;
  conversation_id: string;
  status_message: string;
  message: {
    id: string;
    organization_id: string;
    conversation_id: string;
    sender_id: string;
    sender_type: SenderType;
    sender_name: string;
    intent: string;
    content: {
      elements: Block[];
    };
    created_at: string;
  };
}
