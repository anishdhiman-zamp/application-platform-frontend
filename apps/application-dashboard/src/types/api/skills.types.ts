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
