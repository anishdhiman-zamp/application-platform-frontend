export const enum OnboardingStatus {
  PENDING_APPROVAL = 'pending_approval',
  SETUP_PROFILE = 'setup_profile',
  SETUP_USERNAME = 'setup_username',
  SETUP_ORG = 'setup_org',

  SETUP_WORKSPACE = 'setup_workspace',
  ONBOARDED = 'onboarded',
}

export const enum ProvisioningStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export const enum MediaType {
  SEED = 'seed',
  URL = 'url',
}

export const enum UploadType {
  AVATAR = 'user_avatar',
  ORG_ICON = 'org_icon',
}

export const enum ImageContentType {
  PNG = 'image/png',
  JPEG = 'image/jpeg',
}

export type UpdateProfileRequest = {
  full_name?: string | null;
  avatar_type?: MediaType | null;
  avatar_value?: string | null;
  username?: string | null;
};

export type SetupOrgRequest = {
  organization_name: string;
  organization_description?: string | null;
  icon_type?: MediaType | null;
  icon_value?: string | null;
};

export type EnsureProvisioningRequest = {
  organization_id: string;
};

export type OnboardingResponse = {
  onboarding_status: OnboardingStatus;
};

export type SetupOrgResponse = {
  onboarding_status: OnboardingStatus;
  organization_id: string;
};

export type ApprovalCheckResponse = {
  onboarding_status: OnboardingStatus;
  is_approved: boolean;
  reason: string | null;
};

export type ProvisioningStatusDetail = {
  provisioning_status: ProvisioningStatus;
  started_at: string | null;
  expected_completion_seconds: number | null;
  is_completed: boolean;
};

export type EnsureProvisioningResponse = {
  onboarding_status: OnboardingStatus;
  organization_id: string;
  started_new: boolean;
  status: ProvisioningStatusDetail;
};

export type UploadUrlRequest = {
  upload_type: UploadType;
  content_type: ImageContentType;
  seed_hint?: string;
};

export type UploadUrlResponse = {
  upload_url: string | null;
  asset_value: string;
  media_type: MediaType;
};

export type CheckUsernameResponse = {
  available: boolean;
  username: string;
};

// POST /organizations/register
export type RegisterOrgRequest = {
  organization_name: string;
  owner_id: string;
  icon_type?: MediaType | null;
  icon_value?: string | null;
};

export type RegisterOrgResponse = {
  organization: {
    organization_id: string;
    name: string;
    slug: string;
  };
  user_id: string;
};

// POST /organizations/{organization_id}/provision
export type OrgProvisioningStatusResponse = {
  provisioning_status: ProvisioningStatus;
  started_at: string | null;
  expected_completion_seconds: number | null;
  is_completed: boolean;
};

export type AvatarState = {
  type: MediaType;
  value: string;
  previewUrl?: string;
};

export type OnboardingStepCallbacks = {
  onComplete: (status: OnboardingStatus, organizationId?: string) => void;
  onWrongStep: () => void;
  onFlagDisabled: () => void;
};
