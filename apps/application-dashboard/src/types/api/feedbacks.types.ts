import { AnnotationData } from '@zamp-platform/chat';
import { FEEDBACK_STATUS, SCOPE_TYPE } from '@/modules/feedback/feedback.constants';

export interface FeedbackSummary {
  feedback_points: string[];
}

export interface FeedbackItemType {
  id: string;
  organization_id: string;
  process_id: string;
  conversation_id: string;
  feedback_id: string;
  status: FEEDBACK_STATUS;
  title: string;
  summary: FeedbackSummary;
  created_at: string;
  updated_at: string;
  scope_type: SCOPE_TYPE;
  scope_id: string;
  resource_type?: string;
  resource_id?: string;
  annotation_data: AnnotationData;
  initiated_by: string;
}

export interface FeedbacksResponseType {
  feedbacks: FeedbackItemType[];
}

export interface ArchiveFeedbackPayloadType {
  process_id: string;
  feedback_ids: string[];
}

export interface DeleteConversationFeedbackPayloadType {
  conversationId: string;
  resourceType: string;
  resourceId: string;
}

export interface StopProcessingFeedbackPayloadType {
  process_id: string;
}

export interface OpenFeedbackResponseType {
  conversations: FeedbackItemType[];
  total_pages: number;
  count: number;
}

// Update Conversation Title Types
export interface UpdateConversationTitleRequest {
  conversationId: string;
  body: {
    resource_id: string;
    resource_type: string;
    title: string;
  };
}

export interface UpdateConversationTitleResponse {
  success: boolean;
  conversation_id: string;
  title: string;
}
