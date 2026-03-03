export enum OnboardingStatus {
  SETUP_PROFILE = 'setup_profile',
  SETUP_USERNAME = 'setup_username',
  UPDATE_ORG = 'update_org',
  PENDING_WAITLIST = 'pending_waitlist',
  WELCOME = 'welcome',
  SETUP_WORKSPACE = 'setup_workspace',
  ONBOARDED = 'onboarded',
}

export enum MediaType {
  SEED = 'seed',
  URL = 'url',
}

export enum UploadType {
  AVATAR = 'avatar',
  ORG_ICON = 'org_icon',
}

export enum ImageContentType {
  PNG = 'image/png',
  JPEG = 'image/jpeg',
}

export type UpdateProfileRequest = {
  full_name?: string | null;
  avatar_type?: MediaType | null;
  avatar_value?: string | null;
  username?: string | null;
};

export type UserModel = {
  user_id: string;
  email: string;
  name: string;
  last_name: string;
  username: string | null;
  avatar_type: MediaType | null;
  avatar_value: string | null;
  onboarding_status: OnboardingStatus;
};

export type SetupOrgRequest = {
  organization_name: string;
  icon_type?: MediaType | null;
  icon_value?: string | null;
};

export type OrganizationModel = {
  organization_id: string;
  name: string;
  slug: string;
  icon_type: MediaType | null;
  icon_value: string | null;
};

export type WelcomeRequest = {
  organization_id?: string | null;
};

export type OnboardingResponse<T> = {
  message: string;
  onboarding_status: OnboardingStatus;
  data: T | null;
};

export type UploadUrlRequest = {
  upload_type: UploadType;
  content_type: ImageContentType;
};

export type UploadUrlResponse = {
  upload_url: string;
  s3_uri: string;
};

export type CheckUsernameResponse = {
  available: boolean;
  username: string;
};

export type AvatarState = {
  type: MediaType;
  value: string;
  previewUrl?: string;
};
