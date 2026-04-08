import { MEDIA_TYPE, PROVISIONING_STATUS } from 'modules/setup-workspace/setup-workspace.constants';

export type MediaType = (typeof MEDIA_TYPE)[keyof typeof MEDIA_TYPE];
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
    product?: string;
    provisioning_status?: string;
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
