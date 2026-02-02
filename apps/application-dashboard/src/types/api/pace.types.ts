export const enum SkillStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled',
  DRAFT = 'draft',
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  status: SkillStatus;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

// Skill API Error Types
export interface SkillApiError {
  type: string;
  code: string;
  message: string;
  details?: {
    skill_name?: string;
    organization_id?: string;
  };
}

/**
 * Update Conversation Title API Types
 */
export interface UpdateConversationTitleRequestType {
  conversationId: string;
  body: {
    resource_id: string;
    resource_type: string;
    title: string;
  };
}

export interface UpdateConversationTitleResponseType {
  success: boolean;
  conversation_id: string;
  title: string;
}
