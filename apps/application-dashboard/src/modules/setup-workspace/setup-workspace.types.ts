export const MEDIA_TYPE = {
  SEED: 'seed',
  URL: 'url',
} as const;

export type MediaType = (typeof MEDIA_TYPE)[keyof typeof MEDIA_TYPE];

export const PROVISIONING_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export type ProvisioningStatus = (typeof PROVISIONING_STATUS)[keyof typeof PROVISIONING_STATUS];

export interface RegisterOrgRequest {
  organization_name: string;
  owner_id: string;
  icon_type?: MediaType | null;
  icon_value?: string | null;
}

export interface RegisterOrgResponse {
  organization: {
    organization_id: string;
    name: string;
    slug: string;
  };
  user_id: string;
}

export interface OrgProvisioningStatusResponse {
  provisioning_status: ProvisioningStatus;
  started_at: string | null;
  expected_completion_seconds: number | null;
  is_completed: boolean;
}

export interface EnsureOrgProvisioningResponse {
  started_new: boolean;
  status: OrgProvisioningStatusResponse;
}
