export enum TestStatus {
  Idle = 'idle',
  Testing = 'testing',
  Success = 'success',
  Error = 'error',
}

export const ROLE_LABEL_MAP: Record<string, string> = {
  system_admin: 'System Administrator',
  member: 'Member',
};

import type { SecurityProviderType } from '@/modules/organisation-settings/types/organisation-settings.types';

export const ORG_DETAILS_LABELS = {
  organisationId: { label: 'Organisation ID', value: '' },
  members: { label: 'Members', value: '' },
  yourRole: { label: 'Your role', value: '' },
};

type OrgDetailsRowsParams = {
  orgId: string;
  copied: boolean;
  handleCopy: () => void;
  memberCountLabel: string;
  role: string;
  onManageMembers: () => void;
};

type OrgDetailsRow = {
  key: string;
  label: string;
  value: string;
  action?: { text: string; onClick: () => void; className?: string };
};

export const ORG_DETAILS_ROWS = ({
  orgId,
  copied,
  handleCopy,
  memberCountLabel,
  role,
  onManageMembers,
}: OrgDetailsRowsParams): OrgDetailsRow[] => [
  {
    key: 'organisationId',
    label: ORG_DETAILS_LABELS.organisationId.label,
    value: orgId,
    action: { text: copied ? 'Copied!' : 'Copy', onClick: handleCopy, className: 'w-16' },
  },
  {
    key: 'members',
    label: ORG_DETAILS_LABELS.members.label,
    value: memberCountLabel,
    action: { text: 'Manage', onClick: onManageMembers },
  },
  {
    key: 'yourRole',
    label: ORG_DETAILS_LABELS.yourRole.label,
    value: role,
    action: undefined,
  },
];

export const DANGER_ZONE_ROWS = [
  {
    key: 'leaveWorkspace',
    label: 'Leave workspace',
    value:
      "Remove your account from this workspace. You'll lose access to the organisation and all of its content, including your own pages.",
    actionText: 'Leave account',
  },
  {
    key: 'deleteWorkspace',
    label: 'Delete workspace',
    value: 'Permanently delete this workspace, including all pages and files.',
    actionText: 'Delete workspace',
  },
];

export const SECURITY_PROVIDERS: SecurityProviderType[] = [
  { id: 'okta', label: 'Okta', icon: '/icons/okta.svg' },
  { id: 'microsoft', label: 'Microsoft Entra ID', icon: '/icons/microsoft.svg' },
  { id: 'google', label: 'Google Workspace', icon: '/icons/google.svg' },
];

export interface SecurityProviderStepType {
  step: number;
  description: string;
}

export const SECURITY_PROVIDER_STEPS: Record<string, SecurityProviderStepType[]> = {
  okta: [
    { step: 1, description: 'In a new tab, sign into your Okta Admin Console' },
    { step: 2, description: 'Navigate to Applications → Applications and click Create App Integration' },
    { step: 3, description: 'Select SAML 2.0 as the sign-in method and click Next' },
    { step: 4, description: 'Enter an app name and configure the SAML settings with the details provided' },
    { step: 5, description: 'Assign the application to the relevant users or groups in your organisation' },
  ],
  microsoft: [
    { step: 1, description: 'In a new tab, sign into Microsoft Entra ID 7' },
    { step: 2, description: 'From the dashboard menu, go to Applications → Enterprise applications' },
    { step: 3, description: 'Click New application, then Create your own application' },
    {
      step: 4,
      description:
        "Enter app name as desired and select Integrate any other application your don't find in the gallery (Non-gallery)",
    },
    { step: 5, description: 'Switch to the Properties tab and toggle off Visible to users' },
  ],
  google: [
    { step: 1, description: 'In a new tab, sign into your Google Admin Console at admin.google.com' },
    { step: 2, description: 'Navigate to Apps → Web and mobile apps and click Add App → Add custom SAML app' },
    { step: 3, description: 'Enter an app name and download the IdP metadata for use in the next steps' },
    { step: 4, description: 'Configure the Service Provider details using the ACS URL and Entity ID provided' },
    { step: 5, description: 'Map the required user attributes and enable the app for your organisation' },
  ],
};
